import React, { useMemo, useState } from "react";
import NepaliDate from "nepali-date-converter";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  SunMedium,
  MoonStar,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const nepaliMonths = [
  "Baishakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const npWeekDaysFull = [
  "आइतबार",
  "सोमबार",
  "मंगलबार",
  "बुधबार",
  "बिहीबार",
  "शुक्रबार",
  "शनिबार",
];

const holidayBadgeStyles = {
  national: "bg-red-50 text-red-700 border-red-200",
  local: "bg-amber-50 text-amber-700 border-amber-200",
  women: "bg-pink-50 text-pink-700 border-pink-200",
  community: "bg-violet-50 text-violet-700 border-violet-200",
  education: "bg-sky-50 text-sky-700 border-sky-200",
  disability: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const holidays = {
  "2082-01-01": {
    name: "Nepali New Year",
    engDate: "April 14, 2025",
    type: "national",
    note: "National Public Holiday",
  },
  "2082-01-18": {
    name: "International Labor Day",
    engDate: "May 1, 2025",
    type: "national",
    note: "National Public Holiday",
  },
  "2082-01-29": {
    name: "Buddha Jayanti / Chandi Purnima / Ubhauli Parwa",
    engDate: "May 12, 2025",
    type: "national",
    note: "National Public Holiday",
  },
  "2082-02-15": {
    name: "Republic Day",
    engDate: "May 29, 2025",
    type: "national",
    note: "National Public Holiday",
  },
  "2082-04-24": {
    name: "Raksha Bandhan",
    engDate: "August 9, 2025",
    type: "national",
    note: "National Public Holiday",
  },
  "2082-04-25": {
    name: "Gai Jatra",
    engDate: "August 10, 2025",
    type: "local",
    note: "Kathmandu Valley and Newar community",
  },
  "2082-04-31": {
    name: "Shree Krishna Janmashtami",
    engDate: "August 16, 2025",
    type: "national",
    note: "National Public Holiday",
  },
  "2082-05-10": {
    name: "Haritalika Teej",
    engDate: "August 26, 2025",
    type: "women",
    note: "For women only",
  },
  "2082-05-15": {
    name: "Gaura Parwa",
    engDate: "August 31, 2025",
    type: "community",
    note: "Related religion, culture, regions and places",
  },
  "2082-05-21": {
    name: "Indra Jatra",
    engDate: "September 6, 2025",
    type: "local",
    note: "Kathmandu Valley only",
  },
  "2082-05-30": {
    name: "Jitiya Parwa",
    engDate: "September 15, 2025",
    type: "women",
    note: "For women celebrating Jitiya only",
  },
  "2082-06-03": {
    name: "Constitution Day",
    engDate: "September 19, 2025",
    type: "national",
    note: "National Public Holiday",
  },
  "2082-06-06": {
    name: "Ghatasthapana",
    engDate: "September 22, 2025",
    type: "national",
    note: "National Public Holiday",
  },
  "2082-06-13": {
    name: "Dashain Holiday",
    engDate: "September 29, 2025",
    type: "national",
    note: "Dashain Holiday",
  },
  "2082-06-14": {
    name: "Dashain Holiday",
    engDate: "September 30, 2025",
    type: "national",
    note: "Dashain Holiday",
  },
  "2082-06-15": {
    name: "Dashain Holiday",
    engDate: "October 1, 2025",
    type: "national",
    note: "Dashain Holiday",
  },
  "2082-06-16": {
    name: "Dashain Holiday",
    engDate: "October 2, 2025",
    type: "national",
    note: "Dashain Holiday",
  },
  "2082-06-17": {
    name: "Dashain Holiday",
    engDate: "October 3, 2025",
    type: "national",
    note: "Dashain Holiday",
  },
  "2082-06-18": {
    name: "Dashain Holiday",
    engDate: "October 4, 2025",
    type: "national",
    note: "Dashain Holiday",
  },
  "2082-07-03": {
    name: "Tihar Holiday",
    engDate: "October 20, 2025",
    type: "national",
    note: "Tihar Holiday",
  },
  "2082-07-04": {
    name: "Tihar Holiday",
    engDate: "October 21, 2025",
    type: "national",
    note: "Tihar Holiday",
  },
  "2082-07-05": {
    name: "Tihar Holiday",
    engDate: "October 22, 2025",
    type: "national",
    note: "Tihar Holiday",
  },
  "2082-07-06": {
    name: "Tihar Holiday",
    engDate: "October 23, 2025",
    type: "national",
    note: "Tihar Holiday",
  },
  "2082-07-07": {
    name: "Tihar Holiday",
    engDate: "October 24, 2025",
    type: "national",
    note: "Tihar Holiday",
  },
  "2082-07-10": {
    name: "Chhath Parwa",
    engDate: "October 27, 2025",
    type: "national",
    note: "National Public Holiday",
  },

  "2083-01-01": {
    name: "Nepali New Year",
    engDate: "April 14, 2026",
    type: "national",
    note: "National Public Holiday",
  },
  "2083-01-18": {
    name: "International Labor Day / Buddha Jayanti / Ubhauli",
    engDate: "May 1, 2026",
    type: "national",
    note: "National Public Holiday",
  },
  "2083-02-15": {
    name: "Republic Day",
    engDate: "May 29, 2026",
    type: "national",
    note: "National Public Holiday",
  },
  "2083-05-12": {
    name: "Raksha Bandhan",
    engDate: "August 28, 2026",
    type: "national",
    note: "National Public Holiday",
  },
  "2083-05-13": {
    name: "Gai Jatra",
    engDate: "August 29, 2026",
    type: "local",
    note: "Kathmandu Valley and Newar community",
  },
  "2083-05-19": {
    name: "Shree Krishna Janmashtami / Gaura Parwa",
    engDate: "September 4, 2026",
    type: "national",
    note: "National Public Holiday",
  },
  "2083-05-29": {
    name: "Haritalika Teej",
    engDate: "September 14, 2026",
    type: "women",
    note: "For women only",
  },
  "2083-06-03": {
    name: "Constitution Day",
    engDate: "September 19, 2026",
    type: "national",
    note: "National Public Holiday",
  },
  "2083-06-09": {
    name: "Indra Jatra",
    engDate: "September 25, 2026",
    type: "local",
    note: "Kathmandu Valley only",
  },
  "2083-06-18": {
    name: "Jitiya Parwa",
    engDate: "October 4, 2026",
    type: "women",
    note: "For women celebrating Jitiya only",
  },
  "2083-06-25": {
    name: "Ghatasthapana",
    engDate: "October 11, 2026",
    type: "national",
    note: "National Public Holiday",
  },
  "2083-06-31": {
    name: "Dashain Holiday",
    engDate: "October 17, 2026",
    type: "national",
    note: "Dashain Holiday",
  },
  "2083-07-01": {
    name: "Dashain Holiday",
    engDate: "October 18, 2026",
    type: "national",
    note: "Dashain Holiday",
  },
  "2083-07-02": {
    name: "Dashain Holiday",
    engDate: "October 19, 2026",
    type: "national",
    note: "Dashain Holiday",
  },
  "2083-07-03": {
    name: "Dashain Holiday",
    engDate: "October 20, 2026",
    type: "national",
    note: "Dashain Holiday",
  },
  "2083-07-04": {
    name: "Dashain Holiday",
    engDate: "October 21, 2026",
    type: "national",
    note: "Dashain Holiday",
  },
  "2083-07-05": {
    name: "Dashain Holiday",
    engDate: "October 22, 2026",
    type: "national",
    note: "Dashain Holiday",
  },
  "2083-07-06": {
    name: "Dashain Holiday",
    engDate: "October 23, 2026",
    type: "national",
    note: "Dashain Holiday",
  },
  "2083-07-22": {
    name: "Tihar Holiday",
    engDate: "November 8, 2026",
    type: "national",
    note: "Tihar Holiday",
  },
  "2083-07-23": {
    name: "Tihar Holiday",
    engDate: "November 9, 2026",
    type: "national",
    note: "Tihar Holiday",
  },
  "2083-07-24": {
    name: "Tihar Holiday",
    engDate: "November 10, 2026",
    type: "national",
    note: "Tihar Holiday",
  },
  "2083-07-25": {
    name: "Tihar Holiday / Falgunanda Jayanti",
    engDate: "November 11, 2026",
    type: "national",
    note: "Holiday; Falgunanda for Kirat community",
  },
  "2083-07-26": {
    name: "Tihar Holiday",
    engDate: "November 12, 2026",
    type: "national",
    note: "Tihar Holiday",
  },
  "2083-07-29": {
    name: "Chhath Parwa",
    engDate: "November 15, 2026",
    type: "national",
    note: "National Public Holiday",
  },
};

const pad = (num) => String(num).padStart(2, "0");

const getBsKey = (year, month, day) =>
  `${year}-${pad(month + 1)}-${pad(day)}`;

const formatEnglishDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);

