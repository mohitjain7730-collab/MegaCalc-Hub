
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, PlusCircle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const exerciseSchema = z.object({
  weight: z.number().positive().optional(),
  sets: z.number().int().positive().optional(),
  reps: z.number().int().positive().optional(),
});

const formSchema = z.object({
  exercises: z.array(exerciseSchema).min(1),
  unit: z.enum(['kg', 'lbs']),
});

type FormValues = z.infer<typeof formSchema>;

export default function TrainingVolumeCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exercises: [{ weight: undefined, sets: undefined, reps: undefined }],
      unit: 'lbs',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'exercises',
  });

  const onSubmit = (values: FormValues) => {
    const totalVolume = values.exercises.reduce((acc, ex) => acc + (ex.weight || 0) * (ex.sets || 0) * (ex.reps || 0), 0);
    setResult(totalVolume);
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="unit" render={({ field }) => (<FormItem><FormLabel>Unit</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="kg">kg</SelectItem><SelectItem value="lbs">lbs</SelectItem></SelectContent></Select></FormItem>)} />
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-4 gap-2 items-center">
                <FormField control={form.control} name={`exercises.${index}.weight`} render={({ field }) => (<FormItem><FormLabel>Weight ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                <FormField control={form.control} name={`exercises.${index}.sets`} render={({ field }) => (<FormItem><FormLabel>Sets</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                <FormField control={form.control} name={`exercises.${index}.reps`} render={({ field }) => (<FormItem><FormLabel>Reps</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)}/></FormControl></FormItem>)} />
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><XCircle className="h-5 w-5 text-destructive" /></Button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" onClick={() => append({ weight: undefined, sets: undefined, reps: undefined })}><PlusCircle className="mr-2 h-4 w-4"/>Add Exercise</Button>
          <Button type="submit">Calculate Volume</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Dumbbell className="h-8 w-8 text-primary" /><CardTitle>Total Training Volume</CardTitle></div></CardHeader>
          <CardContent><p className="text-3xl font-bold text-center">{result.toLocaleString()} {unit}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
