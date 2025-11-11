
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
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to MACRS Depreciation: Calculation, Methods, and Tax Reporting (Modified Accelerated Cost Recovery System)" />
    <meta itemProp="description" content="An expert guide detailing the MACRS depreciation system, covering its two methods (GDS and ADS), asset class recovery periods (3-year to 39-year), mid-year and mid-quarter conventions, and its mandatory use for U.S. federal income tax purposes." />
    <meta itemProp="keywords" content="macrs depreciation formula explained, calculating GDS and ADS, modified accelerated cost recovery system, mid-year convention tax, asset class recovery periods macrs, tax depreciation accounting" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-12" /> 
    <meta itemProp="url" content="/definitive-macrs-depreciation-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to MACRS Depreciation: The Mandatory U.S. Tax Method</h1>
    <p className="text-lg italic text-gray-700">Master the specialized system used for calculating tax-deductible depreciation, driving corporate tax shields and present value of cash flow.</p>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">MACRS: Core Concept and Tax Purpose</a></li>
        <li><a href="#gds-ads" className="hover:underline">The Two Systems: GDS vs. ADS</a></li>
        <li><a href="#conventions" className="hover:underline">Time Conventions: Mid-Year, Mid-Quarter, and Mid-Month</a></li>
        <li><a href="#property" className="hover:underline">Asset Classes and Recovery Periods</a></li>
        <li><a href="#tax-impact" className="hover:underline">Tax Impact and Comparison with Book Depreciation</a></li>
    </ul>
