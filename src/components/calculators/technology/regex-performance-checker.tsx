
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Timer } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  regex: z.string().min(1, "Regex is required"),
  testString: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RegexPerformanceChecker() {
  const [result, setResult] = useState<{ time: number; match: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      regex: '^(a+)+$',
      testString: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaX',
    },
  });

  const onSubmit = (values: FormValues) => {
    setError(null);
    setResult(null);
    try {
      const re = new RegExp(values.regex);
      const start = performance.now();
      const match = re.test(values.testString);
      const end = performance.now();
      setResult({ time: end - start, match });
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-8">
      <Alert variant="destructive">
          <Timer className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Be cautious with complex regular expressions, especially those with nested quantifiers (like `(a+)+`), as they can cause "catastrophic backtracking" and freeze your browser tab.
          </AlertDescription>
      </Alert>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="regex" render={({ field }) => (
              <FormItem><FormLabel>Regular Expression</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="testString" render={({ field }) => (
              <FormItem><FormLabel>Test String</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem>
          )} />
          <Button type="submit">Test Regex</Button>
        </form>
      </Form>
      
      {error && (
        <Alert variant="destructive" className="mt-4">
            <AlertTitle>Invalid Regex</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Timer className="h-8 w-8 text-primary" /><CardTitle>Performance Result</CardTitle></div></CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-muted-foreground">Execution Time</p>
                        <p className="text-2xl font-bold">{result.time.toFixed(4)} ms</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Match Found</p>
                        <p className={`text-2xl font-bold ${result.match ? 'text-green-500' : 'text-red-500'}`}>{result.match ? 'Yes' : 'No'}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                This tool measures the real-world execution time of a JavaScript regular expression against a given test string. It uses the browser's `performance.now()` API for high-precision timing. The time taken can give you an indication of the expression's efficiency. Very long execution times, especially on strings that do not match, can indicate a poorly performing regex prone to catastrophic backtracking.
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
