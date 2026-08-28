import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { 
  GraduationCap, 
  Clock, 
  Users, 
  CheckCircle2, 
  BookOpen, 
  UserPlus,
  Trash2,
  DollarSign,
  Plus,
  Palette,
  Printer,
  FileSpreadsheet,
  Search,
  Edit,
  CreditCard,
  X
} from 'lucide-react';
import { exportToExcelCSV } from '../utils/exportUtils';

export const TutoringModule = () => {
  const { 
    lang, 
    t, 
    currentRole, 
    tutoringCourses = [], 
    registerTutoring, 
    unregisterTutoring,
    addTutoringCourse,
    deleteTutoringCourse,
    updateTutoringCourse,
    recordTutoringPayment,
    students = [], 
    selectedStudentId,
    siteSettings 
  } = useApp();

  const isAr = lang === 'ar';
  const safeStudents = students || [];
  const safeCourses = tutoringCourses || [];

  const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'accounts'
  const [selectedStudentForEnroll, setSelectedStudentForEnroll] = useState(selectedStudentId || (safeStudents[0]?.id || ''));
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState(safeCourses[0]?.id || '');
  const [customFeeInput, setCustomFeeInput] = useState('50');
  const [successToast, setSuccessToast] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Add Course Modal State
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newSubject, setNewSubject] = useState('الرياضيات');
  const [newInstructor, setNewInstructor] = useState('');
  const [newDays, setNewDays] = useState('السبت والإثنين والأربعاء (4:00 - 6:00 مساءً)');
  const [newFee, setNewFee] = useState('50');
  const [newSeats, setNewSeats] = useState('20');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState('#0284C7');

  // Edit Fee Modal
  const [editingFeeStudent, setEditingFeeStudent] = useState(null); // { courseId, studentId, studentName, currentFee }
  const [editFeeVal, setEditFeeVal] = useState('');

  // Tutoring Direct Payment Modal
  const [payingStudent, setPayingStudent] = useState(null); // { courseId, studentId, studentName, fee, paid }
  const [payAmountInput, setPayAmountInput] = useState('');
  const [isPrintingTutoringLedger, setIsPrintingTutoringLedger] = useState(false);

  const currentStudent = safeStudents.find((s) => s.id === selectedStudentForEnroll) || safeStudents[0];

  const presetColors = [
    { hex: '#0284C7', label: 'أزرق سماوي' },
    { hex: '#10b981', label: 'أخضر زمردي' },
    { hex: '#a855f7', label: 'بنفسجي' },
    { hex: '#EF4444', label: 'أحمر قرمزي' },
    { hex: '#f97316', label: 'برتقالي' },
    { hex: '#06b6d4', label: 'سماوي مائي' },
    { hex: '#f59e0b', label: 'ذهبي' },
    { hex: '#ec4899', label: 'وردي' }
  ];

  const handleQuickEnrollAndSavePayment = () => {
    if (!currentStudent) return;
    const courseId = selectedCourseForEnroll || safeCourses[0]?.id;
    if (!courseId) {
      alert(isAr ? 'الرجاء إضافة دورة تقوية أولاً' : 'Please add a tutoring course first');
      return;
    }

    const targetCourse = safeCourses.find(c => c.id === courseId);
    const amountVal = Number(customFeeInput || targetCourse?.fee || 50);

    // 1. Register student & save custom tuition fee
    registerTutoring(courseId, currentStudent.id, amountVal);

    // 2. Record payment into paid map & payment history
    recordTutoringPayment(courseId, currentStudent.id, amountVal);

    setSuccessToast(
      isAr 
        ? `✅ تم حفظ دفعة القسط ($${amountVal} USD) وتثبيت تسجيل التلميذ (${currentStudent.name}) بنجاح في سجلات التقوية والحسابات!` 
        : `Payment ($${amountVal} USD) and registration saved for ${currentStudent.name}!`
    );
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleEnroll = (courseId) => {
    if (!currentStudent) return;
    const amountVal = Number(customFeeInput || 50);
    registerTutoring(courseId, currentStudent.id, amountVal);
    recordTutoringPayment(courseId, currentStudent.id, amountVal);
    setSuccessToast(isAr ? `تم حفظ دفعة القسط ($${amountVal} USD) وتسجيل التلميذ (${currentStudent.name}) بنجاح! 🟢` : 'Registration & payment saved!');
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleRemoveStudentFromCourse = (courseId, studentId) => {
    if (unregisterTutoring) {
      unregisterTutoring(courseId, studentId);
      setSuccessToast(isAr ? 'تم إلغاء تسجيل التلميذ من الدورة.' : 'Student unregistered.');
      setTimeout(() => setSuccessToast(''), 3500);
    }
  };

  const handleAddCourseSubmit = (e) => {
    e.preventDefault();
    if (!newTitle) return;
    addTutoringCourse({
      title: newTitle,
      titleEn: newTitleEn || newTitle,
      subject: newSubject,
      instructor: newInstructor,
      days: newDays,
      fee: Number(newFee || 50),
      maxSeats: Number(newSeats || 20),
      description: newDesc || 'دورة تقوية مكثفة لمراجعة المفاهيم وحل الاختبارات.',
      color: newColor
    });
    setShowAddCourseModal(false);
    setNewTitle('');
    setNewDesc('');
    setSuccessToast(isAr ? 'تمت إضافة دورة التقوية الجديدة بنجاح! 🚀' : 'New tutoring course added!');
    setTimeout(() => setSuccessToast(''), 3500);
  };

  const handleUpdateStudentFeeSubmit = (e) => {
    e.preventDefault();
    if (!editingFeeStudent) return;
    registerTutoring(editingFeeStudent.courseId, editingFeeStudent.studentId, editFeeVal);
    setEditingFeeStudent(null);
    setSuccessToast(isAr ? 'تم تحديث وحفظ القسط الخاص بالتلميذ بنجاح! ✅' : 'Custom fee updated!');
    setTimeout(() => setSuccessToast(''), 3500);
  };

  const handleRecordPaymentSubmit = (e) => {
    e.preventDefault();
    if (!payingStudent || !payAmountInput || Number(payAmountInput) <= 0) return;
    recordTutoringPayment(payingStudent.courseId, payingStudent.studentId, Number(payAmountInput));
    setPayingStudent(null);
    setPayAmountInput('');
    setSuccessToast(isAr ? 'تم حفظ الدفعة المالية للتلميذ في حسابات التقوية بنجاح! 💰' : 'Payment recorded!');
    setTimeout(() => setSuccessToast(''), 3500);
  };

  // Compile Master Tutoring Special Accounts Ledger List
  const specialAccountsList = [];
  safeCourses.forEach(course => {
    const enrolledIds = course.enrolledStudentIds || [];
    const feesMap = course.studentFeesMap || {};
    const paidMap = course.studentPaidMap || {};

    enrolledIds.forEach(stuId => {
      const stuObj = safeStudents.find(s => s.id === stuId);
      if (stuObj) {
        const customFee = feesMap[stuId] !== undefined ? Number(feesMap[stuId]) : Number(course.fee);
        const paidAmount = Number(paidMap[stuId] || 0);
        const remAmount = Math.max(0, customFee - paidAmount);
        specialAccountsList.push({
          courseId: course.id,
          courseTitle: course.title,
          subject: course.subject,
          studentId: stuObj.id,
          studentName: stuObj.name,
          studentNameEn: stuObj.nameEn,
          grade: stuObj.grade,
          classRoom: stuObj.classRoom || 'أ',
          parentPhone: stuObj.parentPhone || stuObj.phone || 'غير مسجل',
          customFee,
          paidAmount,
          remAmount,
          isSpecialCase: !!stuObj.isSpecialCase
        });
      }
    });
  });

  const filteredSpecialAccounts = specialAccountsList.filter(acc => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return acc.studentName.toLowerCase().includes(term) ||
           acc.courseTitle.toLowerCase().includes(term) ||
           acc.grade.toLowerCase().includes(term) ||
           acc.parentPhone.includes(term);
  });

  const totalTutoringExpectedRevenue = specialAccountsList.reduce((sum, item) => sum + item.customFee, 0);
  const totalTutoringPaidRevenue     = specialAccountsList.reduce((sum, item) => sum + item.paidAmount, 0);
  const totalTutoringRemainingDues   = Math.max(0, totalTutoringExpectedRevenue - totalTutoringPaidRevenue);

  const handleExportTutoringExcel = () => {
    const headers = [
      'معرف الطالب', 'اسم الطالب', 'الصف والشعبة', 'اسم الدورة / المعهد', 'القسط الخاص ($ USD)', 'المبلغ المدفوع ($ USD)', 'المتبقي المستحق ($ USD)', 'هاتف التواصل'
    ];
    const rows = filteredSpecialAccounts.map(a => [
      a.studentId, a.studentName, `${a.grade} (${a.classRoom})`, a.courseTitle, a.customFee, a.paidAmount, a.remAmount, a.parentPhone
    ]);
    exportToExcelCSV(`kashf-hisabat-taqwiya-${new Date().toISOString().slice(0,10)}.csv`, headers, rows);
  };

  const handlePrintTutoringLedger = () => {
    setIsPrintingTutoringLedger(true);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">
      
      {/* Title Banner & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm text-[#0F172A]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0284C7]">{isAr ? 'معهد التقوية والدورات التعليمية الخاصة' : t('tutoringTitle')}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {isAr ? 'تسجيل التلاميذ وإدارتهم في دورات التقوية وتحديد القسط المالي وحفظ الدفعات في حسابات خاصة.' : t('tutoringSubtitle')}
            </p>
          </div>
        </div>

        {/* Tab Buttons & Add Course Button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 rounded-2xl border border-[#E2E8F0]">
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'courses' ? 'bg-[#0284C7] text-white shadow-sm' : 'text-slate-600 hover:text-[#0284C7]'
              }`}
            >
              {isAr ? `📚 دورات التقوية المتاحة (${safeCourses.length})` : `Courses (${safeCourses.length})`}
            </button>

            <button
              onClick={() => setActiveTab('accounts')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'accounts' ? 'bg-[#0284C7] text-white shadow-sm' : 'text-slate-600 hover:text-[#0284C7]'
              }`}
            >
              <span>{isAr ? '📊 كشف الحسابات والمالية الخاصة' : 'Special Accounts Ledger'}</span>
              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded-md text-[10px] font-mono font-bold">
                {specialAccountsList.length}
              </span>
            </button>
          </div>

          {currentRole === 'admin' && activeTab === 'courses' && (
            <button
              onClick={() => setShowAddCourseModal(true)}
              className="btn-mustard flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-extrabold shadow cursor-pointer transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? "إضافة دورة تقوية جديد +" : "Add Course +"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Toast */}
      {successToast && (
        <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-900 p-4 rounded-2xl flex items-center gap-3 shadow-lg animate-fade-in text-xs font-black">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* ─── TAB 1: COURSES CATALOG ────────────────────────────────────────── */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          
          {/* Quick Registration & Payment Save Bar */}
          <div className="bg-white border-2 border-[#0284C7]/40 p-4.5 rounded-3xl shadow-sm text-[#0F172A] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-black text-[#0284C7] shrink-0">
              <UserPlus className="w-5 h-5 text-[#0284C7]" />
              <span>{isAr ? 'تسجيل تلميذ وسداد القسط المخصص:' : 'Register & Save Payment:'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1 justify-end">
              {/* Student Select */}
              <div className="flex flex-col space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400">{isAr ? 'اسم التلميذ' : 'Student'}</span>
                <select
                  value={selectedStudentForEnroll}
                  onChange={(e) => setSelectedStudentForEnroll(e.target.value)}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-bold text-[#0F172A] rounded-2xl px-3 py-2 focus:outline-none focus:border-[#0284C7] cursor-pointer min-w-[170px]"
                >
                  {safeStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {isAr ? s.name : s.nameEn} ({isAr ? s.grade : s.gradeEn}) {s.isSpecialCase ? '⭐' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Select */}
              <div className="flex flex-col space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400">{isAr ? 'دورة التقوية' : 'Course'}</span>
                <select
                  value={selectedCourseForEnroll}
                  onChange={(e) => setSelectedCourseForEnroll(e.target.value)}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-bold text-[#0F172A] rounded-2xl px-3 py-2 focus:outline-none focus:border-[#0284C7] cursor-pointer min-w-[180px]"
                >
                  {safeCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} (${c.fee} USD)
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Fee / Payment Input */}
              <div className="flex flex-col space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400">{isAr ? 'المبلغ / القسط' : 'Amount'}</span>
                <div className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-2xl">
                  <span className="text-xs font-black text-slate-500">$</span>
                  <input
                    type="number"
                    placeholder={isAr ? 'القسط' : 'Fee $'}
                    value={customFeeInput}
                    onChange={(e) => setCustomFeeInput(e.target.value)}
                    className="w-16 text-xs font-mono font-black bg-transparent focus:outline-none text-right text-[#0284C7]"
                  />
                  <span className="text-[10px] text-slate-400 font-bold">USD</span>
                </div>
              </div>

              {/* PROMINENT SAVE PAYMENT & REGISTER BUTTON */}
              <div className="flex flex-col space-y-0.5 pt-4 sm:pt-0">
                <span className="text-[10px] font-bold text-transparent select-none">إجراء</span>
                <button
                  onClick={handleQuickEnrollAndSavePayment}
                  className="btn-mustard px-5 py-2.5 rounded-2xl text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105"
                  title="حفظ الدفعة وتسجيل التلميذ في الدورة"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                  <span>{isAr ? 'حفظ الدفعة والتسجيل 💾' : 'Save Payment & Register 💾'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Courses Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeCourses.map((course) => {
              const enrolledIds = course.enrolledStudentIds || [];
              const isEnrolled = enrolledIds.includes(currentStudent?.id);
              const seatsLeft = course.maxSeats - enrolledIds.length;
              const feesMap = course.studentFeesMap || {};
              const cardColor = course.color || '#0284C7';
              const enrolledStudentsList = safeStudents.filter(s => enrolledIds.includes(s.id));

              return (
                <div
                  key={course.id}
                  className="interactive-card bg-white border border-[#E2E8F0] rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-sm hover:border-[#0284C7]/50 text-[#0F172A] relative overflow-hidden group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-xs font-black px-3 py-1 rounded-xl text-white shadow-xs"
                        style={{ backgroundColor: cardColor }}
                      >
                        {course.subject}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-red-600 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-200">
                          ${course.fee} USD
                        </span>

                        {currentRole === 'admin' && (
                          <div className="flex items-center gap-1">
                            {/* Color Picker trigger */}
                            <label className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer transition-colors" title="تغيير لون الكرت">
                              <Palette className="w-3.5 h-3.5" style={{ color: cardColor }} />
                              <input
                                type="color"
                                value={cardColor}
                                onChange={(e) => updateTutoringCourse(course.id, { color: e.target.value })}
                                className="sr-only"
                              />
                            </label>

                            <button
                              onClick={() => deleteTutoringCourse(course.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl cursor-pointer transition-colors"
                              title="حذف الدورة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base font-black text-[#0F172A] leading-snug">
                      {isAr ? course.title : course.titleEn || course.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0]">
                      {course.description}
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 shrink-0 text-slate-400" style={{ color: cardColor }} />
                        <span>{isAr ? course.days : course.daysEn || course.days}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 shrink-0 text-slate-400" style={{ color: cardColor }} />
                        <span>{t('instructor')}: <strong className="text-[#0F172A]">{course.instructor}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 shrink-0 text-slate-400" style={{ color: cardColor }} />
                        <span>{t('availableSeats')}: <strong className="font-bold text-[#0F172A]">{seatsLeft} / {course.maxSeats}</strong></span>
                      </div>
                    </div>

                    {/* Registered Students List */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <span className="text-[11px] font-extrabold text-[#0F172A] block flex items-center justify-between">
                        <span>{isAr ? `التلاميذ المسجلون بالمعهد:` : `Enrolled:`}</span>
                        <span className="text-sky-600 font-mono">({enrolledStudentsList.length})</span>
                      </span>

                      {enrolledStudentsList.length === 0 ? (
                        <span className="text-[10px] text-slate-400 italic block">لا يوجد تلاميذ مسجلون في هذه الدورة حتى الآن.</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 custom-scrollbar">
                          {enrolledStudentsList.map(stu => {
                            const studentCustomFee = feesMap[stu.id] !== undefined ? feesMap[stu.id] : course.fee;
                            return (
                              <div key={stu.id} className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-xl text-[10px] shadow-2xs">
                                <span className="font-bold text-[#0F172A]">{isAr ? stu.name : stu.nameEn}</span>
                                <span className="text-emerald-700 font-mono font-black bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">${studentCustomFee}</span>
                                {currentRole === 'admin' && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingFeeStudent({
                                          courseId: course.id,
                                          studentId: stu.id,
                                          studentName: stu.name,
                                          currentFee: studentCustomFee
                                        });
                                        setEditFeeVal(studentCustomFee.toString());
                                      }}
                                      className="text-sky-600 hover:text-sky-800 font-bold text-[10px] cursor-pointer"
                                      title="تعديل القسط المخصص للتلميذ"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveStudentFromCourse(course.id, stu.id)}
                                      className="text-red-500 hover:text-red-700 font-bold text-xs cursor-pointer"
                                      title="إزالة التلميذ من الدورة"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Register Action Button */}
                  <div className="pt-3 border-t border-slate-100">
                    {isEnrolled ? (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 py-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{t('registeredAlready')}</span>
                        </div>
                        {currentRole === 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleRemoveStudentFromCourse(course.id, currentStudent.id)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl cursor-pointer"
                            title="إلغاء تسجيل التلميذ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course.id)}
                        disabled={seatsLeft <= 0}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all shadow cursor-pointer ${
                          seatsLeft <= 0
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'btn-mustard'
                        }`}
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>{isAr ? `حفظ الدفعة وتأكيد تسجيل (${currentStudent?.name || 'التلميذ'}) 💾` : "Save Payment & Register"}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 2: SPECIAL ACCOUNTS LEDGER ───────────────────────────────── */}
      {activeTab === 'accounts' && (
        <div className="space-y-5">
          
          {/* Summary Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#E2E8F0] p-4 rounded-3xl shadow-sm text-right space-y-1">
              <span className="text-xs font-bold text-slate-500 block">إجمالي رسوم ودورات التقوية المخصصة:</span>
              <span className="text-xl font-black font-mono text-[#0284C7]">${totalTutoringExpectedRevenue.toLocaleString()} USD</span>
            </div>

            <div className="bg-white border border-[#E2E8F0] p-4 rounded-3xl shadow-sm text-right space-y-1">
              <span className="text-xs font-bold text-slate-500 block">إجمالي المقبوض في حسابات المعهد:</span>
              <span className="text-xl font-black font-mono text-emerald-600">${totalTutoringPaidRevenue.toLocaleString()} USD</span>
            </div>

            <div className="bg-white border border-[#E2E8F0] p-4 rounded-3xl shadow-sm text-right space-y-1">
              <span className="text-xs font-bold text-slate-500 block">المتبقي المستحق غير المسدد:</span>
              <span className="text-xl font-black font-mono text-red-600">${totalTutoringRemainingDues.toLocaleString()} USD</span>
            </div>
          </div>

          {/* Table Header Controls */}
          <div className="bg-white border border-[#E2E8F0] p-4 rounded-3xl shadow-sm text-[#0F172A] space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 rtl:right-3 ltr:left-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={isAr ? "🔍 ابحث في كشف الحسابات الخاصة (اسم التلميذ، الدورة، الهاتف)..." : "Search ledger..."}
                  className="w-full bg-[#F8FAFC] border border-slate-200 text-[#0F172A] rounded-2xl pr-9 pl-4 py-2 text-xs font-bold focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportTutoringExcel}
                  className="px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  title="تصدير لملف اكسل"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>تصدير Excel 📊</span>
                </button>

                <button
                  onClick={handlePrintTutoringLedger}
                  className="px-3.5 py-2 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  title="طباعة كشف الحسابات المالي"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة 🖨️</span>
                </button>
              </div>
            </div>

            {/* Special Accounts Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right rtl:text-right ltr:text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[#0284C7] bg-[#F8FAFC] font-black">
                    <th className="p-3">اسم التلميذ</th>
                    <th className="p-3">الصف والشعبة</th>
                    <th className="p-3">دورة التقوية المخصصة</th>
                    <th className="p-3">القسط المخصص ($ USD)</th>
                    <th className="p-3">المدفوع ($ USD)</th>
                    <th className="p-3">المتبقي ($ USD)</th>
                    <th className="p-3 text-center">حالة السداد</th>
                    <th className="p-3 text-center">إجراءات والدفع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[#0F172A]">
                  {filteredSpecialAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400 font-bold">
                        {isAr ? 'لا يوجد تلاميذ مسجلون في كشف الحسابات الخاصة حالياً.' : 'No special accounts records found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredSpecialAccounts.map((acc, idx) => (
                      <tr key={`${acc.courseId}-${acc.studentId}-${idx}`} className="hover:bg-[#F8FAFC] transition-all">
                        <td className="p-3 font-bold flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#0284C7]/10 text-[#0284C7] font-black text-xs flex items-center justify-center shrink-0 border border-[#0284C7]">
                            {(acc.studentName || 'ط')[0]}
                          </div>
                          <div>
                            <div>{acc.studentName}</div>
                            {acc.isSpecialCase && <span className="text-[9px] font-black text-amber-700 bg-amber-50 px-1 rounded border border-amber-200">⭐ حالة خاصة</span>}
                          </div>
                        </td>
                        <td className="p-3 font-bold">{acc.grade} ({acc.classRoom})</td>
                        <td className="p-3 font-extrabold text-[#0284C7]">{acc.courseTitle}</td>
                        <td className="p-3 font-mono font-black text-[#0F172A]">${acc.customFee} USD</td>
                        <td className="p-3 font-mono font-black text-emerald-600">${acc.paidAmount} USD</td>
                        <td className="p-3 font-mono font-black text-red-600">${acc.remAmount} USD</td>
                        <td className="p-3 text-center font-mono">
                          {acc.remAmount === 0 ? (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-[10px] font-bold">
                              ✅ مسدد بالكامل
                            </span>
                          ) : acc.paidAmount > 0 ? (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-300 rounded-lg text-[10px] font-bold">
                              ⏳ مسدد جزئياً
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-300 rounded-lg text-[10px] font-bold">
                              🔴 مستحق للصرف
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {currentRole === 'admin' && (
                              <button
                                onClick={() => {
                                  setPayingStudent({
                                    courseId: acc.courseId,
                                    studentId: acc.studentId,
                                    studentName: acc.studentName,
                                    fee: acc.customFee,
                                    paid: acc.paidAmount
                                  });
                                  setPayAmountInput((acc.customFee - acc.paidAmount).toString());
                                }}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl cursor-pointer font-bold text-xs flex items-center gap-1 shadow-2xs"
                                title="تسديد وتأكيد حفظ الدفعة المالية"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>حفظ الدفعة 💰</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="border-t-2 border-[#0284C7] bg-[#F8FAFC] font-extrabold text-xs">
                  <tr>
                    <td colSpan={3} className="p-3 text-right text-slate-700">
                      <span>إجمالي القيمة المالية المخصصة لدورات التقوية:</span>
                    </td>
                    <td className="p-3 font-mono font-black text-[#0284C7] text-sm">
                      ${totalTutoringExpectedRevenue.toLocaleString()} USD
                    </td>
                    <td className="p-3 font-mono font-black text-emerald-600 text-sm">
                      ${totalTutoringPaidRevenue.toLocaleString()} USD
                    </td>
                    <td className="p-3 font-mono font-black text-red-600 text-sm">
                      ${totalTutoringRemainingDues.toLocaleString()} USD
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Course */}
      {showAddCourseModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleAddCourseSubmit}
            className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#0284C7]" />
                <span>{isAr ? 'إضافة دورة تقوية جديدة للمعهد' : 'Add Tutoring Course'}</span>
              </h3>
              <button type="button" onClick={() => setShowAddCourseModal(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs">✕</button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">عنوان الدورة <span className="text-red-500">*</span></label>
              <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="دورة تقوية الرياضيات المكثفة..." className="w-full bg-[#F8FAFC] border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-[#0284C7]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">المادة الدراسية</label>
                <input type="text" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="w-full bg-[#F8FAFC] border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">المعلم المحاضر</label>
                <input type="text" value={newInstructor} onChange={(e) => setNewInstructor(e.target.value)} className="w-full bg-[#F8FAFC] border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">القسط الافتراضي ($ USD)</label>
                <input type="number" value={newFee} onChange={(e) => setNewFee(e.target.value)} className="w-full bg-[#F8FAFC] border border-slate-200 text-xs font-mono font-bold rounded-xl px-3 py-2 focus:outline-none text-right" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">عدد المقاعد المتاحة</label>
                <input type="number" value={newSeats} onChange={(e) => setNewSeats(e.target.value)} className="w-full bg-[#F8FAFC] border border-slate-200 text-xs font-mono font-bold rounded-xl px-3 py-2 focus:outline-none text-right" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">المواعيد والأيام</label>
              <input type="text" value={newDays} onChange={(e) => setNewDays(e.target.value)} className="w-full bg-[#F8FAFC] border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">لون كرت الدورة</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {presetColors.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setNewColor(c.hex)}
                    className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-transform ${newColor === c.hex ? 'scale-125 border-slate-900 shadow-md' : 'border-white'}`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setShowAddCourseModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">إلغاء</button>
              <button type="submit" className="btn-mustard px-5 py-2 rounded-xl text-xs font-bold shadow cursor-pointer">حفظ وإضافة الدورة ✅</button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Modal: Edit Custom Student Fee */}
      {editingFeeStudent && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleUpdateStudentFeeSubmit}
            className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#0284C7]">تعديل قسط التلميذ: {editingFeeStudent.studentName}</h3>
              <button type="button" onClick={() => setEditingFeeStudent(null)} className="w-7 h-7 rounded-full bg-slate-100 font-bold text-xs">✕</button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">قسط التقوية المخصص ($ USD)</label>
              <input type="number" required value={editFeeVal} onChange={(e) => setEditFeeVal(e.target.value)} className="w-full bg-[#F8FAFC] border-2 border-[#0284C7] text-xs font-mono font-black rounded-xl px-3 py-2 focus:outline-none text-right text-[#0284C7]" />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setEditingFeeStudent(null)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">إلغاء</button>
              <button type="submit" className="btn-mustard px-4 py-1.5 rounded-xl text-xs font-bold shadow">حفظ القسط 💾</button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Modal: Record Tutoring Payment */}
      {payingStudent && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleRecordPaymentSubmit}
            className="bg-white border-2 border-emerald-500 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-emerald-700">تسديد دفعة لحساب التقوية - {payingStudent.studentName}</h3>
              <button type="button" onClick={() => setPayingStudent(null)} className="w-7 h-7 rounded-full bg-slate-100 font-bold text-xs">✕</button>
            </div>

            <div className="space-y-1 text-xs font-bold text-slate-600 bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200">
              <div>القسط المخصص: <span className="font-mono text-[#0F172A] font-black">${payingStudent.fee} USD</span></div>
              <div>المسدد سابقاً: <span className="font-mono text-emerald-700 font-black">${payingStudent.paid} USD</span></div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">قيمة الدفعة المقبوضة الآن ($ USD)</label>
              <input type="number" required value={payAmountInput} onChange={(e) => setPayAmountInput(e.target.value)} className="w-full bg-[#F8FAFC] border-2 border-emerald-500 text-xs font-mono font-black rounded-xl px-3 py-2 focus:outline-none text-right text-emerald-700" />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setPayingStudent(null)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">إلغاء</button>
              <button type="submit" className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow cursor-pointer">حفظ الدفعة 💾</button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Printable Dedicated Tutoring Ledger View */}
      {isPrintingTutoringLedger && createPortal(
        <div id="print-tutoring-ledger-area" className="fixed inset-0 bg-white z-[999999] p-6 text-right rtl font-sans text-slate-900 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between border-b-2 border-[#0284C7] pb-4">
            <div className="flex items-center gap-3">
              <img src="/school-logo.png" alt="Logo" className="w-14 h-14 object-contain" />
              <div>
                <h2 className="text-xl font-black text-[#0284C7]">
                  🎓 معهد التقوية والدورات التعليمية الخاصة - {siteSettings?.schoolName || 'مدرسة الدعم التعليمي'}
                </h2>
                <h1 className="text-sm font-bold text-slate-600">
                  كشف الحسابات والرسوم المالية الخاصة بدورات التقوية والدعم التعليمي
                </h1>
              </div>
            </div>
            <div className="text-left font-mono text-xs text-slate-500">
              <div>تاريخ الإصدار: {new Date().toLocaleDateString('ar-LB')}</div>
              <div>السنة الأكاديمية: {siteSettings?.academicYear || '2026/2027'}</div>
              <button 
                onClick={() => setIsPrintingTutoringLedger(false)} 
                className="print:hidden px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold mt-2 cursor-pointer"
              >
                إغلاق ✕
              </button>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-[#F8FAFC] border border-[#0284C7]/30 rounded-2xl text-center font-mono text-xs">
            <div>
              <span className="text-slate-500 font-sans block font-bold">إجمالي مستحقات التقوية:</span>
              <span className="text-base font-black text-[#0284C7]">${totalTutoringExpectedRevenue.toLocaleString()} USD</span>
            </div>
            <div>
              <span className="text-slate-500 font-sans block font-bold">إجمالي المبالغ المقبوضة:</span>
              <span className="text-base font-black text-emerald-600">${totalTutoringPaidRevenue.toLocaleString()} USD</span>
            </div>
            <div>
              <span className="text-slate-500 font-sans block font-bold">المتبقي المستحق غير المسدد:</span>
              <span className="text-base font-black text-red-600">${totalTutoringRemainingDues.toLocaleString()} USD</span>
            </div>
          </div>

          {/* Ledger Table */}
          <table className="w-full text-right text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-[#0284C7]/10 font-black text-[#0284C7] border-b border-slate-300">
                <th className="p-2 border border-slate-300">#</th>
                <th className="p-2 border border-slate-300">اسم التلميذ</th>
                <th className="p-2 border border-slate-300">الصف والشعبة</th>
                <th className="p-2 border border-slate-300">دورة التقوية</th>
                <th className="p-2 border border-slate-300">القسط المخصص</th>
                <th className="p-2 border border-slate-300">المدفوع</th>
                <th className="p-2 border border-slate-300">المتبقي</th>
                <th className="p-2 border border-slate-300 text-center">حالة السداد</th>
              </tr>
            </thead>
            <tbody>
              {filteredSpecialAccounts.map((acc, idx) => (
                <tr key={idx} className="border-b border-slate-200">
                  <td className="p-2 border border-slate-200 text-center font-mono">{idx + 1}</td>
                  <td className="p-2 border border-slate-200 font-bold">{acc.studentName}</td>
                  <td className="p-2 border border-slate-200">{acc.grade} ({acc.classRoom})</td>
                  <td className="p-2 border border-slate-200 font-bold text-[#0284C7]">{acc.courseTitle}</td>
                  <td className="p-2 border border-slate-200 font-mono font-bold">${acc.customFee} USD</td>
                  <td className="p-2 border border-slate-200 font-mono font-bold text-emerald-600">${acc.paidAmount} USD</td>
                  <td className="p-2 border border-slate-200 font-mono font-bold text-red-600">${acc.remAmount} USD</td>
                  <td className="p-2 border border-slate-200 text-center font-bold">
                    {acc.remAmount === 0 ? '✅ مسدد' : acc.paidAmount > 0 ? '⏳ مسدد جزئياً' : '🔴 مستحق'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pt-10 grid grid-cols-2 gap-10 text-center text-xs font-bold border-t border-dashed border-slate-300">
            <div className="space-y-10">
              <p>توقيع وختم مسؤول معهد التقوية والدورات</p>
              <div className="border-b border-slate-400 w-48 mx-auto"></div>
            </div>
            <div className="space-y-10">
              <p>اعتماد مدير المنظومة والمدرسة العامة</p>
              <div className="border-b border-slate-400 w-48 mx-auto"></div>
            </div>
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * { visibility: hidden !important; }
              #print-tutoring-ledger-area, #print-tutoring-ledger-area * { visibility: visible !important; }
              #print-tutoring-ledger-area {
                position: absolute !important;
                left: 0 !important; top: 0 !important;
                width: 100% !important;
                background: white !important; color: black !important;
              }
            }
          `}} />
        </div>,
        document.body
      )}

    </div>
  );
};
