
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { differenceInYears, differenceInMonths, differenceInDays } from 'date-fns';

const currentYear = new Date().getFullYear();

const formSchema = z.object({
  birthYear: z.number().int().min(1900, "Year must be 1900 or later").max(currentYear, "Birth year cannot be in the future"),
});

type FormValues = z.infer<typeof formSchema>;

interface Age {
    years: number;
    months: number;
    days: number;
}

export default function PopCultureAgeCalculator() {
  const [result, setResult] = useState<Age | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      birthYear: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const today = new Date();
    // Assume birth date is Jan 1st of the birth year for simplicity
    const dob = new Date(values.birthYear, 0, 1);
    
    let years = differenceInYears(today, dob);
    let months = differenceInMonths(today, dob) % 12;
    
    const monthAnniversary = new Date(dob);
    monthAnniversary.setFullYear(today.getFullYear());
    monthAnniversary.setMonth(dob.getMonth() + months);
    
    let days = differenceInDays(today, monthAnniversary);
    
    if (days < 0) {
        months = (months + 11) % 12;
        if(months === 11) years--;
        const prevMonthAnniversary = new Date(monthAnniversary);
        prevMonthAnniversary.setMonth(prevMonthAnniversary.getMonth() - 1);
        days = differenceInDays(today, prevMonthAnniversary);
    }
    
    setResult({ years, months, days });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardDescription>Enter the birth year of a celebrity, character, or historical figure to find out how old they would be today.</CardDescription>
            <FormField control={form.control} name="birthYear" render={({ field }) => (
                <FormItem><FormLabel>Birth Year</FormLabel><FormControl><Input type="number" placeholder="e.g., 1989" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          <Button type="submit">Calculate Age</Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><User className="h-8 w-8 text-primary" /><CardTitle>Calculated Age</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-3xl font-bold">{result.years}</p>
                        <CardDescription>Years</CardDescription>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{result.months}</p>
                        <CardDescription>Months</CardDescription>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{result.days}</p>
                        <CardDescription>Days</CardDescription>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
