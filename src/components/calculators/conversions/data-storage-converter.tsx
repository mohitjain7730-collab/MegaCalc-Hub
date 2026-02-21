'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Info, Shield, TrendingUp, Landmark, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { convertDataStorage, DATA_STORAGE_UNITS } from '@/lib/converters';

const formSchema = z.object({
  value: z.number().optional(),
  fromUnit: z.string().min(1),
  toUnit: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function DataStorageConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      fromUnit: 'megabyte',
      toUnit: 'gigabyte',
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (watchedValues.value !== undefined && watchedValues.fromUnit && watchedValues.toUnit) {
      const conversionResult = convertDataStorage(watchedValues.value, watchedValues.fromUnit, watchedValues.toUnit);
      setResult(conversionResult);
    } else {
      setResult(null);
    }
  }, [watchedValues]);

  const swapUnits = () => {
    const from = watchedValues.fromUnit;
    const to = watchedValues.toUnit;
    const currentValue = watchedValues.value;

    setValue('fromUnit', to);
    setValue('toUnit', from);
    
    if (currentValue !== undefined) {
      setValue('value', result ?? undefined);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Storage Converter
          </CardTitle>
          <CardDescription>
            Convert between bits, bytes, kilobytes, and larger units of digital information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 1024" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fromUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DATA_STORAGE_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="toUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DATA_STORAGE_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="button" variant="outline" onClick={swapUnits}>
                <ArrowRightLeft className="mr-2 h-4 w-4" /> Swap Units
              </Button>
            </form>
          </Form>

          {result !== null && watchedValues.value !== undefined && (
            <div className="mt-8 pt-6 border-t">
              <p className="text-center text-lg text-muted-foreground">Result</p>
              <p className="text-center text-4xl font-bold text-primary mt-2">
                {result.toPrecision(6)}
              </p>
              <p className="text-center text-sm text-muted-foreground mt-1">
                {watchedValues.value} {DATA_STORAGE_UNITS.find(u => u.value === watchedValues.fromUnit)?.label.split(' ')[0]} = {result.toPrecision(6)} {DATA_STORAGE_UNITS.find(u => u.value === watchedValues.toUnit)?.label.split(' ')[0]}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding the Converter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>This tool helps you convert between different units of digital data storage. Whether you're a developer calculating database size, a student learning about computing, or just curious about your device's storage, this converter simplifies the process.</p>
            <p>The standard in computing is to use powers of 2 (binary prefixes), where 1 kilobyte = 1024 bytes. This is distinct from the decimal system (powers of 10) often used by storage manufacturers. This calculator uses the binary standard (1 KB = 1024 B) for accuracy in a computing context.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Used</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Standardized Conversion Process</h4>
              <p>To ensure accuracy, all conversions use the byte as a common base unit.</p>
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                  <li><strong className="text-foreground">Convert to Bytes:</strong> The input value is converted to bytes by multiplying it by its conversion factor. <br /><span className="font-mono text-xs">Value in Bytes = Input Value × Conversion Factor to Bytes</span></li>
                  <li><strong className="text-foreground">Convert to Target Unit:</strong> The byte value is then converted to the desired final unit by dividing it by the target unit's conversion factor. <br /><span className="font-mono text-xs">Final Value = Value in Bytes / Target Unit's Conversion Factor</span></li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" />Related Converters</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-primary">
                <li><Link href="/conversions/kilojoules-to-joules-converter" className="hover:underline">Kilojoules To Joules Converter</Link></li>
                <li><Link href="/conversions/days-to-seconds-converter" className="hover:underline">Days To Seconds Converter</Link></li>
                <li><Link href="/conversions/kwh-to-joules-converter" className="hover:underline">Kwh To Joules Converter</Link></li>
                <li><Link href="/conversions/chemical-concentration-converter" className="hover:underline">Chemical Concentration Converter</Link></li>
                <li><Link href="/conversions/kilometers-to-nautical-miles-converter" className="hover:underline">Kilometers To Nautical Miles Converter</Link></li>
            </ul>
          </CardContent>
        </Card>
        
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Data Storage Units</h1>
            <p className="text-lg italic">Digital data is measured in units that represent the quantity of information. Understanding these units is fundamental to computing and data management.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Binary Prefixes (Powers of 2)</h2>
            <p>In computing, storage is traditionally measured using a binary system (base-2), as it aligns with the on/off nature of transistors.</p>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-muted"><th className="p-4 border">Unit</th><th className="p-4 border">Abbreviation</th><th className="p-4 border">Relation to Others</th><th className="p-4 border">Primary Use Case</th></tr></thead>
                    <tbody>
                        <tr><td className="p-4 border font-semibold">Bit</td><td className="p-4 border">b</td><td className="p-4 border">Smallest unit of data (a single 0 or 1).</td><td className="p-4 border">Data transfer rates, low-level programming.</td></tr>
                        <tr><td className="p-4 border font-semibold">Byte</td><td className="p-4 border">B</td><td className="p-4 border">8 bits.</td><td className="p-4 border">Standard base unit for files and storage. A single character (like 'a') is typically one byte.</td></tr>
                        <tr><td className="p-4 border font-semibold">Kilobyte</td><td className="p-4 border">KB</td><td className="p-4 border">1,024 bytes.</td><td className="p-4 border">Small documents, simple images.</td></tr>
                        <tr><td className="p-4 border font-semibold">Megabyte</td><td className="p-4 border">MB</td><td className="p-4 border">1,024 kilobytes.</td><td className="p-4 border">MP3 audio files, high-resolution photos, short videos.</td></tr>
                        <tr><td className="p-4 border font-semibold">Gigabyte</td><td className="p-4 border">GB</td><td className="p-4 border">1,024 megabytes.</td><td className="p-4 border">Software, movies, modern smartphone storage.</td></tr>
                        <tr><td className="p-4 border font-semibold">Terabyte</td><td className="p-4 border">TB</td><td className="p-4 border">1,024 gigabytes.</td><td className="p-4 border">Hard drives, large databases, data center storage.</td></tr>
                        <tr><td className="p-4 border font-semibold">Petabyte</td><td className="p-4 border">PB</td><td className="p-4 border">1,024 terabytes.</td><td className="p-4 border">Large-scale data analysis (Big Data), cloud storage for entire enterprises.</td></tr>
                    </tbody>
                </table>
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Common Conversions at a Glance</h2>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted">
                            <th className="p-4 border">Item</th>
                            <th className="p-4 border">Typical Size</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td className="p-4 border">1 page of plain text (.txt)</td><td className="p-4 border">~2 KB</td></tr>
                        <tr><td className="p-4 border">1 high-quality photo</td><td className="p-4 border">2-5 MB</td></tr>
                        <tr><td className="p-4 border">1 minute of MP3 audio</td><td className="p-4 border">~1 MB</td></tr>
                        <tr><td className="p-4 border">1 minute of HD video</td><td className="p-4 border">~100 MB</td></tr>
                        <tr><td className="p-4 border">1 Gigabyte (GB)</td><td className="p-4 border">1,024 Megabytes (MB)</td></tr>
                        <tr><td className="p-4 border">1 Terabyte (TB)</td><td className="p-4 border">1,024 Gigabytes (GB)</td></tr>
                    </tbody>
                </table>
            </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Why does my 1TB hard drive show only 931GB?</h4>
                <p className="text-muted-foreground">This is due to the difference in how storage manufacturers market their devices (using decimal/base-10, where 1 TB = 1 trillion bytes) and how operating systems measure storage (using binary/base-2, where 1 GB = 1,024 MB). Your 1 trillion byte drive is correctly reported as approximately 931 gibibytes (GiB), which most OSs label as "GB".</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What's the difference between a bit and a byte?</h4>
                <p className="text-muted-foreground">A bit is the most basic unit of data, a single binary value of either 0 or 1. A byte is a group of 8 bits. Because all letters, numbers, and symbols on a computer are represented by combinations of bits, the byte is the fundamental unit for measuring file sizes.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is a kibibyte (KiB)?</h4>
                <p className="text-muted-foreground">A kibibyte (KiB) is a unit of digital information storage. It is equal to 1,024 bytes. It was created to avoid confusion between the binary (1024) and decimal (1000) meanings of the "kilo" prefix. So, 1 KiB = 1024 bytes, while 1 KB often means 1000 bytes, especially in marketing.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">How many megabytes are in a gigabyte?</h4>
                <p className="text-muted-foreground">In the context of computer memory and file storage (which this converter uses), there are 1,024 megabytes (MB) in one gigabyte (GB). In other contexts like data transmission or storage device marketing, it can sometimes mean 1,000 megabytes.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The Data Storage Converter is an essential tool for accurately translating between different binary units of digital information. It clarifies the relationships between bits, bytes, and their multiples, making it invaluable for IT professionals, developers, and technology enthusiasts.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
