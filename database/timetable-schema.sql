BEGIN;

CREATE TABLE IF NOT EXISTS public.terms (
    id BIGSERIAL PRIMARY KEY,
    academic_year VARCHAR(30) NOT NULL,
    term_no INTEGER NOT NULL CHECK (term_no BETWEEN 1 AND 20),
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
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.shift_periods (
    id BIGSERIAL PRIMARY KEY,
    shift_id BIGINT NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
    weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 1 AND 7),
    period_no SMALLINT NOT NULL CHECK (period_no BETWEEN 1 AND 5),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    UNIQUE (shift_id, weekday, period_no),
    CHECK (end_time - start_time = INTERVAL '90 minutes')
);

CREATE TABLE IF NOT EXISTS public.classes (
    class_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    study_level VARCHAR(80),
    academic_year VARCHAR(30) NOT NULL,
    shift_id BIGINT NOT NULL REFERENCES public.shifts(id) ON DELETE RESTRICT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (name, academic_year)
);

CREATE TABLE IF NOT EXISTS public.subjects (
    subject_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    department VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (name, department)
);

CREATE TABLE IF NOT EXISTS public.class_teachers (
    class_id BIGINT NOT NULL REFERENCES public.classes(class_id) ON DELETE CASCADE,
    teacher_id VARCHAR(40) NOT NULL REFERENCES public.teachers(teacher_id) ON DELETE RESTRICT,
    PRIMARY KEY (class_id, teacher_id)
);

CREATE TABLE IF NOT EXISTS public.class_students (
    class_id BIGINT NOT NULL REFERENCES public.classes(class_id) ON DELETE CASCADE,
    student_id VARCHAR(40) NOT NULL REFERENCES public.students(student_id) ON DELETE CASCADE,
    PRIMARY KEY (class_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.holidays (
    holiday_date DATE NOT NULL,
    name VARCHAR(120) NOT NULL,
    academic_year VARCHAR(30),
    UNIQUE (holiday_date, academic_year)
);

CREATE TABLE IF NOT EXISTS public.timetable_slots (
    slot_id BIGSERIAL PRIMARY KEY,
    term_id BIGINT NOT NULL REFERENCES public.terms(id) ON DELETE RESTRICT,
    class_id BIGINT NOT NULL REFERENCES public.classes(class_id) ON DELETE RESTRICT,
    weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 1 AND 7),
    period_no SMALLINT NOT NULL CHECK (period_no BETWEEN 1 AND 5),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject_id BIGINT NOT NULL REFERENCES public.subjects(subject_id) ON DELETE RESTRICT,
    teacher_id VARCHAR(40) NOT NULL REFERENCES public.teachers(teacher_id) ON DELETE RESTRICT,
    room VARCHAR(100),
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    UNIQUE (term_id, class_id, weekday, period_no),
    UNIQUE (slot_id, term_id, class_id),
    CHECK (end_time - start_time = INTERVAL '90 minutes'),
    CHECK (valid_to >= valid_from)
);

CREATE TABLE IF NOT EXISTS public.class_sessions (
    session_id BIGSERIAL PRIMARY KEY,
    slot_id BIGINT NOT NULL,
    term_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    session_date DATE NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    UNIQUE (slot_id, session_date),
    FOREIGN KEY (slot_id, term_id, class_id)
        REFERENCES public.timetable_slots(slot_id, term_id, class_id)
        ON DELETE CASCADE,
    CHECK (ends_at > starts_at),
    CHECK (ends_at - starts_at = INTERVAL '90 minutes')
);

CREATE TABLE IF NOT EXISTS public.session_attendance (
    session_id BIGINT NOT NULL
        REFERENCES public.class_sessions(session_id) ON DELETE CASCADE,
    student_id VARCHAR(40) NOT NULL
        REFERENCES public.students(student_id) ON DELETE CASCADE,
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

INSERT INTO public.shifts (code, name) VALUES
    ('weekday_full', 'Weekday full'),
    ('weekday_morning', 'Weekday morning'),
    ('weekday_afternoon', 'Weekday afternoon'),
    ('weekday_evening', 'Weekday evening'),
    ('weekend_full', 'Weekend full')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO public.shift_periods
    (shift_id, weekday, period_no, start_time, end_time)
SELECT
    shifts.id,
    weekdays.weekday,
    period_numbers.period_no,
    CASE
        WHEN shifts.code = 'weekday_afternoon' AND period_numbers.period_no = 1
            THEN TIME '14:00'
        WHEN shifts.code = 'weekday_afternoon' AND period_numbers.period_no = 2
            THEN TIME '15:30'
        WHEN shifts.code = 'weekday_evening' AND period_numbers.period_no = 1
            THEN TIME '17:30'
        WHEN shifts.code = 'weekday_evening' AND period_numbers.period_no = 2
            THEN TIME '19:00'
        ELSE periods.start_time
    END,
    CASE
        WHEN shifts.code = 'weekday_afternoon' AND period_numbers.period_no = 1
            THEN TIME '15:30'
        WHEN shifts.code = 'weekday_afternoon' AND period_numbers.period_no = 2
            THEN TIME '17:00'
        WHEN shifts.code = 'weekday_evening' AND period_numbers.period_no = 1
            THEN TIME '19:00'
        WHEN shifts.code = 'weekday_evening' AND period_numbers.period_no = 2
            THEN TIME '20:30'
        ELSE periods.end_time
    END
FROM public.shifts
CROSS JOIN LATERAL unnest(
    CASE
        WHEN shifts.code = 'weekend_full' THEN ARRAY[6, 7]::SMALLINT[]
        ELSE ARRAY[1, 2, 3, 4, 5]::SMALLINT[]
    END
) AS weekdays(weekday)
CROSS JOIN LATERAL generate_series(
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
) AS periods(period_no, start_time, end_time)
    ON periods.period_no = period_numbers.period_no
ON CONFLICT (shift_id, weekday, period_no)
DO UPDATE SET
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time;

CREATE INDEX IF NOT EXISTS classes_shift_idx
    ON public.classes (shift_id);

CREATE INDEX IF NOT EXISTS timetable_slots_term_class_idx
    ON public.timetable_slots (term_id, class_id);

CREATE INDEX IF NOT EXISTS timetable_slots_teacher_idx
    ON public.timetable_slots (teacher_id);

CREATE INDEX IF NOT EXISTS class_sessions_date_idx
    ON public.class_sessions (session_date);

CREATE INDEX IF NOT EXISTS class_sessions_term_idx
    ON public.class_sessions (term_id);

CREATE INDEX IF NOT EXISTS session_attendance_student_idx
    ON public.session_attendance (student_id);

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