<hr />

    {/* MACRS: CORE CONCEPT AND TAX PURPOSE */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">MACRS: Core Concept and Tax Purpose</h2>
    <p>The **Modified Accelerated Cost Recovery System (MACRS)** is the depreciation system mandated by the U.S. Internal Revenue Service (IRS) for nearly all tangible property placed in service after 1986. Unlike financial accounting (GAAP/IFRS), which aims for accurate income reporting, MACRS's primary goal is to provide a standardized method for calculating **tax deductions**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Mandatory for Tax Reporting</h3>
    <p>A business must use MACRS to calculate the depreciation expense it claims on its federal income tax returns. It is characterized by three key differences from financial accounting:</p>
    <ol className="list-decimal ml-6 space-y-2">
        <li>It uses **fixed recovery periods** (useful lives), often shorter than the asset's actual economic life.</li>
        <li>It ignores **salvage value**, assuming it is zero.</li>
        <li>It uses **accelerated methods** by default (e.g., Double-Declining Balance).</li>
    </ol>

<hr />

    {/* THE TWO SYSTEMS: GDS VS. ADS */}
    <h2 id="gds-ads" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Two Systems: GDS vs. ADS</h2>
    <p>MACRS has two distinct systems: the **General Depreciation System (GDS)** and the **Alternative Depreciation System (ADS)**. GDS is generally used to maximize tax savings.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">General Depreciation System (GDS)</h3>
    <p>GDS is the standard, primary system. It uses **accelerated methods** (usually $200\%$ or $150\%$ declining balance) and **shorter recovery periods** (e.g., 5-year and 7-year life classes). GDS maximizes the depreciation deduction in the early years of the asset's life, creating a valuable **tax shield** by deferring tax payments to later periods.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Alternative Depreciation System (ADS)</h3>
    <p>ADS is the mandatory system for specific assets (e.g., property used outside the U.S.) and is optional for others. ADS uses the **straight-line method** and generally **longer recovery periods** than GDS. Because it is slower, ADS results in lower early-year deductions and less present value benefit, making it less favorable for tax reduction.</p>

<hr />

    {/* TIME CONVENTIONS: MID-YEAR, MID-QUARTER, AND MID-MONTH */}
    <h2 id="conventions" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Time Conventions: Mid-Year, Mid-Quarter, and Mid-Month</h2>
    <p>MACRS requires the use of time conventions to determine how much depreciation can be claimed in the year the asset is placed in service and the year it is retired. These conventions simplify the calculation by assuming a single date of use.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Mid-Year Convention</h3>
    <p>This is the most common convention. It assumes all property is placed in service or retired exactly at the **midpoint of the tax year** (July 1st). This means only half of the first and last year's full depreciation expense is claimed, regardless of the actual date of purchase.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Mid-Quarter Convention</h3>
    <p>This convention must be used if **more than 40%** of the total depreciable basis of all property acquired during the year is placed in service during the **last three months (the fourth quarter)**. This prevents companies from buying assets late in the year and claiming a full half-year deduction under the Mid-Year Convention.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Mid-Month Convention</h3>
    <p>This convention is mandatory for **non-residential and residential rental real property**. It assumes that property is placed in service or retired at the midpoint of the month it was acquired, requiring a more precise calculation for the first and last year's depreciation.</p>

<hr />

    {/* ASSET CLASSES AND RECOVERY PERIODS */}
    <h2 id="property" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Asset Classes and Recovery Periods</h2>
    <p>MACRS defines specific asset classes, which determine the useful life (recovery period) that must be used for tax reporting. These periods are often much shorter than the asset's actual physical life to encourage capital investment.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Common GDS Recovery Periods</h3>
    <table className="min-w-full divide-y divide-gray-200 border border-gray-300 my-4">
        <thead className="bg-gray-50">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recovery Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MACRS Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Typical Assets</th>
            </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            <tr>
                <td className="px-6 py-4 whitespace-nowrap"><strong className="font-semibold">3-Year</strong></td>
                <td className="px-6 py-4 whitespace-nowrap">200% DB</td>
                <td className="px-6 py-4 whitespace-nowrap">Tools, Manufacturing Dies, Tractor Units</td>
            </tr>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap"><strong className="font-semibold">5-Year</strong></td>
                <td className="px-6 py-4 whitespace-nowrap">200% DB</td>
                <td className="px-6 py-4 whitespace-nowrap">Computers, Office Equipment, Cars, Trucks</td>
            </tr>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap"><strong className="font-semibold">7-Year</strong></td>
                <td className="px-6 py-4 whitespace-nowrap">200% DB</td>
                <td className="px-6 py-4 whitespace-nowrap">Office Furniture, Fixtures, Manufacturing Machinery</td>
            </tr>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap"><strong className="font-semibold">27.5-Year</strong></td>
                <td className="px-6 py-4 whitespace-nowrap">Straight-Line</td>
                <td className="px-6 py-4 whitespace-nowrap">Residential Rental Real Estate</td>
            </tr>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap"><strong className="font-semibold">39-Year</strong></td>
                <td className="px-6 py-4 whitespace-nowrap">Straight-Line</td>
                <td className="px-6 py-4 whitespace-nowrap">Non-Residential Real Estate (Commercial Buildings)</td>
            </tr>
        </tbody>
    </table>

<hr />

    {/* TAX IMPACT AND COMPARISON WITH BOOK DEPRECIATION */}
    <h2 id="tax-impact" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Tax Impact and Comparison with Book Depreciation</h2>
    <p>Because MACRS uses accelerated methods and shorter lives than GAAP, a company's depreciation expense for tax purposes is usually higher than its depreciation expense for financial reporting (book) purposes.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Tax Shield</h3>
    <p>The higher tax depreciation expense calculated under GDS results in a lower taxable income, providing an immediate **tax shield**—a reduction in current cash taxes paid. This improved cash flow is the primary financial incentive for using accelerated MACRS methods.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Deferred Tax Liability (Book-Tax Difference)</h3>
    <p>This difference between high tax depreciation and lower book depreciation is reconciled on the balance sheet as a **Deferred Tax Liability**. This liability represents the future taxes that the company will eventually have to pay once the tax depreciation expense falls below the book depreciation expense in the later years of the asset's life.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>MACRS is the mandatory U.S. tax depreciation system, characterized by **accelerated methods** (GDS) and **fixed recovery periods**. Its calculations must rigorously adhere to specific time conventions (Mid-Year or Mid-Quarter).</p>
    <p>The primary financial benefit of MACRS is the creation of a **tax shield** by front-loading deductions, which improves the present value of the firm's cash flows. This system highlights the crucial distinction between book accounting (reflecting economic reality) and tax accounting (optimizing liability).</p>
</section>

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
