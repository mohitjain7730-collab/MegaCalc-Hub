'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Gamepad2, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
    saplingType: z.enum(['oak', 'spruce', 'birch', 'jungle', 'acacia', 'dark_oak', 'cherry', 'mangrove'], { invalid_type_error: 'Select sapling type' }),
    saplingCount: z.number({ invalid_type_error: 'Enter sapling count' }).min(1),
    boneMealPerSapling: z.number({ invalid_type_error: 'Enter bone meal per sapling' }).min(0).optional(),
    growthRate: z.number({ invalid_type_error: 'Enter growth rate' }).min(0).max(100).optional(),
    farmEfficiency: z.number({ invalid_type_error: 'Enter farm efficiency' }).min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Base logs per tree (varies by tree type)
const logsPerTree: Record<string, number> = {
    oak: 4,
    spruce: 6,
    birch: 4,
    jungle: 4,
    acacia: 4,
    dark_oak: 6,
    cherry: 4,
    mangrove: 5,
};

// Base saplings per tree (for sustainability)
const saplingsPerTree: Record<string, number> = {
    oak: 2,
    spruce: 2,
    birch: 2,
    jungle: 1,
    acacia: 2,
    dark_oak: 2,
    cherry: 2,
    mangrove: 1,
};

type ResultPayload = {
    saplingType: string;
    saplingCount: number;
    boneMealPerSapling: number;
    growthRate: number;
    farmEfficiency: number;
    logsPerTree: number;
    saplingsPerTree: number;
    treesGrown: number;
    totalLogs: number;
    totalSaplings: number;
    netSaplings: number;
    logsPerHour: number;
    logsPerDay: number;
    sustainability: boolean;
    status: 'low-output' | 'moderate-output' | 'good-output' | 'high-output';
    interpretation: string;
    recommendations: string[];
    plan: { label: string; detail: string }[];
};

