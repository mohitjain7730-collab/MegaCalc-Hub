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
import { Network, Info, Shield, TrendingUp, Landmark, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { convertDataTransferSpeed, DATA_TRANSFER_SPEED_UNITS } from '@/lib/converters';

const formSchema = z.object({
  value: z.number().optional(),
  fromUnit: z.string().min(1),
  toUnit: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function DataTransferSpeedConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      fromUnit: 'megabits-per-second',
      toUnit: 'megabytes-per-second',
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (watchedValues.value !== undefined && watchedValues.fromUnit && watchedValues.toUnit) {
      const conversionResult = convertDataTransferSpeed(watchedValues.value, watchedValues.fromUnit, watchedValues.toUnit);
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
            <Network className="h-5 w-5" />
            Data Transfer Speed Converter
          </CardTitle>
          <CardDescription>
            Convert between various units of data transfer speed, like Mbps and MB/s.
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
                        <Input type="number" placeholder="e.g., 100" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
                          {DATA_TRANSFER_SPEED_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                          {DATA_TRANSFER_SPEED_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                {watchedValues.value} {DATA_TRANSFER_SPEED_UNITS.find(u => u.value === watchedValues.fromUnit)?.label.split(' ')[0]} = {result.toPrecision(6)} {DATA_TRANSFER_SPEED_UNITS.find(u => u.value === watchedValues.toUnit)?.label.split(' ')[0]}
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
            <p>This tool helps clarify the often-confusing world of internet speeds and file transfer rates. It allows for easy conversion between bit-based units (used for network speeds) and byte-based units (used for file sizes).</p>
            <p>The core of the conversion lies in the relationship: 1 Byte = 8 Bits. Network providers advertise speeds in bits per second (e.g., Mbps), while your downloads are measured in bytes per second (e.g., MB/s). This tool bridges that gap.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Used</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Standardized Conversion Process</h4>
              <p>To ensure precision, all conversions use bits per second (bps) as the common base unit.</p>
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                <li><strong className="text-foreground">Convert to bps:</strong> The input value is converted to bits per second by multiplying it by its conversion factor. <br /><span className="font-mono text-xs">Value in bps = Input Value × Conversion Factor to bps</span></li>
                <li><strong className="text-foreground">Convert to Target Unit:</strong> The bps value is then converted to the desired final unit by dividing it by the target unit's conversion factor. <br /><span className="font-mono text-xs">Final Value = Value in bps / Target Unit's Conversion Factor</span></li>
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
              <li><Link href="/square-meters-to-square-yards-converter" className="hover:underline">Square Meters To Square Yards Converter</Link></li>
              <li><Link href="/minutes-to-seconds-converter" className="hover:underline">Minutes To Seconds Converter</Link></li>
              <li><Link href="/carats-to-grams-converter" className="hover:underline">Carats To Grams Converter</Link></li>
              <li><Link href="/milliliters-to-cubic-inches-converter" className="hover:underline">Milliliters To Cubic Inches Converter</Link></li>
              <li><Link href="/torr-to-pascals-converter" className="hover:underline">Torr To Pascals Converter</Link></li>
            </ul>
          </CardContent>
        </Card>

        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Data Transfer Speeds</h1>
          <p className="text-lg italic">Data transfer speed, or bandwidth, measures how much data can be moved from one point to another in a given amount of time. It's crucial for everything from web browsing to streaming video.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Bit-based vs. Byte-based Units</h2>
          <p>The most common point of confusion is the difference between bits and bytes. Internet Service Providers (ISPs) advertise speeds in bits (megabits per second - Mbps), while file sizes are measured in bytes (megabytes - MB). Since 1 byte equals 8 bits, your download speed in MB/s will be roughly 1/8th of your advertised internet speed in Mbps.</p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-muted"><th className="p-4 border">Unit</th><th className="p-4 border">Abbreviation</th><th className="p-4 border">Definition</th><th className="p-4 border">Primary Use Case</th></tr></thead>
              <tbody>
                <tr><td className="p-4 border font-semibold">Bits per second</td><td className="p-4 border">bps</td><td className="p-4 border">Base unit for transfer speed.</td><td className="p-4 border">Legacy modem speeds.</td></tr>
                <tr><td className="p-4 border font-semibold">Kilobits per second</td><td className="p-4 border">Kbps</td><td className="p-4 border">1,000 bits per second.</td><td className="p-4 border">Early DSL and dial-up speeds.</td></tr>
                <tr><td className="p-4 border font-semibold">Megabits per second</td><td className="p-4 border">Mbps</td><td className="p-4 border">1,000 kilobits per second.</td><td className="p-4 border">Standard for modern broadband internet plans.</td></tr>
                <tr><td className="p-4 border font-semibold">Gigabits per second</td><td className="p-4 border">Gbps</td><td className="p-4 border">1,000 megabits per second.</td><td className="p-4 border">Fiber optic internet, data center networking.</td></tr>
                <tr><td className="p-4 border font-semibold">Bytes per second</td><td className="p-4 border">B/s</td><td className="p-4 border">8 bits per second.</td><td className="p-4 border">Used to measure actual file download/upload speed.</td></tr>
                <tr><td className="p-4 border font-semibold">Kilobytes per second</td><td className="p-4 border">KB/s</td><td className="p-4 border">1,000 bytes per second.</td><td className="p-4 border">Download speeds for smaller files.</td></tr>
                <tr><td className="p-4 border font-semibold">Megabytes per second</td><td className="p-4 border">MB/s</td><td className="p-4 border">1,000 kilobytes per second.</td><td className="p-4 border">Standard measure for downloads in web browsers and apps.</td></tr>
                <tr><td className="p-4 border font-semibold">Gigabytes per second</td><td className="p-4 border">GB/s</td><td className="p-4 border">1,000 megabytes per second.</td><td className="p-4 border">High-speed file transfers (e.g., NVMe SSDs).</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Common Conversions at a Glance</h2>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="p-4 border">Internet Plan Speed (ISP)</th>
                  <th className="p-4 border">Theoretical Max Download Speed</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="p-4 border">100 Mbps</td><td className="p-4 border">12.5 MB/s</td></tr>
                <tr><td className="p-4 border">300 Mbps</td><td className="p-4 border">37.5 MB/s</td></tr>
                <tr><td className="p-4 border">500 Mbps</td><td className="p-4 border">62.5 MB/s</td></tr>
                <tr><td className="p-4 border">1 Gbps (1,000 Mbps)</td><td className="p-4 border">125 MB/s</td></tr>
                <tr><td className="p-4 border">To download a 5 MB song</td><td className="p-4 border">~0.4s on 100 Mbps</td></tr>
                <tr><td className="p-4 border">To download a 1 GB movie</td><td className="p-4 border">~1m 20s on 100 Mbps</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Why is my download speed slower than what my ISP advertises?</h4>
              <p className="text-muted-foreground">Several factors affect speed: network congestion, the server's upload speed, Wi-Fi signal strength, and overhead from network protocols. Also, remember the bits vs. bytes difference; a 100 Mbps plan has a theoretical maximum download speed of 12.5 MB/s.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What's the difference between "MB/s" and "mbps"?</h4>
              <p className="text-muted-foreground">The capitalization is key. "MB/s" stands for Megabytes per second, while "Mbps" or "mbps" stands for Megabits per second. A megabyte is 8 times larger than a megabit, so it's a critical distinction.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Does upload speed matter?</h4>
              <p className="text-muted-foreground">Yes, especially for activities like video conferencing, online gaming, and uploading large files. Many internet plans have asymmetrical speeds, meaning the download speed is much faster than the upload speed (e.g., 100/10 Mbps).</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What is latency?</h4>
              <p className="text-muted-foreground">Latency, or ping, is the time it takes for a signal to travel from your computer to a server and back. It's measured in milliseconds (ms). Low latency is crucial for real-time applications like gaming and video calls, while high bandwidth (speed) is more important for streaming or downloading.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The Data Transfer Speed Converter is a crucial tool for anyone looking to understand their internet connection and file transfer times. It demystifies the difference between bit-based network speeds and byte-based file sizes, enabling accurate estimations and comparisons.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
