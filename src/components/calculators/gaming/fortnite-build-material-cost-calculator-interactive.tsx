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
    woodWalls: z.number({ invalid_type_error: 'Enter wood walls count' }).min(0),
    stoneWalls: z.number({ invalid_type_error: 'Enter stone walls count' }).min(0),
    metalWalls: z.number({ invalid_type_error: 'Enter metal walls count' }).min(0),
    woodFloors: z.number({ invalid_type_error: 'Enter wood floors count' }).min(0),
    stoneFloors: z.number({ invalid_type_error: 'Enter stone floors count' }).min(0),
    metalFloors: z.number({ invalid_type_error: 'Enter metal floors count' }).min(0),
    woodStairs: z.number({ invalid_type_error: 'Enter wood stairs count' }).min(0),
    stoneStairs: z.number({ invalid_type_error: 'Enter stone stairs count' }).min(0),
    metalStairs: z.number({ invalid_type_error: 'Enter metal stairs count' }).min(0),
    woodRoofs: z.number({ invalid_type_error: 'Enter wood roofs count' }).min(0),
    stoneRoofs: z.number({ invalid_type_error: 'Enter stone roofs count' }).min(0),
    metalRoofs: z.number({ invalid_type_error: 'Enter metal roofs count' }).min(0),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    woodWalls: number;
    stoneWalls: number;
    metalWalls: number;
    woodFloors: number;
    stoneFloors: number;
    metalFloors: number;
    woodStairs: number;
    stoneStairs: number;
    metalStairs: number;
    woodRoofs: number;
    stoneRoofs: number;
    metalRoofs: number;
    totalWood: number;
    totalStone: number;
    totalMetal: number;
    totalCost: number;
    costByMaterial: {
        material: string;
        cost: number;
        percentage: number;
    }[];
    costByStructure: {
        structure: string;
        cost: number;
        percentage: number;
    }[];
    status: 'low-cost' | 'moderate-cost' | 'high-cost' | 'very-high-cost';
    interpretation: string;
    recommendations: string[];
    plan: { label: string; detail: string }[];
};

// Material costs per piece (standard Fortnite costs)
const WOOD_COST = 10;
const STONE_COST = 20;
const METAL_COST = 30;

