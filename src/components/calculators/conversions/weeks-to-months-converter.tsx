
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  weeks: z.coerce.number().nonnegative('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const WEEKS_TO_MONTHS = 1 / 4.345;

export default function WeeksToMonthsConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { weeks: undefined },
  });

  const weeksValue = form.watch('weeks');

  useEffect(() => {
    if (weeksValue !== undefined && !isNaN(weeksValue)) {
      setResult(weeksValue * WEEKS_TO_MONTHS);
    } else {
      setResult(null);
    }
  }, [weeksValue]);

  const conversionTable = [
    { week: 4, month: 4 * WEEKS_TO_MONTHS },
    { week: 8, month: 8 * WEEKS_TO_MONTHS },
    { week: 12, month: 12 * WEEKS_TO_MONTHS },
    { week: 26, month: 26 * WEEKS_TO_MONTHS },
    { week: 52, month: 52 * WEEKS_TO_MONTHS },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <FormField
            control={form.control}
            name="weeks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weeks</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Calendar className="h-8 w-8 text-primary" />
              <CardTitle>Conversion Result</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} months</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Months ≈ Weeks / 4.345</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Example</h4>
              <p>A 12-week semester is approximately `12 / 4.345 = 2.76 months` long.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Use Cases</h3>
          <p className="text-muted-foreground">Helpful for converting project timelines or personal planning from weeks to months to get a broader perspective on duration.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Weeks</TableHead>
                <TableHead className="text-right">Months (approx.)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.week}>
                  <TableCell>{item.week}</TableCell>
                  <TableCell className="text-right">{item.month.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Why is this conversion an approximation?</h4>
              <p>Months have a variable number of days (28 to 31). This calculator uses the average number of weeks in a month (365.25 days per year / 12 months / 7 days) which is approximately 4.345.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

    