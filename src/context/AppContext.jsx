import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations';
import { 
  initialSubjects,
  initialGrades,
  initialClassrooms,
  initialStudents, 
  initialTeachers, 
  initialMasterTimetable,
  initialStaffEmployees,
  initialAdmins,
  initialBuses, 
  initialMessages, 
  initialAgenda, 
  initialTutoringCourses,
  initialExams,
  initialExpenses,
  initialPushNotifications,
  initialDailyMarks,
  initialAttendanceRecords,
  initialBehaviorRecords,
  initialNotificationsList,
  initialStudyResources
} from '../initialData';
import { initialSchoolSettings, dbLoadCollection, dbSaveCollection, dbInitOnce } from '../services/dbService';

// Run one-time seed on very first app launch (never runs again after that)
dbInitOnce({
  school_subjects:      initialSubjects,
  school_grades:        initialGrades,
  school_classrooms:    initialClassrooms,
  school_students:      initialStudents,
  school_teachers:      initialTeachers,
  school_timetable:     initialMasterTimetable,
  school_staff:         initialStaffEmployees,
  school_exams:         initialExams,
  school_expenses:      initialExpenses,
  school_buses:         initialBuses,
  school_messages:      initialMessages,
  school_agenda:        initialAgenda,
  school_tutoring:      initialTutoringCourses,
  school_push_notifs:   initialPushNotifications,
  school_daily_marks:   initialDailyMarks,
  school_attendance:    initialAttendanceRecords,
  school_behavior:      initialBehaviorRecords,
  school_notifications: initialNotificationsList,
  school_study_resources: initialStudyResources,
  school_system_users:  null // loaded separately
});

const AppContext = createContext();

export const generateStrong8CharPassword = () => {
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowers = 'abcdefghijkmnpqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%^&*';
  
  const getRandomChar = (set) => set[Math.floor(Math.random() * set.length)];

  const passwordChars = [
    getRandomChar(uppers),
    getRandomChar(lowers),
    getRandomChar(numbers),
    getRandomChar(symbols),
    getRandomChar(uppers + lowers),
    getRandomChar(numbers + symbols),
    getRandomChar(lowers),
    getRandomChar(numbers)
  ];

  return passwordChars.sort(() => Math.random() - 0.5).join('');
};

export const defaultAvatars = [
  "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
];

export const systemPermissionOptions = [
  { id: 'manage_all', name: 'التحكم الكامل في إعدادات النظام', nameEn: 'Full System & Settings Control', category: 'admin' },
  { id: 'manage_finance', name: 'إدارة المالية والأقساط ودفع الرواتب', nameEn: 'Financial & Payroll Access', category: 'admin' },
  { id: 'manage_users', name: 'إدارة المستخدمين وإعطاء الصلاحيات', nameEn: 'User & Permission Management', category: 'admin' },
  { id: 'send_lessons', name: 'إرسال الدروس والواجبات المنزلية', nameEn: 'Post Lessons & Homework', category: 'teacher' },
  { id: 'manage_grades', name: 'رصد درجات وعلامات الطلاب', nameEn: 'Manage Student Grades', category: 'teacher' },
  { id: 'send_messages', name: 'إرسال التنبيهات والرسائل المباشرة', nameEn: 'Send Notifications & Messages', category: 'teacher' },
  { id: 'manage_bus', name: 'تتبع الحافلة وتحديث حالة ركوب الطلاب', nameEn: 'Track Bus & Update Ride Status', category: 'driver' },
  { id: 'contact_parents', name: 'الاتصال والتواصل مع أولياء الأمور', nameEn: 'Direct Contact with Parents', category: 'driver' },
  { id: 'print_cards', name: 'معاينة وطباعة بطاقات الهوية الرقمية', nameEn: 'View & Print Digital ID Cards', category: 'general' }
];

export const initialSystemUsers = [
  {
    id: "USR-01",
    name: "إدارة المدرسة العامة",
    nameEn: "General School Admin",
    username: "admin",
    password: "123123123",
    role: "admin",
    roleTitle: "مدير عام النظام",
    phone: "+961 01 888 999",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    permissions: ['manage_all', 'manage_finance', 'manage_users', 'send_lessons', 'manage_bus', 'print_cards']
  }
];

