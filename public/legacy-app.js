
    const groups = [
      { name: "Dashboard", icon: "▦", items: ["Overview", "Attendance Statistics", "Recent Activities"] },
      { name: "Students", icon: "♙", items: ["Student List", "Add Students", "Student Enrollment", "Import from Excel", "Student Documents"] },
      { name: "Teachers", icon: "♧", items: ["Teacher List", "Assign Subject", "Teacher Schedule"] },
      { name: "Classes", icon: "▤", items: ["Classes", "Study Levels", "Sections", "Student Assignment"] },
      { name: "Academics", icon: "▱", items: ["Subject List", "Class Timetable", "Exam Schedule", "Student Results"] },
      { name: "Attendance", icon: "◷", items: ["Take Attendance", "QR Attendance", "Daily Attendance", "Monthly Attendance", "Attendance Reports"] },
      { name: "Finance", icon: "$", items: ["School Fees", "Student Payments", "Invoices", "Expenses", "Financial Reports"] },
      { name: "Community", icon: "♧", items: ["Parent List", "Announcements", "Messages", "School Events"] },
      { name: "Library", icon: "▣", items: ["Books", "Borrow Books", "Return Books", "Library Reports"] },
      { name: "Reports & settings", icon: "⚙", items: ["Student Reports", "Academic Reports", "User Management", "School Information"] },
      { name: "Telegram Integration", icon: "➤", items: ["Bot Settings", "Notification Rules", "Parent Chat Links", "Message Log"] },
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
      return text ? (text[currentLanguage] || text.en) : key;
    }

    function hasPagePermission(page) {
      return Boolean(currentUser && rolePages[currentUser.role]?.includes(page));
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
        const formatter = new Intl.DateTimeFormat(language === "km" ? "km" : "en", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
        today.textContent = formatter.format(new Date());
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
      else if (currentPage === "Take Attendance") renderAttendance();
      else if (currentPage === "Import from Excel") renderImportStudents();
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
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
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
      const canEditAttendance = ["director", "deputy_director", "dept_head", "dept_deputy", "teacher"].includes(currentUser?.role);
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
        const studentOptions = data.students.map(student =>
          `<option value="${escapeHTML(student.id)}">${escapeHTML(student.id)} · ${escapeHTML(student.name || "")} · ${escapeHTML(student.className)}</option>`
        ).join("");
        const teacherOptions = data.teachers.map(teacher =>
          `<option value="${escapeHTML(teacher.id)}">${escapeHTML(teacher.id)} · ${escapeHTML(teacher.name || "")}</option>`
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

        content.innerHTML = pageHeader(uiLabel("User Management", "គ្រប់គ្រងអ្នកប្រើប្រាស់"), uiLabel("Create accounts, assign roles and links, and deactivate or reset accounts.", "បង្កើតគណនី កំណត់តួនាទី និងតំណភ្ជាប់ បិទគណនី ឬកំណត់ពាក្យសម្ងាត់ឡើងវិញ។")) +
          `<section class="panel"><div class="panel-head"><div><h2>${uiLabel("Create user", "បង្កើតអ្នកប្រើប្រាស់")}</h2><p>${uiLabel("Passwords are hashed on the server and never returned to the browser.", "ពាក្យសម្ងាត់ត្រូវបានអ៊ិនគ្រីបនៅលើម៉ាស៊ីនមេ ហើយមិនត្រូវបានបញ្ជូនមកកម្មវិធីរុករកទេ។")}</p></div></div>
            <form id="user-create-form">
              <div class="form-grid">
                <div class="field"><label for="new-user-username">${uiLabel("Username", "ឈ្មោះអ្នកប្រើ")}</label><input id="new-user-username" name="username" required maxlength="120" pattern="[A-Za-z0-9._-]+" autocomplete="off"></div>
                <div class="field"><label for="new-user-name">${uiLabel("Full name", "ឈ្មោះពេញ")}</label><input id="new-user-name" name="fullName" required maxlength="160"></div>
                <div class="field"><label for="new-user-role">${uiLabel("Role", "តួនាទី")}</label><select id="new-user-role" name="role" required><option value="">${uiLabel("Select role", "ជ្រើសរើសតួនាទី")}</option>${roleOptions}</select></div>
                <div class="field user-link-field" data-link="department"><label for="new-user-department">${uiLabel("Department", "ដេប៉ាតឺម៉ង់")}</label><input id="new-user-department" name="department" maxlength="120"></div>
                <div class="field user-link-field" data-link="student"><label for="new-user-student">${uiLabel("Student account link", "ភ្ជាប់គណនីសិស្ស")}</label><select id="new-user-student" name="studentId"><option value="">${uiLabel("Select student", "ជ្រើសរើសសិស្ស")}</option>${studentOptions}</select></div>
                <div class="field user-link-field" data-link="teacher"><label for="new-user-teacher">${uiLabel("Teacher account link", "ភ្ជាប់គណនីគ្រូ")}</label><select id="new-user-teacher" name="teacherId"><option value="">${uiLabel("Select teacher", "ជ្រើសរើសគ្រូ")}</option>${teacherOptions}</select></div>
                <div class="field user-link-field" data-link="guardian"><label for="new-user-children">${uiLabel("Guardian's children", "កូនរបស់អាណាព្យាបាល")}</label><select id="new-user-children" name="guardianStudentIds" multiple size="4">${studentOptions}</select></div>
                <div class="field"><label for="new-user-password">${uiLabel("Initial password (12+ characters)", "ពាក្យសម្ងាត់ដំបូង (យ៉ាងតិច ១២ តួអក្សរ)")}</label><input id="new-user-password" name="password" type="password" minlength="12" maxlength="1024" autocomplete="new-password" required></div>
              </div>
              <div class="telegram-form-actions"><button type="submit" class="btn">${uiLabel("Create user", "បង្កើតអ្នកប្រើប្រាស់")}</button></div>
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
              : link === "student" ? role !== "student"
                : link === "teacher" ? role !== "teacher"
                  : role !== "guardian";
          });
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
      else if (page === "Take Attendance" || page === "Daily Attendance") renderAttendance();
      else if (page === "User Management") renderUsers();
      else if (page === "My Account") renderMyAccount();
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
    document.getElementById("today").textContent = new Intl.DateTimeFormat(initialLanguage === "km" ? "km" : "en", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(new Date());
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
      if (!event.target.closest(".search-wrap")) closeSearch();
      const page = event.target.closest("[data-page]");
      if (page) navigate(page.dataset.page);
      const action = event.target.closest("[data-action]");
      if (!action) return;
      if (action.dataset.action === "add-student") openStudentModal();
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
      else if (action.dataset.action === "test-telegram") showToast("No Telegram backend is connected. Add a secure server endpoint to send messages.");
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
          studentId: String(form.get("studentId") || "") || null,
          teacherId: String(form.get("teacherId") || "") || null,
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
    document.getElementById("notification-button").addEventListener("click", () => showToast("You're all caught up on notifications."));
    document.querySelectorAll("[data-footer]").forEach(link => link.addEventListener("click", event => {
      event.preventDefault();
      showToast(`${link.dataset.footer} information coming soon.`);
    }));
    restoreSession();
  