BEGIN;

CREATE TABLE IF NOT EXISTS public.terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year VARCHAR(30) NOT NULL,
    term_no SMALLINT NOT NULL CHECK (term_no BETWEEN 1 AND 20),
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (academic_year, term_no),
    CHECK (end_date > start_date)
);

CREATE UNIQUE INDEX IF NOT EXISTS terms_only_one_current_idx
    ON public.terms (is_current)
    WHERE is_current = TRUE;

CREATE TABLE IF NOT EXISTS public.shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(40) NOT NULL UNIQUE,
    name_en VARCHAR(100) NOT NULL,
    name_km VARCHAR(100) NOT NULL,
    days_of_week SMALLINT[] NOT NULL CHECK (
        cardinality(days_of_week) BETWEEN 1 AND 7
        AND days_of_week <@ ARRAY[1, 2, 3, 4, 5, 6, 7]::SMALLINT[]
    ),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS public.shift_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
    period_no SMALLINT NOT NULL CHECK (period_no BETWEEN 1 AND 5),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    UNIQUE (shift_id, period_no),
    CHECK (end_time - start_time = INTERVAL '90 minutes')
);

CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    study_level VARCHAR(80),
    academic_year VARCHAR(30) NOT NULL,
    shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE RESTRICT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (name, academic_year)
);

-- Keep legacy class_name values unchanged; they do not determine the correct year or shift.
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    code VARCHAR(30)
);

ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS public.class_teachers (
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    teacher_id VARCHAR(40) NOT NULL REFERENCES public.teachers(teacher_id) ON DELETE RESTRICT,
    PRIMARY KEY (class_id, teacher_id)
);

CREATE TABLE IF NOT EXISTS public.class_students (
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id VARCHAR(40) NOT NULL REFERENCES public.students(student_id) ON DELETE CASCADE,
    PRIMARY KEY (class_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    holiday_date DATE NOT NULL,
    name VARCHAR(120) NOT NULL,
    academic_year VARCHAR(30),
    UNIQUE (holiday_date, academic_year)
);

CREATE TABLE IF NOT EXISTS public.timetable_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term_id UUID NOT NULL REFERENCES public.terms(id) ON DELETE RESTRICT,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
    teacher_id VARCHAR(40) NOT NULL REFERENCES public.teachers(teacher_id) ON DELETE RESTRICT,
    room VARCHAR(100),
    valid_from DATE NOT NULL,
    valid_to DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CHECK (end_time - start_time = INTERVAL '90 minutes'),
    CHECK (valid_to IS NULL OR valid_to >= valid_from)
);

CREATE UNIQUE INDEX IF NOT EXISTS timetable_slots_active_start_idx
    ON public.timetable_slots (term_id, class_id, day_of_week, start_time)
    WHERE is_active = TRUE;

CREATE TABLE IF NOT EXISTS public.class_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id UUID REFERENCES public.timetable_slots(id) ON DELETE CASCADE,
    term_id UUID NOT NULL REFERENCES public.terms(id) ON DELETE RESTRICT,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    teacher_id VARCHAR(40) REFERENCES public.teachers(teacher_id) ON DELETE SET NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled'
        CHECK (status IN ('scheduled', 'completed', 'cancelled', 'closed')),
    UNIQUE (slot_id, session_date),
    CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS public.session_attendance (
    session_id UUID NOT NULL REFERENCES public.class_sessions(id) ON DELETE CASCADE,
    student_id VARCHAR(40) NOT NULL REFERENCES public.students(student_id) ON DELETE CASCADE,
    status VARCHAR(10) NOT NULL
        CHECK (status IN ('present', 'absent', 'late', 'excused')),
    source VARCHAR(10) NOT NULL DEFAULT 'manual'
        CHECK (source IN ('manual', 'qr', 'auto')),
    scanned_at TIMESTAMPTZ,
    recorded_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (session_id, student_id)
);

ALTER TABLE public.students ADD COLUMN IF NOT EXISTS qr_token TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS students_qr_token_idx
    ON public.students (qr_token)
    WHERE qr_token IS NOT NULL;

INSERT INTO public.shifts
    (code, name_en, name_km, days_of_week, start_time, end_time)