const calculateResult = (values: FormValues): ResultPayload => {
    const saplingType = values.saplingType;
    const saplingCount = values.saplingCount;
    const boneMealPerSapling = values.boneMealPerSapling ?? 0;
    const growthRate = values.growthRate ?? 100;
    const farmEfficiency = values.farmEfficiency ?? 100;

    // Logs and saplings per tree
    const logsPerTreeValue = logsPerTree[saplingType] || 4;
    const saplingsPerTreeValue = saplingsPerTree[saplingType] || 2;

    // Effective growth rate (accounting for bone meal and growth conditions)
    const effectiveGrowthRate = Math.min(100, growthRate + (boneMealPerSapling > 0 ? 20 : 0));

    // Trees grown (accounting for growth rate and efficiency)
    const treesGrown = saplingCount * (effectiveGrowthRate / 100) * (farmEfficiency / 100);

    // Total logs produced
    const totalLogs = treesGrown * logsPerTreeValue;

    // Total saplings produced
    const totalSaplings = treesGrown * saplingsPerTreeValue;

    // Net saplings (after replanting)
    const netSaplings = totalSaplings - saplingCount;

    // Production rates (assuming 1 growth cycle per hour for natural, faster with bone meal)
    const growthCyclesPerHour = boneMealPerSapling > 0 ? 10 : 1; // Bone meal = faster cycles
    const logsPerHour = (totalLogs * growthCyclesPerHour) / (boneMealPerSapling > 0 ? 1 : 10);
    const logsPerDay = logsPerHour * 24;

    // Sustainability check
    const sustainability = netSaplings >= 0;

    let status: ResultPayload['status'] = 'moderate-output';
    let interpretation = 'Your tree farm output has been calculated based on sapling type, count, growth rate, and efficiency.';

    if (totalLogs >= 100) {
        status = 'high-output';
        interpretation = `High output! ${totalLogs.toFixed(0)} logs per cycle. This is an excellent tree farm with strong production. Great for large-scale wood production.`;
    } else if (totalLogs >= 50) {
        status = 'good-output';
        interpretation = `Good output! ${totalLogs.toFixed(0)} logs per cycle. This is a good tree farm with solid production. Suitable for regular wood needs.`;
    } else if (totalLogs >= 20) {
        status = 'moderate-output';
        interpretation = `Moderate output. ${totalLogs.toFixed(0)} logs per cycle. This is a decent tree farm with reasonable production. Suitable for moderate wood needs.`;
    } else {
        status = 'low-output';
        interpretation = `Lower output. ${totalLogs.toFixed(0)} logs per cycle. This farm may need optimization to improve production. Consider increasing sapling count, growth rate, or efficiency.`;
    }

    const recommendations = [
        `Sapling Type: ${saplingType.charAt(0).toUpperCase() + saplingType.slice(1).replace('_', ' ')}. Logs per tree: ${logsPerTreeValue}, Saplings per tree: ${saplingsPerTreeValue}. ${logsPerTreeValue >= 6 ? 'High log yield - excellent for production.' : 'Standard log yield - good for production.'}`,
        `Sapling Count: ${saplingCount} saplings. ${saplingCount >= 50 ? 'Large farm - excellent production potential.' : saplingCount >= 20 ? 'Medium farm - good production potential.' : 'Small farm - consider expanding for more production.'}`,
        `Growth Rate: ${effectiveGrowthRate.toFixed(0)}% (base: ${growthRate}%, bone meal bonus: ${boneMealPerSapling > 0 ? '+20%' : '0%'}). ${effectiveGrowthRate >= 90 ? 'Excellent growth rate - fast production.' : effectiveGrowthRate >= 70 ? 'Good growth rate - decent production.' : 'Lower growth rate - consider improving conditions or using bone meal.'}`,
        `Farm Efficiency: ${farmEfficiency}%. ${farmEfficiency >= 90 ? 'Excellent efficiency - nearly all saplings grow.' : farmEfficiency >= 75 ? 'Good efficiency - most saplings grow.' : 'Lower efficiency - consider improving farm design or automation.'}`,
        `Total Logs: ${totalLogs.toFixed(0)} logs per cycle. ${totalLogs >= 100 ? 'Excellent production - great for large-scale needs.' : totalLogs >= 50 ? 'Good production - suitable for regular needs.' : totalLogs >= 20 ? 'Moderate production - decent for small needs.' : 'Lower production - consider optimization.'}`,
        `Sustainability: ${sustainability ? 'Sustainable' : 'Unsustainable'}. Net saplings: ${netSaplings >= 0 ? '+' : ''}${netSaplings.toFixed(0)}. ${sustainability ? 'Farm produces enough saplings to replant itself - fully sustainable.' : 'Farm does not produce enough saplings - need external saplings or optimization.'}`,
    ];

    if (!sustainability) {
        recommendations.push(`Sustainability Issue: Farm produces ${Math.abs(netSaplings).toFixed(0)} fewer saplings than needed. To improve: increase sapling count, improve growth rate, increase efficiency, or use tree types with better sapling yields. Sustainability is essential for continuous operation.`);
    }

    if (boneMealPerSapling === 0 && growthRate < 80) {
        recommendations.push(`Growth Optimization: No bone meal used and growth rate is ${growthRate}%. Consider using bone meal for faster growth (increases growth rate by ~20%) or improve growth conditions (lighting, spacing) to increase natural growth rate.`);
    }

    if (farmEfficiency < 80) {
        recommendations.push(`Efficiency Optimization: Farm efficiency is ${farmEfficiency}%. To improve: automate harvesting and replanting, optimize farm design for reliable growth, ensure proper spacing and lighting, and reduce missed growths. Higher efficiency significantly increases production.`);
    }

    const plan = [
        {
            label: 'This Session',
            detail: `Tree farm output: ${totalLogs.toFixed(0)} logs per cycle, ${logsPerHour.toFixed(0)} logs/hour. ${sustainability ? 'Sustainable - can replant automatically.' : 'Not sustainable - need external saplings.'}`
        },
        {
            label: 'This Week',
            detail: 'Optimize tree farm: increase sapling count for more production, improve growth rate (bone meal or better conditions), increase efficiency (automation, better design), ensure sustainability (enough saplings to replant), and choose optimal tree types for your needs.'
        },
        {
            label: 'Ongoing',
            detail: 'Continuously optimize tree farm production: monitor production rates, maintain sustainability, automate farming for continuous production, optimize growth conditions, and track logs per hour to identify optimization opportunities.'
        },
    ];

    return {
        saplingType,
        saplingCount,
        boneMealPerSapling,
        growthRate,
        farmEfficiency,
        logsPerTree: logsPerTreeValue,
        saplingsPerTree: saplingsPerTreeValue,
        treesGrown,
        totalLogs,
        totalSaplings,
        netSaplings,
        logsPerHour,
        logsPerDay,
        sustainability,
        status,
        interpretation,
        recommendations,
        plan,
    };
};

