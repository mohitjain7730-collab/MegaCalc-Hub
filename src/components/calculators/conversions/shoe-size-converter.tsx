
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
import { Footprints } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  gender: z.enum(['men', 'women']),
  fromUnit: z.enum(['US', 'UK', 'EU', 'IN', 'CM', 'JP']),
  inputSize: z.coerce.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
    US: number;
    UK: number;
    EU: number;
    IN: number;
    CM: number;
    JP: number;
}

export default function ShoeSizeConverter() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: 'men',
      fromUnit: 'US',
      inputSize: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { gender, fromUnit, inputSize } = values;

    let US = 0, UK = 0, EU = 0, IN = 0, CM = 0, JP = 0;

    if (fromUnit === "US") {
        US = inputSize;
        if (gender === "men") {
          UK = US - 0.5;
          EU = US + 33;
          IN = US - 0.5;
          CM = (US * 0.847) + 18.66;
        } else {
          UK = US - 2;
          EU = US + 31;
          IN = UK;
          CM = (US * 0.847) + 17.2;
        }
        JP = CM;
    } else if (fromUnit === "UK" || fromUnit === "IN") {
        UK = inputSize;
        IN = UK;
        if (gender === "men") {
          US = UK + 0.5;
          EU = US + 33;
          CM = (US * 0.847) + 18.66;
        } else {
          US = UK + 2;
          EU = US + 31;
          CM = (US * 0.847) + 17.2;
        }
        JP = CM;
    } else if (fromUnit === "EU") {
        EU = inputSize;
        if (gender === "men") {
          US = EU - 33;
          UK = US - 0.5;
          IN = UK;
          CM = (EU * 2 / 3);
        } else {
          US = EU - 31;
          UK = US - 2;
          IN = UK;
          CM = (EU * 2 / 3);
        }
        JP = CM;
    } else if (fromUnit === "CM" || fromUnit === "JP") {
        CM = inputSize;
        JP = CM;
        if (gender === "men") {
          US = (CM - 18.66) / 0.847;
          UK = US - 0.5;
        } else {
          US = (CM - 17.2) / 0.847;
          UK = US - 2;
        }
        IN = UK;
        EU = (gender === "men") ? (US + 33) : (US + 31);
    }

    setResult({ US, UK, EU, IN, CM, JP });
  };
  
  return (
    <div className="space-y-8">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="gender" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="men">Men</SelectItem><SelectItem value="women">Women</SelectItem></SelectContent>
                            </Select>
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="fromUnit" render={({ field }) => (
                        <FormItem>
                            <FormLabel>From Unit</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="US">US</SelectItem>
                                    <SelectItem value="UK">UK</SelectItem>
                                    <SelectItem value="EU">EU</SelectItem>
                                    <SelectItem value="IN">India</SelectItem>
                                    <SelectItem value="CM">Centimeters (CM)</SelectItem>
                                    <SelectItem value="JP">Japan (JP)</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="inputSize" render={({ field }) => (
                        <FormItem><FormLabel>Enter Size</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g., 9.5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <Button type="submit" className="w-full">Convert Size</Button>
            </form>
        </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Footprints className="h-8 w-8 text-primary" /><CardTitle>Converted Shoe Sizes</CardTitle></div></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>US</TableHead>
                            <TableHead>UK</TableHead>
                            <TableHead>EU</TableHead>
                            <TableHead>India</TableHead>
                            <TableHead>CM</TableHead>
                            <TableHead>Japan</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>{result.US.toFixed(1)}</TableCell>
                            <TableCell>{result.UK.toFixed(1)}</TableCell>
                            <TableCell>{result.EU.toFixed(1)}</TableCell>
                            <TableCell>{result.IN.toFixed(1)}</TableCell>
                            <TableCell>{result.CM.toFixed(1)}</TableCell>
                            <TableCell>{result.JP.toFixed(1)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <CardDescription className="mt-4 text-xs">Note: These conversions are based on standard formulas and may vary slightly by brand. Always check the manufacturer's size guide.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                This calculator uses a set of common, generalized formulas to convert between international shoe sizes. It first converts the input size to a base unit (like US or CM) and then calculates all other sizes from there. The formulas differ for men's and women's sizes due to different scaling and base points in many sizing systems.
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
