'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, PackageOpen, Info, Building } from 'lucide-react';

const formSchema = z.object({
  cabinetDoors: z.number().min(0).optional(),
  drawers: z.number().min(0).optional(),
  pullsPerDoor: z.number().min(1).max(2).optional(),
  pullsPerDrawer: z.number().min(1).max(2).optional(),
  packSize: z.number().min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DoorCabinetHardwareCalculator() {
  const [result, setResult] = useState<{
    totalPieces: number;
    totalPacks: number;
    interpretation: string;
    recommendations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cabinetDoors: undefined,
      drawers: undefined,
      pullsPerDoor: undefined,
      pullsPerDrawer: undefined,
      packSize: undefined,
    },
  });

  const onSubmit = (v: FormValues) => {
    if (
      v.cabinetDoors == null ||
      v.drawers == null ||
      v.pullsPerDoor == null ||
      v.pullsPerDrawer == null ||
      v.packSize == null
    ) {
      setResult(null);
      return;
    }
    const totalPieces = v.cabinetDoors * v.pullsPerDoor + v.drawers * v.pullsPerDrawer;
    const totalPacks = Math.ceil(totalPieces / v.packSize);
    const interpretation = totalPieces >= 40 ? 'Large kitchen or multi-room project' : totalPieces >= 20 ? 'Medium project' : 'Small project';
    const recommendations = [
      'Order one extra pack to cover future replacements and failures.',
      'Match screw length to door/drawer thickness (common: 1" for doors, 1-1/4" for drawers).',
      'Use a jig for consistent handle alignment.',
    ];
    setResult({ totalPieces, totalPacks, interpretation, recommendations });
  };

  return (
    <div className="space-y-8">
      {/* Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Door & Cabinet Hardware
          </CardTitle>
          <CardDescription>Estimate pulls/knobs and packs required</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="cabinetDoors" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Cabinet Doors</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 18" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="drawers" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Drawers</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="pullsPerDoor" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pulls/Knobs per Door</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Most doors use 1; wide doors may use 2</p>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="pullsPerDrawer" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pulls/Knobs per Drawer</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Wide drawers often use 2 pulls</p>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="packSize" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pack Size (pieces)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageOpen className="h-5 w-5" />
              Hardware Needed
            </CardTitle>
            <CardDescription>Total pieces and packs required</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-primary/5 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Pieces</p>
                <p className="text-3xl font-bold text-primary">{result.totalPieces}</p>
              </div>
              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Packs Required</p>
                <p className="text-2xl font-bold">{result.totalPacks}</p>
              </div>
              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Project Size</p>
                <p className="text-xl font-semibold">{result.interpretation}</p>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Recommendations</h4>
              <ul className="list-disc ml-5 text-sm text-muted-foreground">
                {result.recommendations.map((r, i) => (<li key={i}>{r}</li>))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>Explore other home-improvement tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-1"><a href="/category/home-improvement/paint-coverage-calculator" className="text-primary hover:underline">Paint Coverage Calculator</a></h4><p className="text-sm text-muted-foreground">Estimate paint needed for rooms.</p></div>
            <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-1"><a href="/category/home-improvement/wallpaper-roll-calculator" className="text-primary hover:underline">Wallpaper Roll Calculator</a></h4><p className="text-sm text-muted-foreground">Determine rolls based on area.</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Complete Guide to Cabinet Hardware</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Add your detailed guide here.</p>
          <p>These two lines are placeholders you can replace later.</p>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle>
          <CardDescription>About cabinet hardware planning</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['Should I use knobs or pulls?', 'Either works—pulls are common on drawers; knobs on doors.'],
            ['How do I center handles?', 'Use a drilling jig; measure twice and test on scrap.'],
            ['What screw length do I need?', 'Typically 1" for doors, 1-1/4" for drawers; verify thickness.'],
            ['How many spares to order?', 'At least 2–4 extra pieces for future replacement.'],
            ['Are packs standardized?', 'Pack sizes vary; enter the exact count per pack.'],
            ['Do I need two pulls on wide drawers?', 'Yes for >30" width to avoid sag and provide leverage.'],
            ['Can I mix finishes?', 'Keep finishes consistent within a room for cohesion.'],
            ['What about drilling old holes?', 'Use backplates or wood filler and refinish as needed.'],
            ['Are templates universal?', 'Most jigs are adjustable; always check hole spacing.'],
            ['What is standard hole spacing?', 'Common pull center-to-center sizes: 3", 96mm, 128mm.'],
          ].map(([q,a],i) => (
            <div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}


