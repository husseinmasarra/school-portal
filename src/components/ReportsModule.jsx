import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Printer, FileSpreadsheet, CheckCircle2, GraduationCap, DollarSign } from 'lucide-react';

export const ReportsModule = () => {
  const { 
    lang, t, currentRole, students = [], subjects = [], selectedStudentId,
    dailyMarks = [], addDailyMark, deleteDailyMark,
    getStudentSubjectScores, getStudentOverallGpa
  } = useApp();

  const isAr = lang === 'ar';
  const safeStudents = students || [];

  const getLevantFormattedDate = () => {
    const today = new Date();
    const day = today.getDate();
    const year = today.getFullYear();
    const levantMonths = [
      'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
      'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'
    ];
    return `${day} ${levantMonths[today.getMonth()]} ${year}`;
  };

  const [reportType, setReportType] = useState('academic'); // academic, financial, attendance, daily_log
  const [stuId, setStuId] = useState(selectedStudentId || safeStudents[0]?.id);

  // New Daily Mark Form Modal State
  const [showAddMarkModal, setShowAddMarkModal] = useState(false);
  const [newMark, setNewMark] = useState({
    subjectName: (subjects && subjects[0]?.name) || '',
    type: 'أعمال السنة',
    score: 20,
    maxScore: 20,
    notes: 'مشاركة ممتازة وتفاعل يومي'
  });

  const selectedStudent = safeStudents.find((s) => s.id === stuId) || safeStudents[0];
  const dynamicSubjectScores = getStudentSubjectScores ? getStudentSubjectScores(selectedStudent?.id) : [];
  const computedGpa = getStudentOverallGpa ? getStudentOverallGpa(selectedStudent?.id) : 95.6;

  if (!selectedStudent) {
    return (
      <div className="bg-white border border-[#E2E8F0] p-10 rounded-3xl text-center space-y-4 max-w-lg mx-auto my-12 animate-fade-in shadow-sm text-[#0F172A]">
        <div className="w-16 h-16 bg-[#0284C7]/10 text-[#0284C7] rounded-3xl flex items-center justify-center mx-auto">
          <Printer className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-[#0284C7]">{isAr ? 'لا يوجد طلاب مضافون حالياً لإصدار التقارير 📄' : 'No Students Available for Reports'}</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          {isAr ? 'يمكنك إضافة طالب جديد من قسم (دليل المدرسة) لبدء إستخراج التقارير والشهادات المدرسية.' : 'Add a student from Directory to generate reports.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">
      
      {/* Banner Header & Controls (Hidden when printing) */}
      <div className="no-print space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm text-[#0F172A]">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0284C7]">{t('reportsTitle')}</h2>
              <p className="text-xs text-slate-500 mt-1">
                {isAr 
                  ? "إصدار وطباعة كافة التقارير الأكاديمية والمالية وكشوف الحسابات والشهادات المدرسية."
                  : "Generate and print academic report cards, financial ledger statements, and attendance logs."}
              </p>
            </div>
          </div>

          {/* Student Picker */}
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-xl">
            <span className="text-xs text-slate-500 font-medium">{t('studentName')}:</span>
            <select
              value={stuId || ''}
              onChange={(e) => setStuId(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#0F172A] focus:outline-none cursor-pointer"
            >
              {safeStudents.map((s) => (
                <option key={s.id} value={s.id} className="bg-white text-[#0F172A]">
                  {isAr ? s.name : s.nameEn} ({isAr ? s.grade : s.gradeEn})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Report Type Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Academic Report Card */}
          <div
            onClick={() => setReportType('academic')}
            className={`interactive-card p-6 rounded-3xl border-2 transition-all cursor-pointer space-y-3 shadow-sm ${
              reportType === 'academic'
                ? 'bg-[#F8FAFC] dark:bg-[#1E293B] border-[#0284C7] ring-1 ring-[#0284C7]'
                : 'bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
                <GraduationCap className="w-6 h-6" />
              </div>
              {reportType === 'academic' && <CheckCircle2 className="w-5 h-5 text-[#0284C7]" />}
            </div>
            <h3 className="text-base font-bold text-[#0F172A] dark:text-white">{t('academicReport')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isAr ? "كشف درجات الطالب الرسمية وترتيب الصف والمعدل العام والتقييمات." : "Official student grades, rank, GPA, and teacher performance notes."}
            </p>
          </div>

          {/* Daily Marks Registry Card */}
          <div
            onClick={() => setReportType('daily_log')}
            className={`interactive-card p-6 rounded-3xl border-2 transition-all cursor-pointer space-y-3 shadow-sm ${
              reportType === 'daily_log'
                ? 'bg-[#F8FAFC] dark:bg-[#1E293B] border-[#0284C7] ring-1 ring-[#0284C7]'
                : 'bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 rounded-2xl">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              {reportType === 'daily_log' && <CheckCircle2 className="w-5 h-5 text-[#0284C7]" />}
            </div>
            <h3 className="text-base font-bold text-[#0F172A] dark:text-white">{isAr ? 'سجل العلامات اليومية 📊' : 'Daily Marks Log'}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isAr ? "رصد وإضافة علامات واختبارات الطالب اليومية وحساب المعدل التراكمي." : "Log & track daily student grades across subjects to compute GPA."}
            </p>
          </div>

          {/* Financial Report Card (Hidden for Teachers) */}
          {currentRole !== 'teacher' && (
            <div
              onClick={() => setReportType('financial')}
              className={`interactive-card p-6 rounded-3xl border-2 transition-all cursor-pointer space-y-3 shadow-sm ${
                reportType === 'financial'
                  ? 'bg-[#F8FAFC] dark:bg-[#1E293B] border-[#0284C7] ring-1 ring-[#0284C7]'
                  : 'bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                  <DollarSign className="w-6 h-6" />
                </div>
                {reportType === 'financial' && <CheckCircle2 className="w-5 h-5 text-[#0284C7]" />}
              </div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white">{t('financialReport')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {isAr ? "كشف حساب مالي تفصيلي بالأقساط المسددة بالدولار والمبالغ المتبقية." : "Detailed student tuition payment statement in USD & remaining dues."}
              </p>
            </div>
          )}

          {/* Attendance Report Card */}
          <div
            onClick={() => setReportType('attendance')}
            className={`interactive-card p-6 rounded-3xl border-2 transition-all cursor-pointer space-y-3 shadow-sm ${
              reportType === 'attendance'
                ? 'bg-[#F8FAFC] dark:bg-[#1E293B] border-[#0284C7] ring-1 ring-[#0284C7]'
                : 'bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              {reportType === 'attendance' && <CheckCircle2 className="w-5 h-5 text-[#0284C7]" />}
            </div>
            <h3 className="text-base font-bold text-[#0F172A] dark:text-white">{t('attendanceReport')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isAr ? "تقرير حضور وغياب الطالب وساعات الانضباط والتأخيرات المسجلة." : "Student attendance log, discipline hours, and registered tardiness."}
            </p>
          </div>

        </div>
      </div>

      {/* Main Printable Stage Document */}
      <div className="space-y-6">
        <div className="no-print bg-white border border-[#E2E8F0] rounded-3xl p-4 sm:p-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <img src={selectedStudent.avatar} alt={selectedStudent.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#0284C7]" />
            <div>
              <h3 className="text-base font-bold text-[#0284C7]">{isAr ? selectedStudent.name : selectedStudent.nameEn}</h3>
              <p className="text-xs text-slate-500">{isAr ? selectedStudent.grade : selectedStudent.gradeEn} ({selectedStudent.classRoom})</p>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="btn-mustard flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>
              {reportType === 'academic' 
                ? (isAr ? 'طباعة التقرير الأكاديمي 🖨️' : 'Print Academic Report 🖨️')
                : reportType === 'financial'
                ? (isAr ? 'طباعة الكشف المالي 🖨️' : 'Print Financial Statement 🖨️')
                : (isAr ? 'طباعة تقرير الحضور 🖨️' : 'Print Attendance Log 🖨️')}
            </span>
          </button>
        </div>

        {/* Academic Report Section - Harmonized Official Report Certificate */}
        {reportType === 'academic' && (
          <div 
            className="printable-document bg-white dark:bg-[#0F172A] border-4 border-double border-[#0284C7] rounded-3xl p-6 sm:p-10 space-y-6 shadow-2xl relative my-4 text-[#0F172A] dark:text-white"
          >
            
            {/* 🏫 Official School Crest & Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-[#0284C7] pb-5 text-center sm:text-right gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0284C7] to-sky-500 text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-white">
                  🎓
                </div>
                <div>
                  <h1 className="text-xl font-black text-[#0284C7] dark:text-[#38BDF8]">{isAr ? 'مدرسة الدعم التعليمي' : 'Educational Support School'}</h1>
                </div>
              </div>

              <div className="text-center sm:text-left space-y-1">
                <div className="inline-block bg-[#0284C7]/10 dark:bg-[#0284C7]/20 text-[#0284C7] dark:text-[#38BDF8] px-3 py-1 rounded-full text-xs font-black border border-[#0284C7]/30">
                  كشف درجات وشهادة تقويم رسمية 📜
                </div>
                <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 block pt-1">رقم المستند: SCH-2026/9842</p>
                <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 block">التاريخ: {getLevantFormattedDate()}</p>
              </div>
            </div>

            {/* 👤 Student Information Summary Box */}
            <div className="bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#0284C7]/30 dark:border-[#334155] rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs text-[#0F172A] dark:text-white">
              <div className="flex items-center gap-3 col-span-2">
                <img src={selectedStudent.avatar} alt={selectedStudent.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-[#0284C7] shadow-sm" />
                <div>
                  <span className="text-xs font-bold text-[#0284C7] dark:text-[#38BDF8] block">اسم الطالب الرباعي:</span>
                  <h3 className="text-base font-black text-[#0F172A] dark:text-white">{selectedStudent.name}</h3>
                  <span className="text-xs font-mono font-extrabold text-slate-500 dark:text-slate-400">{selectedStudent.nameEn || selectedStudent.name}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-[#0284C7] dark:text-[#38BDF8] block">الصف والشعبة:</span>
                <span className="text-sm font-black text-[#0F172A] dark:text-white block">{selectedStudent.grade} ({selectedStudent.classRoom || 'أ'})</span>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-[#0284C7] dark:text-[#38BDF8] block">العام الدراسي والمرحلة:</span>
                <span className="text-sm font-black text-[#0F172A] dark:text-white block">2025 - 2026 (الفصل الثاني)</span>
                <span className="text-xs block font-bold text-emerald-600 dark:text-emerald-400">الحالة: منتظم ومجتاز 🟢</span>
              </div>
            </div>

            {/* 📊 Official Detailed Marks Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-between border-b border-slate-200 dark:border-[#334155] pb-2">
                <span className="font-extrabold">جدول تفاصيل درجات المواد الدراسية للعام الحالي:</span>
                <span className="font-mono text-slate-500 dark:text-slate-400 font-extrabold">العلامة الكلية للمادة (100)</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-right rtl:text-right border-collapse border border-slate-200 dark:border-[#334155] text-xs">
                  <thead>
                    <tr className="bg-[#0284C7] text-white text-xs font-black">
                      <th className="p-3 border border-sky-700 text-right">المادة الدراسية</th>
                      <th className="p-3 border border-sky-700 text-center print:hidden">أعمال السنة (20)</th>
                      <th className="p-3 border border-sky-700 text-center print:hidden">الاختبارات (20)</th>
                      <th className="p-3 border border-sky-700 text-center">منتصف الفصل (20)</th>
                      <th className="p-3 border border-sky-700 text-center">النهائي (40)</th>
                      <th className="p-3 border border-sky-700 text-center">المجموع (100)</th>
                      <th className="p-3 border border-sky-700 text-center">التقدير الرسمي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-[#334155]">
                    {dynamicSubjectScores.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-slate-400 font-bold">
                          {isAr ? 'لم يتم إضافة أي مواد دراسية للنظام بعد. يمكنك إضافة المواد من قسم دليل المواد.' : 'No active subjects added yet.'}
                        </td>
                      </tr>
                    ) : (
                      dynamicSubjectScores.map((row, idx) => (
                        <tr 
                          key={row.id || idx} 
                          className="bg-white dark:bg-[#1E293B] border-b border-slate-200 dark:border-[#334155] transition-colors"
                        >
                          <td className="p-3 border border-slate-200 dark:border-[#334155] font-black text-sm text-[#0F172A] dark:text-white">
                            {row.name}
                          </td>
                          <td className="p-3 border border-slate-200 dark:border-[#334155] text-center font-mono font-bold text-sm text-slate-800 dark:text-slate-200 print:hidden">
                            {row.hw}
                          </td>
                          <td className="p-3 border border-slate-200 dark:border-[#334155] text-center font-mono font-bold text-sm text-slate-800 dark:text-slate-200 print:hidden">
                            {row.quiz}
                          </td>
                          <td className="p-3 border border-slate-200 dark:border-[#334155] text-center font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
                            {row.midterm}
                          </td>
                          <td className="p-3 border border-slate-200 dark:border-[#334155] text-center font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
                            {row.final}
                          </td>
                          <td className="p-3 border border-slate-200 dark:border-[#334155] text-center font-mono font-black text-base text-[#0284C7] dark:text-[#38BDF8]">
                            {row.total}
                          </td>
                          <td className="p-3 border border-slate-200 dark:border-[#334155] text-center">
                            <span className="px-2.5 py-1 rounded-md text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                              {row.grade}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 🏅 Final Result KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono pt-2">
              <div className="bg-sky-50 dark:bg-[#1E293B] p-3.5 rounded-2xl border border-sky-200 dark:border-[#334155] text-center space-y-1">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-bold">المعدل العام التراكمي:</span>
                <span className="text-xl font-black text-[#0284C7] dark:text-[#38BDF8] block">{selectedStudent.gpa || 95.6}%</span>
              </div>
              <div className="bg-purple-50 dark:bg-[#1E293B] p-3.5 rounded-2xl border border-purple-200 dark:border-[#334155] text-center space-y-1">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-bold">الترتيب على الشعبة:</span>
                <span className="text-xl font-black text-purple-700 dark:text-purple-400 block">الأول (1) 🏆</span>
              </div>
              <div className="bg-indigo-50 dark:bg-[#1E293B] p-3.5 rounded-2xl border border-indigo-200 dark:border-[#334155] text-center space-y-1">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-bold">الترتيب على المرحلة:</span>
                <span className="text-xl font-black text-indigo-700 dark:text-indigo-400 block">الثالث (3) 🌟</span>
              </div>
              <div className="bg-emerald-50 dark:bg-[#1E293B] p-3.5 rounded-2xl border border-emerald-200 dark:border-[#334155] text-center space-y-1">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-bold">درجة الانضباط والسلوك:</span>
                <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 block">100 / 100 🟢</span>
              </div>
            </div>

            {/* ✍️ Official Signatures & School Seal Space */}
            <div className="pt-6 border-t-2 border-[#0284C7] dark:border-[#334155] grid grid-cols-3 gap-6 items-end text-xs text-[#0F172A] dark:text-white">
              <div className="text-center space-y-4">
                <span className="font-extrabold text-[#0284C7] dark:text-[#38BDF8] text-xs block">توقيع مربي الصف ومعلم المادة:</span>
                <div className="h-10 border-b border-dashed border-[#0284C7] dark:border-[#334155] mx-4"></div>
              </div>

              {/* Clean Official Signature & School Seal Space */}
              <div className="text-center space-y-4">
                <span className="font-extrabold text-[#0284C7] dark:text-[#38BDF8] text-xs block">خاتم المدرسة والتصديق الرسمي:</span>
                <div className="h-10 border-b border-dashed border-[#0284C7] dark:border-[#334155] mx-4"></div>
              </div>

              <div className="text-center space-y-4">
                <span className="font-extrabold text-[#0284C7] dark:text-[#38BDF8] text-xs block">توقيع مدير المدرسة:</span>
                <div className="h-10 border-b border-dashed border-[#0284C7] dark:border-[#334155] mx-4"></div>
              </div>
            </div>

          </div>
        )}

        {/* Financial Statement Section */}
        {reportType === 'financial' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
                <span className="text-slate-500 block">{t('totalTuition')}:</span>
                <span className="text-lg font-bold text-[#0F172A]">${selectedStudent.tuitionTotal || 1200} USD</span>
              </div>
              <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
                <span className="text-slate-500 block">{t('paidAmount')}:</span>
                <span className="text-lg font-bold text-[#0284C7]">${selectedStudent.tuitionPaid || 0} USD</span>
              </div>
              <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-red-300">
                <span className="text-red-600 block font-bold">{t('remainingAmount')}:</span>
                <span className="text-lg font-bold text-red-600">${(selectedStudent.tuitionTotal || 1200) - (selectedStudent.tuitionPaid || 0)} USD</span>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Log Section */}
        {reportType === 'attendance' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-[#F8FAFC] dark:bg-[#1E293B] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#334155]">
                <span className="text-slate-500 dark:text-slate-400 block">{isAr ? 'أيام الحضور المسجلة:' : 'Days Present:'}</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">175 {isAr ? 'يوم' : 'Days'}</span>
              </div>
              <div className="bg-[#F8FAFC] dark:bg-[#1E293B] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#334155]">
                <span className="text-slate-500 dark:text-slate-400 block">{isAr ? 'أيام الغياب بعذر:' : 'Excused Absences:'}</span>
                <span className="text-lg font-bold text-[#0284C7] dark:text-[#38BDF8]">2 {isAr ? 'يوم' : 'Days'}</span>
              </div>
              <div className="bg-[#F8FAFC] dark:bg-[#1E293B] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#334155]">
                <span className="text-slate-500 dark:text-slate-400 block">{isAr ? 'نسبة الانضباط:' : 'Attendance Rate:'}</span>
                <span className="text-lg font-bold text-[#0F172A] dark:text-white">98.8%</span>
              </div>
            </div>
          </div>
        )}

        {/* 📊 Daily Marks & Cumulative Assessment Registry Log */}
        {reportType === 'daily_log' && (
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-3xl p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-[#334155] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#0284C7] dark:text-[#38BDF8]">
                  {isAr ? `سجل العلامات اليومية والتراكمية للطالب: ${selectedStudent.name}` : `Daily Marks Log: ${selectedStudent.name}`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isAr 
                    ? "رصد كافة العلامات اليومية واختبارات المواد طوال العام وتجميعها تلقائياً لاحتساب المعدل العام." 
                    : "Track daily marks, homework, and quizzes across the entire academic year to calculate cumulative GPA."}
                </p>
              </div>

              <button
                onClick={() => setShowAddMarkModal(true)}
                className="btn-mustard flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow cursor-pointer"
              >
                <span>{isAr ? 'إضافة تقييم/علامة يومية جديدة ➕' : 'Add Daily Mark ➕'}</span>
              </button>
            </div>

            {/* Daily Marks Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right rtl:text-right border-collapse border border-slate-200 dark:border-[#334155] text-xs">
                <thead>
                  <tr className="bg-[#0284C7] text-white text-xs font-bold">
                    <th className="p-3 border border-sky-700 text-right">التاريخ</th>
                    <th className="p-3 border border-sky-700 text-right">المادة الدراسية</th>
                    <th className="p-3 border border-sky-700 text-center">نوع التقييم</th>
                    <th className="p-3 border border-sky-700 text-center">العلامة</th>
                    <th className="p-3 border border-sky-700 text-center">العلامة العظمى</th>
                    <th className="p-3 border border-sky-700 text-right">الملاحظات والتفاصيل</th>
                    <th className="p-3 border border-sky-700 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#334155]">
                  {(dailyMarks.filter((m) => m.studentId === selectedStudent.id)).length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-400 font-bold">
                        {isAr ? 'لا توجد علامات يومية مسجلة لهذا الطالب بعد. اضغط على زر الإضافة أعلاه لرصد علامة جديدة.' : 'No daily marks recorded yet for this student.'}
                      </td>
                    </tr>
                  ) : (
                    dailyMarks.filter((m) => m.studentId === selectedStudent.id).map((m) => (
                      <tr key={m.id} className="bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="p-3 border border-slate-200 dark:border-[#334155] font-mono font-bold text-slate-600 dark:text-slate-300">
                          {m.date}
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-[#334155] font-black text-[#0F172A] dark:text-white">
                          {m.subjectName || m.subject}
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-[#334155] text-center font-bold">
                          <span className="px-2 py-1 rounded-md text-[11px] bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-black">
                            {m.type}
                          </span>
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-[#334155] text-center font-mono font-black text-sm text-[#0284C7] dark:text-[#38BDF8]">
                          {m.score}
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-[#334155] text-center font-mono font-bold text-slate-500 dark:text-slate-400">
                          {m.maxScore || 20}
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-[#334155] text-slate-600 dark:text-slate-300 font-medium">
                          {m.notes || '-'}
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-[#334155] text-center">
                          <button
                            onClick={() => deleteDailyMark && deleteDailyMark(m.id)}
                            className="p-1.5 bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                            title="حذف العلامة"
                          >
                            ❌
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Daily Mark Modal */}
      {showAddMarkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl text-[#0F172A] dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
              <h3 className="text-base font-bold text-[#0284C7] dark:text-[#38BDF8]">
                {isAr ? `إضافة علامة يومية للطالب: ${selectedStudent.name}` : `Add Daily Mark: ${selectedStudent.name}`}
              </h3>
              <button 
                onClick={() => setShowAddMarkModal(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (addDailyMark) {
                  addDailyMark({
                    studentId: selectedStudent.id,
                    studentName: selectedStudent.name,
                    ...newMark
                  });
                }
                setShowAddMarkModal(false);
              }}
              className="space-y-4 text-xs font-bold"
            >
              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-300">المادة الدراسية:</label>
                <select
                  value={newMark.subjectName}
                  onChange={(e) => setNewMark({ ...newMark, subjectName: e.target.value })}
                  className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] p-3 rounded-xl text-xs font-bold text-[#0F172A] dark:text-white focus:outline-none"
                >
                  {(subjects || []).map((sub) => (
                    <option key={sub.id || sub.name} value={sub.name}>
                      {sub.name} {sub.nameEn ? `(${sub.nameEn})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-300">نوع التقييم / الاختبار:</label>
                <select
                  value={newMark.type}
                  onChange={(e) => setNewMark({ ...newMark, type: e.target.value })}
                  className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] p-3 rounded-xl text-xs font-bold text-[#0F172A] dark:text-white focus:outline-none"
                >
                  <option value="أعمال السنة">أعمال السنة والواجبات (20)</option>
                  <option value="اختبار قصير">اختبار قصير (20)</option>
                  <option value="منتصف الفصل">امتحان منتصف الفصل (20)</option>
                  <option value="النهائي">الامتحان النهائي (40)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-300">العلامة المستحقة:</label>
                  <input
                    type="number"
                    min="0"
                    max={newMark.maxScore}
                    value={newMark.score}
                    onChange={(e) => setNewMark({ ...newMark, score: Number(e.target.value) })}
                    className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] p-3 rounded-xl text-xs font-bold text-[#0F172A] dark:text-white focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-300">العلامة العظمى:</label>
                  <input
                    type="number"
                    value={newMark.type === 'النهائي' ? 40 : 20}
                    disabled
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-xs font-bold text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-300">ملاحظات والتفاصيل:</label>
                <input
                  type="text"
                  placeholder="مثال: تفوق ملحوظ وحفظ سليم للقواعد"
                  value={newMark.notes}
                  onChange={(e) => setNewMark({ ...newMark, notes: e.target.value })}
                  className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] p-3 rounded-xl text-xs font-bold text-[#0F172A] dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#334155]">
                <button
                  type="button"
                  onClick={() => setShowAddMarkModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-mustard px-5 py-2.5 rounded-xl text-xs font-bold shadow cursor-pointer"
                >
                  حفظ العلامة التراكمية 💾
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
