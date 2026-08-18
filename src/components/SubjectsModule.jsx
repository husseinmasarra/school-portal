import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Palette, 
  Camera, 
  Image as ImageIcon 
} from 'lucide-react';

export const SubjectsModule = () => {
  const { lang, t, currentRole, subjects = [], addSubject, deleteSubject } = useApp();

  const isAr = lang === 'ar';
  const safeSubjects = subjects || [];

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [icon, setIcon] = useState('📚');
  const [color, setColor] = useState('#0284C7');
  const [subjectImage, setSubjectImage] = useState('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&auto=format&fit=crop&q=80');

  const presetColors = [
    { hex: '#0284C7', label: isAr ? 'أزرق سماوي (Sky Blue)' : 'Sky Blue' },
    { hex: '#10b981', label: isAr ? 'أخضر زمردي (Emerald)' : 'Emerald Green' },
    { hex: '#a855f7', label: isAr ? 'بنفسجي (Purple)' : 'Purple' },
    { hex: '#EF4444', label: isAr ? 'أحمر قرمزي (Vibrant Red)' : 'Vibrant Red' },
    { hex: '#f97316', label: isAr ? 'برتقالي (Orange)' : 'Orange' },
    { hex: '#06b6d4', label: isAr ? 'سماوي (Cyan)' : 'Cyan' },
    { hex: '#f59e0b', label: isAr ? 'ذهبي (Mustard Gold)' : 'Mustard Gold' },
    { hex: '#ec4899', label: isAr ? 'وردي (Pink)' : 'Pink' }
  ];

  // Handle Photo File Upload
  const handleSubjectImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSubjectImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!name) return;

    const hexToRgba = (hex, alpha) => {
      const cleanHex = hex.replace('#', '');
      const r = parseInt(cleanHex.slice(0, 2), 16) || 2;
      const g = parseInt(cleanHex.slice(2, 4), 16) || 132;
      const b = parseInt(cleanHex.slice(4, 6), 16) || 199;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    addSubject({
      name,
      nameEn: nameEn || name,
      icon,
      image: subjectImage,
      color,
      bgColor: hexToRgba(color, 0.15),
      borderColor: hexToRgba(color, 0.4)
    });

    setName('');
    setNameEn('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">
      
      {/* Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm text-[#0F172A]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0284C7]">{t('navSubjects')}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {isAr 
                ? "تخصيص كروت المواد الملونة بالكامل إضافة الصور والتصاميم المخصصة لكل مادة."
                : "Manage academic subjects with full-color cards and custom uploaded subject photos."}
            </p>
          </div>
        </div>

        {currentRole === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-mustard flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold shadow cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? "إضافة مادة جديدة +" : "Add New Subject +"}</span>
          </button>
        )}
      </div>

      {/* Full-Color Subjects Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeSubjects.map((sub) => {
          const cardBg = sub.color || '#0284C7';

          return (
            <div
              key={sub.id}
              className="interactive-card rounded-3xl p-6 shadow-xl relative overflow-hidden text-white transition-all transform hover:scale-[1.02] flex flex-col justify-between min-h-[160px]"
              style={{
                backgroundColor: cardBg,
                backgroundImage: `linear-gradient(135deg, ${cardBg} 0%, rgba(0, 0, 0, 0.25) 100%)`
              }}
            >
              {/* Header with Photo Image & Title */}
              <div className="flex items-start justify-between gap-3 z-10">
                <div className="flex items-center gap-3.5">
                  {/* Subject Image Thumbnail */}
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/40 shadow-md bg-white/10 shrink-0">
                    {sub.image ? (
                      <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        {sub.icon || '📚'}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white leading-tight drop-shadow-sm">
                      {isAr ? sub.name : sub.nameEn}
                    </h3>
                    <span className="text-[11px] text-white/80 font-mono block mt-0.5">
                      ID: {sub.id}
                    </span>
                  </div>
                </div>

                {/* Delete Button for Admin */}
                {currentRole === 'admin' && (
                  <button
                    onClick={() => deleteSubject(sub.id)}
                    className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-xl backdrop-blur-md transition-all cursor-pointer border border-white/20"
                    title={t('delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Bottom Footer Badge Tag */}
              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-xl text-xs font-bold shadow-sm">
                  <span>{sub.icon || '📚'}</span>
                  <span>{isAr ? 'مادة أساسية معتمدة' : 'Accredited Subject'}</span>
                </span>

                <span className="text-[10px] text-white/90 font-bold bg-black/20 px-2.5 py-1 rounded-lg">
                  {cardBg}
                </span>
              </div>

              {/* Decorative Subtle Background Circle Glow */}
              <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
            </div>
          );
        })}
      </div>

      {/* Add Subject Modal - Teleported via React Portal directly to document.body */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <form
            onSubmit={handleAddSubmit}
            className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#0284C7]" />
                <span>{isAr ? 'إضافة مادة جديدة بالكامل' : 'Add New Subject'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Subject Image File Upload */}
            <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#0284C7]" />
                <span>{isAr ? 'رفع صورة المادة من جهازك:' : 'Upload subject image:'}</span>
              </label>

              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#0284C7] bg-slate-200 shrink-0">
                  <img src={subjectImage} alt="Subject Preview" className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 space-y-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSubjectImageUpload}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0284C7] file:text-white hover:file:bg-[#0369A1] cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block">{isAr ? 'اختر أي صورة من الكمبيوتر أو الجوال' : 'Select any image file'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'اسم المادة (عربي)' : 'Subject Name (Arabic)'} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: الكيمياء العضوية..."
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'اسم المادة (English)' : 'Subject Name (English)'}</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="Organic Chemistry..."
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'رمز الأيقونة التعبيري' : 'Emoji Icon'}</label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs text-center focus:outline-none"
                />
              </div>

              {/* Color Picker Swatches + Custom Picker */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'لون كرت المادة بالكامل' : 'Full Card Background Color'}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-9 h-9 p-0.5 rounded-xl border border-slate-300 cursor-pointer shrink-0"
                  />
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer"
                  >
                    {presetColors.map((c) => (
                      <option key={c.hex} value={c.hex}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2 btn-mustard rounded-xl text-xs font-bold shadow cursor-pointer"
              >
                {isAr ? 'حفظ واعتمد المادة 💾' : t('save')}
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

    </div>
  );
};
