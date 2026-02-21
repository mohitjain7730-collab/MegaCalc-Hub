'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Radio, Info, Shield, TrendingUp, Landmark, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { convertFrequency, FREQUENCY_UNITS } from '@/lib/converters';

const formSchema = z.object({
  value: z.number().optional(),
  fromUnit: z.string().min(1),
  toUnit: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function FrequencyConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      fromUnit: 'hertz',
      toUnit: 'kilohertz',
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (watchedValues.value !== undefined && watchedValues.fromUnit && watchedValues.toUnit) {
      const conversionResult = convertFrequency(watchedValues.value, watchedValues.fromUnit, watchedValues.toUnit);
      setResult(conversionResult);
    } else {
      setResult(null);
    }
  }, [watchedValues]);

  const swapUnits = () => {
    const from = watchedValues.fromUnit;
    const to = watchedValues.toUnit;
    const currentValue = watchedValues.value;

    setValue('fromUnit', to);
    setValue('toUnit', from);
    
    if (currentValue !== undefined) {
      setValue('value', result ?? undefined);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Frequency Converter
          </CardTitle>
          <CardDescription>
            Convert between hertz, kilohertz, RPM, and other frequency units.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 1000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fromUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FREQUENCY_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="toUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FREQUENCY_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="button" variant="outline" onClick={swapUnits}>
                <ArrowRightLeft className="mr-2 h-4 w-4" /> Swap Units
              </Button>
            </form>
          </Form>

          {result !== null && watchedValues.value !== undefined && (
            <div className="mt-8 pt-6 border-t">
              <p className="text-center text-lg text-muted-foreground">Result</p>
              <p className="text-center text-4xl font-bold text-primary mt-2">
                {result.toPrecision(6)}
              </p>
              <p className="text-center text-sm text-muted-foreground mt-1">
                {watchedValues.value} {FREQUENCY_UNITS.find(u => u.value === watchedValues.fromUnit)?.label.split(' ')[0]} = {result.toPrecision(6)} {FREQUENCY_UNITS.find(u => u.value === watchedValues.toUnit)?.label.split(' ')[0]}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding the Converter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Frequency is the number of occurrences of a repeating event per unit of time. It's a fundamental concept in physics and engineering, used to describe waves, computer processors, and rotational speed.</p>
            <p>All conversions use Hertz (Hz), the SI unit of frequency, as a base reference to ensure accuracy.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Used</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Standardized Conversion Process</h4>
              <p>To ensure accuracy, all conversions use Hertz (Hz) as a common base unit.</p>
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                  <li><strong className="text-foreground">Convert to Hertz:</strong> The input value is converted to Hertz by multiplying it by its conversion factor.</li>
                  <li><strong className="text-foreground">Convert to Target Unit:</strong> The Hertz value is then converted to the desired final unit by dividing it by the target unit's conversion factor.</li>
              </ol>
            </div>
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" />Related Converters</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-primary">
                <li><Link href="/conversions/bars-to-psi-converter" className="hover:underline">Bars To Psi Converter</Link></li>
                <li><Link href="/conversions/watts-to-ergs-per-second-converter" className="hover:underline">Watts To Ergs Per Second Converter</Link></li>
                <li><Link href="/conversions/weeks-to-months-converter" className="hover:underline">Weeks To Months Converter</Link></li>
                <li><Link href="/conversions/years-to-months-converter" className="hover:underline">Years To Months Converter</Link></li>
                <li><Link href="/conversions/milligrams-to-micrograms-converter" className="hover:underline">Milligrams To Micrograms Converter</Link></li>
            </ul>
          </CardContent>
        </Card>
        
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Units of Frequency</h1>
            <p className="text-lg italic">From sound waves to computer clocks, frequency measures how often something happens.</p>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Common Frequency Units</h2>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-muted"><th className="p-4 border">Unit</th><th className="p-4 border">Definition & Context</th></tr></thead>
                    <tbody>
                        <tr><td className="p-4 border font-semibold">Hertz (Hz)</td><td className="p-4 border">One cycle per second. The SI unit for frequency. Used for sound waves, light waves, and AC electricity.</td></tr>
                        <tr><td className="p-4 border font-semibold">Kilohertz (kHz)</td><td className="p-4 border">1,000 Hertz. Used for AM radio broadcast frequencies.</td></tr>
                        <tr><td className="p-4 border font-semibold">Megahertz (MHz)</td><td className="p-4 border">1 million Hertz. Used for FM radio and older computer processor speeds.</td></tr>
                        <tr><td className="p-4 border font-semibold">Gigahertz (GHz)</td><td className="p-4 border">1 billion Hertz. Standard for modern computer processors, Wi-Fi, and mobile networks.</td></tr>
                        <tr><td className="p-4 border font-semibold">Revolutions per minute (rpm)</td><td className="p-4 border">A unit of rotational speed. One rpm is one revolution in a minute. Used for car engines, hard drives, and record players.</td></tr>
                    </tbody>
                </table>
            </div>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Common Conversions at a Glance</h2>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted">
                            <th className="p-4 border">From</th>
                            <th className="p-4 border">To</th>
                            <th className="p-4 border">Equivalent Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td className="p-4 border">1 Kilohertz (kHz)</td><td className="p-4 border">Hertz (Hz)</td><td className="p-4 border">1,000 Hz</td></tr>
                        <tr><td className="p-4 border">1 Gigahertz (GHz)</td><td className="p-4 border">Megahertz (MHz)</td><td className="p-4 border">1,000 MHz</td></tr>
                        <tr><td className="p-4 border">60 RPM</td><td className="p-4 border">Hertz (Hz)</td><td className="p-4 border">1 Hz</td></tr>
                        <tr><td className="p-4 border">Standard US AC Power</td><td className="p-4 border">Hertz (Hz)</td><td className="p-4 border">60 Hz</td></tr>
                    </tbody>
                </table>
            </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is the relationship between frequency and wavelength?</h4>
                <p className="text-muted-foreground">They are inversely proportional. For electromagnetic waves (like light and radio), the formula is: Wavelength = Speed of Light / Frequency. Higher frequency means shorter wavelength, and vice versa.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What does a computer's GHz rating mean?</h4>
                <p className="text-muted-foreground">The Gigahertz (GHz) rating of a CPU is its clock speed, indicating how many processing cycles it can execute per second. A 3 GHz CPU performs 3 billion cycles per second. While a useful metric, it's not the only factor determining a processor's overall performance.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">How is RPM converted to Hertz?</h4>
                <p className="text-muted-foreground">Since RPM is "revolutions per minute" and Hertz is "cycles per second," you convert by dividing by 60. For example, an engine running at 6000 RPM is completing 100 revolutions per second, so its frequency is 100 Hz.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What frequency is human hearing?</h4>
                <p className="text-muted-foreground">The typical range for human hearing is from about 20 Hz to 20,000 Hz (20 kHz). Frequencies below this range are called infrasound, and those above are ultrasound.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The Frequency Converter is a key tool for engineers, physicists, and computer technicians. It provides fast and accurate conversions between different units of frequency, from rotational speed to processor clock cycles.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
