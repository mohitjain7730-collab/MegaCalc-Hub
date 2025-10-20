
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GanttChartSquare } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const complexities = {
  'O(1)': (n: number) => 1,
  'O(log n)': (n: number) => Math.log2(n),
  'O(n)': (n: number) => n,
  'O(n log n)': (n: number) => n * Math.log2(n),
  'O(n^2)': (n: number) => Math.pow(n, 2),
  'O(2^n)': (n: number) => Math.pow(2, n),
};

type Complexity = keyof typeof complexities;

const formSchema = z.object({
  n: z.number().int().min(1, 'n must be at least 1').max(1000000, 'n is too large for visualization'),
});

type FormValues = z.infer<typeof formSchema>;

export default function CodeTimeComplexityEstimator() {
  const [chartData, setChartData] = useState<any[] | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { n: 100 },
  });

  const nValue = form.watch('n');

  useEffect(() => {
    const generateChartData = (n: number) => {
        const data = [];
        const steps = Math.min(n, 100);
        if (steps <= 0) return;
        const stepSize = n / steps;

        for (let i = 1; i <= steps; i++) {
            const currentN = Math.round(i * stepSize);
            const point: {[key: string]: number} = { n: currentN };
            for (const key in complexities) {
                const val = complexities[key as Complexity](currentN);
                if (key === 'O(2^n)' && val > 1e9) {
                    point[key] = 1e9;
                } else {
                    point[key] = val;
                }
            }
            data.push(point);
        }
        setChartData(data);
    };

    if (nValue && form.formState.isValid) {
        generateChartData(nValue);
    }
  }, [nValue, form.formState.isValid]);


  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <FormField control={form.control} name="n" render={({ field }) => (
              <FormItem><FormLabel>Input Size (n)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
          )} />
          <Button type="submit" className='hidden'>Visualize Complexity</Button>
        </form>
      </Form>
      
      {chartData && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><GanttChartSquare className="h-8 w-8 text-primary" /><CardTitle>Big-O Growth Visualization</CardTitle></div></CardHeader>
            <CardContent className="h-96 pr-0">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="n" label={{ value: 'Input Size (n)', position: 'insideBottom', offset: -5 }}/>
                        <YAxis type="number" domain={[0, 'dataMax']} allowDataOverflow={true} scale="log" label={{ value: 'Operations', angle: -90, position: 'insideLeft' }}/>
                        <Tooltip formatter={(value, name) => [typeof value === 'number' ? value.toExponential(2) : value, name]} />
                        <Legend />
                        <Line type="monotone" dataKey="O(1)" stroke="#8884d8" dot={false} />
                        <Line type="monotone" dataKey="O(log n)" stroke="#82ca9d" dot={false} />
                        <Line type="monotone" dataKey="O(n)" stroke="#ffc658" dot={false} />
                        <Line type="monotone" dataKey="O(n log n)" stroke="#ff7300" dot={false} />
                        <Line type="monotone" dataKey="O(n^2)" stroke="#f54242" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                This tool visualizes how the number of operations for different common time complexities (Big-O notations) grows as the input size (n) increases. The Y-axis is on a logarithmic scale to make the massive differences in growth rates visible on a single chart. O(2^n) is intentionally left off the chart for n &gt; 20 as its growth is too extreme to visualize with others.
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
