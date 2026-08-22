import React from 'react';
import { useApp } from '../context/AppContext';

// Smart Color Palette Generator per Subject Category
const getSubjectColorTheme = (name = '') => {
  const n = (name || '').toLowerCase();
  
  if (n.includes('عرب') || n.includes('لغوي')) {
    return {
      color: '#BE123C', // Rose 700
      bgColor: '#FFE4E6', // Rose 100
      borderColor: '#FDA4AF', // Rose 300
      icon: '📖'
    };
  }
  if (n.includes('رياضيات') || n.includes('حساب') || n.includes('جبر') || n.includes('هندسة')) {
    return {
      color: '#0284C7', // Sky 600
      bgColor: '#E0F2FE', // Sky 100
      borderColor: '#7DD3FC', // Sky 300
      icon: '📐'
    };
  }
  if (n.includes('علوم') || n.includes('فيزياء') || n.includes('كيمياء') || n.includes('احياء')) {
    return {
      color: '#047857', // Emerald 700
      bgColor: '#D1FAE5', // Emerald 100
      borderColor: '#6EE7B7', // Emerald 300
      icon: '🧪'
    };
  }
  if (n.includes('انكليز') || n.includes('إنجليز') || n.includes('english')) {
    return {
      color: '#6D28D9', // Purple 700
      bgColor: '#EDE9FE', // Purple 100
      borderColor: '#C4B5FD', // Purple 300
      icon: '🇬🇧'
    };
  }
  if (n.includes('قرآن') || n.includes('قران') || n.includes('إسلام') || n.includes('دين') || n.includes('تربية دينية')) {
    return {
      color: '#B45309', // Amber 700
      bgColor: '#FEF3C7', // Amber 100
      borderColor: '#FCD34D', // Amber 300
      icon: '🕌'
    };
  }
  if (n.includes('برمج') || n.includes('ذكاء') || n.includes('حاسوب') || n.includes('تقنية') || n.includes('coding')) {
    return {
      color: '#0E7490', // Cyan 700
      bgColor: '#CFFAFE', // Cyan 100
      borderColor: '#67E8F9', // Cyan 300
      icon: '💻'
    };
  }
  if (n.includes('اجتماع') || n.includes('تاريخ') || n.includes('جغرافي') || n.includes('وطني')) {
    return {
      color: '#0F766E', // Teal 700
      bgColor: '#CCFBF1', // Teal 100
      borderColor: '#5EEAD4', // Teal 300
      icon: '🌍'
    };
  }
  if (n.includes('فنون') || n.includes('نشاط') || n.includes('رياضة') || n.includes('رسم')) {
    return {
      color: '#BE185D', // Pink 700
      bgColor: '#FCE7F3', // Pink 100
      borderColor: '#F472B6', // Pink 300
      icon: '🎨'
    };
  }

  return {
    color: '#0284C7',
    bgColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    icon: '📚'
  };
};

export const SubjectBadge = ({ subjectName, subjectId, className = '' }) => {
  const { lang, subjects = [] } = useApp();

  const sub = (subjects || []).find(
    (s) => s.id === subjectId || 
           s.name === subjectName || 
           s.nameEn === subjectName ||
           (s.name && subjectName && (s.name.includes(subjectName) || subjectName.includes(s.name)))
  );

  const fallbackTheme = getSubjectColorTheme(subjectName || sub?.name);

  const name = sub
    ? lang === 'ar'
      ? sub.name
      : sub.nameEn
    : subjectName || 'المادة';

  const icon = sub?.icon || fallbackTheme.icon;
  const color = sub?.color || fallbackTheme.color;
  const bgColor = sub?.bgColor || fallbackTheme.bgColor;
  const borderColor = sub?.borderColor || fallbackTheme.borderColor;
  const image = sub?.image || null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border transition-all shadow-2xs ${className}`}
      style={{
        color: color,
        backgroundColor: bgColor,
        borderColor: borderColor
      }}
    >
      {image ? (
        <img src={image} alt={name} className="w-4 h-4 rounded-full object-cover border border-white/60 shrink-0" />
      ) : (
        <span className="text-xs">{icon}</span>
      )}
      <span>{name}</span>
    </span>
  );
};
