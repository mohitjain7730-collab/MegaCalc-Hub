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
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/HowTo">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Door and Cabinet Hardware Calculation: Hinges, Knobs, Pulls, and Slide Requirements" />
    <meta itemProp="description" content="An expert guide detailing the formulas and industry standards for calculating the number of hinges, drawer slides, cabinet pulls/knobs, and door closers required based on door weight, size, and opening frequency." />
    <meta itemProp="keywords" content="cabinet hardware calculator formula, how many hinges per door, drawer slide weight capacity, cabinet pull spacing rule, door knob placement height, hinge load calculation" />
    <meta itemProp="author" content="[Your Site's Home Improvement Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-hardware-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Door & Cabinet Hardware: Calculating Hinges, Knobs, and Pulls</h1>
    <p className="text-lg italic text-gray-700">Master the industry standards and formulas that ensure the correct load-bearing capacity and aesthetic placement for all essential moving parts.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#hinge-door" className="hover:underline">Door Hinges: Quantity, Placement, and Load Capacity</a></li>
        <li><a href="#hinge-cabinet" className="hover:underline">Cabinet Hinges: Types and Quantity per Door</a></li>
        <li><a href="#drawer-slides" className="hover:underline">Drawer Slides: Length, Over-Travel, and Weight Rating</a></li>
        <li><a href="#pulls-knobs" className="hover:underline">Pulls and Knobs: Quantity and Ergonomic Placement</a></li>
        <li><a href="#supplemental" className="hover:underline">Supplemental Hardware: Catches, Closers, and Dampers</a></li>
    </ul>
<hr />

    {/* DOOR HINGES: QUANTITY, PLACEMENT, AND LOAD CAPACITY */}
    <h2 id="hinge-door" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Door Hinges: Quantity, Placement, and Load Capacity</h2>
    <p>Hinges are the load-bearing foundation for all swinging doors. The calculation focuses on matching the door's weight and size to the hinge's load capacity and ensuring proper placement for stability.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Hinge Quantity Rule</h3>
    <p>The number of hinges required depends on the door height and weight:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Doors up to 60 inches (1.5m):</strong> Minimum of 2 hinges.</li>
        <li><strong className="font-semibold">Doors 60 to 90 inches (2.3m):</strong> Standard requirement is 3 hinges.</li>
        <li><strong className="font-semibold">Doors over 90 inches or Heavy Doors:</strong> Requires 4 hinges or more.</li>
    </ul>
    <p>A heavier, fire-rated, or high-usage door (e.g., commercial entrance) may require an additional hinge regardless of height to distribute the increased load and stress.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Hinge Placement (Standard 7-11 Rule)</h3>
    <p>Proper placement is essential to prevent warping and sagging. The standard rule of thumb for 3-hinge installation is:</p>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Top Hinge:</strong> Place 7 inches down from the top of the door frame.</li>
        <li><strong className="font-semibold">Bottom Hinge:</strong> Place 11 inches up from the bottom of the door frame.</li>
        <li><strong className="font-semibold">Center Hinge:</strong> Place exactly midway between the top and bottom hinges.</li>
    </ol>
    <p>This maximizes leverage, supporting the weight where it is most concentrated and distributing stress away from the frame.</p>

<hr />

    {/* CABINET HINGES: TYPES AND QUANTITY PER DOOR */}
    <h2 id="hinge-cabinet" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Cabinet Hinges: Types and Quantity per Door</h2>
    <p>Cabinet hinges are primarily chosen based on the desired door overlay (how much the door covers the frame) and are almost always concealed (hidden from view when the door is closed). The quantity rule is simpler than for entry doors.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Hinge Quantity Rule for Cabinets</h3>
    <p>The quantity is determined by door height and weight (e.g., doors with heavy glass inserts require more support):</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Doors up to 40 inches (1m):</strong> Standard requirement is 2 hinges.</li>
        <li><strong className="font-semibold">Doors 40 to 60 inches (1.5m):</strong> Requires 3 hinges.</li>
        <li><strong className="font-semibold">Pantry Doors (over 60 inches):</strong> Requires 4 hinges or more, spaced evenly.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Hinge Overlay Types (Concealed Hinges)</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Full Overlay:</strong> The door completely covers the cabinet box frame edge, common in modern frameless cabinets.</li>
        <li><strong className="font-semibold">Partial Overlay:</strong> The door partially covers the frame, leaving a small space (reveal) to show the frame, common in framed face-frame cabinets.</li>
        <li><strong className="font-semibold">Inlay/Inset:</strong> The door sits flush inside the cabinet frame opening, requiring specialized hinges that handle the load entirely within the box.</li>
    </ul>

