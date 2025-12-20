import { Calculator } from '@/types';

// Static map of category loaders
const categoryLoaders: Record<string, () => Promise<{ [key: string]: Calculator[] }>> = {
    'business-startup': () => import('@/data/calculators/business-startup'),
    'cooking-food': () => import('@/data/calculators/cooking-food'),
    'engineering': () => import('@/data/calculators/engineering'),
    'environment': () => import('@/data/calculators/environment'),
    'finance': () => import('@/data/calculators/finance'),
    'health-fitness': () => import('@/data/calculators/health-fitness'),
    'home-improvement': () => import('@/data/calculators/home-improvement'),
    'personal-budgeting': () => import('@/data/calculators/personal-budgeting'),
    'technology': () => import('@/data/calculators/technology'),
    'time-date': () => import('@/data/calculators/time-date'),
    'travel-adventure': () => import('@/data/calculators/travel-adventure'),
    'wellness': () => import('@/data/calculators/wellness'),
};

export async function getCalculator(category: string, slug: string): Promise<Calculator | undefined> {
    // Special handling for wellness (maps to health-fitness)
    const targetCategory = category === 'wellness' ? 'health-fitness' : category;

    const loader = categoryLoaders[targetCategory];
    if (!loader) return undefined;

    try {
        const module = await loader();
        // The exported variable name is usually `${category}_calculators` or just check values
        // But my script used `${cat.replace(/-/g, '_')}_calculators`

        // We can just find the array in the module
        const calcs = Object.values(module)[0] as Calculator[];
        return calcs.find(c => c.slug === slug);
    } catch (error) {
        console.error(`Failed to load data for category ${targetCategory}`, error);
        return undefined;
    }
}

export async function getCalculatorsByCategory(category: string): Promise<Calculator[]> {
    const targetCategory = category === 'wellness' ? 'health-fitness' : category;

    const loader = categoryLoaders[targetCategory];
    if (!loader) return [];

    try {
        const module = await loader();
        const calcs = Object.values(module)[0] as Calculator[];
        return calcs;
    } catch (error) {
        console.error(`Failed to load calculators for category ${targetCategory}`, error);
        return [];
    }
}
