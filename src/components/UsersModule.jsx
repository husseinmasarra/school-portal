import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp, defaultAvatars, systemPermissionOptions } from '../context/AppContext';
import { 
  KeyRound, 
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  Search, 
  User, 
  Lock, 
  Users 
} from 'lucide-react';

export const UsersModule = () => {
  const { 
    lang, 
    t, 
    systemUsers = [], 
    teachers = [],
    staffEmployees = [],
    addSystemUser, 
    updateSystemUser, 
    deleteSystemUser, 
    generateStrong8CharPassword 
  } = useApp();

  const isAr = lang === 'ar';
  const safeSystemUsers = systemUsers || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');

  // Add User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserNameEn, setNewUserNameEn] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState(() => generateStrong8CharPassword());
  const [newUserRole, setNewUserRole] = useState('teacher');
  const [newUserRoleTitle, setNewUserRoleTitle] = useState('مدرس معتمد');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserAvatar, setNewUserAvatar] = useState(defaultAvatars[1]);
  const [newUserPermissions, setNewUserPermissions] = useState(['send_lessons', 'manage_grades', 'send_messages']);

  // Edit System User Full Modal State
  const [editingSystemUser, setEditingSystemUser] = useState(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserNameEn, setEditUserNameEn] = useState('');
  const [editUserUsername, setEditUserUsername] = useState('');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [editUserRoleTitle, setEditUserRoleTitle] = useState('');
  const [editPermissionsList, setEditPermissionsList] = useState([]);

  const normalizeArabic = (str) => {
    if (!str) return '';
    return str
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  };

  // Filtered Users
  const filteredUsers = safeSystemUsers.filter((usr) => {
    const normSearch = normalizeArabic(searchTerm);
    const normName = normalizeArabic(usr.name || '') + ' ' + (usr.username || '').toLowerCase();
    const nameMatch = !normSearch || normName.includes(normSearch);
    const roleMatch = roleFilter === 'all' || usr.role === roleFilter;
    return nameMatch && roleMatch;
  });

  const handleNewUserAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewUserAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRoleChange = (role) => {
    setNewUserRole(role);
    if (role === 'admin') {
      setNewUserRoleTitle('مدير عام النظام');
      setNewUserPermissions(['manage_all', 'manage_finance', 'manage_users', 'print_cards']);
    } else if (role === 'teacher') {
      setNewUserRoleTitle('مدرس معتمد');
      setNewUserPermissions(['send_lessons', 'manage_grades', 'send_messages', 'print_cards']);
    } else if (role === 'driver') {
      setNewUserRoleTitle('سائق حافلة مدرسية');
      setNewUserPermissions(['manage_bus', 'contact_parents']);
    }
  };

  const togglePermissionCheckbox = (permId) => {
    setNewUserPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const toggleEditPermissionCheckbox = (permId) => {
    setEditPermissionsList((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    if (!newUserName || !newUserUsername || !newUserPassword) return;

    addSystemUser({
      name: newUserName,
      nameEn: newUserNameEn || newUserName,
      username: newUserUsername,
      password: newUserPassword,
      role: newUserRole,
      roleTitle: newUserRoleTitle,
      phone: newUserPhone || '+961 70 000 000',
      avatar: newUserAvatar,
      permissions: newUserPermissions
    });

    setNewUserName('');
    setNewUserNameEn('');
    setNewUserUsername('');
    setNewUserPhone('');
    setShowAddUserModal(false);
    setToastMessage(isAr ? 'تم إضافة المستخدم الجديد ومنحه الصلاحيات بنجاح 🟢' : 'User added successfully!');
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleOpenEditUser = (usr) => {
    setEditingSystemUser(usr);
    setEditUserName(usr.name || '');
    setEditUserNameEn(usr.nameEn || usr.name || '');
    setEditUserUsername(usr.username || '');
    setEditUserPassword(usr.password || '');
    setEditUserRoleTitle(usr.roleTitle || usr.role || '');
    setEditPermissionsList(usr.permissions || []);
  };

  const handleSaveEditUser = (e) => {
    if (e) e.preventDefault();
    if (!editingSystemUser) return;
    if (!editUserName || !editUserUsername || !editUserPassword) return;

    updateSystemUser(editingSystemUser.id, {
      name: editUserName,
      nameEn: editUserNameEn || editUserName,
      username: editUserUsername,
      password: editUserPassword,
      roleTitle: editUserRoleTitle,
      permissions: editPermissionsList
    });

    setEditingSystemUser(null);
    setToastMessage(isAr ? 'تم تحديث الاسم، كلمة السر، وبيانات الحساب بنجاح 🟢' : 'User account updated successfully!');
    setTimeout(() => setToastMessage(''), 3500);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">
      
      {/* Header Title Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm text-[#0F172A]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0284C7]">{isAr ? 'إدارة حسابات المستخدمين والصلاحيات' : 'Users & Permissions Management'}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {isAr 
                ? "صفحة مستقلة لإدارة الحسابات، تعديل الأسماء وكلمات السر، ومنح الصلاحيات الدقيقة لكل مستخدم."
                : "Manage all system user accounts, edit credentials, passwords and permissions."}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddUserModal(true)}
          className="btn-mustard flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black shadow cursor-pointer transition-all hover:scale-105"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isAr ? 'إضافة مستخدم جديد +' : 'Add New User +'}</span>
        </button>
      </div>

      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in shadow-lg">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Toolbar: Search Box & Role Filter */}
      <div className="bg-white border border-[#E2E8F0] p-4 rounded-3xl space-y-4 shadow-sm text-[#0F172A]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? "🔍 ابحث عن اسم المستخدم أو الحساب..." : "🔍 Search name or username..."}
              className="w-full bg-[#F8FAFC] border-2 border-slate-200 text-[#0F172A] rounded-2xl pr-9 pl-4 py-2 text-xs font-bold focus:outline-none focus:border-[#0284C7]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 shrink-0">{isAr ? 'تصنيف الحساب:' : 'Filter Role:'}</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-[#F8FAFC] border-2 border-slate-200 text-xs font-extrabold text-[#0F172A] rounded-2xl px-3 py-2 focus:outline-none cursor-pointer"
            >
              <option value="all">{isAr ? 'جميع الحسابات' : 'All Accounts'}</option>
              <option value="admin">{isAr ? '🛡️ المدراء (Admin)' : 'Admins'}</option>
              <option value="teacher">{isAr ? '📚 المعلمون (Teacher)' : 'Teachers'}</option>
              <option value="student">{isAr ? '🎓 الطلاب (Student)' : 'Students'}</option>
              <option value="driver">{isAr ? '🚌 السائقون (Driver)' : 'Drivers'}</option>
            </select>
          </div>
        </div>

        {/* System Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[#0284C7] bg-[#F8FAFC] font-black">
                <th className="p-3 text-right">المستخدم والرمز</th>
                <th className="p-3 text-right">اسم الدخول (Username)</th>
                <th className="p-3 text-center">كلمة السر</th>
                <th className="p-3 text-center">الدور والمسمى الوظيفي</th>
                <th className="p-3 text-right">الصلاحيات الممنوحة</th>
                <th className="p-3 text-center">إجراءات والتعديل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#0F172A]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 font-bold">
                    {isAr ? 'لا يوجد مستخدمون يطابقون كلمة البحث.' : 'No users found.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((usr) => (
                  <tr key={usr.id} className="hover:bg-[#F8FAFC] transition-all">
                    <td className="p-3 font-bold flex items-center gap-2">
                      <img src={usr.avatar || defaultAvatars[0]} alt={usr.name} className="w-8 h-8 rounded-full object-cover border-2 border-[#0284C7]" />
                      <span>{isAr ? usr.name : usr.nameEn}</span>
                    </td>
                    <td className="p-3 font-mono text-[#0284C7] font-black">{usr.username}</td>
                    <td className="p-3 text-center font-mono text-red-600 font-black">{usr.password}</td>
                    <td className="p-3 text-center font-bold">
                      <span className="px-2.5 py-1 rounded-xl bg-[#0284C7]/10 text-[#0284C7] border border-[#0284C7]/20 text-xs font-black">
                        {usr.roleTitle || usr.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {(usr.permissions || []).map((permId) => {
                          const opt = systemPermissionOptions.find((p) => p.id === permId);
                          return (
                            <span key={permId} className="px-2 py-0.5 rounded-lg bg-sky-50 border border-sky-200 text-[10px] font-bold text-[#0284C7]">
                              {opt ? (isAr ? opt.name : (opt.nameEn || opt.name)) : permId}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditUser(usr)}
                          className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#0284C7] border border-sky-200 rounded-xl cursor-pointer flex items-center gap-1 font-bold text-xs shadow-xs"
                          title="تعديل الاسم وكلمة السر والصلاحيات"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>تعديل ✏️</span>
                        </button>

                        {usr.id !== 'USER-ADMIN-01' && usr.username !== 'admin' && (
                          <button
                            onClick={() => deleteSystemUser(usr.id)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl cursor-pointer"
                            title="حذف المستخدم"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="border-t-2 border-[#0284C7] bg-[#F8FAFC]">
              <tr className="font-extrabold text-xs text-[#0F172A]">
                <td colSpan={3} className="p-3 text-right text-slate-700">
                  <span>مجموع الرواتب الشهري الإجمالي لجميع المستخدمين والكوادر:</span>
                </td>
                <td colSpan={3} className="p-3 font-mono font-black text-[#0284C7] text-sm">
                  ${((teachers || []).reduce((sum, t) => sum + (Number(t.monthlySalary) || 1200), 0) + (staffEmployees || []).reduce((sum, s) => sum + (Number(s.monthlySalary) || 0), 0)).toLocaleString()} USD
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleAddUserSubmit}
            className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                <span>إضافة مستخدم جديد وتحديد الصلاحيات ➕</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddUserModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">اسم المستخدم الكامل <span className="text-red-500">*</span></label>
                <input type="text" required value={newUserName} onChange={e => setNewUserName(e.target.value)}
                  placeholder="مثال: أحمد عبد الله..."
                  className="w-full mt-1 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#0284C7]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">اسم الدخول (Username) <span className="text-red-500">*</span></label>
                  <input type="text" required value={newUserUsername} onChange={e => setNewUserUsername(e.target.value)}
                    placeholder="ahmed.user..."
                    className="w-full mt-1 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#0284C7]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">كلمة السر (توليد تلقائي)</label>
                  <input type="text" required value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)}
                    className="w-full mt-1 bg-[#F8FAFC] border border-[#E2E8F0] text-red-600 font-extrabold rounded-xl px-3 py-2 text-xs font-mono focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">رقم الهاتف</label>
                  <input type="text" value={newUserPhone} onChange={e => setNewUserPhone(e.target.value)}
                    placeholder="+961 70 000 000"
                    className="w-full mt-1 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#0284C7]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">الدور</label>
                  <select value={newUserRole} onChange={e => handleRoleChange(e.target.value)}
                    className="w-full mt-1 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold">
                    <option value="admin">🛡️ مدير عام (Admin)</option>
                    <option value="teacher">📚 مدرس (Teacher)</option>
                    <option value="driver">🚌 سائق (Driver)</option>
                  </select>
                </div>
              </div>

              {/* Permissions Matrix */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3 space-y-2">
                <p className="text-xs font-extrabold text-[#0284C7] flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0284C7]" /> الصلاحيات الممنوحة للمستخدم:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {systemPermissionOptions.map(perm => (
                    <label key={perm.id} className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer hover:text-[#0284C7] p-2 rounded-xl bg-white border border-slate-100 hover:border-[#0284C7]/40 shadow-xs transition-all">
                      <input type="checkbox" checked={newUserPermissions.includes(perm.id)}
                        onChange={() => togglePermissionCheckbox(perm.id)}
                        className="accent-[#0284C7] w-4 h-4 rounded cursor-pointer" />
                      <span>{isAr ? perm.name : (perm.nameEn || perm.name)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">إلغاء</button>
              <button type="submit"
                className="btn-mustard px-5 py-2 rounded-xl text-xs font-bold shadow cursor-pointer flex items-center gap-1.5">
                <UserPlus className="w-4 h-4" /> إضافة المستخدم وحفظ الصلاحيات ✅
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Edit User Details & Permissions Modal */}
      {editingSystemUser && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSaveEditUser} className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] my-auto max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <Edit className="w-5 h-5" />
                <span>تعديل اسم الحساب، كلمة السر الصلاحيات ✏️</span>
              </h3>
              <button 
                type="button"
                onClick={() => setEditingSystemUser(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block">الاسم الكامل للمستخدم <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  placeholder="مثال: أحمد علي..."
                  className="w-full mt-1 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block">اسم الدخول (Username) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editUserUsername}
                    onChange={(e) => setEditUserUsername(e.target.value)}
                    placeholder="admin, student.101..."
                    className="w-full mt-1 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#0284C7]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 block">كلمة السر <span className="text-red-500">*</span></label>
                    <button
                      type="button"
                      onClick={() => setEditUserPassword(generateStrong8CharPassword())}
                      className="text-[10px] text-[#0284C7] font-bold cursor-pointer hover:underline"
                    >
                      توليد جديدة 🔑
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={editUserPassword}
                    onChange={(e) => setEditUserPassword(e.target.value)}
                    className="w-full mt-1 bg-[#F8FAFC] border border-[#E2E8F0] text-red-600 rounded-xl px-3 py-2 text-xs font-mono font-extrabold focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              {/* Role Title */}
              <div>
                <label className="text-xs font-bold text-slate-700 block">المسمى الوظيفي والدور</label>
                <input
                  type="text"
                  value={editUserRoleTitle}
                  onChange={(e) => setEditUserRoleTitle(e.target.value)}
                  placeholder="مدير عام النظام، مدرس معتمد، طالب..."
                  className="w-full mt-1 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              {/* Permissions Matrix */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3 space-y-2">
                <p className="text-xs font-extrabold text-[#0284C7] flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
                  <span>الصلاحيات الممنوحة للمستخدم:</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {systemPermissionOptions.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer p-2 rounded-xl bg-white border border-slate-100 hover:border-[#0284C7]/40 shadow-xs transition-all">
                      <input
                        type="checkbox"
                        checked={editPermissionsList.includes(perm.id)}
                        onChange={() => toggleEditPermissionCheckbox(perm.id)}
                        className="accent-[#0284C7] w-4 h-4 rounded cursor-pointer"
                      />
                      <span>{isAr ? perm.name : (perm.nameEn || perm.name)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setEditingSystemUser(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button 
                type="submit"
                className="btn-mustard px-5 py-2 rounded-xl text-xs font-bold shadow cursor-pointer flex items-center gap-1.5"
              >
                <span>حفظ البيانات والتعديلات ✅</span>
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

    </div>
  );
};
