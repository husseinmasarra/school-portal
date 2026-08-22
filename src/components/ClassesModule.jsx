import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Users, 
  GraduationCap, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  DoorOpen, 
  BookmarkCheck,
  Search,
  Printer,
  X,
  UserCheck,
  Eye
} from 'lucide-react';

export const ClassesModule = ({ initialSubTab = 'grades' }) => {
  const { 
    lang, 
    t, 
    currentRole, 
    currentUser,
    grades = [], 
    addGrade, 
    deleteGrade, 
    classrooms = [], 
    addClassroom, 
    deleteClassroom, 
    students = [], 
    teachers = [],
    subjects = [],
    masterTimetable = [],
    addTimetableSlot,
    deleteTimetableSlot,
    siteSettings,
    selectedStudentId
  } = useApp();

  const isAr = lang === 'ar';
  const safeGrades = grades || [];
  const safeClassrooms = classrooms || [];
  const safeStudents = students || [];
  const safeTeachers = teachers || [];
  const safeSubjects = subjects || [];
  const safeTimetable = masterTimetable || [];

  const [activeTab, setActiveTab] = useState(initialSubTab); // 'grades', 'classrooms', or 'timetable'
  const [successMsg, setSuccessMsg] = useState('');

  // Timetable Filters & Slot Modal State
  const [slotFilterDay, setSlotFilterDay] = useState('all');
  
  // Set default teacher filter for logged-in teacher
  const [slotFilterTeacher, setSlotFilterTeacher] = useState(() => {
    if (currentRole === 'teacher') {
      const activeTch = safeTeachers.find(t => t.id === currentUser?.id || t.username === currentUser?.username || t.name === currentUser?.name);
      return activeTch ? activeTch.id : 'all';
    }
    return 'all';
  });

  // Set default grade filter for student/parent view
  const [slotFilterGrade, setSlotFilterGrade] = useState(() => {
    if (currentRole === 'student' || currentRole === 'parent') {
      const activeStu = safeStudents.find(s => 
        s.id === selectedStudentId || 
        s.id === currentUser?.id || 
        s.name === currentUser?.name || 
        (currentRole === 'parent' && s.parentName === currentUser?.name)
      ) || safeStudents[0];
      return activeStu ? activeStu.grade : 'all';
    }
    return 'all';
  });

  // Set default section filter for student/parent view
  const [slotFilterSection, setSlotFilterSection] = useState(() => {
    if (currentRole === 'student' || currentRole === 'parent') {
      const activeStu = safeStudents.find(s => 
        s.id === selectedStudentId || 
        s.id === currentUser?.id || 
        s.name === currentUser?.name || 
        (currentRole === 'parent' && s.parentName === currentUser?.name)
      ) || safeStudents[0];
      return activeStu ? (activeStu.classRoom || 'أ') : 'all';
    }
    return 'all';
  });

  const [showAddSlotModal, setShowAddSlotModal] = useState(false);

  const [slotTeacherId, setSlotTeacherId] = useState(safeTeachers[0]?.id || '');
  const [slotSubject, setSlotSubject] = useState(safeSubjects[0]?.name || '');
  const [slotGrade, setSlotGrade] = useState(safeGrades[0]?.name || 'الصف السادس الابتدائي');
  const [slotSection, setSlotSection] = useState('أ');
  const [slotDay, setSlotDay] = useState('الإثنين');
  const [slotPeriod, setSlotPeriod] = useState(1);
  const [slotPeriodTime, setSlotPeriodTime] = useState('08:00 - 08:45');

  const handleAddSlotSubmit = (e) => {
    e.preventDefault();
    const targetTeacher = safeTeachers.find(t => t.id === slotTeacherId) || safeTeachers[0];
    
    addTimetableSlot({
      teacherId: slotTeacherId,
      teacherName: targetTeacher?.name || 'معلم المدرسة',
      subject: slotSubject,
      grade: slotGrade,
      section: slotSection,
      day: slotDay,
      period: Number(slotPeriod),
      periodTime: slotPeriodTime
    });

    setShowAddSlotModal(false);
    setSuccessMsg(isAr ? 'تم توزيع وإضافة الحصة لجدول المعلم والشعبة بنجاح!' : 'Timetable slot assigned successfully!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const filteredTimetableSlots = safeTimetable.filter((s) => {
    const matchDay = slotFilterDay === 'all' || s.day === slotFilterDay;
    const matchTeacher = slotFilterTeacher === 'all' || s.teacherId === slotFilterTeacher;
    const matchGrade = slotFilterGrade === 'all' || s.grade === slotFilterGrade;
    const matchSection = slotFilterSection === 'all' || s.section === slotFilterSection;
    return matchDay && matchTeacher && matchGrade && matchSection;
  });

  // Add Grade Modal State
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [gradeName, setGradeName] = useState('');
  const [gradeNameEn, setGradeNameEn] = useState('');
  const [gradeStage, setGradeStage] = useState('التعليم الأساسي');
  const [gradeStageEn, setGradeStageEn] = useState('Primary School');
  const [gradeTuition, setGradeTuition] = useState('1600');
  const [gradeColor, setGradeColor] = useState('#0284C7');

  // Add Classroom/Section Modal State
  const [showAddClassroomModal, setShowAddClassroomModal] = useState(false);
  const [selectedGradeId, setSelectedGradeId] = useState(safeGrades[0]?.id || 'GRD-01');
  const [sectionName, setSectionName] = useState('الشعبة (أ)');
  const [sectionNameEn, setSectionNameEn] = useState('Section A');
  const [capacity, setCapacity] = useState('30');
  const [supervisor, setSupervisor] = useState(safeTeachers[0]?.name || 'أ. طارق خوري');
  const [roomNumber, setRoomNumber] = useState('101');

  // View Class Roster Modal State
  const [showStudentsModal, setShowStudentsModal] = useState(null); // { title, gradeName, sectionName }
  const [modalSearchTerm, setModalSearchTerm] = useState('');

  const presetColors = [
    { hex: '#0284C7', label: isAr ? 'أزرق سماوي (Sky Blue)' : 'Sky Blue' },
    { hex: '#10b981', label: isAr ? 'أخضر زمردي (Emerald)' : 'Emerald' },
    { hex: '#a855f7', label: isAr ? 'بنفسجي (Purple)' : 'Purple' },
    { hex: '#EF4444', label: isAr ? 'أحمر قرمزي (Vibrant Red)' : 'Vibrant Red' },
    { hex: '#f59e0b', label: isAr ? 'ذهبي (Mustard Gold)' : 'Mustard Gold' },
    { hex: '#06b6d4', label: isAr ? 'سماوي (Cyan)' : 'Cyan' }
  ];

  const handleAddGradeSubmit = (e) => {
    e.preventDefault();
    if (!gradeName) return;

    addGrade({
      name: gradeName,
      nameEn: gradeNameEn || gradeName,
      stage: gradeStage,
      stageEn: gradeStageEn,
      tuitionFee: Number(gradeTuition),
      color: gradeColor
    });

    setGradeName('');
    setGradeNameEn('');
    setShowAddGradeModal(false);
    setSuccessMsg(isAr ? 'تم إضافة الصف الدراسي بنجاح!' : 'Grade added successfully!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleAddClassroomSubmit = (e) => {
    e.preventDefault();
    if (!sectionName) return;

    const parentGrade = safeGrades.find((g) => g.id === selectedGradeId);

    addClassroom({
      gradeId: selectedGradeId,
      gradeName: parentGrade ? parentGrade.name : 'الصف الدراسي',
      sectionName: sectionName,
      sectionNameEn: sectionNameEn || sectionName,
      capacity: Number(capacity),
      supervisor: supervisor,
      roomNumber: roomNumber
    });

    setSectionName('الشعبة (أ)');
    setShowAddClassroomModal(false);
    setSuccessMsg(isAr ? 'تم إضافة الشعبة والقاعة الدراسية بنجاح!' : 'Classroom section added successfully!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const normStr = (str) => (str || '')
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace('الابتدائي', '')
    .replace('المتوسط', '')
    .replace('الثانوي', '')
    .replace('الشعبة', '')
    .replace(/[\(\)\s]/g, '');

  // Filter students for the opened modal
  const getModalStudents = () => {
    if (!showStudentsModal) return [];
    return safeStudents.filter((s) => {
      const studentGrade = normStr(s.grade);
      const targetGrade = normStr(showStudentsModal.gradeName);

      const studentSec = normStr(s.classRoom || s.classroom);
      const targetSec = normStr(showStudentsModal.sectionName);

      const matchGrade = !targetGrade || studentGrade.includes(targetGrade) || targetGrade.includes(studentGrade);
      const matchSection = !targetSec || studentSec.includes(targetSec) || targetSec.includes(studentSec);
      
      const matchSearch = !modalSearchTerm || 
        (s.name && s.name.toLowerCase().includes(modalSearchTerm.toLowerCase())) || 
        (s.id && s.id.toLowerCase().includes(modalSearchTerm.toLowerCase()));

      return matchGrade && matchSection && matchSearch;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">
      
      {/* Title Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm text-[#0F172A]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0284C7]">{isAr ? 'إدارة الصفوف والشُعب الدراسية' : 'Grades & Classrooms Management'}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {isAr 
                ? "تخصيص الهيكل الأكاديمي، إضافة الصفوف والشُعب، ومعاينة كشف الطلاب المسجلين في كل صف وشعبة."
                : "Manage academic structure, grades, section classrooms, and view enrolled student rosters."}
            </p>
          </div>
        </div>

        {/* Admin Action Buttons */}
        {currentRole === 'admin' && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddGradeModal(true)}
              className="btn-mustard flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? "إضافة صف دراسي +" : "Add Grade +"}</span>
            </button>

            <button
              onClick={() => setShowAddClassroomModal(true)}
              className="btn-mustard flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? "إضافة شعبة جديدة +" : "Add Section +"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in shadow-lg">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center gap-3">
          <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-500 block text-[11px] font-sans">{isAr ? 'عدد الصفوف' : 'Total Grades'}</span>
            <span className="text-lg font-black text-[#0F172A]">{safeGrades.length} {isAr ? 'صفوف' : 'Grades'}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
            <DoorOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-500 block text-[11px] font-sans">{isAr ? 'عدد الشعب والقاعات' : 'Total Sections'}</span>
            <span className="text-lg font-black text-emerald-600">{safeClassrooms.length} {isAr ? 'شُعب' : 'Sections'}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-200">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-500 block text-[11px] font-sans">{isAr ? 'الطلاب الموزعون' : 'Assigned Students'}</span>
            <span className="text-lg font-black text-purple-600">{safeStudents.length} {isAr ? 'طلاب' : 'Students'}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-500 block text-[11px] font-sans">{isAr ? 'متوسط السعة الاستيعابية' : 'Avg Capacity'}</span>
            <span className="text-lg font-black text-slate-700">30 {isAr ? 'طالب/قاعة' : 'Students/Room'}</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] p-4 rounded-3xl shadow-sm text-[#0F172A] flex-wrap">
        <button
          onClick={() => setActiveTab('grades')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'grades' ? 'bg-[#0284C7] text-white shadow-md' : 'bg-[#F8FAFC] text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isAr ? `الصفوف الدراسية (${safeGrades.length})` : `Grades (${safeGrades.length})`}
        </button>

        <button
          onClick={() => setActiveTab('classrooms')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'classrooms' ? 'bg-[#0284C7] text-white shadow-md' : 'bg-[#F8FAFC] text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isAr ? `الشُعب والقاعات (${safeClassrooms.length})` : `Sections & Classrooms (${safeClassrooms.length})`}
        </button>

        <button
          onClick={() => setActiveTab('timetable')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'timetable' ? 'bg-purple-600 text-white shadow-md' : 'bg-[#F8FAFC] text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>⏱️</span>
          <span>{isAr ? `جدول وتوزيع الحصص والصفوف (${safeTimetable.length})` : `Weekly Timetable (${safeTimetable.length})`}</span>
        </button>
      </div>

      {/* TAB 1: GRADES OVERVIEW */}
      {activeTab === 'grades' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeGrades.map((grd) => {
            const gradeSections = safeClassrooms.filter((c) => c.gradeId === grd.id || c.gradeName === grd.name);
            const gradeStudents = safeStudents.filter((s) => s.grade && s.grade.includes(grd.name.replace(' الابتدائي', '').replace(' المتوسط', '')));

            return (
              <div
                key={grd.id}
                onClick={() => setShowStudentsModal({ title: `قائمة طلاب ${grd.name}`, gradeName: grd.name, sectionName: null })}
                className="interactive-card bg-white border border-[#E2E8F0] rounded-3xl p-6 space-y-4 shadow-sm hover:border-[#0284C7] hover:shadow-lg transition-all cursor-pointer relative group"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow"
                      style={{ backgroundColor: grd.color || '#0284C7' }}
                    >
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#0284C7] transition-colors">{isAr ? grd.name : grd.nameEn}</h3>
                      <span className="text-[11px] text-slate-400 font-semibold">{isAr ? grd.stage : grd.stageEn}</span>
                    </div>
                  </div>

                  {currentRole === 'admin' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteGrade(grd.id);
                      }}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all cursor-pointer"
                      title={t('delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-[#F8FAFC] p-3 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-slate-500 block font-sans">{isAr ? 'عدد الشعب:' : 'Sections:'}</span>
                    <span className="font-bold text-[#0284C7] text-sm">{gradeSections.length} {isAr ? 'شُعب' : 'Sections'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-sans">{isAr ? 'عدد التلاميذ:' : 'Enrolled Students:'}</span>
                    <span className="font-black text-purple-600 text-sm">{gradeStudents.length} {isAr ? 'طلاب' : 'Students'}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <BookmarkCheck className="w-4 h-4 text-[#0284C7]" />
                      <span>{isAr ? `الشعب الدراسية التابعة (${gradeSections.length}):` : `Sections (${gradeSections.length}):`}</span>
                    </span>
                  </span>

                  {gradeSections.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic py-1">{isAr ? 'لا توجد شعب مضافة لهذا الصف حالياً.' : 'No sections added yet.'}</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {gradeSections.map((sec) => (
                        <span key={sec.id} className="px-2.5 py-1 bg-sky-50 text-[#0284C7] border border-sky-200 rounded-xl text-[11px] font-bold">
                          {isAr ? sec.sectionName : sec.sectionNameEn} (قاعة {sec.roomNumber})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-[#0284C7]">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>عرض قائمة التلاميذ ({gradeStudents.length}) 👥</span>
                  </span>
                  <Eye className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: CLASSROOMS & SECTIONS ROSTER */}
      {activeTab === 'classrooms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeClassrooms.filter(cls => {
            if (currentRole !== 'teacher') return true;
            const assigned = currentUser?.assignedClassrooms || currentUser?.assignedClasses || [];
            if (!assigned || assigned.length === 0) return true;
            const fullClass = `${cls.gradeName} (${cls.sectionName})`;
            return assigned.some(a => a === fullClass || (cls.gradeName && a.includes(cls.gradeName) && (a.includes(`(${cls.sectionName})`) || a.includes(cls.sectionName))));
          }).map((cls) => {
            const sectionStudents = safeStudents.filter((s) => {
              const studentGrade = normStr(s.grade);
              const targetGrade = normStr(cls.gradeName);
              const studentSec = normStr(s.classRoom || s.classroom);
              const targetSec = normStr(cls.sectionName);
              return (studentGrade.includes(targetGrade) || targetGrade.includes(studentGrade)) &&
                     (studentSec.includes(targetSec) || targetSec.includes(studentSec));
            });

            return (
              <div
                key={cls.id}
                onClick={() => setShowStudentsModal({ title: `طلاب ${cls.gradeName} - ${cls.sectionName}`, gradeName: cls.gradeName, sectionName: cls.sectionName })}
                className="interactive-card bg-white border border-[#E2E8F0] rounded-3xl p-6 space-y-4 shadow-sm hover:border-[#0284C7] hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold shadow">
                      <DoorOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#0284C7] transition-colors">{cls.gradeName}</h3>
                      <span className="text-xs text-[#0284C7] font-bold block">{isAr ? cls.sectionName : cls.sectionNameEn} • (قاعة {cls.roomNumber})</span>
                    </div>
                  </div>

                  {currentRole === 'admin' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteClassroom(cls.id);
                      }}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all cursor-pointer"
                      title={t('delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-[#F8FAFC] p-3 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-slate-500 block">{isAr ? 'المعلم المشرف:' : 'Supervisor:'}</span>
                    <span className="font-bold text-[#0F172A]">{cls.supervisor}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{isAr ? 'عدد الطلاب:' : 'Students:'}</span>
                    <span className="font-black text-purple-600 font-mono">{sectionStudents.length} / {cls.capacity}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-[#0284C7]">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>عرض تلاميذ الشعبة ({sectionStudents.length}) 👥</span>
                  </span>
                  <Eye className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: MASTER WEEKLY TIMETABLE & CLASS ALLOCATION */}
      {activeTab === 'timetable' && (
        <div className="space-y-6 animate-fade-in text-[#0F172A]">
          {/* Header Banner & Add Slot Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-purple-700 flex items-center gap-2">
                <span>⏱️</span>
                <span>{isAr ? 'جدول توزيع الحصص والشُعب الأسبوعية لجميع المدرسين' : 'Master Weekly Schedule for All Teachers'}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {isAr 
                  ? 'منظومة توزيع حصص المدرسين والصفوف. الحصص المضافة من الإدارة تظهر فوراً في جدول كل مدرس وفي هذه الصفحة الشاملة.'
                  : 'Weekly teaching timetable. Admin assigned slots automatically sync to each teacher\'s private portal.'}
              </p>
            </div>

            {currentRole === 'admin' && (
              <button
                onClick={() => setShowAddSlotModal(true)}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'إضافة وتوزيع حصة لمدرس +' : 'Assign Teacher Slot +'}</span>
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              
              {/* Grade and Section filters for Admin and Teacher (Rendered first!) */}
              {(currentRole === 'admin' || currentRole === 'teacher') && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-purple-700 dark:text-purple-400">{isAr ? 'الصف الدراسي:' : 'Grade:'}</span>
                    <select
                      value={slotFilterGrade}
                      onChange={(e) => setSlotFilterGrade(e.target.value)}
                      className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 text-purple-950 dark:text-purple-300 rounded-xl px-3 py-1.5 font-bold focus:outline-none"
                    >
                      <option value="all">{isAr ? 'جميع الصفوف' : 'All Grades'}</option>
                      {safeGrades.map((g) => (
                        <option key={g.id} value={g.name}>{g.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-purple-700 dark:text-purple-400">{isAr ? 'الشعبة:' : 'Section:'}</span>
                    <select
                      value={slotFilterSection}
                      onChange={(e) => setSlotFilterSection(e.target.value)}
                      className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 text-purple-950 dark:text-purple-300 rounded-xl px-3 py-1.5 font-bold focus:outline-none"
                    >
                      <option value="all">{isAr ? 'جميع الشعب' : 'All Sections'}</option>
                      <option value="أ">{isAr ? 'الشعبة (أ)' : 'Section A'}</option>
                      <option value="ب">{isAr ? 'الشعبة (ب)' : 'Section B'}</option>
                      <option value="ج">{isAr ? 'الشعبة (ج)' : 'Section C'}</option>
                    </select>
                  </div>
                </>
              )}

              {/* Locked view notice badge for Student and Parent */}
              {(currentRole === 'student' || currentRole === 'parent') && (
                <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 rounded-xl font-bold flex items-center gap-1.5">
                  <span>🎓 {isAr ? 'جدول حصص الصف والشعبة المخصصة:' : 'Your Enrolled Class Timetable:'}</span>
                  <span className="underline decoration-wavy decoration-emerald-500 font-extrabold">{slotFilterGrade} ({isAr ? `الشعبة ${slotFilterSection}` : `Section ${slotFilterSection}`})</span>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-600 dark:text-slate-300">{isAr ? 'اليوم:' : 'Day:'}</span>
                <select
                  value={slotFilterDay}
                  onChange={(e) => setSlotFilterDay(e.target.value)}
                  className="bg-[#F8FAFC] dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 font-bold focus:outline-none"
                >
                  <option value="all">{isAr ? 'جميع الأيام (الإثنين - الخميس)' : 'All Days (Mon - Thu)'}</option>
                  <option value="الإثنين">الإثنين (Monday)</option>
                  <option value="الثلاثاء">الثلاثاء (Tuesday)</option>
                  <option value="الأربعاء">الأربعاء (Wednesday)</option>
                  <option value="الخميس">الخميس (Thursday)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-600 dark:text-slate-300">{isAr ? 'تصفية حسب المعلم:' : 'Filter Teacher:'}</span>
                <select
                  value={slotFilterTeacher}
                  onChange={(e) => setSlotFilterTeacher(e.target.value)}
                  className="bg-[#F8FAFC] dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 font-bold focus:outline-none"
                >
                  <option value="all">{isAr ? 'جميع المعلمين' : 'All Teachers'}</option>
                  {safeTeachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.subject || 'معلم'})</option>
                  ))}
                </select>
              </div>
            </div>

            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              {isAr ? `إجمالي الحصص الموزعة: ${filteredTimetableSlots.length} حصة` : `Total Slots: ${filteredTimetableSlots.length}`}
            </span>
          </div>

          {/* Timetable Grid View */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm overflow-x-auto">
            <table className="w-full text-right rtl:text-right border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-[#1E293B] text-[11px] font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-[#334155]">
                  <th className="p-3 w-28">{isAr ? 'اليوم' : 'Day'}</th>
                  <th className="p-3 text-center">{isAr ? 'الحصة 1 (07:30 - 08:20)' : 'Period 1 (07:30 - 08:20)'}</th>
                  <th className="p-3 text-center">{isAr ? 'الحصة 2 (08:20 - 09:10)' : 'Period 2 (08:20 - 09:10)'}</th>
                  <th className="p-3 text-center bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold">
                    {isAr 
                      ? `☕ ${siteSettings?.recessLabel || 'الفسحة والاستراحة'} (${siteSettings?.recessStartTime || '09:10'} - ${siteSettings?.recessEndTime || '09:30'})` 
                      : `Break (${siteSettings?.recessStartTime || '09:10'} - ${siteSettings?.recessEndTime || '09:30'})`}
                  </th>
                  <th className="p-3 text-center">{isAr ? 'الحصة 3 (09:30 - 10:20)' : 'Period 3 (09:30 - 10:20)'}</th>
                  <th className="p-3 text-center">{isAr ? 'الحصة 4 (10:20 - 11:10)' : 'Period 4 (10:20 - 11:10)'}</th>
                  <th className="p-3 text-center">{isAr ? 'الحصة 5 (11:10 - 12:00)' : 'Period 5 (11:10 - 12:00)'}</th>
                </tr>
              </thead>
              <tbody className="text-xs font-bold divide-y divide-slate-100 dark:divide-[#334155]">
                {['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'].map((dayName) => {
                  if (slotFilterDay !== 'all' && slotFilterDay !== dayName) return null;
                  
                  return (
                    <tr key={dayName} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-extrabold text-purple-700 dark:text-purple-400 bg-purple-50/40 dark:bg-purple-950/30 rounded-r-xl border-l border-slate-100 dark:border-[#334155]">
                        {dayName}
                      </td>

                      {/* Period 1 & Period 2 */}
                      {[1, 2].map((periodNum) => {
                        const slotsInPeriod = filteredTimetableSlots.filter(
                          (s) => s.day === dayName && Number(s.period) === periodNum
                        );

                        return (
                          <td key={periodNum} className="p-2 text-center align-top border-x border-slate-100 dark:border-[#334155]">
                            {slotsInPeriod.length === 0 ? (
                              <span className="text-[10px] text-slate-300 dark:text-slate-600 font-normal block py-2">{isAr ? 'فارغ' : 'Empty'}</span>
                            ) : (
                              <div className="space-y-1.5">
                                {slotsInPeriod.map((slot) => {
                                  const isCurrentTeacherSlot = currentRole === 'teacher' && (currentUser?.name === slot.teacherName || currentUser?.id === slot.teacherId);

                                  return (
                                    <div
                                      key={slot.id}
                                      className={`p-2.5 rounded-xl border text-right space-y-1 relative group transition-all ${
                                        isCurrentTeacherSlot
                                          ? 'bg-purple-100 dark:bg-purple-950 border-purple-500 text-purple-950 dark:text-purple-200 shadow-md ring-2 ring-purple-400'
                                          : 'bg-[#F8FAFC] dark:bg-[#1E293B] border-slate-200 dark:border-[#334155] text-slate-800 dark:text-slate-200'
                                      }`}
                                    >
                                      {/* Subject first in bold */}
                                      <div className="flex items-center justify-between gap-1 border-b border-slate-100 dark:border-[#334155] pb-1">
                                        <span className="font-extrabold text-[11px] text-[#0284C7] dark:text-sky-400 block">
                                          📚 {slot.subject}
                                        </span>
                                        {currentRole === 'admin' && (
                                          <button
                                            type="button"
                                            onClick={() => deleteTimetableSlot(slot.id)}
                                            className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                                            title="حذف الحصة"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>

                                      {/* Teacher name */}
                                      <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                        👨‍🏫 {slot.teacherName}
                                      </div>

                                      {/* Grade & Section */}
                                      <div className="flex items-center justify-between text-[10px] text-emerald-700 dark:text-emerald-400 font-extrabold pt-0.5">
                                        <span>🏫 {slot.grade} ({slot.section})</span>
                                        {isCurrentTeacherSlot && (
                                          <span className="bg-purple-700 text-white px-1.5 py-0.5 rounded-full text-[9px]">حصتك ✨</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                        );
                      })}

                      {/* ☕ Recess / Break Column */}
                      <td className="p-2 text-center align-middle bg-amber-500/5 dark:bg-amber-500/10 border-x border-slate-100 dark:border-[#334155]">
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-950/60 px-2 py-1 rounded-lg border border-amber-300/40 inline-block shadow-xs">
                          ☕ {siteSettings?.recessLabel || 'استراحة ووجبة فطور'}
                        </span>
                      </td>

                      {/* Period 3, Period 4 & Period 5 */}
                      {[3, 4, 5].map((periodNum) => {
                        const slotsInPeriod = filteredTimetableSlots.filter(
                          (s) => s.day === dayName && Number(s.period) === periodNum
                        );

                        return (
                          <td key={periodNum} className="p-2 text-center align-top border-x border-slate-100 dark:border-[#334155]">
                            {slotsInPeriod.length === 0 ? (
                              <span className="text-[10px] text-slate-300 dark:text-slate-600 font-normal block py-2">{isAr ? 'فارغ' : 'Empty'}</span>
                            ) : (
                              <div className="space-y-1.5">
                                {slotsInPeriod.map((slot) => {
                                  const isCurrentTeacherSlot = currentRole === 'teacher' && (currentUser?.name === slot.teacherName || currentUser?.id === slot.teacherId);

                                  return (
                                    <div
                                      key={slot.id}
                                      className={`p-2.5 rounded-xl border text-right space-y-1 relative group transition-all ${
                                        isCurrentTeacherSlot
                                          ? 'bg-purple-100 dark:bg-purple-950 border-purple-500 text-purple-950 dark:text-purple-200 shadow-md ring-2 ring-purple-400'
                                          : 'bg-[#F8FAFC] dark:bg-[#1E293B] border-slate-200 dark:border-[#334155] text-slate-800 dark:text-slate-200'
                                      }`}
                                    >
                                      {/* Subject first in bold */}
                                      <div className="flex items-center justify-between gap-1 border-b border-slate-100 dark:border-[#334155] pb-1">
                                        <span className="font-extrabold text-[11px] text-[#0284C7] dark:text-sky-400 block">
                                          📚 {slot.subject}
                                        </span>
                                        {currentRole === 'admin' && (
                                          <button
                                            type="button"
                                            onClick={() => deleteTimetableSlot(slot.id)}
                                            className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                                            title="حذف الحصة"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>

                                      {/* Teacher name */}
                                      <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                        👨‍🏫 {slot.teacherName}
                                      </div>

                                      {/* Grade & Section */}
                                      <div className="flex items-center justify-between text-[10px] text-emerald-700 dark:text-emerald-400 font-extrabold pt-0.5">
                                        <span>🏫 {slot.grade} ({slot.section})</span>
                                        {isCurrentTeacherSlot && (
                                          <span className="bg-purple-700 text-white px-1.5 py-0.5 rounded-full text-[9px]">حصتك ✨</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── View Enrolled Students Modal (Portal to document.body) ────────────────── */}
      {showStudentsModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto print-container">
          <div className="printable-modal bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-3xl w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative my-auto max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#0284C7]/10 text-[#0284C7] rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0284C7]">
                    {showStudentsModal.title}
                  </h3>
                  <span className="text-xs text-slate-500 font-semibold block">
                    عدد التلاميذ المقيدين: <span className="font-bold text-[#0F172A]">{getModalStudents().length} طالب</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="no-print bg-[#0284C7] hover:bg-[#0369A1] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة الكشف 🖨️</span>
                </button>

                <button
                  onClick={() => {
                    setShowStudentsModal(null);
                    setModalSearchTerm('');
                  }}
                  className="no-print w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Search Bar inside Modal */}
            <div className="no-print flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded-2xl shrink-0">
              <Search className="w-4 h-4 text-slate-400 shrink-0 ms-1" />
              <input
                type="text"
                value={modalSearchTerm}
                onChange={(e) => setModalSearchTerm(e.target.value)}
                placeholder="ابحث عن اسم طالب أو ررمز القيد..."
                className="w-full bg-transparent text-xs text-[#0F172A] focus:outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Students List Grid */}
            <div className="overflow-y-auto flex-1 space-y-3 pe-1">
              {getModalStudents().length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Users className="w-10 h-10 mx-auto opacity-30" />
                  <p className="text-xs font-bold">لا يوجد طلاب مقيدون في هذا الصف / الشعبة حالياً.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {getModalStudents().map((stu) => {
                    const remainingUSD = (stu.tuitionTotal || 1600) - (stu.tuitionPaid || 0);

                    return (
                      <div
                        key={stu.id}
                        className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-2xl flex items-center justify-between gap-3 hover:border-[#0284C7]/40 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={stu.avatar}
                            alt={stu.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-[#0284C7] shrink-0"
                          />
                          <div>
                            <h4 className="text-xs font-extrabold text-[#0F172A]">
                              {isAr ? stu.name : stu.nameEn}
                            </h4>
                            <span className="text-[10px] font-mono text-[#0284C7] font-bold block">
                              ID: {stu.id} | {stu.classroom || 'الشعبة (أ)'}
                            </span>
                            {stu.parentPhone && (
                              <span className="text-[10px] text-slate-400 font-mono block">
                                📞 {stu.parentPhone}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right rtl:text-right ltr:text-left shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold inline-block ${
                              remainingUSD <= 0
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                                : 'bg-red-50 text-red-700 border border-red-300'
                            }`}
                          >
                            {remainingUSD <= 0 ? (isAr ? '✅ مسدد' : 'Paid') : `$${remainingUSD} USD`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="no-print flex justify-end pt-3 border-t border-slate-100 shrink-0">
              <button
                onClick={() => {
                  setShowStudentsModal(null);
                  setModalSearchTerm('');
                }}
                className="btn-mustard px-5 py-2 rounded-xl text-xs font-bold shadow cursor-pointer"
              >
                إغلاق القائمة ✖
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Add Grade Modal - Teleported to document.body */}
      {showAddGradeModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <form
            onSubmit={handleAddGradeSubmit}
            className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#0284C7]" />
                <span>{isAr ? 'إضافة صف دراسي جديد' : 'Add New Grade'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddGradeModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{isAr ? 'اسم الصف الدراسي (عربي)' : 'Grade Name (Arabic)'} <span className="text-red-500">*</span></label>
              <input type="text" required value={gradeName} onChange={(e) => setGradeName(e.target.value)} placeholder="الصف الخامس الابتدائي..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{isAr ? 'Grade Name (English)' : 'Grade Name (English)'}</label>
              <input type="text" value={gradeNameEn} onChange={(e) => setGradeNameEn(e.target.value)} placeholder="Grade 5 Elementary..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'المرحلة التعليمية' : 'Educational Stage'}</label>
                <select value={gradeStage} onChange={(e) => setGradeStage(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none">
                  <option value="التعليم الأساسي">التعليم الأساسي (Primary)</option>
                  <option value="التعليم المتوسط">التعليم المتوسط (Middle)</option>
                  <option value="التعليم الثانوي">التعليم الثانوي (High School)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'القسط السنوي ($ USD)' : 'Tuition Fee ($ USD)'}</label>
                <input type="number" value={gradeTuition} onChange={(e) => setGradeTuition(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">{isAr ? 'لون كرت الصف:' : 'Grade Theme Color:'}</label>
              <div className="flex items-center gap-2">
                {presetColors.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => setGradeColor(col.hex)}
                    className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                      gradeColor === col.hex ? 'border-slate-800 scale-110 shadow' : 'border-transparent opacity-80'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.label}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setShowAddGradeModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">{t('cancel')}</button>
              <button type="submit" className="px-5 py-2 btn-mustard rounded-xl text-xs font-bold shadow cursor-pointer">{t('save')}</button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Add Classroom Section Modal - Teleported to document.body */}
      {showAddClassroomModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <form
            onSubmit={handleAddClassroomSubmit}
            className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <DoorOpen className="w-5 h-5 text-[#0284C7]" />
                <span>{isAr ? 'إضافة شعبة / قاعة دراسية جديدة' : 'Add Section Classroom'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddClassroomModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{isAr ? 'الصف التابع له' : 'Parent Grade'} <span className="text-red-500">*</span></label>
              <select value={selectedGradeId} onChange={(e) => setSelectedGradeId(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer">
                {safeGrades.map((g) => (
                  <option key={g.id} value={g.id}>{isAr ? g.name : g.nameEn}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'اسم الشعبة' : 'Section Name'}</label>
                <input type="text" required value={sectionName} onChange={(e) => setSectionName(e.target.value)} placeholder="الشعبة (أ)..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'رقم القاعة' : 'Room Number'}</label>
                <input type="text" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="101" className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'السعة القصوى (طالب)' : 'Max Student Capacity'}</label>
                <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'المعلم المشرف' : 'Class Supervisor'}</label>
                <input type="text" value={supervisor} onChange={(e) => setSupervisor(e.target.value)} placeholder="أ. طارق خوري..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setShowAddClassroomModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">{t('cancel')}</button>
              <button type="submit" className="px-5 py-2 btn-mustard rounded-xl text-xs font-bold shadow cursor-pointer">{t('save')}</button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Modal: Admin Add Timetable Slot Modal */}
      {showAddSlotModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <form
            onSubmit={handleAddSlotSubmit}
            className="bg-white border-2 border-purple-600 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-purple-700 flex items-center gap-2">
                <span>⏱️</span>
                <span>{isAr ? 'تعيين وإضافة حصة جديدة لمدرس' : 'Assign New Class Slot'}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddSlotModal(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Select Teacher */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{isAr ? 'المعلم المعني بالحصة' : 'Select Teacher'} <span className="text-red-500">*</span></label>
              <select
                value={slotTeacherId}
                onChange={(e) => setSlotTeacherId(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-purple-600"
              >
                {safeTeachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} - ({t.subject || 'معلم'})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Subject */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{isAr ? 'المادة المعتمدة' : 'Select Subject'}</label>
              <select
                value={slotSubject}
                onChange={(e) => setSlotSubject(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-purple-600"
              >
                {safeSubjects.map((sub) => (
                  <option key={sub.id} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade & Section */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'الصف الدراسي' : 'Grade'}</label>
                <select
                  value={slotGrade}
                  onChange={(e) => setSlotGrade(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                >
                  {safeGrades.map((g) => (
                    <option key={g.id} value={g.name}>{isAr ? g.name : g.nameEn}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'الشعبة' : 'Section'}</label>
                <select
                  value={slotSection}
                  onChange={(e) => setSlotSection(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                >
                  <option value="أ">الشعبة (أ)</option>
                  <option value="ب">الشعبة (ب)</option>
                  <option value="ج">الشعبة (ج)</option>
                </select>
              </div>
            </div>

            {/* Day & Period */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'اليوم' : 'Day'}</label>
                <select
                  value={slotDay}
                  onChange={(e) => setSlotDay(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                >
                  <option value="الإثنين">الإثنين</option>
                  <option value="الثلاثاء">الثلاثاء</option>
                  <option value="الأربعاء">الأربعاء</option>
                  <option value="الخميس">الخميس</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'رقم الحصة' : 'Period'}</label>
                <select
                  value={slotPeriod}
                  onChange={(e) => {
                    const p = Number(e.target.value);
                    setSlotPeriod(p);
                    if (p === 1) setSlotPeriodTime('07:30 - 08:20');
                    if (p === 2) setSlotPeriodTime('08:20 - 09:10');
                    if (p === 3) setSlotPeriodTime('09:30 - 10:20');
                    if (p === 4) setSlotPeriodTime('10:20 - 11:10');
                    if (p === 5) setSlotPeriodTime('11:10 - 12:00');
                  }}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                >
                  <option value={1}>الحصة 1</option>
                  <option value={2}>الحصة 2</option>
                  <option value={3}>الحصة 3</option>
                  <option value={4}>الحصة 4</option>
                  <option value={5}>الحصة 5</option>
                </select>
              </div>
            </div>

            {/* Manual Period Time Range Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{isAr ? 'توقيت الحصة (يدوياً)' : 'Lesson Time (Manual)'}</label>
              <input
                type="text"
                required
                value={slotPeriodTime}
                onChange={(e) => setSlotPeriodTime(e.target.value)}
                placeholder="مثال: 07:30 - 08:20..."
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-purple-600 text-right"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setShowAddSlotModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">{t('cancel')}</button>
              <button type="submit" className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer">
                <CheckCircle2 className="w-4 h-4" /> {isAr ? 'حفظ وتثبيت الحصة 🌟' : 'Save Slot'}
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

    </div>
  );
};