VALUES
    ('weekday_full', 'Weekday full', 'ពេញម៉ោងថ្ងៃធ្វើការ', ARRAY[1,2,3,4,5]::SMALLINT[], TIME '07:30', TIME '17:00'),
    ('weekday_morning', 'Weekday morning', 'ពេលព្រឹកថ្ងៃធ្វើការ', ARRAY[1,2,3,4,5]::SMALLINT[], TIME '07:30', TIME '12:00'),
    ('weekday_afternoon', 'Weekday afternoon', 'ពេលរសៀលថ្ងៃធ្វើការ', ARRAY[1,2,3,4,5]::SMALLINT[], TIME '14:00', TIME '17:00'),
    ('weekday_evening', 'Weekday evening', 'ពេលល្ងាចថ្ងៃធ្វើការ', ARRAY[1,2,3,4,5]::SMALLINT[], TIME '17:30', TIME '20:30'),
    ('weekend_full', 'Weekend full', 'ពេញម៉ោងចុងសប្តាហ៍', ARRAY[6,7]::SMALLINT[], TIME '07:30', TIME '17:00')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.shift_periods (shift_id, period_no, start_time, end_time)
SELECT shifts.id, periods.period_no,
    CASE
        WHEN shifts.code = 'weekday_afternoon' AND periods.period_no = 1 THEN TIME '14:00'
        WHEN shifts.code = 'weekday_afternoon' AND periods.period_no = 2 THEN TIME '15:30'
        WHEN shifts.code = 'weekday_evening' AND periods.period_no = 1 THEN TIME '17:30'
        WHEN shifts.code = 'weekday_evening' AND periods.period_no = 2 THEN TIME '19:00'
        ELSE periods.start_time
    END,
    CASE
        WHEN shifts.code = 'weekday_afternoon' AND periods.period_no = 1 THEN TIME '15:30'
        WHEN shifts.code = 'weekday_afternoon' AND periods.period_no = 2 THEN TIME '17:00'
        WHEN shifts.code = 'weekday_evening' AND periods.period_no = 1 THEN TIME '19:00'
        WHEN shifts.code = 'weekday_evening' AND periods.period_no = 2 THEN TIME '20:30'
        ELSE periods.end_time
    END
FROM public.shifts
CROSS JOIN LATERAL (
    SELECT period_numbers.period_no, base_periods.start_time, base_periods.end_time
    FROM generate_series(
        1,
        CASE
            WHEN shifts.code IN ('weekday_full', 'weekend_full') THEN 5
            WHEN shifts.code = 'weekday_morning' THEN 3
            ELSE 2
        END
    ) AS period_numbers(period_no)
    JOIN (VALUES
        (1, TIME '07:30', TIME '09:00'),
        (2, TIME '09:00', TIME '10:30'),
        (3, TIME '10:30', TIME '12:00'),
        (4, TIME '14:00', TIME '15:30'),
        (5, TIME '15:30', TIME '17:00')
    ) AS base_periods(period_no, start_time, end_time)
      ON base_periods.period_no = period_numbers.period_no
) AS periods
ON CONFLICT (shift_id, period_no) DO NOTHING;

CREATE INDEX IF NOT EXISTS classes_shift_idx ON public.classes (shift_id);
CREATE INDEX IF NOT EXISTS class_teachers_teacher_idx ON public.class_teachers (teacher_id);
CREATE INDEX IF NOT EXISTS class_students_student_idx ON public.class_students (student_id);
CREATE INDEX IF NOT EXISTS timetable_slots_term_class_idx ON public.timetable_slots (term_id, class_id);
CREATE INDEX IF NOT EXISTS timetable_slots_teacher_idx ON public.timetable_slots (teacher_id);
CREATE INDEX IF NOT EXISTS class_sessions_date_idx ON public.class_sessions (session_date);
CREATE INDEX IF NOT EXISTS class_sessions_term_idx ON public.class_sessions (term_id);
CREATE INDEX IF NOT EXISTS session_attendance_student_idx ON public.session_attendance (student_id);

ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_attendance ENABLE ROW LEVEL SECURITY;

COMMIT;
