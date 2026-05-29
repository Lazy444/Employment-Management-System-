export const monthRange = (month) => {
  // month: "YYYY-MM"
  const [y, m] = month.split("-").map(Number);
  const start = new Date(y, (m || 1) - 1, 1);
  const end = new Date(y, (m || 1), 1); // next month

  const toWorkDate = (d) => {
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
  };

  return { startWorkDate: toWorkDate(start), endWorkDate: toWorkDate(end) };
};

// Salary policy:
// - hourly => minutes/60 * hourlyRate
// - monthly => prorated by standardMinutesPerMonth (26 days * 8 hours)
export const computeGrossPay = ({
  payType,
  monthlySalary,
  hourlyRate,
  totalMinutes,
  standardMinutesPerMonth = 26 * 8 * 60,
}) => {
  const mins = Math.max(0, Number(totalMinutes || 0));

  if (payType === "hourly") {
    const rate = Number(hourlyRate || 0);
    const gross = (mins / 60) * rate;
    return Math.round(gross * 100) / 100;
  }

  const monthly = Number(monthlySalary || 0);
  const gross = standardMinutesPerMonth > 0 ? (mins / standardMinutesPerMonth) * monthly : 0;
  return Math.round(gross * 100) / 100;
};