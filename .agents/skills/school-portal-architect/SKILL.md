---
name: school-portal-architect
description: Full system architecture, database schema, financial calculation formulas, role permissions, and module breakdown for Educational Support School portal.
---

# Educational Support School Architecture & Modules Reference

This skill provides full technical specifications for all components of the Educational Support School (مدرسة الدعم التعليمي) system.

## 1. System Roles & Access Matrix
- **Admin**: Full system access, users management (`/#users`), finance (`/#tuition`), documents (`/#documents`), system settings (`/#settings`).
- **Teacher**: Marks entry (`/#exams`), daily attendance (`/#attendance`), agenda/homework (`/#agenda`), behavior notes (`/#behavior`), assigned subjects & classrooms (`/#classes`).
- **Student**: View timetable (`/#schedule`), agenda, exam results & report cards (`/#reports`), bus tracking (`/#bus`), behavior status.
- **Parent**: Track children's performance, view tuition dues & remaining balance, receive financial reminders & announcements.

## 2. Key Modules Map
- `DirectoryModule.jsx`: Student & family roster, unified family phone grouping (no card duplicates across grade sections), printable student sheet with `الخصم الممنوح` column, Excel CSV export.
- `TuitionModule.jsx`: Financial dues management, discount input, USD/LBP exchange rate, direct payment modal (`REC-LB-xxxxxx`), WhatsApp overdue reminders.
- `UsersModule.jsx`: Standalone user management page registered at `/#users`, user CRUD, password generator, system role assignment.
- `Sidebar.jsx`: Glassmorphic navigation menu without emoji text clutter, active state indicators, responsive backdrop.
- `LoginView.jsx`: Secure login, interactive WhatsApp developer support link in footer (`+96181713408`), clean input placeholders.

## 3. Financial Calculation Formulas
$$\text{Remaining Dues} = \text{Max}(0, \text{Total Tuition} + \text{Admin Fees} + \text{Transport Fee} - \text{Discount} - \text{Paid Dues})$$

## 4. Family Card Duplication Prevention
- Always track rendered student family phone keys in a `globalRenderedPhones = new Set()` scoped OUTSIDE the grade grouping loops.