const calculateResult = (values: FormValues): ResultPayload => {
    const woodWalls = values.woodWalls;
    const stoneWalls = values.stoneWalls;
    const metalWalls = values.metalWalls;
    const woodFloors = values.woodFloors;
    const stoneFloors = values.stoneFloors;
    const metalFloors = values.metalFloors;
    const woodStairs = values.woodStairs;
    const stoneStairs = values.stoneStairs;
    const metalStairs = values.metalStairs;
    const woodRoofs = values.woodRoofs;
    const stoneRoofs = values.stoneRoofs;
    const metalRoofs = values.metalRoofs;

    // Calculate total materials needed
    const totalWood = woodWalls + woodFloors + woodStairs + woodRoofs;
    const totalStone = stoneWalls + stoneFloors + stoneStairs + stoneRoofs;
    const totalMetal = metalWalls + metalFloors + metalStairs + metalRoofs;

    // Calculate total cost (materials × cost per piece)
    const woodCost = totalWood * WOOD_COST;
    const stoneCost = totalStone * STONE_COST;
    const metalCost = totalMetal * METAL_COST;
    const totalCost = woodCost + stoneCost + metalCost;

    // Cost breakdown by material
    const costByMaterial = [
        { material: 'Wood', cost: woodCost, percentage: totalCost > 0 ? (woodCost / totalCost) * 100 : 0 },
        { material: 'Stone', cost: stoneCost, percentage: totalCost > 0 ? (stoneCost / totalCost) * 100 : 0 },
        { material: 'Metal', cost: metalCost, percentage: totalCost > 0 ? (metalCost / totalCost) * 100 : 0 },
    ].filter(item => item.cost > 0);

    // Cost breakdown by structure type
    const wallCost = (woodWalls + stoneWalls + metalWalls) * (WOOD_COST + STONE_COST + METAL_COST) / 3; // Average cost
    const floorCost = (woodFloors + stoneFloors + metalFloors) * (WOOD_COST + STONE_COST + METAL_COST) / 3;
    const stairsCost = (woodStairs + stoneStairs + metalStairs) * (WOOD_COST + STONE_COST + METAL_COST) / 3;
    const roofCost = (woodRoofs + stoneRoofs + metalRoofs) * (WOOD_COST + STONE_COST + METAL_COST) / 3;

    // More accurate structure cost calculation
    const actualWallCost = (woodWalls * WOOD_COST) + (stoneWalls * STONE_COST) + (metalWalls * METAL_COST);
    const actualFloorCost = (woodFloors * WOOD_COST) + (stoneFloors * STONE_COST) + (metalFloors * METAL_COST);
    const actualStairsCost = (woodStairs * WOOD_COST) + (stoneStairs * STONE_COST) + (metalStairs * METAL_COST);
    const actualRoofCost = (woodRoofs * WOOD_COST) + (stoneRoofs * STONE_COST) + (metalRoofs * METAL_COST);

    const costByStructure = [
        { structure: 'Walls', cost: actualWallCost, percentage: totalCost > 0 ? (actualWallCost / totalCost) * 100 : 0 },
        { structure: 'Floors', cost: actualFloorCost, percentage: totalCost > 0 ? (actualFloorCost / totalCost) * 100 : 0 },
        { structure: 'Stairs', cost: actualStairsCost, percentage: totalCost > 0 ? (actualStairsCost / totalCost) * 100 : 0 },
        { structure: 'Roofs', cost: actualRoofCost, percentage: totalCost > 0 ? (actualRoofCost / totalCost) * 100 : 0 },
    ].filter(item => item.cost > 0);

    let status: ResultPayload['status'] = 'moderate-cost';
    let interpretation = 'Your build material costs have been calculated based on structure counts and material types.';

    if (totalCost >= 2000) {
        status = 'very-high-cost';
        interpretation = `Very high material cost! Your build requires ${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} total materials. This is an extensive build that will require significant harvesting and material management.`;
    } else if (totalCost >= 1000) {
        status = 'high-cost';
        interpretation = `High material cost. Your build requires ${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} total materials. This is a substantial build that requires careful material planning and efficient harvesting.`;
    } else if (totalCost >= 500) {
        status = 'moderate-cost';
        interpretation = `Moderate material cost. Your build requires ${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} total materials. This is a reasonable build size that can be managed with standard material collection.`;
    } else {
        status = 'low-cost';
        interpretation = `Low material cost. Your build requires ${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} total materials. This is a small build that can be completed quickly with minimal material collection.`;
    }

    const recommendations = [
        `Total Material Cost: ${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} materials. ${totalCost >= 2000 ? 'Very expensive build - consider reducing structure count or using cheaper materials.' : totalCost >= 1000 ? 'Expensive build - plan material collection carefully.' : totalCost >= 500 ? 'Moderate cost - manageable with standard harvesting.' : 'Low cost - easy to build with minimal materials.'}`,
        `Wood Required: ${totalWood} pieces (${woodCost} materials). ${totalWood > 100 ? 'Large wood requirement - harvest trees efficiently.' : totalWood > 50 ? 'Moderate wood requirement - standard harvesting needed.' : 'Low wood requirement - easy to collect.'}`,
        `Stone Required: ${totalStone} pieces (${stoneCost} materials). ${totalStone > 100 ? 'Large stone requirement - harvest rocks and stone structures.' : totalStone > 50 ? 'Moderate stone requirement - standard harvesting needed.' : 'Low stone requirement - easy to collect.'}`,
        `Metal Required: ${totalMetal} pieces (${metalCost} materials). ${totalMetal > 100 ? 'Large metal requirement - harvest vehicles and metal structures.' : totalMetal > 50 ? 'Moderate metal requirement - standard harvesting needed.' : 'Low metal requirement - easy to collect.'}`,
    ];

    if (costByMaterial.length > 0) {
        const dominantMaterial = costByMaterial.reduce((max, mat) => mat.percentage > max.percentage ? mat : max);
        recommendations.push(`Material Distribution: ${dominantMaterial.material} dominates at ${dominantMaterial.percentage.toFixed(1)}% of total cost. ${dominantMaterial.material === 'Metal' ? 'High metal usage increases cost significantly - consider using wood or stone for non-critical structures.' : dominantMaterial.material === 'Stone' ? 'Balanced material usage - stone provides good cost-to-durability ratio.' : 'Wood-heavy build - cost-effective but less durable. Consider stone or metal for critical structures.'}`);
    }

    if (totalCost > 1500) {
        recommendations.push('Cost Optimization: Consider using wood for non-critical structures (3x cheaper than metal). Use stone for balanced defense. Reserve metal for critical defensive positions only. This can reduce costs by 30-50% while maintaining effectiveness.');
    }

    const plan = [
        {
            label: 'This Week',
            detail: `Plan material collection: total cost ${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} materials. ${totalCost >= 1000 ? 'Focus on efficient harvesting - prioritize high-yield objects and plan collection routes.' : 'Standard harvesting should be sufficient - collect materials as you play.'}`
        },
        {
            label: 'This Month',
            detail: 'Optimize building strategies: experiment with material mixes, test cost-effective builds, identify which structures need which materials, and develop efficient harvesting routines for different material types.'
        },
        {
            label: 'Ongoing',
            detail: 'Continuously optimize builds: use wood for quick builds and mobility, use stone for balanced defense, use metal sparingly for critical positions, balance cost with durability needs, and harvest materials efficiently during gameplay.'
        },
    ];

    return {
        woodWalls,
        stoneWalls,
        metalWalls,
        woodFloors,
        stoneFloors,
        metalFloors,
        woodStairs,
        stoneStairs,
        metalStairs,
        woodRoofs,
        stoneRoofs,
        metalRoofs,
        totalWood,
        totalStone,
        totalMetal,
        totalCost,
        costByMaterial,
        costByStructure,
        status,
        interpretation,
        recommendations,
        plan,
    };
};

