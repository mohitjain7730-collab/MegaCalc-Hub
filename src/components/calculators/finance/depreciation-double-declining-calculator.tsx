
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, Calculator, Info, FileText, Building2, TrendingDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  assetCost: z.number().positive(),
  salvageValue: z.number().nonnegative(),
  usefulLife: z.number().int().positive(),
}).refine(data => data.assetCost > data.salvageValue, {
  message: "Asset cost must be greater than salvage value.",
  path: ['salvageValue'],
});

type FormValues = z.infer<typeof formSchema>;
type ScheduleItem = { year: number; beginningBookValue: number; depreciation: number; endingBookValue: number };

export default function DepreciationDoubleDecliningCalculator() {
  const [schedule, setSchedule] = useState<ScheduleItem[] | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetCost: undefined,
      salvageValue: undefined,
      usefulLife: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { assetCost, salvageValue, usefulLife } = values;
    const rate = (1 / usefulLife) * 2;
    let bookValue = assetCost;
    const newSchedule: ScheduleItem[] = [];

    for (let year = 1; year <= usefulLife; year++) {
      let depreciation = bookValue * rate;
      if (bookValue - depreciation < salvageValue) {
        depreciation = bookValue - salvageValue;
      }
      if(depreciation < 0) depreciation = 0;
      
      const endingBookValue = bookValue - depreciation;
      newSchedule.push({ year, beginningBookValue: bookValue, depreciation, endingBookValue });
      bookValue = endingBookValue;
    }
    setSchedule(newSchedule);
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Double Declining Balance Depreciation Calculator
          </CardTitle>
          <CardDescription>
            Calculate accelerated depreciation for an asset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="assetCost" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Asset Cost ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 100000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="salvageValue" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4" />
                      Salvage Value ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 10000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="usefulLife" render={({ field }) => (
                  <FormItem className='md:col-span-2'>
                    <FormLabel className="flex items-center gap-2">
                      <Landmark className="h-4 w-4" />
                      Useful Life (years)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Generate Depreciation Schedule</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {schedule && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Landmark className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Depreciation Schedule</CardTitle>
                <CardDescription>Year-by-year depreciation breakdown</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>Beginning Book Value</TableHead>
                    <TableHead>Depreciation</TableHead>
                    <TableHead>Ending Book Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedule.map(item => (
                    <TableRow key={item.year}>
                      <TableCell className="font-medium">{item.year}</TableCell>
                      <TableCell>${item.beginningBookValue.toFixed(2)}</TableCell>
                      <TableCell>${item.depreciation.toFixed(2)}</TableCell>
                      <TableCell>${item.endingBookValue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Educational Content - Expanded Sections */}
      <div className="space-y-6">
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
                The original purchase price of the asset plus any costs required to get it ready for use (shipping, installation, etc.). This is the initial book value from which depreciation begins.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Salvage Value</h4>
              <p className="text-muted-foreground">
                The estimated value of the asset at the end of its useful life. With double declining balance, the asset cannot be depreciated below this value, which is why the final year's depreciation is adjusted if needed.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Useful Life</h4>
              <p className="text-muted-foreground">
                The number of years over which the asset is expected to be used. The double declining rate is calculated as (1 / Useful Life) × 2, resulting in a fixed percentage applied to the declining book value each year.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Calculators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
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
                    Depreciation (Straight-Line) Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate even depreciation over an asset's useful life.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/depreciation-sum-of-years-digits-calculator" className="text-primary hover:underline">
                    Depreciation (Sum-of-Years) Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate accelerated depreciation using sum-of-the-years-digits method.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/macrs-depreciation-calculator" className="text-primary hover:underline">
                    MACRS Depreciation Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate tax-deductible depreciation for US tax purposes.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/overhead-rate-allocation-calculator" className="text-primary hover:underline">
                    Overhead Rate Allocation Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Establish a predetermined overhead rate for cost allocation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Complete Guide to Double Declining Balance Depreciation
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
            <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about double declining balance depreciation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is double declining balance depreciation?</h4>
              <p className="text-muted-foreground">
                Double declining balance (DDB) is an accelerated depreciation method that allocates more depreciation expense in the early years of an asset's life. It uses a fixed rate (double the straight-line rate) applied to the declining book value each year, resulting in decreasing depreciation amounts over time.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How is the double declining rate calculated?</h4>
              <p className="text-muted-foreground">
                The DDB rate is calculated as (1 / Useful Life) × 2. For example, a 10-year asset has a 20% DDB rate (1/10 × 2). This fixed percentage is applied to the asset's book value at the beginning of each year, resulting in declining depreciation amounts as the book value decreases.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Why use double declining balance instead of straight-line?</h4>
              <p className="text-muted-foreground">
                DDB matches the actual pattern of asset usage for many assets that lose value faster in early years. It provides higher tax deductions initially when the asset is most productive, better reflects market value decline for many assets, and can provide tax timing benefits by accelerating deductions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can an asset be depreciated below its salvage value?</h4>
              <p className="text-muted-foreground">
                No. Under double declining balance, an asset cannot be depreciated below its salvage value. When the calculation would result in book value falling below salvage value, the depreciation for that year is adjusted to bring the ending book value exactly to salvage value. This typically happens in the final year.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does DDB compare to other accelerated methods?</h4>
              <p className="text-muted-foreground">
                DDB provides more aggressive first-year depreciation than straight-line but less than sum-of-years digits in the first year. Compared to sum-of-years digits, DDB continues to apply a fixed rate to declining book value, while SYD uses declining fractions of a fixed depreciable base. DDB is simpler to calculate manually.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">When is double declining balance most appropriate?</h4>
              <p className="text-muted-foreground">
                DDB works well for assets that experience rapid value decline early in their useful life, such as vehicles, high-tech equipment, or assets subject to rapid technological obsolescence. It's also useful when you want to maximize early-year depreciation deductions for tax or cash flow purposes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I switch from DDB to straight-line depreciation?</h4>
              <p className="text-muted-foreground">
                Yes, many companies switch from DDB to straight-line partway through an asset's life when straight-line depreciation would provide a higher annual deduction. This is called "catch-up depreciation" and is allowed under many accounting standards when it results in more depreciation than the DDB method would provide.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What are the tax implications of DDB?</h4>
              <p className="text-muted-foreground">
                For tax purposes, DDB can provide larger deductions in early years, reducing current tax liability and improving cash flow. However, US tax law typically requires MACRS for most business assets rather than traditional DDB. Always consult a tax professional to determine the appropriate depreciation method for tax purposes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Does DDB affect reported earnings?</h4>
              <p className="text-muted-foreground">
                Yes, DDB will show lower earnings in early years due to higher depreciation expense, and higher earnings in later years as depreciation decreases. This can make a company's earnings appear less stable over time compared to straight-line depreciation, which provides consistent annual expenses.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What happens if I sell the asset before its useful life ends?</h4>
              <p className="text-muted-foreground">
                When an asset is sold before the end of its useful life, you calculate the remaining book value (original cost minus accumulated depreciation) and compare it to the sale proceeds. Any difference is recognized as a gain (if sold for more) or loss (if sold for less) on the income statement. The accelerated nature of DDB means more depreciation has been taken early, potentially affecting the gain or loss calculation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
