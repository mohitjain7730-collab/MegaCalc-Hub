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
import { RotateCw, Info, Shield, TrendingUp, Landmark, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { convertTorque, TORQUE_UNITS } from '@/lib/converters';

const formSchema = z.object({
  value: z.number().optional(),
  fromUnit: z.string().min(1),
  toUnit: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function TorqueConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: undefined,
      fromUnit: 'newton-meter',
      toUnit: 'pound-foot',
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (watchedValues.value !== undefined && watchedValues.fromUnit && watchedValues.toUnit) {
      const conversionResult = convertTorque(watchedValues.value, watchedValues.fromUnit, watchedValues.toUnit);
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
            <RotateCw className="h-5 w-5" />
            Torque Converter
          </CardTitle>
          <CardDescription>
            Convert between newton-meters, pound-feet, and other torque units.
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
                          {TORQUE_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                          {TORQUE_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
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
                {watchedValues.value} {TORQUE_UNITS.find(u => u.value === watchedValues.fromUnit)?.label.split(' ')[0]} = {result.toPrecision(6)} {TORQUE_UNITS.find(u => u.value === watchedValues.toUnit)?.label.split(' ')[0]}
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
            <p>Torque is a measure of the rotational force. It's what causes an object to rotate around an axis. This tool is essential for mechanics, engineers, and physicists for converting between different units of torque.</p>
            <p>All conversions use the newton-meter (N·m), the SI unit of torque, as a base reference to ensure accuracy.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Used</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Standardized Conversion Process</h4>
              <p>To ensure accuracy, all conversions use the newton-meter (N·m) as a common base unit.</p>
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                  <li><strong className="text-foreground">Convert to Newton-meters:</strong> The input value is converted to newton-meters by multiplying it by its conversion factor. <br /><span className="font-mono text-xs">Value in N·m = Input Value × Conversion Factor to N·m</span></li>
                  <li><strong className="text-foreground">Convert to Target Unit:</strong> The newton-meter value is then converted to the desired final unit by dividing it by the target unit's conversion factor. <br /><span className="font-mono text-xs">Final Value = Value in N·m / Target Unit's Conversion Factor</span></li>
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
                <li><Link href="/kilowatts-to-horsepower-converter" className="hover:underline">Kilowatts To Horsepower Converter</Link></li>
                <li><Link href="/body-measurement-to-cloth-size-converter" className="hover:underline">Body Measurement To Cloth Size Converter</Link></li>
                <li><Link href="/inches-to-centimeters-converter" className="hover:underline">Inches To Centimeters Converter</Link></li>
                <li><Link href="/days-to-hours-converter" className="hover:underline">Days To Hours Converter</Link></li>
                <li><Link href="/atmospheres-to-psi-converter" className="hover:underline">Atmospheres To Psi Converter</Link></li>
            </ul>
          </CardContent>
        </Card>
        
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Units of Torque</h1>
            <p className="text-lg italic">Torque, also called moment of force, is the rotational equivalent of linear force. It is defined as a force applied at a distance from a pivot point.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Common Torque Units</h2>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-muted"><th className="p-4 border">Unit</th><th className="p-4 border">Abbreviation</th><th className="p-4 border">Definition & Context</th></tr></thead>
                    <tbody>
                        <tr><td className="p-4 border font-semibold">Newton-meter</td><td className="p-4 border">N·m</td><td className="p-4 border">The SI unit of torque. It represents the torque from one newton of force applied one meter from the pivot. The standard for scientific and international engineering applications.</td></tr>
                        <tr><td className="p-4 border font-semibold">Pound-foot</td><td className="p-4 border">lbf·ft</td><td className="p-4 border">An imperial/US customary unit, representing one pound-force applied one foot from the pivot. The standard for automotive engine torque ratings in the US.</td></tr>
                        <tr><td className="p-4 border font-semibold">Pound-inch</td><td className="p-4 border">lbf·in</td><td className="p-4 border">A smaller imperial/US customary unit, representing one pound-force applied one inch from the pivot. Used for smaller fasteners and applications.</td></tr>
                    </tbody>
                </table>
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Common Conversions at a Glance</h2>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted">
                            <th className="p-4 border">From</th>
                            <th className="p-4 border">To</th>
                            <th className="p-4 border">Equivalent Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td className="p-4 border">1 Newton-meter (N·m)</td><td className="p-4 border">Pound-feet (lbf·ft)</td><td className="p-4 border">~0.7376 lbf·ft</td></tr>
                        <tr><td className="p-4 border">1 Pound-foot (lbf·ft)</td><td className="p-4 border">Newton-meters (N·m)</td><td className="p-4 border">~1.356 N·m</td></tr>
                        <tr><td className="p-4 border">1 Pound-foot (lbf·ft)</td><td className="p-4 border">Pound-inches (lbf·in)</td><td className="p-4 border">12 lbf·in</td></tr>
                    </tbody>
                </table>
            </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Is torque the same as work or energy?</h4>
                <p className="text-muted-foreground">No. While both torque and energy can be expressed in units of force times distance (like newton-meters and joules), they are different concepts. Torque is a vector quantity that causes rotation, while energy (and work) is a scalar quantity representing the capacity to do work. In SI units, torque is always expressed as newton-meters (N·m), while energy is expressed in Joules (J), even though 1 J = 1 N·m dimensionally.</p>
            </div>
             <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Why is torque important for cars?</h4>
                <p className="text-muted-foreground">Torque is the twisting force an engine produces, and it's what gets your car moving. High torque at low RPMs means the car can accelerate quickly from a standstill. Horsepower (which is related to torque and RPM) determines how fast the car can go.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is the difference between pound-foot (lbf·ft) and foot-pound (ft·lbf)?</h4>
                <p className="text-muted-foreground">Functionally, they represent the same amount of torque. However, "pound-foot" (lbf·ft) is the more formally correct term for torque, as it emphasizes the unit of force (lbf) being applied at a distance (ft). "Foot-pound" is more commonly associated with work or energy.</p>
            </div>
            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">How do I use a torque wrench?</h4>
                <p className="text-muted-foreground">A torque wrench is a tool used to apply a specific amount of torque to a fastener like a nut or bolt. You set the desired torque value on the wrench, and it will indicate (often with a click or beep) when you have reached that value, preventing over-tightening or under-tightening.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The Torque Converter is a crucial tool for mechanics, engineers, and physicists, allowing for quick and accurate conversions between the metric and imperial units of rotational force. It's essential for everything from tightening a bolt to designing an engine.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
