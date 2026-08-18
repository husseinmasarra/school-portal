import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  UserCheck, 
  UserX, 
  Clock, 
  FileText, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Search,
  Users,
  Award,
  Sparkles
} from 'lucide-react';

export const AttendanceModule = () => {
  const { 
    lang, 
    t, 
    currentRole, 
    currentUser,
    students = [], 
    teachers = [], 
    grades = [], 
    classrooms = [],
    attendance = [],
    addAttendanceRecord,
    deleteAttendanceRecord,
    addNotification
  } = useApp();

  const isAr = lang === 'ar';
  const safeStudents = students || [];
  const safeTeachers = teachers || [];
  const safeGrades = grades || [];

  // For Student or Parent: Show ONLY their own attendance history
  if (currentRole === 'student' || currentRole === 'parent') {
    const studentUser = safeStudents.find(s => s.id === currentUser?.id || s.name === currentUser?.name) || safeStudents[0] || { id: 'STU-101', name: currentUser?.name || 'طالب متميز' };
    const myRecords = attendance.filter(a => a.studentId === studentUser.id);
    const presentDays = myRecords.filter(r => r.status === 'حاضر').length;
    const absentDays = myRecords.filter(r => r.status === 'غائب' || r.status === 'بعذر').length;
    const lateDays = myRecords.filter(r => r.status === 'متأخر').length;
    
    return (
      <div className="space-y-6 animate-fade-in text-[#0F172A]">
        {/* Header */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0284C7]">سجل حضور وغياب الطالب</h2>
              <p className="text-xs text-slate-500 mt-1">
                {isAr ? `التقرير التفصيلي لحضور وغياب التلميذ: ${studentUser.name}` : `Attendance records for: ${studentUser.name}`}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center">
            <span className="text-xs text-emerald-800 font-bold block">أيام الحضور</span>
            <span className="text-xl font-black text-emerald-700">{presentDays} {isAr ? 'يوم' : 'Days'}</span>
          </div>
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-center">
            <span className="text-xs text-red-800 font-bold block">أيام الغياب</span>
            <span className="text-xl font-black text-red-700">{absentDays} {isAr ? 'يوم' : 'Days'}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-center">
            <span className="text-xs text-amber-800 font-bold block">أيام التأخر</span>
            <span className="text-xl font-black text-amber-700">{lateDays} {isAr ? 'يوم' : 'Days'}</span>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#0F172A]">جدول التواريخ والتفاصيل</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] text-[#0284C7] border-b border-[#E2E8F0] font-bold">
                  <th className="p-3 text-right">التاريخ</th>
                  <th className="p-3">حالة الحضور</th>
                  <th className="p-3 text-left">ملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {myRecords.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-6 text-slate-400 font-bold">لم يتم تسجيل أي غيابات أو تأخيرات في السجل بعد. حضور كامل! 🟢</td>
                  </tr>
                ) : (
                  myRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50">
                      <td className="p-3 text-right font-mono">{rec.date}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.status === 'حاضر' ? 'bg-emerald-100 text-emerald-800' :
                          rec.status === 'غائب' ? 'bg-red-100 text-red-800' :
                          rec.status === 'متأخر' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="p-3 text-left text-slate-500 font-bold">{rec.notes || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  const [activeSubTab, setActiveSubTab] = useState('students'); // 'students', 'staff', 'reports'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGrade, setSelectedGrade] = useState(safeGrades[0]?.name || 'الصف السادس الابتدائي');
  const [selectedSection, setSelectedSection] = useState('أ');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Filtered Students for the selected Grade & Section
  const filteredStudents = safeStudents.filter((s) => {
    const matchGrade = !selectedGrade || s.grade === selectedGrade || (s.grade && s.grade.includes(selectedGrade));
    const matchSearch = !searchTerm || s.name.includes(searchTerm) || (s.nameEn && s.nameEn.toLowerCase().includes(searchTerm.toLowerCase())) || s.id.includes(searchTerm);
    return matchGrade && matchSearch;
  });

  const getStudentStatusForDate = (studentId, dateStr) => {
    const rec = attendance.find(a => a.studentId === studentId && a.date === dateStr);
    return rec ? rec.status : 'حاضر'; // default Present
  };

  const handleMarkStatus = (student, status, notes = '') => {
    addAttendanceRecord({
      date: selectedDate,
      studentId: student.id,
      studentName: student.name,
      grade: student.grade || selectedGrade,
      section: student.classroom || selectedSection,
      status,
      notes
    });

    if (status === 'غائب') {
      addNotification({
        title: `تنبيه غياب طالب: ${student.name}`,
        message: `تم تسجيل غياب التلميذ ${student.name} بتاريخ ${selectedDate}.`,
        type: 'attendance'
      });
    }

    setToastMsg(isAr ? `تم تحديث حالة (${student.name}) إلى: ${status} 🟢` : `Updated status to: ${status}`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleMarkAllPresent = () => {
    filteredStudents.forEach(stu => {
      addAttendanceRecord({
        date: selectedDate,
        studentId: stu.id,
        studentName: stu.name,
        grade: stu.grade || selectedGrade,
        section: stu.classroom || selectedSection,
        status: 'حاضر',
        notes: 'حضور منتظم'
      });
    });
    setToastMsg(isAr ? 'تم تسجيل جميع طلاب الشعبة كـ (حاضر) بنجاح 🟢' : 'All students marked present!');
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Stats calculation
  const totalRecordsToday = attendance.filter(a => a.date === selectedDate);
  const presentCount = totalRecordsToday.filter(a => a.status === 'حاضر').length;
  const absentCount = totalRecordsToday.filter(a => a.status === 'غائب').length;
  const lateCount = totalRecordsToday.filter(a => a.status === 'متأخر').length;
  const excusedCount = totalRecordsToday.filter(a => a.status === 'بعذر').length;
  const attendanceRate = filteredStudents.length > 0 ? Math.round((presentCount / Math.max(1, filteredStudents.length)) * 100) : 100;

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#0284C7] text-white text-xs font-extrabold px-6 py-3 rounded-2xl shadow-2xl z-[99999] animate-bounce flex items-center gap-2 border border-sky-300">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Module Header Banner */}
      <div className="bg-gradient-to-r from-[#0284C7] via-sky-700 to-[#0369A1] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 relative z-10">
          <h2 className="text-xl font-black flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-amber-300" />
            <span>{isAr ? 'سجل الحضور والغياب اليومي للطلاب والأساتذة' : 'Daily Attendance & Absence Registry'}</span>
          </h2>
          <p className="text-xs text-sky-100 font-medium">
            {isAr ? 'منظومة رصد الحضور والتأخير اليومية المباشرة مع التنبيهات وإحصائيات الالتزام' : 'Real-time attendance tracking with instant notification and monthly analytics'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 relative z-10 shrink-0">
          <button
            onClick={() => setActiveSubTab('students')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'students' ? 'bg-white text-[#0284C7] shadow-md font-extrabold' : 'text-white hover:bg-white/10'
            }`}
          >
            👥 حضور الطلاب
          </button>
          <button
            onClick={() => setActiveSubTab('staff')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'staff' ? 'bg-white text-[#0284C7] shadow-md font-extrabold' : 'text-white hover:bg-white/10'
            }`}
          >
            👨‍🏫 حضور الكادر
          </button>
          <button
            onClick={() => setActiveSubTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'reports' ? 'bg-white text-[#0284C7] shadow-md font-extrabold' : 'text-white hover:bg-white/10'
            }`}
          >
            📊 التقارير والتنبيهات
          </button>
        </div>
      </div>

      {/* SUBTAB 1: STUDENTS ATTENDANCE */}
      {activeSubTab === 'students' && (
        <div className="space-y-6">
          {/* Top Filter & Quick Action Bar */}
          <div className="bg-white border border-[#E2E8F0] p-4.5 rounded-3xl shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-600 block">تاريخ الكشف اليومي:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-600 block">الصف الدراسي:</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                >
                  {safeGrades.map((g) => (
                    <option key={g.id} value={g.name}>{isAr ? g.name : g.nameEn}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-600 block">البحث برقم/اسم الطالب:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث..."
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none pe-8"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleMarkAllPresent}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 px-3 text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تثبيت جميع الكشف (حاضر) 🟢</span>
                </button>
              </div>
            </div>

            {/* Overview Metric Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-emerald-800 block">الحاضرون اليوم</span>
                  <span className="text-base font-black text-emerald-700">{presentCount} طالب</span>
                </div>
                <UserCheck className="w-6 h-6 text-emerald-600 opacity-80" />
              </div>

              <div className="bg-red-50 border border-red-200 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-red-800 block">الغائبون</span>
                  <span className="text-base font-black text-red-700">{absentCount} طالب</span>
                </div>
                <UserX className="w-6 h-6 text-red-600 opacity-80" />
              </div>

              <div className="bg-sky-50 border border-sky-200 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-sky-800 block">نسبة الالتزام بالشعبة</span>
                  <span className="text-base font-black text-[#0284C7]">{attendanceRate}%</span>
                </div>
                <Sparkles className="w-6 h-6 text-[#0284C7] opacity-80" />
              </div>
            </div>
          </div>

          {/* Students List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudents.length === 0 ? (
              <div className="col-span-2 text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-2">
                <Users className="w-12 h-12 mx-auto opacity-30" />
                <p className="text-xs font-bold">لا يوجد طلاب مسجلين في هذا الصف حالياً.</p>
              </div>
            ) : (
              filteredStudents.map((stu) => {
                const currentStatus = getStudentStatusForDate(stu.id, selectedDate);

                return (
                  <div 
                    key={stu.id}
                    className="bg-white border border-[#E2E8F0] p-4.5 rounded-3xl shadow-sm hover:border-[#0284C7]/50 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={stu.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"} 
                          alt={stu.name} 
                          className="w-11 h-11 rounded-full object-cover border-2 border-[#0284C7]" 
                        />
                        <div>
                          <h4 className="text-xs font-extrabold text-[#0F172A]">{stu.name}</h4>
                          <span className="text-[10px] font-mono text-[#0284C7] font-bold block">ID: {stu.id} • {stu.grade}</span>
                        </div>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-[10px] font-black shadow-xs ${
                        currentStatus === 'حاضر' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        currentStatus === 'غائب' ? 'bg-red-100 text-red-800 border border-red-300' :
                        currentStatus === 'متأخر' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        'bg-purple-100 text-purple-800 border border-purple-300'
                      }`}>
                        {currentStatus === 'حاضر' && '🟢 حاضر'}
                        {currentStatus === 'غائب' && '🔴 غائب'}
                        {currentStatus === 'متأخر' && '🟡 متأخر'}
                        {currentStatus === 'بعذر' && '🟣 غياب بعذر'}
                      </span>
                    </div>

                    {/* Interactive Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleMarkStatus(stu, 'حاضر')}
                        className={`py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                          currentStatus === 'حاضر' ? 'bg-emerald-600 text-white shadow font-extrabold' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        حاضر 🟢
                      </button>
                      <button
                        onClick={() => handleMarkStatus(stu, 'غائب')}
                        className={`py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                          currentStatus === 'غائب' ? 'bg-red-600 text-white shadow font-extrabold' : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        غائب 🔴
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: STAFF ATTENDANCE */}
      {activeSubTab === 'staff' && (
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-[#0284C7] flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>كشف حضور وانصراف الأساتذة والكادر التعليمي بتاريخ ({selectedDate}):</span>
            </h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-1.5 text-xs font-bold"
            />
          </div>

          <div className="divide-y divide-slate-100">
            {safeTeachers.map((tcher) => (
              <div key={tcher.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={tcher.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"} alt={tcher.name} className="w-10 h-10 rounded-full object-cover border-2 border-[#0284C7]" />
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A]">{tcher.name}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">{tcher.subject || 'معلم مادة'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300">
                    🟢 حاضر في الموعد (07:25 AM)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: REPORTS & ALERTS */}
      {activeSubTab === 'reports' && (
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#0284C7] flex items-center gap-2 border-b border-slate-100 pb-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>تنبيهات الغياب المتكرر والتقرير الشهري:</span>
          </h3>

          <div className="space-y-3">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <h4 className="font-bold text-amber-900">تنبيه طالب تجاوز حد الغياب المسموح: كريم يوسف حداد</h4>
                  <span className="text-[11px] text-amber-700 block">عدد مرات الغياب هذا الشهر: 4 أيام (تم إرسال إشعار لولي الأمر)</span>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-amber-600 text-white font-bold text-[10px] rounded-xl shadow cursor-pointer">
                اتصال بولي الأمر 📞
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
