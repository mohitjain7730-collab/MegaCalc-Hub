'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightLeft } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

const formSchema = z.object({
  feet: z.coerce.number().min(0, 'Feet cannot be negative').optional(),
  inches: z.coerce.number().min(0, 'Inches cannot be negative').max(11, 'Inches should be 0-11').optional(),
  centimeters: z.coerce.number().min(0, 'Centimeters cannot be negative').optional(),
});

type FormValues = z.infer<typeof formSchema>;

const INCHES_PER_FOOT = 12;
const CM_PER_INCH = 2.54;

function normalizeFromImperial(feet?: number, inches?: number) {
  const totalInches = (feet ?? 0) * INCHES_PER_FOOT + (inches ?? 0);
  const cm = totalInches * CM_PER_INCH;
  return { centimeters: cm };
}

function normalizeFromMetric(centimeters?: number) {
  const totalInches = (centimeters ?? 0) / CM_PER_INCH;
  const feet = Math.floor(totalInches / INCHES_PER_FOOT);
  const inches = totalInches - feet * INCHES_PER_FOOT;
  return { feet, inches };
}

export default function HeightConverter() {
  const [result, setResult] = useState<{ centimeters: number; feet: number; inches: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      feet: undefined,
      inches: undefined,
      centimeters: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const hasMetric = values.centimeters !== undefined && values.centimeters !== null && !Number.isNaN(values.centimeters as number);
    const hasImperial = (values.feet !== undefined || values.inches !== undefined);

    if (hasMetric && hasImperial) {
      // Prefer metric if both provided
      const { feet, inches } = normalizeFromMetric(values.centimeters);
      setResult({ centimeters: values.centimeters!, feet, inches });
      return;
    }

    if (hasMetric) {
      const { feet, inches } = normalizeFromMetric(values.centimeters);
      setResult({ centimeters: values.centimeters!, feet, inches });
      return;
    }

    if (hasImperial) {
      const { centimeters } = normalizeFromImperial(values.feet, values.inches);
      const { feet, inches } = normalizeFromMetric(centimeters);
      setResult({ centimeters, feet, inches });
      return;
    }
  };

  const sampleTable = [
    { feet: 4, inches: 11, centimeters: normalizeFromImperial(4, 11).centimeters },
    { feet: 5, inches: 0, centimeters: normalizeFromImperial(5, 0).centimeters },
    { feet: 5, inches: 5, centimeters: normalizeFromImperial(5, 5).centimeters },
    { feet: 5, inches: 10, centimeters: normalizeFromImperial(5, 10).centimeters },
    { feet: 6, inches: 0, centimeters: normalizeFromImperial(6, 0).centimeters },
    { feet: 6, inches: 2, centimeters: normalizeFromImperial(6, 2).centimeters },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="text-md font-semibold">Imperial</h3>
              <FormField
                control={form.control}
                name="feet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feet (ft)</FormLabel>
                    <FormControl>
                      <Input type="number" inputMode="decimal" placeholder="e.g., 5" {...field} value={field.value ?? ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="inches"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inches (in)</FormLabel>
                    <FormControl>
                      <Input type="number" inputMode="decimal" step="0.1" placeholder="e.g., 11.5" {...field} value={field.value ?? ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-md font-semibold">Metric</h3>
              <FormField
                control={form.control}
                name="centimeters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Centimeters (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" inputMode="decimal" step="0.1" placeholder="e.g., 180" {...field} value={field.value ?? ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <Button type="submit">Convert</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <ArrowRightLeft className="h-8 w-8 text-primary" />
              <CardTitle>Conversion Result</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground">Metric</div>
                <div className="text-2xl font-bold">{result.centimeters.toFixed(1)} cm</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Imperial</div>
                <div className="text-2xl font-bold">{Math.floor(result.feet)} ft {result.inches.toFixed(1)} in</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Meters</div>
                <div className="text-2xl font-bold">{(result.centimeters / 100).toFixed(3)} m</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formulas</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>cm = (ft × 12 + in) × 2.54</p>
              <p className='font-mono p-2 bg-muted rounded-md'>ft = floor((cm / 2.54) ÷ 12), in = (cm / 2.54) mod 12</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Notes</h4>
              <p>Provide either metric or imperial. If you enter both, the metric value will be used as the source of truth.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Common Heights</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feet/Inches</TableHead>
                <TableHead className="text-right">Centimeters</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleTable.map((item) => (
                <TableRow key={`${item.feet}-${item.inches}`}>
                  <TableCell>{item.feet}′ {item.inches}″</TableCell>
                  <TableCell className="text-right">{item.centimeters.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/centimeters-to-inches-converter" className="text-primary underline">Centimeters to Inches Converter</Link></p>
            <p><Link href="/category/conversions/inches-to-centimeters-converter" className="text-primary underline">Inches to Centimeters Converter</Link></p>
            <p><Link href="/category/conversions/meters-to-feet-converter" className="text-primary underline">Meters to Feet Converter</Link></p>
            <p><Link href="/category/conversions/feet-to-meters-converter" className="text-primary underline">Feet to Meters Converter</Link></p>
          </div>
          <section
          className="space-y-4 text-muted-foreground leading-relaxed"
          itemScope
          itemType="https://schema.org/Article"
        >
          <meta itemProp="headline" content="Complete Guide on Height" />
          <meta itemProp="author" content="Height Converter Team" />
          <meta itemProp="about" content="Learn about height measurement, conversions, average height by country, and growth factors." />

          <h2 itemProp="name" className="text-xl font-bold text-foreground mb-3">
            Complete Guide on Height
          </h2>

          <p itemProp="description">
            This complete guide explains everything about <strong>height measurement, conversions, average height by country, and growth factors</strong>.
            Whether you’re filling forms, tracking growth, or comparing global averages, understanding your height is essential.
          </p>

          <h3 className="font-semibold text-foreground mt-6">1. Average Human Height Around the World</h3>
          <p>
            The <strong>average height of men</strong> worldwide is around <strong>170 cm (5 ft 7 in)</strong>, and for <strong>women</strong> it’s about
            <strong>160 cm (5 ft 3 in)</strong>. However, height differs by region and genetics. For example:
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>The Netherlands: men average 183 cm (6 ft), women 170 cm (5 ft 7 in)</li>
            <li>India: men average 167 cm (5 ft 6 in), women 153 cm (5 ft)</li>
            <li>USA: men average 175 cm (5 ft 9 in), women 162 cm (5 ft 4 in)</li>
          </ul>

          <h3 className="font-semibold text-foreground mt-6">2. How to Measure Height Accurately</h3>
          <p>
            To get an accurate height reading:
          </p>
          <ol className="list-decimal ml-6 space-y-1">
            <li>Stand straight without shoes against a flat wall.</li>
            <li>Keep your heels, shoulders, and back touching the wall.</li>
            <li>Look straight ahead, with eyes parallel to the floor.</li>
            <li>Use a stadiometer or flat object on the head and mark the height.</li>
            <li>Measure from the floor to the mark with a measuring tape.</li>
          </ol>
          <p>
            Height is best measured in the morning since the spine compresses slightly during the day, reducing height by up to 1–2 cm.
          </p>

          <h3 className="font-semibold text-foreground mt-6">3. Height Conversion Chart</h3>
          <p>
            Here’s a quick reference for converting between centimeters and feet/inches:
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>150 cm = 4 ft 11 in</li>
            <li>160 cm = 5 ft 3 in</li>
            <li>170 cm = 5 ft 7 in</li>
            <li>180 cm = 5 ft 11 in</li>
            <li>190 cm = 6 ft 3 in</li>
          </ul>
          <p>
            You can use the above height converter to get precise values for any measurement.
          </p>

          <h3 className="font-semibold text-foreground mt-6">4. Factors That Influence Height</h3>
          <p>
            Your height depends on both <strong>genetic and environmental factors</strong>:
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li><strong>Genetics:</strong> Determines about 70–80% of your height potential.</li>
            <li><strong>Nutrition:</strong> Protein, calcium, and vitamins are essential for bone growth.</li>
            <li><strong>Sleep:</strong> Growth hormone is released during deep sleep.</li>
            <li><strong>Exercise:</strong> Activities like stretching and swimming improve posture and bone health.</li>
          </ul>

          <h3 className="font-semibold text-foreground mt-6">5. Height and Health</h3>
          <p>
            While height itself doesn’t determine health, it’s often correlated with nutrition and early childhood development.
            Both very tall and short individuals can lead healthy lives if they maintain balanced lifestyles.
          </p>

          <h3 className="font-semibold text-foreground mt-6">6. Interesting Height Facts</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li>People are tallest right after waking up due to spinal decompression overnight.</li>
            <li>The tallest man recorded was Robert Wadlow at 8 ft 11 in (272 cm).</li>
            <li>Humans typically shrink by 1–2 cm with age after 40.</li>
          </ul>

          <h3 className="font-semibold text-foreground mt-6">7. Related Tools</h3>
          <p>
            Explore more useful tools:
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li><Link href="/category/health/bmi-calculator" className="text-primary underline">BMI Calculator</Link></li>
            <li><Link href="/category/conversions/meters-to-feet-converter" className="text-primary underline">Meters to Feet Converter</Link></li>
            <li><Link href="/category/conversions/inches-to-centimeters-converter" className="text-primary underline">Inches to Centimeters Converter</Link></li>
          </ul>

          <p className="italic mt-4">
            Understanding your height isn’t just a number — it’s a reflection of genetics, lifestyle, and growth. 
            Use our converter and guides to make accurate, informed measurements.
          </p>
        </section>
        </div>
      </div>
    </div>
  );
}


