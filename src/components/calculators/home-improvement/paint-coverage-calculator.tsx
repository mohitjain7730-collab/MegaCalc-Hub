'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaintBucket } from 'lucide-react';

const formSchema = z.object({
  length: z.number().positive('Must be positive'),
  width: z.number().positive('Must be positive'),
  height: z.number().positive('Must be positive'),
  coats: z.number().min(1, 'Minimum 1 coat').default(1),
  unit: z.enum(['meters', 'feet']),
  coveragePerUnit: z.number().positive('Must be positive'),
});

type FormValues = z.infer<typeof formSchema>;

export default function PaintCoverageCalculator() {
  const [result, setResult] = useState<{ paintNeeded: number; unit: 'liters' | 'gallons' } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      length: 10,
      width: 12,
      height: 8,
      coats: 2,
      unit: 'feet',
      coveragePerUnit: 350, // 350 sq ft per gallon
    },
  });

  const onSubmit = (values: FormValues) => {
    const { length, width, height, coats, unit, coveragePerUnit } = values;

    const wallArea1 = length * height;
    const wallArea2 = width * height;
    const totalWallArea = (wallArea1 + wallArea2) * 2;
    const ceilingArea = length * width;
    const totalArea = totalWallArea + ceilingArea;
    const totalAreaToPaint = totalArea * coats;

    const paintNeeded = totalAreaToPaint / coveragePerUnit;
    
    setResult({ paintNeeded, unit: unit === 'feet' ? 'gallons' : 'liters' });
  };
  
  const handleUnitChange = (unit: 'meters' | 'feet') => {
    form.setValue('unit', unit);
    if (unit === 'meters') {
        form.setValue('coveragePerUnit', 10); // 10 sq meters per liter
    } else {
        form.setValue('coveragePerUnit', 350); // 350 sq ft per gallon
    }
  }

  return (
    <div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Units</FormLabel>
                                <Select onValueChange={(value: 'meters' | 'feet') => handleUnitChange(value)} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select unit" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="feet">Feet</SelectItem>
                                        <SelectItem value="meters">Meters</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="length"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Room Length</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="width"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Room Width</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Room Height</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="coats"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Number of Coats</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="coveragePerUnit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Paint Coverage ({form.getValues('unit') === 'feet' ? 'sq ft / gallon' : 'sq m / liter'})</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit">Calculate</Button>
            </form>
        </Form>
        {result && (
            <Card className="mt-8">
                <CardHeader>
                    <div className='flex items-center gap-4'>
                        <PaintBucket className="h-8 w-8 text-primary" />
                        <CardTitle>Result</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-lg">
                        You will need approximately <strong>{result.paintNeeded.toFixed(2)} {result.unit}</strong> of paint.
                    </p>
                    <CardDescription className='mt-2'>
                        This is an estimate. It's recommended to buy a little extra to account for touch-ups and variations in surface porosity.
                    </CardDescription>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