const getDaysInMonth = (year, month) => {
  const temp = new NepaliDate(year, month, 1);
  let count = 0;

  while (temp.getMonth() === month) {
    count++;
    temp.setDate(temp.getDate() + 1);
  }

  return count;
};

const NepaliEmployeeCalendar = () => {
  const navigate = useNavigate();

  const theme = useTheme();
  const darkMode = theme?.darkMode ?? false;
  const toggleTheme = theme?.toggleTheme ?? (() => {});

  const todayBs = new NepaliDate();

  const [currentYear, setCurrentYear] = useState(2082);
  const [currentMonth, setCurrentMonth] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);

  const bgMain = darkMode
    ? "bg-slate-950 text-slate-50"
    : "bg-slate-100 text-slate-900";

  const cardBg = darkMode
    ? "bg-slate-900/85 border-slate-800"
    : "bg-white border-slate-200";

  const softBg = darkMode ? "bg-slate-950/70" : "bg-slate-50";
  const softBorder = darkMode ? "border-slate-800" : "border-slate-200";
  const subText = darkMode ? "text-slate-400" : "text-slate-500";
  const titleText = darkMode ? "text-slate-50" : "text-slate-900";
  const hoverBg = darkMode ? "hover:bg-slate-800" : "hover:bg-slate-100";

  const daysInMonth = useMemo(
    () => getDaysInMonth(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const firstDay = useMemo(() => {
    const temp = new NepaliDate(currentYear, currentMonth, 1);
    return temp.getDay();
  }, [currentYear, currentMonth]);

  const calendarDays = useMemo(() => {
    const arr = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [firstDay, daysInMonth]);

  const monthHolidayCount = useMemo(() => {
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = getBsKey(currentYear, currentMonth, d);
      if (holidays[key]) count++;
    }
    return count;
  }, [currentYear, currentMonth, daysInMonth]);

  const changeMonth = (step) => {
    let newMonth = currentMonth + step;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }

    if (newYear < 2082 || newYear > 2083) return;

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    setSelectedDate(null);
  };

  const selectedInfo = useMemo(() => {
    if (!selectedDate) return null;

    const dateObj = new NepaliDate(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day
    );

    const adDate = dateObj.toJsDate();
    const bsKey = getBsKey(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day
    );
    const holiday = holidays[bsKey];

    return {
      ...selectedDate,
      bsKey,
      holiday,
      englishDateFormatted: formatEnglishDate(adDate),
      weekDayNp: npWeekDaysFull[dateObj.getDay()],
      weekDayEn: weekDays[dateObj.getDay()],
    };
  }, [selectedDate]);

  return (
    <div className={`min-h-screen px-4 py-6 md:px-6 lg:px-8 ${bgMain}`}>
      <div className="mx-auto max-w-7xl">
        <div
          className={`mb-6 flex flex-col gap-4 rounded-3xl border p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6 ${cardBg}`}
        >
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate(-1)}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition ${softBorder} ${softBg} ${hoverBg}`}
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">
                Employee Management System
              </p>
              <h1 className={`mt-1 text-2xl font-bold tracking-tight md:text-3xl ${titleText}`}>
                Nepali Holiday Calendar
              </h1>
              <p className={`mt-2 text-sm leading-6 ${subText}`}>
                Professional BS/AD holiday calendar for 2082 and 2083 with official date details.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 md:flex md:items-center">
            <select
              value={currentYear}
              onChange={(e) => {
                setCurrentYear(Number(e.target.value));
                setSelectedDate(null);
              }}
              className={`h-11 rounded-2xl border px-4 text-sm font-medium outline-none ${softBorder} ${softBg}`}
            >
              <option value={2082}>2082</option>
              <option value={2083}>2083</option>
            </select>

            <select
              value={currentMonth}
              onChange={(e) => {
                setCurrentMonth(Number(e.target.value));
                setSelectedDate(null);
              }}
              className={`h-11 rounded-2xl border px-4 text-sm font-medium outline-none ${softBorder} ${softBg}`}
            >
              {nepaliMonths.map((month, idx) => (
                <option key={month} value={idx}>
                  {month}
                </option>
              ))}
            </select>

            <button
              onClick={toggleTheme}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition ${softBorder} ${softBg} ${hoverBg}`}
            >
              {darkMode ? <SunMedium size={18} /> : <MoonStar size={18} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.55fr_0.8fr]">
          <div className={`overflow-hidden rounded-3xl border shadow-sm ${cardBg}`}>
            <div className={`border-b px-5 py-5 md:px-6 ${softBorder}`}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-indigo-500">
                    <CalendarDays size={18} />
                    <span className="text-sm font-semibold">
                      Calendar Overview
                    </span>
                  </div>

                  <h2 className={`mt-2 text-2xl font-bold ${titleText}`}>
                    {nepaliMonths[currentMonth]} {currentYear}
                  </h2>

                  <p className={`mt-1 text-sm ${subText}`}>
                    {monthHolidayCount} holiday
                    {monthHolidayCount !== 1 ? "s" : ""} in this month
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => changeMonth(-1)}
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition ${softBorder} ${softBg} ${hoverBg}`}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    onClick={() => changeMonth(1)}
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition ${softBorder} ${softBg} ${hoverBg}`}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Legend text="National Holiday" color="red" />
                <Legend text="Local / Regional" color="amber" />
                <Legend text="Women Only" color="pink" />
                <Legend text="Community" color="violet" />
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 px-4 pt-4 md:px-5">
              {weekDays.map((day, index) => (
                <div
                  key={day}
                  className={`rounded-2xl px-2 py-3 text-center text-sm font-semibold ${
                    index === 6
                      ? "bg-red-500/10 text-red-500"
                      : darkMode
                      ? "bg-slate-950 text-slate-300"
                      : "bg-slate-50 text-slate-600"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 p-4 md:gap-3 md:p-5">
              {calendarDays.map((day, idx) => {
                if (!day) {
                  return (
                    <div
                      key={idx}
                      className="h-24 rounded-2xl bg-transparent md:h-28"
                    />
                  );
                }

                const dateObj = new NepaliDate(currentYear, currentMonth, day);
                const bsKey = getBsKey(currentYear, currentMonth, day);
                const holiday = holidays[bsKey];
                const weekday = dateObj.getDay();
                const isSaturday = weekday === 6;

                const isToday =
                  todayBs.getYear() === currentYear &&
                  todayBs.getMonth() === currentMonth &&
                  todayBs.getDate() === day;

                const isSelected =
                  selectedDate &&
                  selectedDate.year === currentYear &&
                  selectedDate.month === currentMonth &&
                  selectedDate.day === day;

                const adDate = formatEnglishDate(dateObj.toJsDate());

                return (
                  <button
                    key={idx}
                    onClick={() =>
                      setSelectedDate({
                        year: currentYear,
                        month: currentMonth,
                        day,
                      })
                    }
                    className={`relative flex h-24 flex-col rounded-2xl border p-3 text-left transition-all duration-200 md:h-28 ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-600 text-white shadow-md"
                        : holiday
                        ? "border-red-400/30 bg-red-500/10 hover:bg-red-500/20"
                        : isSaturday
                        ? "border-rose-400/30 bg-rose-500/10 hover:bg-rose-500/20"
                        : darkMode
                        ? "border-slate-800 bg-slate-950/60 hover:bg-slate-800"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {isToday && (
                      <span className="absolute right-2 top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                        Today
                      </span>
                    )}

                    <div
                      className={`text-base font-bold md:text-lg ${
                        isSelected
                          ? "text-white"
                          : isSaturday
                          ? "text-red-500"
                          : titleText
                      }`}
                    >
                      {day}
                    </div>

                    <div
                      className={`mt-1 text-[11px] leading-4 md:text-xs ${
                        isSelected ? "text-indigo-100" : subText
                      }`}
                    >
                      {adDate}
                    </div>

                    {holiday && (
                      <div
                        className={`mt-2 line-clamp-2 text-[11px] font-semibold leading-4 md:text-xs ${
                          isSelected ? "text-white" : "text-red-500"
                        }`}
                      >
                        {holiday.name}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className={`rounded-3xl border p-5 shadow-sm md:p-6 ${cardBg}`}>
              <h3 className={`text-lg font-bold md:text-xl ${titleText}`}>
                Selected Date
              </h3>

              {!selectedInfo ? (
                <div
                  className={`mt-4 rounded-2xl border border-dashed p-5 text-sm leading-6 ${softBorder} ${softBg} ${subText}`}
                >
                  Click any date on the calendar to view Nepali date, English
                  date, and holiday information.
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  <InfoBox title="Nepali Date" darkMode={darkMode} subText={subText}>
                    <p className={`mt-2 text-lg font-bold ${titleText}`}>
                      {selectedInfo.day} {nepaliMonths[selectedInfo.month]}{" "}
                      {selectedInfo.year}
                    </p>
                    <p className={`mt-1 text-sm ${subText}`}>
                      {selectedInfo.weekDayNp} / {selectedInfo.weekDayEn}
                    </p>
                  </InfoBox>

                  <InfoBox title="English Date" darkMode={darkMode} subText={subText}>
                    <p className={`mt-2 text-lg font-bold ${titleText}`}>
                      {selectedInfo.englishDateFormatted}
                    </p>
                  </InfoBox>

                  {selectedInfo.holiday ? (
                    <div className={`rounded-2xl border p-4 ${cardBg}`}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h4 className={`text-base font-bold md:text-lg ${titleText}`}>
                          {selectedInfo.holiday.name}
                        </h4>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                            holidayBadgeStyles[selectedInfo.holiday.type]
                          }`}
                        >
                          {selectedInfo.holiday.type}
                        </span>
                      </div>

                      <div className={`mt-4 space-y-2 text-sm leading-6 ${subText}`}>
                        <p>
                          <span className="font-semibold">BS Date:</span>{" "}
                          {selectedInfo.day} {nepaliMonths[selectedInfo.month]}{" "}
                          {selectedInfo.year}
                        </p>
                        <p>
                          <span className="font-semibold">AD Date:</span>{" "}
                          {selectedInfo.holiday.engDate}
                        </p>
                        <p>
                          <span className="font-semibold">Note:</span>{" "}
                          {selectedInfo.holiday.note}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`rounded-2xl border border-dashed p-4 text-sm ${softBorder} ${softBg} ${subText}`}
                    >
                      No holiday is listed for this selected date.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={`rounded-3xl border p-5 shadow-sm md:p-6 ${cardBg}`}>
              <h3 className={`text-lg font-bold md:text-xl ${titleText}`}>
                Calendar Notes
              </h3>

              <div className={`mt-4 space-y-3 text-sm leading-6 ${subText}`}>
                <p>• Saturdays are shown as weekly holidays.</p>
                <p>• Red-tinted dates represent official holiday entries.</p>
                <p>• Some holidays are regional, community-specific, or women-only.</p>
                <p>• The calendar includes holidays for 2082 and 2083 only.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function Legend({ text, color }) {
  const styles = {
    red: "border-red-500/30 bg-red-500/10 text-red-500",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-500",
    pink: "border-pink-500/30 bg-pink-500/10 text-pink-500",
    violet: "border-violet-500/30 bg-violet-500/10 text-violet-500",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-xs font-medium ${styles[color]}`}
    >
      {text}
    </span>
  );
}

function InfoBox({ title, children, darkMode, subText }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        darkMode
          ? "border-slate-800 bg-slate-950/70"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <p className={`text-xs font-semibold uppercase tracking-wide ${subText}`}>
        {title}
      </p>
      {children}
    </div>
  );
}

export default NepaliEmployeeCalendar;