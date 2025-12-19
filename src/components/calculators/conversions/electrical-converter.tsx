'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bolt, Info, Shield, TrendingUp, Landmark } from 'lucide-react';
import Link from 'next/link';
import { calculateOhmsLaw } from '@/lib/converters';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  voltage: z.number().optional(),
  current: z.number().optional(),
  resistance: z.number().optional(),
  power: z.number().optional(),
  calculate: z.enum(['voltage', 'current', 'resistance', 'power']),
});

type FormValues = z.infer<typeof formSchema>;

export default function ElectricalConverter() {
  const [result, setResult] = useState<{
    voltage: number;
    current: number;
    resistance: number;
    power: number;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calculate: 'voltage',
    },
  });

  const { watch, handleSubmit, setValue, reset } = form;
  const watchedValues = watch();
  const fieldToCalculate = watchedValues.calculate;

  const onSubmit = (data: FormValues) => {
    const calculationResult = calculateOhmsLaw(data, data.calculate);
    setResult(calculationResult);
    if(calculationResult) {
      Object.entries(calculationResult).forEach(([key, value]) => {
          setValue(key as keyof FormValues, value);
      });
    }
  };
  
  const handleReset = () => {
    reset({
      voltage: undefined,
      current: undefined,
      resistance: undefined,
      power: undefined,
      calculate: watchedValues.calculate,
    });
    setResult(null);
  };

  const fieldPlaceholders = {
    voltage: "Volts (V)",
    current: "Amps (A)",
    resistance: "Ohms (Ω)",
    power: "Watts (W)",
  };

  const getTwoRequiredFields = useMemo(() => {
    switch(fieldToCalculate) {
      case 'voltage': return ['Current', 'Resistance'];
      case 'current': return ['Voltage', 'Resistance'];
      case 'resistance': return ['Voltage', 'Current'];
      case 'power': return ['Voltage', 'Current'];
      default: return [];
    }
  }, [fieldToCalculate]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bolt className="h-5 w-5" />
            Electrical Converter (Ohm's Law)
          </CardTitle>
          <CardDescription>
            Calculate voltage, current, resistance, or power by providing any two values.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="calculate"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>What do you want to calculate?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4"
                      >
                        {Object.keys(fieldPlaceholders).map((key) => (
                           <FormItem key={key} className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value={key} />
                            </FormControl>
                            <FormLabel className="font-normal capitalize">{key}</FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(fieldPlaceholders).map((key) => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={key as keyof FormValues}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="capitalize">{key}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={fieldPlaceholders[key as keyof typeof fieldPlaceholders]}
                            {...field}
                            value={field.value ?? ''}
                            onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                            disabled={fieldToCalculate === key}
                          />
                        </FormControl>
                         {fieldToCalculate !== key && <FormDescription>Enter {key} value.</FormDescription>}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <div className="flex gap-4">
                <Button type="submit">Calculate</Button>
                <Button type="button" variant="outline" onClick={handleReset}>Reset</Button>
              </div>
            </form>
          </Form>

          {result && (
            <div className="mt-8 pt-6 border-t">
              <p className="text-center text-lg text-muted-foreground mb-4">Results</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                      <p className="text-sm text-muted-foreground">Voltage</p>
                      <p className="text-2xl font-bold text-primary">{result.voltage.toPrecision(4)} V</p>
                  </div>
                   <div>
                      <p className="text-sm text-muted-foreground">Current</p>
                      <p className="text-2xl font-bold text-primary">{result.current.toPrecision(4)} A</p>
                  </div>
                   <div>
                      <p className="text-sm text-muted-foreground">Resistance</p>
                      <p className="text-2xl font-bold text-primary">{result.resistance.toPrecision(4)} Ω</p>
                  </div>
                   <div>
                      <p className="text-sm text-muted-foreground">Power</p>
                      <p className="text-2xl font-bold text-primary">{result.power.toPrecision(4)} W</p>
                  </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding the Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>This calculator is based on Ohm's Law and the Power Law, fundamental principles in electronics. By providing any two of the four values (Voltage, Current, Resistance, Power), the other two can be calculated.</p>
            <p>This is essential for hobbyists, electricians, and engineers for designing and troubleshooting circuits.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formulas Used (Ohm's Law)</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p>The relationships are governed by two main formulas:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 font-mono text-xs">
                <li>Voltage (V) = Current (I) × Resistance (R)</li>
                <li>Power (P) = Voltage (V) × Current (I)</li>
              </ul>
               <p className="mt-2">All other formulas can be derived from these two. For example, P = I²R or P = V²/R.</p>
            </div>
          </CardContent>
        </Card>
        
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Electrical Units</h1>
            <p className="text-lg italic">Understanding the core units of electricity is fundamental to working with electronics.</p>
             <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-muted"><th className="p-4 border">Unit</th><th className="p-4 border">Symbol</th><th className="p-4 border">Definition</th></tr></thead>
                    <tbody>
                        <tr><td className="p-4 border font-semibold">Voltage (Volt)</td><td className="p-4 border">V</td><td className="p-4 border">The potential difference or "pressure" that drives electric charge.</td></tr>
                        <tr><td className="p-4 border font-semibold">Current (Ampere)</td><td className="p-4 border">A or I</td><td className="p-4 border">The rate of flow of electric charge.</td></tr>
                        <tr><td className="p-4 border font-semibold">Resistance (Ohm)</td><td className="p-4 border">Ω or R</td><td className="p-4 border">The opposition to the flow of current.</td></tr>
                        <tr><td className="p-4 border font-semibold">Power (Watt)</td><td className="p-4 border">W or P</td><td className="p-4 border">The rate at which electrical energy is transferred, i.e., energy per second.</td></tr>
                    </tbody>
                </table>
            </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What's a simple analogy for Ohm's Law?</h4>
                <p className="text-muted-foreground">Think of a water hose. Voltage is the water pressure, current is the flow rate of the water, and resistance is the size of the hose nozzle. More pressure (voltage) or a larger nozzle (less resistance) results in more water flow (current).</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Why do devices have a wattage rating?</h4>
                <p className="text-muted-foreground">The wattage (power) tells you how much energy the device consumes per second. A 100-watt light bulb uses more energy and is brighter than a 60-watt bulb.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Is high voltage or high current more dangerous?</h4>
                <p className="text-muted-foreground">It's the current flowing through the body that is dangerous, but voltage is required to drive that current. A very high voltage with no path to ground might be harmless, while a lower voltage with a good path can be lethal. It's the combination that matters.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is the difference between AC and DC?</h4>
                <p className="text-muted-foreground">DC (Direct Current) flows in one direction, like from a battery. AC (Alternating Current) reverses direction periodically, which is how power is delivered to homes from the power grid.</p>
            </div>
          </CardContent>
        </Card>

        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" />Related Converters</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-primary">
                <li><Link href="/category/conversions/mach-number-to-miles-per-hour-converter" className="hover:underline">Mach Number To Miles Per Hour Converter</Link></li>
                <li><Link href="/category/conversions/torr-to-pascals-converter" className="hover:underline">Torr To Pascals Converter</Link></li>
                <li><Link href="/category/conversions/watts-to-horsepower-converter" className="hover:underline">Watts To Horsepower Converter</Link></li>
                <li><Link href="/category/conversions/weeks-to-days-converter" className="hover:underline">Weeks To Days Converter</Link></li>
                <li><Link href="/category/conversions/speed-converter" className="hover:underline">Speed Converter</Link></li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The Electrical Converter is a powerful tool for anyone working with electronic circuits. It quickly solves for any unknown variable in Ohm's Law, simplifying circuit design, analysis, and troubleshooting.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
