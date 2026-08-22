import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { 
  BookOpen, 
  Calendar as CalendarIcon, 
  Plus, 
  UserCheck, 
  UserX, 
  CheckCircle2, 
  FileText,
  Sparkles,
  Zap,
  Trophy,
  Award,
  Clock,
  Check,
  RefreshCw,
  Send,
  Upload,
  Camera,
  Image as ImageIcon,
  HelpCircle,
  Edit3,
  Trash2
} from 'lucide-react';
import { SubjectBadge } from './SubjectBadge';

// Educational Bank for Auto Generation
export const activityBank = {
  "الرياضيات": {
    homework: [
      { title: "حل معادلات الدرجة الأولى بمتغير واحد", homework: "حل التمارين رقم 1، 3، 5 صفحة 42 من الكتاب المدرسي. تأكد من التحقق من صحة النتائج." },
      { title: "حساب مساحة ومحيط الأشكال الهندسية المركبة", homework: "أوجد مساحة الشبه منحرف والمستطيل الموضح بالرسم صفحة 58. اكتب الخطوات بالتفصيل." },
      { title: "مسائل كلامية في النسب المئوية والتناسب", homework: "حساب الخصم والنسبة المئوية للزيادة والنقصان في المسائل من 1 إلى 4 صفحة 75." }
    ],
    lesson: [
      { title: "مفهوم الكسور العشرية والعمليات الحسابية عليها", homework: "شرح طريقة ضرب وقسمة الأعداد العشرية مع أمثلة تطبيقية من الحياة اليومية." },
      { title: "مدخل إلى الهندسة والزوايا المتبادلة والمتناظرة", homework: "دراسة العلاقات بين الزوايا الناتجة عن تقاطع مستقيمين مع مستقيم ثالث." }
    ],
    exam: [
      { title: "اختبار الرياضيات الشهري التقييمي", homework: "يتضمن الاختبار: 5 أسئلة خيارات متعددة + 3 مسائل هندسية + 2 معادلات جبرية.", duration: 60, score: 100 },
      { title: "امتحان منتصف الفصل في الهندسة والجبر", homework: "امتحان شامل يغطي وحدة الأشكال الهندسية والمعادلات الخطية.", duration: 45, score: 50 }
    ],
    competition: [
      { title: "🏆 أولمبياد الرياضيات والسرعة الحسابية", homework: "مسابقة تفاعلية بين الطلاب لحساب العمليات الذهنية السريعة في 15 دقيقة فقط!", duration: 20, score: 100 },
      { title: "🏆 مسابقة تحدي الألغاز والمنطق الرياضي", homework: "حل 5 ألغاز منطقية ورياضية معقدة. الجائزة وسام التفكير الفائق!", duration: 30, score: 50 }
    ]
  },
  "العلوم والفيزياء": {
    homework: [
      { title: "بحث عن دورة الماء في الطبيعة وتأثيرها البيئي", homework: "ارسم مخططاً توضيحياً لدورة الماء واكتب فقرة عن التبخر والتكثف والتهطال." },
      { title: "التفاعلات الكيميائية وتغيرات المادة", homework: "قارن في جدول بين التغير الفيزيائي والتغير الكيميائي مع إعطاء 3 أمثلة لكل منهما." }
    ],
    lesson: [
      { title: "تركيب الخلية الحية (الحيوانية والنباتية)", homework: "دراسة النواة، السيتوبلازم، الغشاء الخلوي، والجدار الخلوي تحت المجهر." },
      { title: "قوانين الحركة والسرعة في الفيزياء", homework: "شرح قانون السرعة = المسافة ÷ الزمن وتطبيقات على السيارات والقطارات." }
    ],
    exam: [
      { title: "اختبار العلوم والفيزياء العملي والنظري", homework: "أسئلة عن أجزاء الخلية، حالات المادة الثلاث، وقوانين القوة والحركة.", duration: 45, score: 100 }
    ],
    competition: [
      { title: "🏆 مسابقة علماء المستقبل واختراع الماكينات", homework: "تقديم تجربة علمية بسيطة أو مجسم فيزياء خلاب وتكريم أفضل مجسم مبتكر!", duration: 40, score: 100 }
    ]
  },
  "اللغة العربية واللغويات": {
    homework: [
      { title: "إعراب الجملة الاسمية والفعلية", homework: "أعرب الجمل الآتية إعراباً تاماً: (العلمُ نورٌ - يقرأُ الطالبُ الكتابَ بحرصٍ)." },
      { title: "تعبير كتابي: أهمية القراءة والتكنولوجيا", homework: "اكتب موضوع تعبير لا يقل عن 120 كلمة موظفاً أدوات الربط وعلامات الترقيم." }
    ],
    lesson: [
      { title: "قواعد الهمزة المتوسطة والمتطرفة", homework: "شرح حالات كتابة الهمزة على الألف والواو والياء والسطر مع تطبيق أمثلة." }
    ],
    exam: [
      { title: "امتحان اللغة العربية في النحو والمطالعة", homework: "يتكون الامتحان من: نص مطالعة + أسئلة استيعاب + قسم قواعد وإعراب.", duration: 60, score: 100 }
    ],
    competition: [
      { title: "🏆 تحدي الإلقاء والشعر والخطابة العربية", homework: "مسابقة إلقاء قصيدة شعرية معبرة ومراعاة قواعد ضبط الحركات والتعبير الجسدي.", duration: 30, score: 50 }
    ]
  },
  "اللغة الإنجليزية": {
    homework: [
      { title: "English Grammar: Present Perfect vs Past Simple", homework: "Complete Exercises A & B on page 34 in the Workbook. Write 5 custom sentences." },
      { title: "Essay Writing: My Dream Career", homework: "Write a short paragraph (80-100 words) describing your future dream job and why." }
    ],
    lesson: [
      { title: "Vocabulary Expansion: Environment & Green Energy", homework: "Learn 10 new vocabulary words related to nature and green energy." }
    ],
    exam: [
      { title: "English Mid-Term Reading & Grammar Exam", homework: "Reading comprehension passage + 10 multiple choice grammar questions + Short essay.", duration: 50, score: 100 }
    ],
    competition: [
      { title: "🏆 Spelling Bee Championship", homework: "Annual school spelling competition. Master 50 challenge words to win the Gold Badge!", duration: 40, score: 100 }
    ]
  },
  "البرمجة والابتكار الرقمي": {
    homework: [
      { title: "كتابة برنامج بسيط بلغة بايثون Python", homework: "اكتب كود يطلب اسم المستخدم وعمره ويطبع رسالة ترحيب مخصصة." },
      { title: "تصميم صفحة ويب بسيطة باستخدام HTML & CSS", homework: "أنشئ ملف index.html يحتوي على عنوان رئيسي وصورة وزر تفاعلي ملون." }
    ],
    lesson: [
      { title: "مفهوم المتغيرات والشروط (If / Else)", homework: "شرح كيفية التفكير البرمجي وبناء المنطق البرمجي لحل المشكلات." }
    ],
    exam: [
      { title: "اختبار البرمجة والتفكير المنطقي العملي", homework: "تصحيح الأخطاء (Debugging) في كود برمجي وكتابة دالة تقرأ مصفوفة.", duration: 60, score: 100 }
    ],
    competition: [
      { title: "🏆 هاكاثون المبرمج الصغير (Hackathon Challenge)", homework: "تحدي بناء لعبة أو تطبيق تفاعلي خلال يوم واحد واختيار أفضل فكرة مبتكرة!", duration: 90, score: 100 }
    ]
  },
  "القرآن والدراسات الإسلامية": {
    homework: [
      { title: "تلاوة وحفظ سورة الملك (الآيات 1-10)", homework: "الاستماع للتلاوة العطرة وحفظ الآيات الكريمة مع تطبيق أحكام التجويد." }
    ],
    lesson: [
      { title: "أحكام النون الساكنة والتنوين (الإظهار والإدغام)", homework: "شرح حروف الإظهار والإدغام واستخراج أمثلة من جزء عم." }
    ],
    exam: [
      { title: "اختبار التلاوة والتجويد والفقه الإسلامي", homework: "تلاوة غيبية للآيات المقررة + أسئلة في أحكام التجويد والسيرة النبوية.", duration: 45, score: 100 }
    ],
    competition: [
      { title: "🏆 مسابقة حفظ وتجويد القرآن الكريم السنوية", homework: "مسابقة قرآنية سنوية لتكريم الحفظة وأصحاب التلاوات المتميزة.", duration: 60, score: 100 }
    ]
  }
};

