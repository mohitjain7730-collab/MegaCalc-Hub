
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
import Link from 'next/link';

const formSchema = z.object({
  weeks: z.coerce.number().nonnegative('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const WEEKS_TO_SECONDS = 604800;

export default function WeeksToSecondsConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { weeks: undefined },
  });

  const weeksValue = form.watch('weeks');

  useEffect(() => {
    if (weeksValue !== undefined && !isNaN(weeksValue)) {
      setResult(weeksValue * WEEKS_TO_SECONDS);
    } else {
      setResult(null);
    }
  }, [weeksValue]);

  const conversionTable = [
    { w: 1, s: 604800 },
    { w: 2, s: 1209600 },
    { w: 4, s: 2419200 },
    { w: 10, s: 6048000 },
    { w: 52, s: 31449600 },
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
              <Clock className="h-8 w-8 text-primary" />
              <CardTitle>Conversion Result</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toLocaleString()} seconds</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Seconds = Weeks × 604,800</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Example</h4>
              <p>A period of 4 weeks is equal to `4 × 604,800 = 2,419,200 seconds`.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Use Cases</h3>
          <p className="text-muted-foreground">Essential for technical applications that require time to be measured in seconds, such as setting expiry times for software licenses, calculating satellite orbits, or planning long-term simulations.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Weeks</TableHead>
                <TableHead className="text-right">Seconds (s)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.w}>
                  <TableCell>{item.w}</TableCell>
                  <TableCell className="text-right">{item.s.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Why multiply by 604,800?</h4>
              <p>There are 7 days in a week, 24 hours in a day, 60 minutes in an hour, and 60 seconds in a minute. Therefore, 7 × 24 × 60 × 60 = 604,800 seconds in a week.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/seconds-to-weeks-converter" className="text-primary underline">Seconds to Weeks Converter</Link></p>
            <p><Link href="/category/conversions/weeks-to-days-converter" className="text-primary underline">Weeks to Days Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
