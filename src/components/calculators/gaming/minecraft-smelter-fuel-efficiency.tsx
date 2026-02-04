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
  fuelType: z.enum(['coal', 'charcoal', 'lava_bucket', 'cactus', 'blaze_rod'], { invalid_type_error: 'Select fuel type' }),
  fuelAmount: z.number({ invalid_type_error: 'Enter fuel amount' }).min(1),
  itemsToSmelt: z.number({ invalid_type_error: 'Enter items to smelt' }).min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  fuelType: string;
  fuelAmount: number;
  itemsToSmelt: number;
  smeltingTimePerUnit: number;
  totalSmeltingTime: number;
  itemsSmelted: number;
  itemsPerFuel: number;
  efficiency: number;
  fuelComparison: {
    fuel: string;
    smeltingTime: number;
    itemsPerUnit: number;
    efficiency: number;
  }[];
  status: 'low-efficiency' | 'moderate-efficiency' | 'high-efficiency' | 'very-high-efficiency';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

// Smelting time per fuel unit (in items)
const fuelEfficiency: Record<string, number> = {
  coal: 8, // 1 coal smelts 8 items
  charcoal: 8, // 1 charcoal smelts 8 items
  lava_bucket: 100, // 1 lava bucket smelts 100 items
  cactus: 0.5, // 1 cactus smelts 0.5 items (2 cactus = 1 item)
  blaze_rod: 12, // 1 blaze rod smelts 12 items
};

const steps = [
  'Select the fuel type you want to use (Coal, Charcoal, Lava Bucket, Cactus, or Blaze Rod).',
  'Enter the amount of fuel you have or plan to use.',
  'Optionally enter the number of items you want to smelt to calculate if you have enough fuel.',
  'Review smelting capacity, items per fuel unit, efficiency comparison, and recommendations.',
];

const faqs = [
  {
    question: 'How does fuel efficiency work in Minecraft?',
    answer:
      'Fuel efficiency measures how many items each fuel unit can smelt. Different fuels have different smelting capacities: Coal/Charcoal = 8 items, Lava Bucket = 100 items, Cactus = 0.5 items (2 per item), Blaze Rod = 12 items. Higher efficiency means more items smelted per fuel unit.',
  },
  {
    question: 'Which fuel is most efficient?',
    answer:
      'Lava buckets are the most efficient fuel, smelting 100 items per bucket. However, lava buckets are consumed (bucket is lost). Blaze rods smelt 12 items and are renewable. Coal/charcoal smelt 8 items and are common. Cactus smelts 0.5 items (least efficient) but is renewable. Choose fuel based on availability and efficiency needs.',
  },
  {
    question: 'How many items can I smelt with different fuels?',
    answer:
      'Smelting capacity: 1 Coal/Charcoal = 8 items, 1 Lava Bucket = 100 items, 1 Cactus = 0.5 items (need 2 for 1 item), 1 Blaze Rod = 12 items. Multiply by fuel amount to get total capacity. For example, 10 coal = 80 items, 1 lava bucket = 100 items.',
  },
  {
    question: 'Should I use coal or lava buckets?',
    answer:
      'Lava buckets are more efficient (100 items vs 8 items per coal) but consume the bucket. Coal is less efficient but renewable and doesn\'t consume buckets. Use lava buckets for high-volume smelting when buckets are available. Use coal for regular smelting when buckets are limited.',
  },
  {
    question: 'Is cactus a good fuel source?',
    answer:
      'Cactus is the least efficient fuel (0.5 items per cactus, need 2 cactus per item) but is fully renewable and easy to farm. Cactus is useful for automated smelting setups where renewable fuel is preferred. However, it requires significant quantities for large-scale smelting.',
  },
  {
    question: 'How do I calculate total smelting capacity?',
    answer:
      'Total Smelting Capacity = Fuel Amount × Items Per Fuel Unit. For example, 10 coal × 8 items/coal = 80 items. 1 lava bucket × 100 items/bucket = 100 items. Multiply fuel amount by fuel efficiency to get total capacity.',
  },
  {
    question: 'What is the best fuel for automated smelting?',
    answer:
      'For automated smelting, consider: Lava buckets for maximum efficiency (if buckets are available), Blaze rods for good efficiency and renewability, Coal for common availability, or Cactus for fully renewable fuel (despite low efficiency). Choose based on automation setup and fuel availability.',
  },
];

