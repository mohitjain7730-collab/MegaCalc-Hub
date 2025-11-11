
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
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Double-Declining Balance (DDB) Depreciation: Calculation, Formula, and Accounting Method" />
    <meta itemProp="description" content="An expert guide detailing the Double-Declining Balance (DDB) formula, its core role as an accelerated method for allocating asset cost, how to calculate annual expense, and its impact on financial statements and tax reporting." />
    <meta itemProp="keywords" content="double declining balance depreciation formula explained, calculating DDB annual expense, accelerated depreciation method, depreciation rate DDB, salvage value accounting, financial reporting tax strategy" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-11" /> 
    <meta itemProp="url" content="/definitive-double-declining-depreciation-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Double-Declining Balance Depreciation: The Accelerated Cost Method</h1>
    <p className="text-lg italic text-gray-700">Master the accounting method that allocates a larger portion of an asset's cost to its early years of service.</p>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">DDB: Core Concept and Accelerated Principle</a></li>
        <li><a href="#formula" className="hover:underline">The Double-Declining Balance (DDB) Formula</a></li>
        <li><a href="#book-value" className="hover:underline">Calculating Annual Expense and Book Value</a></li>
        <li><a href="#vs-straight" className="hover:underline">DDB vs. Straight-Line Comparison</a></li>
        <li><a href="#applications" className="hover:underline">Application in Financial and Tax Reporting</a></li>
    </ul>
<hr />

    {/* DDB: CORE CONCEPT AND ACCELERATED PRINCIPLE */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">DDB: Core Concept and Accelerated Principle</h2>
    <p>The **Double-Declining Balance (DDB)** method is an **accelerated depreciation** technique. It recognizes that many assets (like high-tech machinery or vehicles) lose most of their economic value and provide the most service in their early years. Therefore, DDB allocates a significantly larger depreciation expense to the initial years of the asset's useful life and a smaller expense to the later years.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Matching Principle</h3>
    <p>DDB adheres to the **matching principle** by reflecting the higher expense when the asset is most productive (early years) and a lower expense when it is less productive (later years). This provides a more accurate representation of the asset's true economic consumption over time.</p>

<hr />

    {/* THE DOUBLE-DECLINING BALANCE (DDB) FORMULA */}
    <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Double-Declining Balance (DDB) Formula</h2>
    <p>The DDB method achieves acceleration by first calculating the straight-line rate, doubling it, and then applying that double rate to the asset's declining book value each year.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
    <p>The annual depreciation expense is calculated as:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-500 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Annual Depreciation = Beginning Book Value * DDB Rate'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Calculating the DDB Rate</h3>
    <p>The **DDB Rate** is the fixed rate used in the formula, calculated as twice the straight-line rate:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-500 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'DDB Rate = (1 / Useful Life in Years) * 2'}
        </p>
    </div>
    <p>For example, an asset with a 5-year life has a straight-line rate of $1/5 = 20\%$. The DDB rate is $40\%$.</p>

<hr />

    {/* CALCULATING ANNUAL EXPENSE AND BOOK VALUE */}
    <h2 id="book-value" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating Annual Expense and Book Value</h2>
    <p>Unlike the straight-line method, the depreciation expense under DDB changes every year because the rate is applied to a decreasing base.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Declining Book Value</h3>
    <p>The **Beginning Book Value** for any year is the original Asset Cost minus the **Accumulated Depreciation** recorded up to the end of the prior year. This book value serves as the base to which the fixed DDB rate is applied.</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-500 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Ending Book Value = Beginning Book Value - Annual Depreciation'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Handling Salvage Value (The Stop Point)</h3>
    <p>A crucial rule of DDB is that the asset **cannot be depreciated below its salvage value**. The DDB formula does *not* subtract the salvage value from the cost base at the beginning. However, the depreciation expense must stop accruing when the asset's Net Book Value reaches the Salvage Value. The final year's expense is often a "plug" figure to achieve this endpoint.</p>

<hr />

    {/* DDB VS. STRAIGHT-LINE COMPARISON */}
    <h2 id="vs-straight" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">DDB vs. Straight-Line Comparison</h2>
    <p>While both methods expense the same total amount over the asset's life, the timing of the expense differs dramatically, impacting net income and taxes.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Timeline of Expense</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Straight-Line:</strong> Constant, uniform expense every year.</li>
        <li><strong className="font-semibold">DDB:</strong> High expense in the early years; low expense in the later years.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Switchover Point</h3>
    <p>It is common practice for companies to switch from the DDB method to the Straight-Line method when the straight-line expense (calculated on the remaining depreciable base) becomes greater than the DDB expense. This switch is made to maximize the annual depreciation deduction for tax purposes.</p>

<hr />

    {/* APPLICATION IN FINANCIAL AND TAX REPORTING */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Application in Financial and Tax Reporting</h2>
    <p>The choice of depreciation method is a strategic decision that affects both the company's reported profitability and its tax liability.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Financial Reporting (GAAP/IFRS)</h3>
    <p>Companies choose the method that best reflects the asset's pattern of economic use. DDB is appropriate for assets that become obsolete quickly (e.g., computers) or require more maintenance later in their life.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Tax Reporting (Tax Shield)</h3>
    <p>Accelerated methods like DDB are typically favored for **tax reporting** because a higher depreciation expense in the early years reduces taxable income immediately. This creates a **tax shield**, effectively deferring tax payments to later years and improving the company's present value of cash flow.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The **Double-Declining Balance (DDB)** method is the primary form of **accelerated depreciation**, calculated by applying a doubled straight-line rate to the asset's declining book value each year.</p>
    <p>DDB is a strategic accounting choice designed to front-load expenses, matching higher costs to the asset's higher productivity in its early life. It is commonly used for tax advantages, as it provides a higher **tax shield** in the present by lowering current taxable income.</p>
</section>

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
