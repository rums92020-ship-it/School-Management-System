
    const groups = [
      { name: "Dashboard", icon: "▦", items: ["Overview", "Attendance Statistics", "Recent Activities"] },
      { name: "Students", icon: "♙", items: ["Student List", "Add Students", "Student Enrollment", "Import from Excel", "Student Documents"] },
      { name: "Teachers", icon: "♧", items: ["Teacher List", "Assign Subject", "Teacher Schedule"] },
      { name: "Classes", icon: "▤", items: ["Classes", "Study Levels", "Sections", "Student Assignment"] },
      { name: "Academics", icon: "▱", items: ["Subject List", "Class Timetable", "My Timetable", "Terms & Shifts", "Exam Schedule", "Student Results"] },
      { name: "Attendance", icon: "◷", items: ["Session Attendance", "My Attendance", "Take Attendance", "QR Attendance", "Daily Attendance", "Monthly Attendance", "Attendance Reports"] },
      { name: "Finance", icon: "$", items: ["School Fees", "Student Payments", "Invoices", "Expenses", "Financial Reports"] },
      { name: "Community", icon: "♧", items: ["Parent List", "Announcements", "Messages", "School Events", "Guardian Notifications"] },
      { name: "Library", icon: "▣", items: ["Books", "Borrow Books", "Return Books", "Library Reports"] },
      { name: "Reports & settings", icon: "⚙", items: ["Student Reports", "Academic Reports", "User Management", "School Information"] },
      { name: "Telegram Integration", icon: "➤", items: ["Bot Settings", "Notification Rules", "Parent Chat Links", "Message Log", "Room QR Cards", "Needs Review"] },
      { name: "Account", icon: "♙", items: ["My Account"] }
    ];
    const rolePages = {
      director: ["Overview", "Attendance Statistics", "Recent Activities", "Student List", "Add Students", "Student Enrollment", "Import from Excel", "Student Documents", "Teacher List", "Assign Subject", "Teacher Schedule", "Classes", "Study Levels", "Sections", "Student Assignment", "Subject List", "Class Timetable", "Exam Schedule", "Student Results", "Take Attendance", "QR Attendance", "Daily Attendance", "Monthly Attendance", "Attendance Reports", "School Fees", "Student Payments", "Invoices", "Expenses", "Financial Reports", "Parent List", "Announcements", "Messages", "School Events", "Books", "Borrow Books", "Return Books", "Library Reports", "Student Reports", "Academic Reports", "User Management", "School Information", "Bot Settings", "Notification Rules", "Parent Chat Links", "Message Log", "My Account"],
      deputy_director: ["Overview", "Attendance Statistics", "Recent Activities", "Student List", "Add Students", "Student Enrollment", "Import from Excel", "Student Documents", "Teacher List", "Assign Subject", "Teacher Schedule", "Classes", "Study Levels", "Sections", "Student Assignment", "Subject List", "Class Timetable", "Exam Schedule", "Student Results", "Take Attendance", "QR Attendance", "Daily Attendance", "Monthly Attendance", "Attendance Reports", "School Fees", "Student Payments", "Invoices", "Expenses", "Financial Reports", "Parent List", "Announcements", "Messages", "School Events", "Books", "Borrow Books", "Return Books", "Library Reports", "Student Reports", "Academic Reports", "User Management", "School Information", "Bot Settings", "Notification Rules", "Parent Chat Links", "Message Log", "My Account"],
      office_head: ["Overview", "Student List", "Add Students", "Student Enrollment", "Import from Excel", "Teacher List", "Study Levels", "Daily Attendance", "Monthly Attendance", "Attendance Reports", "My Account"],
      office_deputy: ["Overview", "Student List", "Add Students", "Student Enrollment", "Import from Excel", "Teacher List", "Study Levels", "Daily Attendance", "Monthly Attendance", "Attendance Reports", "My Account"],
      office_staff: ["Overview", "Student List", "Add Students", "Student Enrollment", "Import from Excel", "Teacher List", "Daily Attendance", "Monthly Attendance", "Attendance Reports", "My Account"],
      dept_head: ["Overview", "Student List", "Teacher List", "Take Attendance", "Daily Attendance", "Monthly Attendance", "Attendance Reports", "My Account"],
      dept_deputy: ["Overview", "Student List", "Teacher List", "Take Attendance", "Daily Attendance", "Monthly Attendance", "Attendance Reports", "My Account"],
      teacher: ["Overview", "Student List", "Take Attendance", "Daily Attendance", "Student Results", "My Account"],
      student: ["Overview", "Student List", "Monthly Attendance", "Student Results", "My Account"],
      guardian: ["Overview", "Student List", "Monthly Attendance", "Student Results", "My Account"]
    };
    const additionalRolePages = {
      director: ["My Timetable", "Terms & Shifts", "Session Attendance", "My Attendance"],
      deputy_director: ["My Timetable", "Terms & Shifts", "Session Attendance", "My Attendance"],
      office_head: ["Classes", "Class Timetable", "Terms & Shifts", "Attendance Reports", "Session Attendance"],
      office_deputy: ["Classes", "Class Timetable", "Terms & Shifts", "Attendance Reports", "Session Attendance"],
      office_staff: ["Classes", "Class Timetable", "Terms & Shifts", "Attendance Reports", "Session Attendance"],
      dept_head: ["My Timetable", "Terms & Shifts", "Session Attendance", "My Attendance"],
      dept_deputy: ["My Timetable", "Terms & Shifts", "Session Attendance", "My Attendance"],
      teacher: ["My Timetable", "Terms & Shifts", "Session Attendance", "My Attendance"],
      student: ["My Timetable", "Terms & Shifts", "My Attendance"],
      guardian: ["My Timetable", "Terms & Shifts", "My Attendance"]
    };
    const notificationAdminPages = ["Notification Rules", "Parent Chat Links", "Message Log", "Room QR Cards", "Needs Review"];
    for (const role of ["director", "deputy_director", "office_head", "office_deputy", "office_staff"]) {
      rolePages[role].push(...notificationAdminPages);
    }
    rolePages.guardian.push("Guardian Notifications");
    const roleNames = {
      director: { en: "Director", km: "នាយកវិទ្យាស្ថាន" },
      deputy_director: { en: "Deputy Director", km: "នាយករងវិទ្យាស្ថាន" },
      office_head: { en: "Office Head", km: "ប្រធានការិយាល័យ" },
      office_deputy: { en: "Office Deputy", km: "អនុប្រធានការិយាល័យ" },
      office_staff: { en: "Office Staff", km: "មន្ត្រីការិយាល័យ" },
      dept_head: { en: "Department Head", km: "ប្រធានដេប៉ាតឺម៉ង់" },
      dept_deputy: { en: "Department Deputy", km: "អនុប្រធានដេប៉ាតឺម៉ង់" },
      teacher: { en: "Teacher", km: "គ្រូបង្រៀន" },
      student: { en: "Student", km: "សិស្ស/និស្សិត" },
      guardian: { en: "Guardian", km: "អាណាព្យាបាល" }
    };
    let studyLevels = [];
    const studentMajors = [
      "សេវាកម្មបរិក្ខារត្រជាក់ក្នុងគេហដ្ឋាន",
      "ការថែទាំ និងជួសជុលរថយន្ត",
      "មេកានិកឧស្សាហកម្ម",
      "ការដំឡើង និងជួសជុលរថយន្ត",
      "ការថែទាំ និងជួសជុលរថយន្តអគ្គិសនី"
    ];
    const students = [];
    let importPreview = null;
    const teachers = [];
    const nav = document.getElementById("nav");
    const content = document.getElementById("content");
    const sidebar = document.getElementById("sidebar");
    const attendanceRecords = new Map();
    let attendanceTodaySummary = { recorded: 0, present: 0 };
    const telegramStorageKey = "bright-future-telegram-settings";
    const defaultTelegramConfig = {
      botUsername: "",
      notifications: { attendance: true, absence: true, payments: true, announcements: false }
    };
    let telegramConfig = { ...defaultTelegramConfig, notifications: { ...defaultTelegramConfig.notifications } };
    let currentPage = "Overview";
    let currentGroup = "Dashboard";
    let toastTimer;
    let currentLanguage = "en";
    let currentUser = null;
    let activeTimetableContext = null;
    let availableTimetableShifts = [];
    let selectedAttendanceSessionId = "";
    let qrMediaStream = null;

    const uiText = {
      "dashboard.greeting": { en: "Welcome back", km: "សូមស្វាគមន៍ការត្រឡប់មកវិញ" },
      "dashboard.subtitle": { en: "Here’s what’s happening at your school today.", km: "នេះគឺជារឿងដែលកំពុងកើតឡើងនៅសាលារបស់អ្នកថ្ងៃនេះ។" },
      "student.directory.title": { en: "Student directory", km: "បញ្ជីសិស្ស" },
      "student.directory.subtitle": { en: "Manage student records, enrollment, and class assignments.", km: "គ្រប់គ្រងកំណត់ត្រាសិស្ស ចុះឈ្មោះ និងការចាត់តាំងថ្នាក់។" },
      "teacher.directory.title": { en: "Teacher directory", km: "បញ្ជីគ្រូ" },
      "teacher.directory.subtitle": { en: "View teaching staff, subjects, and class assignments.", km: "មើលបុគ្គលិកបង្រៀន មុខវិជ្ជា និងការចាត់តាំងថ្នាក់។" },
      "attendance.title": { en: "Take attendance", km: "កត់ប្រចាំ" },
      "attendance.subtitle": { en: "Record and review student attendance for today.", km: "កត់ត្រា និងពិនិត្យការចូលរួមសិស្សសម្រាប់ថ្ងៃនេះ។" },
      "school.brand": { en: "ITI Management System", km: "ប្រព័ន្ធគ្រប់គ្រង ITI" },
      "nav.school.directory": { en: "School directory", km: "ថតឯកសារសាលា" },
      "nav.learning": { en: "Learning", km: "ការរៀន" },
      "nav.services": { en: "Services", km: "សេវាកម្ម" },
      "add.student": { en: "＋ Add student", km: "＋ បន្ថែមសិស្ស" },
      "add.teacher": { en: "＋ Add teacher", km: "＋ បន្ថែមគ្រូ" },
      "import.file": { en: "↑ Import file", km: "↑ នាំចូលឯកសារ" },
      "export.csv": { en: "↓ Export CSV", km: "↓ ទាញចេញ CSV" },
      "filter.students": { en: "Filter students...", km: "ស្វែងរកសិស្ស..." },
      "student.id": { en: "Student ID", km: "លេខសិស្ស" },
      "student.name": { en: "Name English / Khmer", km: "ឈ្មោះអង់គ្លេស / ខ្មែរ" },
      "student.gender": { en: "Gender", km: "ភេទ" },
      "student.class": { en: "Study level", km: "កម្រិតសិក្សា" },
      "student.dob": { en: "Date of birth", km: "ថ្ងៃខែឆ្នាំកំណើត" },
      "student.birthplace": { en: "Place of birth", km: "ទីកន្លែងកំណើត" },
      "student.personal.number": { en: "Personal number", km: "លេខឯកត្ត" },
      "student.parent.number": { en: "Parent number", km: "លេខមេធាវី/ឪពុកម្តាយ" },
      "status.active": { en: "Active", km: "សកម្ម" },
      "status.pending": { en: "Pending", km: "កំពុងរង់ចាំ" },
      "status.present": { en: "Present", km: "នៅរួច" },
      "status.absent": { en: "Absent", km: "អវត្តមាន" },
      "status.late": { en: "Late", km: "យឺត" },
      "common.search": { en: "Search students, classes...", km: "ស្វែងរកសិស្ស ថ្នាក់..." },
      "common.english": { en: "EN", km: "EN" },
      "common.khmer": { en: "ខ្មែរ", km: "ខ្មែរ" },
      "view.all.students": { en: "View all students →", km: "មើលសិស្សទាំងអស់ →" },
      "no.students.found": { en: "No students found. Try another name or class.", km: "រកមិនឃើញសិស្ស។ សាកល្បងឈ្មោះ ឬថ្នាក់ផ្សេងទៀត។" },
      "modal.student.title": { en: "Add a student", km: "បន្ថែមសិស្ស" },
      "modal.student.subtitle": { en: "Enter the student's details. Personal information is saved in this browser.", km: "បញ្ចូលព័ត៌មានសិស្ស។ ព័ត៌មានផ្ទាល់ខ្លួនត្រូវបានរក្សាទុកក្នុងកម្មវិធីនេះ។" },
      "field.full.name": { en: "Full name", km: "ឈ្មោះពេញ" },
      "field.name.khmer": { en: "Name (Khmer)", km: "ឈ្មោះជាភាសាខ្មែរ" },
      "field.name.english": { en: "Name (English)", km: "ឈ្មោះជាភាសាអង់គ្លេស" },
      "field.gender": { en: "Gender", km: "ភេទ" },
      "field.class.level": { en: "Study level", km: "កម្រិតសិក្សា" },
      "field.date.of.birth": { en: "Date of birth", km: "ថ្ងៃខែឆ្នាំកំណើត" },
      "field.place.of.birth": { en: "Place of birth", km: "ទីកន្លែងកំណើត" },
      "field.personal.number": { en: "Personal number", km: "លេខឯកត្ត" },
      "field.parent.number": { en: "Parent number", km: "លេខមេធាវី/ឪពុកម្តាយ" },
      "field.select.gender": { en: "Select gender", km: "ជ្រើសរើសភេទ" },
      "field.select.level": { en: "Select level", km: "ជ្រើសរើសកម្រិត" },
      "action.cancel": { en: "Cancel", km: "បោះបង់" },
      "action.save": { en: "Add student", km: "បន្ថែមសិស្ស" },
      "search.placeholder": { en: "Search students, classes...", km: "ស្វែងរកសិស្ស ថ្នាក់..." },
      "topbar.notifications": { en: "Notifications", km: "ការជូនដំណឹង" },
      "Room QR Cards": { en: "Room QR Cards", km: "កាត QR បន្ទប់" },
      "Needs Review": { en: "Needs Review", km: "ត្រូវការពិនិត្យ" },
      "Parent Chat Links": { en: "Parent Chat Links", km: "តំណភ្ជាប់ Telegram" },
      "Notification Rules": { en: "Notification Rules", km: "ច្បាប់ការជូនដំណឹង" },
      "Message Log": { en: "Message Log", km: "កំណត់ហេតុសារ" },
      "Guardian Notifications": { en: "Guardian Notifications", km: "ការជូនដំណឹងអាណាព្យាបាល" },
      "topbar.language": { en: "Switch language", km: "ប្តូរភាសា" },
      "Dashboard": { en: "Dashboard", km: "ផ្ទាំងគ្រប់គ្រង" },
      "Students": { en: "Students", km: "សិស្ស" },
      "Teachers": { en: "Teachers", km: "គ្រូ" },
      "Classes": { en: "Classes", km: "ថ្នាក់" },
      "Academics": { en: "Academics", km: "ការបង្រៀន" },
      "Attendance": { en: "Attendance", km: "ការចូលរួម" },
      "Finance": { en: "Finance", km: "ហិរញ្ញវត្ថុ" },
      "Community": { en: "Community", km: "សហគមន៍" },
      "Library": { en: "Library", km: "បណ្ណាល័យ" },
      "Reports & settings": { en: "Reports & settings", km: "របាយការណ៍ និងការកំណត់" },
      "Telegram Integration": { en: "Telegram Integration", km: "ការរួមបញ្ចូល Telegram" },
      "Overview": { en: "Overview", km: "ទិដ្ឋភាពទូទៅ" },
      "Attendance Statistics": { en: "Attendance Statistics", km: "ស្ថិតិការចូលរួម" },
      "Recent Activities": { en: "Recent Activities", km: "សកម្មភាពថ្មីៗ" },
      "Student List": { en: "Student List", km: "បញ្ជីសិស្ស" },
      "Add Student": { en: "Add Student", km: "បន្ថែមសិស្ស" },
      "Add Students": { en: "Add Students", km: "បន្ថែមសិស្ស" },
      "Student Enrollment": { en: "Student Enrollment", km: "ចុះឈ្មោះសិស្ស" },
      "Import from Excel": { en: "Import from Excel", km: "នាំចូលពី Excel" },
      "Student Documents": { en: "Student Documents", km: "ឯកសារសិស្ស" },
      "Teacher List": { en: "Teacher List", km: "បញ្ជីគ្រូ" },
      "Assign Subject": { en: "Assign Subject", km: "ចាត់តាំងមុខវិជ្ជា" },
      "Teacher Schedule": { en: "Teacher Schedule", km: "កាលវិភាគគ្រូ" },
      "Study Levels": { en: "Study Levels", km: "កម្រិតការសិក្សា" },
      "Sections": { en: "Sections", km: "ផ្នែក" },
      "Student Assignment": { en: "Student Assignment", km: "ការចាត់តាំងសិស្ស" },
      "Subject List": { en: "Subject List", km: "បញ្ជីមុខវិជ្ជា" },
      "Class Timetable": { en: "Class Timetable", km: "កាលវិភាគថ្នាក់" },
      "Exam Schedule": { en: "Exam Schedule", km: "កាលវិភាគប្រឡង" },
      "Student Results": { en: "Student Results", km: "លទ្ធផលសិស្ស" },
      "Take Attendance": { en: "Take Attendance", km: "កត់ប្រចាំ" },
      "QR Attendance": { en: "QR Attendance", km: "QR ការចូលរួម" },
      "Daily Attendance": { en: "Daily Attendance", km: "ការចូលរួមប្រចាំថ្ងៃ" },
      "Monthly Attendance": { en: "Monthly Attendance", km: "ការចូលរួមប្រចាំខែ" },
      "Attendance Reports": { en: "Attendance Reports", km: "របាយការណ៍ចូលរួម" },
      "School Fees": { en: "School Fees", km: "ថ្លៃសាលា" },
      "Student Payments": { en: "Student Payments", km: "ការបង់ប្រាក់សិស្ស" },
      "Invoices": { en: "Invoices", km: "វិក្កយបត្រ" },
      "Expenses": { en: "Expenses", km: "ចំណាយ" },
      "Financial Reports": { en: "Financial Reports", km: "របាយការណ៍ហិរញ្ញវត្ថុ" },
      "Parent List": { en: "Parent List", km: "បញ្ជីឪពុកម្តាយ" },
      "Announcements": { en: "Announcements", km: "សេចក្តីប្រកាស" },
      "Messages": { en: "Messages", km: "សារក" },
      "School Events": { en: "School Events", km: "ព្រឹត្តិការណ៍សាលា" },
      "Books": { en: "Books", km: "សៀវភៅ" },
      "Borrow Books": { en: "Borrow Books", km: "ខ្ចីសៀវភៅ" },
      "Return Books": { en: "Return Books", km: "ដាក់សៀវភៅ" },
      "Library Reports": { en: "Library Reports", km: "របាយការណ៍បណ្ណាល័យ" },
      "Student Reports": { en: "Student Reports", km: "របាយការណ៍សិស្ស" },
      "Academic Reports": { en: "Academic Reports", km: "របាយការណ៍សិក្សា" },
      "User Management": { en: "User Management", km: "គ្រប់គ្រងអ្នកប្រើ" },
      "School Information": { en: "School Information", km: "ព័ត៌មានសាលា" },
      "Bot Settings": { en: "Bot Settings", km: "ការកំណត់ Bot" },
      "Notification Rules": { en: "Notification Rules", km: "វិធានការជូនដំណឹង" },
      "Parent Chat Links": { en: "Parent Chat Links", km: "តំណភ្ជាប់ជជែកឪពុកម្តាយ" },
      "Message Log": { en: "Message Log", km: "កំណត់ហេតុសារ" },
      "stats.totalStudents": { en: "Total students", km: "សិស្សសរុប" },
      "stats.teachingStaff": { en: "Teaching staff", km: "បុគ្គលិកបង្រៀន" },
      "stats.activeClasses": { en: "Active classes", km: "ថ្នាក់សកម្ម" },
      "stats.attendanceToday": { en: "Attendance today", km: "ការចូលរួមថ្ងៃនេះ" },
      "attendance.overview": { en: "Attendance overview", km: "ទិដ្ឋភាពការចូលរួម" },
      "attendance.week": { en: "Student attendance throughout this week", km: "ការចូលរួមសិស្សក្នុងសប្តាហ៍នេះ" },
      "this.week": { en: "This week", km: "សប្តាហ៍នេះ" },
      "this.month": { en: "This month", km: "ខែនេះ" },
      "recent.activity": { en: "Recent activity", km: "សកម្មភាពថ្មី" },
      "recent.activity.subtitle": { en: "Latest updates from your school", km: "ព័ត៌មានថ្មីៗពីសាលារបស់អ្នក" },
      "view.all": { en: "View all", km: "មើលទាំងអស់" },
      "recently.enrolled": { en: "Recently enrolled students", km: "សិស្សបានចុះឈ្មោះថ្មី" },
      "recently.enrolled.subtitle": { en: "Keep up with your newest learners", km: "តាមដានសិស្សថ្មីៗ" },
      "student.label": { en: "Student", km: "សិស្ស" },
      "status": { en: "Status", km: "ស្ថានភាព" },
      "quick.actions": { en: "Quick actions", km: "សកម្មភាពរហ័ស" },
      "quick.actions.subtitle": { en: "Common tasks, all in one place", km: "ភារកិច្ចទូទៅនៅកន្លែងតែមួយ" },
      "take.attendance": { en: "Take attendance", km: "កត់ប្រចាំ" },
      "take.attendance.subtitle": { en: "Record today's class attendance", km: "កត់ត្រាការចូលរួមថ្នាក់ថ្ងៃនេះ" },
      "enroll.student": { en: "Enroll a student", km: "ចុះឈ្មោះសិស្ស" },
      "enroll.student.subtitle": { en: "Add a learner to your school", km: "បន្ថែមសិស្សម្នាក់ទៅក្នុងសាលា" },
      "view.student.results": { en: "View student results", km: "មើលលទ្ធផលសិស្ស" },
      "view.student.results.subtitle": { en: "Review recent academic progress", km: "ពិនិត្យការរីកចម្រើនសិក្សាថ្មីៗ" }
    };

    function t(key) {
      const text = uiText[key];
      return text
        ? (text[currentLanguage] || text.en)
        : currentLanguage === "km"
          ? (timetableKhmerTranslations[key] || key)
          : key;
    }

    function hasPagePermission(page) {
      return Boolean(currentUser &&
        (rolePages[currentUser.role]?.includes(page) || additionalRolePages[currentUser.role]?.includes(page)));
    }

    function canCreateStudents() {
      return ["director", "deputy_director", "office_head", "office_deputy", "office_staff"].includes(currentUser?.role);
    }

    function canCreateTeachers() {
      return ["director", "deputy_director", "office_head", "office_deputy"].includes(currentUser?.role);
    }

    function canManageStudyLevels() {
      return ["director", "deputy_director", "office_head", "office_deputy"].includes(currentUser?.role);
    }

    function roleLabel(role) {
      const names = roleNames[role];
      return names ? names[currentLanguage] : role || "";
    }

    function khmerRoleLabel(role) {
      return roleNames[role]?.km || role || "";
    }

    function uiLabel(english, khmer) {
      return currentLanguage === "km" ? khmer : english;
    }

    function appDateParts(value = new Date()) {
      return Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
        timeZone: window.APP_TIMEZONE || "Asia/Phnom_Penh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).formatToParts(value).map(part => [part.type, part.value]));
    }

    function formatAppTime(value) {
      return new Intl.DateTimeFormat(currentLanguage === "km" ? "km" : "en", {
        timeZone: window.APP_TIMEZONE || "Asia/Phnom_Penh",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(value));
    }

    function updateUserProfile() {
      const profileName = document.querySelector(".profile-copy strong");
      const profileRole = document.querySelector(".profile-copy small");
      const avatar = document.querySelector(".avatar");
      const logoutButton = document.getElementById("logout-button");
      const loginScreen = document.getElementById("login-screen");
      const appShell = document.getElementById("app-shell");
      if (!profileName || !profileRole || !avatar || !logoutButton || !loginScreen || !appShell) return;

      if (!currentUser) {
        profileName.textContent = "School Portal";
        profileRole.textContent = "";
        avatar.textContent = "SA";
        logoutButton.style.display = "none";
        appShell.classList.add("hidden");
        loginScreen.classList.remove("hidden");
        buildNavigation();
        return;
      }

      const initials = currentUser.name.split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase();
      profileName.textContent = currentUser.name;
      profileRole.textContent = khmerRoleLabel(currentUser.role);
      avatar.textContent = initials || "SR";
      logoutButton.style.display = "inline-grid";
      appShell.classList.remove("hidden");
      loginScreen.classList.add("hidden");
      buildNavigation();
    }

    async function handleLogin(event) {
      event.preventDefault();
      const form = new FormData(event.target);
      const username = String(form.get("username") || "").trim();
      const password = String(form.get("password") || "");
      const errorMessage = document.getElementById("login-error");
      try {
        const result = await apiRequest("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ username, password })
        });
        currentUser = result.user;
        await loadDatabaseData();
        errorMessage.textContent = "";
        errorMessage.hidden = true;
        updateUserProfile();
        navigate("Overview", "Dashboard");
        await refreshNotificationBell();
        showToast(`Welcome back, ${currentUser.name}.`);
      } catch (error) {
        console.error("Could not log in to the school management system.", error);
        currentUser = null;
        updateUserProfile();
        errorMessage.textContent = error.message;
        errorMessage.hidden = false;
      }
    }

    async function logout() {
      try {
        await apiRequest("/api/auth/logout", { method: "POST" });
      } catch (error) {
        console.error("Could not end the school management session.", error);
        showToast(error.message);
        return;
      }
      currentUser = null;
      currentPage = "Overview";
      updateUserProfile();
      showToast("You have been logged out.");
    }

    function setLanguage(language) {
      if (!["en", "km"].includes(language)) return;
      currentLanguage = language;
      try {
        localStorage.setItem("iti-language", language);
      } catch (error) {
        console.error("Could not save language preference.", error);
      }
      const toggle = document.getElementById("language-toggle");
      if (toggle) {
        toggle.textContent = language === "en" ? "ខ្មែរ" : "EN";
        toggle.setAttribute("aria-label", t("topbar.language"));
        toggle.setAttribute("title", t("topbar.language"));
      }
      document.documentElement.lang = language === "km" ? "km" : "en";
      const today = document.getElementById("today");
      if (today) {
        today.textContent = new Intl.DateTimeFormat(language === "km" ? "km" : "en", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: window.APP_TIMEZONE || "Asia/Phnom_Penh" }).format(new Date());
      }
      nav.innerHTML = "";
      buildNavigation();
      if (currentUser) {
        const profileRole = document.querySelector(".profile-copy small");
        if (profileRole) profileRole.textContent = khmerRoleLabel(currentUser.role);
      }
      if (currentPage === "Overview") dashboard();
      else if (currentPage === "Study Levels") renderStudyLevels();
      else if (currentPage === "QR Attendance") renderQrAttendance();
      else if (currentPage === "Student List") renderStudents();
      else if (currentPage === "Teacher List") renderTeachers();
      else if (currentPage === "Take Attendance") renderSessionAttendance();
      else if (["Classes", "Class Timetable"].includes(currentPage)) renderClassesManager();
      else if (currentPage === "Terms & Shifts") renderTermsAndShifts();
      else if (currentPage === "My Timetable") renderMyTimetable();
      else if (currentPage === "Session Attendance") renderSessionAttendance();
      else if (currentPage === "My Attendance") renderMyAttendance();
      else if (currentPage === "Monthly Attendance") renderMyAttendance();
      else if (currentPage === "Daily Attendance") renderAttendance();
      else if (currentPage === "Attendance Reports") renderAttendanceReports();
      else if (currentPage === "Import from Excel") renderImportStudents();
      else if (["Notification Rules", "Parent Chat Links", "Message Log", "Room QR Cards", "Needs Review", "Guardian Notifications"].includes(currentPage)) renderNotificationFeature(currentPage);
      else if (currentPage === "Bot Settings") renderTelegram("Bot Settings");
      else if (currentPage === "Notification Rules") renderTelegram("Notification Rules");
      else if (currentPage === "Parent Chat Links") renderTelegram("Parent Chat Links");
      else if (currentPage === "Message Log") renderTelegram("Message Log");
      else if (currentPage === "Classes") renderModule("Classes");
      else if (currentPage === "Student Results") renderModule("Student Results");
      else if (currentPage === "Books") renderModule("Books");
      else if (currentPage === "Parent List") renderModule("Parent List");
      else if (currentPage === "School Fees") renderModule("School Fees");
      else if (currentPage === "Student Payments") renderModule("Student Payments");
      else if (currentPage === "Exam Schedule") renderModule("Exam Schedule");
      else if (currentPage === "Announcements") renderModule("Announcements");
      else if (currentPage === "User Management") renderUsers();
      else if (currentPage === "My Account") renderMyAccount();
    }

    function escapeHTML(value) {
      return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
      })[char]);
    }

    function renderLoadingState(title, subtitle, message = "Loading school data...") {
      content.innerHTML = pageHeader(title, subtitle) + `
        <section class="panel">
          <div class="empty" style="padding:32px 16px;">${escapeHTML(message)}</div>
        </section>
      `;
    }

    function renderDataErrorState(title, subtitle, message) {
      content.innerHTML = pageHeader(title, subtitle, currentUser ? '<button class="btn secondary" type="button" data-action="retry-data-load">Retry</button>' : "") + `
        <section class="panel">
          <div class="empty" style="padding:32px 16px;">${escapeHTML(message)}</div>
        </section>
      `;
    }

    async function apiRequest(path, options = {}) {
      const response = await fetch(path, {
        ...options,
        credentials: "same-origin",
        headers: {
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...options.headers
        }
      });
      let result;
      try {
        result = await response.json();
      } catch (error) {
        result = {};
      }
      if (!response.ok) {
        const error = new Error(result.error || `Request failed (${response.status}).`);
        error.code = result.code;
        throw error;
      }
      return result;
    }

    async function refreshNotificationBell() {
      if (!currentUser) return;
      try {
        const data = await apiRequest("/api/notifications");
        const count = document.getElementById("notification-count");
        if (count) {
          count.textContent = data.unread > 99 ? "99+" : String(data.unread || "");
          count.hidden = !data.unread;
        }
      } catch (error) {
        console.error("Could not refresh unread notification count.");
      }
    }

    async function openNotifications(forceRefresh = false) {
      const previous = document.getElementById("notification-panel");
      if (previous) {
        previous.remove();
        if (!forceRefresh) return;
      }
      const panel = document.createElement("div");
      panel.id = "notification-panel";
      panel.className = "notification-panel";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-label", "Notifications");
      panel.innerHTML = `<div class="notification-panel-head"><strong>Notifications</strong><button type="button" aria-label="Close notifications" data-action="close-notifications">×</button></div><div class="empty">Loading notifications...</div>`;
      document.querySelector(".topbar")?.append(panel);
      try {
        const data = await apiRequest("/api/notifications");
        const count = document.getElementById("notification-count");
        if (count) {
          count.textContent = data.unread > 99 ? "99+" : String(data.unread || "");
          count.hidden = !data.unread;
        }
        panel.innerHTML = `<div class="notification-panel-head"><strong>Notifications${data.unread ? ` · ${data.unread} unread` : ""}</strong><button type="button" aria-label="Close notifications" data-action="close-notifications">×</button></div>${data.notifications.length ? data.notifications.map(item => `<article class="notification-item ${item.read_at ? "" : "unread"}"><p>${escapeHTML(item.body)}</p><small>${escapeHTML(new Date(item.created_at).toLocaleString())}</small>${item.read_at ? "" : `<button class="text-link" data-action="mark-notification-read" data-notification-id="${escapeAttribute(item.id)}">Mark read</button>`}</article>`).join("") : `<div class="empty">No notifications yet.</div>`}`;
      } catch (error) {
        panel.innerHTML = `<div class="notification-panel-head"><strong>Notifications</strong><button type="button" aria-label="Close notifications" data-action="close-notifications">×</button></div><div class="empty error-state">${escapeHTML(error.message)} <button data-action="reload-notifications" class="text-link">Retry</button></div>`;
      }
    }

    async function loadDatabaseData() {
      const activePage = currentPage || "Overview";
      if (activePage === "Student List") {
        renderLoadingState(t("student.directory.title"), t("student.directory.subtitle"), "Loading student records...");
      } else if (activePage === "Teacher List") {
        renderLoadingState(t("teacher.directory.title"), t("teacher.directory.subtitle"), "Loading teacher records...");
      } else if (activePage === "Study Levels") {
        renderLoadingState("Study Levels", "Create and manage the levels available in your school.", "Loading study levels...");
      }

      try {
        const data = await apiRequest(`/api/data?date=${encodeURIComponent(localDateValue())}`);
        students.splice(0, students.length, ...data.students);
        teachers.splice(0, teachers.length, ...data.teachers);
        studyLevels.splice(0, studyLevels.length, ...data.studyLevels);
        attendanceTodaySummary = data.attendanceToday || { recorded: 0, present: 0 };
      } catch (error) {
        console.error("Could not load the school data from the API.", error);
        if (activePage === "Student List") {
          renderDataErrorState(t("student.directory.title"), t("student.directory.subtitle"), error.message);
        } else if (activePage === "Teacher List") {
          renderDataErrorState(t("teacher.directory.title"), t("teacher.directory.subtitle"), error.message);
        } else if (activePage === "Study Levels") {
          renderDataErrorState("Study Levels", "Create and manage the levels available in your school.", error.message);
        } else if (currentUser) {
          showToast(error.message);
        }
        throw error;
      }
    }

    async function restoreSession() {
      try {
        const data = await apiRequest("/api/auth/session");
        currentUser = data.user;
        await loadDatabaseData();
        updateUserProfile();
        navigate("Overview", "Dashboard");
        await refreshNotificationBell();
      } catch (error) {
        if (error.message !== "Authentication required.") {
          console.error("Could not restore the school management session.", error);
          const errorMessage = document.getElementById("login-error");
          errorMessage.textContent = error.message;
          errorMessage.hidden = false;
        }
        currentUser = null;
        updateUserProfile();
      }
    }

    function buildNavigation() {
      nav.innerHTML = "";
      if (!currentUser) return;
      groups.forEach((group, index) => {
        const items = group.items.filter(item => hasPagePermission(item));
        if (!items.length) return;
        const section = document.createElement("div");
        if (index === 1 || index === 4 || index === 7) {
          const label = document.createElement("div");
          label.className = "nav-label";
          label.textContent = index === 1 ? t("nav.school.directory") : index === 4 ? t("nav.learning") : t("nav.services");
          section.appendChild(label);
        }
        const button = document.createElement("button");
        button.className = "nav-item";
        button.type = "button";
        button.innerHTML = `<span class="nav-icon" aria-hidden="true">${group.icon}</span><span>${escapeHTML(t(group.name))}</span><span class="nav-arrow" aria-hidden="true">›</span>`;
        button.setAttribute("aria-expanded", "false");
        const submenu = document.createElement("div");
        submenu.className = "subnav";
        items.forEach(item => {
          const link = document.createElement("button");
          link.type = "button";
          link.dataset.page = item;
          link.textContent = t(item);
          link.addEventListener("click", () => navigate(item, group.name));
          submenu.appendChild(link);
        });
        button.addEventListener("click", () => {
          const willOpen = !submenu.classList.contains("open");
          document.querySelectorAll(".subnav.open").forEach(element => element.classList.remove("open"));
          document.querySelectorAll(".nav-item.expanded").forEach(element => {
            element.classList.remove("expanded");
            element.setAttribute("aria-expanded", "false");
          });
          if (willOpen) {
            submenu.classList.add("open");
            button.classList.add("expanded");
            button.setAttribute("aria-expanded", "true");
          } else if (group.name === "Dashboard") {
            navigate("Overview", group.name);
          }
        });
        section.append(button, submenu);
        nav.appendChild(section);
      });
    }

    function pageHeader(title, subtitle, action = "") {
      return `<div class="page-head"><div><div class="eyebrow">${escapeHTML(t("school.brand"))}</div><h1>${escapeHTML(title)}</h1><div class="page-subtitle">${escapeHTML(subtitle)}</div></div>${action}</div>`;
    }

    function dashboard() {
      const canAddStudents = canCreateStudents();
      const canTakeAttendance = ["director", "deputy_director", "dept_head", "dept_deputy", "teacher"].includes(currentUser?.role);
      const attendancePercent = students.length
        ? `${Math.round(attendanceTodaySummary.present / students.length * 100)}%`
        : "—";
      const attendanceNote = attendanceTodaySummary.recorded
        ? `${attendanceTodaySummary.recorded} of ${students.length} students recorded`
        : "No records today";
      const classCount = new Set(students.map(student => student.className)).size;
      const stats = [
        [t("stats.totalStudents"), String(students.length), "Enrolled students", "♙"],
        [t("stats.teachingStaff"), String(teachers.length), "Teaching staff", "♧"],
        [t("stats.activeClasses"), String(classCount), "Classes with students", "▤"],
        [t("stats.attendanceToday"), attendancePercent, attendanceNote, "◷"]
      ];
      const statMarkup = stats.map(([label, value, note, icon]) =>
        `<article class="card stat-card"><div class="stat-top"><span>${escapeHTML(label)}</span><span class="stat-icon" aria-hidden="true">${icon}</span></div><div class="stat-number">${value}</div><div class="stat-note"><span class="trend">${note.startsWith("↗") ? note.slice(0, note.indexOf(" ")) : ""}</span>${note.startsWith("↗") ? note.slice(note.indexOf(" ") + 1) : note}</div></article>`
      ).join("");
      const activityMarkup = `<div class="empty">No recent activities yet.</div>`;
      const recentStudents = students.slice(0, 4).map(student => studentRow(student)).join("");
      const greeting = currentUser
        ? `${t("dashboard.greeting")}, ${currentUser.name} 👋`
        : `${t("dashboard.greeting")} 👋`;
      content.innerHTML = pageHeader(greeting, t("dashboard.subtitle"), canAddStudents ? `<button class="btn" data-action="add-student">${t("add.student")}</button>` : "") +
        `<div class="cards">${statMarkup}</div>
        <div class="dashboard-grid">
          <section class="panel">
            <div class="panel-head"><div><h2>${t("attendance.overview")}</h2><p>${t("attendance.week")}</p></div><select class="select-small" aria-label="Attendance chart period"><option>${t("this.week")}</option><option>${t("this.month")}</option></select></div>
            <div class="empty">Attendance statistics will appear after attendance is recorded.</div>
          </section>
          <section class="panel">
            <div class="panel-head"><div><h2>${t("recent.activity")}</h2><p>${t("recent.activity.subtitle")}</p></div><button class="text-link" data-page="Recent Activities">${t("view.all")}</button></div>
            <div class="activity-list">${activityMarkup}</div>
          </section>
        </div>
        <div class="bottom-grid">
          <section class="panel">
            <div class="panel-head"><div><h2>${t("recently.enrolled")}</h2><p>${t("recently.enrolled.subtitle")}</p></div><button class="text-link" data-page="Student List">${t("view.all.students")} →</button></div>
            <div class="table-wrap"><table class="table"><thead><tr><th>${t("student.label")}</th><th>${t("student.id")}</th><th>${t("student.class")}</th><th>${t("status")}</th></tr></thead><tbody>${recentStudents || `<tr><td colspan="4"><div class="empty">No students enrolled yet.</div></td></tr>`}</tbody></table></div>
          </section>
          <section class="panel">
            <div class="panel-head"><div><h2>${t("quick.actions")}</h2><p>${t("quick.actions.subtitle")}</p></div></div>
            <div class="quick-actions">
              ${canTakeAttendance ? `<button class="quick-action" data-action="take-attendance"><span class="quick-icon">◷</span><span><strong>${t("take.attendance")}</strong><small>${t("take.attendance.subtitle")}</small></span></button>` : ""}
              ${canAddStudents ? `<button class="quick-action" data-action="add-student"><span class="quick-icon">＋</span><span><strong>${t("enroll.student")}</strong><small>${t("enroll.student.subtitle")}</small></span></button>` : ""}
              ${hasPagePermission("Student Results") ? `<button class="quick-action" data-page="Student Results"><span class="quick-icon">▤</span><span><strong>${t("view.student.results")}</strong><small>${t("view.student.results.subtitle")}</small></span></button>` : ""}
            </div>
          </section>
        </div>`;
    }

    function studentRow(student) {
      const englishName = student.nameEnglish || student.name || "";
      const initials = englishName.split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase();
      const status = student.status === "Active" ? t("status.active") : t("status.pending");
      return `<tr><td><div class="student-cell"><span class="student-avatar">${escapeHTML(initials)}</span><span class="student-names"><strong>${escapeHTML(englishName || student.nameKhmer || "")}</strong>${student.nameKhmer ? `<small>${escapeHTML(student.nameKhmer)}</small>` : ""}</span></div></td><td>${escapeHTML(student.id)}</td><td>${escapeHTML(student.className)}</td><td><span class="badge ${student.status === "Active" ? "active" : "pending"}">${escapeHTML(status)}</span></td></tr>`;
    }

    function renderStudents(query = "", options = {}) {
      if (options.loading) {
        renderLoadingState(t("student.directory.title"), t("student.directory.subtitle"), "Loading student records...");
        return;
      }
      if (options.error) {
        renderDataErrorState(t("student.directory.title"), t("student.directory.subtitle"), options.message || "Could not load student records.");
        return;
      }

      const normalized = query.trim().toLowerCase();
      const filtered = students.filter(student => Object.values(student).join(" ").toLowerCase().includes(normalized));
      const rows = filtered.map(student => {
        return `<tr><td>${escapeHTML(student.id)}</td><td>${escapeHTML(student.nameKhmer || "—")}</td><td>${escapeHTML(student.nameEnglish || student.name || "—")}</td><td>${escapeHTML(student.gender)}</td><td>${escapeHTML(student.className)}</td><td>${escapeHTML(student.major || "—")}</td><td>${escapeHTML(student.studyShift || "—")}</td><td>${escapeHTML(student.studentGroup || "—")}</td><td>${escapeHTML(student.grade || "—")}</td><td>${escapeHTML(student.dateOfBirth || "—")}</td><td>${escapeHTML(student.placeOfBirth || "—")}</td><td>${escapeHTML(student.personalNumber || "—")}</td><td>${escapeHTML(student.parentNumber || student.phone || "—")}</td><td><span class="badge ${student.status === "Active" ? "active" : "pending"}">${escapeHTML(student.status === "Active" ? t("status.active") : t("status.pending"))}</span></td></tr>`;
      }).join("");
      const emptyMessage = students.length
        ? "No students match your search."
        : canCreateStudents() ? "No students enrolled yet. Add a student or import a spreadsheet." : "No student records are available for this account.";
      const addButton = canCreateStudents() ? `<button class="btn" data-action="add-student">${t("add.student")}</button>` : "";
      const toolbarButtons = [
        canCreateStudents() ? `<button class="btn secondary" data-page="Import from Excel">${t("import.file")}</button>` : "",
        ["director", "deputy_director", "office_head", "office_deputy", "office_staff"].includes(currentUser?.role)
          ? `<button class="btn secondary" data-action="export-students">${t("export.csv")}</button>` : ""
      ].filter(Boolean).join("");
      content.innerHTML = pageHeader(t("student.directory.title"), t("student.directory.subtitle"), addButton) +
        `<section class="panel"><div class="list-toolbar"><input id="table-search" class="list-search" type="search" placeholder="${t("filter.students")}" value="${escapeHTML(query)}" aria-label="Filter student list"><div class="toolbar-actions">${toolbarButtons}</div></div><div class="telegram-notice" style="margin-bottom:14px"><strong>Personal data:</strong> Only records permitted for your account are shown.</div><div class="table-wrap"><table class="table"><thead><tr><th>${t("student.id")}</th><th>${t("field.name.khmer")}</th><th>${t("field.name.english")}</th><th>${t("student.gender")}</th><th>${t("student.class")}</th><th>ជំនាញ</th><th>វេនសិក្សា</th><th>ក្រុម</th><th>និទ្ទេស</th><th>${t("student.dob")}</th><th>${t("student.birthplace")}</th><th>${t("student.personal.number")}</th><th>${t("student.parent.number")}</th><th>${t("status")}</th></tr></thead><tbody id="student-rows">${rows || `<tr><td colspan="14"><div class="empty">${emptyMessage}</div></td></tr>`}</tbody></table></div><div class="page-subtitle" style="margin-top:14px">Showing ${filtered.length} of ${students.length} students</div></section>`;
      const filter = document.getElementById("table-search");
      filter.addEventListener("input", () => renderStudents(filter.value));
      filter.focus({ preventScroll: true });
      filter.setSelectionRange(filter.value.length, filter.value.length);
    }

    function renderTeachers(options = {}) {
      if (options.loading) {
        renderLoadingState(t("teacher.directory.title"), t("teacher.directory.subtitle"), "Loading teacher records...");
        return;
      }
      if (options.error) {
        renderDataErrorState(t("teacher.directory.title"), t("teacher.directory.subtitle"), options.message || "Could not load teacher records.");
        return;
      }

      const rows = teachers.map(teacher => `<tr><td>${escapeHTML(teacher.id)}</td><td>${escapeHTML(teacher.nameKhmer || "—")}</td><td>${escapeHTML(teacher.nameEnglish || teacher.name || "—")}</td><td>${escapeHTML(teacher.subject)}</td><td>${escapeHTML(teacher.className)}</td><td>${escapeHTML(teacher.phone || "—")}</td><td><span class="badge active">${t("status.active")}</span></td></tr>`).join("");
      content.innerHTML = pageHeader(t("teacher.directory.title"), t("teacher.directory.subtitle"), canCreateTeachers() ? `<button class="btn" data-action="add-teacher">${t("add.teacher")}</button>` : "") +
        `<section class="panel"><div class="table-wrap"><table class="table"><thead><tr><th>Teacher ID</th><th>Name (Khmer)</th><th>Name (English)</th><th>Subject</th><th>${t("student.class")}</th><th>Phone</th><th>${t("status")}</th></tr></thead><tbody>${rows || `<tr><td colspan="7"><div class="empty">No teachers added yet.</div></td></tr>`}</tbody></table></div></section>`;
    }

    function renderImportStudents() {
      importPreview = null;
      content.innerHTML = pageHeader(t("student.directory.title"), t("student.directory.subtitle")) +
        `<div class="import-layout">
          <div>
            <section class="panel">
              <div class="upload-zone" id="upload-zone">
                <div class="upload-icon" aria-hidden="true">↑</div>
                <h2>Drop your spreadsheet here</h2>
                <p>or choose a file from your device</p>
                <button class="btn secondary" id="choose-import-file" type="button">Choose file</button>
                <input id="import-file" type="file" accept=".xlsx,.xls,.csv" hidden>
                <div class="upload-meta">Excel (.xlsx, .xls) or CSV · Maximum file size 10 MB · Internet required to load the reader · File stays in your browser</div>
              </div>
              <div id="import-preview"></div>
            </section>
          </div>
          <aside class="import-sidebar">
            <section class="panel">
              <div class="panel-head"><div><h2>Spreadsheet format</h2><p>Use a header row with these columns.</p></div></div>
              <ul class="import-hints">
                <li><strong>Name Khmer</strong> or <strong>Name English</strong> — at least one required</li>
                <li><strong>Class</strong> — required</li>
                <li>Student ID — optional</li>
                <li>Date of Birth, Place of Birth — optional</li>
                <li>Personal Number, Parent Number — optional</li>
                <li>Student ID, Gender, Status — optional</li>
              </ul>
              <button class="btn secondary" data-action="download-import-template" style="margin-top:14px">↓ Download template</button>
            </section>
            <div class="telegram-notice"><strong>Safe import:</strong> The Excel reader loads from a CDN on first use, but your spreadsheet is parsed in this browser and is not uploaded. Existing records with a matching ID or name and class are skipped.</div>
          </aside>
        </div>`;
      const fileInput = document.getElementById("import-file");
      const zone = document.getElementById("upload-zone");
      document.getElementById("choose-import-file").addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", () => {
        if (fileInput.files[0]) readStudentSpreadsheet(fileInput.files[0]);
      });
      zone.addEventListener("dragover", event => {
        event.preventDefault();
        zone.classList.add("dragover");
      });
      zone.addEventListener("dragleave", event => {
        if (!zone.contains(event.relatedTarget)) zone.classList.remove("dragover");
      });
      zone.addEventListener("drop", event => {
        event.preventDefault();
        zone.classList.remove("dragover");
        if (event.dataTransfer.files[0]) readStudentSpreadsheet(event.dataTransfer.files[0]);
      });
    }

    function normalizeHeader(value) {
      return String(value || "").trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
    }

    function createStudentId(reservedIds = new Set()) {
      let sequence = 2401 + students.length;
      let id = `ST-${String(sequence).padStart(4, "0")}`;
      while (students.some(student => student.id.toLowerCase() === id.toLowerCase()) || reservedIds.has(id.toLowerCase())) {
        sequence++;
        id = `ST-${String(sequence).padStart(4, "0")}`;
      }
      return id;
    }

    function createTeacherId(reservedIds = new Set()) {
      let sequence = 2401 + teachers.length;
      let id = `TCH-${String(sequence).padStart(4, "0")}`;
      while (teachers.some(teacher => teacher.id.toLowerCase() === id.toLowerCase()) || reservedIds.has(id.toLowerCase())) {
        sequence++;
        id = `TCH-${String(sequence).padStart(4, "0")}`;
      }
      return id;
    }

    function readCell(row, headerIndexes, aliases) {
      for (const alias of aliases) {
        const index = headerIndexes.get(alias);
        if (index !== undefined && row[index] !== undefined && row[index] !== null) {
          return String(row[index]).trim();
        }
      }
      return "";
    }

    async function loadSpreadsheetLibrary() {
      if (window.XLSX) return window.XLSX;
      if (window.spreadsheetLibraryPromise) return window.spreadsheetLibraryPromise;
      window.spreadsheetLibraryPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
        script.async = true;
        script.onload = () => window.XLSX ? resolve(window.XLSX) : reject(new Error("Spreadsheet parser loaded without its API."));
        script.onerror = () => reject(new Error("Could not load the Excel parser. Check your internet connection and retry."));
        document.head.appendChild(script);
      });
      return window.spreadsheetLibraryPromise;
    }

    async function readStudentSpreadsheet(file) {
      const preview = document.getElementById("import-preview");
      const extension = file.name.split(".").pop().toLowerCase();
      if (!["xlsx", "xls", "csv"].includes(extension)) {
        preview.innerHTML = `<p class="import-progress error">Choose an .xlsx, .xls, or .csv file.</p>`;
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        preview.innerHTML = `<p class="import-progress error">This file exceeds the 10 MB limit.</p>`;
        return;
      }
      if (file.size === 0) {
        preview.innerHTML = `<p class="import-progress error">The selected file is empty.</p>`;
        return;
      }
      preview.innerHTML = `<p class="import-progress">Reading ${escapeHTML(file.name)} locally...</p>`;
      try {
        const XLSX = await loadSpreadsheetLibrary();
        const bytes = await file.arrayBuffer();
        const workbook = XLSX.read(bytes, { type: "array", cellDates: false });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!firstSheet) throw new Error("The workbook does not contain a worksheet.");
        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "", raw: false, blankrows: false });
        if (rows.length < 2) throw new Error("The first worksheet needs a header row and at least one student row.");
        if (rows.length > 5001) throw new Error("A file can contain up to 5,000 student rows per import.");
        const headerIndexes = new Map();
        rows[0].forEach((header, index) => {
          const normalized = normalizeHeader(header);
          if (normalized) headerIndexes.set(normalized, index);
        });
        const aliases = {
          id: ["student id", "id", "student number", "student code"],
          nameEnglish: ["name english", "english name", "student name english", "student name", "full name", "name", "student"],
          nameKhmer: ["name khmer", "khmer name", "student name khmer"],
          gender: ["gender", "sex"],
          className: ["class", "class name", "grade", "section", "grade level"],
          major: ["major", "specialty", "specialization", "skill", "field of study", "career", "training program", "ជំនាញ"],
          studyShift: ["study shift", "shift", "schedule", "វេនសិក្សា", "វេន សិក្សា"],
          studentGroup: ["student group", "group", "ក្រុម"],
          grade: ["grade", "rating", "result", "និទ្ទេស"],
          dateOfBirth: ["date of birth", "date of birth (yyyy mm dd)", "dob", "birth date"],
          placeOfBirth: ["place of birth", "birthplace", "birth place"],
          personalNumber: ["personal number", "personal no", "national id", "personal id"],
          parentNumber: ["parent number", "parent phone", "parent phone number", "phone", "phone number", "contact", "contact number"],
          status: ["status", "enrollment status"]
        };
        if (![...aliases.nameEnglish, ...aliases.nameKhmer].some(alias => headerIndexes.has(alias)) || !aliases.className.some(alias => headerIndexes.has(alias))) {
          throw new Error("Required columns are missing. Include a Khmer or English student name and Class in the header row.");
        }
        const staged = [];
        const errors = [];
        const seenIds = new Set(students.map(student => student.id.toLowerCase()));
        const seenNameClasses = new Set(students.map(student => `${(student.nameEnglish || student.name).trim().toLowerCase()}|${student.className.trim().toLowerCase()}`));
        rows.slice(1).forEach((row, index) => {
          if (!row.some(value => String(value || "").trim())) return;
          const rowNumber = index + 2;
          const nameEnglish = readCell(row, headerIndexes, aliases.nameEnglish);
          const nameKhmer = readCell(row, headerIndexes, aliases.nameKhmer);
          const className = readCell(row, headerIndexes, aliases.className);
          if ((!nameEnglish && !nameKhmer) || !className) {
            errors.push(`Row ${rowNumber}: at least one student name (Khmer or English) and Class are required.`);
            return;
          }
          const name = nameEnglish || nameKhmer;
          const existingId = readCell(row, headerIndexes, aliases.id);
          const normalizedId = existingId.toLowerCase();
          const nameClassKey = `${name.toLowerCase()}|${className.toLowerCase()}`;
          if ((normalizedId && seenIds.has(normalizedId)) || seenNameClasses.has(nameClassKey)) {
            errors.push(`Row ${rowNumber}: duplicate student skipped (${name}, ${className}).`);
            return;
          }
          const studentId = existingId || createStudentId(seenIds);
          const student = {
            id: studentId,
            name,
            nameEnglish,
            nameKhmer,
            gender: readCell(row, headerIndexes, aliases.gender) || "Not specified",
            className,
            major: readCell(row, headerIndexes, aliases.major) || "",
            studyShift: readCell(row, headerIndexes, aliases.studyShift) || "",
            studentGroup: readCell(row, headerIndexes, aliases.studentGroup) || "",
            grade: readCell(row, headerIndexes, aliases.grade) || "",
            dateOfBirth: readCell(row, headerIndexes, aliases.dateOfBirth),
            placeOfBirth: readCell(row, headerIndexes, aliases.placeOfBirth),
            personalNumber: readCell(row, headerIndexes, aliases.personalNumber),
            parentNumber: readCell(row, headerIndexes, aliases.parentNumber),
            phone: readCell(row, headerIndexes, aliases.parentNumber),
            status: readCell(row, headerIndexes, aliases.status) || "Active"
          };
          staged.push(student);
          seenIds.add(studentId.toLowerCase());
          seenNameClasses.add(nameClassKey);
        });
        if (!staged.length && !errors.length) throw new Error("No student records were found below the header row.");
        importPreview = { fileName: file.name, students: staged, errors };
        renderImportPreview(rows.slice(1).filter(row => row.some(value => String(value || "").trim())).length);
      } catch (error) {
        console.error("Could not import the student spreadsheet.", error);
        importPreview = null;
        preview.innerHTML = `<p class="import-progress error">${escapeHTML(error.message || "Could not read this spreadsheet.")}</p>`;
      }
    }

    function renderImportPreview(totalRows) {
      const preview = document.getElementById("import-preview");
      const validRows = importPreview.students;
      const previewRows = validRows.slice(0, 8).map(student =>
        `<tr><td>${escapeHTML(student.id)}</td><td>${escapeHTML(student.nameKhmer || "—")}</td><td>${escapeHTML(student.nameEnglish || (!student.nameKhmer ? student.name : "") || "—")}</td><td>${escapeHTML(student.className || "—")}</td><td>${escapeHTML(student.major || "—")}</td><td>${escapeHTML(student.studyShift || "—")}</td><td>${escapeHTML(student.studentGroup || "—")}</td><td>${escapeHTML(student.grade || "—")}</td><td>${escapeHTML(student.dateOfBirth || "—")}</td><td>${escapeHTML(student.placeOfBirth || "—")}</td><td>${escapeHTML(student.personalNumber || "—")}</td><td>${escapeHTML(student.parentNumber || student.phone || "—")}</td></tr>`
      ).join("");
      const errors = importPreview.errors.length
        ? `<ul class="import-error-list">${importPreview.errors.slice(0, 12).map(error => `<li>${escapeHTML(error)}</li>`).join("")}${importPreview.errors.length > 12 ? `<li>And ${importPreview.errors.length - 12} more row issue(s).</li>` : ""}</ul>`
        : "";
      preview.innerHTML = `<div class="import-summary"><span class="import-count"><strong>${totalRows}</strong> rows read</span><span class="import-count good"><strong>${validRows.length}</strong> ready to import</span><span class="import-count ${importPreview.errors.length ? "bad" : ""}"><strong>${importPreview.errors.length}</strong> skipped</span></div>
        <p class="page-subtitle">Preview of ${escapeHTML(importPreview.fileName)}${validRows.length > 8 ? ` · first 8 of ${validRows.length} valid records` : ""}</p>
        <div class="table-wrap"><table class="table"><thead><tr><th>Student ID</th><th>Name Khmer</th><th>Name English</th><th>Class</th><th>Major</th><th>វេនសិក្សា</th><th>ក្រុម</th><th>និទ្ទេស</th><th>Date of birth</th><th>Place of birth</th><th>Personal number</th><th>Parent number</th></tr></thead><tbody>${previewRows || `<tr><td colspan="12"><div class="empty">There are no valid rows to import.</div></td></tr>`}</tbody></table></div>
        ${errors}<div class="import-actions"><button type="button" class="btn secondary" data-action="cancel-import">Cancel</button><button type="button" class="btn" data-action="confirm-import" ${validRows.length ? "" : "disabled"}>Import ${validRows.length} students</button></div>`;
    }

    function downloadImportTemplate() {
      const csv = [
        ["Student ID", "Name Khmer", "Name English", "Gender", "Class", "Major", "Study Shift", "Group", "Grade", "Date of Birth", "Place of Birth", "Personal Number", "Parent Number", "Status"]
      ].map(row => row.map(value => `"${value.replace(/"/g, '""')}"`).join(",")).join("\r\n");
      const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "iti-student-import-template.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }

    function localDateValue() {
      const { year, month, day } = appDateParts();
      return `${year}-${month}-${day}`;
    }

    function updateAttendanceClass() {
      const selectedClass = document.getElementById("attendance-class").value;
      document.querySelectorAll("#attendance-rows tr").forEach(row => {
        row.hidden = selectedClass !== "All levels" && row.dataset.class !== selectedClass;
      });
    }

    async function loadAttendanceForDate(date) {
      const data = await apiRequest(`/api/attendance?date=${encodeURIComponent(date)}`);
      for (const key of [...attendanceRecords.keys()]) {
        if (key.startsWith(`${date}|`)) attendanceRecords.delete(key);
      }
      data.records.forEach(record => attendanceRecords.set(`${date}|${record.id}`, record.status));
      return data.records;
    }

    function renderAttendance(selectedClass = "All levels") {
      const date = localDateValue();
      const canEditAttendance = false;
      const rows = students.map(student => {
        const selected = attendanceRecords.get(`${date}|${student.id}`) || "Present";
        const choices = ["Present", "Absent", "Late"].map(value =>
          `<label><input type="radio" name="attendance-${escapeHTML(student.id)}" value="${value}" ${selected === value ? "checked" : ""} ${canEditAttendance ? "" : "disabled"}> ${value}</label>`
        ).join("");
        const englishName = student.nameEnglish || student.name || student.nameKhmer || "";
        const initials = englishName.split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase();
        return `<tr data-student-id="${escapeHTML(student.id)}" data-class="${escapeHTML(student.className)}"><td><div class="student-cell"><span class="student-avatar">${escapeHTML(initials)}</span><span class="student-names"><strong>${escapeHTML(englishName)}</strong>${student.nameKhmer ? `<small>${escapeHTML(student.nameKhmer)}</small>` : ""}</span></div></td><td>${escapeHTML(student.className)}</td><td><div class="attendance-choice">${choices}</div></td></tr>`;
      }).join("") || `<tr><td colspan="3"><div class="empty">No students available to take attendance.</div></td></tr>`;
      content.innerHTML = pageHeader(t("attendance.title"), t("attendance.subtitle")) +
        `<div class="notice">◷ &nbsp; ${canEditAttendance ? "Attendance is recorded for the selected date and study level." : "Attendance is read-only for your role."}</div><section class="panel"><div class="attendance-controls"><div class="field"><label for="attendance-date">Date</label><input id="attendance-date" type="date" value="${date}" max="${date}"></div><div class="field"><label for="attendance-class">Study level</label><select id="attendance-class"><option>All levels</option>${studyLevels.map(level => `<option>${escapeHTML(level)}</option>`).join("")}</select></div>${canEditAttendance ? `<button class="btn" data-action="save-attendance">Save attendance</button>` : ""}</div><div class="table-wrap"><table class="table"><thead><tr><th>Student</th><th>Study level</th><th>Attendance</th></tr></thead><tbody id="attendance-rows">${rows}</tbody></table></div></section>`;
      document.getElementById("attendance-class").value = selectedClass;
      document.getElementById("attendance-class").addEventListener("change", updateAttendanceClass);
      document.getElementById("attendance-date").addEventListener("change", async event => {
        const dateValue = event.target.value;
        try {
          await loadAttendanceForDate(dateValue);
          document.querySelectorAll("#attendance-rows tr").forEach(row => {
            const selected = attendanceRecords.get(`${dateValue}|${row.dataset.studentId}`) || "Present";
            const radio = row.querySelector(`input[value="${selected}"]`);
            if (radio) radio.checked = true;
          });
        } catch (error) {
          console.error("Could not load attendance for the selected date.", error);
          showToast(error.message);
        }
      });
      updateAttendanceClass();
      loadAttendanceForDate(date).then(records => {
        if (currentPage !== "Take Attendance" && currentPage !== "Daily Attendance") return;
        records.forEach(record => {
          const radio = document.querySelector(`#attendance-rows tr[data-student-id="${CSS.escape(record.id)}"] input[value="${CSS.escape(record.status)}"]`);
          if (radio) radio.checked = true;
        });
      }).catch(error => {
        console.error("Could not load attendance for today.", error);
        showToast(error.message);
      });
    }

    function getQrLibrary() {
      if (window.QRCode) return Promise.resolve(window.QRCode);
      return Promise.reject(new Error("The QR code library is not available."));
    }

    async function renderQrAttendance() {
      content.innerHTML = pageHeader("QR Attendance", "Generate attendance QR codes for each student in the school directory.") +
        `<section class="panel"><div class="panel-head"><div><h2>Student attendance QR codes</h2><p>Scan each QR code to identify a student in an attendance session.</p></div></div><div id="qr-attendance-grid" class="qr-grid"></div></section>`;

      const container = document.getElementById("qr-attendance-grid");
      if (!container) return;

      try {
        const QRCode = await getQrLibrary();
        container.innerHTML = students.map(student => `
          <div class="qr-card">
            <div class="qr-box" id="qr-${escapeHTML(student.id)}"></div>
            <div class="qr-meta">
              <strong>${escapeHTML(student.nameEnglish || student.name || student.nameKhmer)}</strong>
              ${student.nameKhmer ? `<small>${escapeHTML(student.nameKhmer)}</small>` : ""}
              <small>${escapeHTML(student.id)} · ${escapeHTML(student.className)}</small>
            </div>
          </div>
        `).join("");

        for (const student of students) {
          const target = document.getElementById(`qr-${student.id}`);
          if (!target) continue;
          const payload = JSON.stringify({ type: "attendance", id: student.id, name: student.nameEnglish || student.name || student.nameKhmer, nameEnglish: student.nameEnglish || student.name || "", nameKhmer: student.nameKhmer || "", className: student.className, status: student.status || "Active" });
          QRCode.toDataURL(payload, { margin: 1, width: 170, color: { dark: "#17233c", light: "#ffffff" } })
            .then(url => {
              target.innerHTML = `<img src="${url}" alt="QR code for ${escapeHTML(student.name)}" />`;
            })
            .catch(error => {
              console.error("Could not generate QR code.", error);
              target.innerHTML = `<div class="qr-error">QR unavailable</div>`;
            });
        }
      } catch (error) {
        console.error("Could not initialize QR attendance.", error);
        container.innerHTML = `<div class="empty">QR code generation is unavailable in this browser.</div>`;
      }
    }

    function renderStudyLevels(options = {}) {
      if (options.loading) {
        renderLoadingState("Study Levels", "Create and manage the levels available in your school.", "Loading study levels...");
        return;
      }
      if (options.error) {
        renderDataErrorState("Study Levels", "Create and manage the levels available in your school.", options.message || "Could not load study levels.");
        return;
      }

      const canEdit = canManageStudyLevels();
      const rows = studyLevels.map((level, index) => `
        <tr>
          <td>${escapeHTML(String(index + 1))}</td>
          <td>${escapeHTML(level)}</td>
        </tr>
      `).join("");

      content.innerHTML = pageHeader("Study Levels", "Create and manage the levels available in your school.") + `
        <section class="panel">
          ${canEdit ? `<div class="panel-head">
            <div>
              <h2>Create study level</h2>
              <p>Add a grade or academic level for your programs.</p>
            </div>
          </div>
          <form id="study-level-form" class="attendance-controls" style="margin-bottom: 16px;">
            <div class="field" style="flex: 1; min-width: 220px;">
              <label for="study-level-name">Level name</label>
              <input id="study-level-name" name="studyLevel" type="text" maxlength="80" placeholder="e.g. បរិញ្ញាបត្របច្ចេកទេស" required>
            </div>
            <button type="submit" class="btn">Create level</button>
          </form>` : ""}
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr><th>#</th><th>Study level</th></tr>
              </thead>
              <tbody>${rows || `<tr><td colspan="2"><div class="empty">No study levels yet.</div></td></tr>`}</tbody>
            </table>
          </div>
        </section>`;
    }

    function renderNoPermission(page) {
      content.innerHTML = pageHeader(page, currentLanguage === "km" ? "អ្នកមិនមានសិទ្ធិចូលប្រើទំព័រនេះទេ។" : "You do not have permission to access this page.") +
        `<section class="panel"><div class="empty">${currentLanguage === "km" ? "សូមទាក់ទងអ្នកគ្រប់គ្រង ប្រសិនបើអ្នកគិតថានេះជាកំហុស។" : "Contact an administrator if you believe this is an error."}</div></section>`;
    }

    async function renderUsers(options = {}) {
      if (!hasPagePermission("User Management")) {
        renderNoPermission("User Management");
        return;
      }
      if (options.loading) {
        renderLoadingState("User Management", "Create accounts and manage access to the school system.", "Loading users...");
        return;
      }

      renderLoadingState("User Management", "Create accounts and manage access to the school system.", "Loading users...");
      try {
        const data = await apiRequest("/api/users");
        const roleOptions = Object.entries(roleNames).map(([role, names]) =>
          `<option value="${role}">${escapeHTML(names[currentLanguage])}</option>`
        ).join("");
        const guardianStudentOptions = data.students.map(student =>
          `<option value="${escapeHTML(student.id)}">${escapeHTML(student.id)} · ${escapeHTML(student.name || "")} · ${escapeHTML(student.className)}</option>`
        ).join("");
        const rows = data.users.map(user => `<tr>
          <td>${escapeHTML(user.username)}</td>
          <td>${escapeHTML(user.fullName)}</td>
          <td>${escapeHTML(roleLabel(user.role))}</td>
          <td>${escapeHTML(user.department || user.studentId || user.teacherId || user.guardianStudentIds?.join(", ") || "—")}</td>
          <td><span class="badge ${user.isActive ? "active" : "pending"}">${user.isActive ? "Active" : "Inactive"}</span></td>
          <td>${user.isActive ? `<form class="user-reset-form" data-user-id="${escapeHTML(user.id)}">
            <input name="password" type="password" minlength="12" maxlength="1024" autocomplete="new-password" placeholder="New password (12+)" required>
            <button class="btn secondary" type="submit">Reset password</button>
          </form><button class="btn secondary" type="button" data-action="deactivate-user" data-user-id="${escapeHTML(user.id)}" ${user.id === currentUser.id ? "disabled" : ""}>Deactivate</button>` : "—"}</td>
        </tr>`).join("");

        content.innerHTML = pageHeader(uiLabel("User Management", "គ្រប់គ្រងអ្នកប្រើប្រាស់"), uiLabel("Create accounts, assign roles, and deactivate or reset accounts.", "បង្កើតគណនី កំណត់តួនាទី បិទគណនី ឬកំណត់ពាក្យសម្ងាត់ឡើងវិញ។")) +
          `<section class="panel"><div class="panel-head"><div><h2>${uiLabel("Create user", "បង្កើតអ្នកប្រើប្រាស់")}</h2><p>${uiLabel("Passwords are hashed on the server and never returned to the browser.", "ពាក្យសម្ងាត់ត្រូវបានអ៊ិនគ្រីបនៅលើម៉ាស៊ីនមេ ហើយមិនត្រូវបានបញ្ជូនមកកម្មវិធីរុករកទេ។")}</p></div></div>
            <form id="user-create-form">
              <div class="form-grid">
                <div class="field"><label for="new-user-username">${uiLabel("Username", "ឈ្មោះអ្នកប្រើ")}</label><input id="new-user-username" name="username" required maxlength="120" pattern="[A-Za-z0-9._-]+" autocomplete="off"></div>
                <div class="field"><label for="new-user-name">${uiLabel("Full name", "ឈ្មោះពេញ")}</label><input id="new-user-name" name="fullName" required maxlength="160"></div>
                <div class="field"><label for="new-user-role">${uiLabel("Role", "តួនាទី")}</label><select id="new-user-role" name="role" required><option value="">${uiLabel("Select role", "ជ្រើសរើសតួនាទី")}</option>${roleOptions}</select></div>
                <div class="field user-link-field" data-link="department"><label for="new-user-department">${uiLabel("Department", "ដេប៉ាតឺម៉ង់")}</label><input id="new-user-department" name="department" maxlength="120"></div>
                <div class="field user-link-field" data-link="guardian"><label for="new-user-children">${uiLabel("Guardian's children", "កូនរបស់អាណាព្យាបាល")}</label><select id="new-user-children" name="guardianStudentIds" multiple size="4">${guardianStudentOptions}</select></div>
                <div class="field"><label for="new-user-password">${uiLabel("Initial password (12+ characters)", "ពាក្យសម្ងាត់ដំបូង (យ៉ាងតិច ១២ តួអក្សរ)")}</label><input id="new-user-password" name="password" type="password" minlength="12" maxlength="1024" autocomplete="new-password" required></div>
              </div>
              <p id="user-role-link-notice" class="notice" hidden></p>
              <div class="telegram-form-actions"><button id="create-user-submit" type="submit" class="btn">${uiLabel("Create user", "បង្កើតអ្នកប្រើប្រាស់")}</button></div>
            </form>
          </section>
          <section class="panel" style="margin-top:16px"><div class="panel-head"><div><h2>${uiLabel("Accounts", "គណនី")}</h2><p>${data.users.length} ${uiLabel("user account(s)", "គណនីអ្នកប្រើ")}</p></div></div>
            <div class="table-wrap"><table class="table"><thead><tr><th>${uiLabel("Username", "ឈ្មោះអ្នកប្រើ")}</th><th>${uiLabel("Full name", "ឈ្មោះពេញ")}</th><th>${uiLabel("Role", "តួនាទី")}</th><th>${uiLabel("Department / link", "ដេប៉ាតឺម៉ង់ / តំណភ្ជាប់")}</th><th>${uiLabel("Status", "ស្ថានភាព")}</th><th>${uiLabel("Actions", "សកម្មភាព")}</th></tr></thead>
            <tbody>${rows || `<tr><td colspan="6"><div class="empty">No user accounts have been created yet.</div></td></tr>`}</tbody></table></div>
          </section>`;
        const roleSelect = document.getElementById("new-user-role");
        const updateRoleFields = () => {
          const role = roleSelect.value;
          document.querySelectorAll(".user-link-field").forEach(field => {
            const link = field.dataset.link;
            field.hidden = link === "department" ? !["dept_head", "dept_deputy"].includes(role)
              : role !== "guardian";
          });
          const requiresRemovedLink = ["student", "teacher"].includes(role);
          const notice = document.getElementById("user-role-link-notice");
          notice.hidden = !requiresRemovedLink;
          notice.textContent = currentLanguage === "km"
            ? "ការបង្កើតគណនីសិស្ស និងគ្រូមិនអាចធ្វើបាននៅទីនេះទេ ព្រោះត្រូវការតំណភ្ជាប់ទៅកំណត់ត្រាសិស្ស ឬគ្រូ។"
            : "Student and teacher accounts require a link to a student or teacher record. Creation for these roles is unavailable in this form.";
          document.getElementById("create-user-submit").disabled = requiresRemovedLink;
        };
        roleSelect.addEventListener("change", updateRoleFields);
        updateRoleFields();
      } catch (error) {
        console.error("Could not load user management page.", error);
        renderDataErrorState("User Management", "Create accounts and manage access to the school system.", error.message);
      }
    }

    function renderMyAccount() {
      if (!hasPagePermission("My Account")) {
        renderNoPermission("My Account");
        return;
      }
      content.innerHTML = pageHeader(
        currentLanguage === "km" ? "គណនីរបស់ខ្ញុំ" : "My Account",
        currentLanguage === "km" ? "ប្តូរពាក្យសម្ងាត់របស់អ្នក។" : "Change your account password.",
      ) + `<section class="panel"><div class="panel-head"><div><h2>${currentLanguage === "km" ? "ប្តូរពាក្យសម្ងាត់" : "Change password"}</h2><p>${currentLanguage === "km" ? "ប្រើពាក្យសម្ងាត់ថ្មីដែលមានយ៉ាងតិច ១២ តួអក្សរ។" : "Choose a new password with at least 12 characters."}</p></div></div>
        <form id="change-password-form" class="form-grid">
          <div class="field"><label for="current-password">${currentLanguage === "km" ? "ពាក្យសម្ងាត់បច្ចុប្បន្ន" : "Current password"}</label><input id="current-password" name="currentPassword" type="password" autocomplete="current-password" required maxlength="1024"></div>
          <div class="field"><label for="new-password">${currentLanguage === "km" ? "ពាក្យសម្ងាត់ថ្មី" : "New password"}</label><input id="new-password" name="newPassword" type="password" autocomplete="new-password" minlength="12" required maxlength="1024"></div>
          <div class="field"><label for="confirm-password">${currentLanguage === "km" ? "បញ្ជាក់ពាក្យសម្ងាត់ថ្មី" : "Confirm new password"}</label><input id="confirm-password" name="confirmPassword" type="password" autocomplete="new-password" minlength="12" required maxlength="1024"></div>
          <div class="telegram-form-actions"><button type="submit" class="btn">${currentLanguage === "km" ? "រក្សាទុកពាក្យសម្ងាត់" : "Update password"}</button></div>
        </form></section>`;
    }

    function renderModule(title) {
      const info = {
        "Student Results": ["▤", "Review grades, academic progress, and student performance."],
        "Classes": ["▤", "Browse Vocational, Associate Degree, and Bachelor Degree programs."],
        "Books": ["▣", "Manage books, borrowing, returns, and library availability."],
        "Parent List": ["♧", "Keep family contact details and student relationships up to date."],
        "School Fees": ["$", "Manage tuition schedules, balances, and payment records."],
        "Student Payments": ["$", "Review student payments and issue receipts."],
        "Exam Schedule": ["▦", "Organize upcoming assessments and examination dates."],
        "Announcements": ["◉", "Share important school news with families and staff."]
      };
      const [icon, description] = info[title] || ["▱", `Manage ${title.toLowerCase()} and keep school information up to date.`];
      const canCreateResource = ["director", "deputy_director"].includes(currentUser?.role) ||
        (title === "Student Results" && currentUser?.role === "teacher");
      const cards = [
        ["View records", `Browse and search your ${title.toLowerCase()} records.`, "▤"],
        ...(canCreateResource ? [["Add new", `Create a new ${title.toLowerCase()} record.`, "＋"]] : []),
        ["Reports", `Review and export ${title.toLowerCase()} summaries.`, "▥"]
      ];
      content.innerHTML = pageHeader(title, description) +
        `<div class="feature-grid">${cards.map(([heading, text, cardIcon]) => `<article class="feature-card"><div class="feature-icon">${cardIcon || icon}</div><h3>${escapeHTML(heading)}</h3><p>${escapeHTML(text)}</p><button class="btn secondary" data-action="notify">${escapeHTML(heading)} →</button></article>`).join("")}</div>`;
    }

    function renderTelegram(page = "Bot Settings") {
      const descriptions = {
        "Bot Settings": "Connect your school bot using a secure server-side integration.",
        "Notification Rules": "Choose which school updates your Telegram service should send.",
        "Parent Chat Links": "Link parent chats through a verified bot pairing flow.",
        "Message Log": "Review delivery activity once a Telegram backend is connected."
      };
      let body = "";
      if (page === "Bot Settings") {
        body = `
          <div class="telegram-hero">
            <div class="telegram-logo" aria-hidden="true">➤</div>
            <div><h2>Telegram Bot Integration</h2><p>School updates, delivered to the right people at the right time.</p></div>
            <span class="connection-badge">Backend not connected</span>
          </div>
          <div class="telegram-layout" style="margin-top:16px">
            <div class="telegram-stack">
              <section class="panel">
                <div class="panel-head"><div><h2>Bot identity</h2><p>Save the public username for your school bot.</p></div></div>
                <form id="telegram-bot-form">
                  <div class="field"><label for="telegram-username">Telegram bot username</label><div class="bot-username"><span>@</span><input id="telegram-username" name="username" value="${escapeHTML(telegramConfig.botUsername)}" maxlength="32" pattern="[A-Za-z][A-Za-z0-9_]{4,31}" placeholder="YourSchoolBot" autocomplete="off"></div></div>
                  <div class="telegram-form-actions"><button type="submit" class="btn">Save bot username</button><a class="btn secondary" href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer">Open BotFather ↗</a></div>
                </form>
              </section>
              <section class="panel">
                <div class="panel-head"><div><h2>Connect your server</h2><p>Keep bot credentials private and send messages from a backend.</p></div></div>
                <ol class="telegram-steps">
                  <li><span class="step-number">1</span><span><strong>Create a Telegram bot</strong>Use BotFather in Telegram to create a bot and choose its public username.</span></li>
                  <li><span class="step-number">2</span><span><strong>Store the token on your server</strong>Set <code>TELEGRAM_BOT_TOKEN</code> in server environment secrets. Never put the token in this HTML or browser storage.</span></li>
                  <li><span class="step-number">3</span><span><strong>Connect a protected API</strong>Have your backend validate requests, link parent chat IDs, and call the Telegram Bot API.</span></li>
                </ol>
                <div class="telegram-notice" style="margin-top:16px"><strong>Front-end preview:</strong> This static project does not connect to Telegram or send messages. A secure server endpoint is required for live delivery.</div>
                <div class="telegram-form-actions"><button type="button" class="btn secondary" data-action="test-telegram">Send test message</button></div>
              </section>
            </div>
            <section class="panel">
              <div class="panel-head"><div><h2>Integration checklist</h2><p>Complete these steps before going live.</p></div></div>
              <div class="telegram-toggle-list">
                <div class="telegram-toggle"><span><strong>Bot username saved</strong><small>${telegramConfig.botUsername ? `@${escapeHTML(telegramConfig.botUsername)}` : "Add your bot's public username above."}</small></span><span class="badge ${telegramConfig.botUsername ? "active" : "pending"}">${telegramConfig.botUsername ? "Ready" : "Not set"}</span></div>
                <div class="telegram-toggle"><span><strong>Server credentials</strong><small>Configure the token in a private server environment.</small></span><span class="badge pending">Required</span></div>
                <div class="telegram-toggle"><span><strong>Parent chat linking</strong><small>Verify and store chat IDs on the server.</small></span><span class="badge pending">Required</span></div>
              </div>
              <button type="button" class="text-link" data-page="Parent Chat Links">How parents connect →</button>
            </section>
          </div>`;
      } else if (page === "Notification Rules") {
        const rules = [
          ["attendance", "Attendance summaries", "Send daily class attendance summaries."],
          ["absence", "Absence and late alerts", "Notify linked parents when a student is absent or late."],
          ["payments", "Payment confirmations", "Send tuition payment receipts and reminders."],
          ["announcements", "School announcements", "Share important news and event updates."]
        ];
        body = `<form id="telegram-rules-form"><section class="panel"><div class="panel-head"><div><h2>Parent notification preferences</h2><p>These preferences are saved in this browser preview; server delivery needs a backend.</p></div></div><div class="telegram-toggle-list">${rules.map(([key, label, hint]) => `<div class="telegram-toggle"><span><strong>${label}</strong><small>${hint}</small></span><label class="switch" aria-label="${label}"><input type="checkbox" name="${key}" data-telegram-pref="${key}" ${telegramConfig.notifications[key] ? "checked" : ""}><span class="switch-track"></span></label></div>`).join("")}</div><div class="telegram-form-actions"><button class="btn" type="submit">Save notification rules</button></div></section><div class="telegram-notice" style="margin-top:15px"><strong>Privacy:</strong> Rules only affect this front-end preview until a backend is connected. Do not use browser code to store a bot token.</div></form>`;
      } else if (page === "Parent Chat Links") {
        const botHandle = telegramConfig.botUsername ? `@${escapeHTML(telegramConfig.botUsername)}` : "your school bot";
        body = `<div class="telegram-layout">
          <section class="panel">
            <div class="panel-head"><div><h2>Parent chat linking</h2><p>Chat IDs must be collected and verified by your server.</p></div><span class="badge pending">Backend required</span></div>
            <div class="telegram-empty"><div class="telegram-empty-icon">♧</div><strong>No live parent links yet</strong><span>This preview is not connected to a bot, so it cannot read Telegram chats or securely register parent IDs.</span></div>
            <div class="telegram-notice"><strong>Do not ask parents to share passwords or bot tokens.</strong> A parent can start a bot chat; your backend should verify the parent using a one-time school-issued code.</div>
          </section>
          <section class="panel">
            <div class="panel-head"><div><h2>Parent setup instructions</h2><p>Share these steps after you create your bot.</p></div></div>
            <ol class="telegram-steps">
              <li><span class="step-number">1</span><span><strong>Open the school bot</strong>Ask the parent to search for ${botHandle} in Telegram.</span></li>
              <li><span class="step-number">2</span><span><strong>Tap Start</strong>The bot should direct the parent to request a secure linking code from the school.</span></li>
              <li><span class="step-number">3</span><span><strong>Verify the code</strong>Your backend validates the one-time code and associates the returned chat ID with the correct student.</span></li>
            </ol>
            <div class="telegram-form-actions"><button type="button" class="btn secondary" data-action="copy-parent-instructions">Copy instructions</button><button type="button" class="btn" data-action="test-telegram">Test bot connection</button></div>
          </section>
        </div>`;
      } else {
        body = `<section class="panel"><div class="panel-head"><div><h2>Recent message activity</h2><p>Delivery status will appear here when a backend is connected.</p></div></div><div class="telegram-empty"><div class="telegram-empty-icon">▤</div><strong>No Telegram messages recorded</strong><span>This demo does not send or log messages. Connect a protected server endpoint to record delivery results and errors.</span></div></section>`;
      }
      content.innerHTML = pageHeader(page, descriptions[page] || descriptions["Bot Settings"]) + body;
    }

    async function renderNotificationFeature(page) {
      const title = page;
      content.innerHTML = pageHeader(title, "Manage school notifications securely.") +
        `<section class="panel"><div class="empty">Loading ${escapeHTML(title.toLowerCase())}...</div></section>`;
      try {
        if (page === "Guardian Notifications") {
          const data = await apiRequest("/api/me/notification-preferences");
          content.innerHTML = pageHeader(title, "Choose which attendance updates your family receives.") +
            `<section class="panel"><div class="panel-head"><div><h2>Telegram connection</h2><p>${data.telegram_connected ? "Connected" : "Not connected"}</p></div><button class="btn ${data.telegram_connected ? "secondary" : ""}" data-action="${data.telegram_connected ? "disconnect-telegram" : "connect-telegram"}">${data.telegram_connected ? "Disconnect Telegram" : "Connect Telegram"}</button></div>
            <div class="telegram-toggle-list">${data.students.map(student => `<div class="telegram-toggle"><span><strong>${escapeHTML(student.name || student.student_id)}</strong><small>${escapeHTML(student.student_id)}</small></span><span class="preference-actions"><label><input type="checkbox" data-action="guardian-preference" data-student-id="${escapeAttribute(student.student_id)}" data-preference="notify_scan" ${student.notify_scan ? "checked" : ""}> Present / late</label><label><input type="checkbox" data-action="guardian-preference" data-student-id="${escapeAttribute(student.student_id)}" data-preference="notify_absent" ${student.notify_absent ? "checked" : ""}> Absent / corrections</label></span></div>`).join("") || `<div class="empty">No linked children were found.</div>`}</div>
            <div class="telegram-notice" style="margin-top:16px"><strong>Privacy:</strong> Messages include only your child's name and relevant class, subject, attendance status, time or date. They never include phone numbers, notes, or information about other children.</div></section>`;
          return;
        }
        if (page === "Room QR Cards") {
          const result = await apiRequest("/api/admin/rooms/qr");
          content.innerHTML = pageHeader(title, "Print or replace classroom QR cards. Replacing a token invalidates the old card.") +
            `<section class="panel"><div class="panel-head"><div><h2>Classroom QR cards</h2><p>Only authorized office and director accounts can view room tokens.</p></div><button class="btn secondary" data-action="print-room-cards">Print all rooms</button></div><div id="room-qr-grid" class="qr-grid">${result.rooms.map(room => `<article class="qr-card"><div class="qr-box" id="room-qr-${escapeAttribute(room.id)}"></div><div class="qr-meta"><strong>${escapeHTML(room.name)}</strong><button class="btn secondary" data-action="regenerate-room-qr" data-room-id="${escapeAttribute(room.id)}">Regenerate QR</button></div></article>`).join("") || `<div class="empty">No rooms are configured.</div>`}</div></section>`;
          const QRCode = await getQrLibrary();
          for (const room of result.rooms) {
            const target = document.getElementById(`room-qr-${room.id}`);
            if (target) {
              const image = document.createElement("img");
              image.alt = `QR code for ${room.name}`;
              image.src = await QRCode.toDataURL(room.qr_token, { margin: 1, width: 170 });
              target.append(image);
            }
          }
          return;
        }
        if (page === "Needs Review") {
          const result = await apiRequest("/api/admin/sessions/review");
          const teacherOptions = teachers.map(teacher => `<option value="${escapeAttribute(teacher.id)}">${escapeHTML(teacher.nameEnglish || teacher.nameKhmer || teacher.name || teacher.id)}</option>`).join("");
          content.innerHTML = pageHeader(title, "Resolve sessions that ended without a teacher check-in.") +
            `<section class="panel"><div class="panel-head"><div><h2>Sessions needing review</h2><p>Assign a substitute or cancel the session. Students are not marked absent automatically.</p></div></div>${result.sessions.length ? result.sessions.map(session => `<article class="review-card"><div><strong>${escapeHTML(session.class_name)} · ${escapeHTML(session.subject_name || "Class session")}</strong><small>${escapeHTML(session.session_date)} · ${escapeHTML(String(session.start_time).slice(0, 5))}-${escapeHTML(String(session.end_time).slice(0, 5))} · ${escapeHTML(session.teacher_name || "Unassigned teacher")}</small></div><div class="inline-form"><select data-substitute-select="${escapeAttribute(session.session_id)}"><option value="">Select substitute teacher</option>${teacherOptions}</select><button class="btn" data-action="assign-substitute" data-session-id="${escapeAttribute(session.session_id)}">Assign</button><button class="btn secondary" data-action="cancel-session" data-session-id="${escapeAttribute(session.session_id)}">Cancel session</button></div><div class="inline-form"><input data-checkin-note="${escapeAttribute(session.session_id)}" maxlength="500" placeholder="Required note for office check-in"><button class="btn secondary" data-action="office-checkin" data-session-id="${escapeAttribute(session.session_id)}">Check in for teacher</button></div></article>`).join("") : `<div class="empty">No sessions need review.</div>`}</section>`;
          return;
        }
        if (page === "Notification Rules") {
          const result = await apiRequest("/api/admin/notification-rules");
          const eventTypes = ["teacher_late", "teacher_late_2", "session_unresolved"];
          const rules = result.rules || [];
          content.innerHTML = pageHeader(title, "Choose which staff roles receive teacher and unresolved-session alerts.") +
            `<form id="notification-rules-form"><section class="panel"><div class="telegram-toggle-list">${eventTypes.map(eventType => `<div class="rule-group"><h3>${escapeHTML(eventType.replaceAll("_", " "))}</h3>${result.roles.map(role => { const row = rules.find(rule => rule.event_type === eventType && rule.role === role); return `<label class="telegram-toggle"><span>${escapeHTML(role.replaceAll("_", " "))}</span><input type="checkbox" name="${escapeAttribute(eventType)}:${escapeAttribute(role)}" ${row?.is_enabled ? "checked" : ""}></label>`; }).join("")}</div>`).join("")}</div><div class="telegram-form-actions"><button type="submit" class="btn">Save notification rules</button></div></section></form>`;
          return;
        }
        if (page === "Parent Chat Links") {
          const result = await apiRequest("/api/admin/guardians");
          content.innerHTML = pageHeader(title, "Generate a single-use Telegram start link for a guardian.") +
            `<section class="panel"><div class="field"><label for="guardian-link-user">Guardian account</label><select id="guardian-link-user"><option value="">Select guardian</option>${result.guardians.map(guardian => `<option value="${escapeAttribute(guardian.id)}">${escapeHTML(guardian.full_name)}</option>`).join("")}</select></div><button class="btn" data-action="generate-guardian-link">Generate 30-minute link</button><p id="guardian-link-result" class="page-subtitle" aria-live="polite"></p><div class="telegram-notice"><strong>Privacy:</strong> The link is single-use and expires after 30 minutes. It is shown only here and is not saved in browser storage.</div></section>`;
          return;
        }
        if (page === "Message Log") {
          const result = await apiRequest("/api/admin/notifications?channel=telegram");
          content.innerHTML = pageHeader(title, "Review Telegram delivery status and retry failed messages.") +
            `<section class="panel"><div class="table-wrap"><table class="table"><thead><tr><th>Event</th><th>Message</th><th>Status</th><th>Attempts</th><th>Action</th></tr></thead><tbody>${result.notifications.map(item => `<tr><td>${escapeHTML(item.event_type)}</td><td>${escapeHTML(item.body)}</td><td>${escapeHTML(item.status)}</td><td>${item.attempts}</td><td>${item.status === "failed" && item.channel === "telegram" ? `<button class="btn secondary" data-action="resend-notification" data-notification-id="${escapeAttribute(item.id)}">Resend</button>` : "—"}</td></tr>`).join("") || `<tr><td colspan="5">No messages have been recorded.</td></tr>`}</tbody></table></div></section>`;
          return;
        }
      } catch (error) {
        content.innerHTML = pageHeader(title, "Manage school notifications securely.") +
          `<section class="panel"><div class="empty error-state">${escapeHTML(error.message)}<button class="btn secondary" data-action="retry-current-page">Retry</button></div></section>`;
      }
    }

    const timetableKhmerTranslations = {
      "Classes": "ថ្នាក់រៀន",
      "Class timetable": "កាលវិភាគថ្នាក់រៀន",
      "Terms & shifts": "ឆមាស និងវេនសិក្សា",
      "My timetable": "កាលវិភាគរបស់ខ្ញុំ",
      "Session attendance": "វត្តមានតាមម៉ោងសិក្សា",
      "My attendance": "វត្តមានរបស់ខ្ញុំ",
      "Attendance reports": "របាយការណ៍វត្តមាន",
      "Manage classes, assigned teachers, and student enrollment.": "គ្រប់គ្រងថ្នាក់ គ្រូបង្រៀន និងការចុះឈ្មោះសិស្ស។",
      "Review weekly class periods and generate sessions for a term.": "មើលកាលវិភាគប្រចាំសប្តាហ៍ និងបង្កើតម៉ោងសិក្សាសម្រាប់ឆមាស។",
      "Manage academic terms and review the fixed 90-minute shift periods.": "គ្រប់គ្រងឆមាសសិក្សា និងពិនិត្យម៉ោងសិក្សា ៩០ នាទីតាមវេន។",
      "View your authorized weekly timetable and today's generated sessions.": "មើលកាលវិភាគប្រចាំសប្តាហ៍ និងម៉ោងសិក្សាថ្ងៃនេះដែលអ្នកមានសិទ្ធិ។",
      "Select a class session to review or record the complete enrolled roster.": "ជ្រើសរើសម៉ោងសិក្សា ដើម្បីពិនិត្យ ឬកត់វត្តមានសិស្សទាំងអស់។",
      "Review session attendance for your account or linked children.": "ពិនិត្យវត្តមានរបស់អ្នក ឬកូនដែលបានភ្ជាប់។",
      "Review attendance counts and percentages by class for a selected period.": "ពិនិត្យចំនួន និងភាគរយវត្តមានតាមថ្នាក់ និងរយៈពេល។",
      "Create a class": "បង្កើតថ្នាក់",
      "A shift is required for the class timetable.": "ត្រូវជ្រើសរើសវេនសិក្សាសម្រាប់កាលវិភាគថ្នាក់។",
      "Class name": "ឈ្មោះថ្នាក់",
      "Academic year": "ឆ្នាំសិក្សា",
      "Study level": "កម្រិតសិក្សា",
      "Shift": "វេនសិក្សា",
      "Create class": "បង្កើតថ្នាក់",
      "Class list": "បញ្ជីថ្នាក់",
      "Open timetable": "បើកកាលវិភាគ",
      "No classes are available for your account.": "មិនមានថ្នាក់សម្រាប់គណនីរបស់អ្នកទេ។",
      "Edit": "កែប្រែ",
      "Teachers & students": "គ្រូ និងសិស្ស",
      "Delete": "លុប",
      "Class membership": "សមាជិកក្នុងថ្នាក់",
      "Assign teachers and enroll or remove students.": "ចាត់តាំងគ្រូ និងបន្ថែម ឬដកសិស្សចេញ។",
      "Assigned teachers": "គ្រូដែលបានចាត់តាំង",
      "Enrolled students": "សិស្សដែលបានចុះឈ្មោះ",
      "Assign": "ចាត់តាំង",
      "Enroll": "ចុះឈ្មោះ",
      "Remove": "ដកចេញ",
      "No teachers assigned.": "មិនទាន់មានគ្រូចាត់តាំងទេ។",
      "No students enrolled.": "មិនទាន់មានសិស្សចុះឈ្មោះទេ។",
      "Create academic term": "បង្កើតឆមាសសិក្សា",
      "Terms in the same academic year cannot overlap.": "ឆមាសក្នុងឆ្នាំសិក្សាដូចគ្នាមិនអាចត្រួតគ្នាបានទេ។",
      "Term number": "លេខឆមាស",
      "Term name": "ឈ្មោះឆមាស",
      "Start date": "ថ្ងៃចាប់ផ្តើម",
      "End date": "ថ្ងៃបញ្ចប់",
      "Create term": "បង្កើតឆមាស",
      "Academic terms": "ឆមាសសិក្សា",
      "Set one term as current for schedules.": "កំណត់ឆមាសបច្ចុប្បន្នសម្រាប់កាលវិភាគ។",
      "Current": "បច្ចុប្បន្ន",
      "Set current": "កំណត់ជាបច្ចុប្បន្ន",
      "Shifts and periods": "វេន និងម៉ោងសិក្សា",
      "Each displayed period is exactly 90 minutes.": "ម៉ោងសិក្សានីមួយៗមានរយៈពេល ៩០ នាទី។",
      "Weekday": "ថ្ងៃក្នុងសប្តាហ៍",
      "Period": "ម៉ោងសិក្សា",
      "Period number": "លេខម៉ោងសិក្សា",
      "Start time": "ម៉ោងចាប់ផ្តើម",
      "End time": "ម៉ោងបញ្ចប់",
      "Add period": "បន្ថែមម៉ោងសិក្សា",
      "Term": "ឆមាស",
      "Weekly schedule": "កាលវិភាគប្រចាំសប្តាហ៍",
      "Today's sessions": "ម៉ោងសិក្សាថ្ងៃនេះ",
      "No timetable slots are configured for this term.": "មិនទាន់មានម៉ោងក្នុងកាលវិភាគសម្រាប់ឆមាសនេះទេ។",
      "Preview & generate sessions": "មើលជាមុន និងបង្កើតម៉ោងសិក្សា",
      "Save timetable slot": "រក្សាទុកម៉ោងកាលវិភាគ",
      "No generated sessions are scheduled for today.": "ថ្ងៃនេះមិនមានម៉ោងសិក្សាដែលបានបង្កើតទេ។",
      "Attendance": "វត្តមាន",
      "From": "ចាប់ពី",
      "To": "ដល់",
      "Group by": "ដាក់ជាក្រុមតាម",
      "Load report": "បង្ហាញរបាយការណ៍",
      "Export CSV": "នាំចេញ CSV",
      "Present": "មានវត្តមាន",
      "Absent": "អវត្តមាន",
      "Late": "មកយឺត",
      "Excused": "មានការអនុញ្ញាត",
      "Attendance %": "ភាគរយវត្តមាន",
      "No attendance data was found for this range.": "មិនមានទិន្នន័យវត្តមានក្នុងរយៈពេលនេះទេ។",
      "Date": "កាលបរិច្ឆេទ",
      "Session": "ម៉ោងសិក្សា",
      "All authorized classes": "គ្រប់ថ្នាក់ដែលមានសិទ្ធិ",
      "Select a session": "ជ្រើសរើសម៉ោងសិក្សា",
      "Choose a class session.": "សូមជ្រើសរើសម៉ោងសិក្សា។",
      "No sessions are scheduled for this date.": "មិនមានម៉ោងសិក្សាតាមកាលវិភាគនៅថ្ងៃនេះទេ។",
      "Mark all present": "កំណត់ទាំងអស់ថាមានវត្តមាន",
      "Save attendance": "រក្សាទុកវត្តមាន",
      "Close session / mark remaining absent": "បិទម៉ោងសិក្សា / កំណត់អ្នកនៅសល់ថាអវត្តមាន",
      "Student": "សិស្ស",
      "Status": "ស្ថានភាព",
      "Not recorded": "មិនទាន់កត់ត្រា",
      "No students are enrolled in this class.": "មិនមានសិស្សចុះឈ្មោះក្នុងថ្នាក់នេះទេ។",
      "Scan QR code or enter student ID": "ស្កេន QR ឬបញ្ចូលលេខសម្គាល់សិស្ស",
      "Record scan": "កត់ត្រាការស្កេន",
      "Use camera": "ប្រើកាមេរ៉ា",
      "Month": "ខែ",
      "Session history": "ប្រវត្តិវត្តមានតាមម៉ោងសិក្សា",
      "No session attendance was found for this month.": "មិនមានទិន្នន័យវត្តមានក្នុងខែនេះទេ។",
      "Monday": "ថ្ងៃចន្ទ",
      "Tuesday": "ថ្ងៃអង្គារ",
      "Wednesday": "ថ្ងៃពុធ",
      "Thursday": "ថ្ងៃព្រហស្បតិ៍",
      "Friday": "ថ្ងៃសុក្រ",
      "Saturday": "ថ្ងៃសៅរ៍",
      "Sunday": "ថ្ងៃអាទិត្យ",
      "Class": "ថ្នាក់",
      "Actions": "សកម្មភាព",
      "Name": "ឈ្មោះ",
      "Dates": "កាលបរិច្ឆេទ",
      "Attendance percentage": "ភាគរយវត្តមាន",
      "Room (optional)": "បន្ទប់ (មិនចាំបាច់)",
      "Teacher": "គ្រូបង្រៀន",
      "Subject": "មុខវិជ្ជា",
      "Time": "ម៉ោង",
      "present": "មានវត្តមាន",
      "absent": "អវត្តមាន",
      "late": "មកយឺត",
      "excused": "មានការអនុញ្ញាត",
      "session records": "កំណត់ត្រាម៉ោងសិក្សា",
      "present or late": "មានវត្តមាន ឬមកយឺត",
      "No academic term is configured.": "មិនទាន់កំណត់ឆមាសសិក្សាទេ។",
      "Loading classes and timetable data...": "កំពុងផ្ទុកថ្នាក់ និងកាលវិភាគ...",
      "Loading terms and shifts...": "កំពុងផ្ទុកឆមាស និងវេនសិក្សា...",
      "Loading your timetable...": "កំពុងផ្ទុកកាលវិភាគរបស់អ្នក...",
      "Loading today's class sessions...": "កំពុងផ្ទុកម៉ោងសិក្សាថ្ងៃនេះ...",
      "Loading attendance history...": "កំពុងផ្ទុកប្រវត្តិវត្តមាន...",
      "No generated sessions are available for the current term.": "មិនមានម៉ោងសិក្សាដែលបានបង្កើតសម្រាប់ឆមាសបច្ចុប្បន្នទេ។"
    };
    const timetableManagerRoles = ["director", "deputy_director", "office_head", "office_deputy", "office_staff"];
    const timetableLeadershipRoles = ["director", "deputy_director"];
    const weekdayNames = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    function isTimetableManager() {
      return timetableManagerRoles.includes(currentUser?.role);
    }

    function isTimetableLeader() {
      return timetableLeadershipRoles.includes(currentUser?.role);
    }

    function translateTimetableContent() {
      if (currentLanguage !== "km" || !content) return;
      const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const source = node.nodeValue.trim();
        if (timetableKhmerTranslations[source]) {
          node.nodeValue = node.nodeValue.replace(source, timetableKhmerTranslations[source]);
        }
        node = walker.nextNode();
      }
    }

    const timetableTranslationObserver = new MutationObserver(translateTimetableContent);
    timetableTranslationObserver.observe(content, { childList: true, characterData: true, subtree: true });

    function escapeAttribute(value) {
      return escapeHTML(value ?? "");
    }

    function dateLabel(value) {
      if (!value) return "";
      const date = new Date(`${String(value).slice(0, 10)}T12:00:00Z`);
      return Number.isNaN(date.valueOf()) ? String(value) : new Intl.DateTimeFormat(currentLanguage === "km" ? "km" : "en", { timeZone: window.APP_TIMEZONE || "Asia/Phnom_Penh" }).format(date);
    }

    function termOptions(terms, selectedId = "") {
      return terms.map(term => `<option value="${term.id}" ${String(term.id) === String(selectedId) ? "selected" : ""}>${escapeHTML(term.name)} · ${escapeHTML(term.academic_year)}${term.is_current ? " · Current" : ""}</option>`).join("");
    }

    function classOptions(classes, selectedId = "") {
      return classes.map(item => `<option value="${item.class_id}" ${String(item.class_id) === String(selectedId) ? "selected" : ""}>${escapeHTML(item.name)} · ${escapeHTML(item.academic_year)}</option>`).join("");
    }

    function renderAsyncError(title, subtitle, error) {
      content.innerHTML = pageHeader(title, subtitle) +
        `<section class="panel"><div class="empty">${escapeHTML(error.message)}<br><button class="btn secondary" type="button" data-action="retry-current-page">Retry</button></div></section>`;
    }

    async function renderClassesManager() {
      const title = currentPage === "Class Timetable" ? "Class timetable" : "Classes";
      const subtitle = currentPage === "Class Timetable"
        ? "Review weekly class periods and generate sessions for a term."
        : "Manage classes, assigned teachers, and student enrollment.";
      renderLoadingState(title, subtitle, "Loading classes and timetable data...");
      try {
        const [classData, termData, shiftData, subjectData] = await Promise.all([
          apiRequest("/api/classes"),
          apiRequest("/api/terms"),
          apiRequest("/api/shifts"),
          apiRequest("/api/subjects")
        ]);
        availableTimetableShifts = shiftData.shifts;
        if (currentPage === "Class Timetable") {
          await renderClassTimetable({ classes: classData.classes, terms: termData.terms, shifts: shiftData.shifts, subjects: subjectData.subjects });
          return;
        }
        const canManage = isTimetableManager();
        const firstClass = classData.classes[0];
        content.innerHTML = pageHeader(title, subtitle) +
          (canManage ? `<section class="panel timetable-panel"><div class="panel-head"><div><h2>Create a class</h2><p>A shift is required for the class timetable.</p></div></div>
          <form id="class-create-form" class="timetable-form"><div class="field"><label for="new-class-name">Class name</label><input id="new-class-name" name="name" maxlength="100" required></div>
          <div class="field"><label for="new-class-year">Academic year</label><input id="new-class-year" name="academic_year" maxlength="30" required></div>
          <div class="field"><label for="new-class-level">Study level</label><input id="new-class-level" name="study_level" maxlength="80"></div>
          <div class="field"><label for="new-class-shift">Shift</label><select id="new-class-shift" name="shift_id" required><option value="">Select shift</option>${shiftData.shifts.map(shift => `<option value="${shift.id}">${escapeHTML(shift.name)} (${escapeHTML(shift.code)})</option>`).join("")}</select></div>
          <button class="btn" type="submit">Create class</button></form></section>` : "") +
          `<section class="panel timetable-panel"><div class="panel-head"><div><h2>Class list</h2><p>${classData.classes.length} classes available to your account.</p></div>${hasPagePermission("Class Timetable") ? `<button class="btn secondary" type="button" data-page="Class Timetable">Open timetable</button>` : ""}</div>
          ${classData.classes.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Class</th><th>Study level</th><th>Academic year</th><th>Shift</th>${canManage ? "<th>Actions</th>" : ""}</tr></thead><tbody>${classData.classes.map(item => `<tr><td>${escapeHTML(item.name)}</td><td>${escapeHTML(item.study_level || "—")}</td><td>${escapeHTML(item.academic_year)}</td><td>${escapeHTML(item.shift_code || "—")}</td>${canManage ? `<td><button class="btn secondary small-btn" data-action="edit-class" data-class-id="${item.class_id}">Edit</button> <button class="btn secondary small-btn" data-action="manage-class" data-class-id="${item.class_id}">Teachers & students</button>${isTimetableLeader() ? ` <button class="text-link danger-link" data-action="delete-class" data-class-id="${item.class_id}">Delete</button>` : ""}</td>` : ""}</tr>`).join("")}</tbody></table></div>` : `<div class="empty">No classes are available for your account.</div>`}</section>
          ${canManage && classData.classes.length ? `<section class="panel timetable-panel" id="class-assignment-panel"><div class="panel-head"><div><h2>Class membership</h2><p>Assign teachers and enroll or remove students.</p></div></div>
            <div class="attendance-controls"><div class="field"><label for="membership-class">Class</label><select id="membership-class">${classOptions(classData.classes, firstClass?.class_id)}</select></div></div><div id="membership-details" class="empty">Choose a class to load its roster.</div></section>` : ""}`;
        const classForm = document.getElementById("class-create-form");
        if (classForm) classForm.addEventListener("submit", createClass);
        const membershipClass = document.getElementById("membership-class");
        if (membershipClass) {
          membershipClass.addEventListener("change", () => loadClassMembership(membershipClass.value));
          await loadClassMembership(membershipClass.value);
        }
      } catch (error) {
        console.error("Could not load classes for the timetable screens.", error);
        renderAsyncError(title, subtitle, error);
      }
    }

    async function createClass(event) {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      try {
        await apiRequest("/api/classes", {
          method: "POST",
          body: JSON.stringify({
            name: String(form.get("name") || "").trim(),
            academic_year: String(form.get("academic_year") || "").trim(),
            study_level: String(form.get("study_level") || "").trim() || null,
            shift_id: String(form.get("shift_id") || "")
          })
        });
        showToast("Class created.");
        await renderClassesManager();
      } catch (error) {
        showToast(error.message);
      }
    }

    async function loadClassMembership(classId) {
      const panel = document.getElementById("membership-details");
      if (!panel || !classId) return;
      panel.innerHTML = `<div class="empty">Loading class membership...</div>`;
      try {
        const [teacherData, studentData] = await Promise.all([
          apiRequest(`/api/classes/teachers?class_id=${encodeURIComponent(classId)}`),
          apiRequest(`/api/classes/students?class_id=${encodeURIComponent(classId)}`)
        ]);
        const assignedTeachers = new Set(teacherData.teachers.map(teacher => teacher.teacher_id));
        const enrolledStudents = new Set(studentData.students.map(student => student.student_id));
        panel.innerHTML = `<div class="membership-grid">
          <section><h3>Assigned teachers</h3><form id="class-teacher-form" class="inline-form"><select name="teacher_id" required><option value="">Select teacher</option>${teachers.filter(teacher => !assignedTeachers.has(teacher.id)).map(teacher => `<option value="${escapeAttribute(teacher.id)}">${escapeHTML(teacher.nameEnglish || teacher.name || teacher.nameKhmer)} · ${escapeHTML(teacher.id)}</option>`).join("")}</select><button class="btn" type="submit">Assign</button></form>
          ${teacherData.teachers.length ? `<ul class="membership-list">${teacherData.teachers.map(teacher => `<li>${escapeHTML(teacher.name_english || teacher.name || teacher.name_khmer || teacher.teacher_id)}<button type="button" class="text-link" data-action="remove-class-teacher" data-class-id="${classId}" data-teacher-id="${escapeAttribute(teacher.teacher_id)}">Remove</button></li>`).join("")}</ul>` : `<div class="empty">No teachers assigned.</div>`}</section>
          <section><h3>Enrolled students</h3><form id="class-student-form" class="inline-form"><select name="student_id" required><option value="">Select student</option>${students.filter(student => !enrolledStudents.has(student.id)).map(student => `<option value="${escapeAttribute(student.id)}">${escapeHTML(student.nameEnglish || student.name || student.nameKhmer)} · ${escapeHTML(student.id)}</option>`).join("")}</select><button class="btn" type="submit">Enroll</button></form>
          ${studentData.students.length ? `<ul class="membership-list">${studentData.students.map(student => `<li>${escapeHTML(student.name_english || student.name || student.name_khmer || student.student_id)}<button type="button" class="text-link" data-action="remove-class-student" data-class-id="${classId}" data-student-id="${escapeAttribute(student.student_id)}">Remove</button></li>`).join("")}</ul>` : `<div class="empty">No students enrolled.</div>`}</section></div>`;
        document.getElementById("class-teacher-form").addEventListener("submit", event => assignClassPerson(event, "teacher", classId));
        document.getElementById("class-student-form").addEventListener("submit", event => assignClassPerson(event, "student", classId));
      } catch (error) {
        console.error("Could not load class membership.", error);
        panel.innerHTML = `<div class="empty error-state">${escapeHTML(error.message)}</div>`;
      }
    }

    async function assignClassPerson(event, kind, classId) {
      event.preventDefault();
      const field = kind === "teacher" ? "teacher_id" : "student_id";
      try {
        await apiRequest(`/api/classes/${kind === "teacher" ? "teachers" : "students"}`, {
          method: "POST",
          body: JSON.stringify({ class_id: String(classId), [field]: String(new FormData(event.currentTarget).get(field) || "") })
        });
        await loadClassMembership(classId);
        showToast(kind === "teacher" ? "Teacher assigned." : "Student enrolled.");
      } catch (error) {
        showToast(error.message);
      }
    }

    async function renderTermsAndShifts() {
      const title = "Terms & shifts";
      const subtitle = "Manage academic terms and review the fixed 90-minute shift periods.";
      renderLoadingState(title, subtitle, "Loading terms and shifts...");
      try {
        const [termData, shiftData] = await Promise.all([apiRequest("/api/terms"), apiRequest("/api/shifts")]);
        const canManage = isTimetableManager();
        const canEditShifts = isTimetableLeader();
        content.innerHTML = pageHeader(title, subtitle) +
          (canManage ? `<section class="panel timetable-panel"><div class="panel-head"><div><h2>Create academic term</h2><p>Terms in the same academic year cannot overlap.</p></div></div>
          <form id="term-create-form" class="timetable-form"><div class="field"><label>Academic year</label><input name="academic_year" maxlength="30" required></div><div class="field"><label>Term number</label><input name="term_no" type="number" min="1" max="20" required></div><div class="field"><label>Term name</label><input name="name" maxlength="100" required></div><div class="field"><label>Start date</label><input name="start_date" type="date" required></div><div class="field"><label>End date</label><input name="end_date" type="date" required></div><button class="btn" type="submit">Create term</button></form></section>` : "") +
          `<section class="panel timetable-panel"><div class="panel-head"><div><h2>Academic terms</h2><p>Set one term as current for schedules.</p></div></div>
          ${termData.terms.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Term</th><th>Academic year</th><th>Dates</th><th>Status</th>${canManage ? "<th>Actions</th>" : ""}</tr></thead><tbody>${termData.terms.map(term => `<tr><td>${escapeHTML(term.name)} · ${term.term_no}</td><td>${escapeHTML(term.academic_year)}</td><td>${dateLabel(term.start_date)} — ${dateLabel(term.end_date)}</td><td>${term.is_current ? "Current" : "—"}</td>${canManage ? `<td>${term.is_current ? "" : `<button type="button" class="btn secondary small-btn" data-action="set-current-term" data-term-id="${term.id}">Set current</button>`} <button type="button" class="btn secondary small-btn" data-action="edit-term" data-term-id="${term.id}">Edit</button><button type="button" class="text-link danger-link" data-action="delete-term" data-term-id="${term.id}">Delete</button></td>` : ""}</tr>`).join("")}</tbody></table></div>` : `<div class="empty">No terms have been created.</div>`}</section>
          <section class="panel timetable-panel"><div class="panel-head"><div><h2>Shifts and periods</h2><p>Each displayed period is exactly 90 minutes.</p></div></div>
          ${shiftData.shifts.map(shift => `<article class="shift-block"><h3>${escapeHTML(shift.name)} <small>${escapeHTML(shift.code)}</small></h3><div class="table-wrap"><table class="table"><thead><tr><th>Weekday</th><th>Period</th><th>Start</th><th>End</th>${canEditShifts ? "<th></th>" : ""}</tr></thead><tbody>${shift.periods.map(period => `<tr><td>${escapeHTML(weekdayNames[period.weekday])}</td><td>${period.period_no}</td><td>${escapeHTML(String(period.start_time).slice(0, 5))}</td><td>${escapeHTML(String(period.end_time).slice(0, 5))}</td>${canEditShifts ? `<td><button class="text-link" data-action="delete-shift-period" data-period-id="${period.id}">Remove</button></td>` : ""}</tr>`).join("")}</tbody></table></div></article>`).join("")}
          ${canEditShifts ? `<form id="shift-period-form" class="timetable-form compact-form"><div class="field"><label>Shift</label><select name="shift_id" required>${shiftData.shifts.map(shift => `<option value="${shift.id}">${escapeHTML(shift.name)}</option>`).join("")}</select></div><div class="field"><label>Weekday</label><select name="weekday">${weekdayNames.slice(1).map((day, index) => `<option value="${index + 1}">${day}</option>`).join("")}</select></div><div class="field"><label>Period number</label><input name="period_no" type="number" min="1" max="5" required></div><div class="field"><label>Start time</label><input name="start_time" type="time" required></div><div class="field"><label>End time</label><input name="end_time" type="time" required></div><button class="btn" type="submit">Add period</button></form>` : ""}</section>`;
        const termForm = document.getElementById("term-create-form");
        if (termForm) termForm.addEventListener("submit", createTerm);
        const periodForm = document.getElementById("shift-period-form");
        if (periodForm) periodForm.addEventListener("submit", createShiftPeriod);
      } catch (error) {
        console.error("Could not load terms and shifts.", error);
        renderAsyncError(title, subtitle, error);
      }
    }

    async function createTerm(event) {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const payload = Object.fromEntries(["academic_year", "name", "start_date", "end_date"].map(key => [key, String(form.get(key) || "").trim()]));
      payload.term_no = Number(form.get("term_no"));
      try {
        await apiRequest("/api/terms", { method: "POST", body: JSON.stringify(payload) });
        showToast("Academic term created.");
        await renderTermsAndShifts();
      } catch (error) { showToast(error.message); }
    }

    async function createShiftPeriod(event) {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const payload = Object.fromEntries(["weekday", "period_no"].map(key => [key, Number(form.get(key))]));
      payload.shift_id = String(form.get("shift_id") || "");
      payload.start_time = form.get("start_time");
      payload.end_time = form.get("end_time");
      try {
        await apiRequest("/api/shifts/periods", { method: "POST", body: JSON.stringify(payload) });
        showToast("Shift period added.");
        await renderTermsAndShifts();
      } catch (error) { showToast(error.message); }
    }

    async function renderClassTimetable(data = null) {
      const title = "Class timetable";
      const subtitle = "Build the weekly timetable from the selected class shift and academic term.";
      if (!data) {
        await renderClassesManager();
        return;
      }
      const term = data.terms.find(item => item.is_current) || data.terms[0];
      const classRow = data.classes[0];
      content.innerHTML = pageHeader(title, subtitle) +
        `<section class="panel timetable-panel"><div class="attendance-controls"><div class="field"><label for="timetable-term">Term</label><select id="timetable-term">${termOptions(data.terms, term?.id)}</select></div><div class="field"><label for="timetable-class">Class</label><select id="timetable-class">${classOptions(data.classes, classRow?.class_id)}</select></div></div><div id="timetable-editor" class="empty">${data.classes.length && data.terms.length ? "Loading weekly timetable..." : "Create a class and an academic term before editing the timetable."}</div></section>`;
      const termSelect = document.getElementById("timetable-term");
      const classSelect = document.getElementById("timetable-class");
      const reload = () => loadTimetableEditor(classSelect.value, termSelect.value, data);
      termSelect.addEventListener("change", reload);
      classSelect.addEventListener("change", reload);
      if (classRow && term) await reload();
    }

    async function loadTimetableEditor(classId, termId, data) {
      const editor = document.getElementById("timetable-editor");
      if (!editor || !classId || !termId) return;
      editor.innerHTML = `<div class="empty">Loading shift periods and weekly slots...</div>`;
      try {
        const selectedClass = data.classes.find(item => String(item.class_id) === String(classId));
        const [periodData, slotData, teacherData] = await Promise.all([
          apiRequest(`/api/shifts/periods?shift_id=${encodeURIComponent(selectedClass.shift_id)}`),
          apiRequest(`/api/timetable?term_id=${encodeURIComponent(termId)}&class_id=${encodeURIComponent(classId)}`),
          apiRequest(`/api/classes/teachers?class_id=${encodeURIComponent(classId)}`)
        ]);
        const periods = periodData.periods;
        const slots = slotData.slots;
        activeTimetableContext = { classId: String(classId), termId: String(termId), data, periods, slots };
        const weekdays = [...new Set(periods.map(period => Number(period.weekday)))].sort((a, b) => a - b);
        const periodNumbers = [...new Set(periods.map(period => Number(period.period_no)))].sort((a, b) => a - b);
        const cell = (weekday, periodNo) => {
          const slot = slots.find(item => Number(item.weekday) === weekday && Number(item.period_no) === periodNo);
          if (!slot) return `<span class="muted">—</span>`;
          const editControls = isTimetableManager()
            ? `<button class="text-link" data-action="edit-timetable-slot" data-slot-id="${slot.slot_id}">Edit</button>${isTimetableLeader() ? `<button class="text-link danger-link" data-action="delete-timetable-slot" data-slot-id="${slot.slot_id}">Remove</button>` : ""}`
            : "";
          return `<div class="timetable-slot"><strong>${escapeHTML(slot.subject_name)}</strong><small>${escapeHTML(slot.teacher_name || slot.teacher_id)}</small><small>${escapeHTML(String(slot.start_time).slice(0, 5))}–${escapeHTML(String(slot.end_time).slice(0, 5))}${slot.room ? ` · ${escapeHTML(slot.room)}` : ""}</small>${editControls}</div>`;
        };
        const periodsByNo = new Map(periods.map(period => [Number(period.period_no), period]));
        const grid = `<div class="table-wrap timetable-grid-wrap"><table class="table timetable-grid"><thead><tr><th>Period</th>${weekdays.map(day => `<th>${weekdayNames[day]}</th>`).join("")}</tr></thead><tbody>${periodNumbers.map(number => {
          const period = periodsByNo.get(number);
          return `<tr><th>${number}<small>${escapeHTML(String(period.start_time).slice(0, 5))}–${escapeHTML(String(period.end_time).slice(0, 5))}</small></th>${weekdays.map(day => {
            const valid = periods.some(item => Number(item.weekday) === day && Number(item.period_no) === number);
            return `<td>${valid ? cell(day, number) : `<span class="muted">—</span>`}</td>`;
          }).join("")}</tr>`;
        }).join("")}</tbody></table></div>`;
        const subjects = data.subjects.filter(subject => subject.is_active);
        const teacherOptions = teacherData.teachers.map(teacher => `<option value="${escapeAttribute(teacher.teacher_id)}">${escapeHTML(teacher.name_english || teacher.name || teacher.name_khmer || teacher.teacher_id)}</option>`).join("");
        const canEdit = isTimetableManager();
        editor.innerHTML = `<div class="notice">${escapeHTML(selectedClass.name)} · ${escapeHTML(data.shifts.find(shift => String(shift.id) === String(selectedClass.shift_id))?.name || selectedClass.shift_code || "")} · ${periods.length} configured weekday periods.</div>${grid}
          ${canEdit ? `<div class="timetable-toolbar"><button class="btn secondary" data-action="preview-session-generation" data-term-id="${termId}" data-class-id="${classId}">Preview & generate sessions</button></div>
          <form id="timetable-slot-form" class="timetable-form"><input type="hidden" name="slot_id"><input type="hidden" name="term_id" value="${termId}"><input type="hidden" name="class_id" value="${classId}">
            <div class="field"><label>Weekday / period</label><select name="period_key" required><option value="">Select shift period</option>${periods.map(period => `<option value="${period.weekday}:${period.period_no}" data-weekday="${period.weekday}" data-number="${period.period_no}" data-start="${escapeAttribute(String(period.start_time).slice(0, 5))}" data-end="${escapeAttribute(String(period.end_time).slice(0, 5))}">${escapeHTML(weekdayNames[period.weekday])} · Period ${period.period_no} (${escapeHTML(String(period.start_time).slice(0, 5))}–${escapeHTML(String(period.end_time).slice(0, 5))})</option>`).join("")}</select></div>
            <div class="field"><label>Subject</label><select name="subject_id" required><option value="">Select subject</option>${subjects.map(subject => `<option value="${subject.subject_id}">${escapeHTML(subject.name)}</option>`).join("")}</select></div>
            <div class="field"><label>Assigned teacher</label><select name="teacher_id" required><option value="">Select class teacher</option>${teacherOptions}</select></div>
            <div class="field"><label>Room (optional)</label><input name="room" maxlength="100"></div><button class="btn" type="submit">Save timetable slot</button><button class="btn secondary" type="reset">Clear form</button></form>` : ""}
          ${canEdit && !teacherData.teachers.length ? `<div class="notice">Assign at least one teacher to this class before adding timetable slots.</div>` : ""}`;
        const slotForm = document.getElementById("timetable-slot-form");
        if (slotForm) slotForm.addEventListener("submit", saveTimetableSlot);
        const generateButton = editor.querySelector('[data-action="preview-session-generation"]');
        if (generateButton) generateButton.addEventListener("click", previewSessionGeneration);
      } catch (error) {
        console.error("Could not load class timetable.", error);
        editor.innerHTML = `<div class="empty error-state">${escapeHTML(error.message)}</div>`;
      }
    }

    async function saveTimetableSlot(event) {
      event.preventDefault();
      const formElement = event.currentTarget;
      const form = new FormData(formElement);
      const periodOption = formElement.querySelector('[name="period_key"] option:checked');
      const [weekday, periodNo] = String(form.get("period_key") || "").split(":").map(Number);
      if (!periodOption?.dataset.start || !weekday || !periodNo) {
        showToast("Select a valid period from the class shift.");
        return;
      }
      const payload = {
        term_id: String(form.get("term_id") || ""),
        class_id: String(form.get("class_id") || ""),
        weekday,
        period_no: periodNo,
        start_time: periodOption.dataset.start,
        end_time: periodOption.dataset.end,
        subject_id: String(form.get("subject_id") || ""),
        teacher_id: String(form.get("teacher_id") || ""),
        room: String(form.get("room") || "").trim() || null
      };
      const slotId = String(form.get("slot_id") || "");
      if (slotId) payload.slot_id = slotId;
      try {
        await apiRequest("/api/timetable", {
          method: slotId ? "PATCH" : "POST",
          body: JSON.stringify(payload)
        });
        showToast(slotId ? "Timetable slot updated." : "Timetable slot created.");
        await renderClassesManager();
      } catch (error) {
        showToast(error.message);
      }
    }

    async function editClass(classId) {
      try {
        const { classes } = await apiRequest("/api/classes");
        const item = classes.find(entry => String(entry.class_id) === String(classId));
        if (!item) throw new Error("Class not found.");
        const name = window.prompt("Class name", item.name);
        if (name === null) return;
        const academicYear = window.prompt("Academic year", item.academic_year);
        if (academicYear === null) return;
        const studyLevel = window.prompt("Study level", item.study_level || "");
        if (studyLevel === null) return;
        const shiftChoices = availableTimetableShifts.map(option => `${option.id}: ${option.name} (${option.code})`).join("\n");
        const shift = window.prompt(`Shift ID:\n${shiftChoices}`, item.shift_id);
        if (shift === null) return;
        await apiRequest("/api/classes", {
          method: "PATCH",
          body: JSON.stringify({
            class_id: String(item.class_id), name: name.trim(),
            academic_year: academicYear.trim(), study_level: studyLevel.trim() || null,
            shift_id: String(shift), is_active: item.is_active
          })
        });
        showToast("Class updated.");
        await renderClassesManager();
      } catch (error) {
        showToast(error.message);
      }
    }

    async function editTerm(termId) {
      try {
        const { terms } = await apiRequest("/api/terms");
        const term = terms.find(item => String(item.id) === String(termId));
        if (!term) throw new Error("Term not found.");
        const name = window.prompt("Term name", term.name);
        if (name === null) return;
        const academicYear = window.prompt("Academic year", term.academic_year);
        if (academicYear === null) return;
        const termNo = window.prompt("Term number", term.term_no);
        if (termNo === null) return;
        const startDate = window.prompt("Start date (YYYY-MM-DD)", String(term.start_date).slice(0, 10));
        if (startDate === null) return;
        const endDate = window.prompt("End date (YYYY-MM-DD)", String(term.end_date).slice(0, 10));
        if (endDate === null) return;
        await apiRequest("/api/terms", {
          method: "PATCH",
          body: JSON.stringify({
            id: String(term.id), name: name.trim(), academic_year: academicYear.trim(),
            term_no: Number(termNo), start_date: startDate, end_date: endDate
          })
        });
        showToast("Term updated. Future unattended sessions were refreshed.");
        await renderTermsAndShifts();
      } catch (error) {
        showToast(error.message);
      }
    }

    async function renderMyTimetable() {
      const title = "My timetable";
      const subtitle = "View your authorized weekly timetable and today's generated sessions.";
      renderLoadingState(title, subtitle, "Loading your timetable...");
      try {
        const termsData = await apiRequest("/api/terms");
        const terms = termsData.terms;
        const term = terms.find(item => item.is_current) || terms[0];
        if (!term) {
          content.innerHTML = pageHeader(title, subtitle) + `<section class="panel"><div class="empty">No academic term is configured.</div></section>`;
          return;
        }
        const [slotData, todayData] = await Promise.all([
          apiRequest(`/api/timetable?term_id=${encodeURIComponent(term.id)}`),
          apiRequest(`/api/sessions?term_id=${encodeURIComponent(term.id)}&date=${encodeURIComponent(localDateValue())}`)
        ]);
        const slots = slotData.slots;
        const dayNumbers = [...new Set(slots.map(slot => Number(slot.weekday)))].sort((a, b) => a - b);
        const slotTimes = [...new Set(slots.map(slot => `${slot.start_time}|${slot.end_time}`))].sort();
        const weekGrid = slots.length ? `<div class="table-wrap timetable-grid-wrap"><table class="table timetable-grid"><thead><tr><th>Time</th>${dayNumbers.map(day => `<th>${weekdayNames[day]}</th>`).join("")}</tr></thead><tbody>${slotTimes.map(times => {
          const [start, end] = times.split("|");
          return `<tr><th>${escapeHTML(start.slice(0, 5))}<small>${escapeHTML(end.slice(0, 5))}</small></th>${dayNumbers.map(day => {
            const slot = slots.find(item => Number(item.weekday) === day && item.start_time === start && item.end_time === end);
            return `<td>${slot ? `<strong>${escapeHTML(slot.subject_name)}</strong><small>${escapeHTML(slot.class_name)} · ${escapeHTML(slot.teacher_name || "")}</small>${slot.room ? `<small>${escapeHTML(slot.room)}</small>` : ""}` : `<span class="muted">—</span>`}</td>`;
          }).join("")}</tr>`;
        }).join("")}</tbody></table></div>` : `<div class="empty">No timetable slots are configured for this term.</div>`;
        const todaySessions = todayData.sessions.length ? todayData.sessions.map(session => {
          const attendanceAction = ["teacher", ...timetableManagerRoles, "dept_head", "dept_deputy"].includes(currentUser.role)
            ? `<button class="btn secondary" data-action="open-session" data-session-id="${session.session_id}">Attendance</button>`
            : "";
          return `<article class="session-card"><div><strong>${escapeHTML(session.subject_name)}</strong><small>${escapeHTML(session.class_name)} · ${escapeHTML(session.starts_at ? formatAppTime(session.starts_at) : "")}–${escapeHTML(session.ends_at ? formatAppTime(session.ends_at) : "")}</small><small>${escapeHTML(session.teacher_name || "")}${session.room ? ` · ${escapeHTML(session.room)}` : ""}</small></div>${attendanceAction}</article>`;
        }).join("") : `<div class="empty">No generated sessions are scheduled for today.</div>`;
        content.innerHTML = pageHeader(title, subtitle, `<span class="badge active">${escapeHTML(term.name)} · ${escapeHTML(term.academic_year)}</span>`) +
          `<section class="panel timetable-panel"><div class="panel-head"><div><h2>Weekly schedule</h2><p>${slots.length} authorized timetable slots · shifts follow their configured weekday periods.</p></div></div>${weekGrid}</section>
          <section class="panel timetable-panel"><div class="panel-head"><div><h2>Today's sessions</h2><p>${dateLabel(localDateValue())}</p></div></div><div class="session-list">${todaySessions}</div></section>`;
      } catch (error) {
        console.error("Could not load the user's timetable.", error);
        renderAsyncError(title, subtitle, error);
      }
    }

    async function renderAttendanceReports() {
      const title = "Attendance reports";
      const subtitle = "Review attendance counts and percentages by class for a selected period.";
      renderLoadingState(title, subtitle, "Loading attendance report filters...");
      try {
        const { terms } = await apiRequest("/api/terms");
        const currentTerm = terms.find(item => item.is_current) || terms[0];
        const start = currentTerm ? String(currentTerm.start_date).slice(0, 10) : localDateValue();
        const end = currentTerm ? String(currentTerm.end_date).slice(0, 10) : localDateValue();
        content.innerHTML = pageHeader(title, subtitle) +
          `<section class="panel timetable-panel"><div class="attendance-controls"><div class="field"><label for="report-start">From</label><input id="report-start" type="date" value="${escapeAttribute(start)}"></div><div class="field"><label for="report-end">To</label><input id="report-end" type="date" value="${escapeAttribute(end)}"></div><div class="field"><label for="report-group">Group by</label><select id="report-group"><option value="class">Class</option><option value="session">Session</option><option value="subject">Subject</option><option value="teacher">Teacher</option><option value="shift">Shift</option></select></div><button class="btn" data-action="load-attendance-report">Load report</button><button class="btn secondary" data-action="export-attendance-report">Export CSV</button></div><div id="attendance-report-results" class="empty">Choose a date range to load the report.</div></section>`;
        document.getElementById("report-group").value = "class";
        await loadAttendanceReport();
      } catch (error) {
        console.error("Could not load attendance report filters.", error);
        renderAsyncError(title, subtitle, error);
      }
    }

    async function loadAttendanceReport() {
      const output = document.getElementById("attendance-report-results");
      const startDate = document.getElementById("report-start")?.value;
      const endDate = document.getElementById("report-end")?.value;
      const groupBy = document.getElementById("report-group")?.value || "class";
      if (!output) return;
      if (!startDate || !endDate || endDate < startDate) {
        output.innerHTML = `<div class="empty error-state">Choose a valid date range.</div>`;
        return;
      }
      output.innerHTML = `<div class="empty">Loading attendance report...</div>`;
      try {
        const query = new URLSearchParams({ group_by: groupBy, start_date: startDate, end_date: endDate });
        const { reports } = await apiRequest(`/api/reports/attendance?${query}`);
        window.currentAttendanceReport = reports;
        output.innerHTML = reports.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>${escapeHTML(groupBy)}</th><th>Present</th><th>Absent</th><th>Late</th><th>Excused</th><th>Attendance %</th></tr></thead><tbody>${reports.map(report => `<tr><td>${escapeHTML(report.group_name || report.group_key)}</td><td>${report.present}</td><td>${report.absent}</td><td>${report.late}</td><td>${report.excused}</td><td>${Number(report.attendance_percentage).toFixed(2)}%</td></tr>`).join("")}</tbody></table></div>` : `<div class="empty">No attendance data was found for this range.</div>`;
      } catch (error) {
        console.error("Could not load attendance report.", error);
        output.innerHTML = `<div class="empty error-state">${escapeHTML(error.message)}</div>`;
      }
    }

    function exportAttendanceReport() {
      const reports = window.currentAttendanceReport;
      if (!Array.isArray(reports) || !reports.length) {
        showToast("Load a non-empty attendance report before exporting.");
        return;
      }
      const headers = ["Name", "Present", "Absent", "Late", "Excused", "Attendance percentage"];
      const rows = [headers, ...reports.map(row => [row.group_name || row.group_key, row.present, row.absent, row.late, row.excused, `${row.attendance_percentage}%`])];
      const csv = rows.map(row => row.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
      const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance-report-${localDateValue()}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }

    async function renderSessionAttendance() {
      stopQrCamera();
      const title = "Session attendance";
      const subtitle = "Select a class session to review or record the complete enrolled roster.";
      renderLoadingState(title, subtitle, "Loading today's class sessions...");
      try {
        const [sessionData, classData] = await Promise.all([
          apiRequest(`/api/sessions?date=${encodeURIComponent(localDateValue())}`),
          apiRequest("/api/classes")
        ]);
        content.innerHTML = pageHeader(title, subtitle) +
          `<section class="panel timetable-panel"><div class="attendance-controls"><div class="field"><label for="session-date">Date</label><input id="session-date" type="date" value="${localDateValue()}" max="${localDateValue()}"></div><div class="field"><label for="session-class">Class</label><select id="session-class"><option value="">All authorized classes</option>${classOptions(classData.classes)}</select></div><div class="field"><label for="session-picker">Session</label><select id="session-picker"><option value="">Select a session</option></select></div></div><div id="session-attendance-detail"><div class="empty">${sessionData.sessions.length ? "Choose a class session." : "No sessions are scheduled for this date."}</div></div></section>`;
        const sessions = sessionData.sessions;
        const datePicker = document.getElementById("session-date");
        const classPicker = document.getElementById("session-class");
        const sessionPicker = document.getElementById("session-picker");
        const reload = async () => {
          const query = new URLSearchParams({ date: datePicker.value });
          if (classPicker.value) query.set("class_id", classPicker.value);
          try {
            const result = await apiRequest(`/api/sessions?${query}`);
            sessionPicker.innerHTML = `<option value="">${result.sessions.length ? "Select a session" : "No sessions for this date"}</option>${result.sessions.map(item => `<option value="${item.session_id}">${escapeHTML(item.starts_at ? formatAppTime(item.starts_at) : "")} · ${escapeHTML(item.class_name)} · ${escapeHTML(item.subject_name)}</option>`).join("")}`;
            if (selectedAttendanceSessionId && result.sessions.some(item => String(item.session_id) === String(selectedAttendanceSessionId))) {
              sessionPicker.value = selectedAttendanceSessionId;
              await loadSessionAttendance(selectedAttendanceSessionId);
            } else if (result.sessions.length === 1) {
              sessionPicker.value = String(result.sessions[0].session_id);
              await loadSessionAttendance(sessionPicker.value);
            } else {
              document.getElementById("session-attendance-detail").innerHTML = `<div class="empty">${result.sessions.length ? "Choose a class session." : "No sessions are scheduled for this date."}</div>`;
            }
          } catch (error) {
            document.getElementById("session-attendance-detail").innerHTML = `<div class="empty error-state">${escapeHTML(error.message)}</div>`;
          }
        };
        datePicker.addEventListener("change", reload);
        classPicker.addEventListener("change", reload);
        sessionPicker.addEventListener("change", () => {
          selectedAttendanceSessionId = sessionPicker.value;
          if (sessionPicker.value) loadSessionAttendance(sessionPicker.value);
        });
        if (selectedAttendanceSessionId) await reload();
        else {
          sessionPicker.innerHTML = `<option value="">${sessions.length ? "Select a session" : "No sessions for today"}</option>${sessions.map(item => `<option value="${item.session_id}">${escapeHTML(item.starts_at ? formatAppTime(item.starts_at) : "")} · ${escapeHTML(item.class_name)} · ${escapeHTML(item.subject_name)}</option>`).join("")}`;
          if (sessions.length === 1) {
            sessionPicker.value = String(sessions[0].session_id);
            selectedAttendanceSessionId = sessionPicker.value;
            await loadSessionAttendance(sessionPicker.value);
          }
        }
      } catch (error) {
        console.error("Could not load sessions for attendance.", error);
        renderAsyncError(title, subtitle, error);
      }
    }

    async function loadSessionAttendance(sessionId) {
      const detail = document.getElementById("session-attendance-detail");
      if (!detail) return;
      detail.innerHTML = `<div class="empty">Loading class roster...</div>`;
      try {
        const { session, roster } = await apiRequest(`/api/sessions/attendance?session_id=${encodeURIComponent(sessionId)}`);
        const canRecord = ["director", "deputy_director", "office_head", "office_deputy", "office_staff", "dept_head", "dept_deputy", "teacher"].includes(currentUser?.role);
        const recordedCount = roster.filter(student => student.status).length;
        detail.innerHTML = `<div class="session-summary"><div><strong>${escapeHTML(session.class_name || `Class ${session.class_id}`)} · ${escapeHTML(session.subject_name || "Class session")}</strong><small>${dateLabel(session.session_date)} · ${session.starts_at ? formatAppTime(session.starts_at) : ""}–${session.ends_at ? formatAppTime(session.ends_at) : ""}</small></div><span class="badge ${recordedCount === roster.length && roster.length ? "active" : "pending"}">${recordedCount}/${roster.length} recorded</span></div>
          ${canRecord ? `<div class="attendance-controls"><button type="button" class="btn secondary" data-action="mark-session-present">Mark all present</button><button type="button" class="btn" data-action="save-session-attendance" data-session-id="${sessionId}">Save attendance</button><button type="button" class="btn secondary" data-action="close-session-attendance" data-session-id="${sessionId}">Close session / mark remaining absent</button></div>
          <div class="qr-scan-panel"><div class="field"><label for="qr-student-id">Scan QR code or enter student ID</label><div class="inline-form"><input id="qr-student-id" autocomplete="off" placeholder='{"type":"attendance","id":"..."}'><button class="btn secondary" data-action="submit-qr-scan" data-session-id="${sessionId}">Record scan</button><button class="btn secondary" data-action="start-qr-camera">Use camera</button></div></div><video id="qr-camera" class="qr-camera" playsinline hidden></video><p id="qr-scan-status" class="page-subtitle" aria-live="polite"></p></div>` : ""}
          ${roster.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Student</th><th>Status</th>${canRecord ? "<th>Mark status</th>" : ""}</tr></thead><tbody>${roster.map(student => `<tr data-session-student="${escapeAttribute(student.student_id)}"><td>${escapeHTML(student.name_english || student.name_khmer || student.student_id)}<small class="table-subtext">${escapeHTML(student.student_id)}</small></td><td>${escapeHTML(student.status || "Not recorded")}${student.source ? ` · ${escapeHTML(student.source)}` : ""}</td>${canRecord ? `<td><select class="session-status-select" aria-label="Attendance status for ${escapeAttribute(student.student_id)}"><option value="">Select status</option>${["present", "absent", "late", "excused"].map(status => `<option value="${status}" ${student.status === status ? "selected" : ""}>${status}</option>`).join("")}</select></td>` : ""}</tr>`).join("")}</tbody></table></div>` : `<div class="empty">No students are enrolled in this class.</div>`}`;
        if (currentUser?.role === "teacher" &&
            (currentUser.teacher_id === session.teacher_id || currentUser.teacher_id === session.substitute_teacher_id)) {
          const checkin = document.createElement("section");
          checkin.className = "teacher-checkin panel";
          checkin.innerHTML = `<div><strong>Teacher check-in</strong><small>${session.teacher_checkin_at ? `Checked in: ${escapeHTML(formatAppTime(session.teacher_checkin_at))}` : "Scan the room QR with this phone camera."}</small></div><button class="btn" data-action="teacher-room-checkin" data-session-id="${escapeAttribute(sessionId)}" ${session.teacher_checkin_at ? "disabled" : ""}>${session.teacher_checkin_at ? "Checked in" : "Check in with room QR"}</button><video id="teacher-checkin-camera" class="qr-camera" playsinline hidden></video><p id="teacher-checkin-status" class="page-subtitle" aria-live="polite"></p>`;
          detail.prepend(checkin);
        }
        const scanInput = document.getElementById("qr-student-id");
        if (scanInput) scanInput.addEventListener("keydown", event => {
          if (event.key === "Enter") {
            event.preventDefault();
            scanStudentForSession(sessionId, scanInput.value);
          }
        });
      } catch (error) {
        console.error("Could not load session attendance roster.", error);
        detail.innerHTML = `<div class="empty error-state">${escapeHTML(error.message)}</div>`;
      }
    }

    async function saveSessionAttendance(sessionId) {
      const rows = [...document.querySelectorAll("[data-session-student]")];
      const records = rows.map(row => ({
        student_id: row.dataset.sessionStudent,
        status: row.querySelector(".session-status-select")?.value || ""
      }));
      if (records.some(record => !record.status)) {
        showToast("Choose an attendance status for every student, or use Mark all present.");
        return;
      }
      try {
        const result = await apiRequest("/api/sessions/attendance", {
          method: "POST",
          body: JSON.stringify({ session_id: String(sessionId), records })
        });
        showToast(`${result.saved} attendance records saved.`);
        await loadSessionAttendance(sessionId);
      } catch (error) {
        showToast(error.message);
      }
    }

    async function scanStudentForSession(sessionId, studentValue) {
      const status = document.getElementById("qr-scan-status");
      const studentId = studentValue.trim();
      if (!studentId) {
        showToast("Scan or enter a student QR payload.");
        return;
      }
      try {
        const result = await apiRequest("/api/attendance/scan", {
          method: "POST",
          body: JSON.stringify({ session_id: String(sessionId), qr_payload: studentId })
        });
        if (status) status.textContent = result.already ? `Already recorded: ${result.status}.` : `Attendance recorded: ${result.status}.`;
        const input = document.getElementById("qr-student-id");
        if (input) { input.value = ""; input.focus(); }
        await loadSessionAttendance(sessionId);
      } catch (error) {
        if (status) status.textContent = error.message;
        showToast(error.message);
      }
    }

    async function startQrCamera() {
      if (!("BarcodeDetector" in window) || !navigator.mediaDevices?.getUserMedia) {
        showToast("QR camera scanning is not supported in this browser. Use a QR scanner keyboard or enter the scanned value.");
        document.getElementById("qr-student-id")?.focus();
        return;
      }
      try {
        stopQrCamera();
        const video = document.getElementById("qr-camera");
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        qrMediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = qrMediaStream;
        video.hidden = false;
        await video.play();
        const status = document.getElementById("qr-scan-status");
        if (status) status.textContent = "Camera active. Hold a student QR code in view.";
        const sessionId = selectedAttendanceSessionId;
        const scanFrame = async () => {
          if (!video.isConnected || video.hidden || !qrMediaStream) return;
          try {
            const codes = await detector.detect(video);
            if (codes.length && codes[0].rawValue) {
              stopQrCamera();
              await scanStudentForSession(sessionId, codes[0].rawValue);
              return;
            }
          } catch (error) {
            console.error("Could not decode a QR code from the camera frame.", error);
          }
          window.requestAnimationFrame(scanFrame);
        };
        window.requestAnimationFrame(scanFrame);
      } catch (error) {
        stopQrCamera();
        console.error("Could not start the QR scanner camera.", error);
        showToast(error.message || "Camera access was denied.");
      }
    }

    function stopQrCamera() {
      if (qrMediaStream) {
        qrMediaStream.getTracks().forEach(track => track.stop());
        qrMediaStream = null;
      }
      const video = document.getElementById("qr-camera");
      if (video) {
        video.hidden = true;
        video.srcObject = null;
      }
    }

    async function submitTeacherCheckin(sessionId, token) {
      const status = document.getElementById("teacher-checkin-status");
      try {
        const result = await apiRequest(`/api/sessions/${encodeURIComponent(sessionId)}/checkin`, {
          method: "POST",
          body: JSON.stringify({ room_qr_token: token })
        });
        if (status) status.textContent = result.already ? "You are already checked in." : "Teacher check-in recorded.";
        await loadSessionAttendance(sessionId);
      } catch (error) {
        if (status) status.textContent = error.message;
        showToast(error.message);
      }
    }

    async function startTeacherCheckinCamera(sessionId) {
      const status = document.getElementById("teacher-checkin-status");
      if (!window.isSecureContext) {
        if (status) status.textContent = "Camera check-in requires HTTPS. Open this page using the secure school link.";
        return;
      }
      if (!("BarcodeDetector" in window) || !navigator.mediaDevices?.getUserMedia) {
        if (status) status.textContent = "QR camera scanning is unavailable. Use a supported browser or ask the office to check you in.";
        return;
      }
      try {
        stopQrCamera();
        const video = document.getElementById("teacher-checkin-camera");
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        qrMediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = qrMediaStream;
        video.hidden = false;
        await video.play();
        if (status) status.textContent = "Camera active. Scan the QR card for this room.";
        const scanFrame = async () => {
          if (!video.isConnected || video.hidden || !qrMediaStream) return;
          try {
            const codes = await detector.detect(video);
            if (codes.length && codes[0].rawValue) {
              const token = codes[0].rawValue.trim();
              stopQrCamera();
              await submitTeacherCheckin(sessionId, token);
              return;
            }
          } catch {
            if (status) status.textContent = "Could not read the QR code. Hold it steady and try again.";
          }
          window.requestAnimationFrame(scanFrame);
        };
        window.requestAnimationFrame(scanFrame);
      } catch (error) {
        stopQrCamera();
        if (status) {
          status.textContent = error.name === "NotAllowedError"
            ? "Camera access was denied. Allow camera access for this site, then retry."
            : "Could not open the camera. Check browser permissions and try again.";
        }
      }
    }

    async function renderMyAttendance() {
      const title = "My attendance";
      const subtitle = "Review session attendance for your account or linked children.";
      renderLoadingState(title, subtitle, "Loading attendance history...");
      try {
        const termData = await apiRequest("/api/terms");
        const currentTerm = termData.terms.find(term => term.is_current) || termData.terms[0];
        const { year, month } = appDateParts();
        const monthValue = `${year}-${month}`;
        content.innerHTML = pageHeader(title, subtitle) +
          `<section class="panel timetable-panel"><div class="attendance-controls"><div class="field"><label for="history-month">Month</label><input id="history-month" type="month" value="${monthValue}"></div><div class="field"><label for="history-term">Term</label><select id="history-term">${termOptions(termData.terms, currentTerm?.id)}</select></div><button class="btn" data-action="load-my-attendance">Load history</button></div><div id="my-attendance-results"><div class="empty">Choose a month and term.</div></div></section>`;
        await loadMyAttendanceHistory(monthValue, currentTerm?.id);
      } catch (error) {
        console.error("Could not load attendance history.", error);
        renderAsyncError(title, subtitle, error);
      }
    }

    async function loadMyAttendanceHistory(month, termId) {
      const output = document.getElementById("my-attendance-results");
      if (!output) return;
      if (!/^\d{4}-\d{2}$/.test(month || "") || !termId) {
        output.innerHTML = `<div class="empty error-state">Select a valid month and academic term.</div>`;
        return;
      }
      output.innerHTML = `<div class="empty">Loading monthly attendance...</div>`;
      try {
        const [year, monthNumber] = month.split("-").map(Number);
        const lastDay = new Date(year, monthNumber, 0).getDate();
        const startDate = `${month}-01`;
        const endDate = `${month}-${String(lastDay).padStart(2, "0")}`;
        const query = new URLSearchParams({
          term_id: String(termId), start_date: startDate, end_date: endDate
        });
        const selectedSessions = (await apiRequest(`/api/sessions?${query}`)).sessions;
        if (selectedSessions.length > 250) throw new Error("This month has too many sessions to load at once. Choose a shorter period.");
        const rosterResults = await Promise.all(selectedSessions.map(async session => {
          const result = await apiRequest(`/api/sessions/attendance?session_id=${encodeURIComponent(session.session_id)}`);
          return { session, roster: result.roster };
        }));
        const rows = rosterResults.flatMap(({ session, roster }) => roster.map(student => ({ session, student })))
          .sort((a, b) => String(b.session.session_date).localeCompare(String(a.session.session_date)));
        const counts = { present: 0, late: 0, absent: 0, excused: 0 };
        rows.forEach(({ student }) => { if (counts[student.status] !== undefined) counts[student.status]++; });
        const recorded = Object.values(counts).reduce((total, value) => total + value, 0);
        const percentage = recorded ? ((counts.present + counts.late) / recorded * 100).toFixed(1) : "0.0";
        output.innerHTML = `<div class="cards attendance-summary-cards">${Object.entries(counts).map(([label, count]) => `<article class="card stat-card"><div class="stat-top">${label}</div><div class="stat-number">${count}</div><div class="stat-note">session records</div></article>`).join("")}<article class="card stat-card"><div class="stat-top">Attendance</div><div class="stat-number">${percentage}%</div><div class="stat-note">present or late</div></article></div>
          ${rows.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Date</th><th>Student</th><th>Class</th><th>Subject</th><th>Status</th></tr></thead><tbody>${rows.map(({ session, student }) => `<tr><td>${dateLabel(session.session_date)}</td><td>${escapeHTML(student.name_english || student.name_khmer || student.student_id)}</td><td>${escapeHTML(session.class_name)}</td><td>${escapeHTML(session.subject_name)}</td><td>${escapeHTML(student.status || "Not recorded")}</td></tr>`).join("")}</tbody></table></div>` : `<div class="empty">No session attendance was found for this month.</div>`}`;
      } catch (error) {
        console.error("Could not load monthly session attendance.", error);
        output.innerHTML = `<div class="empty error-state">${escapeHTML(error.message)}</div>`;
      }
    }

    function navigate(page, group = "") {
      if (!hasPagePermission(page)) {
        renderNoPermission(page);
        return;
      }
      currentPage = page;
      sidebar.classList.remove("open");
      document.getElementById("overlay").classList.remove("open");
      document.getElementById("mobile-menu").setAttribute("aria-expanded", "false");
      document.querySelectorAll(".subnav button").forEach(button => {
        const matchesPage = button.dataset.page === page || button.textContent === page;
        button.classList.toggle("active", matchesPage);
      });
      document.querySelectorAll(".nav-item").forEach(button => {
        const active = button.parentElement.querySelector(".subnav .active") !== null;
        button.classList.toggle("active", active);
        button.classList.toggle("expanded", active);
        button.setAttribute("aria-expanded", String(active));
      });
      document.querySelectorAll(".subnav").forEach(submenu => submenu.classList.toggle("open", submenu.querySelector(".active") !== null));
      document.getElementById("global-search").value = "";
      closeSearch();
      if (page === "Overview" || group === "Dashboard") dashboard();
      else if (page === "Study Levels") renderStudyLevels();
      else if (page === "QR Attendance") renderQrAttendance();
      else if (page === "Student List" || page === "Student Enrollment") renderStudents();
      else if (page === "Add Student" || page === "Add Students") openStudentModal();
      else if (page === "Import from Excel") renderImportStudents();
      else if (page === "Teacher List") renderTeachers();
      else if (page === "Take Attendance") renderSessionAttendance();
      else if (page === "Daily Attendance") renderAttendance();
      else if (page === "Classes" || page === "Class Timetable") renderClassesManager();
      else if (page === "Terms & Shifts") renderTermsAndShifts();
      else if (page === "My Timetable") renderMyTimetable();
      else if (page === "Session Attendance") renderSessionAttendance();
      else if (page === "My Attendance" || page === "Monthly Attendance") renderMyAttendance();
      else if (page === "Attendance Reports") renderAttendanceReports();
      else if (page === "User Management") renderUsers();
      else if (page === "My Account") renderMyAccount();
      else if (["Notification Rules", "Parent Chat Links", "Message Log", "Room QR Cards", "Needs Review", "Guardian Notifications"].includes(page)) renderNotificationFeature(page);
      else if (["Bot Settings", "Notification Rules", "Parent Chat Links", "Message Log"].includes(page)) renderTelegram(page);
      else renderModule(page);
    }

    function openStudentModal() {
      const modal = document.getElementById("student-modal");
      const studyLevelSelect = document.getElementById("student-class");
      studyLevelSelect.innerHTML = `<option value="">${currentLanguage === "km" ? "ជ្រើសរើសកម្រិតសិក្សា" : "Select study level"}</option>${studyLevels.map(level => `<option value="${escapeHTML(level)}">${escapeHTML(level)}</option>`).join("")}`;
      document.getElementById("student-dob").max = localDateValue();
      modal.classList.add("open");
      setTimeout(() => document.getElementById("student-name-khmer").focus(), 0);
    }
    function closeStudentModal() {
      document.getElementById("student-modal").classList.remove("open");
    }
    function openTeacherModal() {
      const modal = document.getElementById("teacher-modal");
      modal.classList.add("open");
      setTimeout(() => document.getElementById("teacher-name").focus(), 0);
    }
    function closeTeacherModal() {
      document.getElementById("teacher-modal").classList.remove("open");
    }
    function showToast(message) {
      const toast = document.getElementById("toast");
      toast.textContent = message;
      toast.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
    }

    function loadTelegramConfig() {
      try {
        const stored = localStorage.getItem(telegramStorageKey);
        if (!stored) return { ...defaultTelegramConfig, notifications: { ...defaultTelegramConfig.notifications } };
        const parsed = JSON.parse(stored);
        if (!parsed || typeof parsed !== "object") throw new Error("Saved Telegram settings have an invalid format.");
        const notifications = parsed.notifications && typeof parsed.notifications === "object" ? parsed.notifications : {};
        return {
          botUsername: typeof parsed.botUsername === "string" ? parsed.botUsername : "",
          notifications: Object.fromEntries(Object.entries(defaultTelegramConfig.notifications).map(([key, defaultValue]) => [
            key, typeof notifications[key] === "boolean" ? notifications[key] : defaultValue
          ]))
        };
      } catch (error) {
        console.error("Could not load Telegram preview settings.", error);
        showToast("Telegram settings could not be loaded. Check browser storage.");
        return { ...defaultTelegramConfig, notifications: { ...defaultTelegramConfig.notifications } };
      }
    }

    function saveTelegramConfig() {
      try {
        localStorage.setItem(telegramStorageKey, JSON.stringify(telegramConfig));
        return true;
      } catch (error) {
        console.error("Could not save Telegram preview settings.", error);
        showToast("Could not save Telegram settings in this browser.");
        return false;
      }
    }

    function exportStudents() {
      const rows = [["Student ID", "Name Khmer", "Name English", "Gender", "Class", "Major", "Study Shift", "Group", "Grade", "Date of birth", "Place of birth", "Personal number", "Parent number", "Status"], ...students.map(student => [student.id, student.nameKhmer || "", student.nameEnglish || (!student.nameKhmer ? student.name : "") || "", student.gender, student.className, student.major || "", student.studyShift || "", student.studentGroup || "", student.grade || "", student.dateOfBirth || "", student.placeOfBirth || "", student.personalNumber || "", student.parentNumber || student.phone || "", student.status])];
      const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\r\n");
      const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "iti-management-students.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showToast("Student list exported as CSV.");
    }

    function closeSearch() {
      const results = document.getElementById("search-results");
      results.classList.remove("open");
      results.innerHTML = "";
    }

    function updateSearch(query) {
      const results = document.getElementById("search-results");
      const value = query.trim().toLowerCase();
      if (!value) {
        closeSearch();
        if (currentPage === "Student List") renderStudents();
        return;
      }
      const matches = students.filter(student => `${student.nameKhmer || ""} ${student.nameEnglish || student.name || ""} ${student.id} ${student.className}`.toLowerCase().includes(value)).slice(0, 5);
      results.innerHTML = matches.length ? matches.map((student, index) => {
        const englishName = student.nameEnglish || student.name || student.nameKhmer || "";
        const initials = englishName.split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase();
        return `<button type="button" role="option" data-student-index="${index}"><span class="student-avatar">${escapeHTML(initials)}</span><span>${escapeHTML(englishName)}${student.nameKhmer ? `<small>${escapeHTML(student.nameKhmer)}</small>` : ""}<small>${escapeHTML(student.id)} · ${escapeHTML(student.className)}</small></span></button>`;
      }).join("") + `<button type="button" data-show-students="true">View all students →</button>` : `<div class="search-empty">No students found. Try another name or class.</div>`;
      results.classList.add("open");
      results.querySelectorAll("[data-student-index]").forEach(button => button.addEventListener("click", () => {
        const student = matches[Number(button.dataset.studentIndex)];
        navigate("Student List", "Students");
        const filter = document.getElementById("table-search");
        if (filter) {
          const query = `${student.nameKhmer || ""} ${student.nameEnglish || student.name || ""}`.trim();
          filter.value = query;
          renderStudents(query);
        }
      }));
      const showAll = results.querySelector("[data-show-students]");
      if (showAll) showAll.addEventListener("click", () => navigate("Student List", "Students"));
    }

    telegramConfig = loadTelegramConfig();
    buildNavigation();
    let initialLanguage = "en";
    try {
      initialLanguage = localStorage.getItem("iti-language") || "en";
    } catch (error) {
      console.error("Could not load language preference.", error);
    }
    setLanguage(initialLanguage);
    updateUserProfile();
    document.getElementById("language-toggle").addEventListener("click", () => {
      setLanguage(currentLanguage === "en" ? "km" : "en");
    });
    document.getElementById("today").textContent = new Intl.DateTimeFormat(initialLanguage === "km" ? "km" : "en", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: window.APP_TIMEZONE || "Asia/Phnom_Penh" }).format(new Date());
    document.getElementById("logout-button").addEventListener("click", logout);
    document.getElementById("login-form").addEventListener("submit", handleLogin);
    document.getElementById("login-form").addEventListener("input", () => {
      const errorMessage = document.getElementById("login-error");
      errorMessage.textContent = "";
      errorMessage.hidden = true;
    });
    document.getElementById("mobile-menu").addEventListener("click", event => {
      const isOpen = sidebar.classList.toggle("open");
      document.getElementById("overlay").classList.toggle("open", isOpen);
      event.currentTarget.setAttribute("aria-expanded", String(isOpen));
    });
    document.getElementById("overlay").addEventListener("click", () => {
      sidebar.classList.remove("open");
      document.getElementById("overlay").classList.remove("open");
      document.getElementById("mobile-menu").setAttribute("aria-expanded", "false");
    });
    document.getElementById("global-search").addEventListener("input", event => updateSearch(event.target.value));
    document.getElementById("global-search").addEventListener("keydown", event => {
      if (event.key === "Escape") closeSearch();
      if (event.key === "Enter") {
        const firstResult = document.querySelector("#search-results [data-student-index]");
        if (firstResult) firstResult.click();
        else if (event.target.value.trim()) {
          navigate("Student List", "Students");
          renderStudents(event.target.value);
        }
      }
    });
    document.addEventListener("click", async event => {
      if (!currentUser) return;
      if (!event.target.closest("#notification-panel, #notification-button")) {
        document.getElementById("notification-panel")?.remove();
      }
      if (!event.target.closest(".search-wrap")) closeSearch();
      const page = event.target.closest("[data-page]");
      if (page) navigate(page.dataset.page);
      const action = event.target.closest("[data-action]");
      if (!action) return;
      if (action.dataset.action === "close-notifications") {
        document.getElementById("notification-panel")?.remove();
      } else if (action.dataset.action === "reload-notifications") {
        await openNotifications(true);
      } else if (action.dataset.action === "add-student") openStudentModal();
      else if (action.dataset.action === "add-teacher") openTeacherModal();
      else if (action.dataset.action === "retry-data-load") {
        try {
          await loadDatabaseData();
          if (currentPage === "Student List") renderStudents();
          else if (currentPage === "Teacher List") renderTeachers();
          else if (currentPage === "Study Levels") renderStudyLevels();
          else navigate(currentPage, currentGroup);
        } catch (error) {
          // Retry failed; the error state remains visible.
        }
      }
      else if (action.dataset.action === "remove-study-level") {
        const level = action.dataset.studyLevel;
        if (!level) return;
        try {
          await apiRequest(`/api/study-levels?name=${encodeURIComponent(level)}`, { method: "DELETE" });
          studyLevels = studyLevels.filter(item => item !== level);
          renderStudyLevels();
          showToast(`Removed study level: ${level}`);
        } catch (error) {
          console.error("Could not remove study level.", error);
          showToast(error.message);
        }
      }
      else if (action.dataset.action === "take-attendance") navigate("Take Attendance", "Attendance");
      else if (action.dataset.action === "export-students") exportStudents();
      else if (action.dataset.action === "download-import-template") downloadImportTemplate();
      else if (action.dataset.action === "cancel-import") navigate("Student List", "Students");
      else if (action.dataset.action === "confirm-import") {
        if (!importPreview || !importPreview.students.length) return;
        const imported = importPreview.students;
        try {
          await apiRequest("/api/students", {
            method: "POST",
            body: JSON.stringify({ students: imported })
          });
          imported.slice().reverse().forEach(student => students.unshift(student));
          importPreview = null;
          navigate("Student List", "Students");
          showToast(`Imported ${imported.length} student${imported.length === 1 ? "" : "s"} into PostgreSQL.`);
        } catch (error) {
          console.error("Could not import student records.", error);
          showToast(error.message);
        }
      }
      else if (action.dataset.action === "test-telegram") showToast("Telegram delivery is managed by the secure server configuration.");
      else if (action.dataset.action === "teacher-room-checkin") {
        await startTeacherCheckinCamera(action.dataset.sessionId);
      } else if (action.dataset.action === "office-checkin") {
        const sessionId = action.dataset.sessionId;
        const note = document.querySelector(`[data-checkin-note="${CSS.escape(sessionId)}"]`)?.value.trim();
        if (!note) {
          showToast("Enter a note before checking in for the teacher.");
          return;
        }
        try {
          await apiRequest(`/api/sessions/${encodeURIComponent(sessionId)}/checkin`, {
            method: "POST",
            body: JSON.stringify({ note })
          });
          showToast("Teacher check-in recorded.");
          await renderNotificationFeature("Needs Review");
        } catch (error) { showToast(error.message); }
      } else if (action.dataset.action === "assign-substitute") {
        const sessionId = action.dataset.sessionId;
        const substituteId = document.querySelector(`[data-substitute-select="${CSS.escape(sessionId)}"]`)?.value;
        if (!substituteId) {
          showToast("Select a substitute teacher.");
          return;
        }
        try {
          await apiRequest(`/api/sessions/${encodeURIComponent(sessionId)}/substitute`, {
            method: "POST",
            body: JSON.stringify({ substitute_teacher_id: substituteId })
          });
          showToast("Substitute assigned.");
          await renderNotificationFeature("Needs Review");
        } catch (error) { showToast(error.message); }
      } else if (action.dataset.action === "cancel-session") {
        if (!window.confirm("Cancel this class session?")) return;
        try {
          await apiRequest(`/api/sessions/${encodeURIComponent(action.dataset.sessionId)}/cancel`, { method: "POST" });
          showToast("Session cancelled.");
          await renderNotificationFeature("Needs Review");
        } catch (error) { showToast(error.message); }
      } else if (action.dataset.action === "connect-telegram") {
        try {
          const link = await apiRequest("/api/me/telegram-link", { method: "POST", body: JSON.stringify({}) });
          window.location.assign(link.url);
        } catch (error) { showToast(error.message); }
      } else if (action.dataset.action === "disconnect-telegram") {
        try {
          await apiRequest("/api/me/telegram-link", { method: "DELETE" });
          await renderNotificationFeature("Guardian Notifications");
        } catch (error) { showToast(error.message); }
      } else if (action.dataset.action === "generate-guardian-link") {
        const guardianId = document.getElementById("guardian-link-user")?.value;
        if (!guardianId) {
          showToast("Select a guardian account.");
          return;
        }
        try {
          const link = await apiRequest("/api/me/telegram-link", {
            method: "POST",
            body: JSON.stringify({ guardian_user_id: guardianId })
          });
          const target = document.getElementById("guardian-link-result");
          const parsedLink = new URL(link.url);
          if (parsedLink.hostname !== "t.me") throw new Error("The server returned an invalid Telegram link.");
          target.replaceChildren();
          target.append(document.createTextNode("One-time link: "));
          const anchor = document.createElement("a");
          anchor.href = parsedLink.href;
          anchor.textContent = parsedLink.href;
          anchor.target = "_blank";
          anchor.rel = "noopener noreferrer";
          target.append(anchor);
        } catch (error) { showToast(error.message); }
      } else if (action.dataset.action === "resend-notification") {
        try {
          await apiRequest(`/api/admin/notifications/${encodeURIComponent(action.dataset.notificationId)}/resend`, { method: "POST" });
          showToast("Notification queued for retry.");
          await renderNotificationFeature("Message Log");
        } catch (error) { showToast(error.message); }
      } else if (action.dataset.action === "regenerate-room-qr") {
        if (!window.confirm("Regenerate this room QR? The old printed card will stop working.")) return;
        try {
          await apiRequest(`/api/admin/rooms/${encodeURIComponent(action.dataset.roomId)}/regenerate`, { method: "POST" });
          await renderNotificationFeature("Room QR Cards");
          showToast("Room QR regenerated. Print the new card.");
        } catch (error) { showToast(error.message); }
      } else if (action.dataset.action === "print-room-cards") {
        window.print();
      } else if (action.dataset.action === "mark-notification-read") {
        try {
          await apiRequest(`/api/notifications/${encodeURIComponent(action.dataset.notificationId)}/read`, { method: "POST" });
          await openNotifications();
        } catch (error) { showToast(error.message); }
      }
      else if (action.dataset.action === "copy-parent-instructions") {
        const username = telegramConfig.botUsername ? `@${telegramConfig.botUsername}` : "your school bot";
        const instructions = `To link your child's school account: open ${username} in Telegram, tap Start, then enter the one-time linking code provided by the school. Never share your Telegram password or bot token.`;
        if (!navigator.clipboard || !window.isSecureContext) {
          showToast("Clipboard access is unavailable here. Select and copy the parent instructions manually.");
        } else {
          navigator.clipboard.writeText(instructions).then(
            () => showToast("Parent instructions copied."),
            error => {
              console.error("Could not copy parent instructions.", error);
              showToast("Could not copy instructions. Please copy them manually.");
            }
          );
        }
      }
      else if (action.dataset.action === "deactivate-user") {
        const userId = action.dataset.userId;
        if (!userId || userId === currentUser.id) return;
        if (!window.confirm("Deactivate this account? The user will no longer be able to sign in.")) return;
        try {
          await apiRequest("/api/users", {
            method: "PATCH",
            body: JSON.stringify({ action: "deactivate", userId })
          });
          showToast("User account deactivated.");
          await renderUsers();
        } catch (error) {
          console.error("Could not deactivate user account.", error);
          showToast(error.message);
        }
      }
      else if (action.dataset.action === "save-attendance") {
        const date = document.getElementById("attendance-date").value;
        if (!date) {
          document.getElementById("attendance-date").focus();
          showToast("Please select an attendance date.");
          return;
        }
        const visibleRows = [...document.querySelectorAll("#attendance-rows tr")].filter(row => !row.hidden);
        const records = [];
        const totals = { Present: 0, Absent: 0, Late: 0 };
        visibleRows.forEach(row => {
          const choice = row.querySelector("input:checked");
          if (!choice) return;
          records.push({ studentId: row.dataset.studentId, status: choice.value });
          totals[choice.value]++;
        });
        try {
          await apiRequest("/api/attendance", {
            method: "PUT",
            body: JSON.stringify({ date, records })
          });
          records.forEach(record => attendanceRecords.set(`${date}|${record.studentId}`, record.status));
          if (date === localDateValue()) {
            attendanceTodaySummary = {
              recorded: [...attendanceRecords.keys()].filter(key => key.startsWith(`${date}|`)).length,
              present: [...attendanceRecords.entries()].filter(([key, status]) => key.startsWith(`${date}|`) && status === "Present").length
            };
          }
          showToast(`Attendance saved to PostgreSQL: ${totals.Present} present, ${totals.Absent} absent, ${totals.Late} late.`);
        } catch (error) {
          console.error("Could not save attendance records.", error);
          showToast(error.message);
        }
      } else if (action.dataset.action === "edit-class") {
        await editClass(action.dataset.classId);
      } else if (action.dataset.action === "delete-class") {
        if (!window.confirm("Delete this class? Any timetable, enrollment, or session references will prevent deletion.")) return;
        try {
          await apiRequest(`/api/classes?id=${encodeURIComponent(action.dataset.classId)}`, { method: "DELETE" });
          showToast("Class deleted.");
          await renderClassesManager();
        } catch (error) { showToast(error.message); }
      } else if (action.dataset.action === "manage-class") {
        const picker = document.getElementById("membership-class");
        if (picker) {
          picker.value = action.dataset.classId;
          await loadClassMembership(picker.value);
          document.getElementById("class-assignment-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else if (action.dataset.action === "remove-class-teacher" || action.dataset.action === "remove-class-student") {
        const type = action.dataset.action === "remove-class-teacher" ? "teachers" : "students";
        const key = type === "teachers" ? "teacher_id" : "student_id";
        const personId = action.dataset[type === "teachers" ? "teacherId" : "studentId"];
        try {
          await apiRequest(`/api/classes/${type}?class_id=${encodeURIComponent(action.dataset.classId)}&${key}=${encodeURIComponent(personId)}`, { method: "DELETE" });
          await loadClassMembership(action.dataset.classId);
          showToast(type === "teachers" ? "Teacher assignment removed." : "Student enrollment removed.");
        } catch (error) { showToast(error.message); }
      } else if (action.dataset.action === "set-current-term") {
        try {
          await apiRequest("/api/terms", { method: "PATCH", body: JSON.stringify({ id: String(action.dataset.termId), action: "set-current" }) });
          showToast("Current term updated.");
          await renderTermsAndShifts();
        } catch (error) { showToast(error.message); }
      } else if (action.dataset.action === "edit-term") {
        await editTerm(action.dataset.termId);
      } else if (action.dataset.action === "delete-term") {
        if (!window.confirm("Delete this term? Terms with timetable slots or sessions cannot be deleted.")) return;
        try {
          await apiRequest(`/api/terms?id=${encodeURIComponent(action.dataset.termId)}`, { method: "DELETE" });
          showToast("Term deleted.");
          await renderTermsAndShifts();
        } catch (error) { showToast(error.message); }
      } else if (action.dataset.action === "delete-shift-period") {
        if (!window.confirm("Remove this shift period? Existing timetable slots may prevent removal.")) return;
        try {
          await apiRequest(`/api/shifts/periods?id=${encodeURIComponent(action.dataset.periodId)}`, { method: "DELETE" });
          showToast("Shift period removed.");
          await renderTermsAndShifts();
        } catch (error) { showToast(error.message); }
      } else if (action.dataset.action === "edit-timetable-slot") {
        const context = activeTimetableContext;
        const slot = context?.slots.find(item => String(item.slot_id) === String(action.dataset.slotId));
        const formElement = document.getElementById("timetable-slot-form");
        if (!slot || !formElement) return;
        formElement.elements.slot_id.value = slot.slot_id;
        formElement.elements.period_key.value = `${slot.weekday}:${slot.period_no}`;
        formElement.elements.subject_id.value = slot.subject_id;
        formElement.elements.teacher_id.value = slot.teacher_id;
        formElement.elements.room.value = slot.room || "";
        formElement.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (action.dataset.action === "delete-timetable-slot") {
        if (!window.confirm("Remove this timetable slot? Slots with recorded session attendance cannot be removed.")) return;
        try {
          await apiRequest(`/api/timetable?slot_id=${encodeURIComponent(action.dataset.slotId)}`, { method: "DELETE" });
          showToast("Timetable slot removed.");
          await renderClassesManager();
        } catch (error) { showToast(error.message); }
      } else if (action.dataset.action === "preview-session-generation") {
        const termId = String(action.dataset.termId);
        const classId = String(action.dataset.classId);
        try {
          const preview = await apiRequest("/api/timetable/generate", {
            method: "POST", body: JSON.stringify({ term_id: termId, class_id: classId, dry_run: true })
          });
          const counts = preview.preview;
          const shouldCreate = window.confirm(
            `Session generation preview\n${counts.to_create} to create\n${counts.existing} already exist\n${counts.holiday_skipped} holiday sessions skipped\n\nGenerate these sessions now?`
          );
          if (!shouldCreate) return;
          const result = await apiRequest("/api/timetable/generate", {
            method: "POST", body: JSON.stringify({ term_id: termId, class_id: classId })
          });
          showToast(`Generated ${result.created} sessions; skipped ${result.skipped}.`);
        } catch (error) { showToast(error.message); }
      } else if (action.dataset.action === "load-attendance-report") {
        await loadAttendanceReport();
      } else if (action.dataset.action === "export-attendance-report") {
        exportAttendanceReport();
      } else if (action.dataset.action === "load-my-attendance") {
        await loadMyAttendanceHistory(
          document.getElementById("history-month")?.value || "",
          document.getElementById("history-term")?.value || ""
        );
      } else if (action.dataset.action === "open-session") {
        selectedAttendanceSessionId = action.dataset.sessionId;
        navigate("Session Attendance", "Attendance");
      } else if (action.dataset.action === "mark-session-present") {
        document.querySelectorAll(".session-status-select").forEach(select => { select.value = "present"; });
      } else if (action.dataset.action === "save-session-attendance") {
        await saveSessionAttendance(action.dataset.sessionId);
      } else if (action.dataset.action === "close-session-attendance") {
        if (!window.confirm("Close attendance for this session and mark every unrecorded student absent?")) return;
        try {
          const result = await apiRequest("/api/attendance/close", {
            method: "POST", body: JSON.stringify({ session_id: String(action.dataset.sessionId) })
          });
          showToast(`Session closed. ${result.marked_absent} students marked absent.`);
          await loadSessionAttendance(action.dataset.sessionId);
        } catch (error) { showToast(error.message); }
      } else if (action.dataset.action === "submit-qr-scan") {
        await scanStudentForSession(action.dataset.sessionId, document.getElementById("qr-student-id")?.value || "");
      } else if (action.dataset.action === "start-qr-camera") {
        await startQrCamera();
      } else if (action.dataset.action === "retry-current-page") {
        navigate(currentPage, currentGroup);
      } else if (action.dataset.action === "notify") showToast("This section is ready to be connected to your school data.");
    });
    document.addEventListener("submit", async event => {
      if (!currentUser) return;
      if (event.target.id === "user-create-form") {
        event.preventDefault();
        const formElement = event.target;
        const form = new FormData(formElement);
        const user = {
          username: String(form.get("username") || "").trim(),
          fullName: String(form.get("fullName") || "").trim(),
          role: String(form.get("role") || ""),
          department: String(form.get("department") || "").trim() || null,
          guardianStudentIds: form.getAll("guardianStudentIds"),
          password: String(form.get("password") || "")
        };
        const submitButton = formElement.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        try {
          await apiRequest("/api/users", { method: "POST", body: JSON.stringify(user) });
          formElement.reset();
          showToast("User account created.");
          await renderUsers();
        } catch (error) {
          console.error("Could not create user account.", error);
          showToast(error.message);
        } finally {
          submitButton.disabled = false;
        }
        return;
      }
      if (event.target.matches(".user-reset-form")) {
        event.preventDefault();
        const formElement = event.target;
        const form = new FormData(formElement);
        try {
          await apiRequest("/api/users", {
            method: "PATCH",
            body: JSON.stringify({
              action: "reset-password",
              userId: formElement.dataset.userId,
              password: String(form.get("password") || "")
            })
          });
          formElement.reset();
          showToast("Password reset successfully.");
        } catch (error) {
          console.error("Could not reset user password.", error);
          showToast(error.message);
        }
        return;
      }
      if (event.target.id === "change-password-form") {
        event.preventDefault();
        const formElement = event.target;
        const form = new FormData(formElement);
        const newPassword = String(form.get("newPassword") || "");
        if (newPassword !== String(form.get("confirmPassword") || "")) {
          showToast(currentLanguage === "km" ? "ពាក្យសម្ងាត់ថ្មីមិនត្រូវគ្នាទេ។" : "The new passwords do not match.");
          return;
        }
        try {
          await apiRequest("/api/auth/password", {
            method: "POST",
            body: JSON.stringify({
              currentPassword: String(form.get("currentPassword") || ""),
              newPassword
            })
          });
          formElement.reset();
          showToast(currentLanguage === "km" ? "បានប្តូរពាក្យសម្ងាត់ដោយជោគជ័យ។" : "Password updated successfully.");
        } catch (error) {
          console.error("Could not change account password.", error);
          showToast(error.message);
        }
        return;
      }
      if (event.target.id === "study-level-form") {
        event.preventDefault();
        const formElement = event.target;
        const form = new FormData(formElement);
        const level = String(form.get("studyLevel") || "").trim();
        if (!level) {
          showToast("Please enter a study level name.");
          return;
        }
        const normalized = level.trim();
        if (studyLevels.includes(normalized)) {
          showToast("This study level already exists.");
          return;
        }
        try {
          await apiRequest("/api/study-levels", {
            method: "POST",
            body: JSON.stringify({ name: normalized })
          });
          studyLevels.push(normalized);
          formElement.reset();
          renderStudyLevels();
          showToast(`Created study level: ${normalized}`);
        } catch (error) {
          console.error("Could not create study level.", error);
          showToast(error.message);
        }
        return;
      }
      if (event.target.id === "telegram-bot-form") {
        event.preventDefault();
        const username = String(new FormData(event.target).get("username") || "").trim().replace(/^@/, "");
        if (username && !/^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(username)) {
          showToast("Enter a valid Telegram bot username (5–32 letters, numbers, or underscores).");
          return;
        }
        telegramConfig.botUsername = username;
        const saved = saveTelegramConfig();
        renderTelegram("Bot Settings");
        if (saved) showToast(username ? `Saved @${username}. Live delivery still needs a backend.` : "Bot username cleared.");
      } else if (event.target.id === "telegram-rules-form") {
        event.preventDefault();
        const form = new FormData(event.target);
        telegramConfig.notifications = Object.fromEntries(Object.keys(defaultTelegramConfig.notifications).map(key => [key, form.has(key)]));
        const saved = saveTelegramConfig();
        renderTelegram("Notification Rules");
        if (saved) showToast("Notification preferences saved in this browser.");
      } else if (event.target.id === "notification-rules-form") {
        event.preventDefault();
        const rules = [...event.target.querySelectorAll('input[type="checkbox"]')].map(input => {
          const [event_type, role] = input.name.split(":");
          return { event_type, role, is_enabled: input.checked };
        });
        try {
          await apiRequest("/api/admin/notification-rules", {
            method: "PUT",
            body: JSON.stringify({ rules })
          });
          showToast("Notification rules saved.");
        } catch (error) { showToast(error.message); }
      }
    });
    document.addEventListener("change", async event => {
      const input = event.target.closest('input[data-action="guardian-preference"]');
      if (!input) return;
      const previous = !input.checked;
      try {
        await apiRequest("/api/me/notification-preferences", {
          method: "PATCH",
          body: JSON.stringify({
            student_id: input.dataset.studentId,
            [input.dataset.preference]: input.checked
          })
        });
        showToast("Notification preference saved.");
      } catch (error) {
        input.checked = previous;
        showToast(error.message);
      }
    });
    document.getElementById("student-form").addEventListener("submit", async event => {
      event.preventDefault();
      const studentForm = event.currentTarget;
      const form = new FormData(studentForm);
      const nameKhmer = String(form.get("nameKhmer") || "").trim();
      const nameEnglish = String(form.get("nameEnglish") || "").trim();
      if (!nameKhmer || !nameEnglish) return;
      const major = String(form.get("major") || "").trim();
      const studyShift = String(form.get("studyShift") || "").trim();
      const studentGroup = String(form.get("studentGroup") || "").trim();
      const grade = String(form.get("grade") || "").trim();
      const student = {
        id: createStudentId(new Set(students.map(student => student.id.toLowerCase()))),
        name: nameEnglish,
        nameKhmer,
        nameEnglish,
        gender: String(form.get("gender")),
        className: String(form.get("className")),
        major,
        studyShift,
        studentGroup,
        grade,
        dateOfBirth: String(form.get("dateOfBirth") || ""),
        placeOfBirth: String(form.get("placeOfBirth") || "").trim(),
        personalNumber: String(form.get("personalNumber") || "").trim(),
        parentNumber: String(form.get("parentNumber") || "").trim(),
        phone: String(form.get("parentNumber") || "").trim(),
        status: "Active"
      };
      try {
        const saveStudent = () => apiRequest("/api/students", {
          method: "POST",
          body: JSON.stringify(student)
        });
        try {
          await saveStudent();
        } catch (error) {
          if (error.code !== "STUDENT_ID_CONFLICT") throw error;
          await loadDatabaseData();
          student.id = createStudentId(new Set(students.map(existing => existing.id.toLowerCase())));
          await saveStudent();
        }
        students.unshift(student);
        closeStudentModal();
        studentForm.reset();
        navigate("Student List", "Students");
        showToast(`${nameEnglish} has been added to the PostgreSQL student directory.`);
      } catch (error) {
        console.error("Could not add student.", error);
        showToast(error.message);
      }
    });
    document.getElementById("teacher-form").addEventListener("submit", async event => {
      event.preventDefault();
      const teacherForm = event.currentTarget;
      const form = new FormData(teacherForm);
      const teacher = {
        id: createTeacherId(new Set(teachers.map(item => item.id.toLowerCase()))),
        nameKhmer: String(form.get("nameKhmer") || "").trim(),
        nameEnglish: String(form.get("nameEnglish") || "").trim(),
        subject: String(form.get("subject") || "").trim(),
        className: String(form.get("className") || "").trim(),
        phone: String(form.get("phone") || "").trim(),
        status: "Active"
      };
      if (!teacher.nameKhmer && !teacher.nameEnglish) {
        showToast("Enter the teacher's Khmer name, English name, or both.");
        return;
      }
      const submitButton = teacherForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      try {
        const saveTeacher = () => apiRequest("/api/teachers", {
          method: "POST",
          body: JSON.stringify(teacher)
        });
        try {
          await saveTeacher();
        } catch (error) {
          if (error.code !== "TEACHER_ID_CONFLICT") throw error;
          await loadDatabaseData();
          teacher.id = createTeacherId(new Set(teachers.map(item => item.id.toLowerCase())));
          await saveTeacher();
        }
        teachers.unshift(teacher);
        closeTeacherModal();
        teacherForm.reset();
        renderTeachers();
        showToast(`${teacher.nameEnglish || teacher.nameKhmer} has been added to the PostgreSQL teacher directory.`);
      } catch (error) {
        console.error("Could not add teacher.", error);
        showToast(error.message);
      } finally {
        submitButton.disabled = false;
      }
    });
    document.getElementById("close-modal").addEventListener("click", closeStudentModal);
    document.getElementById("cancel-modal").addEventListener("click", closeStudentModal);
    document.getElementById("student-modal").addEventListener("click", event => {
      if (event.target.id === "student-modal") closeStudentModal();
    });
    document.getElementById("close-teacher-modal").addEventListener("click", closeTeacherModal);
    document.getElementById("cancel-teacher-modal").addEventListener("click", closeTeacherModal);
    document.getElementById("teacher-modal").addEventListener("click", event => {
      if (event.target.id === "teacher-modal") closeTeacherModal();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeStudentModal();
        closeTeacherModal();
      }
    });
    document.getElementById("notification-button").addEventListener("click", () => openNotifications());
    document.querySelectorAll("[data-footer]").forEach(link => link.addEventListener("click", event => {
      event.preventDefault();
      showToast(`${link.dataset.footer} information coming soon.`);
    }));
    restoreSession();
    window.setInterval(refreshNotificationBell, 60_000);
  