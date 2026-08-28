import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FolderArchive, 
  Calendar, 
  Users, 
  Award, 
  Search, 
  FileSpreadsheet, 
  Printer, 
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronDown,
  Eye,
  X,
  UserCheck,
  CreditCard,
  Trash2,
  Filter
} from 'lucide-react';

export const ArchiveModule = () => {
  const { 
    lang, 
    isAr = lang === 'ar',
    siteSettings,
    students = [],
    subjects = [],
    academicYearsArchive = [],
    deleteAcademicYearArchive,
    startNewAcademicYear,
    currentRole
  } = useApp();

  const [activeTab, setActiveTab] = useState('terms'); // 'terms' (أرشيف الفصول والعلامات) | 'years' (أرشيف السنوات الدراسية)
  const [selectedYearFilter, setSelectedYearFilter] = useState('all'); // 'all' or specific archive yearName
  const [searchTerm, setSearchTerm] = useState('');
  const [newYearInput, setNewYearInput] = useState('');
  const [showNewYearModal, setShowNewYearModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [inspectArchivedYear, setInspectArchivedYear] = useState(null);

  // Read saved matrix marks from localStorage for current year
  const matrixMarks = (() => {
    try {
      const saved = localStorage.getItem('school_matrix_marks');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  })();

  // Combine active students and all archived student snapshots across past years
  const allArchiveStudentsMap = new Map();
  
  // 1. Current active students
  (students || []).forEach(s => {
    allArchiveStudentsMap.set(s.id, { 
      ...s, 
      archiveYear: siteSettings?.academicYear || 'العام الحالي',
      matrixSnapshot: matrixMarks 
    });
  });

  // 2. Archived student snapshots
  (academicYearsArchive || []).forEach(ay => {
    if (selectedYearFilter === 'all' || selectedYearFilter === ay.yearName) {
      (ay.studentsSnapshot || []).forEach(s => {
        const key = `${s.id}_${ay.yearName}`;
        allArchiveStudentsMap.set(key, { 
          ...s, 
          archiveYear: ay.yearName, 
          matrixSnapshot: ay.matrixMarksSnapshot || {} 
        });
      });
    }
  });

  const safeStudents = Array.from(allArchiveStudentsMap.values());
  const safeSubjects = subjects || [];

  const [selectedStuKey, setSelectedStuKey] = useState('');
  const activeSelectedStuKey = selectedStuKey || (safeStudents[0] ? `${safeStudents[0].id}_${safeStudents[0].archiveYear}` : '');
  const selectedStudent = safeStudents.find(s => `${s.id}_${s.archiveYear}` === activeSelectedStuKey) || safeStudents[0];

  const getStudentTripleName = (student) => {
    if (!student) return '';
    const fn = (student.firstName || '').trim();
    const mn = (student.fatherName || student.parentName || '').trim();
    const ln = (student.lastName || student.family || student.surname || '').trim();
    if (fn && mn && ln) return `${fn} ${mn} ${ln}`;
    return student.name || '';
  };

  const handleCreateNewAcademicYear = (e) => {
    e.preventDefault();
    if (!newYearInput.trim()) return;
    if (startNewAcademicYear) {
      startNewAcademicYear(newYearInput.trim());
      setToastMsg(`تم بدء العام الدراسي الجديد (${newYearInput}) وأرشفة العام السابق بجميع طلابه ودرجاته وسجلاته بنجاح! 🎓📁`);
      setShowNewYearModal(false);
      setNewYearInput('');
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  const handleClearAllArchives = () => {
    if (window.confirm('هل أنت تأكد من رغبتك في تفريغ وحذف جميع سجلاّت الأرشيف التجريبي نهائياً من المنظومة؟')) {
      if (clearAllArchives) {
        clearAllArchives();
        setToastMsg('تم مسح وتفريغ كافة السجلات والأعوام المؤرشفة التجريبية بنجاح! 🗑️');
        setTimeout(() => setToastMsg(''), 4000);
      }
    }
  };

  const handleDeleteArchive = (arch) => {
    if (window.confirm(`هل أنت تأكد من رغبتك في حذف أرشيف العام الدراسي (${arch.yearName}) كلياً وبشكل نهائي من المنظومة؟`)) {
      if (deleteAcademicYearArchive) {
        deleteAcademicYearArchive(arch.id);
        setToastMsg(`تم حذف أرشيف العام الدراسي (${arch.yearName}) نهائياً بنجاح! 🗑️`);
        setTimeout(() => setToastMsg(''), 4000);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">
      
      {/* Header Banner */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
            <FolderArchive className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0284C7]">أرشيف السنوات السابقة وسجلات الفصول 📁</h2>
            <p className="text-xs text-slate-500 mt-1">
              سجل أرشيفي شامل يحفظ بيانات الأعوام المنتهية ودرجات الفصول، مع إمكانية حذف أو إضافة سنوات جديدة.
            </p>
          </div>
        </div>

        {currentRole === 'admin' && (
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {academicYearsArchive.length > 0 && (
              <button
                onClick={handleClearAllArchives}
                className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-2xl text-xs font-black shadow flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>مسح وتفريغ الأرشيف التجريبي 🗑️</span>
              </button>
            )}
            <button
              onClick={() => setShowNewYearModal(true)}
              className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-4 py-2 rounded-2xl text-xs font-black shadow flex items-center gap-2 cursor-pointer transition-all shrink-0"
            >
              <Calendar className="w-4 h-4" />
              <span>أرشفة العام الحالي وبدء سنة جديدة 🎓</span>
            </button>
          </div>
        )}
      </div>

      {toastMsg && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-500 text-emerald-900 rounded-2xl text-xs font-black shadow-sm animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('terms')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'terms'
              ? 'bg-[#0284C7] text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>أرشيف درجات وتفاصيل الفصول (الأول والأخير) 📘🎓</span>
        </button>

        <button
          onClick={() => setActiveTab('years')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'years'
              ? 'bg-[#0284C7] text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FolderArchive className="w-4 h-4" />
          <span>سجل الأعوام الدراسية المكتملة والأرشيف 📁 ({academicYearsArchive.length})</span>
        </button>
      </div>

      {/* ─── TAB 1: TERMS ARCHIVE (أرشيف علامات الطلاب بالفصلين) ─── */}
      {activeTab === 'terms' && (
        <div className="space-y-4">
          
          {/* Year Filter Dropdown Bar */}
          <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#0284C7]" />
              <label className="text-xs font-black text-slate-700">فلترة السجلات حسب العام الدراسي:</label>
            </div>

            <select
              value={selectedYearFilter}
              onChange={(e) => setSelectedYearFilter(e.target.value)}
              className="bg-[#F8FAFC] border-2 border-slate-200 text-xs font-black text-[#0284C7] rounded-xl px-4 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="all">كافة الأعوام المؤرشفة والسنوات 🎓</option>
              {academicYearsArchive.map(ay => (
                <option key={ay.id} value={ay.yearName}>العام الدراسي المؤرشف: {ay.yearName}</option>
              ))}
              <option value={siteSettings?.academicYear || 'العام الحالي'}>العام الحالي: {siteSettings?.academicYear || '2026/2027'}</option>
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Students Selection Roster */}
            <div className="bg-white border border-[#E2E8F0] p-5 rounded-3xl space-y-4 shadow-sm h-fit">
              <h3 className="text-sm font-black text-[#0F172A] flex items-center gap-2 border-b border-slate-100 pb-3">
                <Users className="w-4 h-4 text-[#0284C7]" />
                <span>اختر التلميذ لمعاينة أرشيف درجاته ({safeStudents.length})</span>
              </h3>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 rtl:right-3 ltr:left-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="🔍 ابحث عن اسم الطالب..."
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pr-9 pl-4 py-1.5 text-xs font-bold focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              {safeStudents.length === 0 ? (
                <div className="p-6 text-center text-slate-400 font-bold text-xs space-y-1">
                  <Clock className="w-8 h-8 mx-auto text-slate-300" />
                  <p>لا يوجد طلاب مؤرشفون مطابقون لهذا الفلتر حالياً.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {safeStudents
                    .filter(s => !searchTerm || (s.name || '').includes(searchTerm))
                    .map(stu => {
                      const stuKey = `${stu.id}_${stu.archiveYear}`;
                      const isSelected = stuKey === activeSelectedStuKey;
                      return (
                        <button
                          key={stuKey}
                          onClick={() => setSelectedStuKey(stuKey)}
                          className={`w-full text-right p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-sky-50 border-[#0284C7] ring-1 ring-[#0284C7]'
                              : 'bg-white border-slate-100 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img src={stu.avatar} alt={stu.name} className="w-8 h-8 rounded-full object-cover border border-[#0284C7] shrink-0" />
                            <div className="truncate">
                              <h4 className="text-xs font-black text-[#0F172A] truncate">{getStudentTripleName(stu)}</h4>
                              <span className="text-[10px] text-[#0284C7] font-bold block">{stu.archiveYear} • {stu.grade}</span>
                            </div>
                          </div>
                          {isSelected && <ChevronLeft className="w-4 h-4 text-[#0284C7] shrink-0" />}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Right Column: Detailed Scores Archive Comparison Table */}
            <div className="lg:col-span-2 space-y-6">
              {selectedStudent ? (
                <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-6 shadow-sm">
                  
                  {/* Student Identity Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-sky-50/70 p-4 rounded-2xl border border-sky-200">
                    <div className="flex items-center gap-3">
                      <img src={selectedStudent.avatar} alt={selectedStudent.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#0284C7]" />
                      <div>
                        <h3 className="text-base font-black text-[#0F172A]">{getStudentTripleName(selectedStudent)}</h3>
                        <p className="text-xs font-bold text-[#0284C7]">{selectedStudent.grade} ({selectedStudent.classRoom || 'أ'}) • رقم القيد: #{selectedStudent.id}</p>
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-white border border-sky-300 text-[#0284C7] rounded-xl text-xs font-black font-mono shadow-2xs">
                      أرشيف العام الدراسي: {selectedStudent.archiveYear}
                    </span>
                  </div>

                  {/* Scores Breakdown per Term Table */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-black text-[#0F172A] flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-[#0284C7]" />
                        <span>سجل مقارنة وعلامات المواد الرسمية (الفصل الأول VS الفصل الأخير)</span>
                      </span>
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-right border-collapse border border-slate-200">
                        <thead>
                          <tr className="bg-[#0284C7] text-white font-black text-[11px]">
                            <th className="p-3 border border-sky-700 text-right">المادة الدراسية</th>
                            <th className="p-3 border border-sky-700 text-center bg-sky-800 min-w-[110px]">📘 الفصل الأول</th>
                            <th className="p-3 border border-sky-700 text-center bg-emerald-700 min-w-[110px]">🎓 الفصل الأخير</th>
                            <th className="p-3 border border-sky-700 text-center min-w-[100px]">الحالة والتقييم</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-bold">
                          {safeSubjects.map((sub, idx) => {
                            const curMatrix = selectedStudent.matrixSnapshot || matrixMarks;
                            const valFirst = curMatrix[`${selectedStudent.id}_${sub.id}_first_term`] ?? curMatrix[`${selectedStudent.id}_${sub.id}`] ?? '';
                            const valFinal = curMatrix[`${selectedStudent.id}_${sub.id}_final_term`] ?? '';

                            const numFirst = valFirst !== '' ? Number(valFirst) : null;
                            const numFinal = valFinal !== '' ? Number(valFinal) : null;

                            return (
                              <tr key={sub.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                <td className="p-3 border border-slate-200 font-bold text-slate-800">
                                  <span className="ml-1.5">{sub.icon || '📚'}</span>
                                  <span>{sub.name}</span>
                                </td>
                                <td className="p-3 border border-slate-200 text-center font-mono font-black text-xs text-[#0284C7] bg-sky-50/40">
                                  {numFirst !== null ? `${numFirst} / 100` : 'غ.م'}
                                </td>
                                <td className="p-3 border border-slate-200 text-center font-mono font-black text-xs text-emerald-800 bg-emerald-50/40">
                                  {numFinal !== null ? `${numFinal} / 100` : 'غ.م'}
                                </td>
                                <td className="p-3 border border-slate-200 text-center">
                                  {numFinal !== null ? (
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                      numFinal >= 90 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                      numFinal >= 80 ? 'bg-sky-100 text-sky-800 border border-sky-300' :
                                      numFinal >= 70 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                                      numFinal >= 50 ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {numFinal >= 90 ? 'ممتاز' : numFinal >= 80 ? 'جيد جداً' : numFinal >= 70 ? 'جيد' : numFinal >= 50 ? 'مقبول' : 'راسب'}
                                    </span>
                                  ) : numFirst !== null ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sky-100 text-sky-800 border border-sky-200">
                                      مرصود ف1
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-[10px]">غير مرصود</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-[#E2E8F0] p-8 rounded-3xl text-center text-slate-400 font-bold text-xs shadow-sm">
                  يرجى اختيار طالب من القائمة لمعاينة الأرشيف الخاص به.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ─── TAB 2: YEARS ARCHIVE (أرشيف السنوات والأعوام الكاشفة) ─── */}
      {activeTab === 'years' && (
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
              <FolderArchive className="w-5 h-5 text-[#0284C7]" />
              <span>الأعوام الدراسية والسجلات المؤرشفة في النظام ({academicYearsArchive.length})</span>
            </h3>
          </div>

          {academicYearsArchive.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-[#F8FAFC] rounded-2xl border-2 border-dashed border-slate-200">
              <Clock className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-black text-slate-700">لا يوجد أعوام دراسية أُرشفَت بعد في النظام 📁</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                عند إقفال العام الدراسي الحالي وبدء سنة جديدة، سيتم حفظ ونقل كافة البيانات كلياً حسب الأهمية وتخزينها في هذا المكان بشكل مؤرخ ودائم.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {academicYearsArchive.map((arch) => (
                <div key={arch.id} className="p-5 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-4 shadow-xs hover:border-[#0284C7]/50 transition-all">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="text-base font-black text-[#0284C7]">العام الدراسي: {arch.yearName} 🎓</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono font-bold bg-white px-2 py-1 rounded-lg border border-slate-200">
                        تاريخ الأرشفة: {new Date(arch.archivedAt).toLocaleDateString('ar-EG')}
                      </span>
                      {currentRole === 'admin' && (
                        <button
                          onClick={() => handleDeleteArchive(arch)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 cursor-pointer transition-all shrink-0"
                          title="حذف هذا العام الدراسي من الأرشيف نهائياً 🗑️"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Priority 1 & 2 Snapshot Summary Badges */}
                  <div className="grid grid-cols-3 gap-2 text-xs font-bold text-slate-700">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-400 block font-bold">🔥 الطلاب المؤرشفون:</span>
                      <span className="text-sm font-black text-[#0284C7]">{(arch.studentsSnapshot || []).length} طالب</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-400 block font-bold">⚡ سجلات العلامات:</span>
                      <span className="text-sm font-black text-emerald-700">{Object.keys(arch.matrixMarksSnapshot || {}).length} درجة</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-400 block font-bold">📅 الحضور والغياب:</span>
                      <span className="text-sm font-black text-indigo-700">{(arch.attendanceSnapshot || []).length} سجل</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setInspectArchivedYear(arch)}
                    className="w-full bg-[#0284C7] hover:bg-[#0369A1] text-white py-2 rounded-xl text-xs font-black shadow flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    <span>معاينة سجلات هذا العام الأكاديمي بالتفصيل 🔍</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Inspect Archived Academic Year Detail Modal */}
      {inspectArchivedYear && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl animate-fade-in text-[#0F172A]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-[#0284C7] flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-[#0284C7]" />
                <span>سجل أرشيف العام الدراسي: {inspectArchivedYear.yearName} 🎓</span>
              </h3>
              <button onClick={() => setInspectArchivedYear(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer">✕</button>
            </div>

            {/* Structured by Priority Breakdown */}
            <div className="space-y-4">
              
              {/* Priority 1: Academic Scores & Students */}
              <div className="bg-sky-50/80 p-4 rounded-2xl border border-sky-200 space-y-3">
                <h4 className="text-xs font-black text-[#0284C7] flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>1. البيانات الأكاديمية والدرجات المؤرشفة (أعلى أهمية 🔥)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-bold">
                  <div className="bg-white p-2.5 rounded-xl border border-sky-100">
                    <span className="text-[10px] text-slate-400 block">إجمالي الطلاب:</span>
                    <span className="text-sm font-black text-slate-800">{(inspectArchivedYear.studentsSnapshot || []).length} طالب</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-sky-100">
                    <span className="text-[10px] text-slate-400 block">المواد الدراسية:</span>
                    <span className="text-sm font-black text-slate-800">{(inspectArchivedYear.subjectsSnapshot || []).length} مادة</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-sky-100">
                    <span className="text-[10px] text-slate-400 block">العلامات المرصودة:</span>
                    <span className="text-sm font-black text-emerald-700">{Object.keys(inspectArchivedYear.matrixMarksSnapshot || {}).length} علامة</span>
                  </div>
                </div>
              </div>

              {/* Priority 2: Attendance & Daily Logs */}
              <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 space-y-3">
                <h4 className="text-xs font-black text-emerald-800 flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  <span>2. سجلات الحضور واليوميات والدروس (أهمية عالية ⚡)</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-slate-400 block">سجلات الحضور والغياب:</span>
                    <span className="text-sm font-black text-emerald-800">{(inspectArchivedYear.attendanceSnapshot || []).length} سجل يومي</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-slate-400 block">ملاحظات واختبارات اليوميات:</span>
                    <span className="text-sm font-black text-emerald-800">{(inspectArchivedYear.dailyMarksSnapshot || []).length} اختبار وتقييم</span>
                  </div>
                </div>
              </div>

              {/* Priority 3: Finance & Admin */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>3. السجلات المالية والتواصل (أهمية إدارية 💵)</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">مصاريف ونفقات المدرسة:</span>
                    <span className="text-sm font-black text-slate-800">{(inspectArchivedYear.expensesSnapshot || []).length} عملية مالية</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">رسائل وإشعارات النظام:</span>
                    <span className="text-sm font-black text-slate-800">{(inspectArchivedYear.messagesSnapshot || []).length} رسالة</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              {currentRole === 'admin' && (
                <button
                  onClick={() => {
                    handleDeleteArchive(inspectArchivedYear);
                    setInspectArchivedYear(null);
                  }}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف هذا العام نهائياً من المنظومة 🗑️</span>
                </button>
              )}
              <button
                onClick={() => setInspectArchivedYear(null)}
                className="px-5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 cursor-pointer mr-auto"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Academic Year Modal */}
      {showNewYearModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in text-[#0F172A]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-[#0284C7] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0284C7]" />
                <span>أرشفة العام الحالي وبدء سنة جديدة 🎓</span>
              </h3>
              <button onClick={() => setShowNewYearModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer">×</button>
            </div>

            <form onSubmit={handleCreateNewAcademicYear} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 block">مسمى العام الدراسي الجديد:</label>
                <input
                  type="text"
                  required
                  value={newYearInput}
                  onChange={(e) => setNewYearInput(e.target.value)}
                  placeholder="مثال: 2027/2028"
                  className="w-full bg-[#F8FAFC] border-2 border-slate-200 text-xs font-bold rounded-2xl p-3 focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 space-y-1 text-xs font-bold text-[#0284C7]">
                <h4 className="font-black text-slate-900">ترتيب حفظ البيانات وتنظيف المنظومة:</h4>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700">
                  <li>🔥 <strong>نقل درجات وحاصل المواد الكاشفة والطلاب</strong> إلى الأرشيف بأمان.</li>
                  <li>⚡ <strong>حذف وتفريغ القوائم النشطة</strong> لإدخال طلاب ومعلمين جدد للعام القادم.</li>
                </ol>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewYearModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-black shadow cursor-pointer"
                >
                  تأكيد وحفظ بالأرشيف 💾
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
