'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Info, TrendingUp, Shield, Landmark } from 'lucide-react';
import { calculateTimeDuration } from '@/lib/employment-calculators';
import Link from 'next/link';

const formSchema = z.object({
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  hours: number;
  minutes: number;
  totalMinutes: number;
  decimalHours: number;
}

export default function NightShiftDurationCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startTime: undefined,
      endTime: undefined,
    },
  });

  const resetForm = () => {
    form.reset({
      startTime: undefined,
      endTime: undefined,
    });
    setResult(null);
  };
  
  const onSubmit = (values: FormValues) => {
    const duration = calculateTimeDuration(values.startTime, values.endTime, true);
    setResult(duration);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Night Shift Duration Calculator
          </CardTitle>
          <CardDescription>
            Calculate the duration of a work shift that crosses midnight.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift Start Time (24h format)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 22:00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift End Time (24h format)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 06:30" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <div className="flex gap-4">
                <Button type="submit">Calculate Duration</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Reset</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
            <CardHeader>
                <CardTitle>Shift Duration</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="text-center mb-8">
                    <p className="text-lg font-medium text-muted-foreground">Total Shift Length</p>
                    <p className="text-5xl font-bold text-primary mt-1">{result.hours}h {result.minutes}m</p>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="text-sm font-medium text-muted-foreground">In Total Minutes</h4>
                        <p className="text-2xl font-bold">{result.totalMinutes}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="text-sm font-medium text-muted-foreground">In Decimal Hours</h4>
                        <p className="text-2xl font-bold">{result.decimalHours.toFixed(2)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding the Calculation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>This calculator is specifically designed for shifts that span across two days, such as a typical overnight or "graveyard" shift. It correctly handles the time difference when the end time is on the following day.</p>
            <p>By inputting the start and end times in a 24-hour format, it provides the total duration in hours and minutes, as well as in total minutes and decimal hours for payroll or logging purposes.</p>
          </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Calculation Logic</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                  <li><strong className="text-foreground">Convert to Minutes:</strong> Both start and end times are converted into minutes from the beginning of a 24-hour day.</li>
                  <li><strong className="text-foreground">Handle Overnight Crossover:</strong> If the end time's minute value is less than the start time's, it signifies an overnight shift. The calculator adds the number of minutes in a full day (1440) to the end time to account for the day change.</li>
                  <li><strong className="text-foreground">Calculate Difference:</strong> The start time minutes are subtracted from the adjusted end time minutes to find the total duration.</li>
                  <li><strong className="text-foreground">Format Output:</strong> The total minutes are then converted back into hours and minutes, as well as a decimal format.</li>
              </ol>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" />Related Calculators</CardTitle>
            <CardDescription>Explore other employment and career planning tools.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-primary">
              <li><Link href="/employment/shift-rotation-calculator" className="hover:underline">Shift Rotation Calculator</Link></li>
              <li><Link href="/employment/split-shift-hours-calculator" className="hover:underline">Split Shift Hours Calculator</Link></li>
            </ul>
          </CardContent>
        </Card>
        
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Guide to Navigating Night Shift Work</h1>
            <p className="text-lg italic">Working the night shift comes with a unique set of challenges and benefits. Understanding the logistics, health implications, and strategies for success can make a significant difference in your well-being and career.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Common Industries & Pay Differentials</h2>
            <p>Night shifts are the backbone of our 24/7 economy. Key industries rely on them, and they often come with extra pay.</p>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted">
                            <th className="p-4 border">Industry</th>
                            <th className="p-4 border">Common Roles</th>
                            <th className="p-4 border">Typical Shift Differential</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-4 border font-semibold">Healthcare</td>
                            <td className="p-4 border">Nurses, Doctors, Paramedics, Technicians</td>
                            <td className="p-4 border">10-20% of base pay</td>
                        </tr>
                        <tr>
                            <td className="p-4 border font-semibold">Logistics & Warehousing</td>
                            <td className="p-4 border">Package Handlers, Forklift Operators, Sorters</td>
                            <td className="p-4 border">$1.00 - $3.00 per hour</td>
                        </tr>
                        <tr>
                            <td className="p-4 border font-semibold">Manufacturing</td>
                            <td className="p-4 border">Machine Operators, Quality Control, Maintenance</td>
                            <td className="p-4 border">5-15% of base pay</td>
                        </tr>
                        <tr>
                            <td className="p-4 border font-semibold">Law Enforcement & Security</td>
                            <td className="p-4 border">Police Officers, Security Guards, Dispatchers</td>
                            <td className="p-4 border">Often included in base salary or a fixed percentage (~5-10%).</td>
                        </tr>
                        <tr>
                            <td className="p-4 border font-semibold">Hospitality</td>
                            <td className="p-4 border">Night Auditors, Front Desk Staff, Cleaning Crews</td>
                            <td className="p-4 border">$0.50 - $2.00 per hour</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Strategies for Thriving on the Night Shift</h2>
            <p>Working against your body's natural circadian rhythm can be tough. These strategies can help.</p>
            <ul className="list-disc ml-6 space-y-3">
                <li><strong className="font-semibold text-foreground">Master Your Sleep Environment:</strong> Your bedroom must become a cave. Invest in blackout curtains, wear an eye mask, and use a white noise machine or earplugs to block out daytime sounds.</li>
                <li><strong className="font-semibold text-foreground">Maintain a Consistent Schedule:</strong> As much as possible, stick to your night-shift schedule even on your days off. Flipping back and forth between a day and night schedule is exhausting and unhealthy.</li>
                <li><strong className="font-semibold text-foreground">Strategic Use of Light and Dark:</strong> Wear sunglasses on your commute home to minimize exposure to morning light, which signals your brain to wake up. When you wake up in the evening, expose yourself to bright light to help reset your body clock.</li>
                <li><strong className="font-semibold text-foreground">Plan Your Meals:</strong> Avoid heavy, greasy meals during your shift as they can cause sluggishness. Eat a main "breakfast" meal when you wake up, a light meal or snacks during your shift, and avoid eating a large meal right before you go to sleep.</li>
            </ul>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
             <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is a "shift differential"?</h4>
                <p className="text-muted-foreground">A shift differential is extra pay that employers offer as an incentive for working less desirable hours, such as the evening or overnight shift. It can be a flat dollar amount per hour or a percentage of your base pay.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">How does this calculator handle unpaid breaks?</h4>
                <p className="text-muted-foreground">It calculates the total duration from start to end. You must manually subtract any unpaid break time from the total. For example, if the calculator shows 8.5 hours and you had an unpaid 30-minute break, your paid time is 8 hours.</p>
              </div>
               <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Why use 24-hour format?</h4>
                <p className="text-muted-foreground">Using a 24-hour format (e.g., 22:00 for 10 PM) removes the ambiguity of AM/PM and is a standard in scheduling and payroll systems, making calculations more reliable.</p>
              </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>This calculator provides a simple and accurate way to calculate the duration of any work shift, with a special focus on overnight shifts that cross midnight. By correctly handling the time crossover, it eliminates common errors in manual calculation, making it a reliable tool for employees and managers tracking hours for payroll, project logging, or personal planning.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