<hr />

    {/* DRAWER SLIDES: LENGTH, OVER-TRAVEL, AND WEIGHT RATING */}
    <h2 id="drawer-slides" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Drawer Slides: Length, Over-Travel, and Weight Rating</h2>
    <p>Drawer slides are estimated based on the drawer box depth and the required weight capacity, especially critical for deep storage or heavy-duty applications (e.g., filing cabinets, toolboxes).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Slide Length and Over-Travel</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Slide Length:</strong> Slides are typically purchased in lengths 1 to 2 inches shorter than the actual drawer box depth to allow clearance for the back of the cabinet.</li>
        <li><strong className="font-semibold">Over-Travel Slides:</strong> These specialized slides extend the drawer box past the face of the cabinet, offering 100% access to items stored at the very back. They are essential for deep pantry or utility drawers.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Weight Rating (Dynamic Load)</h3>
    <p>The slide's published rating (e.g., 75 lbs, 100 lbs, 200 lbs) refers to the **dynamic load**—the maximum weight the slide can support when the drawer is fully extended and loaded. For standard kitchen or bathroom drawers, 75 to 100 lbs is sufficient. For heavy-duty use (e.g., kitchen mixer or utility cabinets), commercial slides rated for 150 lbs or more are required.</p>

<hr />

    {/* PULLS AND KNOBS: QUANTITY AND ERGONOMIC PLACEMENT */}
    <h2 id="pulls-knobs" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Pulls and Knobs: Quantity and Ergonomic Placement</h2>
    <p>Pulls (handles) and knobs are chosen based on aesthetic style, but their quantity and placement are governed by ergonomic and proportional rules.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Quantity Rules for Cabinetry</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Standard Doors:</strong> One knob or pull, placed on the edge opposite the hinges.</li>
        <li><strong className="font-semibold">Extra-Wide Doors (over 36 inches):</strong> May require two pulls for better load distribution and aesthetic balance.</li>
        <li><strong className="font-semibold">Drawers:</strong> Drawers up to 24 inches wide use one pull or knob. Drawers over 24 inches wide typically require two pulls, placed symmetrically, to prevent the drawer face from racking when pulled open.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Ergonomic and Aesthetic Placement</h3>
    <p>Placement ensures the hardware is comfortable to grasp and visually appealing:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Upper Cabinet Doors:</strong> Knobs or pulls are typically placed 2-3 inches up from the bottom edge of the door frame.</li>
        <li><strong className="font-semibold">Lower Cabinet Doors:</strong> Placed 2-3 inches down from the top edge of the door frame.</li>
        <li><strong className="font-semibold">Drawers:</strong> Centered horizontally on the drawer face. Vertically, they are centered on the drawer face, or placed on the top third for visual emphasis.</li>
    </ul>

<hr />

    {/* SUPPLEMENTAL HARDWARE: CATCHES, CLOSERS, AND DAMPERS */}
    <h2 id="supplemental" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Supplemental Hardware: Catches, Closers, and Dampers</h2>
    <p>Beyond basic hinges and pulls, specialized hardware is required to control door and drawer movement and enhance quiet operation.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Door Closers and Dampers (Soft-Close)</h3>
    <p><strong className="font-semibold">Door Closers</strong> (for entry doors) are hydraulic or spring mechanisms calculated based on the fire rating and the required closing force and speed. For cabinetry, **Dampers** or soft-close slides/hinges slow the final closing arc of the door or drawer, eliminating slamming and reducing wear.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Door Stops and Catches</h3>
    <p>Door stops prevent damage to the wall, while **Catches** (magnetic, roller, or ball catches) are required for doors or drawers without self-closing mechanisms to ensure they remain fully closed. These are calculated on a one-to-one basis for each item requiring closure.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Hardware calculation is a critical process that balances load-bearing structural requirements with aesthetic ergonomics. For doors, quantity is driven by height and weight, ensuring the hinge system prevents sagging and warping.</p>
    <p>For cabinetry, accurate estimation requires selecting the correct **slide weight rating** and determining the **fullness multiplier** for pulls on wide drawers. By adhering to these dimensional and proportional rules, the final hardware selection ensures long-term function, safety, and visual balance.</p>
</section>

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


