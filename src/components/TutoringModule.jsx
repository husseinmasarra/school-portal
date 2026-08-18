import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  GraduationCap, 
  Clock, 
  Users, 
  CheckCircle2, 
  BookOpen, 
  UserPlus 
} from 'lucide-react';

export const TutoringModule = () => {
  const { lang, t, currentRole, tutoringCourses, registerTutoring, students, selectedStudentId } = useApp();

  const isAr = lang === 'ar';
  const [selectedStudentForEnroll, setSelectedStudentForEnroll] = useState(selectedStudentId);
  const [successToast, setSuccessToast] = useState(false);

  // Active student for Parent / Student View
  const currentStudent = students.find((s) => s.id === selectedStudentForEnroll) || students[0];

  const handleEnroll = (courseId) => {
    if (!currentStudent) return;

    registerTutoring(courseId, currentStudent.id);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">
      
      {/* Title Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm text-[#0F172A]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0284C7]">{t('tutoringTitle')}</h2>
            <p className="text-xs text-slate-500 mt-1">{t('tutoringSubtitle')}</p>
          </div>
        </div>

        {/* Student Selector for Enrollment */}
        <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-xl">
          <span className="text-xs text-slate-500 font-medium">{t('studentName')}:</span>
          <select
            value={selectedStudentForEnroll}
            onChange={(e) => setSelectedStudentForEnroll(e.target.value)}
            className="bg-transparent text-xs font-bold text-[#0F172A] focus:outline-none cursor-pointer"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id} className="bg-white text-[#0F172A]">
                {isAr ? s.name : s.nameEn} ({isAr ? s.grade : s.gradeEn})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Success Toast Notification */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 shadow-lg animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <span>{t('registrationSuccess')}</span>
        </div>
      )}

      {/* Interactive Courses Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutoringCourses.map((course) => {
          const isEnrolled = course.enrolledStudentIds.includes(currentStudent?.id);
          const seatsLeft = course.maxSeats - course.enrolledStudentIds.length;

          return (
            <div
              key={course.id}
              className="interactive-card bg-white border border-[#E2E8F0] rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-sm hover:border-[#0284C7]/50 text-[#0F172A]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#0284C7]/10 text-[#0284C7] border border-[#0284C7]/20">
                    {course.subject}
                  </span>
                  <span className="text-xs font-mono font-black text-red-600 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-200">
                    ${course.fee} USD
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#0284C7] leading-snug">
                  {isAr ? course.title : course.titleEn || course.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0]">
                  {course.description}
                </p>

                <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0284C7] shrink-0" />
                    <span>{isAr ? course.days : course.daysEn || course.days}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#0284C7] shrink-0" />
                    <span>{t('instructor')}: <strong className="text-[#0F172A]">{course.instructor}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#0284C7] shrink-0" />
                    <span>{t('availableSeats')}: <strong className="text-[#0284C7]">{seatsLeft} / {course.maxSeats}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100">
                {isEnrolled ? (
                  <div className="w-full py-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{t('registeredAlready')}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEnroll(course.id)}
                    disabled={seatsLeft <= 0}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all shadow cursor-pointer ${
                      seatsLeft <= 0
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'btn-mustard'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isAr ? "التسجيل في الدورة الآن" : "Register Course Now"}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
