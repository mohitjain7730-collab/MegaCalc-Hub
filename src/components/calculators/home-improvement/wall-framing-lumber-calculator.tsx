'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ruler, Hammer, Building2, Info } from 'lucide-react';

const formSchema = z.object({
  wallLength: z.number().min(0.5).optional(), // feet
  studSpacingInches: z.number().min(8).max(24).optional(),
  wallHeight: z.number().min(6).optional(), // feet
  openings: z.number().min(0).optional(), // windows/doors
  plates: z.number().min(2).max(3).optional(), // 2=top+bottom, 3=double top
});

type FormValues = z.infer<typeof formSchema>;

export default function WallFramingLumberCalculator() {
  const [result, setResult] = useState<{
    studs: number;
    platesLinearFeet: number;
    total2x4s: number;
    interpretation: string;
    recommendations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wallLength: undefined,
      studSpacingInches: undefined,
      wallHeight: undefined,
      openings: undefined,
      plates: undefined,
    },
  });

  const onSubmit = (v: FormValues) => {
    if (v.wallLength == null || v.studSpacingInches == null || v.wallHeight == null || v.plates == null || v.openings == null) { setResult(null); return; }

    // Stud count: studs at each end + spacing along length + openings (king+jack pairs per opening)
    const spacingFeet = v.studSpacingInches / 12;
    const interiorStuds = Math.floor(v.wallLength / spacingFeet) - 1; // exclude ends
    const endStuds = 2; // both ends
    const openingStuds = v.openings * 2 /* king */ + v.openings * 2 /* jack */;
    const cornerAdders = 1; // simplified extra for corner/blocking
    const studs = Math.max(0, endStuds + Math.max(0, interiorStuds) + openingStuds + cornerAdders);

    // Plates LF: top+bottom plates (and optional double top)
    const platesLinearFeet = v.wallLength * v.plates;

    // Total 2x4s estimate (8ft pieces): studs + plates cut count
    const studsCount = studs;
    const platePieces = Math.ceil(platesLinearFeet / 8);
    const total2x4s = studsCount + platePieces;

    const interpretation = studsCount >= 60 ? 'Large wall system' : studsCount >= 30 ? 'Medium wall' : 'Small wall';
    const recommendations = [
      'Buy 10% extra lumber to cover waste and culls.',
      'Confirm local code for stud spacing (often 16" OC).',
      'Use treated bottom plate when in contact with slab/concrete.',
    ];

    setResult({ studs: studsCount, platesLinearFeet, total2x4s, interpretation, recommendations });
  };

  return (
    <div className="space-y-8">
      {/* Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Hammer className="h-5 w-5" />Wall Framing Lumber</CardTitle>
          <CardDescription>Estimate studs and plates for a straight wall</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="wallLength" render={({ field }) => (
                  <FormItem><FormLabel>Wall Length (ft)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g., 24" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="studSpacingInches" render={({ field }) => (
                  <FormItem><FormLabel>Stud Spacing (inches)</FormLabel><FormControl><Input type="number" step="1" placeholder="16" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="wallHeight" render={({ field }) => (
                  <FormItem><FormLabel>Wall Height (ft)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="8" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="openings" render={({ field }) => (
                  <FormItem><FormLabel>Openings (doors/windows)</FormLabel><FormControl><Input type="number" step="1" placeholder="e.g., 2" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="plates" render={({ field }) => (
                  <FormItem><FormLabel>Number of Plates (2 or 3)</FormLabel><FormControl><Input type="number" step="1" placeholder="2" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
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
            <CardTitle className="flex items-center gap-2"><Ruler className="h-5 w-5" />Framing Materials</CardTitle>
            <CardDescription>Studs, plates, and total 2x4 pieces</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-primary/5 rounded-lg"><p className="text-sm text-muted-foreground mb-1">Studs</p><p className="text-3xl font-bold text-primary">{result.studs}</p></div>
              <div className="text-center p-6 bg-muted/50 rounded-lg"><p className="text-sm text-muted-foreground mb-1">Plates (linear ft)</p><p className="text-2xl font-bold">{result.platesLinearFeet.toFixed(1)}</p></div>
              <div className="text-center p-6 bg-muted/50 rounded-lg"><p className="text-sm text-muted-foreground mb-1">Total 2x4s (8 ft)</p><p className="text-2xl font-bold">{result.total2x4s}</p></div>
            </div>
            <div className="mt-6"><h4 className="font-semibold mb-2">Recommendations</h4><ul className="list-disc ml-5 text-sm text-muted-foreground">{result.recommendations.map((r,i)=>(<li key={i}>{r}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      {/* Related */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />Related Calculators</CardTitle>
          <CardDescription>Explore other home-improvement tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-1"><a href="/category/home-improvement/drywall-plasterboard-calculator" className="text-primary hover:underline">Drywall Calculator</a></h4><p className="text-sm text-muted-foreground">Estimate sheets and compound.</p></div>
            <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-1"><a href="/category/home-improvement/roofing-shingle-calculator" className="text-primary hover:underline">Roofing Shingle Calculator</a></h4><p className="text-sm text-muted-foreground">Estimate bundles and underlayment.</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Guide */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Complete Guide to Wall Framing</CardTitle></CardHeader>
        <CardContent>
          <p>Add your detailed guide here.</p>
          <p>These two lines are placeholders you can replace later.</p>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle><CardDescription>About wall framing estimates</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          {[
            ['What spacing should I use?', 'Common residential spacing is 16" on center; some non‑bearing walls use 24".'],
            ['Do I need double top plates?', 'Most codes require double top plates to tie intersecting walls.'],
            ['How many studs per opening?', 'Typically 2 kings + 2 jacks per opening; adjust for width and headers.'],
            ['Should I add waste?', 'Yes—add at least 10% extra lumber for waste and defects.'],
            ['What lumber size is assumed?', 'This calculator assumes 2×4 x 8 ft pieces for totals.'],
            ['How do corners affect count?', 'We include a simple corner adder; complex intersections may need more.'],
            ['Does wall height change stud count?', 'No, it changes cut length; totals are piece counts here.'],
            ['Are headers included?', 'Header material is not included—estimate separately by span.'],
            ['Is blocking included?', 'No; add extra 2×4s for blocking, backing, and fire stops.'],
            ['Does code vary by region?', 'Yes—verify all assumptions with your local building code.'],
          ].map(([q,a],i) => (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}
        </CardContent>
      </Card>
    </div>
  );
}


