
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
  seconds: z.coerce.number().nonnegative('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const SECONDS_TO_DAYS = 1 / 86400;

export default function SecondsToDaysConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { seconds: undefined },
  });

  const secondsValue = form.watch('seconds');

  useEffect(() => {
    if (secondsValue !== undefined && !isNaN(secondsValue)) {
      setResult(secondsValue * SECONDS_TO_DAYS);
    } else {
      setResult(null);
    }
  }, [secondsValue]);

  const conversionTable = [
    { s: 86400, day: 1 },
    { s: 172800, day: 2 },
    { s: 604800, day: 7 },
    { s: 2592000, day: 30 },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <FormField
            control={form.control}
            name="seconds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seconds</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(4)} days</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Days = Seconds / 86400</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Example</h4>
              <p>A duration of 1,000,000 seconds is `1,000,000 / 86,400 = 11.57 days`.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Use Cases</h3>
          <p className="text-muted-foreground">Helpful in scientific contexts, server uptime calculations, or any field dealing with large time durations measured in seconds.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seconds (s)</TableHead>
                <TableHead className="text-right">Days</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.s}>
                  <TableCell>{item.s.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.day}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Why divide by 86,400?</h4>
              <p>There are 60 seconds in a minute, 60 minutes in an hour, and 24 hours in a day. Therefore, 60 × 60 × 24 = 86,400 seconds in a day.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

    