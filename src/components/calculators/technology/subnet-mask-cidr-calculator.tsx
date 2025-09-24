
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Network } from 'lucide-react';

const ipToLong = (ip: string) => {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
};

const longToIp = (long: number) => {
    return [ (long >>> 24), (long >>> 16) & 255, (long >>> 8) & 255, long & 255 ].join('.');
};

const formSchema = z.object({
  ip: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Invalid IP address format'),
  cidr: z.number().int().min(1).max(32),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
    networkAddress: string;
    broadcastAddress: string;
    firstHost: string;
    lastHost: string;
    subnetMask: string;
    totalHosts: number;
}

export default function SubnetMaskCidrCalculator() {
  const [result, setResult] = useState<Result | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { ip: '', cidr: undefined },
  });

  const onSubmit = (values: FormValues) => {
    try {
        const ipLong = ipToLong(values.ip);
        const mask = -1 << (32 - values.cidr);
        const networkAddressLong = ipLong & mask;
        const broadcastAddressLong = networkAddressLong | (~mask >>> 0);
        const firstHostLong = networkAddressLong + 1;
        const lastHostLong = broadcastAddressLong - 1;
        const totalHosts = Math.pow(2, 32 - values.cidr) - 2;

        setResult({
            networkAddress: longToIp(networkAddressLong),
            broadcastAddress: longToIp(broadcastAddressLong),
            firstHost: longToIp(firstHostLong),
            lastHost: longToIp(lastHostLong),
            subnetMask: longToIp(mask),
            totalHosts: totalHosts > 0 ? totalHosts : 0,
        });
    } catch(e) {
        console.error(e);
        setResult(null);
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="ip" render={({ field }) => (
                <FormItem><FormLabel>IP Address</FormLabel><FormControl><Input placeholder="e.g., 192.168.1.10" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="cidr" render={({ field }) => (
                <FormItem><FormLabel>CIDR (e.g., 24)</FormLabel><FormControl><Input type="number" placeholder="1-32" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Network className="h-8 w-8 text-primary" /><CardTitle>Subnet Details</CardTitle></div></CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div><p className="font-semibold">Network Address:</p><p className="font-mono">{result.networkAddress}</p></div>
                    <div><p className="font-semibold">Broadcast Address:</p><p className="font-mono">{result.broadcastAddress}</p></div>
                    <div><p className="font-semibold">First Usable Host:</p><p className="font-mono">{result.firstHost}</p></div>
                    <div><p className="font-semibold">Last Usable Host:</p><p className="font-mono">{result.lastHost}</p></div>
                    <div><p className="font-semibold">Subnet Mask:</p><p className="font-mono">{result.subnetMask}</p></div>
                    <div><p className="font-semibold">Total Usable Hosts:</p><p className="font-mono">{result.totalHosts.toLocaleString()}</p></div>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
