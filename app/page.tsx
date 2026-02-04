"use client";

import { useMemo, useState } from "react";

type ShiftType =
  | "none"
  | "morning-evening"
  | "morning-night"
  | "evening-night"
  | "night-fixed";

type AttendanceRecord = {
  id: string;
  type: "in" | "out";
  timestamp: string;
  note?: string;
};

type Employee = {
  id: string;
  name: string;
  role: string;
  baseWage: number;
  shiftType: ShiftType;
  shiftAllowance: number;
  attendance: AttendanceRecord[];
};

const shiftOptions: {
  value: ShiftType;
  label: string;
  percent: number;
  note: string;
}[] = [
  {
    value: "none",
    label: "بدون نوبت‌کاری",
    percent: 0,
    note: "بدون حق شیفت"
  },
  {
    value: "morning-evening",
    label: "نوبت‌کاری صبح و عصر",
    percent: 10,
    note: "فوق‌العاده نوبت‌کاری ۱۰٪"
  },
  {
    value: "morning-night",
    label: "نوبت‌کاری صبح و شب",
    percent: 15,
    note: "فوق‌العاده نوبت‌کاری ۱۵٪"
  },
  {
    value: "evening-night",
    label: "نوبت‌کاری عصر و شب",
    percent: 22.5,
    note: "فوق‌العاده نوبت‌کاری ۲۲.۵٪"
  },
  {
    value: "night-fixed",
    label: "شب‌کاری ثابت",
    percent: 35,
    note: "فوق‌العاده شب‌کاری ۳۵٪"
  }
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("fa-IR").format(Math.round(value));

const nowStamp = () =>
  new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date());

