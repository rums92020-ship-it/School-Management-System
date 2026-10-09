CREATE TABLE IF NOT EXISTS students (
    student_id VARCHAR(40) PRIMARY KEY,
    name_english VARCHAR(70),
    name_khmer VARCHAR(70),
    gender VARCHAR(30) NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    major VARCHAR(150),
    study_shift VARCHAR(100),
    student_group VARCHAR(50),
    grade VARCHAR(5),
    date_of_birth DATE,
    place_of_birth VARCHAR(100),
    personal_number VARCHAR(40) UNIQUE,
    parent_number VARCHAR(24),
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (name_english IS NOT NULL OR name_khmer IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS students_name_english_idx ON students (name_english);
CREATE INDEX IF NOT EXISTS students_class_name_idx ON students (class_name);

CREATE TABLE IF NOT EXISTS teachers (
    teacher_id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(140) NOT NULL,
    subject VARCHAR(120) NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    phone VARCHAR(24),
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS study_levels (
    name VARCHAR(80) PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO study_levels (name) VALUES
    ('VC'),
    ('បច្ចេកទេស និងវិជ្ជាជីវៈ១'),
    ('បច្ចេកទេស និងវិជ្ជាជីវៈ២'),
    ('បច្ចេកទេស និងវិជ្ជាជីវៈ៣'),
    ('ជាន់ខ្ពស់បច្ចេកទេស'),
    ('បរិញ្ញាបត្របច្ចេកទេស')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS attendance_records (
    attendance_date DATE NOT NULL,
    student_id VARCHAR(40) NOT NULL REFERENCES students (student_id) ON DELETE CASCADE,
    status VARCHAR(10) NOT NULL CHECK (status IN ('Present', 'Absent', 'Late')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (attendance_date, student_id)
);

CREATE INDEX IF NOT EXISTS attendance_date_idx ON attendance_records (attendance_date);
