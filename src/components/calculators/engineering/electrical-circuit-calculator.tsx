'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

const formSchema = z.object({
  knownValue1: z.string(),
  knownValue2: z.string(),
  value1: z.number().optional(),
  value2: z.number().optional(),
}).refine(data => data.knownValue1 !== data.knownValue2, {
  message: "Cannot select the same value twice",
  path: ["knownValue2"],
});

type FormValues = z.infer<typeof formSchema>;

export default function ElectricalCircuitCalculator() {
  const [result, setResult] = useState<Record<string, number> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      knownValue1: 'voltage',
      knownValue2: 'current',
      value1: undefined,
      value2: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { knownValue1, knownValue2, value1, value2 } = values;

    if (value1 === undefined || value2 === undefined) return;

    let v, i, r, p;
    const inputs = {
        [knownValue1]: value1,
        [knownValue2]: value2,
    };
    v = inputs['voltage'];
    i = inputs['current'];
    r = inputs['resistance'];
    p = inputs['power'];

    if (v !== undefined && i !== undefined) {
      r = v / i;
      p = v * i;
    } else if (v !== undefined && r !== undefined) {
      i = v / r;
      p = Math.pow(v, 2) / r;
    } else if (v !== undefined && p !== undefined) {
      i = p / v;
      r = Math.pow(v, 2) / p;
    } else if (i !== undefined && r !== undefined) {
      v = i * r;
      p = Math.pow(i, 2) * r;
    } else if (i !== undefined && p !== undefined) {
      v = p / i;
      r = p / Math.pow(i, 2);
    } else if (r !== undefined && p !== undefined) {
      v = Math.sqrt(p * r);
      i = Math.sqrt(p / r);
    }

    setResult({ voltage: v!, current: i!, resistance: r!, power: p! });
  };

  const options = ['voltage', 'current', 'resistance', 'power'];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="knownValue1" render={({ field }) => (
                <FormItem><FormLabel>First Known Value</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                    {options.map(o => <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}
                </SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="value1" render={({ field }) => (
                <FormItem><FormLabel>Value 1</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="knownValue2" render={({ field }) => (
                <FormItem><FormLabel>Second Known Value</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                    {options.map(o => <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}
                </SelectContent></Select><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="value2" render={({ field }) => (
                <FormItem><FormLabel>Value 2</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Zap className="h-8 w-8 text-primary" /><CardTitle>Ohm's Law Results</CardTitle></div></CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-lg space-y-2">
                <li><strong>Voltage (V):</strong> {result.voltage.toFixed(3)} Volts</li>
                <li><strong>Current (I):</strong> {result.current.toFixed(3)} Amps</li>
                <li><strong>Resistance (R):</strong> {result.resistance.toFixed(3)} Ohms</li>
                <li><strong>Power (P):</strong> {result.power.toFixed(3)} Watts</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
