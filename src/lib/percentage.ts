
/**
 * Percentage Calculator Logic
 */

export function calculateAveragePercentage(numbers: number[]): { average: string } {
    if (numbers.length === 0) return { average: '0' };
    const sum = numbers.reduce((a, b) => a + b, 0);
    const avg = sum / numbers.length;
    return { average: avg.toFixed(2) };
}

export function calculateComparativeDifference(val1: number, val2: number): { difference: string; percentageDifference: string } {
    const diff = val1 - val2;
    const avg = (val1 + val2) / 2;
    if (avg === 0) return { difference: diff.toFixed(2), percentageDifference: '0' };
    // Percentage difference is typically |V1 - V2| / ((V1+V2)/2) * 100
    // But let's check if the user meant relative change (V2-V1)/V1
    // "Comparative Difference" usually implies the standard % diff formula.
    const absDiff = Math.abs(diff);
    const pDiff = (absDiff / Math.abs(avg)) * 100;
    return { difference: diff.toFixed(2), percentageDifference: pDiff.toFixed(2) };
}

export function calculateCompoundingIncrease(principal: number, rate: number, years: number, compoundsPerYear: number = 1): { amount: string; interest: string } {
    // A = P(1 + r/n)^(nt)
    const r = rate / 100;
    const n = compoundsPerYear;
    const t = years;
    const amount = principal * Math.pow((1 + r / n), (n * t));
    const interest = amount - principal;
    return { amount: amount.toFixed(2), interest: interest.toFixed(2) };
}

export function calculateDoublingTime(rate: number): { years: string; exactYears: string } {
    // Rule of 72
    if (rate === 0) return { years: 'Infinity', exactYears: 'Infinity' };
    const years = 72 / rate;
    // Exact formula: ln(2) / ln(1 + rate/100)
    const exact = Math.log(2) / Math.log(1 + rate / 100);
    return { years: years.toFixed(2), exactYears: exact.toFixed(2) };
}

export function calculateFractionToPercent(numerator: number, denominator: number): { percentage: string } {
    if (denominator === 0) return { percentage: 'Infinity' };
    const val = (numerator / denominator) * 100;
    return { percentage: val.toFixed(2) };
}

export function calculateFuelCost(distance: number, distUnit: 'miles' | 'kilometers', efficiency: number, effUnit: 'mpg' | 'lp100km', price: number, priceUnit: 'per_gallon' | 'per_liter'): { fuelNeeded: string; totalCost: string } {
    // Normalization to km and liters
    // 1 mile = 1.60934 km
    // 1 gallon = 3.78541 liters

    let distKw = distance;
    if (distUnit === 'miles') distKw = distance * 1.60934;

    let litersNeeded = 0;
    if (effUnit === 'lp100km') {
        litersNeeded = (distKw / 100) * efficiency;
    } else {
        // mpg to lp100km: 235.215 / mpg
        const lp100km = 235.215 / efficiency;
        litersNeeded = (distKw / 100) * lp100km;
    }

    let cost = 0;
    if (priceUnit === 'per_liter') {
        cost = litersNeeded * price;
    } else {
        // Price per gallon -> Price per liter = Price / 3.78541
        const pricePerLiter = price / 3.78541;
        cost = litersNeeded * pricePerLiter;
    }

    // Determine unit for display of fuel needed
    // If input was miles/mpg, show gallons. If km/lp100km, show liters.
    // For simplicity, let's stick to the unit implied by the efficiency input?
    // Actually simplicity: just formatting the cost is key. User can check math.
    // Let's provide formatted strings.

    let fuelDisplay = '';
    if (effUnit === 'mpg') {
        const gallons = litersNeeded / 3.78541;
        fuelDisplay = `${gallons.toFixed(2)} gal`;
    } else {
        fuelDisplay = `${litersNeeded.toFixed(2)} L`;
    }

    return { fuelNeeded: fuelDisplay, totalCost: cost.toFixed(2) };
}

export function calculateHistoricChange(oldVal: number, newVal: number): { change: string; direction: 'increase' | 'decrease' | 'none' } {
    const diff = newVal - oldVal;

    let direction: 'increase' | 'decrease' | 'none' = 'none';
    if (diff > 0) direction = 'increase';
    else if (diff < 0) direction = 'decrease';

    if (oldVal === 0) return { change: 'Infinity', direction: 'increase' };

    const pChange = (Math.abs(diff) / Math.abs(oldVal)) * 100;
    return { change: pChange.toFixed(2), direction };
}

export function calculateInvestmentGrowth(principal: number, finalVal: number): { growthPercentage: string; netGrowth: string } {
    const net = finalVal - principal;
    if (principal === 0) return { growthPercentage: 'Infinity', netGrowth: net.toFixed(2) };
    const p = (net / principal) * 100;
    return { growthPercentage: p.toFixed(2), netGrowth: net.toFixed(2) };
}

export function calculatePercentError(experimental: number, theoretical: number): { error: string; percentError: string } {
    const error = experimental - theoretical;
    if (theoretical === 0) return { error: error.toFixed(2), percentError: 'Infinity' };
    const pError = (Math.abs(error) / Math.abs(theoretical)) * 100;
    return { error: error.toFixed(2), percentError: pError.toFixed(2) };
}

export function calculatePercentToGoal(current: number, goal: number): { percentComp: string; remaining: string } {
    if (goal === 0) return { percentComp: 'Infinity', remaining: '0' };
    const p = (current / goal) * 100;
    const rem = goal - current;
    return { percentComp: p.toFixed(2), remaining: rem.toFixed(2) };
}

export function calculatePercentageOfAPercentage(p1: number, p2: number): { result: string } {
    // x% of y% = (x/100) * (y/100) = (xy)/10000 -> shown as decimal or percentage?
    // "Percentage of a percentage" usually calculates p1% * p2%.
    // Example: 50% of 20% is 10%.
    // Calculation: (p1 * p2) / 100
    const res = (p1 * p2) / 100;
    return { result: res.toFixed(2) };
}

export function calculatePercentagePoint(val1: number, val2: number): { difference: string } {
    const pts = val2 - val1;
    return { difference: pts.toFixed(2) };
}

export function calculateRelativeChange(start: number, end: number): { change: string; direction: 'increase' | 'decrease' | 'no change' } {
    const diff = end - start;
    if (start === 0) return { change: 'Infinity', direction: 'increase' }; // Edge case
    const p = (diff / start) * 100;

    let direction: 'increase' | 'decrease' | 'no change' = 'no change';
    if (diff > 0) direction = 'increase';
    else if (diff < 0) direction = 'decrease';

    return { change: Math.abs(p).toFixed(2), direction };
}

export function calculateSlopePercentage(rise: number, run: number): { slope: string; angle: string } {
    if (run === 0) return { slope: 'Infinity', angle: '90' };
    const s = rise / run;
    const p = s * 100;
    const angleRad = Math.atan(s);
    const angleDeg = angleRad * (180 / Math.PI);
    return { slope: p.toFixed(2), angle: angleDeg.toFixed(2) };
}

export function calculateTimePercentage(part: number, total: number): { percentage: string } {
    if (total === 0) return { percentage: '0' };
    const p = (part / total) * 100;
    return { percentage: p.toFixed(2) };
}

export function calculateValuePercentage(percentage: number, total: number): { value: string } {
    // Logic: (Percentage / 100) * Total Value
    const val = (percentage / 100) * total;
    return { value: val.toFixed(2) };
}
