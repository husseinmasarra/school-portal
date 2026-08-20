import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp, defaultAvatars } from '../context/AppContext';
import { exportToExcelCSV } from '../utils/exportUtils';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  Eye, 
  Phone, 
  RefreshCw, 
  Camera, 
  CreditCard, 
  Send, 
  CheckCircle2, 
  UserCheck, 
  Edit3, 
  BookOpen, 
  DoorOpen,
  Printer,
  Bookmark
} from 'lucide-react';
import { SubjectBadge } from './SubjectBadge';

export const DirectoryModule = ({ initialSubTab = 'students' }) => {
  const { 
    lang, 
    t, 
    currentRole, 
    students, 
    teachers, 
    grades = [],
    classrooms = [],
    addStudent, 
    deleteStudent, 
    updateStudent,
    addTeacher, 
    deleteTeacher, 
    subjects = [],
    addAgendaItem 
  } = useApp();

  const isAr = lang === 'ar';
  const safeStudents = students || [];
  const safeTeachers = teachers || [];
  const safeGrades = grades || [];
  const safeClassrooms = classrooms || [];
  const safeSubjects = subjects || [];

  const [activeTab, setActiveTab] = useState(initialSubTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('all');

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Add Student Modal State
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [stuName, setStuName] = useState('');
  const [stuNameEn, setStuNameEn] = useState('');
  const [stuUsername, setStuUsername] = useState('');
  const [stuPassword, setStuPassword] = useState('123456');
  const [stuGrade, setStuGrade] = useState(() => safeGrades[0]?.name || 'الصف الخامس الابتدائي');
  const [stuGradeEn, setStuGradeEn] = useState(() => safeGrades[0]?.nameEn || 'Grade 5');
  const [stuClassRoom, setStuClassRoom] = useState(() => safeClassrooms[0]?.sectionName || 'أ');
  const [stuTuitionTotal, setStuTuitionTotal] = useState(() => (safeGrades[0]?.tuitionFee || 1500).toString());
  const [stuTuitionDiscount, setStuTuitionDiscount] = useState('0');
  const [stuAdminFees, setStuAdminFees] = useState('0');
  const [stuHasTransport, setStuHasTransport] = useState(false);
  const [stuTransportFee, setStuTransportFee] = useState('0');
  const [stuAvatar, setStuAvatar] = useState(defaultAvatars[0]);
  const [stuParentName, setStuParentName] = useState('');
  const [stuParentPhone, setStuParentPhone] = useState('');
  const [stuMotherPhone, setStuMotherPhone] = useState('');
  const [stuMinistryClearance, setStuMinistryClearance] = useState('');
  const [studentToPrint, setStudentToPrint] = useState(null);
  const [addAnotherSibling, setAddAnotherSibling] = useState(false);
  const [siblingsList, setSiblingsList] = useState([]);

  const addSiblingRow = () => {
    const nextRand = Math.floor(100 + Math.random() * 900);
    const suggestedUsername = stuName ? `${stuName.toLowerCase().replace(/\s+/g, '')}_sib${siblingsList.length + 1}.${nextRand}` : `student.${Date.now().toString().slice(-4)}`;
    setSiblingsList([...siblingsList, {
      id: Math.random().toString(),
      name: '',
      nameEn: '',
      grade: safeGrades[0]?.name || 'الصف الأول الابتدائي',
      gradeEn: safeGrades[0]?.nameEn || 'Grade 1',
      classRoom: 'أ',
      tuitionTotal: (safeGrades[0]?.tuitionFee || 1500).toString(),
      tuitionDiscount: '0',
      adminFees: '0',
      username: suggestedUsername,
      password: Math.floor(100000 + Math.random() * 900000).toString(),
      ministryClearance: ''
    }]);
  };

  const removeSiblingRow = (id) => {
    setSiblingsList(siblingsList.filter(s => s.id !== id));
  };

  const updateSiblingField = (index, field, val) => {
    const updated = [...siblingsList];
    updated[index][field] = val;
    if (field === 'grade') {
      const foundGrd = safeGrades.find(g => g.name === val);
      if (foundGrd) {
        updated[index].gradeEn = foundGrd.nameEn || val;
        updated[index].tuitionTotal = (foundGrd.tuitionFee || 1500).toString();
      }
    }
    setSiblingsList(updated);
  };

  // Edit Student Modal State
  const [showEditStudentModal, setShowEditStudentModal] = useState(null);
  const [editStuName, setEditStuName] = useState('');
  const [editStuNameEn, setEditStuNameEn] = useState('');
  const [editStuUsername, setEditStuUsername] = useState('');
  const [editStuPassword, setEditStuPassword] = useState('123456');
  const [editStuGrade, setEditStuGrade] = useState('');
  const [editStuGradeEn, setEditStuGradeEn] = useState('');
  const [editStuClassRoom, setEditStuClassRoom] = useState('أ');
  const [editStuTuitionTotal, setEditStuTuitionTotal] = useState('');
  const [editStuTuitionPaid, setEditStuTuitionPaid] = useState('');
  const [editStuTuitionDiscount, setEditStuTuitionDiscount] = useState('0');
  const [editStuAdminFees, setEditStuAdminFees] = useState('0');
  const [editStuHasTransport, setEditStuHasTransport] = useState(false);
  const [editStuTransportFee, setEditStuTransportFee] = useState('0');
  const [editStuParentName, setEditStuParentName] = useState('');
  const [editStuParentPhone, setEditStuParentPhone] = useState('');
  const [editStuMotherPhone, setEditStuMotherPhone] = useState('');
  const [editStuMinistryClearance, setEditStuMinistryClearance] = useState('');

  // Print Lists States
  const [isPrintingStudentsTable, setIsPrintingStudentsTable] = useState(false);
  const [isPrintingTeachersTable, setIsPrintingTeachersTable] = useState(false);

  // Add Teacher Modal State
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [tchName, setTchName] = useState('');
  const [tchNameEn, setTchNameEn] = useState('');
  const [tchUsername, setTchUsername] = useState('');
  const [tchPassword, setTchPassword] = useState('123456');
  const [tchSubjects, setTchSubjects] = useState(() => [safeSubjects[0]?.name || 'الرياضيات']);
  const [tchAssignedClasses, setTchAssignedClasses] = useState([]);
  const [tchSalary, setTchSalary] = useState('1200');
  const [tchAvatar, setTchAvatar] = useState(defaultAvatars[1]);

  // Edit Teacher Modal State
  const [showEditTeacherModal, setShowEditTeacherModal] = useState(null);

  // Teacher Send Lesson Modal State
  const [showSendLessonModal, setShowSendLessonModal] = useState(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonHomework, setLessonHomework] = useState('');
  const [lessonGrade, setLessonGrade] = useState(() => safeGrades[0]?.name || 'الصف السادس');
  const [lessonClass, setLessonClass] = useState('أ');

  // Student Details Modal State
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(null);

  // Success Toast State
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Student Photo File Upload
  const handleStudentAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setStuAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle Teacher Photo File Upload
  const handleTeacherAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTchAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Auto-Generate Random Password
  const handleRegenerateStuPassword = () => setStuPassword(Math.floor(100000 + Math.random() * 900000).toString());
  const handleRegenerateTchPassword = () => setTchPassword(Math.floor(100000 + Math.random() * 900000).toString());

  const handlePrintClearance = (student) => {
    setStudentToPrint(student);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintStudentsTable = () => {
    setIsPrintingStudentsTable(true);
    setTimeout(() => {
      window.print();
      setIsPrintingStudentsTable(false);
    }, 150);
  };

  const handlePrintTeachersTable = () => {
    setIsPrintingTeachersTable(true);
    setTimeout(() => {
      window.print();
      setIsPrintingTeachersTable(false);
    }, 150);
  };

  const handleOpenEditStudentModal = (student) => {
    setShowEditStudentModal(student);
    setEditStuName(student.name);
    setEditStuNameEn(student.nameEn || '');
    setEditStuUsername(student.username);
    setEditStuPassword(student.password);
    setEditStuGrade(student.grade);
    setEditStuGradeEn(student.gradeEn || '');
    setEditStuClassRoom(student.classRoom || 'أ');
    setEditStuTuitionTotal(student.tuitionTotal?.toString() || '0');
    setEditStuTuitionPaid(student.tuitionPaid?.toString() || '0');
    setEditStuTuitionDiscount(student.tuitionDiscount?.toString() || '0');
    setEditStuAdminFees(student.adminFees?.toString() || '0');
    setEditStuHasTransport(!!student.hasTransport);
    setEditStuTransportFee(student.transportFee?.toString() || '0');
    setEditStuParentName(student.parentName || '');
    setEditStuParentPhone(student.phone || student.parentPhone || '');
    setEditStuMotherPhone(student.motherPhone || '');
    setEditStuMinistryClearance(student.ministryClearance || '');
  };

  const handleEditStudentSubmit = (e) => {
    e.preventDefault();
    if (!editStuName || !editStuUsername) return;

    // Verify Ministry Clearance uniqueness (excluding current student)
    if (editStuMinistryClearance.trim()) {
      const isDuplicate = (students || []).some(
        s => s.id !== showEditStudentModal.id && s.ministryClearance && s.ministryClearance.trim() === editStuMinistryClearance.trim()
      );
      if (isDuplicate) {
        alert(isAr ? '❌ رقم الإفادة هذا مسجل بالفعل لطالب آخر!' : 'Ministry Clearance reference is already registered to another student!');
        return;
      }
    }

    updateStudent(showEditStudentModal.id, {
      name: editStuName,
      nameEn: editStuNameEn || editStuName,
      username: editStuUsername,
      password: editStuPassword,
      grade: editStuGrade,
      gradeEn: editStuGradeEn,
      classRoom: editStuClassRoom,
      tuitionTotal: Number(editStuTuitionTotal),
      tuitionPaid: Number(editStuTuitionPaid),
      tuitionDiscount: Number(editStuTuitionDiscount),
      adminFees: Number(editStuAdminFees || 0),
      hasTransport: editStuHasTransport,
      transportFee: Number(editStuTransportFee || 0),
      phone: editStuParentPhone,
      parentPhone: editStuParentPhone,
      motherPhone: editStuMotherPhone,
      parentName: editStuParentName,
      parentNameEn: editStuParentName,
      ministryClearance: editStuMinistryClearance.trim()
    });

    setShowEditStudentModal(null);
    setSuccessMsg(isAr ? 'تم تعديل ملف الطالب بنجاح!' : 'Student file updated successfully!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleAddStudentSubmit = (e) => {
    e.preventDefault();
    if (!stuName || !stuUsername) return;

    // 1. Verify primary student Ministry Clearance Number uniqueness
    if (stuMinistryClearance.trim()) {
      const isDuplicate = (students || []).some(
        s => s.ministryClearance && s.ministryClearance.trim() === stuMinistryClearance.trim()
      );
      if (isDuplicate) {
        alert(isAr ? '❌ رقم الإفادة للطالب الرئيسي مسجل بالفعل لطالب آخر!' : 'Primary student Ministry Clearance number is already assigned!');
        return;
      }
    }

    // 2. Verify primary student Username uniqueness
    const usernameDuplicate = (students || []).some(
      s => s.username && s.username.toLowerCase().trim() === stuUsername.toLowerCase().trim()
    );
    if (usernameDuplicate) {
      alert(isAr ? '❌ اسم المستخدم للطالب الرئيسي غير متاح!' : 'Primary student username is not available!');
      return;
    }

    // 3. Verify siblings validations
    for (let i = 0; i < siblingsList.length; i++) {
      const sib = siblingsList[i];
      if (!sib.name.trim()) {
        alert(isAr ? `❌ يرجى إدخال اسم الأخ/الأخت المضاف رقم ${i + 1}` : `Please enter name for sibling #${i + 1}`);
        return;
      }
      if (!sib.username.trim()) {
        alert(isAr ? `❌ يرجى إدخال اسم مستخدم للأخ/الأخت رقم ${i + 1}` : `Please enter username for sibling #${i + 1}`);
        return;
      }

      // Verify sibling username uniqueness
      const sibUsernameDuplicate = (students || []).some(
        s => s.username && s.username.toLowerCase().trim() === sib.username.toLowerCase().trim()
      ) || siblingsList.some((s, idx) => idx !== i && s.username.toLowerCase().trim() === sib.username.toLowerCase().trim()) || sib.username.toLowerCase().trim() === stuUsername.toLowerCase().trim();
      if (sibUsernameDuplicate) {
        alert(isAr ? `❌ اسم المستخدم للأخ/الأخت "${sib.name}" غير متاح أو مكرر!` : `Username for sibling "${sib.name}" is already taken or duplicate!`);
        return;
      }

      // Verify sibling ministry clearance uniqueness
      if (sib.ministryClearance.trim()) {
        const sibMCIsDuplicate = (students || []).some(
          s => s.ministryClearance && s.ministryClearance.trim() === sib.ministryClearance.trim()
        ) || siblingsList.some((s, idx) => idx !== i && s.ministryClearance && s.ministryClearance.trim() === sib.ministryClearance.trim()) || sib.ministryClearance.trim() === stuMinistryClearance.trim();
        if (sibMCIsDuplicate) {
          alert(isAr ? `❌ رقم الإفادة للأخ/الأخت "${sib.name}" مسجل بالفعل أو مكرر!` : `Ministry Clearance for sibling "${sib.name}" is duplicate!`);
          return;
        }
      }
    }

    // 4. Save primary student
    addStudent({
      name: stuName,
      nameEn: stuNameEn || stuName,
      username: stuUsername,
      password: stuPassword,
      grade: stuGrade || (safeGrades[0]?.name || 'الصف الأول الابتدائي'),
      gradeEn: stuGradeEn || (safeGrades[0]?.nameEn || 'Grade 1'),
      classRoom: stuClassRoom || 'أ',
      avatar: stuAvatar,
      tuitionTotal: Number(stuTuitionTotal),
      tuitionPaid: 0,
      tuitionDiscount: Number(stuTuitionDiscount),
      adminFees: Number(stuAdminFees || 0),
      hasTransport: stuHasTransport,
      transportFee: Number(stuTransportFee || 0),
      phone: stuParentPhone || '+961 03 123 456',
      parentPhone: stuParentPhone || '+961 03 123 456',
      motherPhone: stuMotherPhone,
      parentName: stuParentName || `والد الطالب ${stuName}`,
      parentNameEn: stuParentName || `Parent of ${stuNameEn || stuName}`,
      ministryClearance: stuMinistryClearance.trim(),
      frozen: false
    });

    // 5. Save all added siblings
    siblingsList.forEach(sib => {
      addStudent({
        name: sib.name,
        nameEn: sib.nameEn || sib.name,
        username: sib.username,
        password: sib.password,
        grade: sib.grade,
        gradeEn: sib.gradeEn,
        classRoom: sib.classRoom,
        avatar: stuAvatar,
        tuitionTotal: Number(sib.tuitionTotal),
        tuitionPaid: 0,
        tuitionDiscount: Number(sib.tuitionDiscount),
        adminFees: Number(sib.adminFees || 0),
        hasTransport: !!sib.hasTransport,
        transportFee: Number(sib.transportFee || 0),
        phone: stuParentPhone || '+961 03 123 456',
        parentPhone: stuParentPhone || '+961 03 123 456',
        motherPhone: stuMotherPhone,
        parentName: stuParentName || `والد الطالب ${stuName}`,
        parentNameEn: stuParentName || `Parent of ${stuNameEn || stuName}`,
        ministryClearance: sib.ministryClearance.trim(),
        frozen: false
      });
    });

    // 6. Reset Form
    setStuName('');
    setStuNameEn('');
    setStuUsername('');
    setStuParentName('');
    setStuParentPhone('');
    setStuMotherPhone('');
    setStuMinistryClearance('');
    setStuTuitionDiscount('0');
    setStuAdminFees('0');
    setStuHasTransport(false);
    setStuTransportFee('0');
    setSiblingsList([]);
    setShowAddStudentModal(false);
    setSuccessMsg(isAr ? 'تم إضافة الطالب وإخوته وتوثيق بيانات العائلة بنجاح!' : 'Students added successfully!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleAddTeacherSubmit = (e) => {
    e.preventDefault();
    if (!tchName || !tchUsername) return;

    const finalSubjects = tchSubjects.length > 0 ? tchSubjects : [safeSubjects[0]?.name || 'الرياضيات'];

    addTeacher({
      name: tchName,
      nameEn: tchNameEn || tchName,
      username: tchUsername,
      password: tchPassword,
      subject: finalSubjects[0],
      subjects: finalSubjects,
      assignedClassrooms: tchAssignedClasses,
      avatar: tchAvatar,
      monthlySalary: Number(tchSalary)
    });

    setTchName('');
    setTchNameEn('');
    setTchUsername('');
    setTchSubjects([safeSubjects[0]?.name || 'الرياضيات']);
    setTchAssignedClasses([]);
    setShowAddTeacherModal(false);
    setSuccessMsg(isAr ? 'تم إضافة المعلم وإسناد المواد والصفوف بنجاح!' : 'Teacher added successfully!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleEditTeacherSubmit = (e) => {
    e.preventDefault();
    if (!showEditTeacherModal) return;

    deleteTeacher(showEditTeacherModal.id);

    addTeacher({
      ...showEditTeacherModal,
      id: showEditTeacherModal.id
    });

    setShowEditTeacherModal(null);
    setSuccessMsg(isAr ? 'تم تحديث مواد وصفوف المعلم بنجاح!' : 'Teacher updated successfully!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSendLessonSubmit = (e) => {
    e.preventDefault();
    if (!showSendLessonModal || !lessonTitle) return;

    addAgendaItem({
      date: new Date().toISOString().split('T')[0],
      grade: lessonGrade,
      classRoom: lessonClass,
      subject: showSendLessonModal.subject || (showSendLessonModal.subjects?.[0] || 'المادة'),
      title: lessonTitle,
      titleEn: lessonTitle,
      homework: lessonHomework,
      homeworkEn: lessonHomework,
      dueDate: new Date().toISOString().split('T')[0]
    });

    setLessonTitle('');
    setLessonHomework('');
    setShowSendLessonModal(null);
    setSuccessMsg(isAr ? 'تم إرسال ونشر الدرس للطلاب بنجاح!' : 'Lesson sent successfully!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Toggle subject selection
  const toggleSubjectSelect = (subName, targetState, setTargetState) => {
    if (targetState.includes(subName)) {
      setTargetState(targetState.filter((s) => s !== subName));
    } else {
      setTargetState([...targetState, subName]);
    }
  };

  // Toggle class selection
  const toggleClassSelect = (classLabel, targetState, setTargetState) => {
    if (targetState.includes(classLabel)) {
      setTargetState(targetState.filter((c) => c !== classLabel));
    } else {
      setTargetState([...targetState, classLabel]);
    }
  };

  // Filter Logic
  const filteredStudents = safeStudents.filter((s) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(term) || 
                          (s.nameEn || '').toLowerCase().includes(term) ||
                          (s.username || '').toLowerCase().includes(term) ||
                          (s.parentName || '').toLowerCase().includes(term) ||
                          (s.parentPhone || '').includes(term) ||
                          (s.phone || '').includes(term) ||
                          (s.motherPhone || '').includes(term) ||
                          (s.ministryClearance || '').toLowerCase().includes(term);
    const matchesGrade = selectedGradeFilter === 'all' || s.grade.includes(selectedGradeFilter);
    return matchesSearch && matchesGrade;
  });

  const filteredTeachers = safeTeachers.filter((t) => {
    const teacherSubjectsStr = (t.subjects || [t.subject]).join(' ').toLowerCase();
    return t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           t.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
           teacherSubjectsStr.includes(searchTerm.toLowerCase());
  });

  const handleExportStudentsExcel = () => {
    const headers = ['المعرف', 'اسم الطالب', 'Name En', 'الصف', 'الشعبة', 'اسم ولي الأمر', 'هاتف ولي الأمر', 'الحساب المقبوض ($)', 'المتبقي ($)'];
    const rows = (safeStudents || []).map(s => [
      s.id, s.name, s.nameEn || '', s.grade, s.classRoom || '', s.parentName || '', s.parentPhone || '', s.tuitionPaid || 0, Math.max(0, (s.tuitionTotal || 1600) - (s.tuitionPaid || 0))
    ]);
    exportToExcelCSV(`kashf-tullab-${new Date().toISOString().slice(0,10)}.csv`, headers, rows);
  };

  const handleExportTeachersExcel = () => {
    const headers = ['المعرف', 'اسم المعلم', 'المادة الرئيسية', 'الراتب الشهري ($)', 'المكافأة المستحقة ($)', 'الهاتف'];
    const rows = (safeTeachers || []).map(t => [
      t.id, t.name, t.subject, t.monthlySalary || 1200, t.dueBonus || 0, t.phone || ''
    ]);
    exportToExcelCSV(`kashf-mudarisin-${new Date().toISOString().slice(0,10)}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">
      
      {/* Title Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm text-[#0F172A]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0284C7]">{isAr ? 'دليل المدرسة وسجل الحسابات' : 'School Directory & Accounts'}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {isAr 
                ? "سجل حسابات الطلاب المعلمين، إسناد أكثر من مادة وصف وشعبة لكل معلم."
                : "Manage students, teachers, assign multiple subjects & classrooms per teacher."}
            </p>
          </div>
        </div>

        {/* Admin Action Buttons */}
        {currentRole === 'admin' && (
          <div className="flex flex-wrap items-center gap-2">
            {activeTab === 'students' && (
              <>
                <button
                  onClick={handlePrintStudentsTable}
                  className="px-3.5 py-2.5 bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  title={isAr ? "طباعة كشف كافة الطلاب" : "Print Student Roster"}
                >
                  <Printer className="w-4 h-4" />
                  <span>{isAr ? "طباعة كشف الطلاب 🖨️" : "Print Roster"}</span>
                </button>

                <button
                  onClick={handleExportStudentsExcel}
                  className="px-3.5 py-2.5 bg-sky-50 text-[#0284C7] border border-sky-200 hover:bg-sky-100 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                  title="تصدير سجل كافة الطلاب لملف اكسل"
                >
                  <span>تصدير Excel 📊</span>
                </button>

                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="btn-mustard flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold shadow cursor-pointer transition-all hover:scale-105"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isAr ? "إضافة طالب جديد +" : "Add Student +"}</span>
                </button>
              </>
            )}

            {activeTab === 'teachers' && (
              <>
                <button
                  onClick={handlePrintTeachersTable}
                  className="px-3.5 py-2.5 bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  title={isAr ? "طباعة كشف كافة المعلمين" : "Print Teacher Roster"}
                >
                  <Printer className="w-4 h-4" />
                  <span>{isAr ? "طباعة كشف المعلمين 🖨️" : "Print Roster"}</span>
                </button>

                <button
                  onClick={handleExportTeachersExcel}
                  className="px-3.5 py-2.5 bg-sky-50 text-[#0284C7] border border-sky-200 hover:bg-sky-100 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                  title="تصدير سجل المعلمين لملف اكسل"
                >
                  <span>تصدير Excel 📊</span>
                </button>

                <button
                  onClick={() => setShowAddTeacherModal(true)}
                  className="btn-mustard flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold shadow cursor-pointer transition-all hover:scale-105"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isAr ? "إضافة معلم جديد +" : "Add Teacher +"}</span>
                </button>
              </>
            )}
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

      {/* Sub-Navigation Tabs & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-4 rounded-3xl shadow-sm text-[#0F172A]">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('students')}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'students' ? 'bg-[#0284C7] text-white shadow-md' : 'bg-[#F8FAFC] text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? `دليل الطلاب (${safeStudents.length})` : `Students (${safeStudents.length})`}
          </button>

          <button
            onClick={() => setActiveTab('teachers')}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'teachers' ? 'bg-[#0284C7] text-white shadow-md' : 'bg-[#F8FAFC] text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? `كادر المعلمين (${safeTeachers.length})` : `Teachers (${safeTeachers.length})`}
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute top-3 right-3 rtl:right-3 ltr:left-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isAr ? 'بحث باسم المستخدم أو المادة...' : 'Search directory...'}
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-2xl px-9 py-2 text-xs focus:outline-none focus:border-[#0284C7]"
          />
        </div>
      </div>

      {/* STUDENTS ROSTER - GROUPED BY GRADE CARDS */}
      {activeTab === 'students' && (() => {
        // Group filtered students by grade
        const studentsByGrade = filteredStudents.reduce((acc, stu) => {
          const g = stu.grade || (isAr ? 'الصف الأول الابتدائي' : 'Grade 1');
          if (!acc[g]) acc[g] = [];
          acc[g].push(stu);
          return acc;
        }, {});

        const gradeKeys = Object.keys(studentsByGrade);

        if (gradeKeys.length === 0) {
          return (
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-10 text-center text-slate-400 space-y-2">
              <Users className="w-12 h-12 mx-auto opacity-30 text-[#0284C7]" />
              <p className="text-sm font-bold">{isAr ? 'لا يوجد طلاب مطابقون لخيارات البحث حالياً.' : 'No students found matching filters.'}</p>
            </div>
          );
        }

        return (
          <div className="space-y-8">
            {gradeKeys.map((gradeName) => {
              const gradeStudents = studentsByGrade[gradeName];
              return (
                <div key={gradeName} className="space-y-4">
                  {/* Grade Divider Title */}
                  <div className="flex items-center gap-3 border-b border-[#0284C7]/20 pb-2">
                    <span className="w-2.5 h-6 bg-[#0284C7] rounded-full block" />
                    <h3 className="text-sm font-extrabold text-[#0284C7] flex items-center gap-2">
                      <span>{gradeName}</span>
                      <span className="bg-sky-50 text-[#0284C7] text-[10px] px-2 py-0.5 rounded-full font-black border border-sky-200">
                        {gradeStudents.length} {isAr ? 'تلميذ' : 'Students'}
                      </span>
                    </h3>
                  </div>

                  {/* Student Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gradeStudents.map((stu) => {
                      const transportUSD = stu.hasTransport ? (Number(stu.transportFee) || 0) : 0;
                      const totalUSD    = (Number(stu.tuitionTotal) || 600) + transportUSD;
                      const discountUSD = Number(stu.tuitionDiscount) || 0;
                      const paidUSD     = Number(stu.tuitionPaid) || 0;
                      const remUSD      = Math.max(0, totalUSD - discountUSD - paidUSD);

                      // Find ALL siblings (even if they are in different grades!)
                      const siblings = safeStudents.filter(s => s.id !== stu.id && s.parentPhone && s.parentPhone.trim() === stu.parentPhone.trim());

                      return (
                        <div 
                          key={stu.id} 
                          className={`bg-white border p-4.5 rounded-3xl shadow-xs transition-all relative space-y-3.5 hover:shadow-md hover:border-[#0284C7]/50 ${
                            stu.frozen ? 'border-red-300 bg-red-50/20' : 'border-[#E2E8F0]'
                          }`}
                        >
                          {/* Student Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <img 
                                src={stu.avatar || defaultAvatars[0]} 
                                alt={stu.name} 
                                className={`w-11 h-11 rounded-full object-cover shrink-0 border-2 ${
                                  stu.frozen ? 'border-red-500' : 'border-[#0284C7]'
                                }`} 
                              />
                              <div className="truncate">
                                <h4 className="text-xs font-black text-[#0F172A] truncate flex items-center gap-1.5">
                                  <span>{isAr ? stu.name : stu.nameEn}</span>
                                  {stu.frozen && (
                                    <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded font-black shrink-0">
                                      {isAr ? '❄️ مجمد' : 'Frozen'}
                                    </span>
                                  )}
                                </h4>
                                <span className="text-[10px] text-slate-500 font-mono block pt-0.5">
                                  ID: {stu.id} | الشعبة ({stu.classRoom || 'أ'})
                                </span>
                              </div>
                            </div>
                            
                            {/* Actions Toolbar */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => setShowStudentDetailModal(stu)}
                                className="p-1.5 bg-sky-50 hover:bg-sky-100 text-[#0284C7] rounded-xl cursor-pointer transition-colors"
                                title="عرض التفاصيل الحسابية"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {currentRole === 'admin' && (
                                <>
                                  <button
                                    onClick={() => handleOpenEditStudentModal(stu)}
                                    className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl cursor-pointer transition-colors"
                                    title={isAr ? "تعديل ملف الطالب" : "Edit Student"}
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => deleteStudent(stu.id)}
                                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl cursor-pointer transition-colors"
                                    title={t('delete')}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Credentials & Contact Details */}
                          <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-2xl text-[11px] space-y-1 border border-slate-100 dark:border-slate-800 font-mono">
                            <div className="flex justify-between">
                              <span className="text-slate-500 dark:text-slate-400 font-sans">🔑 اسم الدخول:</span>
                              <span className="font-bold text-[#0284C7] dark:text-sky-400">{stu.username}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 dark:text-slate-400 font-sans">🔒 كلمة المرور:</span>
                              <span className="font-bold text-red-600 dark:text-red-400 font-extrabold">{stu.password}</span>
                            </div>
                            {stu.parentPhone && (
                              <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400 font-sans">📞 هاتف الأب:</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{stu.parentPhone}</span>
                              </div>
                            )}
                            {stu.motherPhone && (
                              <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400 font-sans">👩 هاتف الأم:</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{stu.motherPhone}</span>
                              </div>
                            )}
                            {stu.ministryClearance && (
                              <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400 font-sans">🔖 إفادة الوزارة:</span>
                                <span className="font-extrabold text-amber-600 dark:text-amber-400">{stu.ministryClearance}</span>
                              </div>
                            )}
                          </div>

                          {/* Tuition Snapshot */}
                          <div className="text-[10px] grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl text-center border border-slate-100 dark:border-slate-800">
                            <div>
                              <span className="text-slate-500 dark:text-slate-400 block">القسط</span>
                              <span className="font-bold block text-slate-700 dark:text-slate-300 font-mono">${totalUSD}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400 block">الخصم</span>
                              <span className="font-bold block text-emerald-600 dark:text-emerald-400 font-mono">-${discountUSD}</span>
                            </div>
                            <div>
                              <span className="text-red-500 dark:text-red-400 block">المتبقي</span>
                              <span className="font-black block text-red-600 dark:text-red-400 font-mono">${remUSD}</span>
                            </div>
                          </div>

                          {/* Siblings Badge */}
                          {siblings.length > 0 && (
                            <div className="bg-sky-50/50 dark:bg-slate-900/60 p-2 rounded-2xl border border-sky-100 dark:border-slate-800 text-[11px] flex items-center justify-between">
                              <span className="text-slate-500 dark:text-slate-400 font-sans text-[10px]">👥 الأخ/الأخت بالمنظومة:</span>
                              <span className="font-extrabold text-[#0284C7] dark:text-sky-400 text-[10px]">
                                {siblings.map(s => s.name).join(' ، ')}
                              </span>
                            </div>
                          )}

                          {/* Freeze Account Toggle (Admin Only) */}
                          {currentRole === 'admin' && (
                            <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all w-full justify-center">
                                <input 
                                  type="checkbox" 
                                  checked={!!stu.frozen} 
                                  onChange={() => updateStudent(stu.id, { frozen: !stu.frozen })}
                                  className="w-3.5 h-3.5 accent-red-600 rounded cursor-pointer shrink-0"
                                />
                                <span className={stu.frozen ? "text-red-600 dark:text-red-400 font-black" : "text-slate-600 dark:text-slate-300 font-bold"}>
                                  {stu.frozen ? '❄️ حساب مجمد (إلغاء التجميد)' : 'تجميد حساب الطالب'}
                                </span>
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* TEACHERS TABLE ROSTER */}
      {activeTab === 'teachers' && (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-[#F8FAFC]">
                  <th className="p-3 font-semibold">{t('teacherName')}</th>
                  <th className="p-3 font-semibold">🔑 {t('username')}</th>
                  <th className="p-3 font-semibold">📚 {isAr ? 'المواد التي يدرسها' : 'Assigned Subjects'}</th>
                  <th className="p-3 font-semibold">🏫 {isAr ? 'الصفوف والشُعب الموكلة' : 'Assigned Classrooms'}</th>
                  <th className="p-3 font-semibold">{t('monthlySalary')} ($ USD)</th>
                  <th className="p-3 font-semibold text-center">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#0F172A]">
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-xs text-slate-400">
                      {isAr ? 'لا يوجد معلمون مضافون حالياً. اضغط على "+ إضافة معلم جديد" للبدء!' : 'No teachers found.'}
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((tch) => {
                    const teacherSubjectsList = tch.subjects || [tch.subject];
                    const teacherClassesList = tch.assignedClassrooms || [];

                    return (
                      <tr key={tch.id} className="hover:bg-[#F8FAFC] transition-all">
                        <td className="p-3 font-bold flex items-center gap-2">
                          <img
                            src={tch.avatar}
                            alt={tch.name}
                            className="w-9 h-9 rounded-full object-cover border border-[#0284C7]"
                          />
                          <div>
                            <div>{isAr ? tch.name : tch.nameEn}</div>
                            <div className="text-[10px] text-slate-400 font-mono">ID: {tch.id}</div>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-[#0284C7] font-bold">
                          <div>{tch.username}</div>
                          <div className="text-[10px] text-red-600 font-extrabold">{tch.password}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {teacherSubjectsList.map((subName, i) => (
                              <SubjectBadge key={i} subjectName={subName} />
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          {teacherClassesList.length === 0 ? (
                            <span className="text-[11px] text-slate-400 italic">{isAr ? 'غير محدد' : 'None'}</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {teacherClassesList.map((clsLabel, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold">
                                  {clsLabel}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-3 font-mono font-bold text-[#0284C7]">${tch.monthlySalary} USD</td>
                        <td className="p-3 flex items-center justify-center gap-1.5">
                          {currentRole === 'admin' && (
                            <button
                              onClick={() => setShowEditTeacherModal(tch)}
                              className="p-1.5 bg-sky-50 hover:bg-sky-100 text-[#0284C7] rounded-lg cursor-pointer"
                              title={isAr ? 'تعديل المواد والصفوف' : 'Edit Subjects & Classes'}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => setShowSendLessonModal(tch)}
                            className="btn-mustard flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold shadow cursor-pointer"
                            title="إرسال درس وواجب بيتي للطلاب"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{isAr ? 'درس 📚' : 'Lesson'}</span>
                          </button>

                          {currentRole === 'admin' && (
                            <button
                              onClick={() => deleteTeacher(tch.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"
                              title={t('delete')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* Add Student Modal - Portal to document.body */}
      {showAddStudentModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <form
            onSubmit={handleAddStudentSubmit}
            className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-4xl w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative max-h-[85vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#0284C7]" />
                <span>{isAr ? 'إضافة طالب جديد وحساب مستقر تلقائياً' : 'Add New Student'}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddStudentModal(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>



            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'اسم الطالب الكامل' : 'Student Name'} <span className="text-red-500">*</span></label>
                <input type="text" required value={stuName} onChange={(e) => setStuName(e.target.value)} placeholder="مثال: أحمد محمد علي..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'اسم الطالب (English)' : 'English Name'}</label>
                <input type="text" value={stuNameEn} onChange={(e) => setStuNameEn(e.target.value)} placeholder="Ahmed Mohamed..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]" />
              </div>
            </div>

            {/* Parent Name & Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'اسم ولي الأمر' : 'Parent Name'}</label>
                <input type="text" value={stuParentName} onChange={(e) => setStuParentName(e.target.value)} placeholder="مثال: محمد علي الخالد..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'هاتف الأب / ولي الأمر' : 'Father Phone'}</label>
                <input type="text" value={stuParentPhone} onChange={(e) => setStuParentPhone(e.target.value)} placeholder="+961 70 123 456..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#0284C7]" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'هاتف الأم' : "Mother's Phone"}</label>
                <input type="text" value={stuMotherPhone} onChange={(e) => setStuMotherPhone(e.target.value)} placeholder="+961 70 999 888..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#0284C7]" />
              </div>
            </div>

            {/* Ministry Endorsement Clearance Number (Optional) */}
            <div className="space-y-1 text-right">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 justify-end">
                <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{isAr ? 'رقم الإفادة المعتمد من الوزارة (اختياري - فريد)' : 'Ministry Clearance Reference No. (Unique - Optional)'}</span>
              </label>
              <input 
                type="text" 
                value={stuMinistryClearance} 
                onChange={(e) => setStuMinistryClearance(e.target.value)} 
                placeholder={isAr ? "أدخل رقم الإفادة الوزارية الرسمي..." : "Enter unique Ministry clearance reference code..."} 
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 text-right" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{t('username')} <span className="text-red-500">*</span></label>
                <input type="text" required value={stuUsername} onChange={(e) => setStuUsername(e.target.value)} placeholder="ahmed.2026..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#0284C7]" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">{t('password')}</label>
                  <button type="button" onClick={handleRegenerateStuPassword} className="text-[10px] text-[#0284C7] font-bold flex items-center gap-1 cursor-pointer">
                    <RefreshCw className="w-3 h-3" />
                    <span>{isAr ? 'توليد جديد' : 'Generate'}</span>
                  </button>
                </div>
                <input type="text" required value={stuPassword} onChange={(e) => setStuPassword(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-red-600 font-extrabold rounded-xl px-3 py-2 text-xs font-mono focus:outline-none" />
              </div>
            </div>

            {/* Dynamic Grades and Classrooms Select */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{t('grade')}</label>
                <select
                  value={stuGrade}
                  onChange={(e) => {
                    setStuGrade(e.target.value);
                    const foundGrd = safeGrades.find((g) => g.name === e.target.value);
                    if (foundGrd) {
                      setStuGradeEn(foundGrd.nameEn || e.target.value);
                      if (foundGrd.tuitionFee) {
                        setStuTuitionTotal(foundGrd.tuitionFee.toString());
                      }
                    }
                  }}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
                >
                  {safeGrades.length === 0 ? (
                    <option value="الصف الأول الابتدائي">الصف الأول الابتدائي</option>
                  ) : (
                    safeGrades.map((g) => (
                      <option key={g.id} value={g.name}>
                        {isAr ? g.name : g.nameEn}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'الشعبة' : 'Classroom'}</label>
                <select
                  value={stuClassRoom}
                  onChange={(e) => setStuClassRoom(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
                >
                  {safeClassrooms.length === 0 ? (
                    <>
                      <option value="أ">الشعبة (أ)</option>
                      <option value="ب">الشعبة (ب)</option>
                      <option value="ج">الشعبة (ج)</option>
                    </>
                  ) : (
                    safeClassrooms.map((c) => (
                      <option key={c.id} value={c.sectionName}>
                        {c.gradeName ? `${c.gradeName} - ` : ''}{isAr ? c.sectionName : c.sectionNameEn}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{t('totalTuition')} ($ USD)</label>
                <input type="number" value={stuTuitionTotal} onChange={(e) => setStuTuitionTotal(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-mono rounded-xl px-3 py-2 text-xs focus:outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'الخصومات ($ USD)' : 'Discount ($ USD)'}</label>
                <input type="number" value={stuTuitionDiscount} onChange={(e) => setStuTuitionDiscount(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-emerald-600 font-mono rounded-xl px-3 py-2 text-xs focus:outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'المصاريف الإدارية ($ USD)' : 'Admin Fees ($ USD)'}</label>
                <input type="number" value={stuAdminFees} onChange={(e) => setStuAdminFees(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-amber-600 font-mono rounded-xl px-3 py-2 text-xs focus:outline-none" />
              </div>
            </div>

            {/* Dynamic Sibling Addition Section */}
            <div className="pt-3 border-t border-slate-100 space-y-3 text-right">
              <button
                type="button"
                onClick={addSiblingRow}
                className="w-full py-2 bg-sky-50 dark:bg-sky-950/20 hover:bg-sky-100 text-[#0284C7] dark:text-sky-400 border border-dashed border-[#0284C7]/30 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>➕ {isAr ? 'إضافة أخ / أخت (تلميذ إضافي لنفس ولي الأمر)' : 'Add Brother/Sister (Additional Sibling Student)'}</span>
              </button>

              {siblingsList.length > 0 && (
                <div className="space-y-3 p-3 rounded-2xl border border-sky-100 bg-sky-50/10 dark:bg-sky-950/5 text-right">
                  <h4 className="text-xs font-black text-[#0284C7] flex items-center gap-1.5 justify-end">
                    <span>👥 {isAr ? 'بيانات الإخوة الإضافيين المضافين للطلب:' : 'Additional Siblings Details:'}</span>
                  </h4>
                  
                  {siblingsList.map((sib, index) => (
                    <div key={sib.id} className="relative p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-xs">
                      {/* Header with remove button */}
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                        <button
                          type="button"
                          onClick={() => removeSiblingRow(sib.id)}
                          className="text-[10px] font-bold text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          {isAr ? 'حذف هذا الأخ 🗑️' : 'Remove Sibling'}
                        </button>
                        <span className="text-[10px] font-black text-slate-500">{isAr ? `الأخ المضاف #${index + 1}` : `Sibling #${index + 1}`}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{isAr ? 'اسم الأخ/الأخت الكامل *' : 'Sibling Name *'}</label>
                          <input 
                            type="text" 
                            required 
                            value={sib.name} 
                            onChange={(e) => updateSiblingField(index, 'name', e.target.value)} 
                            placeholder={isAr ? "مثال: يوسف محمد علي..." : "Sibling name..."} 
                            className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#0284C7] text-right" 
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{isAr ? 'اسم الأخ/الأخت (English)' : 'Sibling English Name'}</label>
                          <input 
                            type="text" 
                            value={sib.nameEn} 
                            onChange={(e) => updateSiblingField(index, 'nameEn', e.target.value)} 
                            placeholder="Youssef Mohamed..." 
                            className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#0284C7] text-right" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{t('grade')}</label>
                          <select
                            value={sib.grade}
                            onChange={(e) => updateSiblingField(index, 'grade', e.target.value)}
                            className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer font-bold"
                          >
                            {safeGrades.map((g) => (
                              <option key={g.id} value={g.name}>
                                {isAr ? g.name : g.nameEn}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{isAr ? 'الشعبة' : 'Classroom'}</label>
                          <select
                            value={sib.classRoom}
                            onChange={(e) => updateSiblingField(index, 'classRoom', e.target.value)}
                            className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer font-bold"
                          >
                            {safeClassrooms.map((c) => (
                              <option key={c.id} value={c.sectionName}>
                                {c.gradeName ? `${c.gradeName} - ` : ''}{isAr ? c.sectionName : c.sectionNameEn}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-right">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{t('totalTuition')} ($ USD)</label>
                          <input 
                            type="number" 
                            value={sib.tuitionTotal} 
                            onChange={(e) => updateSiblingField(index, 'tuitionTotal', e.target.value)} 
                            className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white font-mono rounded-xl px-2.5 py-1.5 text-xs focus:outline-none text-right" 
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{isAr ? 'الخصومات ($ USD)' : 'Discount ($ USD)'}</label>
                          <input 
                            type="number" 
                            value={sib.tuitionDiscount} 
                            onChange={(e) => updateSiblingField(index, 'tuitionDiscount', e.target.value)} 
                            className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-800 text-emerald-600 font-mono rounded-xl px-2.5 py-1.5 text-xs focus:outline-none text-right" 
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{isAr ? 'المصاريف الإدارية ($ USD)' : 'Admin Fees ($ USD)'}</label>
                          <input 
                            type="number" 
                            value={sib.adminFees || '0'} 
                            onChange={(e) => updateSiblingField(index, 'adminFees', e.target.value)} 
                            className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-800 text-amber-600 font-mono rounded-xl px-2.5 py-1.5 text-xs focus:outline-none text-right" 
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{isAr ? 'رقم إفادة الوزارة' : 'Clearance No.'}</label>
                          <input 
                            type="text" 
                            value={sib.ministryClearance} 
                            onChange={(e) => updateSiblingField(index, 'ministryClearance', e.target.value)} 
                            placeholder={isAr ? "رقم إفادة فريد..." : "Unique clearance..."}
                            className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white font-mono rounded-xl px-2.5 py-1.5 text-xs focus:outline-none text-right" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800 text-right">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-500 block">{t('username')}</span>
                          <input 
                            type="text" 
                            required 
                            value={sib.username} 
                            onChange={(e) => updateSiblingField(index, 'username', e.target.value)} 
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-[#0F172A] dark:text-white font-mono rounded-lg px-2 py-1 text-[11px] focus:outline-none text-right" 
                          />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-500 block">{t('password')}</span>
                          <input 
                            type="text" 
                            required 
                            value={sib.password} 
                            onChange={(e) => updateSiblingField(index, 'password', e.target.value)} 
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-red-500 font-bold font-mono rounded-lg px-2 py-1 text-[11px] focus:outline-none text-right" 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Combined Family Tuition Panel */}
              <div className="p-4 bg-sky-50/50 dark:bg-sky-950/20 border-2 border-sky-200 dark:border-sky-900 rounded-2xl flex items-center justify-between text-right">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  <div>
                    <h4 className="text-xs font-black text-slate-700 dark:text-slate-300">{isAr ? 'الحساب المالي المجمع للمسجلين:' : 'Total Family Tuition:'}</h4>
                    <p className="text-[10px] text-slate-500 font-bold">{isAr ? `طالب رئيسي + ${siblingsList.length} إخوة` : `1 Primary + ${siblingsList.length} Siblings`}</p>
                  </div>
                </div>
                <div className="text-left font-mono">
                  <span className="text-sm font-black text-[#0284C7] dark:text-sky-400 block" title={isAr ? 'إجمالي الأقساط' : 'Total Tuition'}>
                    {isAr ? 'القسط:' : 'Tuition:'} ${(Number(stuTuitionTotal || 0) + siblingsList.reduce((acc, s) => acc + Number(s.tuitionTotal || 0), 0))} USD
                  </span>
                  <span className="text-[10px] text-amber-600 font-extrabold block" title={isAr ? 'إجمالي المصاريف الإدارية' : 'Total Admin Fees'}>
                    {isAr ? 'المصاريف الإدارية:' : 'Admin Fees:'} +${(Number(stuAdminFees || 0) + siblingsList.reduce((acc, s) => acc + Number(s.adminFees || 0), 0))} USD
                  </span>
                  <span className="text-[10px] text-emerald-600 font-extrabold block">
                    {isAr ? 'الخصم الإجمالي:' : 'Total Discount:'} -${(Number(stuTuitionDiscount || 0) + siblingsList.reduce((acc, s) => acc + Number(s.tuitionDiscount || 0), 0))} USD
                  </span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 border-t border-slate-200 dark:border-slate-800 pt-0.5 block">
                    {isAr ? 'صافي المبلغ المطلوب:' : 'Net Total:'} ${(Number(stuTuitionTotal || 0) + siblingsList.reduce((acc, s) => acc + Number(s.tuitionTotal || 0), 0)) + (Number(stuAdminFees || 0) + siblingsList.reduce((acc, s) => acc + Number(s.adminFees || 0), 0)) - (Number(stuTuitionDiscount || 0) + siblingsList.reduce((acc, s) => acc + Number(s.tuitionDiscount || 0), 0))} USD
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setShowAddStudentModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">{t('cancel')}</button>
              <button type="submit" className="px-5 py-2 btn-mustard rounded-xl text-xs font-bold shadow cursor-pointer">{t('save')}</button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Add Teacher Modal with Multi-Subject & Multi-Classroom Support */}
      {showAddTeacherModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <form
            onSubmit={handleAddTeacherSubmit}
            className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-4xl w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative max-h-[85vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#0284C7]" />
                <span>{isAr ? 'إضافة معلم جديد (المواد والصفوف الموكلة)' : 'Add Teacher'}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddTeacherModal(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Photo Avatar Upload */}
            <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#0284C7]" />
                <span>{isAr ? 'رفع صورة المعلم من جهازك:' : 'Upload teacher photo:'}</span>
              </label>

              <div className="flex items-center gap-3">
                <img src={tchAvatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-[#0284C7]" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleTeacherAvatarUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0284C7] file:text-white hover:file:bg-[#0369A1] cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'اسم المعلم الكامل' : 'Teacher Name'} <span className="text-red-500">*</span></label>
                <input type="text" required value={tchName} onChange={(e) => setTchName(e.target.value)} placeholder="أ. طارق عبد الله..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'اسم المعلم (English)' : 'English Name'}</label>
                <input type="text" value={tchNameEn} onChange={(e) => setTchNameEn(e.target.value)} placeholder="Tarek Abdallah..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{t('username')} <span className="text-red-500">*</span></label>
                <input type="text" required value={tchUsername} onChange={(e) => setTchUsername(e.target.value)} placeholder="tarek.math..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#0284C7]" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">{t('password')}</label>
                  <button type="button" onClick={handleRegenerateTchPassword} className="text-[10px] text-[#0284C7] font-bold flex items-center gap-1 cursor-pointer">
                    <RefreshCw className="w-3 h-3" />
                    <span>{isAr ? 'توليد جديد' : 'Generate'}</span>
                  </button>
                </div>
                <input type="text" required value={tchPassword} onChange={(e) => setTchPassword(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-red-600 font-extrabold rounded-xl px-3 py-2 text-xs font-mono focus:outline-none" />
              </div>
            </div>

            {/* MULTI-SUBJECT SELECTOR */}
            <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <label className="text-xs font-bold text-[#0284C7] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#0284C7]" />
                <span>{isAr ? 'اختر المواد التي يدرسها المعلم (أكثر من مادة):' : 'Select Assigned Subjects (Multiple):'}</span>
              </label>

              <div className="flex flex-wrap gap-2 pt-1">
                {safeSubjects.map((sub) => {
                  const isChecked = tchSubjects.includes(sub.name);

                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => toggleSubjectSelect(sub.name, tchSubjects, setTchSubjects)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                        isChecked 
                          ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-md scale-105' 
                          : 'bg-white text-slate-700 border-slate-200 hover:border-[#0284C7]'
                      }`}
                    >
                      <span>{sub.icon || '📚'}</span>
                      <span>{sub.name}</span>
                      {isChecked && <span>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MULTI-CLASSROOM SELECTOR */}
            <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <label className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <DoorOpen className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? 'اختر الصفوف والشعب الموكلة للمعلم (أكثر من شعبة):' : 'Select Assigned Classrooms (Multiple):'}</span>
              </label>

              <div className="flex flex-wrap gap-2 pt-1">
                {safeClassrooms.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">{isAr ? 'أضف صفوف وشعب أولاً من قسم (الصفوف والشعب).' : 'Add classrooms first.'}</p>
                ) : (
                  safeClassrooms.map((cls) => {
                    const label = `${cls.gradeName} - ${cls.sectionName}`;
                    const isChecked = tchAssignedClasses.includes(label);

                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => toggleClassSelect(label, tchAssignedClasses, setTchAssignedClasses)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                          isChecked 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105' 
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-500'
                        }`}
                      >
                        <span>🏫</span>
                        <span>{label}</span>
                        {isChecked && <span>✓</span>}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{t('monthlySalary')} ($ USD)</label>
              <input type="number" value={tchSalary} onChange={(e) => setTchSalary(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-mono rounded-xl px-3 py-2 text-xs focus:outline-none" />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setShowAddTeacherModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">{t('cancel')}</button>
              <button type="submit" className="px-5 py-2 btn-mustard rounded-xl text-xs font-bold shadow cursor-pointer">{t('save')}</button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Edit Teacher Modal for Assigning Multiple Subjects & Classes */}
      {showEditTeacherModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <form
            onSubmit={handleEditTeacherSubmit}
            className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-4xl w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative max-h-[85vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#0284C7]" />
                <span>{isAr ? `تعديل مواد وصفوف المعلم: ${showEditTeacherModal.name}` : `Edit Teacher - ${showEditTeacherModal.nameEn}`}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowEditTeacherModal(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* MULTI-SUBJECT SELECTOR */}
            <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <label className="text-xs font-bold text-[#0284C7] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#0284C7]" />
                <span>{isAr ? 'تحديث المواد التي يدرسها المعلم:' : 'Assigned Subjects:'}</span>
              </label>

              <div className="flex flex-wrap gap-2 pt-1">
                {safeSubjects.map((sub) => {
                  const currentList = showEditTeacherModal.subjects || [showEditTeacherModal.subject];
                  const isChecked = currentList.includes(sub.name);

                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        const updated = isChecked 
                          ? currentList.filter((s) => s !== sub.name)
                          : [...currentList, sub.name];
                        setShowEditTeacherModal({
                          ...showEditTeacherModal,
                          subject: updated[0] || 'الرياضيات',
                          subjects: updated
                        });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                        isChecked 
                          ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-md scale-105' 
                          : 'bg-white text-slate-700 border-slate-200 hover:border-[#0284C7]'
                      }`}
                    >
                      <span>{sub.icon || '📚'}</span>
                      <span>{sub.name}</span>
                      {isChecked && <span>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MULTI-CLASSROOM SELECTOR */}
            <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <label className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <DoorOpen className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? 'تحديث الصفوف والشعب الموكلة للمعلم:' : 'Assigned Classrooms:'}</span>
              </label>

              <div className="flex flex-wrap gap-2 pt-1">
                {safeClassrooms.map((cls) => {
                  const label = `${cls.gradeName} - ${cls.sectionName}`;
                  const currentClasses = showEditTeacherModal.assignedClassrooms || [];
                  const isChecked = currentClasses.includes(label);

                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => {
                        const updated = isChecked
                          ? currentClasses.filter((c) => c !== label)
                          : [...currentClasses, label];
                        setShowEditTeacherModal({
                          ...showEditTeacherModal,
                          assignedClassrooms: updated
                        });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                        isChecked 
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105' 
                          : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-500'
                      }`}
                    >
                      <span>🏫</span>
                      <span>{label}</span>
                      {isChecked && <span>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setShowEditTeacherModal(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">{t('cancel')}</button>
              <button type="submit" className="px-5 py-2 btn-mustard rounded-xl text-xs font-bold shadow cursor-pointer">{t('save')}</button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Send Lesson Modal - Portal to document.body */}
      {showSendLessonModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <form
            onSubmit={handleSendLessonSubmit}
            className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <Send className="w-5 h-5 text-[#0284C7]" />
                <span>{isAr ? `إرسال درس وواجب بيتي - ${showSendLessonModal.name}` : `Send Lesson & Homework - ${showSendLessonModal.nameEn}`}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowSendLessonModal(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{t('grade')}</label>
                <select value={lessonGrade} onChange={(e) => setLessonGrade(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none">
                  {safeGrades.map((g) => (
                    <option key={g.id} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'الشعبة' : 'Classroom'}</label>
                <select value={lessonClass} onChange={(e) => setLessonClass(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none">
                  {safeClassrooms.map((c) => (
                    <option key={c.id} value={c.sectionName}>{c.sectionName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{isAr ? 'عنوان الدرس الشارح' : 'Lesson Title'} <span className="text-red-500">*</span></label>
              <input type="text" required value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder="درس حل المعاملات الرياضية ص 45..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{isAr ? 'تفاصيل الواجب المنزلي المطلوبة' : 'Homework Description'}</label>
              <textarea rows={3} value={lessonHomework} onChange={(e) => setLessonHomework(e.target.value)} placeholder="حل التمارين من رقم 1 إلى 10 على دفتر الواجبات..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]" />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setShowSendLessonModal(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">{t('cancel')}</button>
              <button type="submit" className="px-5 py-2 btn-mustard rounded-xl text-xs font-bold shadow cursor-pointer">{isAr ? 'إرسال ونشر الآن 🚀' : 'Send & Publish 🚀'}</button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Student Detail Modal - Portal to document.body */}
      {showStudentDetailModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <img src={showStudentDetailModal.avatar} alt={showStudentDetailModal.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#0284C7]" />
                <div>
                  <h3 className="text-base font-bold text-[#0284C7]">{isAr ? showStudentDetailModal.name : showStudentDetailModal.nameEn}</h3>
                  <p className="text-xs text-slate-500">{isAr ? showStudentDetailModal.grade : showStudentDetailModal.gradeEn} ({showStudentDetailModal.classRoom})</p>
                </div>
              </div>
              <button 
                onClick={() => setShowStudentDetailModal(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-right">
              <div className="bg-[#F8FAFC] dark:bg-slate-900 p-3 rounded-xl border border-[#E2E8F0] dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block font-semibold">{t('username')}:</span>
                <span className="font-mono font-bold text-[#0284C7] dark:text-sky-400">{showStudentDetailModal.username}</span>
              </div>
              <div className="bg-[#F8FAFC] dark:bg-slate-900 p-3 rounded-xl border border-[#E2E8F0] dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block font-semibold">{t('password')}:</span>
                <span className="font-mono font-bold text-red-600 dark:text-red-400">{showStudentDetailModal.password}</span>
              </div>
              <div className="bg-[#F8FAFC] dark:bg-slate-900 p-3 rounded-xl border border-[#E2E8F0] dark:border-slate-800 col-span-2">
                <span className="text-slate-500 dark:text-slate-400 block font-semibold">{t('parentName')}:</span>
                <span className="font-bold text-[#0F172A] dark:text-slate-100">{isAr ? showStudentDetailModal.parentName : showStudentDetailModal.parentNameEn}</span>
              </div>
              <div className="bg-[#F8FAFC] dark:bg-slate-900 p-3 rounded-xl border border-[#E2E8F0] dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block font-semibold">{isAr ? 'هاتف الأب' : 'Father Phone'}:</span>
                <span className="font-mono font-bold text-[#0284C7] dark:text-sky-400">{showStudentDetailModal.phone || showStudentDetailModal.parentPhone || 'N/A'}</span>
              </div>
              <div className="bg-[#F8FAFC] dark:bg-slate-900 p-3 rounded-xl border border-[#E2E8F0] dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block font-semibold">{isAr ? 'هاتف الأم' : "Mother's Phone"}:</span>
                <span className="font-mono font-bold text-[#0284C7] dark:text-sky-400">{showStudentDetailModal.motherPhone || 'غير مسجل'}</span>
              </div>

              {/* Financial breakdown */}
              <div className="bg-[#F8FAFC] dark:bg-slate-900 p-3 rounded-xl border border-[#E2E8F0] dark:border-slate-800 col-span-2 space-y-1 bg-sky-50/20">
                <span className="text-[#0284C7] block font-black text-[10px] uppercase tracking-wider">{isAr ? '💸 تفاصيل الرسوم والأقساط السنوية' : 'Tuition & Payment Summary'}</span>
                <div className="flex justify-between font-mono pt-1">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">{isAr ? 'إجمالي القسط الأساسي:' : 'Total Tuition:'}</span>
                  <span className="font-extrabold">${showStudentDetailModal.tuitionTotal || 600} USD</span>
                </div>
                {showStudentDetailModal.hasTransport && (
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500 dark:text-slate-400 font-sans">{isAr ? 'رسوم النقل (الباص):' : 'Bus Transport Fee:'}</span>
                    <span className="font-extrabold text-sky-600">+${showStudentDetailModal.transportFee || 0} USD</span>
                  </div>
                )}
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">{isAr ? 'الخصومات الممنوحة:' : 'Tuition Discount:'}</span>
                  <span className="font-extrabold text-emerald-600">-${showStudentDetailModal.tuitionDiscount || 0} USD</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">{isAr ? 'إجمالي المقبوض:' : 'Total Paid:'}</span>
                  <span className="font-extrabold text-[#0284C7]">${showStudentDetailModal.tuitionPaid || 0} USD</span>
                </div>
                <div className="flex justify-between font-mono border-t border-slate-200 dark:border-slate-800 pt-1">
                  <span className="text-red-500 font-sans font-bold">{isAr ? 'المتبقي المستحق:' : 'Remaining Balance:'}</span>
                  <span className="font-black text-red-600 text-sm">
                    ${Math.max(0, (showStudentDetailModal.tuitionTotal || 600) + (showStudentDetailModal.hasTransport ? (showStudentDetailModal.transportFee || 0) : 0) - (showStudentDetailModal.tuitionDiscount || 0) - (showStudentDetailModal.tuitionPaid || 0))} USD
                  </span>
                </div>
              </div>
              
              {/* Ministry Endorsement Clearance Number Box */}
              <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200 dark:border-amber-800/40 col-span-2 flex items-center justify-between">
                <div className="text-right">
                  <span className="text-amber-800 dark:text-amber-400 block font-black text-[10px] uppercase tracking-wider">{isAr ? '🏆 رقم إفادة تسجيل الوزارة (الرقم المرجعي)' : 'Ministry Clearance Reference Number'}</span>
                  <span className="font-mono font-black text-sm text-amber-900 dark:text-amber-300 block mt-0.5">{showStudentDetailModal.ministryClearance || (isAr ? 'غير مسجل أو إفادة مؤقتة' : 'Not Registered / Pending')}</span>
                </div>
                {showStudentDetailModal.ministryClearance && (
                  <button 
                    onClick={() => handlePrintClearance(showStudentDetailModal)}
                    className="flex items-center gap-1 bg-[#EF4444] hover:bg-red-600 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow transition-all cursor-pointer border border-red-400"
                    title={isAr ? 'طباعة الإفادة الرسمية للوزارة' : 'Print Ministry Clearance'}
                  >
                    <Printer className="w-3.5 h-3.5 text-white" />
                    <span>{isAr ? 'طباعة الإفادة 🖨️' : 'Print Clearance'}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setShowStudentDetailModal(null)} className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer">{t('close')}</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Official Ministry Endorsement/Clearance Certificate for Printing */}
      {studentToPrint && (
        <div id="print-certificate-area" className="hidden print:block bg-white text-black p-10 max-w-[800px] mx-auto border-8 border-double border-amber-600 rounded-3xl space-y-8 font-sans relative text-right rtl">
          
          {/* Printable Styles Override */}
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * {
                visibility: hidden;
              }
              #print-certificate-area, #print-certificate-area * {
                visibility: visible;
              }
              #print-certificate-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                border: 8px double #d97706 !important;
                border-radius: 24px !important;
                background-color: white !important;
                color: black !important;
                padding: 40px !important;
                box-sizing: border-box !important;
              }
            }
          `}} />

          {/* Certificate Header Banner */}
          <div className="flex items-center justify-between border-b-4 border-amber-600 pb-4">
            <div className="text-right space-y-1">
              <h4 className="font-extrabold text-sm text-slate-800">الجمهورية اللبنانية</h4>
              <h4 className="font-extrabold text-xs text-slate-600">وزارة التربية والتعليم العالي</h4>
              <h5 className="font-bold text-[10px] text-slate-500">منطقة الإدارة التعليمية</h5>
            </div>
            
            {/* School Logo / Seal Placeholder */}
            <div className="text-center space-y-1 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-4 border-amber-600 flex items-center justify-center font-black text-xl text-amber-700 bg-amber-50">
                🏫
              </div>
              <span className="font-black text-xs text-amber-800">مدرسة الدعم التعليمي</span>
            </div>

            <div className="text-left space-y-1">
              <h4 className="font-extrabold text-sm text-slate-800">مدرسة الدعم التعليمي الخاصة</h4>
              <h4 className="font-extrabold text-xs text-slate-600">قسم التسجيل والملفات</h4>
              <h5 className="font-bold text-[10px] text-slate-500">التاريخ: {new Date().toLocaleDateString('ar-YE')}</h5>
            </div>
          </div>

          {/* Main Title */}
          <div className="text-center space-y-2 py-4">
            <h1 className="text-2xl font-black text-amber-800 underline decoration-double decoration-amber-600 underline-offset-8">إفادة تسجيل وتصديق رسمي</h1>
            <p className="text-xs text-slate-500 font-bold">صادرة بموجب اللوائح الرسمية المصادق عليها من وزارة التربية والتعليم العالي</p>
          </div>

          {/* Verification Paragraph */}
          <div className="text-sm text-slate-800 leading-loose text-justify font-medium">
            بناءً على طلب ولي الأمر المذكور أدناه، تشهد إدارة **مدرسة الدعم التعليمي الخاصة** المرخصة رسمياً، بأن التلميذ المذكورة بياناته في الجدول أدناه قد تم تسجيله رسمياً في السجلات الأكاديمية للمدرسة للعام الدراسي الحالي، وتم منحه رقم الإفادة الرسمي المعتمد والموثق لدى وزارة التربية والتعليم العالي لتصنيف وتصديق الملفات الطلابية.
          </div>

          {/* Official Information Box */}
          <div className="border-2 border-amber-600 rounded-2xl overflow-hidden shadow-xs">
            <div className="grid grid-cols-2 border-b border-amber-600 bg-amber-50">
              <div className="p-3 border-l border-amber-600">
                <span className="text-[10px] text-slate-500 block font-bold">اسم التلميذ الكامل:</span>
                <span className="font-black text-sm text-amber-950">{studentToPrint.name}</span>
              </div>
              <div className="p-3">
                <span className="text-[10px] text-slate-500 block font-bold">اسم التلميذ بالإنجليزية:</span>
                <span className="font-black text-xs text-slate-800 font-mono">{studentToPrint.nameEn || 'N/A'}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 border-b border-amber-600">
              <div className="p-3 border-l border-amber-600">
                <span className="text-[10px] text-slate-500 block font-bold">المرحلة الدراسية / الصف:</span>
                <span className="font-black text-xs text-slate-800">{studentToPrint.grade}</span>
              </div>
              <div className="p-3">
                <span className="text-[10px] text-slate-500 block font-bold">الشعبة المخصصة:</span>
                <span className="font-black text-xs text-slate-800">الشعبة ({studentToPrint.classRoom || 'أ'})</span>
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-amber-600">
              <div className="p-3 border-l border-amber-600">
                <span className="text-[10px] text-slate-500 block font-bold">اسم ولي الأمر:</span>
                <span className="font-black text-xs text-slate-800">{studentToPrint.parentName || 'غير مسجل'}</span>
              </div>
              <div className="p-3">
                <span className="text-[10px] text-slate-500 block font-bold">رقم التواصل المعتمد:</span>
                <span className="font-black text-xs text-slate-800 font-mono">{studentToPrint.phone || 'N/A'}</span>
              </div>
            </div>

            {/* Ministry Clearance Number (Golden Highlight row) */}
            <div className="p-4 bg-amber-100/50 flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-amber-800 font-black text-xs tracking-wider">🏆 رقم إفادة تصنيف ملف الوزارة الرسمي</span>
              <span className="font-mono font-black text-xl text-amber-950 bg-white border border-amber-500 px-6 py-1.5 rounded-xl shadow-inner select-all">
                {studentToPrint.ministryClearance || 'PENDING-VERIFICATION'}
              </span>
              <span className="text-[9px] text-slate-500 font-bold">يرجى استخدام هذا الرقم كمرجع رسمي للملف في كافة المراسلات والتقارير الأكاديمية</span>
            </div>
          </div>

          {/* Stamp and Signature Area */}
          <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
            
            {/* School stamp */}
            <div className="border border-dashed border-slate-300 rounded-2xl p-4 space-y-16">
              <span className="font-extrabold text-slate-800 block">توقيع وختم مدير المدرسة</span>
              <div className="text-[10px] text-slate-400 font-bold">
                تاريخ الإصدار: {new Date().toLocaleDateString('ar-YE')}
              </div>
            </div>

            {/* Ministry validation stamp */}
            <div className="border border-dashed border-slate-300 rounded-2xl p-4 space-y-16">
              <span className="font-extrabold text-slate-800 block">خاص بتصديق وزارة التربية والتعليم العالي</span>
              <div className="text-[9px] text-slate-400 font-bold">
                (خاص بالدائرة التعليمية الرسمية لتوقيع وختم المندوب المعتمد)
              </div>
            </div>

          </div>

          {/* Footer warning */}
          <div className="text-center text-[9px] text-slate-400 border-t border-slate-100 pt-4">
            تعتبر هذه الإفادة لاغية أو غير صالحة إذا تم كشطها أو تغيير بياناتها الأساسية دون توقيع رسمي وختم حي من الإدارة المدرسية والوزارة المعنية.
          </div>

        </div>
      )}

      {/* Edit Student Modal - Portal to document.body */}
      {showEditStudentModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex justify-center items-start overflow-y-auto p-4 sm:p-6">
          <form
            onSubmit={handleEditStudentSubmit}
            className="bg-white dark:bg-[#1E293B] border-2 border-amber-500 rounded-3xl p-6 max-w-4xl w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] dark:text-slate-100 relative my-auto text-right max-h-[85vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                <span>{isAr ? `تعديل ملف الطالب: ${showEditStudentModal.name}` : `Edit Student: ${showEditStudentModal.name}`}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowEditStudentModal(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isAr ? 'اسم الطالب الكامل' : 'Student Name'} <span className="text-red-500">*</span></label>
                <input type="text" required value={editStuName} onChange={(e) => setEditStuName(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-right" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isAr ? 'اسم الطالب (English)' : 'English Name'}</label>
                <input type="text" value={editStuNameEn} onChange={(e) => setEditStuNameEn(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-right" />
              </div>
            </div>

            {/* Parent Name & Phone Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-right">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isAr ? 'اسم ولي الأمر' : 'Parent Name'}</label>
                <input type="text" value={editStuParentName} onChange={(e) => setEditStuParentName(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-right" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isAr ? 'هاتف الأب / ولي الأمر' : 'Father Phone'}</label>
                <input type="text" value={editStuParentPhone} onChange={(e) => setEditStuParentPhone(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 text-right" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isAr ? 'هاتف الأم' : "Mother's Phone"}</label>
                <input type="text" value={editStuMotherPhone} onChange={(e) => setEditStuMotherPhone(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 text-right" />
              </div>
            </div>

            {/* Ministry Clearance Number (Optional) */}
            <div className="space-y-1 text-right">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 justify-end">
                <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{isAr ? 'رقم الإفادة المعتمد من الوزارة (اختياري - فريد)' : 'Ministry Clearance Reference No. (Unique - Optional)'}</span>
              </label>
              <input 
                type="text" 
                value={editStuMinistryClearance} 
                onChange={(e) => setEditStuMinistryClearance(e.target.value)} 
                placeholder={isAr ? "أدخل رقم الإفادة الوزارية الرسمي..." : "Enter unique Ministry clearance reference code..."} 
                className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 text-right" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('username')} <span className="text-red-500">*</span></label>
                <input type="text" required value={editStuUsername} onChange={(e) => setEditStuUsername(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 text-right" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('password')} <span className="text-red-500">*</span></label>
                <input type="text" required value={editStuPassword} onChange={(e) => setEditStuPassword(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-red-600 dark:text-red-400 font-extrabold rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 text-right" />
              </div>
            </div>

            {/* Grades and Classroom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('grade')}</label>
                <select
                  value={editStuGrade}
                  onChange={(e) => {
                    setEditStuGrade(e.target.value);
                    const foundGrd = safeGrades.find((g) => g.name === e.target.value);
                    if (foundGrd) {
                      setEditStuGradeEn(foundGrd.nameEn || e.target.value);
                    }
                  }}
                  className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
                >
                  {safeGrades.map((g) => (
                    <option key={g.id} value={g.name}>{isAr ? g.name : g.nameEn}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isAr ? 'الشعبة' : 'Classroom'}</label>
                <select
                  value={editStuClassRoom}
                  onChange={(e) => setEditStuClassRoom(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
                >
                  {safeClassrooms.map((c) => (
                    <option key={c.id} value={c.sectionName}>{isAr ? c.sectionName : c.sectionNameEn}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tuition Fees & Discount */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isAr ? 'إجمالي القسط السنوي ($)' : 'Total Tuition ($)'}</label>
                <input type="number" value={editStuTuitionTotal} onChange={(e) => setEditStuTuitionTotal(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white font-mono rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-right" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isAr ? 'الخصومات الممنوحة ($)' : 'Discounts ($)'}</label>
                <input type="number" value={editStuTuitionDiscount} onChange={(e) => setEditStuTuitionDiscount(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-emerald-600 dark:text-emerald-400 font-mono rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-right" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isAr ? 'المصاريف الإدارية ($)' : 'Admin Fees ($)'}</label>
                <input type="number" value={editStuAdminFees} onChange={(e) => setEditStuAdminFees(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-amber-600 dark:text-amber-400 font-mono rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-right" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isAr ? 'المبلغ المدفوع ($)' : 'Paid Amount ($)'}</label>
                <input type="number" value={editStuTuitionPaid} onChange={(e) => setEditStuTuitionPaid(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white font-mono rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-right" />
              </div>
            </div>

            {/* Edit Transportation Details (Bus) */}
            <div className="bg-sky-50/20 dark:bg-slate-900/50 p-4.5 rounded-2xl border border-sky-100/50 dark:border-slate-800 space-y-3.5 text-right">
              <div className="flex items-center justify-end">
                <label className="text-xs font-bold text-[#0284C7] dark:text-sky-400 flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editStuHasTransport}
                    onChange={(e) => setEditStuHasTransport(e.target.checked)}
                    className="w-4 h-4 accent-[#0284C7] rounded"
                  />
                  <span>{isAr ? 'هل يريد الطالب التسجيل في باص/نقل المدرسة؟' : 'Register for School Bus/Transport?'}</span>
                </label>
              </div>

              {editStuHasTransport && (
                <div className="space-y-1 max-w-xs ml-auto text-right">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isAr ? 'قيمة رسوم النقل ($ USD)' : 'Transportation Fee ($ USD)'} <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    value={editStuTransportFee}
                    onChange={(e) => setEditStuTransportFee(e.target.value)}
                    placeholder="50..."
                    className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white font-mono rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7] text-right"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={() => setShowEditStudentModal(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">{t('cancel')}</button>
              <button type="submit" className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow cursor-pointer transition-colors">{t('save')}</button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Printable Students Roster Spreadsheet */}
      {isPrintingStudentsTable && (
        <div id="print-students-table-area" className="hidden print:block bg-white text-black p-8 font-sans text-right rtl">
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * {
                visibility: hidden;
              }
              #print-students-table-area, #print-students-table-area * {
                visibility: visible;
              }
              #print-students-table-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background-color: white !important;
                color: black !important;
              }
            }
          `}} />
          
          <div className="text-center space-y-2 border-b-2 border-amber-600 pb-4 mb-6">
            <h1 className="text-xl font-black text-amber-800">مدرسة الدعم التعليمي الخاصة</h1>
            <h2 className="text-base font-extrabold text-slate-700">كشف بيانات الطلاب والأقساط الدراسية</h2>
            <p className="text-[10px] text-slate-500 font-bold">تاريخ استخراج الكشف: {new Date().toLocaleDateString('ar-YE')}</p>
          </div>

          <table className="w-full text-xs border-collapse border border-slate-300 text-right">
            <thead>
              <tr className="bg-slate-100 border border-slate-300">
                <th className="p-2 border border-slate-300 font-extrabold">الرقم التعريفي (ID)</th>
                <th className="p-2 border border-slate-300 font-extrabold">اسم التلميذ</th>
                <th className="p-2 border border-slate-300 font-extrabold">الصف والشعبة</th>
                <th className="p-2 border border-slate-300 font-extrabold">هاتف ولي الأمر</th>
                <th className="p-2 border border-slate-300 font-extrabold">إجمالي القسط السنوي</th>
                <th className="p-2 border border-slate-300 font-extrabold">المبلغ المدفوع</th>
                <th className="p-2 border border-slate-300 font-extrabold">المبلغ المتبقي</th>
                <th className="p-2 border border-slate-300 font-extrabold">رقم الإفادة الوزارية</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => {
                const remaining = (s.tuitionTotal || 0) - (s.tuitionPaid || 0);
                return (
                  <tr key={s.id} className="border border-slate-300">
                    <td className="p-2 border border-slate-300 font-mono font-bold">{s.id}</td>
                    <td className="p-2 border border-slate-300 font-extrabold">{s.name}</td>
                    <td className="p-2 border border-slate-300 font-bold">{s.grade} ({s.classRoom || 'أ'})</td>
                    <td className="p-2 border border-slate-300 font-mono">{s.phone || s.parentPhone || 'غير مسجل'}</td>
                    <td className="p-2 border border-slate-300 font-mono font-bold">${s.tuitionTotal || 0}</td>
                    <td className="p-2 border border-slate-300 font-mono font-bold text-emerald-700">${s.tuitionPaid || 0}</td>
                    <td className="p-2 border border-slate-300 font-mono font-bold text-red-600">${remaining}</td>
                    <td className="p-2 border border-slate-300 font-mono">{s.ministryClearance || 'لا يوجد'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-12 text-xs">
            <div>
              <span className="font-bold block">إجمالي عدد الطلاب المدرجين: {filteredStudents.length} طلاب</span>
            </div>
            <div className="text-center">
              <span className="font-bold block">توقيع وختم الإدارة المالية</span>
              <div className="w-32 h-16 border border-dashed border-slate-200 mt-2 mx-auto rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Printable Teachers Roster Spreadsheet */}
      {isPrintingTeachersTable && (
        <div id="print-teachers-table-area" className="hidden print:block bg-white text-black p-8 font-sans text-right rtl">
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * {
                visibility: hidden;
              }
              #print-teachers-table-area, #print-teachers-table-area * {
                visibility: visible;
              }
              #print-teachers-table-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background-color: white !important;
                color: black !important;
              }
            }
          `}} />
          
          <div className="text-center space-y-2 border-b-2 border-amber-600 pb-4 mb-6">
            <h1 className="text-xl font-black text-amber-800">مدرسة الدعم التعليمي الخاصة</h1>
            <h2 className="text-base font-extrabold text-slate-700">كشف رواتب ومخصصات أعضاء هيئة التدريس</h2>
            <p className="text-[10px] text-slate-500 font-bold">تاريخ استخراج الكشف: {new Date().toLocaleDateString('ar-YE')}</p>
          </div>

          <table className="w-full text-xs border-collapse border border-slate-300 text-right">
            <thead>
              <tr className="bg-slate-100 border border-slate-300">
                <th className="p-2 border border-slate-300 font-extrabold">الرقم الوظيفي (ID)</th>
                <th className="p-2 border border-slate-300 font-extrabold">اسم المعلم الكامل</th>
                <th className="p-2 border border-slate-300 font-extrabold">المادة الأساسية</th>
                <th className="p-2 border border-slate-300 font-extrabold">الصف والشعب المخصصة</th>
                <th className="p-2 border border-slate-300 font-extrabold">الراتب الشهري الأساسي</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id} className="border border-slate-300">
                  <td className="p-2 border border-slate-300 font-mono font-bold">{t.id}</td>
                  <td className="p-2 border border-slate-300 font-extrabold">{t.name}</td>
                  <td className="p-2 border border-slate-300 font-bold">{t.subject || 'غير محدد'}</td>
                  <td className="p-2 border border-slate-300">{(t.assignedClassrooms || []).join('، ') || 'عام'}</td>
                  <td className="p-2 border border-slate-300 font-mono font-bold text-amber-700">${t.monthlySalary || 0} USD</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-12 text-xs">
            <div>
              <span className="font-bold block">إجمالي عدد المعلمين المدرجين: {teachers.length} معلمين</span>
            </div>
            <div className="text-center">
              <span className="font-bold block">توقيع وختم الشؤون المالية والموارد البشرية</span>
              <div className="w-32 h-16 border border-dashed border-slate-200 mt-2 mx-auto rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
