import React from 'react';
import { useApp } from '../context/AppContext';

export const SubjectBadge = ({ subjectName, subjectId, className = '' }) => {
  const { lang, subjects = [] } = useApp();

  const sub = (subjects || []).find(
    (s) => s.id === subjectId || s.name === subjectName || s.nameEn === subjectName
  );

  const name = sub
    ? lang === 'ar'
      ? sub.name
      : sub.nameEn
    : subjectName || 'المادة';

  const icon = sub?.icon || '📚';
  const color = sub?.color || '#0284C7';
  const bgColor = sub?.bgColor || 'rgba(2, 132, 199, 0.15)';
  const borderColor = sub?.borderColor || 'rgba(2, 132, 199, 0.4)';
  const image = sub?.image || null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shadow-sm ${className}`}
      style={{
        color: color,
        backgroundColor: bgColor,
        borderColor: borderColor
      }}
    >
      {image ? (
        <img src={image} alt={name} className="w-4 h-4 rounded-full object-cover border border-white/60 shrink-0" />
      ) : (
        <span>{icon}</span>
      )}
      <span>{name}</span>
    </span>
  );
};
