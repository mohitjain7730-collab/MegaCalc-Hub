
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
import { HardDrive } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const raidLevels = {
    raid0: { name: 'RAID 0 (Striping)', minDisks: 2 },
    raid1: { name: 'RAID 1 (Mirroring)', minDisks: 2 },
    raid5: { name: 'RAID 5 (Stripe with Parity)', minDisks: 3 },
    raid6: { name: 'RAID 6 (Stripe with Dual Parity)', minDisks: 4 },
    raid10: { name: 'RAID 10 (Stripe of Mirrors)', minDisks: 4, even: true },
};

type RaidLevel = keyof typeof raidLevels;

const formSchema = z.object({
  raidLevel: z.string(),
  diskCount: z.number().int().min(2),
  diskSize: z.number().positive(),
  unit: z.enum(['GB', 'TB']),
}).refine(data => {
    const level = raidLevels[data.raidLevel as RaidLevel];
    return data.diskCount >= level.minDisks;
}, {
    message: "Not enough disks for the selected RAID level.",
    path: ["diskCount"],
}).refine(data => {
    const level = raidLevels[data.raidLevel as RaidLevel];
    return !level.even || data.diskCount % 2 === 0;
}, {
    message: "RAID 10 requires an even number of disks.",
    path: ["diskCount"],
});

type FormValues = z.infer<typeof formSchema>;

export default function DiskRaidCapacityCalculator() {
  const [result, setResult] = useState<{ capacity: number; unit: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        raidLevel: 'raid5',
        diskCount: undefined,
        diskSize: undefined,
        unit: 'TB',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { raidLevel, diskCount, diskSize, unit } = values;
    let usableCapacity = 0;

    switch (raidLevel) {
      case 'raid0':
        usableCapacity = diskCount * diskSize;
        break;
      case 'raid1':
        usableCapacity = diskSize; // Assumes all disks mirror one
        break;
      case 'raid5':
        usableCapacity = (diskCount - 1) * diskSize;
        break;
      case 'raid6':
        usableCapacity = (diskCount - 2) * diskSize;
        break;
      case 'raid10':
        usableCapacity = (diskCount / 2) * diskSize;
        break;
    }
    
    setResult({ capacity: usableCapacity, unit });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Calculate usable storage space and redundancy for different RAID levels.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="raidLevel" render={({ field }) => (
                <FormItem><FormLabel>RAID Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                        {Object.entries(raidLevels).map(([key, val]) => (
                            <SelectItem key={key} value={key}>{val.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                </FormItem>
            )} />
            <FormField control={form.control} name="diskCount" render={({ field }) => (
                <FormItem><FormLabel>Number of Disks</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="diskSize" render={({ field }) => (
                <FormItem><FormLabel>Size of Smallest Disk</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Unit</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="GB">GB</SelectItem>
                        <SelectItem value="TB">TB</SelectItem>
                    </SelectContent>
                </Select>
                </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Capacity</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><HardDrive className="h-8 w-8 text-primary" /><CardTitle>RAID Array Capacity</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.capacity.toFixed(2)} {result.unit}</p>
                <CardDescription className='mt-4 text-center'>This is the total usable storage capacity of the array.</CardDescription>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                This calculator determines the usable capacity of a RAID array based on the number of disks, the size of the smallest disk, and the chosen RAID level. It assumes all disks are of the same size for simplicity.
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
