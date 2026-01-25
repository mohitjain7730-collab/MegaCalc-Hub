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
  overworldX: z.number({ invalid_type_error: 'Enter overworld X coordinate' }),
  overworldY: z.number({ invalid_type_error: 'Enter overworld Y coordinate' }).optional(),
  overworldZ: z.number({ invalid_type_error: 'Enter overworld Z coordinate' }),
  netherX: z.number({ invalid_type_error: 'Enter nether X coordinate' }).optional(),
  netherY: z.number({ invalid_type_error: 'Enter nether Y coordinate' }).optional(),
  netherZ: z.number({ invalid_type_error: 'Enter nether Z coordinate' }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  overworldX: number;
  overworldY: number;
  overworldZ: number;
  netherX: number;
  netherY: number;
  netherZ: number;
  calculatedNetherX: number;
  calculatedNetherZ: number;
  calculatedOverworldX: number;
  calculatedOverworldZ: number;
  distance: number;
  linkageAccuracy: number;
  status: 'exact' | 'close' | 'moderate' | 'far' | 'very-far';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter overworld coordinates (X, Y optional, Z) for your overworld portal location.',
  'Optionally enter nether coordinates (X, Y optional, Z) if you have a nether portal location.',
  'The calculator will convert between overworld and nether coordinates (nether = overworld / 8).',
  'Review calculated coordinates, distance between portals, linkage accuracy, and recommendations.',
];

const faqs = [
  {
    question: 'How do nether portals link in Minecraft?',
    answer:
      'Nether portals link between overworld and nether dimensions. Nether coordinates are overworld coordinates divided by 8 (X and Z only, Y stays the same). When you enter a portal, the game searches for existing portals within 128 blocks in the other dimension. Understanding linkage helps create efficient portal networks.',
  },
  {
    question: 'How do I convert overworld to nether coordinates?',
    answer:
      'Nether coordinates = Overworld coordinates / 8 (for X and Z axes). Y coordinate stays the same. For example, overworld (800, 64, 800) = nether (100, 64, 100). This 8:1 ratio means 1 block in nether = 8 blocks in overworld, making nether travel 8x faster.',
  },
  {
    question: 'How do I convert nether to overworld coordinates?',
    answer:
      'Overworld coordinates = Nether coordinates × 8 (for X and Z axes). Y coordinate stays the same. For example, nether (100, 64, 100) = overworld (800, 64, 800). Multiply nether coordinates by 8 to find corresponding overworld location.',
  },
  {
    question: 'What is portal search range?',
    answer:
      'Portal search range is 128 blocks in the other dimension. When entering a portal, the game searches for existing portals within 128 blocks of the calculated location. If no portal exists, a new one is created. Understanding search range helps plan portal placement for proper linkage.',
  },
  {
    question: 'Why do portals sometimes link incorrectly?',
    answer:
      'Portals link incorrectly when: multiple portals are within 128 blocks of calculated location (game chooses closest), portal is outside 128-block search range, Y coordinate differs significantly (game searches vertically too), or portal placement doesn\'t match calculated coordinates. Understanding linkage mechanics helps prevent incorrect links.',
  },
  {
    question: 'How do I ensure portals link correctly?',
    answer:
      'To ensure correct linkage: calculate exact coordinates (overworld / 8 for nether), place portals at calculated locations, ensure no other portals within 128 blocks, match Y coordinates when possible, and test portal linkage to verify. Proper placement ensures correct portal connections.',
  },
  {
    question: 'What is the 8:1 coordinate ratio?',
    answer:
      'The 8:1 ratio means 1 block in nether = 8 blocks in overworld. This makes nether travel 8x faster than overworld travel. For example, traveling 100 blocks in nether = 800 blocks in overworld. Understanding the ratio helps plan efficient travel routes and portal networks.',
  },
];

