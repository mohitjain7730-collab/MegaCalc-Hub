'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
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

const steps = [
  'Enter the number of wood walls you want to build.',
  'Enter the number of stone walls you want to build.',
  'Enter the number of metal walls you want to build.',
  'Enter the number of wood floors you want to build.',
  'Enter the number of stone floors you want to build.',
  'Enter the number of metal floors you want to build.',
  'Enter the number of wood stairs you want to build.',
  'Enter the number of stone stairs you want to build.',
  'Enter the number of metal stairs you want to build.',
  'Enter the number of wood roofs you want to build.',
  'Enter the number of stone roofs you want to build.',
  'Enter the number of metal roofs you want to build.',
  'Review the total material costs, breakdown by material and structure type, and recommendations.',
];

const faqs = [
  {
    question: 'What are the material costs in Fortnite?',
    answer:
      'In Fortnite, each building piece costs materials: Wood costs 10 materials per piece, Stone costs 20 materials per piece, and Metal costs 30 materials per piece. These costs are consistent across all structure types (walls, floors, stairs, roofs). Material costs are the same regardless of structure type - only the material type affects cost.',
  },
  {
    question: 'How do I collect materials in Fortnite?',
    answer:
      'Materials are collected by harvesting objects with your pickaxe: Wood from trees, wooden structures, and wooden objects; Stone from rocks, stone structures, and stone objects; Metal from vehicles, metal structures, and metal objects. Each hit with the pickaxe grants materials. Different objects provide different material types and amounts.',
  },
  {
    question: 'Which material is best for building?',
    answer:
      'Material choice depends on situation: Wood is fastest to build and cheapest (10 materials) but weakest in health. Stone is balanced (20 materials) with moderate health and build speed. Metal is strongest in health but slowest to build and most expensive (30 materials). Use wood for quick builds, stone for balanced defense, and metal for strong fortifications.',
  },
  {
    question: 'How much material can I carry?',
    answer:
      'In Fortnite, players can carry up to 999 materials of each type (Wood, Stone, Metal), for a maximum total of 2,997 materials. This limit applies to each material type separately. Plan your builds to stay within material limits, and harvest additional materials as needed during gameplay.',
  },
  {
    question: 'Should I use the same material for all structures?',
    answer:
      'Not necessarily. Mix materials based on needs: Use wood for quick temporary builds and mobility structures. Use stone for balanced defensive structures that need moderate durability. Use metal for critical defensive positions that need maximum durability. Mixing materials optimizes both cost and effectiveness.',
  },
  {
    question: 'How do I minimize material costs?',
    answer:
      'To minimize costs: use wood for non-critical structures (10 materials vs 20-30), build only what you need (avoid over-building), reuse existing structures when possible, harvest materials efficiently, and prioritize material type based on structure importance. Wood is 3x cheaper than metal, so use it for temporary or non-critical builds.',
  },
  {
    question: 'What is the most cost-effective building strategy?',
    answer:
      'The most cost-effective strategy: use wood for quick builds and mobility (ramps, temporary cover), use stone for balanced defensive structures (walls, floors in combat zones), use metal sparingly for critical defensive positions (final circle fortifications, high-value positions). This balances cost, build speed, and durability effectively.',
  },
];

const relatedCalculators = [
  {
    name: 'Fortnite DPS Calculator',
    slug: 'fortnite-dps-calculator',
    description: 'Calculate damage per second (DPS) for Fortnite weapons based on damage, fire rate, and weapon stats.',
  },
  {
    name: 'Fortnite Storm Surge Timer',
    slug: 'fortnite-storm-surge-timer',
    description: 'Calculate storm surge timing, damage intervals, and survival requirements in Fortnite competitive matches.',
  },
  {
    name: 'Fortnite XP Per Match Optimizer',
    slug: 'fortnite-xp-per-match-optimizer',
    description: 'Optimize XP gains per match by calculating XP from eliminations, placement, and match performance.',
  },
  {
    name: 'Fortnite Shield Potency Calculator',
    slug: 'fortnite-shield-potency-calculator',
    description: 'Calculate shield effectiveness, damage absorption, and total effective health based on shield type and amount.',
  },
  {
    name: 'Fortnite Victory Royale Probability Estimator',
    slug: 'fortnite-victory-royale-probability-estimator',
    description: 'Estimate your probability of winning a Victory Royale based on current placement, player count, and skill level.',
  },
];

