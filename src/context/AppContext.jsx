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
  const lang = 'ar';
  const dir = 'rtl';
  const switchLang = () => {};

  useEffect(() => {
    localStorage.setItem('school_lang', 'ar');
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  }, []);

  const t = (key) => translations['ar']?.[key] || key;

  const [activePillar, setActivePillar] = useState(() => localStorage.getItem('school_pillar') || 'academic');

  // General School Site Settings
  const [siteSettings, setSiteSettings] = useState(() => {
    const saved = localStorage.getItem('school_settings');
    const parsed = saved ? JSON.parse(saved) : initialSchoolSettings;
    const cleanSettings = { 
      recessStartTime: "09:10",
      recessEndTime: "09:30",
      recessLabel: "استراحة ووجبة فطور",
      ...parsed, 
      schoolLogo: parsed?.schoolLogo || "/school-logo.png",
      schoolName: "مركز الدعم التعليمي", 
      schoolNameEn: "Educational Support Center", 
      academicYear: "2026/2027",
      schoolStartTime: "07:30",
      schoolEndTime: "12:00",
      workingHoursStr: "من 07:30 صباحاً حتى 12:00 ظهراً"
    };
    localStorage.setItem('school_settings', JSON.stringify(cleanSettings));
    return cleanSettings;
  });

  const [currentUser, setCurrentUser] = useState(null);

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
  const [classrooms,     setClassrooms]     = useState(() => {
    const raw = dbLoadCollection('school_classrooms', initialClassrooms);
    const cleaned = (raw || []).map(c => ({
      ...c,
      supervisor: (c.supervisor || '').includes('طارق') || (c.supervisor || '').includes('Tarek') ? '' : c.supervisor
    }));
    dbSaveCollection('school_classrooms', cleaned);
    return cleaned;
  });
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

  const updateTimetableSlot = (slotId, updatedFields) => {
    setMasterTimetable((prev) => {
      const updated = prev.map((s) => (s.id === slotId ? { ...s, ...updatedFields } : s));
      dbSaveCollection('school_timetable', updated);
      return updated;
    });
  };

  // ─── Daily Marks & Cumulative Gradebook Registry ───────────────────────────
  const [dailyMarks, setDailyMarks] = useState(() => dbLoadCollection('school_daily_marks', initialDailyMarks));

  // ─── Student Homework & Lesson Submissions Registry ─────────────────────────────
  const [submittedTasks, setSubmittedTasks] = useState(() => dbLoadCollection('school_homework_submissions', {}));

  const addHomeworkSubmission = (submissionRecord) => {
    const subKey = submissionRecord.id || `${submissionRecord.taskId}_${submissionRecord.studentId}`;
    const newRecord = {
      id: subKey,
      status: 'submitted',
      submittedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date().toISOString().split('T')[0],
      ...submissionRecord
    };

    setSubmittedTasks((prev) => {
      const updated = {
        ...prev,
        [subKey]: newRecord,
        [submissionRecord.taskId]: newRecord
      };
      dbSaveCollection('school_homework_submissions', updated);
      return updated;
    });
  };

  const gradeHomeworkSubmission = (subKey, taskId, gradeScore, teacherNote) => {
    setSubmittedTasks((prev) => {
      const existing = prev[subKey] || prev[taskId] || {};
      const updatedRecord = {
        ...existing,
        status: 'graded',
        gradeScore: gradeScore || 'ممتاز (20/20)',
        teacherNote: teacherNote || 'إجابة ممتازة وواضحة 👏'
      };
      const updated = {
        ...prev,
        [subKey]: updatedRecord,
        [taskId]: updatedRecord
      };
      dbSaveCollection('school_homework_submissions', updated);
      return updated;
    });

    setNotifications((prev) => {
      const newNotif = {
        id: `NOT-${Date.now().toString().slice(-4)}`,
        title: `🌟 تم تصحيح وتقييم إجابتك من المعلم!`,
        message: `النتيجة: ${gradeScore || '20/20'} | ملاحظات المعلم: ${teacherNote || 'إجابة ممتازة 👏'}`,
        type: 'grade',
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().split('T')[0],
        read: false,
        targetRole: 'student'
      };
      const updatedNotifs = [newNotif, ...prev];
      dbSaveCollection('school_notifications', updatedNotifs);
      return updatedNotifs;
    });
  };

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

  // Aggregates real-time subject scores dynamically from dailyMarks and exam results
  const getStudentSubjectScores = (studentId) => {
    const studentMarks = (dailyMarks || []).filter((m) => m.studentId === studentId);
    
    // Ensure baseSubjects has system subjects or initial default subjects if empty
    const baseSubjects = (subjects && subjects.length > 0) ? subjects : initialSubjects;
    const subjectMap = {};

    baseSubjects.forEach((sub) => {
      subjectMap[sub.name] = {
        id: sub.id,
        name: sub.name,
        nameEn: sub.nameEn || sub.name,
        hw: 0,
        quiz: 0,
        midterm: 0,
        final: 0,
        total: 0,
        grade: 'غير مرصود'
      };
    });

    // Collect exam results for this student from exams collection
    (exams || []).forEach((ex) => {
      const res = (ex.results || []).find(r => String(r.studentId) === String(studentId));
      if (res && res.score !== undefined && res.score !== null) {
        const subName = ex.subject || ex.title || 'الرياضيات';
        let coreSubName = subName;
        if (subName.includes('(') && subName.includes(')')) {
          const match = subName.match(/\(([^)]+)\)/);
          if (match && match[1]) coreSubName = match[1].trim();
        }

        let targetKey = Object.keys(subjectMap).find(
          (key) => key === coreSubName || key.includes(coreSubName) || coreSubName.includes(key)
        );

        if (!targetKey) {
          targetKey = coreSubName;
          subjectMap[targetKey] = {
            id: `SUB-${Date.now().toString().slice(-4)}`,
            name: targetKey,
            nameEn: targetKey,
            hw: 0, quiz: 0, midterm: 0, final: 0, total: 0, grade: 'غير مرصود'
          };
        }

        const scoreNum = Number(res.score || 0);
        if (scoreNum <= 20) {
          subjectMap[targetKey].quiz = Math.max(subjectMap[targetKey].quiz || 0, scoreNum);
        } else if (scoreNum <= 40) {
          subjectMap[targetKey].final = Math.max(subjectMap[targetKey].final || 0, scoreNum);
        } else {
          subjectMap[targetKey].directTotal = Math.max(subjectMap[targetKey].directTotal || 0, scoreNum);
        }
      }
    });

    // Process dailyMarks for this student
    studentMarks.forEach((m) => {
      const sName = m.subjectName || m.subject;
      if (!sName) return;

      let coreSubName = sName;
      if (sName.includes('(') && sName.includes(')')) {
        const match = sName.match(/\(([^)]+)\)/);
        if (match && match[1]) coreSubName = match[1].trim();
      }

      let targetSubjectKey = Object.keys(subjectMap).find(
        (key) => key === coreSubName || key.includes(coreSubName) || coreSubName.includes(key)
      );

      if (!targetSubjectKey) {
        targetSubjectKey = coreSubName;
        subjectMap[targetSubjectKey] = {
          id: `SUB-${Date.now().toString().slice(-4)}`,
          name: targetSubjectKey,
          nameEn: targetSubjectKey,
          hw: 0, quiz: 0, midterm: 0, final: 0, total: 0, grade: 'غير مرصود'
        };
      }

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
    });

    return Object.values(subjectMap).map((sub) => {
      const hwVal = sub.hw || 0;
      const quizVal = sub.quiz || 0;
      const midtermVal = sub.midterm || 0;
      const finalVal = sub.final || 0;
      
      let total = Math.min(100, Math.max(0, hwVal + quizVal + midtermVal + finalVal));
      if (sub.directTotal && sub.directTotal > total) {
        total = sub.directTotal;
      }

      let grade = 'غير مرصود';
      if (total >= 90) grade = 'ممتاز';
      else if (total >= 80) grade = 'جيد جداً';
      else if (total >= 70) grade = 'جيد';
      else if (total >= 50) grade = 'مقبول';
      else if (total > 0 || (sub.hw > 0 || sub.quiz > 0 || sub.midterm > 0 || sub.final > 0)) grade = 'راسب';
      else grade = 'غير مرصود';

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

  // Dynamic formula helper per user directive: >=90 "ممتاز", >=80 "جيد جداً", >=70 "جيد", >=50 "مقبول", <50 "راسب"
  const calculateStudentLevel = (score) => {
    const val = Number(score) || 0;
    if (val >= 90) return 'ممتاز';
    if (val >= 80) return 'جيد جداً';
    if (val >= 70) return 'جيد';
    if (val >= 50) return 'مقبول';
    return 'راسب';
  };

  // Dynamic formula helper per user directive for Grand Total Score (E15 sum out of 600)
  // =IF(E15>=550,"ممتاز",IF(E15>=500,"جيد جدا",IF(E15>=450,"جيد",IF(E15>=400,"مقبول",IF(E15>=300,"مقبول","راسب")))))
  const calculateGrandTotalLevel = (totalScoreSum) => {
    const sum = Number(totalScoreSum) || 0;
    if (sum >= 550) return 'ممتاز';
    if (sum >= 500) return 'جيد جداً';
    if (sum >= 450) return 'جيد';
    if (sum >= 300) return 'مقبول';
    return 'راسب';
  };

  // System Users (admin/teacher/driver accounts)
  const [systemUsers, setSystemUsers] = useState(() => dbLoadCollection('school_system_users', initialAdmins));

  const [themeMode, setThemeMode] = useState('light');

  const toggleThemeMode = () => {
    setThemeMode('light');
    localStorage.removeItem('school_theme_mode');
    document.documentElement.classList.remove('dark');
  };

  useEffect(() => {
    localStorage.removeItem('school_theme_mode');
    document.documentElement.classList.remove('dark');
  }, []);

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
    // Ensure at least one admin user exists (non-destructive)
    const adminUser = (systemUsers || []).find(u => u.role === 'admin');
    if (!adminUser) {
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
      setSystemUsers(prev => {
        const updatedUsers = [freshAdmin, ...prev.filter(u => u.role !== 'admin')];
        localStorage.setItem('school_system_users', JSON.stringify(updatedUsers));
        dbSaveCollection('school_system_users', updatedUsers);
        return updatedUsers;
      });
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

  // Login logic

  const login = (usernameInput, passwordInput) => {
    const cleanUser = (usernameInput || '').trim().toLowerCase();

    // Master admin credentials fallback override (login only — does NOT wipe data)
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

      // Ensure admin exists in system users without wiping other data
      setSystemUsers(prev => {
        const withoutOldAdmin = prev.filter(u => u.id !== 'USR-01');
        return [masterAdmin, ...withoutOldAdmin];
      });

      setCurrentUser(masterAdmin);
      localStorage.setItem('school_logged_user', JSON.stringify(masterAdmin));
      return { success: true, user: masterAdmin };
    }

    // 1. Search system users (admin, staff, drivers)
    const foundSystem = (systemUsers || []).find(
      (u) => (u.username || '').toLowerCase().trim() === cleanUser && u.password === passwordInput
    );
    if (foundSystem) {
      setCurrentUser(foundSystem);
      if (foundSystem.role === 'student' || foundSystem.role === 'parent') {
        setSelectedStudentId(foundSystem.studentId || foundSystem.id);
      }
      return { success: true, user: foundSystem };
    }

    // 2. Search teachers collection
    const foundTeacher = (teachers || []).find((t) => {
      const matchUsername = (t.username || t.id || '').toLowerCase().trim() === cleanUser;
      const matchPass = t.password ? t.password === passwordInput : passwordInput === '123456';
      return matchUsername && matchPass;
    });

    if (foundTeacher) {
      const teacherUser = {
        ...foundTeacher,
        role: 'teacher',
        roleTitle: `معلم - ${foundTeacher.subject || 'المحتوى التعليمي'}`
      };
      setCurrentUser(teacherUser);
      return { success: true, user: teacherUser };
    }

    // 3. Search students collection
    const foundStudent = (students || []).find((s) => {
      const matchUsername = (s.username || s.id || '').toLowerCase().trim() === cleanUser;
      const matchPass = s.password ? s.password === passwordInput : passwordInput === '123456';
      return matchUsername && matchPass;
    });

    if (foundStudent) {
      if (foundStudent.frozen) {
        return {
          success: false,
          message: lang === 'ar'
            ? '❌ تم تجميد حساب هذا الطالب مؤقتاً! يرجى مراجعة إدارة المدرسة.'
            : '❌ This student account has been frozen. Please contact school administration.'
        };
      }

      const studentUser = {
        id: foundStudent.id,
        studentId: foundStudent.id,
        name: foundStudent.name,
        nameEn: foundStudent.nameEn || foundStudent.name,
        username: foundStudent.username || foundStudent.id,
        role: 'student',
        roleTitle: `طالب (${foundStudent.grade || 'مدرسة الدعم'})`,
        avatar: foundStudent.avatar || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
        grade: foundStudent.grade,
        classRoom: foundStudent.classRoom
      };
      setCurrentUser(studentUser);
      setSelectedStudentId(foundStudent.id);
      return { success: true, user: studentUser };
    }

    return { success: false, message: lang === 'ar' ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : 'Invalid username or password' };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('school_logged_user');
  };

  const updateSiteSettings = (newSettings) => {
    setSiteSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('school_settings', JSON.stringify(updated));
      dbSaveCollection('school_settings', updated);
      return updated;
    });
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
      dbSaveCollection('school_subjects', updated);
      return updated;
    });
  };

  const updateSubject = (id, updatedFields) => {
    setSubjects((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s));
      localStorage.setItem('school_subjects', JSON.stringify(updated));
      dbSaveCollection('school_subjects', updated);
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
      dbSaveCollection('school_grades', updated);
      return updated;
    });
  };

  const updateGrade = (id, updatedFields) => {
    setGrades((prev) => {
      const updated = prev.map((g) => (g.id === id ? { ...g, ...updatedFields } : g));
      localStorage.setItem('school_grades', JSON.stringify(updated));
      dbSaveCollection('school_grades', updated);
      return updated;
    });
  };

  const deleteGrade = (id) => {
    setGrades((prev) => {
      const updated = prev.filter((g) => g.id !== id);
      localStorage.setItem('school_grades', JSON.stringify(updated));
      dbSaveCollection('school_grades', updated);
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
      dbSaveCollection('school_classrooms', updated);
      return updated;
    });
  };

  const updateClassroom = (id, updatedFields) => {
    setClassrooms((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c));
      localStorage.setItem('school_classrooms', JSON.stringify(updated));
      dbSaveCollection('school_classrooms', updated);
      return updated;
    });
  };

  const deleteClassroom = (id) => {
    setClassrooms((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      localStorage.setItem('school_classrooms', JSON.stringify(updated));
      dbSaveCollection('school_classrooms', updated);
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
    const targetId = typeof empId === 'object' ? empId?.id : empId;
    setStaffEmployees((prev) => {
      const updated = prev.map((emp) => {
        if (emp.id === targetId || String(emp.id) === String(targetId)) {
          const today = new Date().toISOString().split('T')[0];
          return {
            ...emp,
            lastSalaryPaidDate: today,
            paidDate: today,
            salaryPaid: true,
            salaryStatus: 'paid'
          };
        }
        return emp;
      });
      localStorage.setItem('school_staff', JSON.stringify(updated));
      dbSaveCollection('school_staff', updated);
      return updated;
    });
  };

  const payTeacherSalary = (teacherId) => {
    const targetId = typeof teacherId === 'object' ? teacherId?.id : teacherId;
    setTeachers((prev) => {
      const updated = prev.map((tch) => {
        if (tch.id === targetId || String(tch.id) === String(targetId)) {
          const today = new Date().toISOString().split('T')[0];
          return {
            ...tch,
            lastSalaryPaidDate: today,
            paidDate: today,
            salaryPaid: true,
            salaryStatus: 'paid'
          };
        }
        return tch;
      });
      localStorage.setItem('school_teachers', JSON.stringify(updated));
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
    let examSubject = 'الرياضيات';

    setExams((prev) => {
      const updated = prev.map((ex) => {
        if (ex.id === examId) {
          examSubject = ex.subject || ex.title || 'الرياضيات';
          const existingResults = ex.results || [];
          const updatedResults = existingResults.filter((r) => String(r.studentId) !== String(studentId));
          updatedResults.push({ studentId, score: Number(score), evaluation });
          return { ...ex, results: updatedResults };
        }
        return ex;
      });
      dbSaveCollection('school_exams', updated);
      return updated;
    });

    // Extract core subject name if title is like "اختبار الرياضيات التقييمي - الشهر الأول (الرياضيات)"
    let coreSubName = examSubject;
    if (examSubject.includes('(') && examSubject.includes(')')) {
      const match = examSubject.match(/\(([^)]+)\)/);
      if (match && match[1]) coreSubName = match[1].trim();
    }

    // Automatically sync into dailyMarks for 100% interconnected report cards & GPA calculation
    setDailyMarks((prev) => {
      const existingIdx = prev.findIndex(m => String(m.studentId) === String(studentId) && (m.examId === examId || m.subjectName === coreSubName));
      const markEntry = {
        id: existingIdx >= 0 ? prev[existingIdx].id : `DM-${Date.now().toString().slice(-4)}`,
        studentId,
        subjectName: coreSubName,
        subject: coreSubName,
        examId,
        score: Number(score),
        maxScore: 100,
        type: 'اختبار قصير',
        notes: evaluation || 'اختبار تقييمي',
        date: new Date().toISOString().split('T')[0]
      };
      let updated;
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = markEntry;
      } else {
        updated = [markEntry, ...prev];
      }
      dbSaveCollection('school_daily_marks', updated);
      return updated;
    });
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
    setMessages((prev) => {
      const updated = [newMsg, ...prev];
      dbSaveCollection('school_messages', updated);
      return updated;
    });

    setNotifications((prev) => {
      const newNotif = {
        id: `NOT-${Date.now().toString().slice(-4)}`,
        title: `💬 رسالة موجهة من المعلم: ${msg.title || 'رسالة جديدة'}`,
        message: msg.content || 'تم إرسال رسالة جديدة لك في البوابة المدرسية.',
        type: 'message',
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().split('T')[0],
        read: false,
        targetGrade: msg.targetGrade,
        targetRole: 'student'
      };
      const updatedNotifs = [newNotif, ...prev];
      dbSaveCollection('school_notifications', updatedNotifs);
      return updatedNotifs;
    });
  };

  const addAgendaItem = (item) => {
    const newItem = {
      id: `AGN-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      ...item
    };
    setAgenda((prev) => {
      const updated = [newItem, ...prev];
      dbSaveCollection('school_agenda', updated);
      return updated;
    });

    setNotifications((prev) => {
      const newNotif = {
        id: `NOT-${Date.now().toString().slice(-4)}`,
        title: `📚 درس/واجب جديد من المعلم: ${item.subject || 'مادة دراسية'}`,
        message: `${item.title || ''} - (${item.grade || ''} - الشعبة ${item.classRoom || 'أ'})`,
        type: 'agenda',
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().split('T')[0],
        read: false,
        targetGrade: item.grade,
        targetSection: item.classRoom,
        targetRole: 'student'
      };
      const updatedNotifs = [newNotif, ...prev];
      dbSaveCollection('school_notifications', updatedNotifs);
      return updatedNotifs;
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
    const payVal = Number(amountUSD || 0);
    if (payVal <= 0) return;

    setStudents((prev) => {
      if (!Array.isArray(prev)) return prev;

      const targetStu = prev.find(s => s && (s.id === studentId || s.name === studentId || String(s.id) === String(studentId)));
      if (!targetStu) return prev;

      const targetPhone = (targetStu.parentPhone || targetStu.phone || '').toString().trim();

      // Find active family members sharing the same phone
      const activeMembers = prev.filter(s => {
        if (!s || s.frozen) return false;
        if (s.id === targetStu.id) return true;
        if (!targetPhone) return false;
        const sPhone = (s.parentPhone || s.phone || '').toString().trim();
        return sPhone && sPhone === targetPhone;
      });

      const membersToCredit = activeMembers.length > 0 ? activeMembers : [targetStu];
      const sharePerMember = payVal / membersToCredit.length;
      const creditIdsSet = new Set(membersToCredit.map(m => m.id));

      const updated = prev.map((s) => {
        if (s && creditIdsSet.has(s.id)) {
          const currentPaid = Number(s.tuitionPaid || 0);
          return { ...s, tuitionPaid: Math.round((currentPaid + sharePerMember) * 100) / 100 };
        }
        return s;
      });

      dbSaveCollection('school_students', updated);
      return updated;
    });
  };

  const registerTutoring = (courseId, studentId, customFee = null) => {
    setTutoringCourses((prev) => {
      const updated = prev.map((c) => {
        if (c.id === courseId) {
          const enrolled = c.enrolledStudentIds || [];
          const feesMap = c.studentFeesMap || {};
          if (!enrolled.includes(studentId)) {
            const nextEnrolled = [...enrolled, studentId];
            if (customFee !== null && customFee !== undefined && customFee !== '') {
              feesMap[studentId] = Number(customFee);
            }
            return { ...c, enrolledStudentIds: nextEnrolled, studentFeesMap: { ...feesMap } };
          } else if (customFee !== null && customFee !== undefined && customFee !== '') {
            feesMap[studentId] = Number(customFee);
            return { ...c, studentFeesMap: { ...feesMap } };
          }
        }
        return c;
      });
      dbSaveCollection('school_tutoring', updated);
      return updated;
    });
  };

  const unregisterTutoring = (courseId, studentId) => {
    setTutoringCourses((prev) => {
      const updated = prev.map((c) => {
        if (c.id === courseId) {
          const nextEnrolled = (c.enrolledStudentIds || []).filter(id => id !== studentId);
          const feesMap = { ...(c.studentFeesMap || {}) };
          const paidMap = { ...(c.studentPaidMap || {}) };
          delete feesMap[studentId];
          delete paidMap[studentId];
          return { ...c, enrolledStudentIds: nextEnrolled, studentFeesMap: feesMap, studentPaidMap: paidMap };
        }
        return c;
      });
      dbSaveCollection('school_tutoring', updated);
      return updated;
    });
  };

  const addTutoringCourse = (courseObj) => {
    const newCourse = {
      id: `TUT-${Math.floor(100 + Math.random() * 900)}`,
      enrolledStudentIds: [],
      studentFeesMap: {},
      studentPaidMap: {},
      color: '#0284C7',
      fee: 50,
      maxSeats: 25,
      ...courseObj
    };
    setTutoringCourses((prev) => {
      const updated = [newCourse, ...prev];
      dbSaveCollection('school_tutoring', updated);
      return updated;
    });
  };

  const deleteTutoringCourse = (courseId) => {
    setTutoringCourses((prev) => {
      const updated = prev.filter((c) => c.id !== courseId);
      dbSaveCollection('school_tutoring', updated);
      return updated;
    });
  };

  const updateTutoringCourse = (courseId, updatedFields) => {
    setTutoringCourses((prev) => {
      const updated = prev.map((c) => (c.id === courseId ? { ...c, ...updatedFields } : c));
      dbSaveCollection('school_tutoring', updated);
      return updated;
    });
  };

  const recordTutoringPayment = (courseId, studentId, amountPaid) => {
    setTutoringCourses((prev) => {
      const updated = prev.map((c) => {
        if (c.id === courseId) {
          const paidMap = { ...(c.studentPaidMap || {}) };
          const currentPaid = Number(paidMap[studentId] || 0);
          paidMap[studentId] = currentPaid + Number(amountPaid);
          return { ...c, studentPaidMap: paidMap };
        }
        return c;
      });
      dbSaveCollection('school_tutoring', updated);
      return updated;
    });
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
      dbSaveCollection('school_students', updated);
      return updated;
    });

    setSystemUsers((prev) => {
      const updatedUsers = prev.filter((u) => u.id !== id && u.studentId !== id);
      localStorage.setItem('school_system_users', JSON.stringify(updatedUsers));
      dbSaveCollection('school_system_users', updatedUsers);
      return updatedUsers;
    });

    // Cascade clean related records for complete interconnected integrity
    setDailyMarks((prev) => {
      const updated = prev.filter((m) => m.studentId !== id);
      localStorage.setItem('school_daily_marks', JSON.stringify(updated));
      dbSaveCollection('school_daily_marks', updated);
      return updated;
    });

    setAttendance((prev) => {
      const updated = prev.filter((a) => a.studentId !== id);
      localStorage.setItem('school_attendance', JSON.stringify(updated));
      dbSaveCollection('school_attendance', updated);
      return updated;
    });

    setBehaviorRecords((prev) => {
      const updated = prev.filter((b) => b.studentId !== id);
      localStorage.setItem('school_behavior', JSON.stringify(updated));
      dbSaveCollection('school_behavior', updated);
      return updated;
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
      dbSaveCollection('school_teachers', updated);
      return updated;
    });

    setSystemUsers((prev) => {
      const updatedUsers = prev.filter((u) => u.id !== id);
      localStorage.setItem('school_system_users', JSON.stringify(updatedUsers));
      dbSaveCollection('school_system_users', updatedUsers);
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
      dbSaveCollection('school_system_users', updated);
      return updated;
    });
  };

  const updateSystemUser = (userId, updatedFields) => {
    setSystemUsers((prev) => {
      const updated = prev.map((u) => (u.id === userId ? { ...u, ...updatedFields } : u));
      localStorage.setItem('school_system_users', JSON.stringify(updated));
      dbSaveCollection('school_system_users', updated);
      return updated;
    });

    // Sync with students array if applicable
    setStudents((prev) => {
      const match = prev.find((s) => s.id === userId || s.username === userId);
      if (match) {
        const updated = prev.map((s) => (s.id === match.id ? {
          ...s,
          ...(updatedFields.name && { name: updatedFields.name }),
          ...(updatedFields.username && { username: updatedFields.username }),
          ...(updatedFields.password && { password: updatedFields.password }),
        } : s));
        localStorage.setItem('school_students', JSON.stringify(updated));
        dbSaveCollection('school_students', updated);
        return updated;
      }
      return prev;
    });

    // Sync with teachers array if applicable
    setTeachers((prev) => {
      const match = prev.find((t) => t.id === userId || t.username === userId);
      if (match) {
        const updated = prev.map((t) => (t.id === match.id ? {
          ...t,
          ...(updatedFields.name && { name: updatedFields.name }),
          ...(updatedFields.username && { username: updatedFields.username }),
          ...(updatedFields.password && { password: updatedFields.password }),
        } : t));
        localStorage.setItem('school_teachers', JSON.stringify(updated));
        dbSaveCollection('school_teachers', updated);
        return updated;
      }
      return prev;
    });
  };

  const updateSystemUserPermissions = (userId, newPermissions) => {
    updateSystemUser(userId, { permissions: newPermissions });
  };

  const deleteSystemUser = (userId) => {
    setSystemUsers((prev) => {
      const updated = prev.filter((u) => u.id !== userId);
      localStorage.setItem('school_system_users', JSON.stringify(updated));
      dbSaveCollection('school_system_users', updated);
      return updated;
    });
  };

  const updateTeacherSalary = (teacherId, newSalary) => {
    const numericSalary = Number(newSalary) || 0;
    setTeachers((prev) => {
      const updated = prev.map((t) => (t.id === teacherId ? { ...t, monthlySalary: numericSalary, baseSalary: numericSalary } : t));
      dbSaveCollection('school_teachers', updated);
      return updated;
    });
  };

  const resetFinancialAccounts = () => {
    setStudents((prev) => {
      const updated = prev.map((s) => ({ ...s, tuitionPaid: 0 }));
      dbSaveCollection('school_students', updated);
      return updated;
    });

    setExpenses([]);
    dbSaveCollection('school_expenses', []);

    setStaffEmployees((prev) => {
      const updated = prev.map((e) => ({ ...e, salaryStatus: 'unpaid', salaryPaid: false, paidDate: null }));
      dbSaveCollection('school_staff', updated);
      return updated;
    });

    setTeachers((prev) => {
      const updated = prev.map((t) => ({ ...t, salaryStatus: 'unpaid', salaryPaid: false, paidDate: null }));
      dbSaveCollection('school_teachers', updated);
      return updated;
    });

    localStorage.removeItem('school_payment_history');
    localStorage.removeItem('school_employee_advances');

    addNotification({
      title: 'تم تصفير وبدء السجلات المالية والأقساط 🧹',
      message: 'تم تصفير الأقساط المدفوعة وسجلات الصرفيات والرواتب بنجاح وبدء سجل مالي جديد.',
      type: 'system'
    });
  };

  // ─── Academic Years Archives & Reset Options ─────────────────────────────
  const [academicYearsArchive, setAcademicYearsArchive] = useState(() => dbLoadCollection('school_academic_years_archive', []));

  const clearDemoData = () => {
    setStudents([]);
    dbSaveCollection('school_students', []);

    setAttendance([]);
    dbSaveCollection('school_attendance', []);

    setDailyMarks([]);
    dbSaveCollection('school_attendance_marks', []);
    dbSaveCollection('school_daily_marks', []);

    setAgenda([]);
    dbSaveCollection('school_agenda', []);

    setMessages([]);
    dbSaveCollection('school_messages', []);

    setBehaviorRecords([]);
    dbSaveCollection('school_behavior', []);

    setNotifications([]);
    dbSaveCollection('school_notifications', []);

    setTutoringCourses(prev => {
      const resetCourses = prev.map(c => ({ ...c, enrolledStudentIds: [], studentFeesMap: {} }));
      dbSaveCollection('school_tutoring', resetCourses);
      return resetCourses;
    });

    addNotification({
      title: 'تم تفريغ البيانات التجريبية 🧹',
      message: 'تم تنظيف المنظومة وتفريغ كافة البيانات التجريبية بنجاح.',
      type: 'system'
    });
  };

  const startNewAcademicYear = (newYearName) => {
    const archiveItem = {
      id: `AY-${Date.now()}`,
      yearName: siteSettings.academicYear || '2025/2026',
      archivedAt: new Date().toISOString(),
      studentsSnapshot: [...students],
      attendanceSnapshot: [...attendance],
      dailyMarksSnapshot: [...dailyMarks],
      agendaSnapshot: [...agenda],
      messagesSnapshot: [...messages]
    };

    const updatedArchives = [archiveItem, ...academicYearsArchive];
    setAcademicYearsArchive(updatedArchives);
    dbSaveCollection('school_academic_years_archive', updatedArchives);

    // Update site settings
    updateSiteSettings({ academicYear: newYearName });

    // Reset tuition paid for new academic year
    const resetStudents = students.map(s => ({
      ...s,
      tuitionPaid: 0
    }));
    setStudents(resetStudents);
    dbSaveCollection('school_students', resetStudents);

    // Reset daily logs for new year
    setAttendance([]);
    dbSaveCollection('school_attendance', []);

    setDailyMarks([]);
    dbSaveCollection('school_attendance_marks', []);
    dbSaveCollection('school_daily_marks', []);

    setAgenda([]);
    dbSaveCollection('school_agenda', []);

    addNotification({
      title: `بدء العام الدراسي الجديد: ${newYearName} 🎓`,
      message: `تم أرشفة العام الدراسي السابق وحفظ سجلاته في الأرشيف وتجهيز المنظومة للعام الجديد.`,
      type: 'system'
    });

    return true;
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
    updateSubject,
    deleteSubject,
    grades,
    addGrade,
    updateGrade,
    deleteGrade,
    classrooms,
    addClassroom,
    updateClassroom,
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
    submittedTasks,
    addHomeworkSubmission,
    gradeHomeworkSubmission,
    tutoringCourses,
    addMessage,
    addAgendaItem,
    updateAgendaItem,
    deleteAgendaItem,
    registerTutoring,
    unregisterTutoring,
    addTutoringCourse,
    deleteTutoringCourse,
    updateTutoringCourse,
    recordTutoringPayment,
    updateBusStatus,
    addStudent,
    addTeacher,
    deleteStudent,
    deleteTeacher,
    updateStudent,
    systemUsers,
    addSystemUser,
    updateSystemUser,
    updateSystemUserPermissions,
    deleteSystemUser,
    generateStrong8CharPassword,
    masterTimetable,
    addTimetableSlot,
    updateTimetableSlot,
    deleteTimetableSlot,
    dailyMarks,
    addDailyMark,
    updateDailyMark,
    deleteDailyMark,
    getStudentSubjectScores,
    getStudentOverallGpa,
    calculateStudentLevel,
    calculateGrandTotalLevel,
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
    getHonorRollStudents,
    academicYearsArchive,
    updateTeacherSalary,
    resetFinancialAccounts,
    clearDemoData,
    startNewAcademicYear
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);