export default function Home() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState({
    name: "",
    role: "",
    baseWage: "",
    shiftType: "none" as ShiftType
  });
  const [note, setNote] = useState("");

  const summary = useMemo(() => {
    const totalEmployees = employees.length;
    const totalShiftAllowance = employees.reduce(
      (sum, employee) => sum + employee.shiftAllowance,
      0
    );
    const totalPresent = employees.filter((employee) => {
      const lastRecord = employee.attendance[0];
      return lastRecord?.type === "in";
    }).length;

    return { totalEmployees, totalShiftAllowance, totalPresent };
  }, [employees]);

  const addEmployee = () => {
    if (!form.name.trim() || !form.role.trim() || !form.baseWage) return;
    const baseWageValue = Number(form.baseWage);
    if (Number.isNaN(baseWageValue) || baseWageValue <= 0) return;

    const shift = shiftOptions.find((option) => option.value === form.shiftType);
    const allowance = (baseWageValue * (shift?.percent ?? 0)) / 100;

    const newEmployee: Employee = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      role: form.role.trim(),
      baseWage: baseWageValue,
      shiftType: form.shiftType,
      shiftAllowance: allowance,
      attendance: []
    };

    setEmployees((prev) => [newEmployee, ...prev]);
    setForm({ name: "", role: "", baseWage: "", shiftType: "none" });
  };

  const logAttendance = (employeeId: string, type: "in" | "out") => {
    setEmployees((prev) =>
      prev.map((employee) => {
        if (employee.id !== employeeId) return employee;
        const record: AttendanceRecord = {
          id: crypto.randomUUID(),
          type,
          timestamp: nowStamp(),
          note: note.trim() || undefined
        };
        return {
          ...employee,
          attendance: [record, ...employee.attendance]
        };
      })
    );
    setNote("");
  };

  const shiftGuide = shiftOptions.find(
    (option) => option.value === form.shiftType
  );

  return (
    <main>
      <section className="header">
        <div>
          <span className="badge">نسخه دمو - قابل سفارشی‌سازی</span>
          <h1>سامانه ثبت ورود و خروج کارکنان</h1>
          <p>
            فهرست کارکنان را بسازید، ورود و خروج آن‌ها را ثبت کنید و حق شیفت را بر
            اساس درصدهای رایج قانون کار ایران محاسبه کنید.
          </p>
        </div>
        <div className="summary">
          <div className="summary-item">
            تعداد کارکنان: {summary.totalEmployees} نفر
          </div>
          <div className="summary-item">
            حاضر در شیفت: {summary.totalPresent} نفر
          </div>
          <div className="summary-item">
            مجموع حق شیفت ماهانه: {formatCurrency(summary.totalShiftAllowance)}
          </div>
        </div>
      </section>

      <section className="grid two">
        <div className="card">
          <h2>افزودن کارمند جدید</h2>
          <div className="grid">
            <div>
              <label htmlFor="name">نام و نام خانوادگی</label>
              <input
                id="name"
                placeholder="مثلاً سارا احمدی"
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>
            <div>
              <label htmlFor="role">سمت سازمانی</label>
              <input
                id="role"
                placeholder="مثلاً حسابدار ارشد"
                value={form.role}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, role: event.target.value }))
                }
              />
            </div>
            <div>
              <label htmlFor="baseWage">حقوق پایه ماهانه (ریال)</label>
              <input
                id="baseWage"
                type="number"
                placeholder="مثلاً 320000000"
                value={form.baseWage}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, baseWage: event.target.value }))
                }
              />
              <p className="helper">
                مبنای محاسبه حق شیفت است و می‌تواند مطابق قرارداد تغییر کند.
              </p>
            </div>
            <div>
              <label htmlFor="shiftType">نوع شیفت</label>
              <select
                id="shiftType"
                value={form.shiftType}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    shiftType: event.target.value as ShiftType
                  }))
                }
              >
                {shiftOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="helper">
                {shiftGuide?.note} | درصدها بر اساس رویه رایج قانون کار ایران است
                و ممکن است با قرارداد شما متفاوت باشد.
              </p>
            </div>
            <div className="actions">
              <button
                type="button"
                onClick={addEmployee}
                disabled={!form.name || !form.role || !form.baseWage}
              >
                افزودن کارمند
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() =>
                  setForm({ name: "", role: "", baseWage: "", shiftType: "none" })
                }
              >
                پاک کردن فرم
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>ثبت ورود و خروج</h2>
          <p className="helper">
            برای هر ثبت، یادداشت کوتاه اضافه کنید (اختیاری) تا دلیل مرخصی یا تاخیر
            ثبت شود.
          </p>
          <label htmlFor="note">یادداشت عمومی</label>
          <textarea
            id="note"
            rows={3}
            placeholder="مثلاً مرخصی ساعتی یا جلسه بیرون از شرکت"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <ul className="list" style={{ marginTop: 16 }}>
            {employees.length === 0 && (
              <li>هنوز کارمندی ثبت نشده است.</li>
            )}
            {employees.map((employee) => {
              const shift = shiftOptions.find(
                (option) => option.value === employee.shiftType
              );
              const lastRecord = employee.attendance[0];
              return (
                <li key={employee.id}>
                  <strong>{employee.name}</strong>
                  <span className="helper">{employee.role}</span>
                  <span className="helper">
                    حق شیفت: {formatCurrency(employee.shiftAllowance)} ریال ({
                      shift?.note
                    })
                  </span>
                  <div className="actions">
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => logAttendance(employee.id, "in")}
                    >
                      ثبت ورود
                    </button>
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => logAttendance(employee.id, "out")}
                    >
                      ثبت خروج
                    </button>
                  </div>
                  {lastRecord && (
                    <span className="helper">
                      آخرین وضعیت: {lastRecord.type === "in" ? "ورود" : "خروج"} -{" "}
                      {lastRecord.timestamp}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section style={{ marginTop: 28 }}>
        <div className="card">
          <h2>گزارش آخرین ورود و خروج‌ها</h2>
          <div className="grid three">
            {employees.map((employee) => (
              <div key={employee.id} className="card" style={{ boxShadow: "none" }}>
                <h3>{employee.name}</h3>
                <p className="helper">{employee.role}</p>
                {employee.attendance.length === 0 ? (
                  <p className="helper">هنوز رکوردی ثبت نشده است.</p>
                ) : (
                  <ul className="list">
                    {employee.attendance.slice(0, 3).map((record) => (
                      <li key={record.id}>
                        <strong>
                          {record.type === "in" ? "ورود" : "خروج"}
                        </strong>
                        <span className="helper">{record.timestamp}</span>
                        {record.note && (
                          <span className="helper">یادداشت: {record.note}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {employees.length === 0 && (
              <div className="card" style={{ boxShadow: "none" }}>
                <p className="helper">
                  ابتدا کارمندان را اضافه کنید تا گزارش حضور و غیاب نمایش داده شود.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
