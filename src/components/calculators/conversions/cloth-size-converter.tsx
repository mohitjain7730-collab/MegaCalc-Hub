
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
import { Shirt } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const sizeCharts = {
  men: [
    { US: "34", UK: "34", EU: "44", India: "34", Japan: "S", Intl: "S" },
    { US: "36", UK: "36", EU: "46", India: "36", Japan: "M", Intl: "M" },
    { US: "38", UK: "38", EU: "48", India: "38", Japan: "L", Intl: "L" },
    { US: "40", UK: "40", EU: "50", India: "40", Japan: "XL", Intl: "XL" },
    { US: "42", UK: "42", EU: "52", India: "42", Japan: "XXL", Intl: "XXL" },
    { US: "44", UK: "44", EU: "54", India: "44", Japan: "3XL", Intl: "3XL" }
  ],
  women: [
    { US: "2", UK: "6", EU: "34", India: "XS", Japan: "5", Intl: "XS" },
    { US: "4", UK: "8", EU: "36", India: "S", Japan: "7", Intl: "S" },
    { US: "6", UK: "10", EU: "38", India: "M", Japan: "9", Intl: "M" },
    { US: "8", UK: "12", EU: "40", India: "L", Japan: "11", Intl: "L" },
    { US: "10", UK: "14", EU: "42", India: "XL", Japan: "13", Intl: "XL" },
    { US: "12", UK: "16", EU: "44", India: "XXL", Japan: "15", Intl: "XXL" }
  ],
  kids: [
    { US: "2T", UK: "2", EU: "92", India: "2Y", Japan: "90", Intl: "2Y" },
    { US: "3T", UK: "3", EU: "98", India: "3Y", Japan: "95", Intl: "3Y" },
    { US: "4T", UK: "4", EU: "104", India: "4Y", Japan: "100", Intl: "4Y" },
    { US: "5", UK: "5", EU: "110", India: "5Y", Japan: "105", Intl: "5Y" },
    { US: "6", UK: "6", EU: "116", India: "6Y", Japan: "110", Intl: "6Y" },
    { US: "7", UK: "7", EU: "122", India: "7Y", Japan: "115", Intl: "7Y" },
    { US: "8", UK: "8", EU: "128", India: "8Y", Japan: "120", Intl: "8Y" },
    { US: "10", UK: "10", EU: "140", India: "10Y", Japan: "130", Intl: "10Y" },
    { US: "12", UK: "12", EU: "152", India: "12Y", Japan: "140", Intl: "12Y" }
  ]
};

const formSchema = z.object({
  gender: z.enum(['men', 'women', 'kids']),
  fromRegion: z.enum(['US', 'UK', 'EU', 'India', 'Japan', 'Intl']),
  inputSize: z.string().min(1, "Please enter a size."),
});

type FormValues = z.infer<typeof formSchema>;
type SizeRow = { [key: string]: string | number };

export default function ClothSizeConverter() {
  const [result, setResult] = useState<SizeRow | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: 'men',
      fromRegion: 'US',
      inputSize: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { gender, fromRegion, inputSize } = values;
    const chart = sizeCharts[gender];
    const match = chart.find(row => String(row[fromRegion as keyof typeof row]).toLowerCase() === inputSize.toLowerCase());

    if (match) {
      setResult(match);
      form.clearErrors('inputSize');
    } else {
      setResult(null);
      const availableSizes = chart.map(row => row[fromRegion as keyof typeof row]).join(', ');
      form.setError('inputSize', { type: 'manual', message: `Size not found. Available sizes are: ${availableSizes}` });
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardDescription>
                Convert clothing sizes for Men, Women, and Kids across US, UK, EU, India, Japan, and International standards.
            </CardDescription>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Gender / Age Group</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="men">Men</SelectItem>
                                <SelectItem value="women">Women</SelectItem>
                                <SelectItem value="kids">Kids</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                )} />
                <FormField control={form.control} name="fromRegion" render={({ field }) => (
                     <FormItem>
                        <FormLabel>From Region</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="US">US</SelectItem>
                                <SelectItem value="UK">UK</SelectItem>
                                <SelectItem value="EU">EU</SelectItem>
                                <SelectItem value="India">India</SelectItem>
                                <SelectItem value="Japan">Japan</SelectItem>
                                <SelectItem value="Intl">International</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                )} />
                 <FormField control={form.control} name="inputSize" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                        <FormLabel>Enter Size</FormLabel>
                        <FormControl><Input placeholder="e.g. M, 10, 42, 36" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
             </div>
            <Button type="submit">Convert Size</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader>
                <div className='flex items-center gap-4'>
                    <Shirt className="h-8 w-8 text-primary" />
                    <CardTitle>Converted Sizes</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>US</TableHead>
                            <TableHead>UK</TableHead>
                            <TableHead>EU</TableHead>
                            <TableHead>India</TableHead>
                            <TableHead>Japan</TableHead>
                            <TableHead>Int'l</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>{result.US}</TableCell>
                            <TableCell>{result.UK}</TableCell>
                            <TableCell>{result.EU}</TableCell>
                            <TableCell>{result.India}</TableCell>
                            <TableCell>{result.Japan}</TableCell>
                            <TableCell>{result.Intl}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <CardDescription className="mt-4 text-xs">Note: These are standard conversions and may vary by brand. Always check the manufacturer's specific size guide.</CardDescription>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
