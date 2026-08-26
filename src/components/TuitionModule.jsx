import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { exportToExcelCSV, openWhatsAppMessage } from '../utils/exportUtils';
import { 
  CreditCard, 
  Receipt, 
  CheckCircle2, 
  Printer, 
  DollarSign, 
  Send,
  Plus,
  Calendar,
  Trash2,
  Check,
  X,
  Search
} from 'lucide-react';

export const TuitionModule = () => {
  const { lang, t, currentRole, students = [], payTuition, selectedStudentId, addMessage, siteSettings } = useApp();

  const isAr = lang === 'ar';
  const safeStudents = students || [];

  // Read exchange rate from settings, fallback 89500
  const LBP_RATE = Number(siteSettings?.exchangeRate) || 89500;

  // Payment History Log State (stored in localStorage)
  const [paymentHistory, setPaymentHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('school_payment_history') || '{}'); }
    catch { return {}; }
  });

  // Sent Reminders Tracker State (stored in localStorage)
  const [sentReminders, setSentReminders] = useState(() => {
    try { return JSON.parse(localStorage.getItem('school_sent_reminders') || '{}'); }
    catch { return {}; }
  });

  // Financial Search Query State
  const [tuitionSearchQuery, setTuitionSearchQuery] = useState('');

  const filteredStudents = safeStudents.filter((stu) => {
    if (!tuitionSearchQuery.trim()) return true;
    const q = tuitionSearchQuery.toLowerCase().trim();
    const nameMatch = (stu.name || '').toLowerCase().includes(q) || (stu.nameEn || '').toLowerCase().includes(q);
    const parentNameMatch = (stu.parentName || '').toLowerCase().includes(q);
    const phoneMatch = (stu.parentPhone || '').includes(q) || (stu.phone || '').includes(q);
    const gradeMatch = (stu.grade || '').toLowerCase().includes(q);
    const idMatch = (stu.id || '').toLowerCase().includes(q);
    return nameMatch || parentNameMatch || phoneMatch || gradeMatch || idMatch;
  });

  // Modal States
  const [selectedStudentForPay, setSelectedStudentForPay] = useState(null); // student obj for direct payment
  const [payAmount, setPayAmount] = useState('');
  const [payDesc, setPayDesc]     = useState('دفعة من القسط المدرسي');
  const [payMethod, setPayMethod] = useState('fresh_cash');

  const [showReceiptModal, setShowReceiptModal] = useState(null);
  const [successToast, setSuccessToast] = useState(false);

  // Toggle body class when receipt modal is active to hide main page content on print
  React.useEffect(() => {
    if (showReceiptModal) {
      document.body.classList.add('has-print-portal');
    } else {
      document.body.classList.remove('has-print-portal');
    }
    return () => {
      document.body.classList.remove('has-print-portal');
    };
  }, [showReceiptModal]);

  // Active student for Parent / Student View
  const currentStudent = safeStudents.find((s) => s.id === selectedStudentId) || safeStudents[0];
  const isOverduePeriod = new Date().getDate() > 5;

  // Admin Financial Metrics in USD (Frozen accounts are excluded from active overdue dues)
  const activeStudents = safeStudents.filter((s) => !s?.frozen);
  const totalTuitionUSD   = safeStudents.reduce((sum, s) => sum + (Number(s?.tuitionTotal) || 600), 0);
  const totalAdminFeesUSD = safeStudents.reduce((sum, s) => sum + (Number(s?.adminFees) || 0), 0);
  const totalTransportFeesUSD = safeStudents.reduce((sum, s) => sum + (s?.hasTransport ? (Number(s?.transportFee) || 0) : 0), 0);
  const totalDiscountUSD  = safeStudents.reduce((sum, s) => sum + (Number(s?.tuitionDiscount) || 0), 0);
  const totalPaidUSD      = safeStudents.reduce((sum, s) => sum + (Number(s?.tuitionPaid) || 0), 0);
  
  // Total overdue dues only includes active non-frozen students
  const totalRemainingUSD = activeStudents.reduce((sum, s) => {
    const tot = Number(s.tuitionTotal) || 600;
    const adm = Number(s.adminFees) || 0;
    const trs = s.hasTransport ? (Number(s.transportFee) || 0) : 0;
    const disc = Number(s.tuitionDiscount) || 0;
    const paid = Number(s.tuitionPaid) || 0;
    return sum + Math.max(0, tot + adm + trs - disc - paid);
  }, 0);

  const savePaymentHistory = (updated) => {
    setPaymentHistory(updated);
    localStorage.setItem('school_payment_history', JSON.stringify(updated));
  };

  // ── Direct Payment Handler (Immediate Deduction) ──────────────────────
  const handleDirectPaySubmit = (e) => {
    e.preventDefault();
    if (!selectedStudentForPay || !payAmount || Number(payAmount) <= 0) return;

    const amountUSD = Number(payAmount);
    const stuId = selectedStudentForPay.id;

    // 1. Deduct immediately in AppContext (updates tuitionPaid and persists)
    payTuition(stuId, amountUSD, payMethod);

    // 2. Save entry to payment history log for this student
    const existingHistory = paymentHistory[stuId] || [];
    const newEntry = {
      id: `PAY-${Date.now()}`,
      amount: amountUSD,
      date: new Date().toISOString().split('T')[0],
      desc: payDesc || 'دفعة مالية',
      method: payMethod
    };
    const updatedHistory = {
      ...paymentHistory,
      [stuId]: [newEntry, ...existingHistory]
    };
    savePaymentHistory(updatedHistory);

    // 3. Compute new remaining amount for the receipt
    const totalTuition = Number(selectedStudentForPay.tuitionTotal) || 600;
    const adminFees = Number(selectedStudentForPay.adminFees) || 0;
    const transportFee = selectedStudentForPay.hasTransport ? (Number(selectedStudentForPay.transportFee) || 0) : 0;
    const discount = Number(selectedStudentForPay.tuitionDiscount) || 0;
    const oldPaid = Number(selectedStudentForPay.tuitionPaid) || 0;
    const newPaid = oldPaid + amountUSD;
    const remainingUSD = Math.max(0, totalTuition + adminFees + transportFee - discount - newPaid);

    // 4. Get active siblings for this family so all student names appear on the receipt
    const phoneKey = (selectedStudentForPay.parentPhone || selectedStudentForPay.phone || selectedStudentForPay.id).trim();
    const familySiblings = safeStudents.filter(s => {
      if (!s.parentPhone && !selectedStudentForPay.parentPhone) return s.id === selectedStudentForPay.id;
      return s.parentPhone && s.parentPhone.trim() === phoneKey;
    });

    const allStudentNames = familySiblings.length > 0
      ? familySiblings.map(s => isAr ? s.name : (s.nameEn || s.name)).join(' • ')
      : (isAr ? selectedStudentForPay.name : selectedStudentForPay.nameEn);

    const isMultiSib = familySiblings.length > 1;
    const parentNameVal = selectedStudentForPay.parentName || `عائلة ${selectedStudentForPay.name.split(' ').slice(-1)[0]}`;

    // 5. Open official receipt modal
    const receipt = {
      receiptNo: `REC-LB-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      parentName: parentNameVal,
      studentName: allStudentNames,
      grade: isMultiSib ? `عائلة (${familySiblings.length} إخوة)` : (isAr ? selectedStudentForPay.grade : selectedStudentForPay.gradeEn),
      amountUSD: amountUSD,
      amountLBP: 0,
      method: payMethod,
      remainingUSD: remainingUSD
    };

    setPayAmount('');
    setPayDesc('دفعة من القسط المدرسي');
    setSelectedStudentForPay(null);
    setShowReceiptModal(receipt);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 4000);
  };

  const handleDeleteHistoryEntry = (stuId, entryId, amount) => {
    const existingHistory = paymentHistory[stuId] || [];
    const updatedHistory = {
      ...paymentHistory,
      [stuId]: existingHistory.filter(e => e.id !== entryId)
    };
    savePaymentHistory(updatedHistory);
  };

  const handleSendIndividualReminder = (stu) => {
    const totalUSD = Number(stu.tuitionTotal) || 600;
    const adminUSD = Number(stu.adminFees) || 0;
    const transportUSD = stu.hasTransport ? (Number(stu.transportFee) || 0) : 0;
    const discountUSD = Number(stu.tuitionDiscount) || 0;
    const paidUSD = Number(stu.tuitionPaid) || 0;
    const remUSD = Math.max(0, totalUSD + adminUSD + transportUSD - discountUSD - paidUSD);

    addMessage({
      title: `تذكير مالي - قسط الطالب ${stu.name} ($ USD)`,
      titleEn: `Financial Reminder - Tuition for ${stu.nameEn} ($ USD)`,
      content: `نود تذكيركم بوجود قسط متبقي بقيمة $${remUSD.toLocaleString()} USD. نرجو السداد عبر Fresh USD أو OMT / Whish.`,
      contentEn: `Reminder: Student remaining tuition balance is $${remUSD.toLocaleString()} USD. Please settle via Fresh USD or OMT / Whish.`,
      targetType: 'student',
      targetValue: stu.name,
      category: 'financial',
      priority: 'urgent'
    });
    alert(isAr ? 'تم إرسال مطالبة مالية خاصة بالدولار لولي الأمر!' : 'Sent individual USD tuition reminder!');
  };

  const handleSendWhatsAppReminder = (stu) => {
    const phoneKey = (stu.parentPhone || stu.phone || stu.id).trim();
    const parentPhone = stu.parentPhone || stu.phone || '+961 70 000 000';

    const familyMembers = safeStudents.filter(s => {
      if (!s.parentPhone && !stu.parentPhone) return s.id === stu.id;
      return s.parentPhone && s.parentPhone.trim() === phoneKey;
    });

    const isMulti = familyMembers.length > 1;
    const familyName = stu.parentName || (isMulti ? `عائلة ${stu.name.split(' ').slice(-1)[0]}` : (isAr ? stu.name : stu.nameEn));

    const msg = isAr
      ? `الى ولي امر التلميذ ( ${familyName} ) نود تذكيركم بضرورة تسديد القسط الشهري المستحق يرجى التسديد في اقرب وقت شاكرين تعاونكم الكريم`
      : `To the parent of (${familyName}), we kindly remind you to settle the due monthly tuition payment at your earliest convenience. Thank you for your cooperation!`;

    const nowTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    setSentReminders((prev) => {
      const updated = { ...prev, [phoneKey]: nowTime };
      localStorage.setItem('school_sent_reminders', JSON.stringify(updated));
      return updated;
    });

    openWhatsAppMessage(parentPhone, msg);
  };

  const handleExportTuitionExcel = () => {
    const headers = [
      'معرف الطالب',
      'اسم الطالب',
      'الصف والدراسة',
      'القسط الأساسي ($ USD)',
      'الخصومات ($ USD)',
      'المصاريف الإدارية ($ USD)',
      'المبلغ المقبوض ($ USD)',
      'المتبقي المستحق ($ USD)',
      'اسم ولي الأمر',
      'هاتف ولي الأمر',
      'حالة القسط'
    ];

    const dataRows = safeStudents.map(s => {
      const total = Number(s.tuitionTotal || 600);
      const adminFees = Number(s.adminFees || 0);
      const transportFee = s.hasTransport ? (Number(s.transportFee) || 0) : 0;
      const discount = Number(s.tuitionDiscount || 0);
      const paid = Number(s.tuitionPaid || 0);
      const remaining = Math.max(0, total + adminFees + transportFee - discount - paid);
      const status = remaining === 0 ? 'مسدد بالكامل' : 'يوجد قسط متبقي';
      return [
        s.id,
        isAr ? s.name : s.nameEn,
        `${isAr ? s.grade : s.gradeEn} (${s.classRoom})`,
        total,
        discount,
        paid,
        remaining,
        s.parentName || 'غير مححدد',
        s.parentPhone || 'غير محدد',
        status
      ];
    });

    exportToExcelCSV(`kashf-aqsat-${new Date().toISOString().slice(0,10)}.csv`, headers, dataRows);
  };

  const handleSendWhatsAppReceipt = (stuName, parentPhone, amountPaid, remainingUSD) => {
    const msg = isAr
      ? `مرحباً ولي أمر الطالب (${stuName}) 🌸\nنود إعلامكم باستلام دفعة مالية بقيمة $${amountPaid} USD من القسط المدرسي.\nالمتبقي المستحق: $${remainingUSD} USD.\nشكراً لتعاونكم مع مدرسة الدعم التعليمي.`
      : `Dear parent of ${stuName}, we received tuition payment of $${amountPaid} USD. Remaining balance: $${remainingUSD} USD. Thank you!`;
    
    openWhatsAppMessage(parentPhone || '+961 70 000 000', msg);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">

      {/* Title Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm text-[#0F172A]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0284C7]">{t('tuitionTitle')}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {isAr 
                ? "إدخال الدفعات وسداد الأقساط بالدولار مع الخصم المباشر والإصدار الآلي للإيصالات الرسمية."
                : "Record student tuition payments with instant balance deduction & official receipt generation."}
            </p>
          </div>
        </div>

        {/* Financial Metrics + Exchange Rate Banner */}
        {currentRole === 'admin' && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportTuitionExcel}
              className="btn-mustard px-4 py-2 rounded-2xl text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer transition-all"
              title="تصدير جدول كافة الأقساط كملف اكسل"
            >
              <span>تصدير كشف الأقساط Excel 📊</span>
            </button>

            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-3 bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-2 rounded-2xl">
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">{t('remainingAmount')} الإجمالي</span>
                  <span className="text-sm font-extrabold text-[#0284C7] font-mono">${totalRemainingUSD.toLocaleString()} USD</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Success Notification Toast */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 shadow-lg animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <span>{t('paymentSuccess')} — تم خصم الدفعة من المتبقي فوراً!</span>
        </div>
      )}

      {/* Student View: Current Student Tuition Card */}
      {(currentRole === 'student' || currentRole === 'parent') && currentStudent && (
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-6 shadow-sm text-[#0F172A] relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#0284C7]">
                {isAr ? currentStudent.name : currentStudent.nameEn}
              </h3>
              <p className="text-xs text-slate-500">
                {isAr ? currentStudent.grade : currentStudent.gradeEn} | ID: {currentStudent.id}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {currentRole !== 'student' && (
                <button
                  onClick={() => {
                    const transportFee = currentStudent.hasTransport ? (Number(currentStudent.transportFee) || 0) : 0;
                    const receipt = {
                      receiptNo: `REC-LB-${Date.now().toString().slice(-6)}`,
                      date: new Date().toISOString().split('T')[0],
                      studentName: isAr ? currentStudent.name : currentStudent.nameEn,
                      grade: isAr ? currentStudent.grade : currentStudent.gradeEn,
                      amountUSD: currentStudent.tuitionPaid,
                      amountLBP: 0,
                      method: 'fresh_cash',
                      remainingUSD: Math.max(0, (currentStudent.tuitionTotal || 600) + (currentStudent.adminFees || 0) + transportFee - (currentStudent.tuitionDiscount || 0) - (currentStudent.tuitionPaid || 0))
                    };
                    setShowReceiptModal(receipt);
                  }}
                  className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-[#0284C7] border border-sky-200 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-[#0284C7]" />
                  <span>طباعة الإيصال 🖨️</span>
                </button>
              )}

              <button
                onClick={() => setSelectedStudentForPay(currentStudent)}
                className="btn-mustard flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                <span>تسديد دفعة مالية 💰</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <span className="text-xs text-slate-500 block">{t('totalTuition')}</span>
              <span className="text-xl font-black text-[#0F172A] mt-1 block font-mono">${(currentStudent.tuitionTotal || 600).toLocaleString()} USD</span>
            </div>
            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <span className="text-xs text-slate-500 block">{isAr ? 'رسوم النقل' : 'Bus Fee'}</span>
              <span className="text-xl font-black text-sky-600 mt-1 block font-mono">${(currentStudent.hasTransport ? (Number(currentStudent.transportFee) || 0) : 0).toLocaleString()} USD</span>
            </div>
            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <span className="text-xs text-slate-500 block">{isAr ? 'المصاريف الإدارية' : 'Admin Fees'}</span>
              <span className="text-xl font-black text-amber-600 mt-1 block font-mono">+${(currentStudent.adminFees || 0).toLocaleString()} USD</span>
            </div>
            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <span className="text-xs text-slate-500 block">{isAr ? 'الخصومات والمنح' : 'Discounts'}</span>
              <span className="text-xl font-black text-emerald-600 mt-1 block font-mono">-${(currentStudent.tuitionDiscount || 0).toLocaleString()} USD</span>
            </div>
            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <span className="text-xs text-slate-500 block">{t('paidAmount')}</span>
              <span className="text-xl font-black text-[#0284C7] mt-1 block font-mono">${(currentStudent.tuitionPaid || 0).toLocaleString()} USD</span>
            </div>
            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-red-300">
              <span className="text-xs text-red-600 block font-bold">{t('remainingAmount')}</span>
              <span className="text-xl font-black text-red-600 mt-1 block font-mono">${Math.max(0, (currentStudent.tuitionTotal || 600) + (currentStudent.adminFees || 0) + (currentStudent.hasTransport ? (Number(currentStudent.transportFee) || 0) : 0) - (currentStudent.tuitionDiscount || 0) - (currentStudent.tuitionPaid || 0)).toLocaleString()} USD</span>
            </div>
          </div>
        </div>
      )}

      {/* Admin View: All Students Tuition Roster Grid */}
      {currentRole === 'admin' && (
        <div className="space-y-6">
          {/* Overdue Tuition Warning Block (Visible after the 5th of the month for unpaid accounts) */}
          {isOverduePeriod && (() => {
            const globalOverduePhones = new Set();
            const overdueCards = safeStudents.map((primaryStu) => {
              const phoneKey = (primaryStu.parentPhone || primaryStu.phone || primaryStu.id).trim();
              if (globalOverduePhones.has(phoneKey)) return null;
              globalOverduePhones.add(phoneKey);

              // Find ALL family members registered under this parent phone
              const familyMembers = safeStudents.filter(s => {
                if (!s.parentPhone && !primaryStu.parentPhone) return s.id === primaryStu.id;
                return s.parentPhone && s.parentPhone.trim() === phoneKey;
              });

              // Active (non-frozen) family members
              const activeFamilyMembers = familyMembers.filter(s => !s.frozen);
              if (activeFamilyMembers.length === 0) return null;

              // Calculate combined remaining overdue dues
              const totalUSD    = activeFamilyMembers.reduce((sum, s) => sum + (Number(s.tuitionTotal) || 600) + (s.hasTransport ? (Number(s.transportFee) || 0) : 0), 0);
              const adminUSD    = activeFamilyMembers.reduce((sum, s) => sum + (Number(s.adminFees) || 0), 0);
              const discountUSD = activeFamilyMembers.reduce((sum, s) => sum + (Number(s.tuitionDiscount) || 0), 0);
              const paidUSD     = activeFamilyMembers.reduce((sum, s) => sum + (Number(s.tuitionPaid) || 0), 0);
              const remUSD      = Math.max(0, Math.round((totalUSD + adminUSD - discountUSD - paidUSD) * 100) / 100);

              // Check if active family members have paid ANY installment in the current month (e.g. "2026-08")
              const currentYearMonth = new Date().toISOString().slice(0, 7);
              const activeFamilyHistory = activeFamilyMembers.reduce((acc, s) => {
                const sHist = paymentHistory[s.id] || [];
                return [...acc, ...sHist];
              }, []);

              const hasPaidThisMonth = activeFamilyHistory.some(entry => entry.date && entry.date.startsWith(currentYearMonth));

              // Hide from overdue list if fully paid OR if a payment/installment was already submitted in the current month!
              if (remUSD <= 0.01 || hasPaidThisMonth) return null;

              const isMulti = familyMembers.length > 1;
              const familyName = primaryStu.parentName || `عائلة ${primaryStu.name.split(' ').slice(-1)[0]}`;
              const isReminderSent = Boolean(sentReminders[phoneKey]);
              const sentTime = sentReminders[phoneKey];

              return (
                <div 
                  key={primaryStu.id} 
                  className={`p-3 rounded-2xl flex items-center justify-between shadow-xs transition-all border ${
                    isReminderSent 
                      ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-700 ring-1 ring-emerald-400/30' 
                      : 'bg-white dark:bg-slate-900 border-red-200 dark:border-red-950/50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-9 h-9 rounded-2xl font-black text-xs flex items-center justify-center shrink-0 border shadow-xs ${
                      isReminderSent
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : isMulti ? 'bg-amber-500 text-white border-amber-600' : 'bg-red-100 text-red-700 border-red-300'
                    }`}>
                      {isReminderSent ? '✓' : isMulti ? '👨‍👩‍👧‍👦' : (primaryStu.name || 'ط')[0]}
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1">
                        <span>{isMulti ? familyName : (isAr ? primaryStu.name : primaryStu.nameEn)}</span>
                      </h4>
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] text-red-500 font-extrabold font-mono block">
                          ${remUSD} USD {isMulti ? `(${familyMembers.length} إخوة)` : ''}
                        </span>
                        {isReminderSent && (
                          <span className="text-[9px] text-emerald-700 font-black bg-emerald-100 px-1.5 py-0.2 rounded-full border border-emerald-300 animate-fade-in">
                            تم التذكير ({sentTime}) 🟢
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendWhatsAppReminder(primaryStu)}
                    className={`py-1.5 px-2.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1 shrink-0 cursor-pointer transition-all border ${
                      isReminderSent 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-xs' 
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
                    }`}
                    title={isReminderSent ? `تم إرسال تذكير في ${sentTime} (اضغط لإعادة الإرسال)` : 'إرسال تذكير مالي بالواتساب للعائلة'}
                  >
                    <span>{isReminderSent ? 'تم التذكير 🟢' : 'تذكير 📲'}</span>
                  </button>
                </div>
              );
            }).filter(Boolean);

            if (overdueCards.length === 0) return null; // Entire overdue block hides when no overdue families exist!

            return (
              <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800/40 p-5 rounded-3xl space-y-4">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <h3 className="text-sm font-black">{isAr ? `قائمة الذمم والأقساط المتأخرة المستحقة (${overdueCards.length})` : `Overdue Tuition Dues List (${overdueCards.length})`}</h3>
                    <p className="text-[10px] text-slate-500 font-bold">{isAr ? 'تظهر هذه القائمة تلقائياً لوجود مستحقات مالية غير مسددة بعد تاريخ 5 من الشهر الجاري.' : 'List of students with remaining tuition due after the 5th of this month.'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {overdueCards}
                </div>
              </div>
            );
          })()}

          <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm text-[#0F172A]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7]">
                {isAr ? 'كشف كافة أقساط الطلاب والدفعات المباشرة' : 'Student Tuition Roster & Direct Payments'}
              </h3>

              {/* 🔍 Financial Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tuitionSearchQuery}
                  onChange={(e) => setTuitionSearchQuery(e.target.value)}
                  placeholder={isAr ? "بحث باسم الطالب، ولي الأمر، الصف، أو الهاتف..." : "Search student, parent, grade, or phone..."}
                  className="w-full pr-9 pl-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] transition-all"
                />
                {tuitionSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setTuitionSearchQuery('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-10 text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{isAr ? `لا توجد نتائج بحث مطابقة لـ "${tuitionSearchQuery}"` : `No tuition records found for "${tuitionSearchQuery}"`}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
            {(() => {
              const globalRenderedPhones = new Set();

              return filteredStudents.map((primaryStu) => {
                const phoneKey = (primaryStu.parentPhone || primaryStu.phone || primaryStu.id).trim();
                if (globalRenderedPhones.has(phoneKey)) return null;
                globalRenderedPhones.add(phoneKey);

                // Find ALL family members registered under this parent phone
                const familyMembers = safeStudents.filter(s => {
                  if (!s.parentPhone && !primaryStu.parentPhone) return s.id === primaryStu.id;
                  return s.parentPhone && s.parentPhone.trim() === phoneKey;
                });

                const isMultiSiblingFamily = familyMembers.length > 1;

                // Active (non-frozen) family members for active dues calculations
                const activeFamilyMembers = familyMembers.filter(s => !s.frozen);

                // Calculate Combined Financial Totals ONLY for active (non-frozen) family members
                const totalUSD = activeFamilyMembers.reduce((sum, s) => {
                  const trans = s.hasTransport ? (Number(s.transportFee) || 0) : 0;
                  return sum + (Number(s.tuitionTotal) || 600) + trans;
                }, 0);

                const adminUSD    = activeFamilyMembers.reduce((sum, s) => sum + (Number(s.adminFees) || 0), 0);
                const discountUSD = activeFamilyMembers.reduce((sum, s) => sum + (Number(s.tuitionDiscount) || 0), 0);
                const paidUSD     = activeFamilyMembers.reduce((sum, s) => sum + (Number(s.tuitionPaid) || 0), 0);
                const remUSD      = Math.max(0, totalUSD + adminUSD - discountUSD - paidUSD);

                const familyName = primaryStu.parentName || `عائلة ${primaryStu.name.split(' ').slice(-1)[0]}`;
                const parentPhone = primaryStu.parentPhone || primaryStu.phone || 'غير مسجل';

                // Consolidated Payment History Log across all family members
                const history = familyMembers.reduce((acc, s) => {
                  const sHist = paymentHistory[s.id] || [];
                  return [...acc, ...sHist];
                }, []);

                return (
                  <div 
                    key={primaryStu.id} 
                    className={`bg-[#F8FAFC] border-2 p-4.5 rounded-3xl shadow-xs transition-all relative flex flex-col justify-between hover:shadow-md ${
                      isMultiSiblingFamily 
                        ? 'border-amber-400/80 bg-gradient-to-b from-amber-50/20 via-white to-white ring-1 ring-amber-400/20' 
                        : 'border-[#E2E8F0] hover:border-[#0284C7]/50'
                    }`}
                  >
                    {/* Family / Student Header */}
                    <div className="space-y-3 shrink-0">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-9 h-9 rounded-2xl font-black text-xs flex items-center justify-center shrink-0 shadow-xs ${
                            isMultiSiblingFamily ? 'bg-amber-500 text-white' : 'bg-[#0284C7] text-white'
                          }`}>
                            {isMultiSiblingFamily ? '👨‍👩‍👧‍👦' : (primaryStu.name || 'ط')[0]}
                          </div>
                          <div className="truncate">
                            <h4 className="text-xs font-black text-[#0F172A] truncate flex items-center gap-1.5">
                              <span>{isMultiSiblingFamily ? familyName : (isAr ? primaryStu.name : primaryStu.nameEn)}</span>
                            </h4>
                            <span className="text-[10px] text-slate-500 font-mono block">
                              📞 {parentPhone}
                            </span>
                          </div>
                        </div>

                        {/* Distinct Visual Badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 border ${
                          isMultiSiblingFamily 
                            ? 'bg-amber-100 text-amber-800 border-amber-300' 
                            : remUSD === 0 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                            : 'bg-red-50 text-red-700 border-red-300'
                        }`}>
                          {isMultiSiblingFamily ? `👥 عائلة (${familyMembers.length} إخوة)` : remUSD === 0 ? (isAr ? '✅ مسدد' : '✅ Paid') : `$${remUSD} USD`}
                        </span>
                      </div>

                      {/* Financial Figures Box */}
                      <div className="text-xs space-y-1 bg-white p-3 rounded-2xl border border-slate-200 font-mono text-right shadow-2xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">{isMultiSiblingFamily ? 'إجمالي أقساط العائلة:' : t('totalTuition')}:</span>
                          <span className="font-bold text-[#0F172A]">${totalUSD} USD</span>
                        </div>
                        {adminUSD > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-sans">{isAr ? 'المصاريف الإدارية:' : 'Admin Fees:'}</span>
                            <span className="font-bold text-amber-600">+${adminUSD} USD</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">{isAr ? 'الخصومات الممنوحة:' : 'Discount:'}</span>
                          <span className="font-bold text-emerald-600">-${discountUSD} USD</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">{t('paidAmount')}:</span>
                          <span className="font-extrabold text-[#0284C7]">${paidUSD} USD</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-1.5">
                          <span className="text-red-500 font-sans font-bold">{t('remainingAmount')}:</span>
                          <span className="font-black text-red-600 text-sm">${remUSD} USD</span>
                        </div>
                      </div>
                    </div>

                    {/* Sibling Members Breakdown (if multi-sibling) */}
                    {isMultiSiblingFamily && (
                      <div className="space-y-1.5 my-2.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                        <span className="text-[10px] font-black text-slate-500 block">
                          🎒 طلاب العائلة المدرجون ({familyMembers.length}):
                        </span>
                        {familyMembers.map((sib) => {
                          const sTot = Number(sib.tuitionTotal) || 600;
                          const sDis = Number(sib.tuitionDiscount) || 0;
                          const sPaid = Number(sib.tuitionPaid) || 0;
                          const sRem = Math.max(0, sTot - sDis - sPaid);
                          return (
                            <div key={sib.id} className="bg-white border border-slate-200 p-2 rounded-xl text-[10px] flex items-center justify-between">
                              <div>
                                <span className="font-bold text-[#0F172A] block">{sib.name} ({sib.grade})</span>
                                <span className="text-[9px] text-slate-400 font-mono">
                                  مدفوع: ${sPaid} {sib.frozen ? '(مجمّد لحسابه)' : ''} • متبقي: ${sib.frozen ? 0 : sRem}
                                </span>
                              </div>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                sib.frozen ? 'bg-cyan-100 text-cyan-800 border border-cyan-300' : sRem === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                              }`}>
                                {sib.frozen ? '❄️ مجمد (لا يُخصم مدفوعه من الإخوة)' : sRem === 0 ? '✅ مسدد' : `$${sRem}`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Payment History Log */}
                    {history.length > 0 && (
                      <div className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-1.5 max-h-28 overflow-y-auto my-2">
                        <p className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> سجل الدفعات المسددة ({history.length})
                        </p>
                        {history.map((entry) => (
                          <div key={entry.id} className="flex items-center justify-between text-[10px] px-2 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                            <div>
                              <span className="font-bold block">{entry.desc} — ${entry.amount} USD</span>
                              <span className="text-[9px] text-emerald-600">{entry.date} • {entry.method === 'fresh_cash' ? 'نقداً' : 'تحويل'}</span>
                            </div>
                            <button onClick={() => handleDeleteHistoryEntry(primaryStu.id, entry.id, entry.amount)}
                              className="text-emerald-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="حذف القيد">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 gap-1.5 flex-wrap shrink-0">
                      <button onClick={() => {
                        const allStudentNames = familyMembers.map(s => isAr ? s.name : (s.nameEn || s.name)).join(' • ');
                        handleSendWhatsAppReceipt(allStudentNames, parentPhone, paidUSD, remUSD);
                      }}
                        className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                        title="إرسال إشعار استلام مالي بالواتساب لولي الأمر">
                        <span>واتساب إيصال 📲</span>
                      </button>

                      <button onClick={() => handleSendWhatsAppReminder(primaryStu)}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all border ${
                          sentReminders[phoneKey]
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-xs'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                        }`}
                        title={sentReminders[phoneKey] ? `تم التذكير في ${sentReminders[phoneKey]} (اضغط لإعادة الإرسال)` : 'إرسال رسالة تذكير مالي بالواتساب لولي الأمر'}>
                        <span>{sentReminders[phoneKey] ? 'تم التذكير 🟢' : 'واتساب تذكير 📲'}</span>
                      </button>

                      <button onClick={() => {
                        const allStudentNames = familyMembers.map(s => isAr ? s.name : (s.nameEn || s.name)).join(' • ');
                        const receipt = {
                          receiptNo: `REC-LB-${Date.now().toString().slice(-6)}`,
                          date: new Date().toISOString().split('T')[0],
                          parentName: familyName,
                          studentName: allStudentNames,
                          grade: isMultiSiblingFamily ? `عائلة (${familyMembers.length} إخوة)` : (isAr ? primaryStu.grade : primaryStu.gradeEn),
                          amountUSD: paidUSD,
                          amountLBP: 0,
                          method: 'fresh_cash',
                          remainingUSD: remUSD
                        };
                        setShowReceiptModal(receipt);
                      }}
                        className="py-1.5 px-2.5 bg-sky-50 hover:bg-sky-100 text-[#0284C7] border border-sky-200 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-sm">
                        <Printer className="w-3.5 h-3.5 text-[#0284C7]" />
                        <span>الإيصال 🖨️</span>
                      </button>

                      <button onClick={() => setSelectedStudentForPay(primaryStu)}
                        className="btn-mustard py-1.5 px-3 rounded-xl text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>إدخال دفعة 💰</span>
                      </button>
                    </div>
                  </div>
                );
              }).filter(Boolean);
            })()}
          </div>
        </div>
      </div>
      )}

      {/* ── Direct Payment Modal (Immediate Deduction) ─────────────────────────── */}
      {selectedStudentForPay && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleDirectPaySubmit}
            className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#0284C7]" />
                <span>إدخال دفعة وتسديد مباشر — {isAr ? selectedStudentForPay.name : selectedStudentForPay.nameEn}</span>
              </h3>
              <button type="button" onClick={() => setSelectedStudentForPay(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer">✕</button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">المبلغ المدفوع ($ USD) <span className="text-red-500">*</span></label>
              <input type="number" required min="1"
                max={Math.max(1, (selectedStudentForPay.tuitionTotal || 600) - (selectedStudentForPay.tuitionPaid || 0))}
                value={payAmount} onChange={(e) => setPayAmount(e.target.value)}
                placeholder="مثال: 100 أو 200..."
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#0284C7]" />
              {payAmount && (
                <span className="text-[10px] text-[#0284C7] font-mono font-bold block pt-0.5">
                  ⚡ سيتم الخصم مباشرة من المبلغ المتبقي المستحق!
                </span>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">بيان / وصف الدفعة</label>
              <input type="text" value={payDesc} onChange={(e) => setPayDesc(e.target.value)}
                placeholder="مثال: الدفعة الأولى - قسط شهر 7..."
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{t('paymentMethod')}</label>
              <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold">
                <option value="fresh_cash">💵 Fresh Cash USD (نقداً بالمدرسة)</option>
                <option value="omt">📲 OMT / Whish Money (تحويل مالي)</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setSelectedStudentForPay(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">{t('cancel')}</button>
              <button type="submit" className="btn-mustard px-5 py-2.5 rounded-xl text-xs font-bold shadow cursor-pointer flex items-center gap-1.5">
                <Check className="w-4 h-4" /> تأكيد خصم الدفعة والإيصال 🧾
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* ── Receipt Modal (Guaranteed 1 Page Print) ─────────────────────────── */}
      {showReceiptModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-start justify-center p-4 sm:p-6 overflow-y-auto receipt-print-backdrop">
          <div className="receipt-printable-card bg-white text-slate-900 rounded-3xl p-5 sm:p-7 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up relative border-0">
            
            <style>{`
              /* On Screen Styles: Force Solid White Card Preview */
              @media screen {
                .receipt-printable-card, html.dark .receipt-printable-card {
                  background-color: #ffffff !important;
                  background: #ffffff !important;
                  color: #0f172a !important;
                  border: none !important;
                }

                .receipt-details-box, html.dark .receipt-details-box {
                  background-color: #f8fafc !important;
                  background: #f8fafc !important;
                  border: 1px solid #cbd5e1 !important;
                }

                .receipt-details-box span {
                  color: #334155 !important;
                }

                .receipt-stamp-badge, html.dark .receipt-stamp-badge {
                  background-color: rgba(2, 132, 199, 0.08) !important;
                  color: #0284c7 !important;
                  border-color: rgba(2, 132, 199, 0.3) !important;
                }
              }

              /* Clean Reset & Print-Only Styles (Starts at absolute top of paper) */
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
                  height: auto !important;
                  width: 100% !important;
                }

                body > #root {
                  display: none !important;
                }

                .receipt-print-backdrop {
                  all: unset !important;
                  display: block !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  background: #ffffff !important;
                }

                .receipt-printable-card {
                  all: unset !important;
                  display: block !important;
                  margin: 0 auto !important;
                  padding: 14px 18px !important;
                  width: 94% !important;
                  max-width: 480px !important;
                  border: none !important;
                  background: #ffffff !important;
                  color: #000000 !important;
                  box-sizing: border-box !important;
                  border-radius: 0px !important;
                }

                .receipt-details-box {
                  background: transparent !important;
                  background-color: transparent !important;
                  border: 1px solid #000000 !important;
                }

                /* Force absolute black text and transparent background on all inner elements */
                .receipt-printable-card div,
                .receipt-printable-card span,
                .receipt-printable-card p,
                .receipt-printable-card h3,
                .receipt-printable-card img {
                  color: #000000 !important;
                  background: transparent !important;
                  background-color: transparent !important;
                }
                
                .receipt-printable-card div, .receipt-printable-card span {
                  border-color: #000000 !important;
                }

                .receipt-stamp-badge {
                  background: transparent !important;
                  background-color: transparent !important;
                  color: #000000 !important;
                  border-color: #000000 !important;
                }

                .no-print {
                  display: none !important;
                }
              }
            `}</style>
            
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center border border-[#0284C7] shadow-sm overflow-hidden shrink-0">
                  <img src="/emblem.png" alt="Logo" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#0284C7] leading-tight">
                    {isAr ? (siteSettings?.schoolName || 'مدرسة الدعم التعليمي') : (siteSettings?.schoolNameEn || 'Educational Support School')}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-bold block">إيصال استلام مالي رسمي • Official Payment Receipt</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => {
                  const bd = document.querySelector('.receipt-print-backdrop');
                  if (bd) bd.scrollTop = 0;
                  window.scrollTo(0, 0);
                  setTimeout(() => window.print(), 30);
                }}
                  className="no-print bg-[#0284C7] hover:bg-[#0369A1] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all cursor-pointer">
                  <Printer className="w-3.5 h-3.5" /> طباعة 🖨️
                </button>
                <button onClick={() => setShowReceiptModal(null)}
                  className="no-print w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer">✕</button>
              </div>
            </div>

            <div className="receipt-details-box p-4 rounded-2xl border border-[#E2E8F0] space-y-2.5 text-xs font-mono">
              {[
                [isAr ? 'رقم الإيصال:' : 'Receipt No:', showReceiptModal.receiptNo, 'text-[#0284C7]'],
                [isAr ? 'تاريخ الاستلام:' : 'Payment Date:', showReceiptModal.date, 'text-slate-700'],
                [isAr ? 'اسم ولي الأمر:' : 'Parent Name:', showReceiptModal.parentName || '—', 'text-[#0F172A] text-xs font-bold'],
                [isAr ? 'اسم الطالب / الإخوة:' : 'Student / Siblings:', showReceiptModal.studentName, 'text-[#0284C7] text-sm font-black'],
                [isAr ? 'الصف / الشعبة:' : 'Grade:', showReceiptModal.grade, 'text-slate-700'],
                [isAr ? 'طريقة الدفع:' : 'Payment Method:', showReceiptModal.method === 'fresh_cash' ? 'Fresh Cash USD' : 'OMT / Whish Transfer', 'text-slate-800'],
                [isAr ? 'المبلغ المدفوع بالدولار:' : 'Paid (USD):', `$${showReceiptModal.amountUSD} USD`, 'text-emerald-600 text-sm'],
                [isAr ? 'القسط المتبقي:' : 'Remaining Balance:', `$${showReceiptModal.remainingUSD} USD`, 'text-red-600'],
              ].map(([label, val, cls], i) => (
                <div key={i} className="flex justify-between border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
                  <span className="text-slate-500">{label}</span>
                  <span className={`font-bold ${cls}`}>{val}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-end pt-3 border-t border-slate-200 text-[11px] text-slate-500">
              <div>
                <p className="font-bold">{isAr ? 'توقيع المحاسب / الإدارة:' : 'Accountant Signature:'}</p>
                <div className="h-7 border-b border-slate-300 w-32 mt-1" />
              </div>
              <span className="px-3 py-1 rounded-full receipt-stamp-badge font-black text-[10px] border border-[#0284C7]/20">
                {isAr ? 'ختم المدرسة الرسمي 💮' : 'Official School Stamp'}
              </span>
            </div>

            <div className="no-print flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button onClick={() => setShowReceiptModal(null)} className="btn-mustard px-5 py-2.5 rounded-xl text-xs font-bold shadow cursor-pointer">{t('close')}</button>
              <button onClick={() => {
                const bd = document.querySelector('.receipt-print-backdrop');
                if (bd) bd.scrollTop = 0;
                window.scrollTo(0, 0);
                setTimeout(() => window.print(), 30);
              }} className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-md transition-all">
                <Printer className="w-4 h-4 text-white" /> طباعة الإيصال 🖨️
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