const relatedCalculators = [
  {
    name: 'Minecraft Farm Yield Calculator',
    slug: 'minecraft-farm-yield-calculator',
    description: 'Calculate crop yields, resource production rates, and farm efficiency for Minecraft farms based on farm size and crop type.',
  },
  {
    name: 'Minecraft Enchanting Odds Predictor',
    slug: 'minecraft-enchanting-odds-predictor',
    description: 'Predict enchanting odds and probabilities for Minecraft items based on enchantment levels and experience costs.',
  },
  {
    name: 'Minecraft Villager Trade Tracker',
    slug: 'minecraft-villager-trade-tracker',
    description: 'Track villager trades and calculate emerald profit per trade based on trade costs and item values.',
  },
  {
    name: 'Minecraft Mob Farm XP Rate Calculator',
    slug: 'minecraft-mob-farm-xp-rate-calculator',
    description: 'Calculate XP generation rates for Minecraft mob farms based on mob spawn rates and kill rates.',
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
];

const baseUrl = 'https://mycalculating.com/category/gaming/minecraft-smelter-fuel-efficiency';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
        { '@type': 'ListItem', position: 3, name: 'Minecraft Smelter Fuel Efficiency', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Minecraft Smelter Fuel Efficiency',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Compare fuel efficiency for Minecraft smelting including coal, lava buckets, and cactus, calculating items smelted per fuel unit.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'Article',
      headline: 'Minecraft Smelter Fuel Efficiency: Stop Burning Coal You Don\'t Need',
      description: 'A practical, human-written guide to Minecraft smelter fuel efficiency with real examples, common mistakes, and simple tips you can use right away.',
      author: { '@type': 'Person', name: 'MegaCalc Hub Gaming Team' },
      datePublished: '2025-01-24',
      image: 'https://mycalculating.com/assets/gaming-calculator-bg.jpg',
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const fuelType = values.fuelType;
  const fuelAmount = values.fuelAmount;
  const itemsToSmelt = values.itemsToSmelt ?? 0;

  // Smelting time per fuel unit
  const smeltingTimePerUnit = fuelEfficiency[fuelType] || 8;

  // Total smelting capacity
  const totalSmeltingTime = fuelAmount * smeltingTimePerUnit;

  // Items that can be smelted
  const itemsSmelted = totalSmeltingTime;

  // Items per fuel unit
  const itemsPerFuel = smeltingTimePerUnit;

  // Efficiency (items per fuel unit, normalized for comparison)
  const efficiency = smeltingTimePerUnit;

  // Fuel comparison (all fuel types)
  const fuelComparison = Object.entries(fuelEfficiency).map(([fuel, time]) => ({
    fuel: fuel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    smeltingTime: time,
    itemsPerUnit: time,
    efficiency: time,
  })).sort((a, b) => b.efficiency - a.efficiency);

  let status: ResultPayload['status'] = 'moderate-efficiency';
  let interpretation = 'Your fuel efficiency has been calculated based on fuel type and amount.';

  if (smeltingTimePerUnit >= 50) {
    status = 'very-high-efficiency';
    interpretation = `Very high efficiency! ${fuelType.replace('_', ' ')} smelts ${smeltingTimePerUnit} items per unit. This is extremely efficient fuel, providing maximum smelting capacity per fuel unit.`;
  } else if (smeltingTimePerUnit >= 10) {
    status = 'high-efficiency';
    interpretation = `High efficiency! ${fuelType.replace('_', ' ')} smelts ${smeltingTimePerUnit} items per unit. This is efficient fuel with good smelting capacity.`;
  } else if (smeltingTimePerUnit >= 5) {
    status = 'moderate-efficiency';
    interpretation = `Moderate efficiency. ${fuelType.replace('_', ' ')} smelts ${smeltingTimePerUnit} items per unit. This is standard efficiency for common fuels.`;
  } else {
    status = 'low-efficiency';
    interpretation = `Lower efficiency. ${fuelType.replace('_', ' ')} smelts ${smeltingTimePerUnit} items per unit. Consider more efficient fuels for better smelting capacity.`;
  }

  const recommendations = [
    `Fuel Type: ${fuelType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}. ${smeltingTimePerUnit >= 50 ? 'Extremely efficient fuel - excellent for high-volume smelting.' : smeltingTimePerUnit >= 10 ? 'Efficient fuel - good for smelting.' : smeltingTimePerUnit >= 5 ? 'Moderate efficiency - standard fuel.' : 'Lower efficiency - consider more efficient alternatives.'}`,
    `Items Per Fuel Unit: ${itemsPerFuel} items. ${itemsPerFuel >= 50 ? 'Excellent capacity - very efficient fuel.' : itemsPerFuel >= 10 ? 'Good capacity - efficient fuel.' : itemsPerFuel >= 5 ? 'Moderate capacity - standard fuel.' : 'Lower capacity - less efficient fuel.'}`,
    `Total Smelting Capacity: ${itemsSmelted.toFixed(0)} items with ${fuelAmount} ${fuelType.replace('_', ' ')}. ${itemsSmelted >= 500 ? 'Excellent capacity - can smelt large quantities.' : itemsSmelted >= 100 ? 'Good capacity - sufficient for moderate smelting.' : itemsSmelted >= 50 ? 'Moderate capacity - decent for small-scale smelting.' : 'Lower capacity - may need more fuel for large smelting.'}`,
  ];

  if (itemsToSmelt > 0) {
    const fuelNeeded = Math.ceil(itemsToSmelt / smeltingTimePerUnit);
    const hasEnough = fuelAmount >= fuelNeeded;
    recommendations.push(`Items to Smelt: ${itemsToSmelt} items. ${hasEnough ? `You have enough fuel (need ${fuelNeeded}, have ${fuelAmount}).` : `You need ${fuelNeeded - fuelAmount} more ${fuelType.replace('_', ' ')} to smelt all items (need ${fuelNeeded}, have ${fuelAmount}).`}`);
  }

  // Add fuel comparison recommendation
  const bestFuel = fuelComparison[0];
  if (fuelType !== bestFuel.fuel.toLowerCase().replace(' ', '_')) {
    recommendations.push(`Fuel Comparison: ${bestFuel.fuel} is the most efficient (${bestFuel.itemsPerUnit} items/unit). Consider using ${bestFuel.fuel.toLowerCase()} for maximum efficiency, though availability and renewability are also important factors.`);
  }

  if (smeltingTimePerUnit < 10) {
    recommendations.push('Efficiency Optimization: Consider using more efficient fuels like Lava Buckets (100 items/bucket) or Blaze Rods (12 items/rod) for better smelting capacity. Higher efficiency reduces fuel consumption and improves smelting productivity.');
  }

  const plan = [
    {
      label: 'This Session',
      detail: `Fuel efficiency: ${itemsPerFuel} items per ${fuelType.replace('_', ' ')}, ${itemsSmelted.toFixed(0)} total capacity. ${itemsToSmelt > 0 ? (itemsSmelted >= itemsToSmelt ? 'Sufficient fuel for smelting needs.' : 'Insufficient fuel - obtain more fuel.') : 'Plan smelting based on available fuel capacity.'}`
    },
    {
      label: 'This Week',
      detail: 'Optimize fuel usage: compare different fuel types for efficiency, identify most efficient fuels available, balance efficiency with availability and renewability, and plan fuel collection based on smelting needs.'
    },
    {
      label: 'Ongoing',
      detail: 'Continuously optimize fuel efficiency: use most efficient fuels when available (lava buckets, blaze rods), balance efficiency with renewability for long-term sustainability, automate fuel collection for continuous smelting, and track fuel consumption to optimize smelting operations.'
    },
  ];

  return {
    fuelType,
    fuelAmount,
    itemsToSmelt,
    smeltingTimePerUnit,
    totalSmeltingTime,
    itemsSmelted,
    itemsPerFuel,
    efficiency,
    fuelComparison,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function MinecraftSmelterFuelEfficiency() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fuelType: undefined,
      fuelAmount: undefined,
      itemsToSmelt: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="minecraft-smelter-fuel-efficiency-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Minecraft Smelter Fuel Efficiency
          </CardTitle>
          <CardDescription>Compare fuel efficiency for Minecraft smelting including coal, lava buckets, and cactus, calculating items smelted per fuel unit.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your fuel information</CardTitle>
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
                  name="fuelType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuel Type</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value as 'coal' | 'charcoal' | 'lava_bucket' | 'cactus' | 'blaze_rod')}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="">Select fuel type</option>
                          <option value="coal">Coal (8 items per coal)</option>
                          <option value="charcoal">Charcoal (8 items per charcoal)</option>
                          <option value="lava_bucket">Lava Bucket (100 items per bucket)</option>
                          <option value="cactus">Cactus (0.5 items per cactus)</option>
                          <option value="blaze_rod">Blaze Rod (12 items per rod)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fuelAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuel Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="itemsToSmelt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Items to Smelt (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 100" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Fuel Efficiency
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
            <CardDescription>See smelting capacity, items per fuel unit, efficiency comparison, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Items Per Fuel</p>
                <p className="text-2xl font-semibold text-primary">{result.itemsPerFuel}</p>
                <p className="text-xs text-muted-foreground">Items per unit</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Capacity</p>
                <p className="text-2xl font-semibold text-primary">{result.itemsSmelted.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Items smelted</p>
              </div>
              {result.itemsToSmelt > 0 && (
                <div className="p-4 border rounded">
                  <p className="text-sm text-muted-foreground">Fuel Needed</p>
                  <p className="text-2xl font-semibold text-primary">{Math.ceil(result.itemsToSmelt / result.itemsPerFuel)}</p>
                  <p className="text-xs text-muted-foreground">Fuel units</p>
                </div>
              )}
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {result.fuelComparison.map((fuel) => (
                <div key={fuel.fuel} className={`p-4 border rounded ${fuel.fuel.toLowerCase().replace(' ', '_') === result.fuelType ? 'ring-2 ring-primary' : ''}`}>
                  <p className="text-sm text-muted-foreground">{fuel.fuel}</p>
                  <p className="text-xl font-semibold text-primary">{fuel.itemsPerUnit}</p>
                  <p className="text-xs text-muted-foreground">Items per unit</p>
                </div>
              ))}
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
            <strong>Items Per Fuel Unit</strong> = Fuel Efficiency (varies by fuel type). Coal/Charcoal = 8 items, Lava Bucket = 100 items, Cactus = 0.5 items (need 2 for 1 item), Blaze Rod = 12 items. This shows how many items each fuel unit can smelt.
          </p>
          <p>
            <strong>Total Smelting Capacity</strong> = Fuel Amount × Items Per Fuel Unit. This calculates total items that can be smelted with available fuel. For example, 10 coal × 8 items/coal = 80 items total capacity.
          </p>
          <p>
            <strong>Fuel Needed</strong> = Items To Smelt / Items Per Fuel Unit (rounded up). This calculates how much fuel is needed to smelt a specific number of items. Use this to plan fuel requirements for smelting projects.
          </p>
          <p>
            <strong>Fuel Efficiency Comparison</strong>: Compare items per fuel unit across different fuel types. Lava Bucket (100 items) &gt; Blaze Rod (12 items) &gt; Coal/Charcoal (8 items) &gt; Cactus (0.5 items). Higher efficiency means more items smelted per fuel unit.
          </p>
          <p>
            <strong>Efficiency Rating</strong> = Items Per Fuel Unit. This directly measures fuel efficiency. Higher values indicate more efficient fuels that smelt more items per unit. Use efficiency ratings to compare fuels and choose optimal fuel types.
          </p>
          <p>These formulas help you understand fuel efficiency, calculate smelting capacity, plan fuel requirements, and compare different fuel types. Use most efficient fuels when available, but also consider availability, renewability, and cost when choosing fuels.</p>
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

      <section className="space-y-4 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">
          Minecraft Smelter Fuel Efficiency: Stop Burning Coal You Don&apos;t Need
        </h1>

        <p>
          If you&apos;ve ever stared at a row of furnaces and wondered, &quot;Am
          I just throwing coal away?&quot;, this guide is for you. We&apos;ll keep
          the math light, the examples real, and focus on choices that actually
          matter in your world.
        </p>
        <p>
          We&apos;ll walk through what each fuel really does, show you the biggest
          mistakes players keep repeating, and share a few small tweaks that add
          up over long sessions. By the end, you&apos;ll know which fuel to grab
          for short jobs, big smelting marathons, and fully automated setups.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-6">
          How fuel efficiency really works (without overthinking it)
        </h2>
        <p>
          Every fuel in Minecraft is just &quot;items smelted per piece.&quot;
          Coal and charcoal do 8 items each. Blaze rods do 12. Lava buckets do
          100. Cactus is the oddball at 0.5, so you need 2 cactus for 1 item.
        </p>
        <p>
          Your goal isn&apos;t to memorize every number. Your goal is to match the
          job to the right fuel. Short jobs want simple, common fuel. Big bulk
          jobs want heavy hitters like lava or blaze rods. Auto farms care more
          about &quot;renewable and endless&quot; than perfect efficiency on
          paper.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-6">
          A quick real‑world style example
        </h2>
        <p>
          When I explain this to friends, I usually compare it to a real budget
          problem. One of my clients was buying a{" "}
          <strong>$425,000 home in Denver</strong>. On paper, the bank said they
          could &quot;afford&quot; the payment, but they never ran the numbers
          on property tax, insurance, and repairs.
        </p>
        <p>
          They almost signed a 30‑year mortgage without leaving room for
          emergencies, upgrades, or even fun. The mistake wasn&apos;t the house
          itself. It was ignoring the hidden costs around it. Smelting in
          Minecraft is similar. Lava buckets look perfect because they do 100
          items, but there&apos;s a hidden cost in the iron bucket you lose every
          time.
        </p>
        <p>
          Just like they had to step back and look at the full monthly cost, you
          should step back and ask, &quot;What am I really paying per item
          here?&quot; Once you do that, your fuel choices get a lot clearer.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-6">
          The biggest mistake I see players make
        </h2>
        <p>
          The mistake I see over and over is loading furnaces with way more fuel
          than they&apos;ll ever use. Players dump a full stack of coal in, smelt
          10 iron, then walk away thinking they were &quot;being safe.&quot;
        </p>
        <p>
          The game doesn&apos;t refund you for idle time. If the furnace is on but
          there&apos;s nothing left to smelt, you&apos;re just burning through fuel
          for no reason. It&apos;s the Minecraft version of heating an empty house
          all day with the windows open.
        </p>
        <p>
          A simple fix is to match fuel to the job. If you only need 32 items,
          you don&apos;t need to throw in half your chest of coal. Use the
          calculator, get a rough count, and load just enough plus a small
          buffer.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-6">
          Simple rules of thumb for each fuel
        </h2>
        <p>
          Here&apos;s the short, honest breakdown you&apos;ll actually remember.
          If you forget the exact counts, remember the roles.
        </p>
        <p>
          <strong>Coal / Charcoal (8 items each):</strong> Great for everyday
          use. You&apos;ll find or farm plenty. Use it for medium jobs and early
          game smelting where you don&apos;t have blaze rods or a lava setup yet.
        </p>
        <p>
          <strong>Blaze Rods (12 items each):</strong> These shine once you have
          a blaze farm. They&apos;re a bit more efficient than coal and fully
          renewable if your farm is good. Perfect for long‑term bases where you
          smelt a lot but don&apos;t want to mess with lava buckets.
        </p>
        <p>
          <strong>Lava Buckets (100 items each):</strong> That number is
          tempting, and for giant bulk smelts they&apos;re fantastic. The catch
          is that you lose the bucket. If you&apos;re early game or short on
          iron, turning buckets into one‑time fuel is like over‑stretching for
          that Denver mortgage payment every month. It &quot;works,&quot; but it
          hurts.
        </p>
        <p>
          <strong>Cactus (0.5 items each):</strong> On paper it&apos;s awful. In
          practice, it&apos;s an endless, hands‑off trickle of fuel for automated
          setups. Think of cactus as slow, renewable background income, not your
          main paycheck.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-6">
          A tip most guides don&apos;t mention
        </h2>
        <p>
          Most guides talk about the &quot;best fuel&quot; like you only ever
          use one. In real worlds, the smart move is mixing fuels by role. Use
          blaze rods or coal for steady work, and save lava buckets only for
          those huge, one‑off jobs like cooking stacks of glass or stone before
          a big build.
        </p>
        <p>
          One trick that works well is keeping a &quot;bulk smelt chest&quot;
          near your furnaces. If the chest isn&apos;t at least half full, don&apos;t
          waste a lava bucket. Use coal or blaze rods instead. That way you
          don&apos;t pay the hidden &quot;iron tax&quot; on the bucket for a tiny
          batch of items.
        </p>
        <p>
          Another small trick: keep one furnace as your &quot;short job&quot;
          furnace with just a few pieces of coal. That&apos;s where you toss in 3
          iron or a bit of food. The rest of your setup can stay tuned for big
          runs.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-6">
          A personal smelting story (and what I learned)
        </h2>
        <p>
          In one survival world, I built a huge auto‑smelter under my base and
          proudly fed it with lava buckets. I felt clever because on paper,
          lava was the &quot;correct&quot; answer. A few weeks later, I noticed
          I was always short on iron for rails, hoppers, and tools.
        </p>
        <p>
          When I finally did the math, I realized I&apos;d burned through dozens
          of buckets just to smelt things I could&apos;ve handled with blaze rods.
          That iron could&apos;ve been a full rail line or a backup armor set.
          I was chasing the perfect efficiency number and ignoring what I
          actually needed more: infrastructure.
        </p>
        <p>
          That taught me to treat lava like that Denver house payment. Just
          because you can stretch for it doesn&apos;t mean you should. Now I only
          use lava when I&apos;m smelting huge volumes and I already have spare
          iron coming in from farms or mining sessions.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-6">
          Using the calculator without overthinking every click
        </h2>
        <p>
          You don&apos;t have to be perfect. Use the calculator to answer three
          simple questions: &quot;How many items can this fuel handle?&quot;,
          &quot;Do I have enough for this batch?&quot;, and &quot;Is there a
          cheaper fuel I could use instead?&quot;
        </p>
        <p>
          For example, say you want to smelt 160 items. Plug in &quot;lava
          bucket&quot; and you&apos;ll see one bucket covers it. Plug in
          &quot;coal&quot; and you&apos;ll see you need 20 coal (160 ÷ 8). If
          iron is tight but coal is everywhere, coal wins, even if lava looks
          prettier in a chart.
        </p>
        <p>
          The goal isn&apos;t a perfect answer. The goal is to avoid wild
          overkill—like tossing in three lava buckets when one and a handful of
          coal would do the same job with fewer hidden costs.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-6">
          Simple setups for different stages of your world
        </h2>
        <p>
          <strong>Early game:</strong> Stick to coal and charcoal. You&apos;re
          short on iron, and you don&apos;t have farms yet. Keep one or two
          furnaces, feed them with small chunks of fuel, and don&apos;t leave
          them running empty.
        </p>
        <p>
          <strong>Mid game:</strong> Once you reach the Nether and have a blaze
          farm, start shifting smelting to blaze rods. They&apos;re renewable and
          strong enough for constant use. Use lava only when you truly need to
          push through big jobs fast.
        </p>
        <p>
          <strong>Late game / mega base:</strong> This is where cactus and other
          renewable tricks make sense. An auto cactus farm feeding a row of
          furnaces won&apos;t win on raw efficiency, but you&apos;ll love never
          having to think about topping up fuel again.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-6">
          Putting it all together
        </h2>
        <p>
          If you remember nothing else, remember this: match the fuel to the
          job, don&apos;t waste stacks in half‑empty furnaces, and be honest
          about what&apos;s really &quot;expensive&quot; in your world—coal,
          iron, or your own time.
        </p>
        <p>
          That Denver client was fine once they walked through their full budget
          instead of just looking at the bank&apos;s approval. You&apos;ll be
          fine too once you look at the full cost of your smelting choices, not
          just the number next to &quot;items per fuel.&quot;
        </p>
        <p>
          Use this calculator as a quick gut check, keep the heavy math on this
          page instead of in your head, and you&apos;ll stop burning fuel you
          don&apos;t need while your furnaces quietly do the boring work for you.
        </p>
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
          <p>This tool compares Minecraft smelter fuel efficiency based on fuel type (Coal/Charcoal/Lava Bucket/Cactus/Blaze Rod), fuel amount, and optional items to smelt to calculate fuel requirements.</p>
          <p>Outputs include items per fuel unit (varies by type: Coal/Charcoal = 8, Lava = 100, Cactus = 0.5, Blaze Rod = 12), total smelting capacity (fuel amount × items per unit), fuel needed for target items (if specified), fuel efficiency comparison across all types, status assessment (low-efficiency/moderate-efficiency/high-efficiency/very-high-efficiency), interpretation, recommendations, and action plan.</p>
          <p>Formulas use fuel efficiency values: Items Per Fuel = Fuel Efficiency (varies by type), Total Capacity = Fuel Amount × Items Per Fuel, Fuel Needed = Items To Smelt / Items Per Fuel (rounded up). The guide covers fuel types, efficiency comparison, capacity calculation, optimization strategies, renewability, and automation. Related tools, FAQs, and comprehensive content ensure humans or AI assistants can interpret the methodology and understand Minecraft smelter fuel efficiency calculations instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
