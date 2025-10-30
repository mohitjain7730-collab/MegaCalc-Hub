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
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/HowTo">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Wall Framing Lumber Calculation: Studs, Plates, Headers, and Waste" />
    <meta itemProp="description" content="An expert guide detailing the formulas and industry standards for calculating the total quantity of lumber required for wall framing, including estimation of studs, top/bottom plates, headers, cripples, and waste factors for structural reliability." />
    <meta itemProp="keywords" content="wall framing lumber calculator, how many studs do I need, calculating top and bottom plates, header sizing load bearing, rough opening calculation, lumber waste factor framing, standard stud spacing" />
    <meta itemProp="author" content="[Your Site's Home Improvement Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-wall-framing-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Wall Framing Lumber: Calculating Studs, Plates, and Headers</h1>
    <p className="text-lg italic text-gray-700">Master the structural requirements and quantity calculations needed to estimate all lumber for walls and rough openings.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#plates" className="hover:underline">Plates Calculation: Top and Bottom Linear Footage</a></li>
        <li><a href="#studs" className="hover:underline">Studs Calculation: Spacing and Quantity</a></li>
        <li><a href="#openings" className="hover:underline">Rough Opening Framing: Headers, Jacks, and Cripples</a></li>
        <li><a href="#waste" className="hover:underline">The Critical Role of the Waste Factor</a></li>
        <li><a href="#total-lumber" className="hover:underline">Total Lumber Conversion and Board Feet</a></li>
    </ul>
<hr />

    {/* PLATES CALCULATION: TOP AND BOTTOM LINEAR FOOTAGE */}
    <h2 id="plates" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Plates Calculation: Top and Bottom Linear Footage</h2>
    <p>Plates are the horizontal members that anchor the vertical studs, forming the top and bottom of the wall assembly. Their quantity is determined by the total length of the wall (the perimeter).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Bottom Plate (Sole Plate)</h3>
    <p>The **Bottom Plate** (or sole plate) rests directly on the subfloor or foundation. It requires one continuous piece of lumber for the total linear length of the wall.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Top Plates (Double Top Plate)</h3>
    <p>The **Top Plate** is almost always doubled (a "double top plate") to provide structural strength for carrying roof or floor loads and to connect adjoining walls (corner and T-intersections). Therefore, the linear footage required for the top plate is typically double the wall length.</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Total Plate Length = (Wall Length * 3)'}
        </p>
    </div>
    <p>The total calculated linear footage is then converted into purchase units based on standard lumber lengths (8 ft, 10 ft, 12 ft, etc.), rounding up to the next available board size.</p>

<hr />

    {/* STUDS CALCULATION: SPACING AND QUANTITY */}
    <h2 id="studs" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Studs Calculation: Spacing and Quantity</h2>
    <p>Vertical studs bear the weight of the structure. The quantity is determined by the total wall length and the code-required spacing.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Standard Stud Spacing</h3>
    <p>Building codes mandate standard spacing, typically **16 inches on center (OC)** or **24 inches on center (OC)**. The 16-inch OC spacing is standard for most residential load-bearing walls and is required for easier installation of standard drywall sheets (4-foot wide sheets fit perfectly across the stud centers).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Formula</h3>
    <p>The number of full-height studs required for a wall is found by dividing the wall length by the spacing, plus one for the end stud, plus additional studs for corners and T-intersections:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Studs = (Wall Length / Spacing) + 1 + (Corner/Intersection Factor)'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Corner and Intersection Factors</h3>
    <p>Special framing techniques are required where walls meet to provide nailing surfaces for interior sheathing (drywall):</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Corners:</strong> Typically require three studs (a "three-stud corner") to create a solid nailing surface on both intersecting walls.</li>
        <li><strong className="font-semibold">T-Intersections:</strong> Where a wall intersects an existing wall (a "T-junction"), two or three studs are used to provide the necessary backing and structural connection.</li>
    </ul>

<hr />

    {/* ROUGH OPENING FRAMING: HEADERS, JACKS, AND CRIPPLES */}
    <h2 id="openings" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Rough Opening Framing: Headers, Jacks, and Cripples</h2>
    <p>Any opening in a wall (windows, doors, utility access) requires specialized framing to transfer the structural load around the opening. This assembly is called the **Rough Opening (RO)**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Headers (Lintels)</h3>
    <p>The **Header** (or lintel) is a horizontal beam placed above the opening to carry the load previously borne by the full-height studs. The size (depth and thickness) of the header is determined by the width of the opening and whether the wall is load-bearing. Wider openings require larger, sometimes engineered, headers.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Jack Studs (Trimmers) and King Studs</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">King Studs:</strong> Full-height studs running alongside the opening to frame the header. There are two per opening.</li>
        <li><strong className="font-semibold">Jack Studs (Trimmers):</strong> Shorter studs placed directly beneath the header to support its weight. There are two per opening.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Sill and Cripples</h3>
    <p>For window openings, a **Rough Sill** (a horizontal plate) is added at the bottom, supported by **Cripples**—short studs running from the bottom plate to the sill, and from the header to the top plate, where necessary.</p>

<hr />

    {/* THE CRITICAL ROLE OF THE WASTE FACTOR */}
    <h2 id="waste" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Critical Role of the Waste Factor</h2>
    <p>Lumber estimation requires adding a **Waste Factor** to the calculated total quantity to account for unusable sections of wood (knots, warped boards), mistakes, and necessary trimming.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Standard Framing Waste</h3>
    <p>The standard waste percentage for structural lumber is typically **10% to 15%** of the total calculated board feet. This factor ensures the crew does not run short of material due to common imperfections in the lumber supply.</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Total Lumber Needed = Calculated Board Feet * (1 + Waste Factor)'}
        </p>
    </div>

<hr />

    {/* TOTAL LUMBER CONVERSION AND BOARD FEET */}
    <h2 id="total-lumber" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Total Lumber Conversion and Board Feet</h2>
    <p>Once all components (plates, studs, headers, jacks, cripples) are quantified in linear feet, the final step is to convert the total quantity into the industry standard purchasing unit: **Board Feet**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Definition of Board Foot</h3>
    <p>A **Board Foot** is a unit of lumber volume equal to a piece that is 1 foot long, 1 foot wide, and 1 inch thick (144 cubic inches). This unit standardizes the pricing and ordering of lumber regardless of the dimensions of the piece.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Board Feet Formula (Approximate)</h3>
    <p>The conversion formula multiplies the nominal thickness (T) and nominal width (W) by the total length (L) in feet and divides by 12:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Board Feet = (T * W * L) / 12'}
        </p>
    </div>
    <p>For example, a standard 2x4 stud that is 8 feet long contains (2 multiplied by 4 multiplied by 8) divided by 12, which equals approximately 5.33 board feet.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Wall framing lumber calculation is a multi-step geometric process that ensures structural integrity and maximizes material efficiency. The core estimate is built upon determining the linear feet for the **double top plates** and the quantity of **studs** based on strict 16-inch or 24-inch spacing.</p>
    <p>Accurate estimation must fully account for the complex components of **rough openings** (headers, jack studs, and cripples). By aggregating all linear feet and applying a crucial **waste factor**, estimators can calculate the final quantity in board feet necessary to complete the project while maintaining code compliance.</p>
</section>

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


