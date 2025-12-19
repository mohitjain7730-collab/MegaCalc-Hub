
// Utility to create a conversion function based on a base unit map
function createConverter(units: Record<string, number>) {
    return function convert(value: number, fromUnit: string, toUnit: string): number {
        const fromFactor = units[fromUnit];
        const toFactor = units[toUnit];
        if (fromFactor === undefined || toFactor === undefined) {
            console.warn(`Unit not found: ${fromUnit} -> ${toUnit}`);
            return 0;
        }
        // Convert to base unit then to target unit
        const baseValue = value * fromFactor;
        return baseValue / toFactor;
    };
}

// Utility to create a unit array for dropdowns
function createUnitList(units: Record<string, number>, labels: Record<string, string>) {
    return Object.keys(units).map(key => ({
        value: key,
        label: labels[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ')
    }));
}

// ==========================================
// 1. Angle
// Base: degree
const ANGLE_RATES: Record<string, number> = {
    'degree': 1,
    'radian': 180 / Math.PI,
    'gradian': 0.9,
    'milliradian': 180 / (Math.PI * 1000),
    'minute-of-arc': 1 / 60,
    'second-of-arc': 1 / 3600,
    'revolution': 360,
    'circle': 360,
    'turn': 360,
    'quadrant': 90,
    'sextant': 60,
};
const ANGLE_LABELS: Record<string, string> = {
    'degree': 'Degrees (°)',
    'radian': 'Radians (rad)',
    'gradian': 'Gradians (gon)',
    'milliradian': 'Milliradians (mrad)',
    'minute-of-arc': 'Minutes of Arc (\')',
    'second-of-arc': 'Seconds of Arc (")',
    'revolution': 'Revolutions (rev)',
    'circle': 'Circles',
    'turn': 'Turns',
    'quadrant': 'Quadrants',
    'sextant': 'Sextants',
};
export const ANGLE_UNITS = createUnitList(ANGLE_RATES, ANGLE_LABELS);
export const convertAngle = createConverter(ANGLE_RATES);

// ==========================================
// 2. Area
// Base: square-meter
const AREA_RATES: Record<string, number> = {
    'square-meter': 1,
    'square-kilometer': 1e6,
    'square-centimeter': 1e-4,
    'square-millimeter': 1e-6,
    'square-micrometer': 1e-12,
    'hectare': 10000,
    'square-mile': 2589988.110336,
    'square-yard': 0.83612736,
    'square-foot': 0.09290304,
    'square-inch': 0.00064516,
    'acre': 4046.8564224,
};
const AREA_LABELS: Record<string, string> = {
    'square-meter': 'Square Meters (m²)',
    'square-kilometer': 'Square Kilometers (km²)',
    'square-centimeter': 'Square Centimeters (cm²)',
    'square-millimeter': 'Square Millimeters (mm²)',
    'square-micrometer': 'Square Micrometers (µm²)',
    'hectare': 'Hectares (ha)',
    'square-mile': 'Square Miles (mi²)',
    'square-yard': 'Square Yards (yd²)',
    'square-foot': 'Square Feet (ft²)',
    'square-inch': 'Square Inches (in²)',
    'acre': 'Acres (ac)',
};
export const AREA_UNITS = createUnitList(AREA_RATES, AREA_LABELS);
export const convertArea = createConverter(AREA_RATES);

// ==========================================
// 3. Chemical Concentration
// Base: moles-per-liter (Molar)
const CHEM_RATES: Record<string, number> = {
    'moles-per-liter': 1,
    'millimoles-per-liter': 1e-3,
    'micromoles-per-liter': 1e-6,
    'nanomoles-per-liter': 1e-9,
    'picomoles-per-liter': 1e-12,
};
const CHEM_LABELS: Record<string, string> = {
    'moles-per-liter': 'Molar (M)',
    'millimoles-per-liter': 'Millimolar (mM)',
    'micromoles-per-liter': 'Micromolar (µM)',
    'nanomoles-per-liter': 'Nanomolar (nM)',
    'picomoles-per-liter': 'Picomolar (pM)',
};
export const CHEMICAL_CONCENTRATION_UNITS = createUnitList(CHEM_RATES, CHEM_LABELS);
export const convertChemicalConcentration = createConverter(CHEM_RATES);

// ==========================================
// 4. Construction
// Base: meter
// Note: This matches Length, but specific keys might be different in UI (e.g. chains, rods).
// Default usage is simple length.
const CONSTRUCTION_RATES = AREA_RATES; // Or Length? 'meter' suggests length.
// Wait, construction-converter defaults to 'foot' and 'meter'.
// Let's assume it's length based.
const CONST_LENGTH_RATES: Record<string, number> = {
    'meter': 1,
    'centimeter': 0.01,
    'millimeter': 0.001,
    'foot': 0.3048,
    'inch': 0.0254,
    'yard': 0.9144,
};
const CONST_LENGTH_LABELS: Record<string, string> = {
    'meter': 'Meters (m)',
    'centimeter': 'Centimeters (cm)',
    'millimeter': 'Millimeters (mm)',
    'foot': 'Feet (ft)',
    'inch': 'Inches (in)',
    'yard': 'Yards (yd)',
};
export const CONSTRUCTION_UNITS = createUnitList(CONST_LENGTH_RATES, CONST_LENGTH_LABELS);
export const convertConstruction = createConverter(CONST_LENGTH_RATES);

// ==========================================
// 5. Cooking
// Base: liter
const COOKING_RATES: Record<string, number> = {
    'liter': 1,
    'milliliter': 0.001,
    'us-cup': 0.236588,
    'us-tablespoon': 0.0147868,
    'us-teaspoon': 0.00492892,
    'us-fluid-ounce': 0.0295735,
    'us-pint': 0.473176,
    'us-quart': 0.946353,
    'us-gallon': 3.78541,
    'imperial-cup': 0.284131,
    'imperial-tablespoon': 0.0177582,
    'imperial-teaspoon': 0.00591939,
    'imperial-fluid-ounce': 0.0284131,
    'imperial-pint': 0.568261,
    'imperial-quart': 1.13652,
    'imperial-gallon': 4.54609,
};
const COOKING_LABELS: Record<string, string> = {
    'liter': 'Liters (L)',
    'milliliter': 'Milliliters (mL)',
    'us-cup': 'US Cups',
    'us-tablespoon': 'US Tablespoons (tbsp)',
    'us-teaspoon': 'US Teaspoons (tsp)',
    'us-fluid-ounce': 'US Fluid Ounces (fl oz)',
    'us-pint': 'US Pints (pt)',
    'us-quart': 'US Quarts (qt)',
    'us-gallon': 'US Gallons (gal)',
    'imperial-cup': 'Imperial Cups',
    'imperial-tablespoon': 'Imperial Tablespoons',
    'imperial-teaspoon': 'Imperial Teaspoons',
    'imperial-fluid-ounce': 'Imperial Fluid Ounces',
    'imperial-pint': 'Imperial Pints',
    'imperial-quart': 'Imperial Quarts',
    'imperial-gallon': 'Imperial Gallons',
};
export const COOKING_UNITS = createUnitList(COOKING_RATES, COOKING_LABELS);
export const convertCooking = createConverter(COOKING_RATES);

// ==========================================
// 6. Data Storage
// Base: byte
// Using KB = 1024 implicitly based on description
const DATA_RATES: Record<string, number> = {
    'bit': 0.125,
    'byte': 1,
    'kilobyte': 1024,
    'megabyte': 1048576,
    'gigabyte': 1073741824,
    'terabyte': 1099511627776,
    'petabyte': 1125899906842624,
    'kibibyte': 1024,
    'mebibyte': 1048576,
    'gibibyte': 1073741824,
    'tebibyte': 1099511627776,
    'pebibyte': 1125899906842624,
};
const DATA_LABELS: Record<string, string> = {
    'bit': 'Bits (b)',
    'byte': 'Bytes (B)',
    'kilobyte': 'Kilobytes (KB)',
    'megabyte': 'Megabytes (MB)',
    'gigabyte': 'Gigabytes (GB)',
    'terabyte': 'Terabytes (TB)',
    'petabyte': 'Petabytes (PB)',
    'kibibyte': 'Kibibytes (KiB)',
    'mebibyte': 'Mebibytes (MiB)',
    'gibibyte': 'Gibibytes (GiB)',
    'tebibyte': 'Tebibytes (TiB)',
    'pebibyte': 'Pebibytes (PiB)',
};
export const DATA_STORAGE_UNITS = createUnitList(DATA_RATES, DATA_LABELS);
export const convertDataStorage = createConverter(DATA_RATES);

// ==========================================
// 7. Data Transfer Speed
// Base: bits-per-second
const DATA_SPEED_RATES: Record<string, number> = {
    'bits-per-second': 1,
    'kilobits-per-second': 1000,
    'megabits-per-second': 1e6,
    'gigabits-per-second': 1e9,
    'terabits-per-second': 1e12,
    'bytes-per-second': 8,
    'kilobytes-per-second': 8000,
    'megabytes-per-second': 8e6,
    'gigabytes-per-second': 8e9,
    'terabytes-per-second': 8e12,
};
const DATA_SPEED_LABELS: Record<string, string> = {
    'bits-per-second': 'Bits per second (bps)',
    'kilobits-per-second': 'Kilobits per second (Kbps)',
    'megabits-per-second': 'Megabits per second (Mbps)',
    'gigabits-per-second': 'Gigabits per second (Gbps)',
    'terabits-per-second': 'Terabits per second (Tbps)',
    'bytes-per-second': 'Bytes per second (Bps)',
    'kilobytes-per-second': 'Kilobytes per second (KBps)',
    'megabytes-per-second': 'Megabytes per second (MBps)',
    'gigabytes-per-second': 'Gigabytes per second (GBps)',
    'terabytes-per-second': 'Terabytes per second (TBps)',
};
export const DATA_TRANSFER_SPEED_UNITS = createUnitList(DATA_SPEED_RATES, DATA_SPEED_LABELS);
export const convertDataTransferSpeed = createConverter(DATA_SPEED_RATES);

// ==========================================
// 8. Density
// Base: kilogram-per-cubic-meter
const DENSITY_RATES: Record<string, number> = {
    'kg-per-cubic-meter': 1,
    'g-per-cubic-cm': 1000,
    'g-per-milliliter': 1000,
    'kg-per-liter': 1000,
    'lb-per-cubic-inch': 27679.9,
    'lb-per-cubic-foot': 16.0185,
    'lb-per-gallon': 119.826,
};
const DENSITY_LABELS: Record<string, string> = {
    'kg-per-cubic-meter': 'kg/m³',
    'g-per-cubic-cm': 'g/cm³',
    'g-per-milliliter': 'g/mL',
    'kg-per-liter': 'kg/L',
    'lb-per-cubic-inch': 'lb/in³',
    'lb-per-cubic-foot': 'lb/ft³',
    'lb-per-gallon': 'lb/gal',
};
export const DENSITY_UNITS = createUnitList(DENSITY_RATES, DENSITY_LABELS);
export const convertDensity = createConverter(DENSITY_RATES);

// ==========================================
// 9. Electrical (Ohm's Law) - Special Logic
export function calculateOhmsLaw(
    values: { voltage?: number; current?: number; resistance?: number; power?: number },
    calculate: 'voltage' | 'current' | 'resistance' | 'power'
): { voltage: number; current: number; resistance: number; power: number } | null {
    const { voltage: V, current: I, resistance: R, power: P } = values;

    // Need at least 2 values to calculate the others
    const providedCount = [V, I, R, P].filter(v => v !== undefined).length;
    // Actually, standard Ohm's law input is 2 knowns. 
    // The UI prevents entering more than 2 usually, or ignores.

    try {
        if (V !== undefined && I !== undefined) {
            return { voltage: V, current: I, resistance: V / I, power: V * I };
        }
        if (V !== undefined && R !== undefined) {
            return { voltage: V, current: V / R, resistance: R, power: (V * V) / R };
        }
        if (V !== undefined && P !== undefined) {
            return { voltage: V, current: P / V, resistance: (V * V) / P, power: P };
        }
        if (I !== undefined && R !== undefined) {
            return { voltage: I * R, current: I, resistance: R, power: I * I * R };
        }
        if (I !== undefined && P !== undefined) {
            return { voltage: P / I, current: I, resistance: P / (I * I), power: P };
        }
        if (R !== undefined && P !== undefined) {
            return { voltage: Math.sqrt(P * R), current: Math.sqrt(P / R), resistance: R, power: P };
        }
    } catch (e) {
        return null;
    }
    return null;
}
// Placeholder units for consistency if referenced, though not used in component
export const ELECTRICAL_UNITS: any[] = [];

// ==========================================
// 10. Energy
// Base: joule
const ENERGY_RATES: Record<string, number> = {
    'joule': 1,
    'kilojoule': 1000,
    'calorie': 4.184,
    'kilocalorie': 4184,
    'watt-hour': 3600,
    'kilowatt-hour': 3.6e6,
    'electronvolt': 1.60218e-19,
    'british-thermal-unit': 1055.06,
    'foot-pound': 1.35582,
};
const ENERGY_LABELS: Record<string, string> = {
    'joule': 'Joules (J)',
    'kilojoule': 'Kilojoules (kJ)',
    'calorie': 'Calories (cal) - Thermochemical',
    'kilocalorie': 'Kilocalories (kcal) - Food',
    'watt-hour': 'Watt-hours (Wh)',
    'kilowatt-hour': 'Kilowatt-hours (kWh)',
    'electronvolt': 'Electronvolts (eV)',
    'british-thermal-unit': 'British Thermal Units (BTU) - ISO',
    'foot-pound': 'Foot-pounds (ft⋅lb)',
};
export const ENERGY_UNITS = createUnitList(ENERGY_RATES, ENERGY_LABELS);
export const convertEnergy = createConverter(ENERGY_RATES);

// ==========================================
// 11. Flow Rate
// Base: liter-per-second
const FLOW_RATES: Record<string, number> = {
    'liter-per-second': 1,
    'liter-per-minute': 1 / 60,
    'liter-per-hour': 1 / 3600,
    'cubic-meter-per-second': 1000,
    'cubic-meter-per-minute': 1000 / 60,
    'cubic-meter-per-hour': 1000 / 3600,
    'us-gallon-per-second': 3.78541,
    'us-gallon-per-minute': 3.78541 / 60,
    'us-gallon-per-hour': 3.78541 / 3600,
    'cubic-foot-per-second': 28.3168,
    'cubic-foot-per-minute': 28.3168 / 60,
};
const FLOW_LABELS: Record<string, string> = {
    'liter-per-second': 'Liters per second (L/s)',
    'liter-per-minute': 'Liters per minute (L/min)',
    'liter-per-hour': 'Liters per hour (L/h)',
    'cubic-meter-per-second': 'Cubic meters per second (m³/s)',
    'cubic-meter-per-minute': 'Cubic meters per minute (m³/min)',
    'cubic-meter-per-hour': 'Cubic meters per hour (m³/h)',
    'us-gallon-per-second': 'US Gallons per second (GPS)',
    'us-gallon-per-minute': 'US Gallons per minute (GPM)',
    'us-gallon-per-hour': 'US Gallons per hour (GPH)',
    'cubic-foot-per-second': 'Cubic feet per second (CFS)',
    'cubic-foot-per-minute': 'Cubic feet per minute (CFM)',
};
export const FLOW_RATE_UNITS = createUnitList(FLOW_RATES, FLOW_LABELS);
export const convertFlowRate = createConverter(FLOW_RATES);

// ==========================================
// 12. Force
// Base: newton
const FORCE_RATES: Record<string, number> = {
    'newton': 1,
    'kilonewton': 1000,
    'gram-force': 0.00980665,
    'kilogram-force': 9.80665,
    'pound-force': 4.44822,
    'ounce-force': 0.278014,
    'dyne': 1e-5,
};
const FORCE_LABELS: Record<string, string> = {
    'newton': 'Newtons (N)',
    'kilonewton': 'Kilonewtons (kN)',
    'gram-force': 'Gram-force (gf)',
    'kilogram-force': 'Kilogram-force (kgf)',
    'pound-force': 'Pound-force (lbf)',
    'ounce-force': 'Ounce-force (ozf)',
    'dyne': 'Dynes (dyn)',
};
export const FORCE_UNITS = createUnitList(FORCE_RATES, FORCE_LABELS);
export const convertForce = createConverter(FORCE_RATES);

// ==========================================
// 13. Frequency
// Base: hertz
const FREQ_RATES: Record<string, number> = {
    'hertz': 1,
    'kilohertz': 1000,
    'megahertz': 1e6,
    'gigahertz': 1e9,
    'terahertz': 1e12,
    'revolution-per-minute': 1 / 60,
    'degree-per-second': 1 / 360,
    'radian-per-second': 1 / (2 * Math.PI),
};
const FREQ_LABELS: Record<string, string> = {
    'hertz': 'Hertz (Hz)',
    'kilohertz': 'Kilohertz (kHz)',
    'megahertz': 'Megahertz (MHz)',
    'gigahertz': 'Gigahertz (GHz)',
    'terahertz': 'Terahertz (THz)',
    'revolution-per-minute': 'Revolutions per minute (RPM)',
    'degree-per-second': 'Degrees per second (deg/s)',
    'radian-per-second': 'Radians per second (rad/s)',
};
export const FREQUENCY_UNITS = createUnitList(FREQ_RATES, FREQ_LABELS);
export const convertFrequency = createConverter(FREQ_RATES);

// ==========================================
// 14. Fuel Economy
// Base: meter-per-liter ? No, formulas are customized.
// Usually MPG vs L/100km are inverse.
// We'll write a custom converter for this if needed, or stick to simple factors if possible.
// L/100km = 235.215 / MPG_US
// This is non-linear. The 'createConverter' won't work for inverse.
// However, the component might import `convertFuelEconomy`.
export const FUEL_ECONOMY_UNITS = [
    { value: 'mpg-us', label: 'Miles per Gallon (US)' },
    { value: 'mpg-imp', label: 'Miles per Gallon (Imp)' },
    { value: 'km-per-liter', label: 'Kilometers per Liter (km/L)' },
    { value: 'liters-per-100km', label: 'Liters per 100 Kilometers (L/100km)' },
];
export function convertFuelEconomy(value: number, fromUnit: string, toUnit: string): number {
    // Convert everything to MPG (US) first
    let mpgUS = 0;
    if (fromUnit === 'mpg-us') mpgUS = value;
    else if (fromUnit === 'mpg-imp') mpgUS = value * 0.832674;
    else if (fromUnit === 'km-per-liter') mpgUS = value * 2.35215;
    else if (fromUnit === 'liters-per-100km') mpgUS = 235.215 / value; // Inverse

    // Convert MPG (US) to target
    if (toUnit === 'mpg-us') return mpgUS;
    if (toUnit === 'mpg-imp') return mpgUS / 0.832674;
    if (toUnit === 'km-per-liter') return mpgUS / 2.35215;
    if (toUnit === 'liters-per-100km') return 235.215 / mpgUS; // Inverse
    return 0;
}

// ==========================================
// 15. Length
// Base: meter
const LENGTH_RATES: Record<string, number> = {
    'kilometer': 1000,
    'meter': 1,
    'centimeter': 0.01,
    'millimeter': 0.001,
    'micrometer': 1e-6,
    'nanometer': 1e-9,
    'mile': 1609.34,
    'yard': 0.9144,
    'foot': 0.3048,
    'inch': 0.0254,
    'nautical-mile': 1852,
};
const LENGTH_LABELS: Record<string, string> = {
    'kilometer': 'Kilometers (km)',
    'meter': 'Meters (m)',
    'centimeter': 'Centimeters (cm)',
    'millimeter': 'Millimeters (mm)',
    'micrometer': 'Micrometers (µm)',
    'nanometer': 'Nanometers (nm)',
    'mile': 'Miles (mi)',
    'yard': 'Yards (yd)',
    'foot': 'Feet (ft)',
    'inch': 'Inches (in)',
    'nautical-mile': 'Nautical Miles (nmi)',
};
export const LENGTH_UNITS = createUnitList(LENGTH_RATES, LENGTH_LABELS);
export const convertLength = createConverter(LENGTH_RATES);

// ==========================================
// 16. Luminance
// Base: candela-per-square-meter
const LUM_RATES: Record<string, number> = {
    'candela-per-square-meter': 1,
    'nit': 1,
    'stilb': 10000,
    'lambert': 3183.0988618, // 10^4 / pi
    'foot-lambert': 3.4262590996,
};
const LUM_LABELS: Record<string, string> = {
    'candela-per-square-meter': 'Candela per m² (cd/m²)',
    'nit': 'Nits (nt)',
    'stilb': 'Stilbs (sb)',
    'lambert': 'Lamberts (L)',
    'foot-lambert': 'Foot-Lamberts (fL)',
};
export const LUMINANCE_UNITS = createUnitList(LUM_RATES, LUM_LABELS);
// component may expect 'luminance-and-light-converter' naming convention?
// Likely imports `convertLuminance`?
// Let's assume `convertLuminance` based on folder name `luminance-and-light-converter`
export const convertLuminance = createConverter(LUM_RATES);
export const LUMINANCE_AND_LIGHT_UNITS = LUMINANCE_UNITS; // Alias if needed

// ==========================================
// 17. Material (Mass <-> Volume via Density)
// Material densities in kg/m^3
export const MATERIAL_DENSITIES: Record<string, number> = {
    'water': 1000,
    'steel': 7850,
    'concrete': 2400,
    'aluminum': 2700,
    'gold': 19300,
    'silver': 10490,
    'copper': 8960,
    'lead': 11340,
    'iron': 7874,
    'glass': 2500,
    'wood-oak': 750,
    'wood-pine': 600,
    'plastic-pp': 900,
    'rubber': 1100,
    'oil': 920,
    'milk': 1030,
    'honey': 1420,
    'flour': 528, // packed? varies widely
    'sugar': 845,
    'salt': 1217,
    'sand': 1600,
    'gravel': 1680,
    'air': 1.225,
};

export const MATERIAL_UNITS = [
    { value: 'water', label: 'Water' },
    { value: 'steel', label: 'Steel' },
    { value: 'concrete', label: 'Concrete' },
    { value: 'aluminum', label: 'Aluminum' },
    { value: 'gold', label: 'Gold' },
    { value: 'silver', label: 'Silver' },
    { value: 'copper', label: 'Copper' },
    { value: 'lead', label: 'Lead' },
    { value: 'iron', label: 'Iron' },
    { value: 'glass', label: 'Glass' },
    { value: 'wood-oak', label: 'Wood (Oak)' },
    { value: 'wood-pine', label: 'Wood (Pine)' },
    { value: 'plastic-pp', label: 'Plastic (Polypropylene)' },
    { value: 'rubber', label: 'Rubber' },
    { value: 'oil', label: 'Oil (Vegetable)' },
    { value: 'milk', label: 'Milk' },
    { value: 'honey', label: 'Honey' },
    { value: 'flour', label: 'Flour (Wheat)' },
    { value: 'sugar', label: 'Sugar (Granulated)' },
    { value: 'salt', label: 'Salt (Table)' },
    { value: 'sand', label: 'Sand' },
    { value: 'gravel', label: 'Gravel' },
    { value: 'air', label: 'Air (Sea Level)' },
];

export function convertMaterialMassVolume(
    value: number,
    fromUnit: string,
    toUnit: string,
    material: string
): number {
    const density = MATERIAL_DENSITIES[material];
    if (!density) return 0;

    // Strategy: Convert FROM unit to Base (kg or m^3).
    // Then use density to swap dimension if needed.
    // Then convert to TO unit.

    // Helpers from existing maps
    // WEIGHT_RATES (kg=1), VOLUME_RATES (L=1)
    const isFromMass = WEIGHT_RATES[fromUnit] !== undefined;
    const isToMass = WEIGHT_RATES[toUnit] !== undefined;

    let valInKgOrLiter = 0;

    // 1. Normalize to kg or Liter
    if (isFromMass) {
        // value * factor = kg
        valInKgOrLiter = value * WEIGHT_RATES[fromUnit];
    } else {
        // createConverter does (value * fromFactor) / toFactor.
        // So 'fromFactor' converts unit -> base.
        valInKgOrLiter = value * (VOL_RATES[fromUnit] || 0);
    }

    // 2. Apply Density to switch dimension if needed
    // Mass = Volume * Density
    // Volume = Mass / Density
    // Density is kg/m^3.
    // Note: Volume base is Liter. 1 m^3 = 1000 L.
    // Density = kg / (1000 L) ==> Density/1000 kg/L.
    const densityKgPerL = density / 1000;

    let finalBaseVal = 0; // kg or Liter

    if (isFromMass && isToMass) {
        finalBaseVal = valInKgOrLiter; // kg
    } else if (!isFromMass && !isToMass) {
        finalBaseVal = valInKgOrLiter; // L
    } else if (isFromMass && !isToMass) {
        // Mass(kg) -> Volume(L)
        // V = M / D
        finalBaseVal = valInKgOrLiter / densityKgPerL;
    } else if (!isFromMass && isToMass) {
        // Volume(L) -> Mass(kg)
        // M = V * D
        finalBaseVal = valInKgOrLiter * densityKgPerL;
    }

    // 3. Convert to target unit
    if (isToMass) {
        // kg -> target
        // target = base / factor
        return finalBaseVal / WEIGHT_RATES[toUnit];
    } else {
        // L -> target
        return finalBaseVal / (VOL_RATES[toUnit] || 1);
    }
}

// ==========================================
// 18. Power
// Base: watt
const POWER_RATES: Record<string, number> = {
    'watt': 1,
    'kilowatt': 1000,
    'megawatt': 1e6,
    'gigawatt': 1e9,
    'milliwatt': 0.001,
    'horsepower-mechanical': 745.699872,
    'horsepower-metric': 735.49875,
    'horsepower-electric': 746,
    'btu-per-hour': 0.293071,
    'calorie-per-second': 4.184, // thermochemical
};
const POWER_LABELS: Record<string, string> = {
    'watt': 'Watts (W)',
    'kilowatt': 'Kilowatts (kW)',
    'megawatt': 'Megawatts (MW)',
    'gigawatt': 'Gigawatts (GW)',
    'milliwatt': 'Milliwatts (mW)',
    'horsepower-mechanical': 'Horsepower (hp) - Mechanical',
    'horsepower-metric': 'Horsepower (PS) - Metric',
    'horsepower-electric': 'Horsepower (hp) - Electric',
    'btu-per-hour': 'BTU per hour',
    'calorie-per-second': 'Calories per second',
};
export const POWER_UNITS = createUnitList(POWER_RATES, POWER_LABELS);
export const convertPower = createConverter(POWER_RATES);

// ==========================================
// 19. Pressure
// Base: pascal
const PRESSURE_RATES: Record<string, number> = {
    'pascal': 1,
    'kilopascal': 1000,
    'megapascal': 1e6,
    'bar': 100000,
    'millibar': 100,
    'atmosphere': 101325,
    'psi': 6894.76,
    'torr': 133.322,
    'mmhg': 133.322,
};
const PRESSURE_LABELS: Record<string, string> = {
    'pascal': 'Pascals (Pa)',
    'kilopascal': 'Kilopascals (kPa)',
    'megapascal': 'Megapascals (MPa)',
    'bar': 'Bars (bar)',
    'millibar': 'Millibars (mbar)',
    'atmosphere': 'Atmospheres (atm)',
    'psi': 'Pounds per Square Inch (psi)',
    'torr': 'Torr',
    'mmhg': 'Millimeters of Mercury (mmHg)',
};
export const PRESSURE_UNITS = createUnitList(PRESSURE_RATES, PRESSURE_LABELS);
export const convertPressure = createConverter(PRESSURE_RATES);

// ==========================================
// 20. Speed
// Base: meter-per-second
const SPEED_RATES: Record<string, number> = {
    'meter-per-second': 1,
    'kilometer-per-hour': 0.277778,
    'miles-per-hour': 0.44704,
    'knot': 0.514444,
    'foot-per-second': 0.3048,
    'mach': 343, // Standard atmosphere
};
const SPEED_LABELS: Record<string, string> = {
    'meter-per-second': 'Meters per second (m/s)',
    'kilometer-per-hour': 'Kilometers per hour (km/h)',
    'miles-per-hour': 'Miles per hour (mph)',
    'knot': 'Knots (kn)',
    'foot-per-second': 'Feet per second (ft/s)',
    'mach': 'Mach (Speed of Sound)',
};
export const SPEED_UNITS = createUnitList(SPEED_RATES, SPEED_LABELS);
export const convertSpeed = createConverter(SPEED_RATES);

// ==========================================
// 21. Temperature
// Base: celsius (but non-linear)
export const TEMPERATURE_UNITS = [
    { value: 'celsius', label: 'Celsius (°C)' },
    { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
    { value: 'kelvin', label: 'Kelvin (K)' },
];
export function convertTemperature(value: number, fromUnit: string, toUnit: string): number {
    let celsius = 0;
    if (fromUnit === 'celsius') celsius = value;
    else if (fromUnit === 'fahrenheit') celsius = (value - 32) * 5 / 9;
    else if (fromUnit === 'kelvin') celsius = value - 273.15;

    if (toUnit === 'celsius') return celsius;
    if (toUnit === 'fahrenheit') return (celsius * 9 / 5) + 32;
    if (toUnit === 'kelvin') return celsius + 273.15;
    return 0;
}

// ==========================================
// 22. Time
// Base: second
const TIME_RATES: Record<string, number> = {
    'second': 1,
    'millisecond': 0.001,
    'microsecond': 1e-6,
    'nanosecond': 1e-9,
    'minute': 60,
    'hour': 3600,
    'day': 86400,
    'week': 604800,
    'month': 2628000, // appx
    'year': 31536000,
    'decade': 315360000,
    'century': 3153600000,
};
const TIME_LABELS: Record<string, string> = {
    'second': 'Seconds (s)',
    'millisecond': 'Milliseconds (ms)',
    'microsecond': 'Microseconds (µs)',
    'nanosecond': 'Nanoseconds (ns)',
    'minute': 'Minutes (min)',
    'hour': 'Hours (h)',
    'day': 'Days (d)',
    'week': 'Weeks (wk)',
    'month': 'Months (mo)',
    'year': 'Years (yr)',
    'decade': 'Decades',
    'century': 'Centuries',
};
export const TIME_UNITS = createUnitList(TIME_RATES, TIME_LABELS);
export const convertTime = createConverter(TIME_RATES);

// ==========================================
// 23. Torque
// Base: newton-meter
const TORQUE_RATES: Record<string, number> = {
    'newton-meter': 1,
    'pound-foot': 1.35582,
    'pound-inch': 0.112985,
    'kilogram-meter': 9.80665,
};
const TORQUE_LABELS: Record<string, string> = {
    'newton-meter': 'Newton-meters (N⋅m)',
    'pound-foot': 'Pound-feet (lb⋅ft)',
    'pound-inch': 'Pound-inches (lb⋅in)',
    'kilogram-meter': 'Kilogram-meters (kg⋅m)',
};
export const TORQUE_UNITS = createUnitList(TORQUE_RATES, TORQUE_LABELS);
export const convertTorque = createConverter(TORQUE_RATES);

// ==========================================
// 24. Volume
// Base: liter
const VOL_RATES: Record<string, number> = {
    'liter': 1,
    'milliliter': 0.001,
    'cubic-meter': 1000,
    'cubic-centimeter': 0.001,
    'cubic-inch': 0.0163871,
    'cubic-foot': 28.3168,
    'us-gallon': 3.78541,
    'us-quart': 0.946353,
    'us-pint': 0.473176,
    'us-cup': 0.236588,
    'us-fluid-ounce': 0.0295735,
    'imperial-gallon': 4.54609,
    'imperial-pint': 0.568261,
    'imperial-fluid-ounce': 0.0284131,
};
const VOL_LABELS: Record<string, string> = {
    'liter': 'Liters (L)',
    'milliliter': 'Milliliters (mL)',
    'cubic-meter': 'Cubic Meters (m³)',
    'cubic-centimeter': 'Cubic Centimeters (cm³)',
    'cubic-inch': 'Cubic Inches (in³)',
    'cubic-foot': 'Cubic Feet (ft³)',
    'us-gallon': 'US Gallons (gal)',
    'us-quart': 'US Quarts (qt)',
    'us-pint': 'US Pints (pt)',
    'us-cup': 'US Cups',
    'us-fluid-ounce': 'US Fluid Ounce (fl oz)',
    'imperial-gallon': 'Imperial Gallons (gal)',
    'imperial-pint': 'Imperial Pints (pt)',
    'imperial-fluid-ounce': 'Imperial Fluid Ounce (fl oz)',
};
export const VOLUME_UNITS = createUnitList(VOL_RATES, VOL_LABELS);
export const convertVolume = createConverter(VOL_RATES);

// ==========================================
// 25. Weight
// Base: kilogram
const WEIGHT_RATES: Record<string, number> = {
    'kilogram': 1,
    'gram': 0.001,
    'milligram': 1e-6,
    'microgram': 1e-9,
    'metric-ton': 1000,
    'pound': 0.453592,
    'ounce': 0.0283495,
    'stone': 6.35029,
    'short-ton': 907.185, // US
    'long-ton': 1016.05, // Imperial
    'carat': 0.0002,
};
const WEIGHT_LABELS: Record<string, string> = {
    'kilogram': 'Kilograms (kg)',
    'gram': 'Grams (g)',
    'milligram': 'Milligrams (mg)',
    'microgram': 'Micrograms (µg)',
    'metric-ton': 'Metric Tonnes (t)',
    'pound': 'Pounds (lb)',
    'ounce': 'Ounces (oz)',
    'stone': 'Stones (st)',
    'short-ton': 'Short Tons (US)',
    'long-ton': 'Long Tons (UK)',
    'carat': 'Carats (ct)',
};
export const WEIGHT_UNITS = createUnitList(WEIGHT_RATES, WEIGHT_LABELS);
export const convertWeight = createConverter(WEIGHT_RATES);
