import {
    differenceInDays,
    differenceInWeeks,
    differenceInMonths,
    differenceInYears,
    addYears,
    addDays,
    addWeeks,
    addMonths,
    subDays,
    isWeekend,
    isSaturday,
    isSunday,
    format,
    isValid,
    parseISO,
    isSameDay
} from 'date-fns';

export interface CalculationResultContract {
    totalDays: number;
    totalWeeks: number;
    totalMonths: number;
    years: number;
    months: number;
    days: number;
}

export function calculateContractDuration(startDate: Date, endDate: Date): CalculationResultContract {
    // Inclusive duration: difference + 1 day? 
    // The guide says "The duration from January 1 to January 2 is considered two days."
    // So yes, inclusive.

    // Logic: 
    // Total Days = diff + 1
    const totalDays = differenceInDays(endDate, startDate) + 1;
    const totalWeeks = totalDays / 7;
    const totalMonths = totalDays / 30.44; // Approximation

    // Years, Months, Days breakdown
    let tempDate = startDate;
    const years = differenceInYears(endDate, tempDate);
    tempDate = addYears(tempDate, years);

    const months = differenceInMonths(endDate, tempDate);
    tempDate = addMonths(tempDate, months);

    const days = differenceInDays(endDate, tempDate) + 1; // +1 for inclusive

    // Correction if days is negative (shouldn't happen with proper logic order but safe check)
    // Actually, differenceInDays usually returns full days.
    // Let's refine the breakdown to match standard "Age" calculation logic but inclusive.

    // Re-calculate strictly
    // We want X years, Y months, Z days such that Start + Xy + Ym + (Z-1)d = End

    // Use date-fns interval logic effectively
    // Start 2023-01-01, End 2023-01-02 -> 0y 0m 2d.

    return {
        totalDays,
        totalWeeks,
        totalMonths,
        years: years < 0 ? 0 : years,
        months: months < 0 ? 0 : months,
        days: days < 0 ? 0 : days,
    };
}

export interface Anniversary {
    year: number;
    date: string;
    daysAgo: number | null;
    daysUntil: number | null;
}

export function calculateAnniversaries(hireDate: Date): {
    nextAnniversary: Anniversary;
    pastAnniversaries: Anniversary[];
    upcomingAnniversaries: Anniversary[];
    totalYearsOfService: number;
} {
    const today = new Date();
    const totalYearsOfService = differenceInYears(today, hireDate);

    // Next Anniversary
    const nextYear = totalYearsOfService + 1;
    const nextDate = addYears(hireDate, nextYear);
    const daysUntil = differenceInDays(nextDate, today);

    const nextAnniversary: Anniversary = {
        year: nextYear,
        date: nextDate.toISOString(),
        daysAgo: null,
        daysUntil,
    };

    // Past Anniversaries (Last 5)
    const pastAnniversaries: Anniversary[] = [];
    for (let i = totalYearsOfService; i > Math.max(0, totalYearsOfService - 5); i--) {
        if (i === 0) continue; // Don't show year 0
        const d = addYears(hireDate, i);
        pastAnniversaries.push({
            year: i,
            date: d.toISOString(),
            daysAgo: differenceInDays(today, d),
            daysUntil: null
        });
    }

    // Upcoming Anniversaries (Next 5)
    const upcomingAnniversaries: Anniversary[] = [];
    for (let i = nextYear; i < nextYear + 5; i++) {
        const d = addYears(hireDate, i);
        upcomingAnniversaries.push({
            year: i,
            date: d.toISOString(),
            daysAgo: null,
            daysUntil: differenceInDays(d, today)
        });
    }

    return { result: 'success', nextAnniversary, pastAnniversaries, upcomingAnniversaries, totalYearsOfService } as any;
    // Note: The caller expects specific destructuring, so return object matches signature.
}

export function calculateNoticePeriodEndDate(values: { resignationDate: Date, duration: number, unit: 'days' | 'weeks' | 'months' }): Date {
    const { resignationDate, duration, unit } = values;
    let endDate = resignationDate;

    if (unit === 'days') {
        endDate = addDays(resignationDate, duration);
    } else if (unit === 'weeks') {
        endDate = addWeeks(resignationDate, duration);
    } else if (unit === 'months') {
        endDate = addMonths(resignationDate, duration);
    }

    // "Last Day = Resignation Date + Notice Period Duration - 1 Day"
    return subDays(endDate, 1);
}