export default function MinecraftTreeFarmOutputCalculatorInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            saplingType: undefined,
            saplingCount: undefined,
            boneMealPerSapling: undefined,
            growthRate: undefined,
            farmEfficiency: undefined,
        },
    });

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gamepad2 className="h-5 w-5" />
                        Minecraft Tree Farm Output Calculator
                    </CardTitle>
                    <CardDescription>Calculate tree farm output based on sapling type, bone meal usage, growth rates, and farm efficiency.</CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Input your tree farm information</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit((values) => {
                            try {
                                setResult(calculateResult(values));
                            } catch (error) {
                                console.error('Error calculating result:', error);
                                alert('An error occurred while calculating. Please check the console for details.');
                            }
                        }, (errors) => {
                            console.log('Form validation errors:', errors);
                        })} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="saplingType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sapling Type</FormLabel>
                                            <FormControl>
                                                <select
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(e.target.value as FormValues['saplingType'])}
                                                    className="w-full px-3 py-2 border rounded-md"
                                                >
                                                    <option value="">Select sapling type</option>
                                                    <option value="oak">Oak (4 logs, 2 saplings)</option>
                                                    <option value="spruce">Spruce (6 logs, 2 saplings)</option>
                                                    <option value="birch">Birch (4 logs, 2 saplings)</option>
                                                    <option value="jungle">Jungle (4 logs, 1 sapling)</option>
                                                    <option value="acacia">Acacia (4 logs, 2 saplings)</option>
                                                    <option value="dark_oak">Dark Oak (6 logs, 2 saplings)</option>
                                                    <option value="cherry">Cherry (4 logs, 2 saplings)</option>
                                                    <option value="mangrove">Mangrove (5 logs, 1 sapling)</option>
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="saplingCount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sapling Count</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="boneMealPerSapling"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bone Meal Per Sapling (optional, defaults to 0)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g., 1" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="growthRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Growth Rate (0-100%, optional, defaults to 100%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 80" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="farmEfficiency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Farm Efficiency (0-100%, optional, defaults to 100%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 90" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                Calculate Tree Farm Output
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-primary" />
                            Interactive results
                        </CardTitle>
                        <CardDescription>See tree output, logs per cycle/hour/day, sapling sustainability, and recommendations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Total Logs</p>
                                <p className="text-2xl font-semibold text-primary">{result.totalLogs.toFixed(0)}</p>
                                <p className="text-xs text-muted-foreground">Logs per cycle</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Logs Per Hour</p>
                                <p className="text-2xl font-semibold text-primary">{result.logsPerHour.toFixed(0)}</p>
                                <p className="text-xs text-muted-foreground">Logs/hour</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Net Saplings</p>
                                <p className={`text-2xl font-semibold ${result.netSaplings >= 0 ? 'text-primary' : 'text-red-500'}`}>
                                    {result.netSaplings >= 0 ? '+' : ''}{result.netSaplings.toFixed(0)}
                                </p>
                                <p className="text-xs text-muted-foreground">{result.sustainability ? 'Sustainable' : 'Unsustainable'}</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
                                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Trees Grown</p>
                                <p className="text-xl font-semibold text-primary">{result.treesGrown.toFixed(0)}</p>
                                <p className="text-xs text-muted-foreground">Trees per cycle</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Logs Per Tree</p>
                                <p className="text-xl font-semibold text-primary">{result.logsPerTree}</p>
                                <p className="text-xs text-muted-foreground">Logs per tree</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Farm Efficiency</p>
                                <p className="text-xl font-semibold text-primary">{result.farmEfficiency}%</p>
                                <p className="text-xs text-muted-foreground">{result.farmEfficiency >= 90 ? 'Excellent' : result.farmEfficiency >= 75 ? 'Good' : 'Needs improvement'}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Target className="h-4 w-4" />
                                        Recommendations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                                        {result.recommendations.map((rec, idx) => (
                                            <li key={idx}>{rec}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Activity className="h-4 w-4" />
                                        Action plan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-1 text-sm text-muted-foreground">
                                        {result.plan.map((step) => (
                                            <li key={step.label}>
                                                <span className="font-semibold">{step.label}:</span> {step.detail}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Formula
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>
                        <strong>Effective Growth Rate</strong> = Base Growth Rate + (Bone Meal Bonus if used). Bone meal increases growth rate by approximately 20%. Higher growth rate means more trees grow per cycle.
                    </p>
                    <p>
                        <strong>Trees Grown</strong> = Sapling Count × (Effective Growth Rate / 100) × (Farm Efficiency / 100). This calculates how many trees actually grow, accounting for growth rate and efficiency. Higher values mean more production.
                    </p>
                    <p>
                        <strong>Total Logs</strong> = Trees Grown × Logs Per Tree. This calculates total logs produced per cycle. Logs per tree varies by tree type (Oak/Birch = 4, Spruce/Dark Oak = 6, etc.). Higher logs per tree means more wood production.
                    </p>
                    <p>
                        <strong>Total Saplings</strong> = Trees Grown × Saplings Per Tree. This calculates total saplings produced per cycle. Saplings per tree varies by tree type (most = 2, Jungle/Mangrove = 1). Higher sapling yields improve sustainability.
                    </p>
                    <p>
                        <strong>Net Saplings</strong> = Total Saplings - Sapling Count. This calculates sapling surplus or deficit after replanting. Positive values mean sustainable (can replant), negative values mean unsustainable (need external saplings). Sustainability is essential for continuous operation.
                    </p>
                    <p>
                        <strong>Logs Per Hour</strong> = (Total Logs × Growth Cycles Per Hour). Growth cycles per hour depend on bone meal usage (bone meal = faster cycles). Higher cycles per hour mean more production over time.
                    </p>
                    <p>These formulas help you understand tree farm output, calculate production rates, assess sustainability, and optimize farm performance. Track logs per cycle and sustainability to ensure continuous wood production.</p>
                </CardContent>
            </Card>
        </div>
    );
}
