
    const groups = [
      { name: "Dashboard", icon: "▦", items: ["Overview", "Attendance Statistics", "Recent Activities"] },
      { name: "Students", icon: "♙", items: ["Student List", "Add Student", "Student Enrollment", "Import from Excel", "Student Documents"] },
      { name: "Teachers", icon: "♧", items: ["Teacher List", "Assign Subject", "Teacher Schedule"] },
      { name: "Classes", icon: "▤", items: ["Classes", "Study Levels", "Sections", "Student Assignment"] },
      { name: "Academics", icon: "▱", items: ["Subject List", "Class Timetable", "Exam Schedule", "Student Results"] },
      { name: "Attendance", icon: "◷", items: ["Take Attendance", "Daily Attendance", "Monthly Attendance", "Attendance Reports"] },
      { name: "Finance", icon: "$", items: ["School Fees", "Student Payments", "Invoices", "Expenses", "Financial Reports"] },
      { name: "Community", icon: "♧", items: ["Parent List", "Announcements", "Messages", "School Events"] },
      { name: "Library", icon: "▣", items: ["Books", "Borrow Books", "Return Books", "Library Reports"] },
      { name: "Reports & settings", icon: "⚙", items: ["Student Reports", "Academic Reports", "User Management", "School Information"] },
      { name: "Telegram Integration", icon: "➤", items: ["Bot Settings", "Notification Rules", "Parent Chat Links", "Message Log"] }
    ];
    const studyLevels = ["Vocational", "Associate Degree", "Bachelor Degree"];
    const students = [
      { id: "ST-2401", name: "Sok Dara", gender: "Female", className: "Vocational", parentNumber: "012 345 678", phone: "012 345 678", status: "Active" },
      { id: "ST-2402", name: "Chan Rith", gender: "Male", className: "Associate Degree", parentNumber: "097 222 111", phone: "097 222 111", status: "Active" },
      { id: "ST-2403", name: "Kim Sreyneang", gender: "Female", className: "Bachelor Degree", parentNumber: "096 888 222", phone: "096 888 222", status: "Pending" },
      { id: "ST-2404", name: "Vannak Chea", gender: "Male", className: "Vocational", parentNumber: "012 555 340", phone: "012 555 340", status: "Active" },
      { id: "ST-2405", name: "Srey Mom", gender: "Female", className: "Bachelor Degree", parentNumber: "088 444 190", phone: "088 444 190", status: "Active" }
    ];
    const studentStorageKey = "iti-management-students";
    let importPreview = null;
    const teachers = [
      { id: "TC-010", name: "Sok Rum", subject: "Computer Science", className: "Vocational", phone: "012 888 999", status: "Active" },
      { id: "TC-011", name: "Dara Kim", subject: "Mathematics", className: "Associate Degree", phone: "097 444 222", status: "Active" },
      { id: "TC-012", name: "Srey Mom", subject: "English", className: "Bachelor Degree", phone: "096 555 333", status: "Active" },
      { id: "TC-013", name: "Vannak Chea", subject: "Science", className: "Bachelor Degree", phone: "012 777 018", status: "Active" }
    ];
    const activities = [
      ["♙", "New student enrollment completed", "Sok Dara · Vocational · 10 min ago"],
      ["▤", "Class schedule was updated", "Associate Degree · Mathematics · 35 min ago"],
      ["✓", "Attendance submitted successfully", "Vocational · Today, 08:15 AM"],
      ["$", "Tuition payment received", "Invoice #INV-2045 · 2 hours ago"]
    ];
    const nav = document.getElementById("nav");
    const content = document.getElementById("content");
    const sidebar = document.getElementById("sidebar");
    const attendanceRecords = new Map();
    const telegramStorageKey = "bright-future-telegram-settings";
    const defaultTelegramConfig = {
      botUsername: "",
      notifications: { attendance: true, absence: true, payments: true, announcements: false }
    };
    let telegramConfig = { ...defaultTelegramConfig, notifications: { ...defaultTelegramConfig.notifications } };
    let currentPage = "Overview";
    let currentGroup = "Dashboard";
    let toastTimer;
    let currentLanguage = localStorage.getItem("iti-language") || "en";

    const uiText = {
      "dashboard.greeting": { en: "Good morning, Sokha 👋", km: "សួស្តី សុខា 👋" },
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
      "student.name": { en: "Student name", km: "ឈ្មោះសិស្ស" },
      "student.gender": { en: "Gender", km: "ភេទ" },
      "student.class": { en: "Class", km: "ថ្នាក់" },
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
      "field.gender": { en: "Gender", km: "ភេទ" },
      "field.class.level": { en: "Class / level", km: "ថ្នាក់ / កម្រិត" },
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

    function setLanguage(language) {
      if (!["en", "km"].includes(language)) return;
      currentLanguage = language;
      localStorage.setItem("iti-language", language);
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
      if (currentPage === "Overview") dashboard();
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
    }

    function escapeHTML(value) {
      return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
      })[char]);
    }

    function loadStudentRecords() {
      try {
        const stored = localStorage.getItem(studentStorageKey);
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) throw new Error("Saved student data has an invalid format.");
        return parsed.filter(student =>
          student && typeof student.id === "string" && typeof student.name === "string" && typeof student.className === "string"
        ).map(student => ({
          id: student.id,
          name: student.name,
          gender: typeof student.gender === "string" ? student.gender : "Not specified",
          className: student.className,
          dateOfBirth: typeof student.dateOfBirth === "string" ? student.dateOfBirth : "",
          placeOfBirth: typeof student.placeOfBirth === "string" ? student.placeOfBirth : "",
          personalNumber: typeof student.personalNumber === "string" ? student.personalNumber : "",
          parentNumber: typeof student.parentNumber === "string" ? student.parentNumber : (typeof student.phone === "string" ? student.phone : ""),
          phone: typeof student.parentNumber === "string" ? student.parentNumber : (typeof student.phone === "string" ? student.phone : ""),
          status: typeof student.status === "string" ? student.status : "Active"
        }));
      } catch (error) {
        console.error("Could not load saved student records.", error);
        showToast("Saved student records could not be loaded. Check browser storage.");
        return [];
      }
    }

    function saveStudentRecords() {
      try {
        localStorage.setItem(studentStorageKey, JSON.stringify(students));
        return true;
      } catch (error) {
        console.error("Could not save student records.", error);
        return false;
      }
    }

    function buildNavigation() {
      groups.forEach((group, index) => {
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
        group.items.forEach(item => {
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
      const stats = [
        [t("stats.totalStudents"), "1,284", "↗ 8.2% this year", "♙"],
        [t("stats.teachingStaff"), "64", "↗ 3 new this term", "♧"],
        [t("stats.activeClasses"), "32", "Across 3 study levels", "▤"],
        [t("stats.attendanceToday"), "94.8%", "↗ 2.4% vs. last week", "◷"]
      ];
      const statMarkup = stats.map(([label, value, note, icon]) =>
        `<article class="card stat-card"><div class="stat-top"><span>${escapeHTML(label)}</span><span class="stat-icon" aria-hidden="true">${icon}</span></div><div class="stat-number">${value}</div><div class="stat-note"><span class="trend">${note.startsWith("↗") ? note.slice(0, note.indexOf(" ")) : ""}</span>${note.startsWith("↗") ? note.slice(note.indexOf(" ") + 1) : note}</div></article>`
      ).join("");
      const chart = [82, 91, 86, 96, 89, 94, 76].map((value, index) =>
        `<div class="chart-col"><span class="chart-value">${value}%</span><div class="chart-track"><div class="chart-bar ${index === 4 ? "current" : ""}" style="height:${value}%"></div></div><span class="chart-label">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</span></div>`
      ).join("");
      const activityMarkup = activities.map(([icon, title, detail]) =>
        `<div class="activity"><div class="activity-icon" aria-hidden="true">${icon}</div><div class="activity-text"><strong>${escapeHTML(title)}</strong><small>${escapeHTML(detail)}</small></div></div>`
      ).join("");
      const recentStudents = students.slice(0, 4).map(student => studentRow(student)).join("");
      content.innerHTML = pageHeader(t("dashboard.greeting"), t("dashboard.subtitle"), `<button class="btn" data-action="add-student">${t("add.student")}</button>`) +
        `<div class="cards">${statMarkup}</div>
        <div class="dashboard-grid">
          <section class="panel">
            <div class="panel-head"><div><h2>${t("attendance.overview")}</h2><p>${t("attendance.week")}</p></div><select class="select-small" aria-label="Attendance chart period"><option>${t("this.week")}</option><option>${t("this.month")}</option></select></div>
            <div class="chart" aria-label="Weekly attendance chart">${chart}</div>
          </section>
          <section class="panel">
            <div class="panel-head"><div><h2>${t("recent.activity")}</h2><p>${t("recent.activity.subtitle")}</p></div><button class="text-link" data-page="Recent Activities">${t("view.all")}</button></div>
            <div class="activity-list">${activityMarkup}</div>
          </section>
        </div>
        <div class="bottom-grid">
          <section class="panel">
            <div class="panel-head"><div><h2>${t("recently.enrolled")}</h2><p>${t("recently.enrolled.subtitle")}</p></div><button class="text-link" data-page="Student List">${t("view.all.students")} →</button></div>
            <div class="table-wrap"><table class="table"><thead><tr><th>${t("student.label")}</th><th>${t("student.id")}</th><th>${t("student.class")}</th><th>${t("status")}</th></tr></thead><tbody>${recentStudents}</tbody></table></div>
          </section>
          <section class="panel">
            <div class="panel-head"><div><h2>${t("quick.actions")}</h2><p>${t("quick.actions.subtitle")}</p></div></div>
            <div class="quick-actions">
              <button class="quick-action" data-action="take-attendance"><span class="quick-icon">◷</span><span><strong>${t("take.attendance")}</strong><small>${t("take.attendance.subtitle")}</small></span></button>
              <button class="quick-action" data-action="add-student"><span class="quick-icon">＋</span><span><strong>${t("enroll.student")}</strong><small>${t("enroll.student.subtitle")}</small></span></button>
              <button class="quick-action" data-page="Student Results"><span class="quick-icon">▤</span><span><strong>${t("view.student.results")}</strong><small>${t("view.student.results.subtitle")}</small></span></button>
            </div>
          </section>
        </div>`;
    }

    function studentRow(student) {
      const initials = student.name.split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase();
      const status = student.status === "Active" ? t("status.active") : t("status.pending");
      return `<tr><td><div class="student-cell"><span class="student-avatar">${escapeHTML(initials)}</span>${escapeHTML(student.name)}</div></td><td>${escapeHTML(student.id)}</td><td>${escapeHTML(student.className)}</td><td><span class="badge ${student.status === "Active" ? "active" : "pending"}">${escapeHTML(status)}</span></td></tr>`;
    }

    function renderStudents(query = "") {
      const normalized = query.trim().toLowerCase();
      const filtered = students.filter(student => Object.values(student).some(value => String(value ?? "").toLowerCase().includes(normalized)));
      const rows = filtered.map(student => `<tr><td>${escapeHTML(student.id)}</td><td><div class="student-cell"><span class="student-avatar">${escapeHTML(student.name.split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase())}</span>${escapeHTML(student.name)}</div></td><td>${escapeHTML(student.gender)}</td><td>${escapeHTML(student.className)}</td><td>${escapeHTML(student.dateOfBirth || "—")}</td><td>${escapeHTML(student.placeOfBirth || "—")}</td><td>${escapeHTML(student.personalNumber || "—")}</td><td>${escapeHTML(student.parentNumber || student.phone || "—")}</td><td><span class="badge ${student.status === "Active" ? "active" : "pending"}">${escapeHTML(student.status === "Active" ? t("status.active") : t("status.pending"))}</span></td></tr>`).join("");
      content.innerHTML = pageHeader(t("student.directory.title"), t("student.directory.subtitle"), `<button class="btn" data-action="add-student">${t("add.student")}</button>`) +
        `<section class="panel"><div class="list-toolbar"><input id="table-search" class="list-search" type="search" placeholder="${t("filter.students")}" value="${escapeHTML(query)}" aria-label="Filter student list"><div class="toolbar-actions"><button class="btn secondary" data-page="Import from Excel">${t("import.file")}</button><button class="btn secondary" data-action="export-students">${t("export.csv")}</button></div></div><div class="telegram-notice" style="margin-bottom:14px"><strong>Personal data:</strong> Date of birth, place of birth, personal number, and parent number are stored in this browser only. This prototype has no user access controls or secure server storage.</div><div class="table-wrap"><table class="table"><thead><tr><th>${t("student.id")}</th><th>${t("student.name")}</th><th>${t("student.gender")}</th><th>${t("student.class")}</th><th>${t("student.dob")}</th><th>${t("student.birthplace")}</th><th>${t("student.personal.number")}</th><th>${t("student.parent.number")}</th><th>${t("status")}</th></tr></thead><tbody id="student-rows">${rows || `<tr><td colspan="9"><div class="empty">No students match your search.</div></td></tr>`}</tbody></table></div><div class="page-subtitle" style="margin-top:14px">Showing ${filtered.length} of ${students.length} students</div></section>`;
      const filter = document.getElementById("table-search");
      filter.addEventListener("input", () => renderStudents(filter.value));
      filter.focus({ preventScroll: true });
      filter.setSelectionRange(filter.value.length, filter.value.length);
    }

    function renderTeachers() {
      const rows = teachers.map(teacher => `<tr><td>${escapeHTML(teacher.id)}</td><td>${escapeHTML(teacher.name)}</td><td>${escapeHTML(teacher.subject)}</td><td>${escapeHTML(teacher.className)}</td><td>${escapeHTML(teacher.phone)}</td><td><span class="badge active">${t("status.active")}</span></td></tr>`).join("");
      content.innerHTML = pageHeader(t("teacher.directory.title"), t("teacher.directory.subtitle"), `<button class="btn" data-action="notify">${t("add.teacher")}</button>`) +
        `<section class="panel"><div class="table-wrap"><table class="table"><thead><tr><th>${t("student.id")}</th><th>${t("student.name")}</th><th>Subject</th><th>${t("student.class")}</th><th>Phone</th><th>${t("status")}</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
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
                <li><strong>Student Name</strong> — required</li>
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
          name: ["student name", "full name", "name", "student"],
          gender: ["gender", "sex"],
          className: ["class", "class name", "grade", "section", "grade level"],
          dateOfBirth: ["date of birth", "date of birth (yyyy mm dd)", "dob", "birth date"],
          placeOfBirth: ["place of birth", "birthplace", "birth place"],
          personalNumber: ["personal number", "personal no", "national id", "personal id"],
          parentNumber: ["parent number", "parent phone", "parent phone number", "phone", "phone number", "contact", "contact number"],
          status: ["status", "enrollment status"]
        };
        if (!aliases.name.some(alias => headerIndexes.has(alias)) || !aliases.className.some(alias => headerIndexes.has(alias))) {
          throw new Error("Required columns are missing. Include Student Name and Class in the header row.");
        }
        const staged = [];
        const errors = [];
        const seenIds = new Set(students.map(student => student.id.toLowerCase()));
        const seenNameClasses = new Set(students.map(student => `${student.name.trim().toLowerCase()}|${student.className.trim().toLowerCase()}`));
        rows.slice(1).forEach((row, index) => {
          if (!row.some(value => String(value || "").trim())) return;
          const rowNumber = index + 2;
          const name = readCell(row, headerIndexes, aliases.name);
          const className = readCell(row, headerIndexes, aliases.className);
          if (!name || !className) {
            errors.push(`Row ${rowNumber}: Student Name and Class are required.`);
            return;
          }
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
            gender: readCell(row, headerIndexes, aliases.gender) || "Not specified",
            className,
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
        `<tr><td>${escapeHTML(student.id)}</td><td>${escapeHTML(student.name)}</td><td>${escapeHTML(student.dateOfBirth || "—")}</td><td>${escapeHTML(student.placeOfBirth || "—")}</td><td>${escapeHTML(student.personalNumber || "—")}</td><td>${escapeHTML(student.parentNumber || student.phone || "—")}</td></tr>`
      ).join("");
      const errors = importPreview.errors.length
        ? `<ul class="import-error-list">${importPreview.errors.slice(0, 12).map(error => `<li>${escapeHTML(error)}</li>`).join("")}${importPreview.errors.length > 12 ? `<li>And ${importPreview.errors.length - 12} more row issue(s).</li>` : ""}</ul>`
        : "";
      preview.innerHTML = `<div class="import-summary"><span class="import-count"><strong>${totalRows}</strong> rows read</span><span class="import-count good"><strong>${validRows.length}</strong> ready to import</span><span class="import-count ${importPreview.errors.length ? "bad" : ""}"><strong>${importPreview.errors.length}</strong> skipped</span></div>
        <p class="page-subtitle">Preview of ${escapeHTML(importPreview.fileName)}${validRows.length > 8 ? ` · first 8 of ${validRows.length} valid records` : ""}</p>
        <div class="table-wrap"><table class="table"><thead><tr><th>Student ID</th><th>Student name</th><th>Date of birth</th><th>Place of birth</th><th>Personal number</th><th>Parent number</th></tr></thead><tbody>${previewRows || `<tr><td colspan="6"><div class="empty">There are no valid rows to import.</div></td></tr>`}</tbody></table></div>
        ${errors}<div class="import-actions"><button type="button" class="btn secondary" data-action="cancel-import">Cancel</button><button type="button" class="btn" data-action="confirm-import" ${validRows.length ? "" : "disabled"}>Import ${validRows.length} students</button></div>`;
    }

    function downloadImportTemplate() {
      const csv = [
        ["Student ID", "Student Name", "Gender", "Class", "Date of Birth", "Place of Birth", "Personal Number", "Parent Number", "Status"],
        ["ST-2501", "Dara Sok", "Female", "Vocational", "2013-04-12", "Phnom Penh", "0123456789", "012 345 678", "Active"]
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

    function renderAttendance(selectedClass = "All levels") {
      const date = localDateValue();
      const rows = students.map(student => {
        const selected = attendanceRecords.get(`${date}|${student.id}`) || "Present";
        const choices = ["Present", "Absent", "Late"].map(value =>
          `<label><input type="radio" name="attendance-${escapeHTML(student.id)}" value="${value}" ${selected === value ? "checked" : ""}> ${value}</label>`
        ).join("");
        return `<tr data-student-id="${escapeHTML(student.id)}" data-class="${escapeHTML(student.className)}"><td><div class="student-cell"><span class="student-avatar">${escapeHTML(student.name.split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase())}</span>${escapeHTML(student.name)}</div></td><td>${escapeHTML(student.className)}</td><td><div class="attendance-choice">${choices}</div></td></tr>`;
      }).join("");
      content.innerHTML = pageHeader(t("attendance.title"), t("attendance.subtitle")) +
        `<div class="notice">◷ &nbsp; Attendance is recorded for the selected date and study level.</div><section class="panel"><div class="attendance-controls"><div class="field"><label for="attendance-date">Date</label><input id="attendance-date" type="date" value="${date}"></div><div class="field"><label for="attendance-class">Study level</label><select id="attendance-class"><option>All levels</option>${studyLevels.map(level => `<option>${escapeHTML(level)}</option>`).join("")}</select></div><button class="btn" data-action="save-attendance">Save attendance</button></div><div class="table-wrap"><table class="table"><thead><tr><th>Student</th><th>Study level</th><th>Attendance</th></tr></thead><tbody id="attendance-rows">${rows}</tbody></table></div></section>`;
      document.getElementById("attendance-class").value = selectedClass;
      document.getElementById("attendance-class").addEventListener("change", updateAttendanceClass);
      document.getElementById("attendance-date").addEventListener("change", event => {
        const dateValue = event.target.value;
        document.querySelectorAll("#attendance-rows tr").forEach(row => {
          const selected = attendanceRecords.get(`${dateValue}|${row.dataset.studentId}`) || "Present";
          const radio = row.querySelector(`input[value="${selected}"]`);
          if (radio) radio.checked = true;
        });
      });
      updateAttendanceClass();
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
      const cards = [
        ["View records", `Browse and search your ${title.toLowerCase()} records.`, "▤"],
        ["Add new", `Create a new ${title.toLowerCase()} record.`, "＋"],
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
      else if (page === "Student List" || page === "Student Enrollment") renderStudents();
      else if (page === "Add Student") openStudentModal();
      else if (page === "Import from Excel") renderImportStudents();
      else if (page === "Teacher List") renderTeachers();
      else if (page === "Take Attendance" || page === "Daily Attendance") renderAttendance();
      else if (["Bot Settings", "Notification Rules", "Parent Chat Links", "Message Log"].includes(page)) renderTelegram(page);
      else renderModule(page);
    }

    function openStudentModal() {
      const modal = document.getElementById("student-modal");
      document.getElementById("student-dob").max = localDateValue();
      modal.classList.add("open");
      setTimeout(() => document.getElementById("student-name").focus(), 0);
    }
    function closeStudentModal() {
      document.getElementById("student-modal").classList.remove("open");
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
      const rows = [["Student ID", "Student name", "Gender", "Class", "Date of birth", "Place of birth", "Personal number", "Parent number", "Status"], ...students.map(student => [student.id, student.name, student.gender, student.className, student.dateOfBirth || "", student.placeOfBirth || "", student.personalNumber || "", student.parentNumber || student.phone || "", student.status])];
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
      const matches = students.filter(student => `${student.name} ${student.id} ${student.className}`.toLowerCase().includes(value)).slice(0, 5);
      results.innerHTML = matches.length ? matches.map((student, index) => `<button type="button" role="option" data-student-index="${index}"><span class="student-avatar">${escapeHTML(student.name.split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase())}</span><span>${escapeHTML(student.name)}<small>${escapeHTML(student.id)} · ${escapeHTML(student.className)}</small></span></button>`).join("") + `<button type="button" data-show-students="true">View all students →</button>` : `<div class="search-empty">No students found. Try another name or class.</div>`;
      results.classList.add("open");
      results.querySelectorAll("[data-student-index]").forEach(button => button.addEventListener("click", () => {
        const student = matches[Number(button.dataset.studentIndex)];
        navigate("Student List", "Students");
        const filter = document.getElementById("table-search");
        if (filter) {
          filter.value = student.name;
          renderStudents(student.name);
        }
      }));
      const showAll = results.querySelector("[data-show-students]");
      if (showAll) showAll.addEventListener("click", () => navigate("Student List", "Students"));
    }

    telegramConfig = loadTelegramConfig();
    const savedStudents = loadStudentRecords();
    if (savedStudents.length) students.splice(0, students.length, ...savedStudents);
    buildNavigation();
    const initialLanguage = localStorage.getItem("iti-language") || "en";
    setLanguage(initialLanguage);
    document.getElementById("language-toggle").addEventListener("click", () => {
      setLanguage(currentLanguage === "en" ? "km" : "en");
    });
    document.getElementById("today").textContent = new Intl.DateTimeFormat(initialLanguage === "km" ? "km" : "en", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(new Date());
    navigate("Overview", "Dashboard");
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
    document.addEventListener("click", event => {
      if (!event.target.closest(".search-wrap")) closeSearch();
      const page = event.target.closest("[data-page]");
      if (page) navigate(page.dataset.page);
      const action = event.target.closest("[data-action]");
      if (!action) return;
      if (action.dataset.action === "add-student") openStudentModal();
      else if (action.dataset.action === "take-attendance") navigate("Take Attendance", "Attendance");
      else if (action.dataset.action === "export-students") exportStudents();
      else if (action.dataset.action === "download-import-template") downloadImportTemplate();
      else if (action.dataset.action === "cancel-import") navigate("Student List", "Students");
      else if (action.dataset.action === "confirm-import") {
        if (!importPreview || !importPreview.students.length) return;
        const imported = importPreview.students;
        imported.slice().reverse().forEach(student => students.unshift(student));
        importPreview = null;
        const saved = saveStudentRecords();
        navigate("Student List", "Students");
        showToast(saved
          ? `Imported ${imported.length} student${imported.length === 1 ? "" : "s"} into this browser.`
          : `Imported ${imported.length} student${imported.length === 1 ? "" : "s"} for this session, but browser storage failed.`);
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
      else if (action.dataset.action === "save-attendance") {
        const date = document.getElementById("attendance-date").value;
        if (!date) {
          document.getElementById("attendance-date").focus();
          showToast("Please select an attendance date.");
          return;
        }
        const visibleRows = [...document.querySelectorAll("#attendance-rows tr")].filter(row => !row.hidden);
        const totals = { Present: 0, Absent: 0, Late: 0 };
        visibleRows.forEach(row => {
          const choice = row.querySelector("input:checked");
          if (!choice) return;
          attendanceRecords.set(`${date}|${row.dataset.studentId}`, choice.value);
          totals[choice.value]++;
        });
        showToast(`Attendance saved: ${totals.Present} present, ${totals.Absent} absent, ${totals.Late} late.`);
      } else if (action.dataset.action === "notify") showToast("This section is ready to be connected to your school data.");
    });
    document.addEventListener("submit", event => {
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
    document.getElementById("student-form").addEventListener("submit", event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const name = String(form.get("name") || "").trim();
      if (!name) return;
      students.unshift({
        id: createStudentId(new Set(students.map(student => student.id.toLowerCase()))),
        name,
        gender: String(form.get("gender")),
        className: String(form.get("className")),
        dateOfBirth: String(form.get("dateOfBirth") || ""),
        placeOfBirth: String(form.get("placeOfBirth") || "").trim(),
        personalNumber: String(form.get("personalNumber") || "").trim(),
        parentNumber: String(form.get("parentNumber") || "").trim(),
        phone: String(form.get("parentNumber") || "").trim(),
        status: "Active"
      });
      const saved = saveStudentRecords();
      closeStudentModal();
      event.currentTarget.reset();
      navigate("Student List", "Students");
      showToast(saved ? `${name} has been added to the student directory.` : `${name} was added for this session, but browser storage failed.`);
    });
    document.getElementById("close-modal").addEventListener("click", closeStudentModal);
    document.getElementById("cancel-modal").addEventListener("click", closeStudentModal);
    document.getElementById("student-modal").addEventListener("click", event => {
      if (event.target.id === "student-modal") closeStudentModal();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeStudentModal();
    });
    document.getElementById("notification-button").addEventListener("click", () => showToast("You're all caught up on notifications."));
    document.querySelectorAll("[data-footer]").forEach(link => link.addEventListener("click", event => {
      event.preventDefault();
      showToast(`${link.dataset.footer} information coming soon.`);
    }));
  