export default function FortniteBuildMaterialCostCalculatorInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            woodWalls: undefined,
            stoneWalls: undefined,
            metalWalls: undefined,
            woodFloors: undefined,
            stoneFloors: undefined,
            metalFloors: undefined,
            woodStairs: undefined,
            stoneStairs: undefined,
            metalStairs: undefined,
            woodRoofs: undefined,
            stoneRoofs: undefined,
            metalRoofs: undefined,
        },
    });

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Input your build structure counts</CardTitle>
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Walls</h3>
                                    <FormField
                                        control={form.control}
                                        name="woodWalls"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Wood Walls</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="1" placeholder="0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="stoneWalls"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Stone Walls</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="1" placeholder="0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="metalWalls"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Metal Walls</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="1" placeholder="0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Floors</h3>
                                    <FormField
                                        control={form.control}
                                        name="woodFloors"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Wood Floors</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="1" placeholder="0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="stoneFloors"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Stone Floors</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="1" placeholder="0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="metalFloors"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Metal Floors</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="1" placeholder="0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Stairs & Roofs</h3>
                                    <FormField
                                        control={form.control}
                                        name="woodStairs"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Wood Stairs</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="1" placeholder="0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="stoneStairs"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Stone Stairs</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="1" placeholder="0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="metalStairs"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Metal Stairs</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="1" placeholder="0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="woodRoofs"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Wood Roofs</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="1" placeholder="0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="stoneRoofs"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Stone Roofs</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="1" placeholder="0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="metalRoofs"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Metal Roofs</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="1" placeholder="0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                Calculate Material Cost
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
                        <CardDescription>See total material costs, breakdown by material and structure type, and recommendations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Total Cost</p>
                                <p className="text-2xl font-semibold text-primary">{result.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                <p className="text-xs text-muted-foreground">Materials</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Wood Required</p>
                                <p className="text-2xl font-semibold text-primary">{result.totalWood}</p>
                                <p className="text-xs text-muted-foreground">Pieces ({result.totalWood * WOOD_COST} materials)</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Stone Required</p>
                                <p className="text-2xl font-semibold text-primary">{result.totalStone}</p>
                                <p className="text-xs text-muted-foreground">Pieces ({result.totalStone * STONE_COST} materials)</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Metal Required</p>
                                <p className="text-2xl font-semibold text-primary">{result.totalMetal}</p>
                                <p className="text-xs text-muted-foreground">Pieces ({result.totalMetal * METAL_COST} materials)</p>
                            </div>
                        </div>
                        {result.costByMaterial.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {result.costByMaterial.map((mat) => (
                                    <div key={mat.material} className="p-4 border rounded">
                                        <p className="text-sm text-muted-foreground">{mat.material}</p>
                                        <p className="text-xl font-semibold text-primary">{mat.cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                        <p className="text-xs text-muted-foreground">{mat.percentage.toFixed(1)}% of total</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {result.costByStructure.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {result.costByStructure.map((struct) => (
                                    <div key={struct.structure} className="p-4 border rounded">
                                        <p className="text-sm text-muted-foreground">{struct.structure}</p>
                                        <p className="text-xl font-semibold text-primary">{struct.cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                        <p className="text-xs text-muted-foreground">{struct.percentage.toFixed(1)}% of total</p>
                                    </div>
                                ))}
                            </div>
                        )}
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
                        <strong>Material Cost per Piece</strong>: Wood = 10 materials, Stone = 20 materials, Metal = 30 materials. These costs are consistent across all structure types (walls, floors, stairs, roofs) in Fortnite.
                    </p>
                    <p>
                        <strong>Total Wood Cost</strong> = (Wood Walls + Wood Floors + Wood Stairs + Wood Roofs) × 10. This calculates total wood material cost by summing all wood structures and multiplying by wood cost per piece.
                    </p>
                    <p>
                        <strong>Total Stone Cost</strong> = (Stone Walls + Stone Floors + Stone Stairs + Stone Roofs) × 20. This calculates total stone material cost by summing all stone structures and multiplying by stone cost per piece.
                    </p>
                    <p>
                        <strong>Total Metal Cost</strong> = (Metal Walls + Metal Floors + Metal Stairs + Metal Roofs) × 30. This calculates total metal material cost by summing all metal structures and multiplying by metal cost per piece.
                    </p>
                    <p>
                        <strong>Total Material Cost</strong> = Total Wood Cost + Total Stone Cost + Total Metal Cost. This is the sum of all material costs, representing the total materials needed for the entire build.
                    </p>
                    <p>
                        <strong>Material Percentage</strong> = (Material Cost / Total Cost) × 100. This shows what percentage of total cost each material type represents, helping identify cost distribution and optimization opportunities.
                    </p>
                    <p>These formulas help you calculate total build costs, understand material requirements, and optimize builds for cost-effectiveness. Use material costs to plan harvesting needs and make informed building decisions.</p>
                </CardContent>
            </Card>
        </div>
    );
}
