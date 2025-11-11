
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Landmark, Calculator, Info, FileText, Building2, TrendingUp } from 'lucide-react';
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
type ScheduleItem = { year: number; beginningBookValue: number; fraction: string; depreciation: number; endingBookValue: number };

export default function DepreciationSumOfYearsDigitsCalculator() {
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
    const syd = (usefulLife * (usefulLife + 1)) / 2;
    const depreciableBase = assetCost - salvageValue;
    let bookValue = assetCost;
    const newSchedule: ScheduleItem[] = [];

    for (let year = 1; year <= usefulLife; year++) {
      const remainingLife = usefulLife - year + 1;
      const fraction = `${remainingLife}/${syd}`;
      const depreciation = depreciableBase * (remainingLife / syd);
      const endingBookValue = bookValue - depreciation;
      newSchedule.push({ year, beginningBookValue: bookValue, fraction, depreciation, endingBookValue });
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
            Sum-of-Years Digits Depreciation Calculator
          </CardTitle>
          <CardDescription>
            Calculate accelerated depreciation using the Sum-of-the-Years-Digits method
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
                      <TrendingUp className="h-4 w-4" />
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
                <CardDescription>Year-by-year depreciation breakdown with fractions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>Book Value (Start)</TableHead>
                    <TableHead>Fraction</TableHead>
                    <TableHead>Depreciation</TableHead>
                    <TableHead>Book Value (End)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedule.map(item => (
                    <TableRow key={item.year}>
                      <TableCell className="font-medium">{item.year}</TableCell>
                      <TableCell>${item.beginningBookValue.toFixed(2)}</TableCell>
                      <TableCell className="font-mono">{item.fraction}</TableCell>
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
                The original purchase price plus any costs needed to prepare the asset for use. This initial cost is then reduced by salvage value to determine the total amount to be depreciated.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Salvage Value</h4>
              <p className="text-muted-foreground">
                The estimated residual value at the end of the asset's useful life. The difference between asset cost and salvage value (the depreciable base) is what gets allocated over the useful life using declining fractions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Useful Life</h4>
              <p className="text-muted-foreground">
                The number of years the asset is expected to be in service. This determines the sum-of-the-years' digits, which serves as the denominator for depreciation fractions that decline each year.
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
                  <a href="/category/finance/depreciation-double-declining-calculator" className="text-primary hover:underline">
                    Depreciation (Double Declining) Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate accelerated depreciation using double declining balance method.
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
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Sum-of-the-Years' Digits (SYD) Depreciation: Calculation, Formula, and Accounting Method" />
    <meta itemProp="description" content="An expert guide detailing the Sum-of-the-Years' Digits (SYD) formula, its core role as an accelerated method for allocating asset cost, how to calculate the annual expense, and its comparison to the straight-line and double-declining balance methods." />
    <meta itemProp="keywords" content="sum of years digits depreciation formula explained, calculating SYD annual expense, accelerated depreciation method SYD, declining balance vs SYD, useful life accounting, financial reporting tax strategy" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-11" /> 
    <meta itemProp="url" content="/definitive-syd-depreciation-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Sum-of-the-Years' Digits (SYD) Depreciation: The Targeted Accelerated Method</h1>
    <p className="text-lg italic text-gray-700">Master the accounting method that provides a precise, accelerated allocation of an asset's cost over its useful service life.</p>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">SYD: Core Concept and Accelerated Principle</a></li>
        <li><a href="#formula-sum" className="hover:underline">Step 1: Calculating the Sum of the Years' Digits</a></li>
        <li><a href="#formula-expense" className="hover:underline">Step 2: Calculating the Annual Depreciation Expense</a></li>
        <li><a href="#vs-ddb" className="hover:underline">SYD vs. Double-Declining Balance (DDB)</a></li>
        <li><a href="#applications" className="hover:underline">Impact on Book Value and Financial Statements</a></li>
    </ul>
<hr />

    {/* SYD: CORE CONCEPT AND ACCELERATED PRINCIPLE */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">SYD: Core Concept and Accelerated Principle</h2>
    <p>The **Sum-of-the-Years' Digits (SYD)** method is an **accelerated depreciation** technique that allocates a greater portion of an asset's cost to the earlier years of its useful life. This method is considered a more refined approach than the Double-Declining Balance (DDB) method.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Matching Principle</h3>
    <p>SYD adheres to the **matching principle** by recognizing higher depreciation expense when the asset is new, most productive, and arguably losing the most market value. The total depreciation expense recognized over the asset's entire life is identical to that of the straight-line method; only the *timing* of the expense is altered.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Depreciable Base</h3>
    <p>Similar to the straight-line method, the SYD calculation applies the accelerated rate to the asset's **Depreciable Base**, which is the total cost that will be expensed over the asset's life:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-500 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Depreciable Base = Asset Cost - Salvage Value'}
        </p>
    </div>
    <p>This base remains constant throughout the SYD calculation.</p>

<hr />

    {/* STEP 1: CALCULATING THE SUM OF THE YEARS' DIGITS */}
    <h2 id="formula-sum" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Step 1: Calculating the Sum of the Years' Digits</h2>
    <p>The first unique step in the SYD method is calculating the denominator for the depreciation fraction, which is the sum of the digits representing the useful life of the asset.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Summation Formula</h3>
    <p>If an asset has a useful life of $N$ years, the sum of the years' digits ($S$) is calculated as:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-500 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'S = N * (N + 1) / 2'}
        </p>
    </div>
    <p>For example, for an asset with a 5-year life, the sum of the digits is $5 + 4 + 3 + 2 + 1 = 15$. Using the formula: $5 \times (5+1) / 2 = 15$. This sum remains the denominator for the entire depreciation schedule.</p>

<hr />

    {/* STEP 2: CALCULATING THE ANNUAL DEPRECIATION EXPENSE */}
    <h2 id="formula-expense" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Step 2: Calculating the Annual Depreciation Expense</h2>
    <p>The annual depreciation expense is calculated by multiplying the constant Depreciable Base by a fractional rate that changes each year.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Annual Expense Identity</h3>
    <p>The formula uses the remaining years of the asset's life as the numerator of the fraction:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-500 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Annual Depreciation = Depreciable Base * (Remaining Useful Life / Sum of the Years\' Digits)'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Declining Fraction</h3>
    <p>For the 5-year asset example (Sum=15):</p>
    <ul className="list-disc ml-6 space-y-2">
          <li>Year 1: (5/15) multiplied by Depreciable Base</li>
          <li>Year 2: (4/15) multiplied by Depreciable Base</li>
          <li>Year 5: (1/15) multiplied by Depreciable Base</li>
    </ul>
    <p>This systematic decline in the fraction allocates the largest expense to the first year and the smallest expense to the last year.</p>

<hr />

    {/* SYD VS. DOUBLE-DECLINING BALANCE (DDB) */}
    <h2 id="vs-ddb" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">SYD vs. Double-Declining Balance (DDB)</h2>
    <p>Both SYD and DDB are accelerated methods, but they differ significantly in their mechanism, resulting in different depreciation patterns.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Differences</h3>
    <table className="min-w-full divide-y divide-gray-200 border border-gray-300 my-4">
        <thead className="bg-gray-50">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SYD Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DDB Method</th>
            </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            <tr>
                <td className="px-6 py-4 whitespace-nowrap"><strong className="font-semibold">Base Applied To</strong></td>
                <td className="px-6 py-4 whitespace-nowrap">Constant Depreciable Base (Cost - Salvage)</td>
                <td className="px-6 py-4 whitespace-nowrap">Declining Book Value (No initial Salvage subtraction)</td>
            </tr>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap"><strong className="font-semibold">Expense Pattern</strong></td>
                <td className="px-6 py-4 whitespace-nowrap">Expense declines at a constant arithmetic rate.</td>
                <td className="px-6 py-4 whitespace-nowrap">Expense declines at a constant *percentage* rate (geometrically).</td>
            </tr>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap"><strong className="font-semibold">Salvage Treatment</strong></td>
                <td className="px-6 py-4 whitespace-nowrap">Salvage value is subtracted upfront.</td>
                <td className="px-6 py-4 whitespace-nowrap">Salvage value is a stopping point only.</td>
            </tr>
        </tbody>
    </table>

    <h3 className="text-xl font-semibold text-foreground mt-6">Total Expense Equality</h3>
    <p>Like all recognized depreciation methods, the total cumulative depreciation expense over the asset's full useful life is exactly the same for SYD, DDB, and the straight-line method.</p>

<hr />

    {/* IMPACT ON BOOK VALUE AND FINANCIAL STATEMENTS */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Impact on Book Value and Financial Statements</h2>
    <p>The choice of SYD over the straight-line method creates an initial timing difference that affects the primary financial statements.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Income Statement Impact</h3>
    <p>SYD records a higher depreciation expense in the early years compared to the straight-line method. This results in **lower reported net income** and **lower taxes** (a tax shield) in the early years. The effect reverses in the later years of the asset's life.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Balance Sheet Impact (Book Value)</h3>
    <p>Since more accumulated depreciation is recorded earlier, the asset's **Net Book Value** (Cost minus Accumulated Depreciation) declines faster under the SYD method than under the straight-line method.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The **Sum-of-the-Years' Digits (SYD)** method is an accelerated depreciation technique that allocates the asset's cost based on a declining fraction of the **Depreciable Base**. The denominator is the fixed **Sum of the Years' Digits**.</p>
    <p>This method provides a more precise economic match than the straight-line method, resulting in higher expenses and a **tax shield** in the early years. It is used when management believes an asset is most productive or loses its market value most rapidly immediately after acquisition.</p>
</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about sum-of-the-years-digits depreciation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is sum-of-the-years-digits depreciation?</h4>
              <p className="text-muted-foreground">
                Sum-of-the-years-digits (SYD) is an accelerated depreciation method that allocates more depreciation expense in the early years of an asset's life. It uses declining fractions of the depreciable base, with larger fractions in early years and smaller fractions in later years, resulting in decreasing annual depreciation amounts over time.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How is the sum-of-the-years calculated?</h4>
              <p className="text-muted-foreground">
                The sum-of-the-years (SYD) is calculated by adding the digits of the years. For a 5-year asset, SYD = 5 + 4 + 3 + 2 + 1 = 15. The formula is: SYD = n × (n + 1) / 2, where n is the useful life. This sum becomes the denominator for all depreciation fractions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How are the depreciation fractions determined?</h4>
              <p className="text-muted-foreground">
                Each year's fraction has the sum-of-the-years as the denominator. The numerator for each year is the remaining useful life at the start of that year. For a 5-year asset: Year 1 = 5/15, Year 2 = 4/15, Year 3 = 3/15, Year 4 = 2/15, Year 5 = 1/15. This creates a declining pattern.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Why use SYD instead of straight-line or DDB?</h4>
              <p className="text-muted-foreground">
                SYD provides a middle ground between straight-line and double declining balance. It accelerates depreciation but less aggressively than DDB, often matching actual asset usage patterns more closely. It's useful when you want acceleration but prefer a smoother decline than DDB provides, especially for assets with moderate early-year depreciation needs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What assets are best suited for SYD depreciation?</h4>
              <p className="text-muted-foreground">
                SYD works well for assets that decline in value more rapidly in early years but at a more moderate pace than DDB assumes, such as office equipment, vehicles, or machinery. It's ideal when you need accelerated depreciation but want a more gradual acceleration than DDB provides.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does SYD compare to other depreciation methods?</h4>
              <p className="text-muted-foreground">
                SYD provides faster depreciation than straight-line in early years but slower than DDB. In the first year of a 5-year asset, SYD typically depreciates about 33% of the depreciable base, compared to 40% for DDB and 20% for straight-line. It offers a balanced approach between these extremes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can SYD be used for tax purposes?</h4>
              <p className="text-muted-foreground">
                For US tax purposes, MACRS is typically required for most business assets rather than traditional SYD. However, SYD can be used for book accounting purposes. Some companies use SYD for financial reporting while using MACRS for tax returns. Always consult a tax professional to determine the appropriate method.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What happens if I want to extend the asset's useful life?</h4>
              <p className="text-muted-foreground">
                If you extend the useful life during the asset's use, you would recalculate the sum-of-the-years based on the new remaining useful life and the total remaining useful life from the original estimate. The remaining book value would be depreciated using the new SYD calculation over the extended period.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does partial year depreciation work with SYD?</h4>
              <p className="text-muted-foreground">
                For partial year depreciation, you apply the year's full fraction to determine the annual amount, then prorate it based on months in service. For example, if an asset is purchased mid-year and the first year's fraction is 5/15, multiply the depreciable base by 5/15, then prorate by months in service.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What are the advantages and disadvantages of SYD?</h4>
              <p className="text-muted-foreground">
                Advantages include accelerated depreciation providing larger early-year deductions, better matching of costs with revenues for assets that generate more income early, and a balanced acceleration between straight-line and DDB. Disadvantages include more complex calculations than straight-line, still less aggressive than DDB for maximum early deductions, and not typically allowed for tax purposes (MACRS is required).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
