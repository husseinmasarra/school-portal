import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { 
  FileSpreadsheet, 
  Award, 
  Plus, 
  CheckCircle2, 
  Trophy,
  Search,
  Printer,
  X
} from 'lucide-react';

export const ExamsModule = () => {
  const { 
    lang, t, currentRole, currentUser, siteSettings,
    exams = [], subjects = [], students = [], grades = [], classrooms = [],
    addExam, gradeExamResult, calculateStudentLevel, calculateGrandTotalLevel, addDailyMark, getStudentSubjectScores 
  } = useApp();

  const isAr = lang === 'ar';
  const safeExams = exams || [];
  const safeSubjects = subjects || [];
  const safeStudents = students || [];

  // View Mode: 'master' (Master Spreadsheet Table) or 'single' (Single Subject View)
  const [viewMode, setViewMode] = useState('master');
  const [selectedSubjectId, setSelectedSubjectId] = useState(() => safeSubjects[0]?.id || 'SUB-01');

  // Search & Grade Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('all');

  const normalizeArabic = (str) => {
    if (!str) return '';
    return str
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  };

  const normGradeStr = (str) => (str || '')
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace('الابتدائي', '')
    .replace('المتوسط', '')
    .replace('الثانوي', '')
    .replace('الصف', '')
    .replace('الشعبة', '')
    .replace(/[\(\)\-\_\s]/g, '');

  const getStudentTripleName = (student) => {
    if (!student) return '';

    const fn = (student.firstName || '').trim();
    const mn = (student.fatherName || student.parentName || '').trim();
    const ln = (student.lastName || student.family || student.surname || '').trim();

    if (fn && mn && ln) {
      return `${fn} ${mn} ${ln}`;
    }

    const rawName = (student.name || '').trim();
    const parts = rawName.split(/\s+/).filter(Boolean);
    if (parts.length >= 3) {
      return rawName;
    }

    if (parts.length === 2) {
      if (mn && !rawName.includes(mn)) {
        return `${parts[0]} ${mn} ${parts[1]}`;
      }
      if (ln && !rawName.includes(ln)) {
        return `${rawName} ${ln}`;
      }
      return rawName;
    }

    let fullName = parts[0] || fn || '';
    if (mn && !fullName.includes(mn)) fullName += ` ${mn}`;
    if (ln && !fullName.includes(ln)) fullName += ` ${ln}`;
    return fullName.trim() || rawName;
  };

  // Dynamically collect unique grades from registered system grades, classrooms, and students
  const availableGrades = Array.from(
    new Set([
      ...(grades || []).map(g => (typeof g === 'string' ? g : g.name || g.nameAr || g.nameEn)).filter(Boolean),
      ...(classrooms || []).map(c => c.gradeName || c.grade).filter(Boolean),
      ...(safeStudents || []).map(s => s.grade).filter(Boolean)
    ])
  ).filter(Boolean);

  const filteredStudents = safeStudents.filter((stu) => {
    const normSearch = normalizeArabic(searchTerm);
    const normName = normalizeArabic(stu.name || '') + ' ' + (stu.nameEn || '').toLowerCase() + ' ' + normalizeArabic(getStudentTripleName(stu));
    const nameMatch = !normSearch || normName.includes(normSearch);

    if (selectedGradeFilter === 'all') return nameMatch;

    const sNorm = normGradeStr(stu.grade);
    const fNorm = normGradeStr(selectedGradeFilter);
    const gradeMatch = sNorm.includes(fNorm) || fNorm.includes(sNorm);

    return nameMatch && gradeMatch;
  });

  // Currently active subject for single view
  const selectedSubject = safeSubjects.find(s => s.id === selectedSubjectId) || safeSubjects[0] || { id: 'SUB-01', name: 'الرياضيات' };

  // Matrix marks state: key is `${studentId}_${subjectId}` -> numeric score string
  const [matrixMarks, setMatrixMarks] = useState({});
  const [savedToast, setSavedToast] = useState(false);
  const [savedToastMsg, setSavedToastMsg] = useState('');

  // Active Term State: 'first_term' (الفصل الأول) | 'final_term' (الفصل الأخير)
  const [activeTerm, setActiveTerm] = useState(() => {
    return localStorage.getItem('school_active_term') || 'first_term';
  });

  // Selected Students Checkbox State for Batch Printing
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  const [printableReportsList, setPrintableReportsList] = useState(null);
  const [certificateType, setCertificateType] = useState(() => activeTerm === 'final_term' ? 'end_year' : 'mid_year'); // 'mid_year' | 'end_year'

  const getCellVal = (stuId, subId) => {
    if (activeTerm === 'final_term') {
      const val = matrixMarks[`${stuId}_${subId}_final_term`];
      return val !== undefined ? val : 0;
    } else {
      const val = matrixMarks[`${stuId}_${subId}_first_term`] ?? matrixMarks[`${stuId}_${subId}`];
      return val !== undefined ? val : '';
    }
  };

  const handleCellChange = (stuId, subId, newScore) => {
    if (activeTerm === 'final_term') {
      setMatrixMarks(prev => ({
        ...prev,
        [`${stuId}_${subId}_final_term`]: newScore
      }));
    } else {
      setMatrixMarks(prev => ({
        ...prev,
        [`${stuId}_${subId}_first_term`]: newScore,
        [`${stuId}_${subId}`]: newScore
      }));
    }
  };

  const toggleStudentSelection = (stuId) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (next.has(stuId)) next.delete(stuId);
      else next.add(stuId);
      return next;
    });
  };

  const isAllFilteredSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedStudentIds.has(s.id));

  const toggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      setSelectedStudentIds(new Set());
    } else {
      const newIds = new Set(selectedStudentIds);
      filteredStudents.forEach(s => newIds.add(s.id));
      setSelectedStudentIds(newIds);
    }
  };

  const buildStudentReportObj = (stu) => {
    // 1. Save student marks first
    handleSaveStudentAllSubjects(stu.id);

    // 2. Build breakdown of student subject scores
    let stuTotalSum = 0;
    const scoresBreakdown = safeSubjects.map(sub => {
      const val = getCellVal(stu.id, sub.id);
      const markNum = (val !== undefined && val !== '') ? Number(val) : 0;
      stuTotalSum += markNum;
      return {
        subject: sub.name,
        icon: sub.icon || '📚',
        score: markNum,
        level: calculateStudentLevel ? calculateStudentLevel(markNum) : (markNum >= 90 ? 'ممتاز' : markNum >= 80 ? 'جيد جداً' : markNum >= 70 ? 'جيد' : markNum >= 50 ? 'مقبول' : 'راسب')
      };
    });

    const maxTotalScore = (safeSubjects.length || 6) * 100;
    const grandLevel = calculateGrandTotalLevel 
      ? calculateGrandTotalLevel(stuTotalSum)
      : (stuTotalSum >= 550 ? 'ممتاز' : stuTotalSum >= 500 ? 'جيد جداً' : stuTotalSum >= 450 ? 'جيد' : stuTotalSum >= 300 ? 'مقبول' : 'راسب');

    return {
      student: stu,
      scores: scoresBreakdown,
      totalSum: stuTotalSum,
      maxTotalScore,
      grandLevel,
      date: new Date().toLocaleDateString('ar-EG')
    };
  };

  const handlePrintStudentReport = (stu) => {
    const report = buildStudentReportObj(stu);
    setPrintableReportsList([report]);
  };

  const handlePrintSelectedStudentsReports = () => {
    const selectedStudents = safeStudents.filter(s => selectedStudentIds.has(s.id));
    if (selectedStudents.length === 0) return;

    const reports = selectedStudents.map(stu => buildStudentReportObj(stu));
    setPrintableReportsList(reports);
  };

  // Toggle body class when certificate print modal is active to hide main page content on print
  React.useEffect(() => {
    if (printableReportsList && printableReportsList.length > 0) {
      document.body.classList.add('has-print-portal');
    } else {
      document.body.classList.remove('has-print-portal');
    }
    return () => {
      document.body.classList.remove('has-print-portal');
    };
  }, [printableReportsList]);

  // Close any open modals when pressing ESC key
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.code === 'Escape') {
        setPrintableReportsList(null);
        setShowAddExamModal(false);
        setShowGradeModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Pre-fill matrixMarks from existing scores on initial load
  React.useEffect(() => {
    if (safeStudents.length > 0 && safeSubjects.length > 0 && getStudentSubjectScores) {
      const initialMap = {};
      safeStudents.forEach(stu => {
        const scores = getStudentSubjectScores(stu.id) || [];
        scores.forEach(subScore => {
          if (subScore.total !== undefined && subScore.total > 0) {
            initialMap[`${stu.id}_${subScore.id}`] = subScore.total;
          }
        });
      });
      setMatrixMarks(prev => ({ ...initialMap, ...prev }));
    }
  }, [safeStudents.length, safeSubjects.length]);

  // For Student or Parent: Show ONLY their own exam results
  if (currentRole === 'student' || currentRole === 'parent') {
    const studentUser = safeStudents.find(s => s.id === currentUser?.id || s.name === currentUser?.name) || safeStudents[0] || { id: 'STU-101', name: currentUser?.name || 'طالب متميز' };
    const myExams = safeExams.filter(ex => ex.results && ex.results.some(r => r.studentId === studentUser.id));

    return (
      <div className="space-y-6 animate-fade-in text-[#0F172A]">
        {/* Header */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-indigo-600">لوحة التقييم والنتائج الدراسية</h2>
              <p className="text-xs text-slate-500 mt-1">
                {isAr ? `النتائج والعلامات الرسمية للتلميذ: ${studentUser.name}` : `Academic exam grades for: ${studentUser.name}`}
              </p>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#0F172A]">كشف العلامات والامتحانات</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] text-indigo-600 border-b border-[#E2E8F0] font-bold">
                  <th className="p-3 text-right">المادة الدراسية</th>
                  <th className="p-3">العلامة الكلية</th>
                  <th className="p-3 text-center">المستوى والتقدير</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {myExams.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-6 text-slate-400 font-bold">لم تصدر أي نتائج امتحانات رسمية بعد. 📅</td>
                  </tr>
                ) : (
                  myExams.map((ex) => {
                    const myResult = ex.results.find(r => r.studentId === studentUser.id);
                    const lvl = calculateStudentLevel ? calculateStudentLevel(myResult.score) : 'مقبول';
                    return (
                      <tr key={ex.id} className="hover:bg-slate-50">
                        <td className="p-3 text-right font-bold text-[#0284C7]">{ex.subject || ex.title}</td>
                        <td className="p-3 font-mono font-black text-sm">
                          {myResult.score} / 100
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                            lvl === 'ممتاز' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            lvl === 'جيد جداً' ? 'bg-sky-100 text-sky-800 border border-sky-300' :
                            lvl === 'جيد' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            lvl === 'مقبول' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                            'bg-red-100 text-red-800 border border-red-300'
                          }`}>
                            {lvl}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Save single student marks across all subjects in Master View
  const handleSaveStudentAllSubjects = (studentId) => {
    const typeLabel = activeTerm === 'final_term' ? 'الفصل الأخير' : 'الفصل الأول';
    safeSubjects.forEach(sub => {
      const val = getCellVal(studentId, sub.id);
      if (val !== undefined && val !== '') {
        const markNum = Number(val) || 0;
        const evalText = calculateStudentLevel ? calculateStudentLevel(markNum) : (markNum >= 90 ? 'ممتاز' : markNum >= 80 ? 'جيد جداً' : markNum >= 70 ? 'جيد' : markNum >= 50 ? 'مقبول' : 'راسب');

        const examObj = safeExams.find(ex => ex.subjectId === sub.id || (ex.subject && ex.subject.trim() === sub.name.trim())) || { id: `EXM-AUTO-${sub.id}` };
        gradeExamResult(examObj.id, studentId, markNum, evalText);

        if (addDailyMark) {
          addDailyMark({
            studentId,
            subjectId: sub.id,
            subjectName: sub.name,
            score: markNum,
            maxScore: 100,
            type: typeLabel,
            notes: evalText,
            date: new Date().toISOString().split('T')[0]
          });
        }
      }
    });

    setSavedToastMsg(isAr ? `تم حفظ كافة درجات الطالب لـ (${typeLabel}) وتحديث المجموع والمستوى بنجاح! 💾` : 'Student marks updated!');
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  // Save ALL students and ALL subjects in one master click
  const handleSaveAllMasterMatrix = () => {
    const typeLabel = activeTerm === 'final_term' ? 'الفصل الأخير' : 'الفصل الأول';
    safeStudents.forEach(stu => {
      safeSubjects.forEach(sub => {
        const val = getCellVal(stu.id, sub.id);
        if (val !== undefined && val !== '') {
          const markNum = Number(val) || 0;
          const evalText = calculateStudentLevel ? calculateStudentLevel(markNum) : (markNum >= 90 ? 'ممتاز' : markNum >= 80 ? 'جيد جداً' : markNum >= 70 ? 'جيد' : markNum >= 50 ? 'مقبول' : 'راسب');

          const examObj = safeExams.find(ex => ex.subjectId === sub.id || (ex.subject && ex.subject.trim() === sub.name.trim())) || { id: `EXM-AUTO-${sub.id}` };
          gradeExamResult(examObj.id, stu.id, markNum, evalText);

          if (addDailyMark) {
            addDailyMark({
              studentId: stu.id,
              subjectId: sub.id,
              subjectName: sub.name,
              score: markNum,
              maxScore: 100,
              type: typeLabel,
              notes: evalText,
              date: new Date().toISOString().split('T')[0]
            });
          }
        }
      });
    });

    setSavedToastMsg(isAr ? `تم حفظ وتثبيت كافة درجات جميع الطلاب لـ (${typeLabel}) لجميع المواد بنجاح! 💾✨` : 'All marks saved successfully!');
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3500);
  };

  const getStudentLiveGpaPercentage = (stuId) => {
    let stuTotalSum = 0;
    let hasAnyMark = false;
    safeSubjects.forEach(sub => {
      const val = getCellVal(stuId, sub.id);
      if (val !== undefined && val !== '' && val !== null) {
        stuTotalSum += Number(val) || 0;
        hasAnyMark = true;
      }
    });
    if (!hasAnyMark) return 0;
    const maxTotalScore = (safeSubjects.length || 1) * 100;
    return Math.round((stuTotalSum / maxTotalScore) * 100);
  };

  // Sort Top Performing Roster based on live GPA
  const topStudentsRoster = [...safeStudents].sort((a, b) => {
    const gpaA = getStudentLiveGpaPercentage(a.id);
    const gpaB = getStudentLiveGpaPercentage(b.id);
    return gpaB - gpaA;
  });

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">
      
      {/* Title Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm text-[#0F172A]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0284C7]">{isAr ? 'الجدول الشامل لرصد العلامات والدرجات' : 'Master Grade Registry Sheet'}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {isAr 
                ? "رصد كافة علامات المواد في جدول موحد كملف Excel لحساب المجموع التراكمي والمستوى فوراً."
                : "Master spreadsheet layout to record all subject marks in one grid."}
            </p>
          </div>
        </div>

        {/* View Mode Toggle Controls */}
        <div className="flex items-center gap-2 bg-[#F8FAFC] border-2 border-[#0284C7]/30 p-1.5 rounded-2xl shadow-sm shrink-0">
          <button
            onClick={() => setViewMode('master')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              viewMode === 'master' 
                ? 'bg-[#0284C7] text-white shadow-md' 
                : 'text-slate-600 hover:text-[#0284C7]'
            }`}
          >
            📊 {isAr ? 'جدول كافة المواد الشامل' : 'Master Grid'}
          </button>

          <button
            onClick={() => setViewMode('single')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              viewMode === 'single' 
                ? 'bg-[#0284C7] text-white shadow-md' 
                : 'text-slate-600 hover:text-[#0284C7]'
            }`}
          >
            📚 {isAr ? 'رصد مادة واحدة' : 'Single Subject'}
          </button>
        </div>
      </div>

      {/* Active Term Selector Banner */}
      <div className={`p-4 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs ${
        activeTerm === 'first_term' 
          ? 'bg-sky-50/80 border-sky-300 text-sky-950' 
          : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${
            activeTerm === 'first_term' ? 'bg-[#0284C7] text-white' : 'bg-emerald-600 text-white'
          }`}>
            {activeTerm === 'first_term' ? '📘' : '🎓'}
          </div>
          <div>
            <h3 className="font-black text-sm flex items-center gap-2">
              <span>{activeTerm === 'first_term' ? 'رصد وتصفح درجات: الفصل الأول 📘' : 'رصد وتصفح درجات: الفصل الأخير 🎓'}</span>
            </h3>
            <p className="text-xs opacity-80 mt-0.5">
              {activeTerm === 'first_term' 
                ? 'يمكنك رصد وطباعة كشوف وعلامات الفصل الأول بحرية وسهولة.' 
                : 'علامات وكشوف الفصل الأخير، يمكنك التبديل بين الفصلين في أي وقت.'}
            </p>
          </div>
        </div>

        {/* Term Switcher Buttons */}
        <div className="flex items-center gap-2 bg-white/90 p-1.5 rounded-2xl border border-slate-200 shadow-xs shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTerm('first_term');
              localStorage.setItem('school_active_term', 'first_term');
              setCertificateType('mid_year');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTerm === 'first_term' ? 'bg-[#0284C7] text-white shadow-sm scale-105' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📘 الفصل الأول
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTerm('final_term');
              localStorage.setItem('school_active_term', 'final_term');
              setCertificateType('end_year');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTerm === 'final_term' ? 'bg-emerald-600 text-white shadow-sm scale-105' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🎓 الفصل الأخير
          </button>
        </div>
      </div>

      {savedToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in shadow-lg">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <span>{savedToastMsg}</span>
        </div>
      )}

      {/* Top Performing Honor Roll Roster */}
      {safeStudents.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm text-[#0F172A]">
          <h3 className="text-base font-bold text-[#0284C7] border-b border-slate-100 pb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>{isAr ? 'لوحة شرف الأوائل المتفوقين (Top Ranked Roster)' : 'Top Academic Honor Roll'}</span>
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topStudentsRoster.slice(0, 3).map((stu, index) => {
              const liveGpa = getStudentLiveGpaPercentage(stu.id);
              return (
                <div key={stu.id} className="interactive-card bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] flex items-center gap-3 shadow-sm hover:border-[#0284C7]/50">
                  <div className="relative">
                    <img src={stu.avatar} alt={stu.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#0284C7]" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF4444] text-white font-bold text-[10px] rounded-full flex items-center justify-center border border-white">
                      #{index + 1}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A]">{getStudentTripleName(stu)}</h4>
                    <p className="text-[11px] text-[#0284C7] font-semibold">{isAr ? stu.grade : stu.gradeEn} ({stu.classRoom || 'أ'})</p>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      المعدل التراكمي: {liveGpa > 0 ? `${liveGpa}%` : '0%'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MASTER GRID VIEW (📊 جدول رصد كافة المواد الشامل) */}
      {viewMode === 'master' && (
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm text-[#0F172A]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#0284C7]" />
              <span>{isAr ? 'الجدول الموحد الشامل لرصد علامات كافة المواد 📊' : 'Master All-Subjects Marks Registry Grid 📊'}</span>
            </h3>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* 🔍 Live Search Box */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={isAr ? "🔍 ابحث عن اسم الطالب..." : "🔍 Search student..."}
                  className="w-full bg-[#F8FAFC] border-2 border-slate-200 text-[#0F172A] rounded-2xl pr-9 pl-4 py-1.5 text-xs font-bold focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              {/* Grade Filter Dropdown */}
              <select
                value={selectedGradeFilter}
                onChange={(e) => setSelectedGradeFilter(e.target.value)}
                className="bg-[#F8FAFC] border-2 border-slate-200 text-xs font-extrabold text-[#0F172A] rounded-2xl px-3 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="all">{isAr ? 'جميع الصفوف 🏫' : 'All Grades 🏫'}</option>
                {availableGrades.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>

              {selectedStudentIds.size > 0 && (
                <button
                  type="button"
                  onClick={handlePrintSelectedStudentsReports}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-2xl text-xs font-black shadow hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer animate-fade-in shrink-0"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة شهادات المحددِين 🖨️ ({selectedStudentIds.size})</span>
                </button>
              )}

              <button
                onClick={handleSaveAllMasterMatrix}
                className="btn-mustard px-5 py-2 rounded-2xl text-xs font-black shadow hover:scale-105 transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <span>حفظ وتثبيت كافة درجات جميع الطلاب 💾</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right rtl:text-right ltr:text-left text-[11px] border-collapse border border-slate-200">
              <thead>
                <tr className="bg-[#0284C7] text-white font-black text-[11px]">
                  {/* ☒ Persistent Checkbox Column Header */}
                  <th className="p-2 border border-sky-700 text-center w-[35px] min-w-[35px] bg-[#0284C7] sticky right-0 z-20">
                    <input
                      type="checkbox"
                      checked={isAllFilteredSelected}
                      onChange={toggleSelectAllFiltered}
                      className="w-3.5 h-3.5 accent-amber-400 rounded cursor-pointer"
                      title={isAllFilteredSelected ? "إلغاء تحديد الكل" : "تحديد كافة الطلاب الظاهرين"}
                    />
                  </th>
                  <th className="p-2 border border-sky-700 text-right sticky right-[35px] bg-[#0284C7] z-20 w-[180px] min-w-[180px]">اسم الطالب الكامل</th>
                  <th className="p-2 border border-sky-700 text-center sticky right-[215px] bg-[#0284C7] z-20 w-[85px] min-w-[85px]">الصف والشعبة</th>
                  
                  {/* Dynamic Subject Columns */}
                  {safeSubjects.map(sub => (
                    <th key={sub.id} className="p-2 border border-sky-700 text-center min-w-[70px]">
                      {sub.icon || '📚'} {sub.name}
                    </th>
                  ))}

                  <th className="p-2 border border-sky-700 text-center bg-sky-900 min-w-[75px]">
                    المجموع الكلي
                  </th>
                  <th className="p-2 border border-sky-700 text-center bg-sky-950 min-w-[75px]">
                    التقدير العام
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={safeSubjects.length + 5} className="p-6 text-center text-slate-400 font-bold text-xs">
                      {isAr ? 'لا يوجد نتائج تطابق كلمة البحث في جدول الرصد.' : 'No matching students found.'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(stu => {
                    // Compute live grand total score sum for this student
                    let stuTotalSum = 0;
                    safeSubjects.forEach(sub => {
                      const val = getCellVal(stu.id, sub.id);
                      if (val !== undefined && val !== '') {
                        stuTotalSum += Number(val) || 0;
                      }
                    });

                    const maxTotalScore = (safeSubjects.length || 6) * 100;
                    const grandLevel = calculateGrandTotalLevel 
                      ? calculateGrandTotalLevel(stuTotalSum)
                      : (stuTotalSum >= 550 ? 'ممتاز' : stuTotalSum >= 500 ? 'جيد جداً' : stuTotalSum >= 450 ? 'جيد' : stuTotalSum >= 300 ? 'مقبول' : 'راسب');

                    return (
                      <tr key={stu.id} className="hover:bg-sky-50/50 transition-colors">
                        {/* ☒ Row Checkbox */}
                        <td className="p-2 border border-slate-200 text-center sticky right-0 bg-white shadow-sm z-10 w-[35px] min-w-[35px]">
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.has(stu.id)}
                            onChange={() => toggleStudentSelection(stu.id)}
                            className="w-3.5 h-3.5 accent-[#0284C7] rounded cursor-pointer"
                          />
                        </td>
                        <td className="p-2 border border-slate-200 font-black text-[11px] text-[#0F172A] sticky right-[35px] bg-white shadow-sm z-10 w-[180px] min-w-[180px]">
                          <div className="flex items-center gap-1.5">
                            <img src={stu.avatar} alt={stu.name} className="w-7 h-7 rounded-full object-cover border-2 border-[#0284C7] shrink-0" />
                            <span className="font-black text-[11px] text-[#0F172A] leading-snug whitespace-normal">
                              {getStudentTripleName(stu)}
                            </span>
                          </div>
                        </td>
                        <td className="p-2 border border-slate-200 text-center text-slate-600 font-bold sticky right-[215px] bg-white shadow-sm z-10 w-[85px] min-w-[85px] text-[11px]">
                          {isAr ? stu.grade : stu.gradeEn} ({stu.classRoom || 'أ'})
                        </td>

                        {/* Subject Cell Input Fields */}
                        {safeSubjects.map(sub => {
                          const cellVal = getCellVal(stu.id, sub.id);

                          return (
                            <td key={sub.id} className="p-1 border border-slate-200 text-center">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={cellVal}
                                onChange={(e) => handleCellChange(stu.id, sub.id, e.target.value)}
                                placeholder="0"
                                className="w-14 bg-white border-2 border-slate-200 text-[#0F172A] rounded-lg px-1 py-1 text-xs font-black text-center focus:outline-none focus:border-[#0284C7] shadow-xs"
                              />
                            </td>
                          );
                        })}

                        {/* Grand Total Score Cell */}
                        <td className="p-2 border border-slate-200 text-center font-mono font-black text-xs text-[#0284C7] bg-sky-50/70">
                          {stuTotalSum} / {maxTotalScore}
                        </td>

                        {/* Grand Total Level Cell */}
                        <td className="p-2 border border-slate-200 text-center bg-slate-50 text-[11px]">
                          <span className={`px-2 py-0.5 rounded-md font-black text-[10px] border ${
                            grandLevel === 'ممتاز' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                            grandLevel === 'جيد جداً' ? 'bg-sky-100 text-sky-800 border-sky-300' :
                            grandLevel === 'جيد' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                            grandLevel === 'مقبول' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                            'bg-red-100 text-red-800 border-red-300'
                          }`}>
                            {grandLevel}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SINGLE SUBJECT VIEW (📚 رصد حسب مادة واحدة) */}
      {viewMode === 'single' && (
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm text-[#0F172A]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#0284C7]" />
              <span>{isAr ? `دفتر رصد علامات مادة: (${selectedSubject.name}) 📝` : `Subject Marks Registry Sheet (${selectedSubject.name}) 📝`}</span>
            </h3>

            {safeSubjects.length > 0 && (
              <div className="flex items-center gap-2 bg-[#F8FAFC] border-2 border-[#0284C7]/40 px-4 py-2 rounded-2xl shadow-sm">
                <span className="text-xs font-black text-[#0284C7] shrink-0">{isAr ? 'اختر المادة الدراسية لرصد العلامة:' : 'Select Subject:'}</span>
                <select
                  value={selectedSubject.id}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="bg-white text-xs font-extrabold text-[#0F172A] border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
                >
                  {safeSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id} className="bg-white text-slate-900 font-bold py-1">
                      {sub.icon || '📚'} مادة: {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right rtl:text-right ltr:text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[#0284C7] bg-[#F8FAFC] font-black">
                  <th className="p-3 text-right">اسم الطالب</th>
                  <th className="p-3 text-right">الصف والشعبة</th>
                  <th className="p-3 text-center">وضع العلامة (/100)</th>
                  <th className="p-3 text-center">المستوى والتقدير (تلقائي)</th>
                  <th className="p-3 text-center">إجراء الحفظ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-slate-400 text-xs font-bold">
                      {isAr ? 'لا يوجد نتائج تطابق كلمة البحث في جدول الرصد.' : 'No matching students found.'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((stu) => {
                    const cellKey = `${stu.id}_${selectedSubject.id}`;
                    const currentMark = matrixMarks[cellKey] ?? '';
                    const currentMarkNum = Number(currentMark);
                    const currentLevel = currentMark !== '' && !isNaN(currentMarkNum)
                      ? (calculateStudentLevel ? calculateStudentLevel(currentMarkNum) : (currentMarkNum >= 90 ? 'ممتاز' : currentMarkNum >= 80 ? 'جيد جداً' : currentMarkNum >= 70 ? 'جيد' : currentMarkNum >= 50 ? 'مقبول' : 'راسب'))
                      : 'غير مرصود';

                    return (
                      <tr key={stu.id} className="hover:bg-[#F8FAFC] transition-all">
                        <td className="p-3 font-black text-sm text-[#0F172A]">
                          <div className="flex items-center gap-2">
                            <img src={stu.avatar} alt={stu.name} className="w-8 h-8 rounded-full object-cover border-2 border-[#0284C7] shrink-0" />
                            <span>{isAr ? stu.name : stu.nameEn}</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600 font-bold">{isAr ? stu.grade : stu.gradeEn} ({stu.classRoom || 'أ'})</td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={currentMark}
                            onChange={(e) => setMatrixMarks({ ...matrixMarks, [cellKey]: e.target.value })}
                            placeholder="مثال: 95"
                            className="w-24 bg-white border-2 border-slate-200 text-[#0F172A] rounded-xl px-3 py-1.5 text-sm font-black text-center focus:outline-none focus:border-[#0284C7] shadow-sm"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-3 py-1 rounded-lg text-xs font-black border ${
                            currentLevel === 'ممتاز' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                            currentLevel === 'جيد جداً' ? 'bg-sky-100 text-sky-800 border-sky-300' :
                            currentLevel === 'جيد' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                            currentLevel === 'مقبول' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                            currentLevel === 'راسب' ? 'bg-red-100 text-red-800 border-red-300' :
                            'bg-slate-100 text-slate-500 border-slate-300'
                          }`}>
                            {currentLevel}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleSaveStudentAllSubjects(stu.id)}
                            className="btn-mustard px-4 py-1.5 rounded-xl text-xs font-black shadow cursor-pointer hover:scale-105 transition-all"
                          >
                            حفظ رصد العلامة 💾
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Certificates Modal (Single or Multi-Student Batch) */}
      {printableReportsList && printableReportsList.length > 0 && createPortal(
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[99999] flex items-start justify-center p-4 overflow-y-auto cert-print-backdrop">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full space-y-6 shadow-2xl relative my-6">
            
            <style>{`
              @media print {
                @page {
                  size: portrait;
                  margin: 0mm !important;
                }
                @page :left { margin: 0mm !important; }
                @page :right { margin: 0mm !important; }
                @page :first { margin: 0mm !important; }

                *, *::before, *::after {
                  animation: none !important;
                  transition: none !important;
                  box-shadow: none !important;
                  text-shadow: none !important;
                }

                html, body {
                  margin: 0 !important;
                  padding: 0 !important;
                  background: #ffffff !important;
                  background-color: #ffffff !important;
                  color: #000000 !important;
                  color-scheme: light !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  width: 100% !important;
                  height: 100% !important;
                  direction: rtl !important;
                }

                body > #root {
                  display: none !important;
                }

                .cert-print-backdrop {
                  all: unset !important;
                  display: block !important;
                  position: absolute !important;
                  top: 0 !important;
                  left: 0 !important;
                  right: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  background: #ffffff !important;
                }

                .cert-print-backdrop > div {
                  all: unset !important;
                  display: block !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  background: #ffffff !important;
                  box-shadow: none !important;
                  border: none !important;
                }

                .print-cert-page {
                  all: unset !important;
                  display: flex !important;
                  flex-direction: column !important;
                  justify-content: space-between !important;
                  position: relative !important;
                  width: 190mm !important;
                  max-width: 190mm !important;
                  height: 272mm !important;
                  min-height: 272mm !important;
                  max-height: 272mm !important;
                  margin: 6mm auto !important;
                  padding: 8mm 10mm !important;
                  background: #ffffff !important;
                  color: #000000 !important;
                  border: 4px double #0284C7 !important;
                  box-sizing: border-box !important;
                  page-break-after: always !important;
                  break-after: page !important;
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                }

                /* Scaled Certificate Fonts & Elements to Fill A4 Page Completely */
                .print-cert-page .text-\[9px\] { font-size: 11px !important; }
                .print-cert-page .text-\[10px\] { font-size: 12px !important; }
                .print-cert-page .text-\[11px\] { font-size: 13px !important; }
                .print-cert-page .text-xs { font-size: 14px !important; }
                .print-cert-page .text-sm { font-size: 16px !important; }
                .print-cert-page .text-base { font-size: 18px !important; }
                .print-cert-page .text-lg { font-size: 20px !important; }
                .print-cert-page .text-xl { font-size: 24px !important; }

                .print-cert-page table {
                  font-size: 14px !important;
                }

                .print-cert-page table th {
                  font-size: 14px !important;
                  padding: 8px 10px !important;
                }

                .print-cert-page table td {
                  font-size: 14px !important;
                  padding: 8px 10px !important;
                }

                .print-cert-page table tfoot td {
                  font-size: 15px !important;
                  padding: 10px 10px !important;
                }

                .no-print {
                  display: none !important;
                }

                .cert-header-bg {
                  background-color: #0284C7 !important;
                  color: #ffffff !important;
                }

                .cert-table-header {
                  background-color: #0284C7 !important;
                  color: #ffffff !important;
                }
              }
            `}</style>

            {/* Top Modal Toolbar (Hidden on Print) */}
            <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
              <div>
                <h3 className="text-base font-black text-[#0F172A] flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#0284C7]" />
                  <span>معاينة وتوثيق الشهادات المدرسية ({printableReportsList.length} طالب)</span>
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  جاهزة للطباعة بأعلى قياسات الجودة A4 مع التواقيع المعتمَدة
                </p>
              </div>

              {/* Certificate Term Type Selector */}
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setCertificateType('mid_year')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    certificateType === 'mid_year'
                      ? 'bg-[#0284C7] text-white shadow-sm scale-105'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                  title="طباعة كشف الفصل الأول"
                >
                  <span>📘 الفصل الأول</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCertificateType('end_year')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    certificateType === 'end_year'
                      ? 'bg-emerald-600 text-white shadow-sm scale-105'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                  title="طباعة كشف الفصل الأخير"
                >
                  <span>🎓 الفصل الأخير</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const bd = document.querySelector('.cert-print-backdrop');
                    if (bd) bd.scrollTop = 0;
                    window.scrollTo(0, 0);
                    setTimeout(() => {
                      window.print();
                    }, 30);
                  }}
                  className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-5 py-2 rounded-xl text-xs font-black shadow flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الشهادة الآن 🖨️ (A4)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintableReportsList(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* List of Report Card Printable Documents */}
            <div className="space-y-8 print:space-y-0 print:block print:w-full print:h-auto print:overflow-visible">
              {printableReportsList.map((report) => {
                const percentage = Math.round((report.totalSum / (report.maxTotalScore || 1)) * 100);
                return (
                  <div 
                    key={report.student.id} 
                    className="print-cert-page border-4 border-double border-[#0284C7] p-6 sm:p-8 rounded-2xl bg-white space-y-5 text-[#0F172A] print:rounded-none print:shadow-none print:m-0 relative overflow-hidden"
                  >
                    {/* Document Header */}
                    <div className="flex items-center justify-between border-b-2 border-[#0284C7] pb-4 gap-4">
                      <div className="flex items-center gap-4 text-right">
                        <div className="w-20 h-20 bg-white rounded-2xl border-2 border-[#0284C7]/40 shadow-xs flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                          <img 
                            src={siteSettings?.schoolLogo || "/school-logo.png"} 
                            alt="شعار المدرسة" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-[#0F172A] leading-tight">
                            {siteSettings?.schoolName ? siteSettings.schoolName.replace(/الرسمية/g, '').trim() : 'مدرسة الدعم التعليمي'}
                          </h2>
                          <p className="text-xs font-bold text-slate-500">
                            {siteSettings?.schoolNameEn ? siteSettings.schoolNameEn.replace(/Official/gi, '').trim() : 'Educational Support School'}
                          </p>
                        </div>
                      </div>

                      <div className="text-left font-mono text-xs font-bold text-slate-600 shrink-0 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <p className="text-[#0284C7] font-black">رقم القيد: #{report.student.id.slice(-6)}</p>
                        <p>تاريخ الإصدار: {report.date}</p>
                        <p>العام الدراسي: {siteSettings?.academicYear || '2025 - 2026'}</p>
                      </div>
                    </div>

                    {/* Main Title Badge */}
                    <div className="text-center py-2.5 bg-[#0284C7] text-white rounded-xl shadow-xs border border-sky-600 cert-header-bg">
                      <h1 className="text-lg font-black tracking-wide">
                        {certificateType === 'mid_year'
                          ? '📘 كَشْفُ دَرَجَاتِ وَتَقْيِيمُ المَرْحَلَةِ الأُولَى (الفَصْلُ الأَوَّل)'
                          : '🎓 الشَّهَادَةُ العَامَّةُ وَالتَّقْيِيمُ النِّهَائِي (الفَصْلُ الأَخِير)'}
                      </h1>
                      <span className="text-[10px] text-sky-100 font-bold block">ACADEMIC TRANSCRIPT & REPORT CARD</span>
                    </div>

                    {/* Student Info Box */}
                    <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">اسم التلميذ(ة) الكامل:</span>
                        <h3 className="text-sm font-black text-[#0F172A]">{getStudentTripleName(report.student)}</h3>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">الصف والشعبة:</span>
                        <p className="text-xs font-bold text-[#0284C7]">{report.student.grade} ({report.student.classRoom || 'أ'})</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">المعدل المئوي العام:</span>
                        <p className="text-xs font-black text-emerald-700">{percentage}%</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">التقدير الأكاديمي الشامل:</span>
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-black rounded-lg text-xs border border-amber-300 inline-block mt-0.5">
                          {report.grandLevel}
                        </span>
                      </div>
                    </div>

                    {/* Subject Marks Table */}
                    <div className="my-3">
                      <table className="w-full text-xs border-collapse border border-slate-300 text-center">
                        <thead>
                          <tr className="bg-[#0284C7] text-white font-bold text-xs cert-table-header">
                            <th className="p-2.5 border border-sky-700 text-right">المادة الدراسية</th>
                            <th className="p-2.5 border border-sky-700">العلامة الكلية</th>
                            <th className="p-2.5 border border-sky-700">النسبة المئوية</th>
                            <th className="p-2.5 border border-sky-700">التقدير الأكاديمي</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-medium">
                          {report.scores.map((sc, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                              <td className="p-2 border border-slate-200 text-right font-bold text-slate-800">
                                <span className="ml-1">{sc.icon}</span> {sc.subject}
                              </td>
                              <td className="p-2 border border-slate-200 font-mono font-black text-xs text-[#0284C7]">
                                {sc.score} / 100
                              </td>
                              <td className="p-2 border border-slate-200 font-mono font-bold text-slate-700">
                                {sc.score}%
                              </td>
                              <td className="p-2 border border-slate-200">
                                <span className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] ${
                                  sc.score >= 90 ? 'bg-emerald-100 text-emerald-800' :
                                  sc.score >= 80 ? 'bg-sky-100 text-sky-800' :
                                  sc.score >= 70 ? 'bg-blue-100 text-blue-800' :
                                  sc.score >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {sc.level}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-sky-100/70 font-black text-slate-900 border-t-2 border-sky-300">
                            <td className="p-2.5 border border-slate-300 text-right text-xs">المجموع الكلي والنتيجة النهائية:</td>
                            <td className="p-2.5 border border-slate-300 font-mono text-sm text-[#0284C7]">
                              {report.totalSum} / {report.maxTotalScore}
                            </td>
                            <td className="p-2.5 border border-slate-300 font-mono text-sm text-emerald-700">
                              {percentage}%
                            </td>
                            <td className="p-2.5 border border-slate-300 text-xs text-amber-900 font-black">
                              {report.grandLevel}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Homeroom Teacher Notes Section */}
                    <div className="my-3 p-4 rounded-xl border border-slate-300 bg-slate-50/50 space-y-3">
                      <span className="text-sm font-black text-[#0284C7] block">ملاحظات مربي الصف:</span>
                      <div className="border-b border-dotted border-slate-400 h-6 w-full" />
                      <div className="border-b border-dotted border-slate-400 h-6 w-full" />
                    </div>

                    {/* Signatures */}
                    <div className="mt-4 pt-3 border-t-2 border-slate-300 flex justify-between items-end text-sm font-bold text-slate-800">
                      <div className="text-center space-y-3">
                        <p className="text-slate-900 font-black text-base">توقيع مربي الصف</p>
                        <div className="h-11 border-b-2 border-slate-400 w-48 mx-auto" />
                      </div>

                      <div className="text-center space-y-3">
                        <p className="text-slate-900 font-black text-base">توقيع مدير المدرسة</p>
                        <div className="h-11 border-b-2 border-slate-400 w-48 mx-auto" />
                      </div>
                    </div>

                    {/* Footer Verification */}
                    <div className="pt-2 text-center text-[9px] text-slate-400 border-t border-slate-100 flex justify-between items-center font-mono">
                      <span>وثيقة صادرة إلكترونياً عن نظام إدارة مدرسة الدعم التعليمي</span>
                      <span>كود التوثيق: CERT-{report.student.id}-{Date.now().toString().slice(-4)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
