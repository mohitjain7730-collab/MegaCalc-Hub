
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const metValues = {
  '6': 9.8, // 10:00 min/mile
  '7.5': 11.8, // 8:00 min/mile
  '10': 16, // 6:00 min/mile
};

const formSchema = z.object({
  bodyWeight: z.number().positive(),
  duration: z.number().positive(),
  speed: z.string(),
  unit: z.enum(['kg', 'lbs']),
});

type FormValues = z.infer<typeof formSchema>;

export default function CaloriesBurnedRunningCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bodyWeight: undefined,
      duration: undefined,
      speed: '6',
      unit: 'lbs',
    },
  });

  const onSubmit = (values: FormValues) => {
    let weightKg = values.bodyWeight;
    if (values.unit === 'lbs') {
      weightKg *= 0.453592;
    }
    const met = metValues[values.speed as keyof typeof metValues];
    const calories = (met * weightKg * 3.5 / 200) * values.duration;
    setResult(calories);
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="bodyWeight" render={({ field }) => (<FormItem><FormLabel>Body Weight ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="duration" render={({ field }) => (<FormItem><FormLabel>Running Duration (minutes)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="speed" render={({ field }) => (
                <FormItem><FormLabel>Running Speed</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="6">6 mph (10:00 min/mile)</SelectItem>
                        <SelectItem value="7.5">7.5 mph (8:00 min/mile)</SelectItem>
                        <SelectItem value="10">10 mph (6:00 min/mile)</SelectItem>
                    </SelectContent>
                </Select></FormItem>
            )} />
            <FormField control={form.control} name="unit" render={({ field }) => (<FormItem><FormLabel>Weight Unit</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="kg">kg</SelectItem><SelectItem value="lbs">lbs</SelectItem></SelectContent></Select></FormItem>)} />
          </div>
          <Button type="submit">Calculate Calories</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Flame className="h-8 w-8 text-primary" /><CardTitle>Estimated Calories Burned</CardTitle></div></CardHeader>
            <CardContent><p className="text-3xl font-bold text-center">{result.toFixed(0)} kcal</p></CardContent>
        </Card>
      )}
    </div>
  );
}
