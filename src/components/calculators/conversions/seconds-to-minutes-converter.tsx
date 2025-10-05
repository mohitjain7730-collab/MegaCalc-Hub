
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  seconds: z.coerce.number().nonnegative('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const SECONDS_TO_MINUTES = 1 / 60;

export default function SecondsToMinutesConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { seconds: undefined },
  });

  const secondsValue = form.watch('seconds');

  useEffect(() => {
    if (secondsValue !== undefined && !isNaN(secondsValue)) {
      setResult(secondsValue * SECONDS_TO_MINUTES);
    } else {
      setResult(null);
    }
  }, [secondsValue]);

  const conversionTable = [
    { s: 60, m: 1 },
    { s: 120, m: 2 },
    { s: 300, m: 5 },
    { s: 600, m: 10 },
    { s: 3600, m: 60 },
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
              <Clock className="h-8 w-8 text-primary" />
              <CardTitle>Conversion Result</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} minutes</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Minutes = Seconds / 60</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Example</h4>
              <p>To convert 180 seconds to minutes, you divide by 60: `180 / 60 = 3 minutes`.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Use Cases</h3>
          <p className="text-muted-foreground">This is a fundamental time conversion used in everyday life, from cooking instructions to measuring short durations in sports or scientific experiments.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seconds (s)</TableHead>
                <TableHead className="text-right">Minutes (min)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.s}>
                  <TableCell>{item.s}</TableCell>
                  <TableCell className="text-right">{item.m}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">How many seconds are in a minute?</h4>
              <p>There are exactly 60 seconds in one minute.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

    