export const AgendaModule = () => {
  const { lang, t, currentRole, currentUser, agenda = [], addAgendaItem, updateAgendaItem, deleteAgendaItem, students = [], teachers = [] } = useApp();

  const isAr = lang === 'ar';
  const safeStudents = students || [];
  const safeAgenda = agenda || [];

  const currentStudent = safeStudents.find(s => s.id === currentUser?.id || s.name === currentUser?.name) || safeStudents[0];

  const [selectedGrade, setSelectedGrade] = useState(() => currentStudent?.grade || 'الصف السادس');
  const [selectedClass, setSelectedClass] = useState(() => currentStudent?.classRoom || currentStudent?.classroom || 'أ');

  useEffect(() => {
    if (currentStudent && (currentRole === 'student' || currentRole === 'parent')) {
      if (currentStudent.grade) setSelectedGrade(currentStudent.grade);
      if (currentStudent.classRoom || currentStudent.classroom) setSelectedClass(currentStudent.classRoom || currentStudent.classroom);
    }
  }, [currentStudent, currentRole]);

  // Selected Calendar Date state (default to today)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterByDate, setFilterByDate] = useState(false); // Default to show all lessons & history
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'lesson', 'homework', 'exam'

  // Edit Lesson Modal State
  const [showEditModal, setShowEditModal] = useState(null);
  const [editSubject, setEditSubject] = useState('الرياضيات');
  const [editTitle, setEditTitle] = useState('');
  const [editHomework, setEditHomework] = useState('');
  const [editActivityType, setEditActivityType] = useState('homework');
  const [editExamDuration, setEditExamDuration] = useState('');
  const [editTotalScore, setEditTotalScore] = useState('');

  const handleEditClick = (item) => {
    setShowEditModal(item);
    setEditSubject(item.subject || 'الرياضيات');
    setEditTitle(item.title || '');
    setEditHomework(item.homework || '');
    setEditActivityType(item.activityType || 'homework');
    setEditExamDuration(item.examDuration || '');
    setEditTotalScore(item.totalScore || '');
  };

  const handleUpdateHomeworkSubmit = (e) => {
    e.preventDefault();
    if (!showEditModal || !editTitle) return;

    updateAgendaItem(showEditModal.id, {
      subject: editSubject,
      title: editTitle,
      titleEn: editTitle,
      homework: editHomework,
      homeworkEn: editHomework,
      activityType: editActivityType,
      examDuration: editExamDuration || null,
      totalScore: editTotalScore || null
    });

    setShowEditModal(null);
    setToastMessage('✅ تم تحديث وحفظ بيانات الدرس والنشاط بنجاح!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleDeleteAgendaItem = (itemId) => {
    if (window.confirm(isAr ? 'هل أنت تأكد من حذف هذا الدرس / الواجب من الأجندة؟' : 'Are you sure you want to delete this agenda item?')) {
      deleteAgendaItem(itemId);
      setToastMessage('🗑️ تم حذف الدرس والفعالية من الأجندة بنجاح!');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  // Student Review Completed State (persisted in localStorage)
  const [completedLessons, setCompletedLessons] = useState(() => {
    try { return JSON.parse(localStorage.getItem('school_completed_lessons') || '[]'); }
    catch { return []; }
  });

  const toggleLessonCompleted = (lessonId) => {
    const updated = completedLessons.includes(lessonId)
      ? completedLessons.filter(id => id !== lessonId)
      : [...completedLessons, lessonId];
    setCompletedLessons(updated);
    localStorage.setItem('school_completed_lessons', JSON.stringify(updated));
  };

  // Online Homework Submission State
  const [submitHomeworkModal, setSubmitHomeworkModal] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFileNote, setSubmissionFileNote] = useState('');
  const [submissionImage, setSubmissionImage] = useState('');
  const [submittedTasks, setSubmittedTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('school_homework_submissions') || '{}'); }
    catch { return {}; }
  });

  const handleHomeworkPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSubmissionImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitHomeworkResponse = (e) => {
    e.preventDefault();
    if (!submitHomeworkModal) return;
    const taskId = submitHomeworkModal.id;
    const record = {
      taskId,
      taskTitle: submitHomeworkModal.title,
      subject: submitHomeworkModal.subject,
      text: submissionText,
      fileNote: submissionFileNote,
      image: submissionImage,
      submittedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date().toISOString().split('T')[0]
    };
    const updated = { ...submittedTasks, [taskId]: record };
    setSubmittedTasks(updated);
    localStorage.setItem('school_homework_submissions', JSON.stringify(updated));
    setSubmitHomeworkModal(null);
    setSubmissionText('');
    setSubmissionFileNote('');
    setSubmissionImage('');
    setToastMessage('📥 تم تسليم حل الواجب وصورة الإجابة بنجاح!');
    setTimeout(() => setToastMessage(''), 3500);
  };

  // New Homework Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [subject, setSubject] = useState('الرياضيات');
  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [homework, setHomework] = useState('');
  const [homeworkEn, setHomeworkEn] = useState('');
  const [activityType, setActivityType] = useState('homework'); // homework, lesson, exam, competition
  const [examDuration, setExamDuration] = useState('');
  const [totalScore, setTotalScore] = useState('');

  // Toast State
  const [toastMessage, setToastMessage] = useState('');

  // Attendance Tracker State
  const [attendanceState, setAttendanceState] = useState(() => {
    const initial = {};
    safeStudents.forEach((s) => { initial[s.id] = 'present'; });
    return initial;
  });

  const [attendanceSavedToast, setAttendanceSavedToast] = useState(false);

  // ── Smart Single Activity Auto Generator ─────────────────────────
  const handleAutoGenerateSingle = (chosenSub = subject, chosenType = activityType) => {
    const bank = activityBank[chosenSub] || activityBank["الرياضيات"];
    const typeItems = bank[chosenType] || bank.homework;
    const randomItem = typeItems[Math.floor(Math.random() * typeItems.length)];

    setTitle(randomItem.title);
    setTitleEn(randomItem.title);
    setHomework(randomItem.homework);
    setHomeworkEn(randomItem.homework);
    if (randomItem.duration) setExamDuration(String(randomItem.duration));
    if (randomItem.score) setTotalScore(String(randomItem.score));

    setToastMessage(`تم توليد نشاط تلقائي للمادة: (${chosenSub}) 🪄`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // ── Smart Full Week Schedule Batch Generator ──────────────────────
  const handleBatchGenerateWeek = () => {
    const subjectsList = Object.keys(activityBank);
    let addedCount = 0;

    subjectsList.forEach((subName) => {
      const bank = activityBank[subName];
      // Add 1 homework
      const hw = bank.homework[Math.floor(Math.random() * bank.homework.length)];
      addAgendaItem({
        date: selectedDate,
        grade: selectedGrade,
        classRoom: selectedClass,
        subject: subName,
        title: hw.title,
        titleEn: hw.title,
        homework: hw.homework,
        homeworkEn: hw.homework,
        dueDate: selectedDate,
        activityType: 'homework'
      });

      // Add 1 exam or competition for 3 main subjects
      if (['الرياضيات', 'العلوم والفيزياء', 'البرمجة والابتكار الرقمي'].includes(subName)) {
        const comp = bank.competition[0];
        addAgendaItem({
          date: selectedDate,
          grade: selectedGrade,
          classRoom: selectedClass,
          subject: subName,
          title: comp.title,
          titleEn: comp.title,
          homework: comp.homework,
          homeworkEn: comp.homework,
          dueDate: selectedDate,
          activityType: 'competition',
          examDuration: comp.duration,
          totalScore: comp.score
        });
        addedCount++;
      }
      addedCount++;
    });

    setToastMessage(`⚡ تم توليد ورصد ${addedCount} أنشطة وامتحانات ومسابقات جديدة بنجاح!`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleAddHomeworkSubmit = (e) => {
    e.preventDefault();
    if (!title) return;

    addAgendaItem({
      date: selectedDate,
      grade: selectedGrade,
      classRoom: selectedClass,
      subject,
      title,
      titleEn: titleEn || title,
      homework,
      homeworkEn: homeworkEn || homework,
      dueDate: selectedDate,
      activityType,
      examDuration: examDuration || null,
      totalScore: totalScore || null,
    });

    setTitle('');
    setTitleEn('');
    setHomework('');
    setHomeworkEn('');
    setExamDuration('');
    setTotalScore('');
    setShowAddModal(false);
    setToastMessage('✅ تم إضافة ونشر الدرس والنشاط للطلاب بنجاح!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSaveAttendance = () => {
    setAttendanceSavedToast(true);
    setTimeout(() => setAttendanceSavedToast(false), 3000);
  };

  const activeTeacher = (teachers || []).find((t) => t.id === currentUser?.id || t.username === currentUser?.username || t.name === currentUser?.name) || (teachers || [])[0];
  const teacherSubjects = activeTeacher?.subjects || [activeTeacher?.subject || 'العلوم والفيزياء'];

  const filteredAgenda = safeAgenda.filter((item) => {
    const itemG = (item.grade || '').toLowerCase();
    const selG  = (selectedGrade || '').toLowerCase();
    const matchesGrade = !item.grade || itemG === selG || itemG.includes(selG) || selG.includes(itemG) || itemG.includes('سادس') || itemG.includes('خامس');
    const matchesClass = !item.classRoom || item.classRoom === selectedClass || item.classRoom.includes(selectedClass) || selectedClass.includes(item.classRoom);
    const matchesDate  = !filterByDate || !item.date || item.date === selectedDate;
    const matchesSubject = subjectFilter === 'all' || item.subject === subjectFilter;
    const matchesType = typeFilter === 'all' 
      ? true 
      : typeFilter === 'exam' 
      ? (item.activityType === 'exam' || item.activityType === 'competition') 
      : item.activityType === typeFilter;

    // Teacher Data Isolation: Teacher sees ONLY items belonging to their assigned subjects
    const matchesTeacher = (currentRole === 'teacher') 
      ? (teacherSubjects.includes(item.subject) || item.subject === activeTeacher?.subject)
      : true;

    return matchesGrade && matchesClass && matchesDate && matchesSubject && matchesTeacher && matchesType;
  });

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">
      
      {/* Title Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm text-[#0F172A]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0284C7]">{t('agendaTitle')} والأجندة اليومية التفاعلية</h2>
            <p className="text-xs text-slate-500 mt-1">
              {isAr 
                ? "إرسال ونشر الدروس والواجبات اليومية من المعلمين والإدارة مع أرشيف كامل للمراجعة بحسب التاريخ."
                : "Daily interactive agenda & lesson publishing with date-based historical archive review."}
            </p>
          </div>
        </div>

        {/* Grade/Class Selectors & Generators */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-xl">
            <span className="text-xs text-slate-500 font-medium">{t('grade')}:</span>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#0F172A] focus:outline-none cursor-pointer"
            >
              <option value="الصف الخامس">الصف الخامس</option>
              <option value="الصف السادس">الصف السادس</option>
              <option value="الصف السابع">الصف السابع</option>
            </select>
          </div>

          {(currentRole === 'admin' || currentRole === 'teacher') && (
            <>
              <button
                onClick={handleBatchGenerateWeek}
                className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                title="توليد حزمة واجبات وامتحانات ومسابقات لكافة المواد فوراً"
              >
                <Zap className="w-4 h-4 text-purple-600 animate-bounce" />
                <span>توليد أنشطة الأسبوع ⚡</span>
              </button>

              <button
                onClick={() => {
                  setShowAddModal(true);
                  handleAutoGenerateSingle();
                }}
                className="btn-mustard flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>إرسال / توليد درس جديد 🪄</span>
              </button>
            </>
          )}
        </div>
      </div>

      {toastMessage && (
        <div className="bg-sky-50 border border-sky-300 text-sky-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in shadow-lg">
          <Sparkles className="w-5 h-5 text-sky-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {attendanceSavedToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in shadow-lg">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <span>{isAr ? 'تم حفظ وتسجيل كشف حضور وغياب الصف اليوم بنجاح!' : 'Class attendance saved successfully!'}</span>
        </div>
      )}

      {/* Date Selector & Lesson Archive Toolbar */}
      <div className="bg-white dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-3 shadow-sm text-[#0F172A] dark:text-white">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#F8FAFC] dark:bg-zinc-800 border border-[#0284C7]/30 px-3.5 py-1.5 rounded-2xl">
            <CalendarIcon className="w-4 h-4 text-[#0284C7] dark:text-sky-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{isAr ? 'تاريخ الأجندة:' : 'Date:'}</span>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setFilterByDate(true);
              }}
              className="bg-transparent text-xs font-bold text-[#0284C7] dark:text-sky-300 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => {
              setSelectedDate(new Date().toISOString().split('T')[0]);
              setFilterByDate(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterByDate && selectedDate === new Date().toISOString().split('T')[0]
                ? 'bg-[#0284C7] text-white shadow'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 border border-transparent dark:border-zinc-700'
            }`}
          >
            {isAr ? '📅 دروس اليوم' : 'Today'}
          </button>

          <button
            onClick={() => {
              const y = new Date();
              y.setDate(y.getDate() - 1);
              setSelectedDate(y.toISOString().split('T')[0]);
              setFilterByDate(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterByDate && selectedDate !== new Date().toISOString().split('T')[0]
                ? 'bg-[#0284C7] text-white shadow'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 border border-transparent dark:border-zinc-700'
            }`}
          >
            {isAr ? '⏮️ دروس الأمس' : 'Yesterday'}
          </button>

          <button
            onClick={() => setFilterByDate(false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !filterByDate 
                ? 'bg-purple-600 text-white shadow' 
                : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 border border-purple-200 dark:border-purple-800'
            }`}
          >
            {isAr ? '🗓️ أرشيف السجل الكامل لكافة التواريخ' : 'All History Archive'}
          </button>
        </div>

        {/* Filter by Subject */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-300">{isAr ? 'تصفية حسب المادة:' : 'Filter Subject:'}</span>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="bg-[#F8FAFC] dark:bg-zinc-800 border border-[#E2E8F0] dark:border-zinc-700 px-3 py-1.5 rounded-xl text-xs font-bold text-[#0F172A] dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-white dark:bg-zinc-900 text-[#0F172A] dark:text-white">{isAr ? 'كافة المواد' : 'All Subjects'}</option>
            {Object.keys(activityBank).map((sub) => (
              <option key={sub} value={sub} className="bg-white dark:bg-zinc-900 text-[#0F172A] dark:text-white">{sub}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Interactive Daily Agenda Grid */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm text-[#0F172A]">
        <div className="border-b border-slate-100 pb-3 space-y-3">
          <h3 className="text-base font-bold text-[#0284C7] flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#0284C7]" />
              <span>
                {isAr 
                  ? `دروس وواجبات الأجندة ${filterByDate ? `بتاريخ (${selectedDate})` : 'الأرشيف الكامل'} (${filteredAgenda.length})` 
                  : `Agenda Lessons (${filteredAgenda.length})`}
              </span>
            </span>
          </h3>

          {/* Type Filter Tabs: All, Lessons, Homeworks, Exams */}
          <div className="flex items-center gap-2 text-xs flex-wrap pt-1">
            <span className="font-bold text-slate-500">{isAr ? 'تصنيف الفعالية:' : 'Filter Type:'}</span>
            
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                typeFilter === 'all' ? 'bg-slate-900 text-white shadow' : 'bg-[#F8FAFC] text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isAr ? 'الكل 📋' : 'All'}
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter('lesson')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                typeFilter === 'lesson' ? 'bg-emerald-600 text-white shadow' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              {isAr ? '📌 الدروس فقط' : 'Lessons Only'}
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter('homework')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                typeFilter === 'homework' ? 'bg-[#0284C7] text-white shadow' : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
              }`}
            >
              {isAr ? '📚 الواجبات المنزلية' : 'Homeworks'}
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter('exam')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                typeFilter === 'exam' ? 'bg-red-600 text-white shadow' : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              {isAr ? '🏆 الامتحانات والمسابقات' : 'Exams & Quizzes'}
            </button>
          </div>
        </div>

        {filteredAgenda.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400 space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p>{isAr ? `لا توجد دروس أو واجبات مسجلة بتاريخ (${selectedDate}) لـ (${selectedGrade} - الشعبة ${selectedClass}).` : 'No homework registered for this date.'}</p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setFilterByDate(false)}
                className="px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-bold border border-purple-200 transition-all cursor-pointer"
              >
                {isAr ? 'عرض الأرشيف الكامل لكافة التواريخ 🗓️' : 'View Full Archive'}
              </button>
              {(currentRole === 'admin' || currentRole === 'teacher') && (
                <button
                  onClick={handleBatchGenerateWeek}
                  className="px-4 py-2 bg-[#0284C7] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#0369A1] transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4" />
                  <span>إرسال أنشطة الأسبوع تلقائياً 🪄</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAgenda.map((item) => {
              const typeConfig = {
                homework:    { color: 'border-[#0284C7] bg-[#0284C7]/5 dark:bg-zinc-900 dark:border-sky-500/50', badge: '📚 واجب بيتي', badgeClass: 'bg-[#0284C7]/10 text-[#0284C7] border-[#0284C7]/20 dark:bg-sky-500/20 dark:text-sky-300' },
                lesson:      { color: 'border-emerald-300 bg-emerald-50/50 dark:bg-zinc-900 dark:border-emerald-500/50', badge: '📌 درس تعليمي', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300' },
                exam:        { color: 'border-red-300 bg-red-50/50 dark:bg-zinc-900 dark:border-red-500/50', badge: '📝 امتحان تقييمي', badgeClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300' },
                competition: { color: 'border-purple-300 bg-purple-50/50 dark:bg-zinc-900 dark:border-purple-500/50', badge: '🏆 مسابقة تنافسية', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 font-extrabold' },
              };
              const cfg = typeConfig[item.activityType || 'homework'];
              const isCompleted = completedLessons.includes(item.id);

              return (
                <div key={item.id} className={`interactive-card border p-5 rounded-2xl space-y-3 shadow-sm transition-all hover:shadow-md ${cfg.color}`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${cfg.badgeClass}`}>{cfg.badge}</span>
                      <SubjectBadge subjectName={item.subject} />
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#0284C7] dark:text-sky-400" /> {item.dueDate || item.date}
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-[#0F172A] dark:text-white">{isAr ? item.title : item.titleEn || item.title}</h4>
                  <p className="text-xs text-[#0F172A] dark:text-slate-100 leading-relaxed bg-[#F8FAFC] dark:bg-zinc-800 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 font-medium">
                    {isAr ? item.homework : item.homeworkEn || item.homework}
                  </p>

                  {(item.examDuration || item.totalScore) && (
                    <div className="flex items-center gap-2 text-[11px] pt-1 font-bold">
                      {item.examDuration && (
                        <span className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2.5 py-1 rounded-lg text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          ⏱️ المدة: {item.examDuration} دقيقة
                        </span>
                      )}
                      {item.totalScore && (
                        <span className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2.5 py-1 rounded-lg text-amber-700 dark:text-amber-400 flex items-center gap-1">
                          ⭐ العلامة القصوى: {item.totalScore}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-zinc-800 flex-wrap gap-2">
                    {/* Mark as Reviewed Toggle for Student */}
                    <button
                      onClick={() => toggleLessonCompleted(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isCompleted
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-zinc-700 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isCompleted ? (isAr ? 'تمت المراجعة 🟢' : 'Reviewed 🟢') : (isAr ? 'مراجعة' : 'Review')}</span>
                    </button>

                    {(currentRole === 'admin' || currentRole === 'teacher') && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditClick(item)}
                          className="px-3 py-1.5 bg-[#0284C7]/10 hover:bg-[#0284C7] text-[#0284C7] hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-[#0284C7]/20"
                          title="تعديل تفاصيل الدرس/الواجب"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{isAr ? 'تعديل ✏️' : 'Edit'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteAgendaItem(item.id)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-red-200"
                          title="حذف الدرس/الواجب من الأجندة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isAr ? 'حذف 🗑️' : 'Delete'}</span>
                        </button>
                      </div>
                    )}

                    {(currentRole === 'student' || currentRole === 'parent') && (
                      <button
                        onClick={() => {
                          setSubmitHomeworkModal(item);
                          const existing = submittedTasks[item.id];
                          if (existing) {
                            setSubmissionText(existing.text || '');
                            setSubmissionFileNote(existing.fileNote || '');
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shadow transition-all cursor-pointer flex items-center gap-1.5 ${
                          submittedTasks[item.id]
                            ? 'bg-purple-600 text-white'
                            : 'bg-[#0284C7] hover:bg-[#0369A1] text-white'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{submittedTasks[item.id] ? (isAr ? 'تم تسليم الواجب 📥 (تعديل)' : 'Submitted 📥') : (isAr ? 'تسليم الواجب 📤' : 'Submit Homework')}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Class Attendance Sheet for Teachers & Admin */}
      {(currentRole === 'admin' || currentRole === 'teacher') && (
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm text-[#0F172A]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#0284C7]" />
              <span>{isAr ? 'كشف الحضور والغياب اليومي للطلاب' : 'Daily Class Attendance'}</span>
            </h3>

            <button
              onClick={handleSaveAttendance}
              className="btn-mustard flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isAr ? 'حفظ السجل 💾' : 'Save Sheet 💾'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {safeStudents.map((stu) => {
              const isPresent = attendanceState[stu.id] === 'present';

              return (
                <div key={stu.id} className="flex items-center justify-between bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <img src={stu.avatar} alt={stu.name} className="w-8 h-8 rounded-full object-cover border border-[#0284C7]" />
                    <span className="text-xs font-bold text-[#0F172A]">{isAr ? stu.name : stu.nameEn}</span>
                  </div>

                  <button
                    onClick={() => setAttendanceState({ ...attendanceState, [stu.id]: isPresent ? 'absent' : 'present' })}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      isPresent ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'bg-red-50 text-red-700 border border-red-300'
                    }`}
                  >
                    {isPresent ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                    <span>{isPresent ? (isAr ? 'حاضر 🟢' : 'Present 🟢') : (isAr ? 'غائب 🔴' : 'Absent 🔴')}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Auto Generate Activity Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <form
            onSubmit={handleAddHomeworkSubmit}
            className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative my-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#0284C7]" />
                <span>{isAr ? 'إضافة / توليد نشاط تعليمي جديد' : 'Add Activity'}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Smart Generator Header Action */}
            <div className="bg-purple-50 border border-purple-200 p-3 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-800">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>المولّد الذكي التلقائي للأسئلة والأنشطة</span>
              </div>
              <button
                type="button"
                onClick={() => handleAutoGenerateSingle(subject, activityType)}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow transition-all cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>توليد تلقائي 🪄</span>
              </button>
            </div>

            {/* Select Subject */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">المادة الدراسية <span className="text-red-500">*</span></label>
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  handleAutoGenerateSingle(e.target.value, activityType);
                }}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#0284C7] cursor-pointer"
              >
                {Object.keys(activityBank).map((subName) => (
                  <option key={subName} value={subName}>{subName}</option>
                ))}
              </select>
            </div>

            {/* Activity Type */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">نوع النشاط <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-1">
                {[
                  { v: 'homework', icon: '📚', label: 'واجب' },
                  { v: 'lesson', icon: '📌', label: 'درس' },
                  { v: 'exam', icon: '📝', label: 'امتحان' },
                  { v: 'competition', icon: '🏆', label: 'مسابقة' }
                ].map(opt => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => {
                      setActivityType(opt.v);
                      handleAutoGenerateSingle(subject, opt.v);
                    }}
                    className={`py-2 rounded-xl text-xs font-extrabold border cursor-pointer transition-all ${
                      activityType === opt.v
                        ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-sm'
                        : 'bg-[#F8FAFC] text-slate-700 border-[#E2E8F0] hover:border-[#0284C7]'
                    }`}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Extra fields for exam/competition */}
            {(activityType === 'exam' || activityType === 'competition') && (
              <div className="grid grid-cols-2 gap-3 bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">⏱️ المدة (دقيقة)</label>
                  <input
                    type="number"
                    value={examDuration}
                    onChange={e => setExamDuration(e.target.value)}
                    placeholder="60"
                    className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">⭐ العلامة الكاملة</label>
                  <input
                    type="number"
                    value={totalScore}
                    onChange={e => setTotalScore(e.target.value)}
                    placeholder="100"
                    className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">عنوان النشاط / الدرس <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: حل معادلات الدرجة الأولى..."
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">التفاصيل والواجب أو أسئلة الامتحان</label>
              <textarea
                rows={4}
                value={homework}
                onChange={(e) => setHomework(e.target.value)}
                placeholder="اكتب التمارين أو تفاصيل النشاط هنا..."
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs leading-relaxed focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleAutoGenerateSingle(subject, activityType)}
                className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> توليد فكرة أخرى 🪄
              </button>

              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">{t('cancel')}</button>
                <button type="submit" className="px-5 py-2 btn-mustard rounded-xl text-xs font-bold shadow cursor-pointer">{t('save')}</button>
              </div>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* 📥 Student Online Homework Submission Modal */}
      {submitHomeworkModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-[#0F172A] border-2 border-[#0284C7] dark:border-sky-500 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] dark:text-white relative my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] dark:text-sky-400 flex items-center gap-2">
                <Send className="w-5 h-5 text-[#0284C7] dark:text-sky-400" />
                <span>إرسال وتسليم الواجب للمعلم 📤</span>
              </h3>
              <button onClick={() => setSubmitHomeworkModal(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-200 font-bold flex items-center justify-center transition-colors cursor-pointer">✕</button>
            </div>

            <div className="bg-[#F8FAFC] dark:bg-zinc-900/90 p-3 rounded-2xl border border-[#E2E8F0] dark:border-zinc-800 space-y-1">
              <span className="text-[10px] text-[#0284C7] dark:text-sky-400 font-bold block">{submitHomeworkModal.subject}</span>
              <h4 className="text-xs font-black text-[#0F172A] dark:text-white">{submitHomeworkModal.title}</h4>
            </div>

            <form onSubmit={handleSubmitHomeworkResponse} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">حل الواجب / إجابة التلميذ <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={4}
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="اكتب إجابتك أو خطوات الحل هنا للمعلم..."
                  className="w-full bg-[#F8FAFC] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-700 text-[#0F172A] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl px-3 py-2 text-xs leading-relaxed focus:outline-none focus:border-[#0284C7] dark:focus:border-sky-400"
                />
              </div>

              {/* Camera Capture or Computer Image Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">📸 تصوير الإجابة بكاميرا الهاتف أو رفع صورة من الكمبيوتر (اختياري)</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Phone Camera Capture */}
                  <label className="flex items-center justify-center gap-2 p-3 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-[#0284C7] dark:text-sky-300 border border-sky-300 dark:border-sky-700 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm">
                    <Camera className="w-4 h-4 text-[#0284C7] dark:text-sky-300" />
                    <span>📸 التقاط صورة بالكاميرا</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment" 
                      onChange={handleHomeworkPhotoUpload} 
                      className="hidden" 
                    />
                  </label>

                  {/* Computer File / Photo Upload */}
                  <label className="flex items-center justify-center gap-2 p-3 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm">
                    <Upload className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                    <span>📁 رفع صورة من الكمبيوتر</span>
                    <input 
                      type="file" 
                      accept="image/*,.pdf,.doc,.docx" 
                      onChange={handleHomeworkPhotoUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>

                {/* Uploaded Photo Preview Box */}
                {submissionImage ? (
                  <div className="relative mt-2 p-2.5 bg-slate-900 rounded-2xl border border-sky-400 flex items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-2.5">
                      <img src={submissionImage} alt="Answer Preview" className="w-12 h-12 rounded-xl object-cover border border-white/40 shadow-sm" />
                      <div>
                        <span className="text-xs font-bold text-white block">تم إرفاق صورة الحل بنجاح 🟢</span>
                        <span className="text-[10px] text-emerald-300 block font-mono">جاهزة للإرسال للمعلم</span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setSubmissionImage('')} 
                      className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[10px] font-bold cursor-pointer transition-all"
                    >
                      حذف الصورة ✕
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={submissionFileNote}
                    onChange={(e) => setSubmissionFileNote(e.target.value)}
                    placeholder="أو اكتب هنا ملاحظة أو رابط مستند خارجي..."
                    className="w-full bg-[#F8FAFC] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-700 text-[#0F172A] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7] dark:focus:border-sky-400"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button type="button" onClick={() => setSubmitHomeworkModal(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer">{t('cancel')}</button>
                <button type="submit" className="btn-mustard px-5 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer">
                  <Send className="w-4 h-4" /> تأكيد وإرسال الحل 📤
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal: Edit Agenda Item Modal */}
      {showEditModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <form
            onSubmit={handleUpdateHomeworkSubmit}
            className="bg-white dark:bg-[#0F172A] border-2 border-[#0284C7] dark:border-sky-500 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] dark:text-white relative my-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] dark:text-sky-400 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#0284C7] dark:text-sky-400" />
                <span>{isAr ? 'تعديل تفاصيل الدرس / الواجب / الامتحان' : 'Edit Agenda Item'}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowEditModal(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-300 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Select Type */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">{isAr ? 'نوع الفعالية التعليمية' : 'Activity Type'}</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'lesson', label: '📌 درس', bg: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
                  { id: 'homework', label: '📚 واجب', bg: 'bg-sky-50 text-sky-700 border-sky-300' },
                  { id: 'exam', label: '📝 امتحان', bg: 'bg-red-50 text-red-700 border-red-300' },
                  { id: 'competition', label: '🏆 مسابقة', bg: 'bg-purple-50 text-purple-700 border-purple-300' }
                ].map((typeItem) => (
                  <button
                    key={typeItem.id}
                    type="button"
                    onClick={() => setEditActivityType(typeItem.id)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      editActivityType === typeItem.id
                        ? `${typeItem.bg} ring-2 ring-purple-400 scale-105 shadow`
                        : 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-zinc-700'
                    }`}
                  >
                    {typeItem.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">{isAr ? 'المادة الدراسية' : 'Subject'}</label>
              <select
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                className="w-full bg-[#F8FAFC] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-700 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
              >
                {Object.keys(activityBank).map((sub) => (
                  <option key={sub} value={sub} className="bg-white dark:bg-zinc-900 text-[#0F172A] dark:text-white">{sub}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">{isAr ? 'عنوان الدرس / الواجب' : 'Title'} <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="عنوان الدرس..."
                className="w-full bg-[#F8FAFC] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-700 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            {/* Homework Text */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">{isAr ? 'تفاصيل الدرس والمطلوب في الواجب' : 'Content & Homework'}</label>
              <textarea
                rows={3}
                value={editHomework}
                onChange={(e) => setEditHomework(e.target.value)}
                placeholder="اكتب تفاصيل الواجب هنا..."
                className="w-full bg-[#F8FAFC] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-700 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs leading-relaxed focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            {/* Exam duration & total score */}
            {(editActivityType === 'exam' || editActivityType === 'competition') && (
              <div className="grid grid-cols-2 gap-3 bg-red-50/50 dark:bg-red-950/40 p-3 rounded-2xl border border-red-200 dark:border-red-800">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-red-700 dark:text-red-300">{isAr ? 'مدة الامتحان (دقيقة)' : 'Duration (min)'}</label>
                  <input
                    type="number"
                    value={editExamDuration}
                    onChange={(e) => setEditExamDuration(e.target.value)}
                    placeholder="45"
                    className="w-full bg-white dark:bg-zinc-800 border border-red-200 dark:border-red-700 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-amber-700 dark:text-amber-300">{isAr ? 'العلامة القصوى' : 'Total Score'}</label>
                  <input
                    type="number"
                    value={editTotalScore}
                    onChange={(e) => setEditTotalScore(e.target.value)}
                    placeholder="100"
                    className="w-full bg-white dark:bg-zinc-800 border border-amber-200 dark:border-amber-700 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button type="button" onClick={() => setShowEditModal(null)} className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer">{t('cancel')}</button>
              <button type="submit" className="px-5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold shadow cursor-pointer flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {isAr ? 'حفظ التعديلات 🌟' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

    </div>
  );
};
