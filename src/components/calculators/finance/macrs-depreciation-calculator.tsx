
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
import { Landmark, Calculator, Info, FileText, Building2, TrendingDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const macrsTables = {
  '3-year': [0.3333, 0.4445, 0.1481, 0.0741],
  '5-year': [0.2000, 0.3200, 0.1920, 0.1152, 0.1152, 0.0576],
  '7-year': [0.1429, 0.2449, 0.1749, 0.1249, 0.0893, 0.0892, 0.0893, 0.0446],
};

type AssetClass = keyof typeof macrsTables;

const formSchema = z.object({
  assetCost: z.number().positive(),
  assetClass: z.string(),
});

type FormValues = z.infer<typeof formSchema>;
type ScheduleItem = { year: number; rate: number; depreciation: number; };

export default function MacrsDepreciationCalculator() {
  const [schedule, setSchedule] = useState<ScheduleItem[] | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetCost: undefined,
      assetClass: '5-year',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { assetCost, assetClass } = values;
    const rates = macrsTables[assetClass as AssetClass];
    const newSchedule: ScheduleItem[] = rates.map((rate, index) => ({
      year: index + 1,
      rate: rate * 100,
      depreciation: assetCost * rate,
    }));
    setSchedule(newSchedule);
  };

  const totalDepreciation = schedule ? schedule.reduce((sum, item) => sum + item.depreciation, 0) : 0;

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            MACRS Depreciation Parameters
          </CardTitle>
          <CardDescription>
            Enter asset details to calculate tax-deductible depreciation schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField 
                  control={form.control} 
                  name="assetCost" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset Cost ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 50000"
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="assetClass" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset Class (Half-Year Convention)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="3-year">3-Year (e.g., some tools)</SelectItem>
                          <SelectItem value="5-year">5-Year (e.g., computers, cars)</SelectItem>
                          <SelectItem value="7-year">7-Year (e.g., office furniture)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
              </div>
              <Button type="submit">Generate Schedule</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {schedule && (
        <Card>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Landmark className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>MACRS Depreciation Schedule</CardTitle>
                <CardDescription>Total depreciation: ${totalDepreciation.toFixed(2)}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>MACRS Rate (%)</TableHead>
                  <TableHead>Depreciation Deduction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.map(item => (
                  <TableRow key={item.year}>
                    <TableCell>{item.year}</TableCell>
                    <TableCell>{item.rate.toFixed(2)}%</TableCell>
                    <TableCell>${item.depreciation.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Understanding Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Asset Cost</h4>
            <p className="text-muted-foreground">
              The original cost basis of the asset. This is the amount you paid to acquire the asset, including purchase price, sales tax, shipping, installation, and other capitalized costs.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Asset Class</h4>
            <p className="text-muted-foreground">
              The recovery period assigned to an asset by the IRS for tax purposes. This calculator uses the Half-Year convention, which is the most common. The IRS classifies assets into specific recovery periods based on their nature and use.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>
            Explore other depreciation and financial calculators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/depreciation-straight-line-calculator" className="text-primary hover:underline">
                  Straight-Line Depreciation Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate even depreciation expense over an asset's useful life.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/depreciation-double-declining-calculator" className="text-primary hover:underline">
                  Double Declining Balance Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate accelerated depreciation using the declining balance method.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/depreciation-sum-of-years-digits-calculator" className="text-primary hover:underline">
                  Sum-of-Years Digits Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate depreciation using the sum-of-the-years'-digits method.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/activity-based-costing-calculator" className="text-primary hover:underline">
                  Activity-Based Costing Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Allocate overhead costs based on specific cost-driving activities.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Complete Guide to MACRS Depreciation
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
          <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about MACRS depreciation for tax purposes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">What is MACRS and when is it used?</h4>
            <p className="text-muted-foreground">
              Modified Accelerated Cost Recovery System (MACRS) is the standard depreciation method used for U.S. tax purposes. It allows businesses to recover the cost basis of assets through annual tax deductions, with larger deductions in early years.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What does the half-year convention mean?</h4>
            <p className="text-muted-foreground">
              The half-year convention assumes that an asset is placed in service at the midpoint of the tax year, regardless of the actual acquisition date. This means you get half a year's depreciation in the first year of the asset's recovery period.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Why does the total depreciation exceed 100%?</h4>
            <p className="text-muted-foreground">
              This is due to the half-year convention and the accelerated depreciation rates. The IRS percentages are designed to fully depreciate the asset over its recovery period while providing larger tax deductions in the early years.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Can I use MACRS for all business assets?</h4>
            <p className="text-muted-foreground">
              MACRS applies to most depreciable business assets, but certain assets are excluded, such as intangible assets, land, inventory, and assets placed in service before 1987. Consult a tax professional for specific guidance on your assets.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do I determine the correct MACRS asset class?</h4>
            <p className="text-muted-foreground">
              The IRS Publication 946 provides detailed classifications. Common categories include 3-year for certain tools, 5-year for computers and cars, and 7-year for office furniture and equipment. Check IRS guidelines for your specific asset type.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Can I switch from MACRS to another depreciation method?</h4>
            <p className="text-muted-foreground">
              Generally, once you elect a depreciation method, you must continue using it unless you receive IRS permission to change. This is a binding election and should be carefully considered with a tax advisor.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How does bonus depreciation work with MACRS?</h4>
            <p className="text-muted-foreground">
              Bonus depreciation allows you to deduct a percentage of the asset cost in the first year in addition to regular MACRS depreciation. The percentage varies by year and type of property, and recent tax laws have expanded its availability.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What happens if I sell a MACRS asset before the recovery period ends?</h4>
            <p className="text-muted-foreground">
              If you sell an asset before fully depreciating it, you may have to recognize a gain or loss on the sale. The difference between the sale proceeds and the asset's adjusted basis determines the tax treatment. Consult a tax professional for specific scenarios.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Is there a limit on MACRS deductions in the first year?</h4>
            <p className="text-muted-foreground">
              Section 179 allows businesses to elect to expense and immediately deduct up to a certain amount of qualifying property purchases in the first year, subject to annual limits and phase-out thresholds. This is separate from MACRS but can be used together.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Should I use MACRS or straight-line depreciation for my business?</h4>
            <p className="text-muted-foreground">
              MACRS typically provides larger tax deductions in early years, which can improve cash flow. However, straight-line depreciation provides consistent annual deductions. The choice depends on your tax strategy, cash flow needs, and financial reporting requirements. Consider consulting a tax advisor.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