const relatedCalculators = [
  {
    name: 'Minecraft Farm Yield Calculator',
    slug: 'minecraft-farm-yield-calculator',
    description: 'Calculate crop yields, resource production rates, and farm efficiency for Minecraft farms based on farm size and crop type.',
  },
  {
    name: 'Minecraft Redstone Signal Delay Calculator',
    slug: 'minecraft-redstone-signal-delay-calculator',
    description: 'Calculate redstone signal delay based on repeater count and tick delay.',
  },
  {
    name: 'Minecraft Tree Farm Output Calculator',
    slug: 'minecraft-tree-farm-output-calculator',
    description: 'Calculate tree farm output based on sapling type, bone meal usage, and growth rates.',
  },
  {
    name: 'Minecraft Beacon Range Optimizer',
    slug: 'minecraft-beacon-range-optimizer',
    description: 'Optimize beacon range and effect coverage in Minecraft based on beacon level and pyramid size.',
  },
  {
    name: 'Minecraft Mob Farm XP Rate Calculator',
    slug: 'minecraft-mob-farm-xp-rate-calculator',
    description: 'Calculate XP generation rates for Minecraft mob farms based on mob spawn rates and kill rates.',
  },
];

const baseUrl = 'https://mycalculating.com/category/gaming/minecraft-nether-portal-linkage-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
        { '@type': 'ListItem', position: 3, name: 'Minecraft Nether Portal Linkage Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Minecraft Nether Portal Linkage Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate nether portal linkage between overworld and nether coordinates based on coordinate conversion and portal placement.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const overworldX = values.overworldX;
  const overworldY = values.overworldY ?? 64;
  const overworldZ = values.overworldZ;
  
  // Calculate nether coordinates (overworld / 8)
  const calculatedNetherX = overworldX / 8;
  const calculatedNetherZ = overworldZ / 8;
  
  // If nether coordinates provided, calculate overworld
  let netherX = values.netherX;
  let netherY = values.netherY ?? 64;
  let netherZ = values.netherZ;
  
  let calculatedOverworldX = 0;
  let calculatedOverworldZ = 0;
  
  if (netherX !== undefined && netherZ !== undefined) {
    calculatedOverworldX = netherX * 8;
    calculatedOverworldZ = netherZ * 8;
  } else {
    // Use calculated nether coordinates
    netherX = calculatedNetherX;
    netherZ = calculatedNetherZ;
    calculatedOverworldX = overworldX;
    calculatedOverworldZ = overworldZ;
  }

  // Calculate distance between actual and calculated positions
  const distanceX = Math.abs((netherX ?? calculatedNetherX) - calculatedNetherX);
  const distanceZ = Math.abs((netherZ ?? calculatedNetherZ) - calculatedNetherZ);
  const distance = Math.sqrt(distanceX * distanceX + distanceZ * distanceZ);

  // Linkage accuracy (within 128 block search range)
  const linkageAccuracy = distance <= 128 ? 100 - (distance / 128) * 100 : 0;

  let status: ResultPayload['status'] = 'exact';
  let interpretation = 'Your nether portal linkage has been calculated based on coordinate conversion.';

  if (distance === 0) {
    status = 'exact';
    interpretation = 'Exact linkage! Portals are at calculated coordinates. Perfect portal connection with no distance error.';
  } else if (distance <= 16) {
    status = 'close';
    interpretation = `Close linkage. Distance: ${distance.toFixed(1)} blocks. Portals are very close to calculated coordinates. Excellent portal connection.`;
  } else if (distance <= 64) {
    status = 'moderate';
    interpretation = `Moderate distance. Distance: ${distance.toFixed(1)} blocks. Portals are within reasonable range. Good portal connection.`;
  } else if (distance <= 128) {
    status = 'far';
    interpretation = `Far distance. Distance: ${distance.toFixed(1)} blocks. Portals are at edge of search range. May link but less reliable.`;
  } else {
    status = 'very-far';
    interpretation = `Very far distance. Distance: ${distance.toFixed(1)} blocks. Portals are outside 128-block search range. May not link correctly - consider repositioning.`;
  }

  const recommendations = [
    `Overworld Coordinates: X=${overworldX}, Y=${overworldY}, Z=${overworldZ}. Place overworld portal at these coordinates for proper linkage.`,
    `Calculated Nether Coordinates: X=${calculatedNetherX.toFixed(1)}, Y=${overworldY}, Z=${calculatedNetherZ.toFixed(1)}. Place nether portal at these coordinates for exact linkage.`,
    `Nether to Overworld Conversion: Nether (${(netherX ?? calculatedNetherX).toFixed(1)}, ${netherY}, ${(netherZ ?? calculatedNetherZ).toFixed(1)}) = Overworld (${calculatedOverworldX.toFixed(1)}, ${overworldY}, ${calculatedOverworldZ.toFixed(1)}).`,
    `Distance: ${distance.toFixed(1)} blocks. ${distance === 0 ? 'Exact match - perfect linkage.' : distance <= 16 ? 'Very close - excellent linkage.' : distance <= 64 ? 'Close - good linkage.' : distance <= 128 ? 'Within search range - may link.' : 'Outside search range - may not link correctly.'}`,
    `Linkage Accuracy: ${linkageAccuracy.toFixed(1)}%. ${linkageAccuracy >= 90 ? 'Excellent accuracy - very reliable linkage.' : linkageAccuracy >= 75 ? 'Good accuracy - reliable linkage.' : linkageAccuracy >= 50 ? 'Moderate accuracy - may link.' : linkageAccuracy > 0 ? 'Low accuracy - less reliable.' : 'Outside search range - unlikely to link.'}`,
  ];

  if (distance > 128) {
    recommendations.push(`Portal Placement Issue: Distance (${distance.toFixed(1)} blocks) exceeds 128-block search range. Portals may not link correctly. Reposition portals to calculated coordinates for proper linkage. Search range is 128 blocks in the other dimension.`);
  }

  if (distance > 0 && distance <= 128) {
    recommendations.push(`Portal Optimization: Current distance is ${distance.toFixed(1)} blocks. For exact linkage, move portal to calculated coordinates (X=${calculatedNetherX.toFixed(1)}, Z=${calculatedNetherZ.toFixed(1)}). Exact placement ensures reliable portal connections.`);
  }

  if (Math.abs(overworldY - netherY) > 32) {
    recommendations.push(`Y Coordinate Difference: Overworld Y=${overworldY}, Nether Y=${netherY}. Large Y difference (${Math.abs(overworldY - netherY)} blocks) may affect portal search. Consider matching Y coordinates when possible for better linkage.`);
  }

  const plan = [
    { 
      label: 'This Session', 
      detail: `Portal linkage: Distance ${distance.toFixed(1)} blocks, Accuracy ${linkageAccuracy.toFixed(1)}%. ${distance <= 128 ? 'Within search range - portals should link.' : 'Outside search range - reposition portals for proper linkage.'}` 
    },
    { 
      label: 'This Week', 
      detail: 'Optimize portal network: calculate exact coordinates for all portals, place portals at calculated locations, ensure no other portals within 128 blocks, match Y coordinates when possible, and test portal linkage to verify connections.' 
    },
    { 
      label: 'Ongoing', 
      detail: 'Continuously maintain portal network: track portal coordinates, verify linkage accuracy, reposition portals if needed, plan portal networks for efficient travel, and understand 8:1 coordinate ratio for optimal portal placement.' 
    },
  ];

  return {
    overworldX,
    overworldY,
    overworldZ,
    netherX: netherX ?? calculatedNetherX,
    netherY,
    netherZ: netherZ ?? calculatedNetherZ,
    calculatedNetherX,
    calculatedNetherZ,
    calculatedOverworldX,
    calculatedOverworldZ,
    distance,
    linkageAccuracy,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function MinecraftNetherPortalLinkageEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      overworldX: undefined,
      overworldY: undefined,
      overworldZ: undefined,
      netherX: undefined,
      netherY: undefined,
      netherZ: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="minecraft-nether-portal-linkage-estimator-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Minecraft Nether Portal Linkage Estimator
          </CardTitle>
          <CardDescription>Estimate nether portal linkage between overworld and nether coordinates based on coordinate conversion and portal placement.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your portal coordinates</CardTitle>
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
                <FormField
                  control={form.control}
                  name="overworldX"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overworld X</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 800" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="overworldY"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overworld Y (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 64" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="overworldZ"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overworld Z</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 800" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="netherX"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nether X (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 100" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="netherY"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nether Y (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 64" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="netherZ"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nether Z (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 100" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Portal Linkage
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
            <CardDescription>See calculated coordinates, distance between portals, linkage accuracy, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Distance</p>
                <p className="text-2xl font-semibold text-primary">{result.distance.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Blocks</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Linkage Accuracy</p>
                <p className="text-2xl font-semibold text-primary">{result.linkageAccuracy.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Search Range</p>
                <p className="text-2xl font-semibold text-primary">128</p>
                <p className="text-xs text-muted-foreground">Blocks</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground mb-2">Overworld Coordinates</p>
                <p className="text-lg font-semibold text-primary">X: {result.overworldX.toFixed(1)}</p>
                <p className="text-lg font-semibold text-primary">Y: {result.overworldY.toFixed(1)}</p>
                <p className="text-lg font-semibold text-primary">Z: {result.overworldZ.toFixed(1)}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground mb-2">Calculated Nether Coordinates</p>
                <p className="text-lg font-semibold text-primary">X: {result.calculatedNetherX.toFixed(1)}</p>
                <p className="text-lg font-semibold text-primary">Y: {result.overworldY.toFixed(1)}</p>
                <p className="text-lg font-semibold text-primary">Z: {result.calculatedNetherZ.toFixed(1)}</p>
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
            <strong>Nether Coordinates (from Overworld)</strong> = Overworld Coordinates / 8 (for X and Z axes). Y coordinate stays the same. This 8:1 ratio means 1 block in nether = 8 blocks in overworld. For example, overworld (800, 64, 800) = nether (100, 64, 100).
          </p>
          <p>
            <strong>Overworld Coordinates (from Nether)</strong> = Nether Coordinates × 8 (for X and Z axes). Y coordinate stays the same. Multiply nether coordinates by 8 to find corresponding overworld location. For example, nether (100, 64, 100) = overworld (800, 64, 800).
          </p>
          <p>
            <strong>Distance Between Portals</strong> = √((Nether X - Calculated Nether X)² + (Nether Z - Calculated Nether Z)²). This calculates distance between actual and calculated portal positions. Distance determines if portals will link (must be within 128 blocks).
          </p>
          <p>
            <strong>Linkage Accuracy</strong> = 100 - (Distance / 128) × 100 (if distance ≤ 128), or 0 (if distance &gt; 128). This measures how accurately portals are placed relative to calculated coordinates. Higher accuracy means more reliable portal linkage.
          </p>
          <p>
            <strong>Portal Search Range</strong> = 128 blocks. When entering a portal, the game searches for existing portals within 128 blocks of the calculated location in the other dimension. Portals outside this range may not link correctly.
          </p>
          <p>These formulas help you understand portal linkage, calculate coordinate conversions, determine portal placement accuracy, and plan portal networks. Place portals at calculated coordinates for exact linkage, or within 128 blocks for reliable connections.</p>
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
        <meta itemProp="name" content="The Complete Guide to Minecraft Nether Portal Linkage: Understanding Coordinate Conversion and Portal Networks" />
        <meta itemProp="description" content="A comprehensive guide to Minecraft nether portal linkage, calculating coordinate conversions, understanding portal search range, and planning portal networks." />
        <meta itemProp="keywords" content="Minecraft nether portal, portal linkage, coordinate conversion, nether coordinates, portal network" />
        <meta itemProp="author" content="MegaCalc Hub Gaming Team" />
        <meta itemProp="datePublished" content="2025-01-24" />
        <meta itemProp="url" content={baseUrl} />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Minecraft Nether Portal Linkage: Understanding Coordinate Conversion and Portal Networks</h1>
        <p className="text-lg italic text-muted-foreground">A comprehensive guide to Minecraft nether portal linkage, calculating coordinate conversions, understanding portal search range, and planning portal networks.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#overview" className="hover:underline">Overview: Understanding Portal Linkage</a></li>
          <li><a href="#conversion" className="hover:underline">Coordinate Conversion</a></li>
          <li><a href="#search" className="hover:underline">Portal Search Range</a></li>
          <li><a href="#linkage" className="hover:underline">Linkage Mechanics</a></li>
          <li><a href="#placement" className="hover:underline">Portal Placement Strategies</a></li>
          <li><a href="#networks" className="hover:underline">Portal Network Planning</a></li>
          <li><a href="#troubleshooting" className="hover:underline">Troubleshooting Portal Issues</a></li>
        </ul>
        <hr />

        <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Understanding Portal Linkage</h2>
        <p>Nether portal linkage in Minecraft connects portals between overworld and nether dimensions. Understanding portal linkage helps players create efficient portal networks, ensure correct portal connections, and optimize travel routes. Linkage depends on coordinate conversion and portal search range.</p>

        <p>Portal linkage directly affects travel efficiency and network reliability. Correct linkage enables fast travel between dimensions. Incorrect linkage can create unexpected connections or require additional portals. Understanding linkage helps design reliable portal networks.</p>

        <p>Key factors affecting linkage include: coordinate conversion (8:1 ratio between dimensions), portal search range (128 blocks), portal placement accuracy, Y coordinate matching, and existing portal proximity. Understanding these factors helps ensure correct portal connections.</p>

        <p>Coordinate ratio: Nether coordinates = Overworld coordinates / 8 (X and Z only). This 8:1 ratio means 1 block in nether = 8 blocks in overworld, making nether travel 8x faster. Understanding the ratio helps plan portal networks and travel routes.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Portal Linkage Matters</h3>
        <p>Portal linkage matters because it determines travel efficiency, affects portal network reliability, influences base connectivity, and impacts overall gameplay convenience. Understanding linkage helps players design efficient and reliable portal networks.</p>

        <hr />

        <h2 id="conversion" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Coordinate Conversion</h2>
        
        <p>Coordinate conversion calculates corresponding coordinates between overworld and nether. Understanding conversion helps players place portals at correct locations.</p>

        <p>Overworld to nether: Nether X = Overworld X / 8, Nether Z = Overworld Z / 8, Nether Y = Overworld Y (Y stays the same). Divide overworld X and Z by 8 to find nether coordinates. Y coordinate remains unchanged.</p>

        <p>Nether to overworld: Overworld X = Nether X × 8, Overworld Z = Nether Z × 8, Overworld Y = Nether Y (Y stays the same). Multiply nether X and Z by 8 to find overworld coordinates. Y coordinate remains unchanged.</p>

        <p>Conversion examples: Overworld (800, 64, 800) = Nether (100, 64, 100), Overworld (1600, 70, -400) = Nether (200, 70, -50), Nether (50, 64, 50) = Overworld (400, 64, 400). Understanding examples helps apply conversion to real coordinates.</p>

        <p>Y coordinate: Y coordinate stays the same in both dimensions. However, portal search includes vertical range, so Y differences can affect linkage. Match Y coordinates when possible for more reliable connections.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Conversion Strategy</h3>
        <p>Conversion strategy: calculate exact coordinates for portal placement, convert between dimensions accurately, match Y coordinates when possible, and verify conversions for portal networks. Good conversion strategy ensures correct portal placement.</p>

        <hr />

        <h2 id="search" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Portal Search Range</h2>
        
        <p>Portal search range determines how far the game searches for existing portals when entering a portal. Understanding search range helps players place portals for reliable linkage.</p>

        <p>Search range: 128 blocks in the other dimension. When entering a portal, the game searches for existing portals within 128 blocks of the calculated location. If no portal exists, a new one is created at the calculated location.</p>

        <p>Search mechanics: Game calculates target coordinates (overworld / 8 for nether), searches for existing portals within 128 blocks, uses closest portal if multiple exist, creates new portal if none found. Understanding mechanics helps predict portal behavior.</p>

        <p>Range implications: Portals within 128 blocks can link, portals outside 128 blocks may not link correctly, multiple portals within range can cause incorrect links, and exact placement ensures reliable linkage. Understanding implications helps plan portal placement.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Search Range Strategy</h3>
        <p>Search range strategy: place portals within 128 blocks of calculated coordinates, avoid multiple portals within range when possible, use exact coordinates for reliable linkage, and understand search mechanics for portal networks. Good search range strategy ensures correct portal connections.</p>

        <hr />

        <h2 id="linkage" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Linkage Mechanics</h2>
        
        <p>Linkage mechanics determine how portals connect between dimensions. Understanding mechanics helps players ensure correct portal connections.</p>

        <p>Linkage process: Player enters portal, game calculates target coordinates (overworld / 8 for nether), game searches for existing portals within 128 blocks, game uses closest portal or creates new one, player exits through linked portal. Understanding process helps predict portal behavior.</p>

        <p>Linkage factors: Coordinate accuracy (exact coordinates = reliable linkage), search range (within 128 blocks = can link), Y coordinate (matching Y = better linkage), existing portals (multiple portals = closest one used), and portal placement (proper placement = correct linkage). Understanding factors helps ensure correct connections.</p>

        <p>Incorrect linkage causes: Multiple portals within 128 blocks (game chooses closest), portal outside search range (may not link), large Y difference (vertical search may find wrong portal), or incorrect coordinate calculation. Understanding causes helps prevent incorrect links.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Linkage Strategy</h3>
        <p>Linkage strategy: calculate exact coordinates, place portals at calculated locations, ensure no other portals within 128 blocks, match Y coordinates when possible, and test portal linkage to verify. Good linkage strategy ensures correct portal connections.</p>

        <hr />

        <h2 id="placement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Portal Placement Strategies</h2>
        
        <p>Portal placement strategies help players position portals for correct linkage. Multiple approaches can optimize portal placement.</p>

        <p>Exact placement positions portals at calculated coordinates for perfect linkage. Calculate exact coordinates (overworld / 8 for nether), place portals precisely at calculated locations, and verify placement for reliable connections. Exact placement ensures perfect linkage.</p>

        <p>Approximate placement positions portals within 128 blocks of calculated coordinates. Calculate target coordinates, place portals within search range, and understand that approximate placement may work but is less reliable. Approximate placement provides flexibility but less reliability.</p>

        <p>Y coordinate matching matches Y coordinates between dimensions when possible. Match Y coordinates for better vertical search results, understand that Y differences can affect linkage, and consider Y when placing portals. Y matching improves linkage reliability.</p>

        <p>Portal isolation ensures no other portals within 128 blocks to prevent incorrect links. Calculate portal positions, verify no other portals within range, and isolate portals for reliable linkage. Portal isolation prevents incorrect connections.</p>

        <hr />

        <h2 id="networks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Portal Network Planning</h2>
        
        <p>Portal network planning designs efficient portal systems for travel between multiple locations. Understanding network planning helps players create organized portal systems.</p>

        <p>Network design: Plan portal locations in both dimensions, calculate coordinates for all portals, ensure portals don't interfere with each other, organize portals for efficient travel, and test network for proper connections. Good network design ensures reliable travel.</p>

        <p>Coordinate spacing: Space portals at least 128 blocks apart in nether (1024 blocks in overworld) to prevent interference. Calculate spacing based on 8:1 ratio, ensure adequate separation, and plan portal positions accordingly. Coordinate spacing prevents portal conflicts.</p>

        <p>Network organization: Organize portals by location or purpose, label portals for identification, maintain coordinate records, and plan network expansion. Network organization improves usability and maintenance.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Network Strategy</h3>
        <p>Network strategy: plan portal locations in advance, calculate coordinates for all portals, ensure adequate spacing, organize portals systematically, and test network connections. Good network strategy creates efficient portal systems.</p>

        <hr />

        <h2 id="troubleshooting" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Troubleshooting Portal Issues</h2>
        
        <p>Troubleshooting portal issues helps players fix incorrect portal connections and ensure reliable linkage.</p>

        <p>Incorrect linkage: Check coordinate calculations, verify portal placement accuracy, ensure no other portals within 128 blocks, check Y coordinate differences, and reposition portals if needed. Troubleshooting incorrect linkage fixes connection problems.</p>

        <p>Portal not found: Verify coordinate calculations, check portal placement, ensure portal exists in other dimension, verify search range (128 blocks), and create portal if missing. Troubleshooting missing portals ensures proper connections.</p>

        <p>Multiple portal conflicts: Identify all portals within 128 blocks, calculate distances to target, remove or reposition conflicting portals, and ensure only one portal within range. Troubleshooting conflicts resolves portal interference.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Troubleshooting Strategy</h3>
        <p>Troubleshooting strategy: identify the problem (incorrect link, missing portal, conflict), check coordinate calculations and placement, verify search range and portal positions, fix issues (reposition, remove conflicts), and test portal linkage. Good troubleshooting strategy resolves portal issues effectively.</p>

        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Minecraft nether portal linkage depends on coordinate conversion (8:1 ratio), portal search range (128 blocks), and portal placement accuracy. Understanding linkage mechanics, coordinate conversion, and placement strategies helps players create efficient and reliable portal networks.</p>

        <p>Key factors affecting linkage include: coordinate conversion (overworld / 8 for nether), search range (128 blocks), portal placement accuracy, Y coordinate matching, and existing portal proximity. Understanding these factors helps ensure correct portal connections.</p>

        <p>Optimization strategies include: exact placement (portals at calculated coordinates), approximate placement (within 128 blocks), Y coordinate matching (match Y when possible), portal isolation (no other portals within range), and network planning (organized portal systems). By combining these strategies, players can create efficient portal networks effectively.</p>

        <p>Remember that the 8:1 coordinate ratio makes nether travel 8x faster. Calculate coordinates accurately for exact linkage, or place portals within 128 blocks for reliable connections. With proper understanding and planning, players can create efficient portal networks and optimize travel between dimensions effectively.</p>
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
          <p>This tool estimates Minecraft nether portal linkage between overworld and nether coordinates based on coordinate conversion (8:1 ratio) and portal placement.</p>
          <p>Inputs include overworld coordinates (X, optional Y, Z) and optional nether coordinates (X, optional Y, Z). Outputs include calculated nether coordinates (overworld / 8), calculated overworld coordinates (nether × 8), distance between actual and calculated portal positions, linkage accuracy (within 128-block search range), status assessment (exact/close/moderate/far/very-far), interpretation, recommendations, and action plan.</p>
          <p>Formulas use coordinate conversion: Nether Coordinates = Overworld Coordinates / 8 (X and Z, Y stays same), Overworld Coordinates = Nether Coordinates × 8 (X and Z, Y stays same), Distance = √((Nether X - Calculated X)² + (Nether Z - Calculated Z)²), Linkage Accuracy = 100 - (Distance / 128) × 100 (if ≤ 128 blocks). The guide covers coordinate conversion, search range (128 blocks), linkage mechanics, placement strategies, network planning, and troubleshooting. Related tools, FAQs, and comprehensive content ensure humans or AI assistants can interpret the methodology and understand Minecraft nether portal linkage calculations instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