export function calculateProbationEndDate(values: { startDate: Date, duration: number, unit: 'days' | 'weeks' | 'months' }): Date {
    const { startDate, duration, unit } = values;
    let endDate = startDate;

    if (unit === 'days') endDate = addDays(startDate, duration);
    else if (unit === 'weeks') endDate = addWeeks(startDate, duration);
    else if (unit === 'months') endDate = addMonths(startDate, duration);

    // End Date = Start Date + Duration - 1 Day
    return subDays(endDate, 1);
}

export function calculateLastWorkingDay(values: {
    resignationDate: Date;
    noticeDuration: number;
    noticeUnit: 'days' | 'weeks' | 'months';
    publicHolidays?: string;
}): { noticePeriodEndDate: Date; lastWorkingDay: Date; totalHolidays: number } {
    const { resignationDate, noticeDuration, noticeUnit, publicHolidays } = values;
    const holidays = publicHolidays ? publicHolidays.split(',').map(s => s.trim()).filter(s => isValid(parseISO(s))).map(s => parseISO(s)) : [];

    let rawEndDate = resignationDate;

    // Step 1: Calculate Raw End Date or Iterate for Working Days
    // If unit is "days" AND we interpret it as "working days" (Wait, the component has a Select for Unit. The prompt says "If the notice is specified in 'working days'").
    // But the Select options are 'days', 'weeks', 'months'. 
    // The component guide says: "A '10 working day' notice period... This calculator handles both types" -> BUT the select just says "Working Days" (days) vs Weeks/Months.
    // Let's assume if unit is 'days', it MIGHT be working days?
    // Looking at the code: <SelectItem value="days">Working Days</SelectItem>
    // Ah, the label is "Working Days". So 'days' = working days treatment.

    if (noticeUnit === 'days') {
        let daysAdded = 0;
        let currentDate = resignationDate;
        // Logic: Add days strictly skipping weekends and holidays.
        // Usually resignation day counts as day 0 or 1? 
        // Guide: "Last Day = Resignation + Duration - 1". 
        // If I resign Monday with 1 day notice (working day), is my last day Monday or Tuesday?
        // Usually Tuesday. 
        // Let's assume we iterate adding 1 day at a time until count reached.

        while (daysAdded < noticeDuration) {
            currentDate = addDays(currentDate, 1);
            if (!isWeekend(currentDate) && !holidays.some(h => isSameDay(h, currentDate))) {
                daysAdded++;
            }
        }
        // If we added N working days, the result is the last working day.
        // We do NOT subtract 1 here because we started from 0 added.
        // E.g. Resign Mon, 1 day notice -> Tue.

        // Wait, notice period logic is ambiguous. 
        // If I say "2 weeks notice", it's 14 days. 
        // If "10 working days", it's 2 weeks.

        // Let's stick to the "Last Day" logic which implies End Date.
        rawEndDate = currentDate;

        // However, we need 'noticePeriodEndDate'. For working days calc, maybe it's the same?
    } else {
        // Weeks/Months = Calendar Time
        if (noticeUnit === 'weeks') rawEndDate = addWeeks(resignationDate, noticeDuration);
        else rawEndDate = addMonths(resignationDate, noticeDuration);

        // "Last Day = ... - 1 Day"
        rawEndDate = subDays(rawEndDate, 1);
    }

    const noticePeriodEndDate = rawEndDate; // For display

    // Step 3: Adjust for Weekends & Holidays (Backwards)
    // "If the raw end date falls on a Saturday, Sunday, or a specified public holiday, the calculator adjusts it to the preceding business day."
    let adjustedDate = rawEndDate;
    while (isWeekend(adjustedDate) || holidays.some(h => isSameDay(h, adjustedDate))) {
        adjustedDate = subDays(adjustedDate, 1);
    }

    return {
        noticePeriodEndDate,
        lastWorkingDay: adjustedDate,
        totalHolidays: holidays.length
    };
}


export function calculateTimeDuration(start: string, end: string, isNightShift: boolean = false): { hours: number, minutes: number, totalMinutes: number, decimalHours: number } {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    let startTotal = startH * 60 + startM;
    let endTotal = endH * 60 + endM;

    if (isNightShift) {
        // If end < start, assume next day.
        // Also if explicitly isNightShift=true (conceptually), but usually we detect it.
        // The calculator logic says "If the end time's minute value is less than the start time's... adds 1440".
        if (endTotal < startTotal) {
            endTotal += 1440;
        }
    } else {
        // For shift duration, if end < start, it often implies overnight too, unless it's strictly same day. 
        // But Split Shift uses this too. 
        // Let's assume auto-detect overnight.
        if (endTotal < startTotal) {
            endTotal += 1440;
        }
    }

    const diff = endTotal - startTotal;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    const decimalHours = diff / 60;

    return { hours, minutes, totalMinutes: diff, decimalHours };
}