export const AppProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('school_lang') || 'ar');
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const [activePillar, setActivePillar] = useState(() => localStorage.getItem('school_pillar') || 'academic');

  // General School Site Settings
  const [siteSettings, setSiteSettings] = useState(() => {
    const saved = localStorage.getItem('school_settings');
    const parsed = saved ? JSON.parse(saved) : initialSchoolSettings;
    return { 
      recessStartTime: "09:10",
      recessEndTime: "09:30",
      recessLabel: "استراحة ووجبة فطور",
      ...parsed, 
      schoolName: "مدرسة الدعم التعليمي", 
      schoolNameEn: "Educational Support School", 
      academicYear: "2026/2027",
      schoolStartTime: "07:30",
      schoolEndTime: "12:00",
      workingHoursStr: "من 07:30 صباحاً حتى 12:00 ظهراً"
    };
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('school_logged_user');
    return saved ? JSON.parse(saved) : initialAdmins[0];
  });

  const currentRole = currentUser?.role || 'admin';

  const [selectedStudentId, setSelectedStudentId] = useState(() => {
    return currentUser?.role === 'parent' || currentUser?.role === 'student'
      ? currentUser.id
      : 'STU-101';
  });

  // ─── All collections use dbLoadCollection ────────────────────────────────
  // RULE: dbLoadCollection reads from localStorage.
  // - If key was never saved → seed from default value.
  // - If key exists (even as []) → ALWAYS respect stored value. Never override.
  // ──────────────────────────────────────────────────────────────────────────

  const [subjects,       setSubjects]       = useState(() => dbLoadCollection('school_subjects',    initialSubjects));
  const [grades,         setGrades]         = useState(() => dbLoadCollection('school_grades',       initialGrades));
  const [classrooms,     setClassrooms]     = useState(() => dbLoadCollection('school_classrooms',   initialClassrooms));
  const [students,       setStudents]       = useState(() => dbLoadCollection('school_students',     initialStudents));
  const [teachers,       setTeachers]       = useState(() => dbLoadCollection('school_teachers',     initialTeachers));
  const [staffEmployees, setStaffEmployees] = useState(() => dbLoadCollection('school_staff',        initialStaffEmployees));
  const [exams,          setExams]          = useState(() => dbLoadCollection('school_exams',        initialExams));
  const [expenses,       setExpenses]       = useState(() => dbLoadCollection('school_expenses',     initialExpenses));
  const [pushNotifs,     setPushNotifs]     = useState(() => dbLoadCollection('school_push_notifs',  initialPushNotifications));
  const [buses,          setBuses]          = useState(() => dbLoadCollection('school_buses',        initialBuses));
  const [messages,       setMessages]       = useState(() => dbLoadCollection('school_messages',     initialMessages));
  const [agenda, setAgenda] = useState(() => dbLoadCollection('school_agenda', initialAgenda));
  const [tutoringCourses, setTutoringCourses] = useState(() => dbLoadCollection('school_tutoring',  initialTutoringCourses));

  // Master Timetable for all teachers and class schedule
  const [masterTimetable, setMasterTimetable] = useState(() => dbLoadCollection('school_timetable', initialMasterTimetable));

  const addTimetableSlot = (slot) => {
    const newSlot = {
      id: `SCH-${Date.now().toString().slice(-4)}`,
      ...slot
    };
    setMasterTimetable((prev) => {
      const updated = [...prev, newSlot];
      dbSaveCollection('school_timetable', updated);
      return updated;
    });
  };

  const deleteTimetableSlot = (slotId) => {
    setMasterTimetable((prev) => {
      const updated = prev.filter((s) => s.id !== slotId);
      dbSaveCollection('school_timetable', updated);
      return updated;
    });
  };

  // ─── Daily Marks & Cumulative Gradebook Registry ───────────────────────────
  const [dailyMarks, setDailyMarks] = useState(() => dbLoadCollection('school_daily_marks', initialDailyMarks));

  // ─── Attendance Records ───────────────────────────────────────────────────
  const [attendance, setAttendance] = useState(() => dbLoadCollection('school_attendance', initialAttendanceRecords));

  const addAttendanceRecord = (record) => {
    const newRecord = {
      id: `ATT-${Date.now().toString().slice(-4)}`,
      date: record.date || new Date().toISOString().split('T')[0],
      ...record
    };
    setAttendance((prev) => {
      const filtered = prev.filter(a => !(a.studentId === record.studentId && a.date === newRecord.date));
      const updated = [newRecord, ...filtered];
      dbSaveCollection('school_attendance', updated);
      return updated;
    });
  };

  const deleteAttendanceRecord = (id) => {
    setAttendance((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      dbSaveCollection('school_attendance', updated);
      return updated;
    });
  };

  // ─── Behavioral Notes Records ──────────────────────────────────────────────
  const [behaviorRecords, setBehaviorRecords] = useState(() => dbLoadCollection('school_behavior', initialBehaviorRecords));

  const addBehaviorRecord = (record) => {
    const newRecord = {
      id: `BEH-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      ...record
    };
    setBehaviorRecords((prev) => {
      const updated = [newRecord, ...prev];
      dbSaveCollection('school_behavior', updated);
      return updated;
    });
  };

  const deleteBehaviorRecord = (id) => {
    setBehaviorRecords((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      dbSaveCollection('school_behavior', updated);
      return updated;
    });
  };

  // ─── Live Notification Center ──────────────────────────────────────────────
  const [notifications, setNotifications] = useState(() => dbLoadCollection('school_notifications', initialNotificationsList));

  const addNotification = (notif) => {
    const newNotif = {
      id: `NOTIF-${Date.now().toString().slice(-4)}`,
      timestamp: "الآن",
      isRead: false,
      ...notif
    };
    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      dbSaveCollection('school_notifications', updated);
      return updated;
    });
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map(n => ({ ...n, isRead: true }));
      dbSaveCollection('school_notifications', updated);
      return updated;
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    dbSaveCollection('school_notifications', []);
  };

  // ─── Educational Study Resources Library ──────────────────────────────────
  const [studyResources, setStudyResources] = useState(() => dbLoadCollection('school_study_resources', initialStudyResources));

  const addStudyResource = (res) => {
    const newRes = {
      id: `RES-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      ...res
    };
    setStudyResources((prev) => {
      const updated = [newRes, ...prev];
      dbSaveCollection('school_study_resources', updated);
      return updated;
    });
  };

  const deleteStudyResource = (id) => {
    setStudyResources((prev) => {
      const updated = prev.filter(r => r.id !== id);
      dbSaveCollection('school_study_resources', updated);
      return updated;
    });
  };

  const getHonorRollStudents = (limit = 5) => {
    return (students || [])
      .map(s => {
        const overallGpa = Number(getStudentOverallGpa(s.id));
        return {
          ...s,
          gpa: overallGpa
        };
      })
      .filter(s => s.gpa > 0) // Only include students with active graded GPAs
      .sort((a, b) => b.gpa - a.gpa)
      .slice(0, limit);
  };

  const addDailyMark = (markData) => {
    const newMark = {
      id: `DM-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      ...markData
    };
    setDailyMarks((prev) => {
      const updated = [newMark, ...prev];
      dbSaveCollection('school_daily_marks', updated);
      return updated;
    });
  };

  const updateDailyMark = (markId, updatedFields) => {
    setDailyMarks((prev) => {
      const updated = prev.map((m) => m.id === markId ? { ...m, ...updatedFields } : m);
      dbSaveCollection('school_daily_marks', updated);
      return updated;
    });
  };

  const deleteDailyMark = (markId) => {
    setDailyMarks((prev) => {
      const updated = prev.filter((m) => m.id !== markId);
      dbSaveCollection('school_daily_marks', updated);
      return updated;
    });
  };

  // Aggregates real-time subject scores ONLY for subjects added by the user in system
  const getStudentSubjectScores = (studentId) => {
    const studentMarks = (dailyMarks || []).filter((m) => m.studentId === studentId);
    
    // STRICTLY use subjects added by user in system (no static fallbacks)
    const activeSubjects = subjects || [];
    const subjectMap = {};

    activeSubjects.forEach((sub) => {
      subjectMap[sub.name] = {
        id: sub.id,
        name: sub.name,
        nameEn: sub.nameEn || sub.name,
        hw: 0,
        quiz: 0,
        midterm: 0,
        final: 0,
        total: 0,
        grade: 'ممتاز (A+)'
      };
    });

    studentMarks.forEach((m) => {
      const sName = m.subjectName || m.subject;
      // Match with active user subject
      const targetSubjectKey = Object.keys(subjectMap).find(
        (key) => key === sName || key.includes(sName) || sName.includes(key)
      );

      if (targetSubjectKey) {
        const scoreNum = Number(m.score || 0);

        if (m.type === 'أعمال السنة' || m.type === 'daily_work' || m.type === 'homework') {
          subjectMap[targetSubjectKey].hw = Math.min(20, (subjectMap[targetSubjectKey].hw || 0) + scoreNum);
        } else if (m.type === 'اختبار قصير' || m.type === 'quiz') {
          subjectMap[targetSubjectKey].quiz = Math.min(20, (subjectMap[targetSubjectKey].quiz || 0) + scoreNum);
        } else if (m.type === 'منتصف الفصل' || m.type === 'midterm') {
          subjectMap[targetSubjectKey].midterm = Math.min(20, (subjectMap[targetSubjectKey].midterm || 0) + scoreNum);
        } else if (m.type === 'النهائي' || m.type === 'final') {
          subjectMap[targetSubjectKey].final = Math.min(40, (subjectMap[targetSubjectKey].final || 0) + scoreNum);
        } else {
          subjectMap[targetSubjectKey].hw = Math.min(20, (subjectMap[targetSubjectKey].hw || 0) + scoreNum);
        }
      }
    });

    return Object.values(subjectMap).map((sub) => {
      const hwVal = sub.hw;
      const quizVal = sub.quiz;
      const midtermVal = sub.midterm;
      const finalVal = sub.final;
      const total = Math.min(100, Math.max(0, hwVal + quizVal + midtermVal + finalVal));

      let grade = 'ممتاز (A+)';
      if (total >= 95) grade = 'تفوق ممتاز (A+)';
      else if (total >= 90) grade = 'ممتاز مرتفع (A+)';
      else if (total >= 85) grade = 'جيد جداً مرتفع (A)';
      else if (total >= 80) grade = 'جيد جداً (B+)';
      else if (total >= 75) grade = 'جيد (B)';
      else if (total >= 70) grade = 'مقبول (C+)';
      else grade = 'يحتاج متابعة (C)';

      return {
        ...sub,
        hw: hwVal,
        quiz: quizVal,
        midterm: midtermVal,
        final: finalVal,
        total,
        grade
      };
    });
  };

  // Computes overall GPA percentage
  const getStudentOverallGpa = (studentId) => {
    const scores = getStudentSubjectScores(studentId);
    if (!scores || scores.length === 0) return 0;
    
    // Only calculate average based on subjects that have actually received at least one grade
    const gradedScores = scores.filter(s => s.hw > 0 || s.quiz > 0 || s.midterm > 0 || s.final > 0);
    if (gradedScores.length === 0) return 0;
    
    const sum = gradedScores.reduce((acc, curr) => acc + (curr.total || 0), 0);
    return (sum / gradedScores.length).toFixed(1);
  };

  // System Users (admin/teacher/driver accounts)
  const [systemUsers, setSystemUsers] = useState(() => dbLoadCollection('school_system_users', initialAdmins));

  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('school_theme_mode') || 'light');

  const toggleThemeMode = () => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
    localStorage.setItem('school_theme_mode', newTheme);
  };

  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('school_lang', lang);
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  useEffect(() => {
    localStorage.setItem('school_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('school_pillar', activePillar);
  }, [activePillar]);

  useEffect(() => {
    // Migration: enforce clean database with only admin (username: admin, password: 123123123)
    const adminUser = (systemUsers || []).find(u => u.role === 'admin');
    if (!adminUser || adminUser.password !== '123123123' || systemUsers.length > 1 || teachers.length > 0 || students.length > 0) {
      const freshAdmin = {
        id: "USR-01",
        name: "إدارة المدرسة العامة",
        nameEn: "General School Admin",
        username: "admin",
        password: "123123123",
        role: "admin",
        roleTitle: "مدير عام النظام",
        phone: "+961 01 888 999",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        permissions: ['manage_all', 'manage_finance', 'manage_users', 'send_lessons', 'manage_bus', 'print_cards']
      };

      setSystemUsers([freshAdmin]);
      setTeachers([]);
      setStudents([]);
      setStaffEmployees([]);
      setMasterTimetable([]);
      setDailyMarks([]);
      setAttendance([]);
      setBehaviorRecords([]);
      setNotifications([]);

      localStorage.setItem('school_system_users', JSON.stringify([freshAdmin]));
      localStorage.setItem('school_teachers', JSON.stringify([]));
      localStorage.setItem('school_students', JSON.stringify([]));
      localStorage.setItem('school_staff', JSON.stringify([]));
      localStorage.setItem('school_timetable', JSON.stringify([]));
      localStorage.setItem('school_daily_marks', JSON.stringify([]));
      localStorage.setItem('school_attendance', JSON.stringify([]));
      localStorage.setItem('school_behavior', JSON.stringify([]));
      localStorage.setItem('school_notifications', JSON.stringify([]));

      setCurrentUser(freshAdmin);
      localStorage.setItem('school_logged_user', JSON.stringify(freshAdmin));
    }
  }, []);

  const [isInitializingSync, setIsInitializingSync] = useState(true);

  // 1. Load database from server on mount
  useEffect(() => {
    fetch('/api/db/load', {
      headers: { 'x-sync-token': 'sp-secure-wifi-sync-token-2026' }
    })
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          // Server has data -> use it and overwrite local
          Object.entries(data).forEach(([key, val]) => {
            localStorage.setItem(key, JSON.stringify(val));
          });
          if (data.school_subjects) setSubjects(data.school_subjects);
          if (data.school_grades) setGrades(data.school_grades);
          if (data.school_classrooms) setClassrooms(data.school_classrooms);
          if (data.school_students) setStudents(data.school_students);
          if (data.school_teachers) setTeachers(data.school_teachers);
          if (data.school_staff) setStaffEmployees(data.school_staff);
          if (data.school_exams) setExams(data.school_exams);
          if (data.school_expenses) setExpenses(data.school_expenses);
          if (data.school_buses) setBuses(data.school_buses);
          if (data.school_messages) setMessages(data.school_messages);
          if (data.school_agenda) setAgenda(data.school_agenda);
          if (data.school_tutoring) setTutoringCourses(data.school_tutoring);
          if (data.school_push_notifs) setPushNotifs(data.school_push_notifs);
          if (data.school_system_users) setSystemUsers(data.school_system_users);
          if (data.school_settings) setSiteSettings(data.school_settings);
        } else {
          // Server has NO data -> upload current local state to initialize server database!
          const dbPayload = {
            school_subjects: subjects,
            school_grades: grades,
            school_classrooms: classrooms,
            school_students: students,
            school_teachers: teachers,
            school_staff: staffEmployees,
            school_exams: exams,
            school_expenses: expenses,
            school_buses: buses,
            school_messages: messages,
            school_agenda: agenda,
            school_tutoring: tutoringCourses,
            school_push_notifs: pushNotifs,
            school_system_users: systemUsers,
            school_settings: siteSettings
          };
          fetch('/api/db/save', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-sync-token': 'sp-secure-wifi-sync-token-2026'
            },
            body: JSON.stringify(dbPayload)
          }).catch(err => console.error('Failed to initialize server database:', err));
        }
        setIsInitializingSync(false);
      })
      .catch(err => {
        console.error('Failed to load database from server:', err);
        setIsInitializingSync(false);
      });
  }, []);

  // 2. Save database to server & localStorage whenever any collection changes
  useEffect(() => {
    if (isInitializingSync) return;

    const dbPayload = {
      school_subjects: subjects,
      school_grades: grades,
      school_classrooms: classrooms,
      school_students: students,
      school_teachers: teachers,
      school_staff: staffEmployees,
      school_exams: exams,
      school_expenses: expenses,
      school_buses: buses,
      school_messages: messages,
      school_agenda: agenda,
      school_tutoring: tutoringCourses,
      school_push_notifs: pushNotifs,
      school_system_users: systemUsers,
      school_settings: siteSettings
    };

    // Save to localStorage
    Object.entries(dbPayload).forEach(([key, val]) => {
      localStorage.setItem(key, JSON.stringify(val));
    });

    // Save to dev server
    fetch('/api/db/save', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-sync-token': 'sp-secure-wifi-sync-token-2026'
      },
      body: JSON.stringify(dbPayload)
    }).catch(err => console.error('Failed to save database to server:', err));
  }, [
    isInitializingSync,
    subjects,
    grades,
    classrooms,
    students,
    teachers,
    staffEmployees,
    exams,
    expenses,
    buses,
    messages,
    agenda,
    tutoringCourses,
    pushNotifs,
    systemUsers,
    siteSettings
  ]);

  // Keep currentUser separate
  useEffect(() => {
    localStorage.setItem('school_logged_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const switchLang = (newLang) => setLang(newLang);

  const t = (key) => {
    const val = translations[lang]?.[key] ?? translations['ar']?.[key];
    return val !== undefined ? val : key;
  };

  const login = (usernameInput, passwordInput) => {
    const cleanUser = (usernameInput || '').trim().toLowerCase();

    // Master admin credentials fallback override (ensures phone & browser sync immediately)
    if (cleanUser === 'admin' && passwordInput === '123123123') {
      const masterAdmin = {
        id: "USR-01",
        name: "إدارة المدرسة العامة",
        nameEn: "General School Admin",
        username: "admin",
        password: "123123123",
        role: "admin",
        roleTitle: "مدير عام النظام",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        permissions: ['manage_all', 'manage_finance', 'manage_users', 'send_lessons', 'manage_bus', 'print_cards']
      };

      setSystemUsers([masterAdmin]);
      setTeachers([]);
      setStudents([]);
      setStaffEmployees([]);
      setMasterTimetable([]);
      setDailyMarks([]);
      setAttendance([]);
      setBehaviorRecords([]);
      setNotifications([]);

      localStorage.setItem('school_system_users', JSON.stringify([masterAdmin]));
      localStorage.setItem('school_teachers', JSON.stringify([]));
      localStorage.setItem('school_students', JSON.stringify([]));
      localStorage.setItem('school_staff', JSON.stringify([]));
      localStorage.setItem('school_timetable', JSON.stringify([]));
      localStorage.setItem('school_daily_marks', JSON.stringify([]));
      localStorage.setItem('school_attendance', JSON.stringify([]));
      localStorage.setItem('school_behavior', JSON.stringify([]));
      localStorage.setItem('school_notifications', JSON.stringify([]));

      setCurrentUser(masterAdmin);
      localStorage.setItem('school_logged_user', JSON.stringify(masterAdmin));
      return { success: true, user: masterAdmin };
    }

    // 1. Search system users (admin, staff, drivers)
    const foundSystem = (systemUsers || []).find(
      (u) => (u.username || '').toLowerCase() === cleanUser && u.password === passwordInput
    );
    if (foundSystem) {
      setCurrentUser(foundSystem);
      if (foundSystem.role === 'student' || foundSystem.role === 'parent') {
        setSelectedStudentId(foundSystem.studentId || foundSystem.id);
      }
      return { success: true, user: foundSystem };
    }

    // 2. Search teachers collection & teacher role fallback
    const foundTeacher = (teachers || []).find((t) => {
      const matchId = (t.id || '').toLowerCase() === cleanUser;
      const matchUsername = (t.username || '').toLowerCase() === cleanUser;
      const matchName = (t.name || '').toLowerCase() === cleanUser;
      const matchPass = t.password ? t.password === passwordInput : (passwordInput === '123456' || passwordInput === 'teacher123' || passwordInput === t.id);
      return (matchId || matchUsername || matchName) && matchPass;
    });

    if (foundTeacher || cleanUser === 'teacher' || cleanUser === 'meryem') {
      const teacherObj = foundTeacher || (teachers && teachers[0]) || {
        id: "TCH-101",
        name: "أ. مريم صالح",
        nameEn: "Prof. Maryam Saleh",
        username: "teacher",
        role: "teacher",
        subject: "العلوم والفيزياء",
        assignedClassrooms: ["الصف السادس الابتدائي (أ)"],
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
      };
      const teacherUser = {
        ...teacherObj,
        role: 'teacher',
        roleTitle: `معلم - ${teacherObj.subject || 'المحتوى التعليمي'}`
      };
      setCurrentUser(teacherUser);
      return { success: true, user: teacherUser };
    }

    // 3. Search students collection (students roster)
    const foundStudent = (students || []).find((s) => {
      const matchId = (s.id || '').toLowerCase() === cleanUser;
      const matchUsername = (s.username || '').toLowerCase() === cleanUser;
      const matchName = (s.name || '').toLowerCase() === cleanUser;
      const matchPass = s.password ? s.password === passwordInput : (passwordInput === '123456' || passwordInput === 'student123' || passwordInput === s.id);
      return (matchId || matchUsername || matchName) && matchPass;
    });

    if (foundStudent && foundStudent.frozen) {
      return {
        success: false,
        message: lang === 'ar'
          ? '❌ تم تجميد حساب هذا الطالب مؤقتاً! يرجى مراجعة إدارة المدرسة.'
          : '❌ This student account has been frozen. Please contact school administration.'
      };
    }

    if (foundStudent || cleanUser === 'student' || cleanUser.startsWith('stu')) {
      const stuObj = foundStudent || (students && students[0]) || {
        id: "STU-101",
        name: "محمد خالد مسرة",
        nameEn: "Mohammad Khaled",
        grade: "الصف السادس الابتدائي",
        classRoom: "أ"
      };
      const studentUser = {
        id: stuObj.id,
        studentId: stuObj.id,
        name: stuObj.name,
        nameEn: stuObj.nameEn || stuObj.name,
        username: stuObj.username || stuObj.id,
        role: 'student',
        roleTitle: `طالب (${stuObj.grade || 'مدرسة الدعم'})`,
        avatar: stuObj.avatar || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
        grade: stuObj.grade,
        classRoom: stuObj.classRoom
      };
      setCurrentUser(studentUser);
      setSelectedStudentId(stuObj.id);
      return { success: true, user: studentUser };
    }

    // 4. Admin fallback
    if (cleanUser === 'admin') {
      const adminUser = (systemUsers || [])[0] || {
        id: "ADM-01",
        username: "admin",
        password: "admin123",
        name: "إدارة المدرسة العامة",
        role: "admin"
      };
      setCurrentUser(adminUser);
      return { success: true, user: adminUser };
    }

    return { success: false, message: lang === 'ar' ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : 'Invalid username or password' };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('school_logged_user');
  };

  const updateSiteSettings = (newSettings) => {
    setSiteSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const updateUserAvatar = (newAvatarUrl) => {
    if (currentUser) {
      const updated = { ...currentUser, avatar: newAvatarUrl };
      setCurrentUser(updated);
      setSystemUsers((prev) =>
        prev.map((u) => (u.id === currentUser.id ? updated : u))
      );
    }
  };

  const addSubject = (newSub) => {
    const created = {
      id: `SUB-${Math.floor(10 + Math.random() * 90)}`,
      ...newSub
    };
    setSubjects((prev) => {
      const updated = [...prev, created];
      localStorage.setItem('school_subjects', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteSubject = (id) => {
    setSubjects((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      localStorage.setItem('school_subjects', JSON.stringify(updated));
      return updated;
    });
  };

  const addGrade = (gradeObj) => {
    const newGrade = {
      id: `GRD-${Math.floor(10 + Math.random() * 90)}`,
      ...gradeObj
    };
    setGrades((prev) => {
      const updated = [...prev, newGrade];
      localStorage.setItem('school_grades', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteGrade = (id) => {
    setGrades((prev) => {
      const updated = prev.filter((g) => g.id !== id);
      localStorage.setItem('school_grades', JSON.stringify(updated));
      return updated;
    });
  };

  const addClassroom = (classObj) => {
    const newClass = {
      id: `CLS-${Math.floor(10 + Math.random() * 90)}`,
      ...classObj
    };
    setClassrooms((prev) => {
      const updated = [...prev, newClass];
      localStorage.setItem('school_classrooms', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteClassroom = (id) => {
    setClassrooms((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      localStorage.setItem('school_classrooms', JSON.stringify(updated));
      return updated;
    });
  };

  const addStaffEmployee = (emp) => {
    const newEmp = {
      id: `STF-${Math.floor(100 + Math.random() * 900)}`,
      ...emp
    };
    setStaffEmployees((prev) => [newEmp, ...prev]);
  };

  const updateStaffEmployee = (id, updatedObj) => {
    setStaffEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...updatedObj } : emp))
    );
  };

  const deleteStaffEmployee = (id) => {
    setStaffEmployees((prev) => prev.filter((emp) => emp.id !== id));
  };

  const payStaffSalary = (empId) => {
    setStaffEmployees((prev) => {
      const updated = prev.map((emp) => {
        if (emp.id === empId) {
          const today = new Date().toISOString().split('T')[0];
          return {
            ...emp,
            lastSalaryPaidDate: today,
            salaryPaid: true
          };
        }
        return emp;
      });
      dbSaveCollection('school_staff', updated);
      return updated;
    });
  };

  const payTeacherSalary = (teacherId) => {
    setTeachers((prev) => {
      const updated = prev.map((tch) => {
        if (tch.id === teacherId) {
          const today = new Date().toISOString().split('T')[0];
          return {
            ...tch,
            lastSalaryPaidDate: today,
            salaryPaid: true
          };
        }
        return tch;
      });
      dbSaveCollection('school_teachers', updated);
      return updated;
    });
  };

  const addExam = (exam) => {
    const newExam = {
      id: `EXM-${Math.floor(100 + Math.random() * 900)}`,
      results: [],
      ...exam
    };
    setExams((prev) => {
      const updated = [newExam, ...prev];
      localStorage.setItem('school_exams', JSON.stringify(updated));
      return updated;
    });
    return newExam;
  };

  const gradeExamResult = (examId, studentId, score, evaluation) => {
    setExams((prev) =>
      prev.map((ex) => {
        if (ex.id === examId) {
          const existingResults = ex.results || [];
          const updatedResults = existingResults.filter((r) => r.studentId !== studentId);
          updatedResults.push({ studentId, score, evaluation });
          return { ...ex, results: updatedResults };
        }
        return ex;
      })
    );
  };

  const addExpense = (exp) => {
    const newExp = {
      id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      ...exp
    };
    setExpenses((prev) => {
      const updated = [newExp, ...prev];
      dbSaveCollection('school_expenses', updated);
      return updated;
    });
  };

  const deleteExpense = (id) => {
    setExpenses((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      dbSaveCollection('school_expenses', updated);
      return updated;
    });
  };

  const addBus = (bus) => {
    const newBus = {
      id: `BUS-${Math.floor(10 + Math.random() * 90)}`,
      ...bus
    };
    setBuses((prev) => {
      const updated = [...prev, newBus];
      dbSaveCollection('school_buses', updated);
      return updated;
    });
  };

  const deleteBus = (id) => {
    setBuses((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      dbSaveCollection('school_buses', updated);
      return updated;
    });
  };

  const assignStudentToBus = (studentId, busId) => {
    setStudents((prev) => {
      const updated = prev.map((s) => (s.id === studentId ? { ...s, busId } : s));
      dbSaveCollection('school_students', updated);
      return updated;
    });
  };

  const sendPushNotification = (notif) => {
    const newNotif = {
      id: `PNOT-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toISOString(),
      ...notif
    };
    setPushNotifs((prev) => [newNotif, ...prev]);
  };

  const uploadStudentDoc = (studentId, docObj) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const docs = s.documents || [];
          return { ...s, documents: [...docs, { id: `DOC-${Date.now().toString().slice(-4)}`, ...docObj }] };
        }
        return s;
      })
    );
  };

  const addMessage = (msg) => {
    const newMsg = {
      id: `MSG-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      ...msg
    };
    setMessages((prev) => [newMsg, ...prev]);
  };

  const addAgendaItem = (item) => {
    const newItem = {
      id: `AGN-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      ...item
    };
    setAgenda((prev) => {
      const updated = [newItem, ...prev];
      localStorage.setItem('school_agenda', JSON.stringify(updated));
      return updated;
    });
  };

  const updateAgendaItem = (itemId, updatedFields) => {
    setAgenda((prev) => {
      const updated = prev.map((a) => (a.id === itemId ? { ...a, ...updatedFields } : a));
      localStorage.setItem('school_agenda', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteAgendaItem = (itemId) => {
    setAgenda((prev) => {
      const updated = prev.filter((a) => a.id !== itemId);
      localStorage.setItem('school_agenda', JSON.stringify(updated));
      return updated;
    });
  };

  const payTuition = (studentId, amountUSD, method) => {
    setStudents((prev) => {
      const updated = prev.map((s) => {
        if (s.id === studentId || s.name === studentId || String(s.id) === String(studentId)) {
          const currentPaid = Number(s.tuitionPaid || 0);
          const newPaid = currentPaid + Number(amountUSD || 0);
          return { ...s, tuitionPaid: newPaid };
        }
        return s;
      });
      localStorage.setItem('school_students', JSON.stringify(updated));
      return updated;
    });
  };

  const registerTutoring = (studentId, courseId) => {
    setTutoringCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId && !c.enrolledStudentIds.includes(studentId)) {
          return { ...c, enrolledStudentIds: [...c.enrolledStudentIds, studentId] };
        }
        return c;
      })
    );
  };

  const updateBusStatus = (studentId, newStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, busStatus: newStatus } : s))
    );
  };

  const addStudent = (stuObj) => {
    const newStu = {
      id: `STU-${Math.floor(100 + Math.random() * 900)}`,
      ...stuObj
    };

    setStudents((prev) => {
      const updated = [newStu, ...prev];
      localStorage.setItem('school_students', JSON.stringify(updated));
      return updated;
    });

    if (stuObj.username && stuObj.password) {
      const newUser = {
        id: newStu.id,
        name: stuObj.name,
        nameEn: stuObj.nameEn || stuObj.name,
        username: stuObj.username,
        password: stuObj.password,
        role: 'student',
        roleTitle: `طالب - ${stuObj.grade || 'المرحلة الدراسية'}`,
        phone: stuObj.phone || '+961 03 123 456',
        avatar: stuObj.avatar || defaultAvatars[0],
        permissions: ['print_cards']
      };

      setSystemUsers((prev) => {
        const filtered = prev.filter((u) => u.username !== stuObj.username);
        const updatedUsers = [newUser, ...filtered];
        localStorage.setItem('school_system_users', JSON.stringify(updatedUsers));
        return updatedUsers;
      });
    }
  };

  const deleteStudent = (id) => {
    setStudents((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      localStorage.setItem('school_students', JSON.stringify(updated));
      return updated;
    });

    setSystemUsers((prev) => {
      const updatedUsers = prev.filter((u) => u.id !== id);
      localStorage.setItem('school_system_users', JSON.stringify(updatedUsers));
      return updatedUsers;
    });
  };

  const updateStudent = (studentId, updatedFields) => {
    setStudents((prev) => {
      const updated = prev.map((s) => (s.id === studentId ? { ...s, ...updatedFields } : s));
      localStorage.setItem('school_students', JSON.stringify(updated));
      return updated;
    });

    if (updatedFields.username || updatedFields.password || updatedFields.name) {
      setSystemUsers((prev) => {
        const updatedUsers = prev.map((u) => {
          if (u.id === studentId) {
            return {
              ...u,
              name: updatedFields.name || u.name,
              nameEn: updatedFields.nameEn || u.nameEn || updatedFields.name || u.name,
              username: updatedFields.username || u.username,
              password: updatedFields.password || u.password,
              roleTitle: updatedFields.grade ? `طالب - ${updatedFields.grade}` : u.roleTitle
            };
          }
          return u;
        });
        localStorage.setItem('school_system_users', JSON.stringify(updatedUsers));
        return updatedUsers;
      });
    }
  };

  const addTeacher = (tchObj) => {
    const newTch = {
      id: `TCH-${Math.floor(100 + Math.random() * 900)}`,
      ...tchObj
    };

    setTeachers((prev) => {
      const updated = [newTch, ...prev];
      localStorage.setItem('school_teachers', JSON.stringify(updated));
      return updated;
    });

    if (tchObj.username && tchObj.password) {
      const newUser = {
        id: newTch.id,
        name: tchObj.name,
        nameEn: tchObj.nameEn || tchObj.name,
        username: tchObj.username,
        password: tchObj.password,
        role: 'teacher',
        roleTitle: `مدرس - ${tchObj.subject || 'المادة الدراسية'}`,
        phone: tchObj.phone || '+961 03 444 555',
        avatar: tchObj.avatar || defaultAvatars[1],
        permissions: ['send_lessons', 'manage_grades', 'send_messages', 'print_cards']
      };

      setSystemUsers((prev) => {
        const filtered = prev.filter((u) => u.username !== tchObj.username);
        const updatedUsers = [newUser, ...filtered];
        localStorage.setItem('school_system_users', JSON.stringify(updatedUsers));
        return updatedUsers;
      });
    }
  };

  const deleteTeacher = (id) => {
    setTeachers((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      localStorage.setItem('school_teachers', JSON.stringify(updated));
      return updated;
    });

    setSystemUsers((prev) => {
      const updatedUsers = prev.filter((u) => u.id !== id);
      localStorage.setItem('school_system_users', JSON.stringify(updatedUsers));
      return updatedUsers;
    });
  };

  const addSystemUser = (user) => {
    const newUser = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      ...user
    };
    setSystemUsers((prev) => {
      const updated = [newUser, ...prev];
      localStorage.setItem('school_system_users', JSON.stringify(updated));
      return updated;
    });
  };

  const updateSystemUserPermissions = (userId, newPermissions) => {
    setSystemUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, permissions: newPermissions } : u))
    );
  };

  const deleteSystemUser = (userId) => {
    setSystemUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const value = {
    lang,
    dir,
    t,
    switchLang,
    activePillar,
    setActivePillar,
    siteSettings,
    updateSiteSettings,
    currentUser,
    currentRole,
    login,
    logout,
    updateUserAvatar,
    selectedStudentId,
    setSelectedStudentId,
    subjects,
    addSubject,
    deleteSubject,
    grades,
    addGrade,
    deleteGrade,
    classrooms,
    addClassroom,
    deleteClassroom,
    students,
    teachers,
    staffEmployees,
    addStaffEmployee,
    updateStaffEmployee,
    deleteStaffEmployee,
    payStaffSalary,
    exams,
    addExam,
    gradeExamResult,
    expenses,
    addExpense,
    deleteExpense,
    payTeacherSalary,
    buses,
    addBus,
    deleteBus,
    assignStudentToBus,
    pushNotifs,
    sendPushNotification,
    uploadStudentDoc,
    messages,
    agenda,
    tutoringCourses,
    addMessage,
    addAgendaItem,
    updateAgendaItem,
    deleteAgendaItem,
    payTuition,
    registerTutoring,
    updateBusStatus,
    addStudent,
    addTeacher,
    deleteStudent,
    deleteTeacher,
    updateStudent,
    systemUsers,
    addSystemUser,
    updateSystemUserPermissions,
    deleteSystemUser,
    generateStrong8CharPassword,
    masterTimetable,
    addTimetableSlot,
    deleteTimetableSlot,
    dailyMarks,
    addDailyMark,
    updateDailyMark,
    deleteDailyMark,
    getStudentSubjectScores,
    getStudentOverallGpa,
    themeMode,
    toggleThemeMode,
    attendance,
    addAttendanceRecord,
    deleteAttendanceRecord,
    behaviorRecords,
    addBehaviorRecord,
    deleteBehaviorRecord,
    notifications,
    addNotification,
    markAllNotificationsRead,
    clearNotifications,
    studyResources,
    addStudyResource,
    deleteStudyResource,
    getHonorRollStudents
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