const baseUrl = 'https://mycalculating.com/category/gaming/fortnite-build-material-cost-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
        { '@type': 'ListItem', position: 3, name: 'Fortnite Build Material Cost Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Fortnite Build Material Cost Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate the total material cost for building structures in Fortnite based on structure type, size, and material requirements.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

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

export default function FortniteBuildMaterialCostCalculator() {
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
      <Script id="fortnite-build-material-cost-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Fortnite Build Material Cost Calculator
          </CardTitle>
          <CardDescription>Calculate the total material cost for building structures in Fortnite based on structure type, size, and material requirements.</CardDescription>
        </CardHeader>
      </Card>

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

      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related calculators</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relatedCalculators.map((calc) => (
            <div key={calc.slug} className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href={`/category/gaming/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="name" content="The Complete Guide to Fortnite Building Material Costs: Understanding Resource Management" />
        <meta itemProp="description" content="A comprehensive guide to Fortnite building material costs, resource collection, material types, and cost optimization strategies." />
        <meta itemProp="keywords" content="Fortnite building, material costs, wood stone metal, resource management, building calculator, Fortnite construction" />
        <meta itemProp="author" content="MegaCalc Hub Gaming Team" />
        <meta itemProp="datePublished" content="2025-01-24" />
        <meta itemProp="url" content={baseUrl} />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Fortnite Building Material Costs: Understanding Resource Management</h1>
        <p className="text-lg italic text-muted-foreground">A comprehensive guide to Fortnite building material costs, resource collection, material types, and cost optimization strategies.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#overview" className="hover:underline">Overview: Fortnite Building Materials</a></li>
          <li><a href="#materials" className="hover:underline">Material Types and Costs</a></li>
          <li><a href="#collection" className="hover:underline">Material Collection Methods</a></li>
          <li><a href="#structures" className="hover:underline">Structure Types and Costs</a></li>
          <li><a href="#optimization" className="hover:underline">Cost Optimization Strategies</a></li>
          <li><a href="#management" className="hover:underline">Material Management and Planning</a></li>
          <li><a href="#strategies" className="hover:underline">Building Strategies by Material</a></li>
        </ul>
        <hr />

        <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Fortnite Building Materials</h2>
        <p>Fortnite's building system requires three types of materials: Wood, Stone, and Metal. Each material has different costs, durability, and build speeds, making material choice crucial for effective building. Understanding material costs helps players plan builds, manage resources, and optimize construction strategies.</p>

        <p>Material costs are consistent across all structure types: Wood costs 10 materials per piece, Stone costs 20 materials per piece, and Metal costs 30 materials per piece. These costs apply to walls, floors, stairs, and roofs equally. The only difference between materials is cost, durability, and build speed.</p>

        <p>Players can carry up to 999 materials of each type, for a maximum total of 2,997 materials. This limit requires strategic material management, especially for large builds. Understanding material costs helps players plan builds within material limits and optimize resource usage.</p>

        <p>Material choice affects both cost and effectiveness. Wood is cheapest (10 materials) but weakest and fastest to build. Stone is balanced (20 materials) with moderate durability and build speed. Metal is most expensive (30 materials) but strongest and slowest to build. Players must balance cost with durability needs.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Economics of Building</h3>
        <p>Building in Fortnite requires constant material management. Efficient players balance material costs with durability needs, using cheaper materials for temporary structures and expensive materials for critical defensive positions. Understanding costs helps players make informed building decisions and optimize resource usage.</p>

        <hr />

        <h2 id="materials" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Material Types and Costs</h2>
        
        <p>Fortnite features three material types, each with distinct characteristics and costs. Understanding these differences helps players choose appropriate materials for different situations.</p>

        <p>Wood is the cheapest material at 10 materials per piece. It builds fastest, making it ideal for quick defensive structures and mobility builds (ramps, temporary cover). However, wood has the lowest durability, making it vulnerable to enemy fire. Use wood for temporary structures, quick builds, and situations where speed matters more than durability.</p>

        <p>Stone costs 20 materials per piece, double the cost of wood. It has moderate durability and build speed, making it a balanced choice for most defensive structures. Stone provides good cost-to-durability ratio and is suitable for medium-term defensive positions. Use stone for balanced defense when you need moderate durability without the high cost of metal.</p>

        <p>Metal costs 30 materials per piece, triple the cost of wood and 1.5x the cost of stone. It has the highest durability but builds slowest, making it ideal for strong defensive fortifications. Metal is best reserved for critical defensive positions, final circle builds, and situations where maximum durability is needed. Use metal sparingly due to high cost and slow build speed.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Cost Comparison</h3>
        <p>Cost comparison: Wood (10) is 3x cheaper than Metal (30) and 2x cheaper than Stone (20). For the same material cost, you can build 3 wood pieces, 1.5 stone pieces, or 1 metal piece. This cost difference significantly impacts build planning and material management strategies.</p>

        <hr />

        <h2 id="collection" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Material Collection Methods</h2>
        
        <p>Materials are collected by harvesting objects with your pickaxe. Different objects provide different material types and amounts. Understanding collection methods helps players gather materials efficiently and plan harvesting routes.</p>

        <p>Wood is collected from trees, wooden structures, wooden furniture, and wooden objects throughout the map. Trees provide the most wood per object, making them ideal for wood collection. Wooden structures in buildings also provide wood but typically less per object. Focus on trees for efficient wood harvesting.</p>

        <p>Stone is collected from rocks, stone structures, stone walls, and stone objects. Large rocks provide the most stone per object. Stone structures in buildings also provide stone. Rocks are more scattered than trees, requiring more movement for efficient stone collection.</p>

        <p>Metal is collected from vehicles, metal structures, metal objects, and metal fixtures. Vehicles provide significant metal per object, making them valuable for metal collection. Metal structures in buildings also provide metal but typically less per object. Vehicles are the most efficient metal source.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Harvesting Efficiency</h3>
        <p>Harvesting efficiency tips: target high-yield objects (large trees for wood, large rocks for stone, vehicles for metal), use the pickaxe's weak point indicator for maximum materials per hit, harvest during safe moments (not during combat), and plan harvesting routes to minimize time spent collecting materials.</p>

        <hr />

        <h2 id="structures" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Structure Types and Costs</h2>
        
        <p>Fortnite features four main structure types: Walls, Floors, Stairs, and Roofs. All structure types have the same material costs regardless of material type. Understanding structure costs helps players plan builds and calculate total material requirements.</p>

        <p>Walls are vertical structures used for defense and cover. Each wall costs 10/20/30 materials depending on material type (wood/stone/metal). Walls are essential for defensive builds and provide cover from enemy fire. Plan wall counts based on defensive needs and available materials.</p>

        <p>Floors are horizontal structures used for platforms and foundations. Each floor costs 10/20/30 materials depending on material type. Floors are essential for multi-level builds and provide stable platforms. Plan floor counts based on build height and platform needs.</p>

        <p>Stairs (ramps) are sloped structures used for mobility and elevation. Each stair costs 10/20/30 materials depending on material type. Stairs are essential for building up and gaining high ground advantage. Plan stair counts based on mobility needs and build height.</p>

        <p>Roofs are angled structures used for cover and building completion. Each roof costs 10/20/30 materials depending on material type. Roofs provide additional cover and complete builds. Plan roof counts based on build design and cover needs.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Structure Cost Planning</h3>
        <p>Structure cost planning: calculate total structures needed for your build design, multiply by material costs based on chosen materials, sum costs across all structure types, and ensure total cost stays within material limits (999 per type). Use calculators to plan builds before construction.</p>

        <hr />

        <h2 id="optimization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Cost Optimization Strategies</h2>
        
        <p>Cost optimization strategies help players build effectively while minimizing material usage. Multiple approaches can reduce costs without significantly compromising build effectiveness.</p>

        <p>Material mixing optimizes costs by using appropriate materials for different structures. Use wood for temporary structures, quick builds, and mobility structures (ramps). Use stone for balanced defensive structures that need moderate durability. Use metal only for critical defensive positions that need maximum durability. This approach can reduce costs by 30-50% compared to using expensive materials for everything.</p>

        <p>Structure minimization reduces costs by building only what's necessary. Avoid over-building unnecessary structures. Build defensively but efficiently. Reuse existing structures when possible. Minimize structure counts to reduce total material costs.</p>

        <p>Material prioritization focuses expensive materials on critical structures. Reserve metal for final circle fortifications and high-value defensive positions. Use stone for standard defensive structures. Use wood for everything else. This ensures maximum durability where it matters most while minimizing overall costs.</p>

        <p>Harvesting efficiency reduces time spent collecting materials. Target high-yield objects for maximum materials per harvest. Plan harvesting routes to minimize travel time. Harvest during safe moments, not during active combat. Efficient harvesting ensures adequate materials without excessive time investment.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Cost Reduction Examples</h3>
        <p>Example: A build requiring 50 walls. Using all metal costs 1,500 materials. Using all stone costs 1,000 materials (33% reduction). Using all wood costs 500 materials (67% reduction). Mixing materials (20 metal for critical walls, 30 wood for others) costs 900 materials (40% reduction) while maintaining effectiveness where needed.</p>

        <hr />

        <h2 id="management" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Material Management and Planning</h2>
        
        <p>Effective material management ensures adequate resources for building while optimizing usage. Planning helps players manage materials efficiently and avoid running out during critical moments.</p>

        <p>Material limits require strategic management. With 999 max per type, large builds may require multiple harvesting sessions. Plan builds to stay within limits, or plan harvesting to collect materials as needed. Monitor material counts during gameplay to avoid shortages.</p>

        <p>Build planning calculates material requirements before construction. Use calculators to estimate total costs. Plan material mixes to optimize costs. Ensure adequate materials before starting large builds. Planning prevents material shortages and optimizes resource usage.</p>

        <p>Harvesting planning identifies material sources and collection routes. Know where to find each material type. Plan efficient harvesting routes. Harvest during safe moments. Balance harvesting time with other gameplay activities. Efficient planning minimizes time spent collecting materials.</p>

        <p>Cost tracking monitors material usage during builds. Track costs as you build. Adjust material usage based on remaining materials. Prioritize critical structures when materials are limited. Tracking helps manage resources effectively throughout gameplay.</p>

        <hr />

        <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Building Strategies by Material</h2>
        
        <p>Different materials suit different building strategies. Understanding material characteristics helps players choose appropriate strategies for different situations.</p>

        <p>Wood strategies focus on speed and mobility. Use wood for quick defensive structures, mobility builds (ramps for high ground), temporary cover, and situations requiring fast construction. Wood's low cost and fast build speed make it ideal for aggressive playstyles and quick reactions.</p>

        <p>Stone strategies balance cost and durability. Use stone for standard defensive structures, medium-term defensive positions, balanced builds, and situations requiring moderate durability without high cost. Stone's balanced characteristics make it suitable for most defensive situations.</p>

        <p>Metal strategies prioritize durability over cost. Use metal for final circle fortifications, critical defensive positions, long-term defensive builds, and situations requiring maximum durability. Metal's high durability makes it essential for end-game scenarios where survival is critical.</p>

        <p>Mixed material strategies optimize both cost and effectiveness. Combine materials based on structure importance: wood for temporary/mobility structures, stone for standard defense, metal for critical positions. This approach maximizes effectiveness while minimizing costs.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Situation-Based Material Choice</h3>
        <p>Situation-based choices: early game - use wood for quick builds and mobility; mid game - use stone for balanced defense; late game - use metal for critical fortifications; aggressive play - prioritize wood for speed; defensive play - prioritize stone/metal for durability. Adapt material choice to situation and playstyle.</p>

        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Fortnite building material costs significantly impact build planning and resource management. Understanding material costs, collection methods, and optimization strategies helps players build effectively while managing resources efficiently.</p>

        <p>Material costs are consistent: Wood (10), Stone (20), Metal (30) per piece. Cost differences create optimization opportunities through material mixing and strategic usage. Players must balance cost with durability needs when choosing materials.</p>

        <p>Optimization strategies include material mixing, structure minimization, material prioritization, and harvesting efficiency. These strategies can reduce costs by 30-50% while maintaining build effectiveness. Effective material management ensures adequate resources for critical builds.</p>

        <p>Remember that material choice affects both cost and effectiveness. Use wood for speed and mobility, stone for balanced defense, and metal for maximum durability. Mix materials strategically to optimize both cost and effectiveness. With proper planning and optimization, players can build effectively while managing resources efficiently.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>FAQs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h4 className="font-semibold">{faq.question}</h4>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>This tool calculates Fortnite build material costs based on structure counts (walls, floors, stairs, roofs) for each material type (wood, stone, metal). Material costs: Wood = 10 materials per piece, Stone = 20 materials per piece, Metal = 30 materials per piece.</p>
          <p>Outputs include total material cost, wood/stone/metal requirements (pieces and materials), cost breakdown by material type with percentages, cost breakdown by structure type with percentages, status assessment (low-cost/moderate-cost/high-cost/very-high-cost), interpretation, recommendations, and action plan.</p>
          <p>Formulas use standard material costs: Total Wood Cost = Wood Pieces × 10, Total Stone Cost = Stone Pieces × 20, Total Metal Cost = Metal Pieces × 30, Total Cost = Sum of All Material Costs, Material % = (Material Cost / Total Cost) × 100. The guide covers material types and costs, collection methods, structure types, cost optimization strategies, material management, and building strategies. Related tools, FAQs, and comprehensive content ensure humans or AI assistants can interpret the methodology and understand Fortnite building material cost calculations instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
