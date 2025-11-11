
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, Calculator, Info, TrendingUp, FileText, Building2 } from 'lucide-react';

const formSchema = z.object({
  assetCost: z.number().positive(),
  salvageValue: z.number().nonnegative(),
  usefulLife: z.number().int().positive(),
}).refine(data => data.assetCost > data.salvageValue, {
  message: "Asset cost must be greater than salvage value.",
  path: ['salvageValue'],
});

type FormValues = z.infer<typeof formSchema>;

export default function DepreciationStraightLineCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetCost: undefined,
      salvageValue: undefined,
      usefulLife: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const annualDepreciation = (values.assetCost - values.salvageValue) / values.usefulLife;
    setResult(annualDepreciation);
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Straight-Line Depreciation Calculator
          </CardTitle>
          <CardDescription>
            Calculate asset depreciation evenly over its useful life
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
              <Button type="submit" className="w-full md:w-auto">Calculate Depreciation</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result !== null && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Landmark className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Annual Depreciation Expense</CardTitle>
                <CardDescription>Depreciation amount to record each year</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8 bg-primary/5 rounded-lg">
              <p className="text-4xl font-bold text-primary mb-2">
                ${result.toFixed(2)}
              </p>
              <p className="text-muted-foreground">
                This is the amount of depreciation expense to record each year using the straight-line method.
              </p>
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
                The original purchase price of the asset plus any costs required to get it ready for its intended use (e.g., shipping, installation, delivery charges). This is also known as the initial cost basis of the asset.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Salvage Value</h4>
              <p className="text-muted-foreground">
                The estimated residual value of an asset at the end of its useful life. It's what the company expects to sell it for, also called residual value or scrap value. The asset cannot be depreciated below this value.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Useful Life</h4>
              <p className="text-muted-foreground">
                The estimated period over which the asset is expected to be used by the company. This can be based on manufacturer specifications, industry standards, or the company's experience with similar assets. Useful life is measured in years.
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
                  <a href="/category/finance/depreciation-double-declining-calculator" className="text-primary hover:underline">
                    Depreciation (Double Declining) Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate accelerated depreciation using the double declining balance method.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/depreciation-sum-of-years-digits-calculator" className="text-primary hover:underline">
                    Depreciation (Sum-of-Years) Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate accelerated depreciation using the sum-of-the-years-digits method.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/macrs-depreciation-calculator" className="text-primary hover:underline">
                    MACRS Depreciation Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate tax-deductible depreciation for US tax purposes using MACRS.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/overhead-rate-allocation-calculator" className="text-primary hover:underline">
                    Overhead Rate Allocation Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Establish a predetermined overhead rate for cost allocation purposes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Straight-Line Depreciation: Calculation, Formula, and Accounting Method" />
    <meta itemProp="description" content="An expert guide detailing the Straight-Line Depreciation formula, its role as the simplest method for allocating asset cost over its useful life, how to calculate annual expense, salvage value, and its impact on financial statements." />
    <meta itemProp="keywords" content="straight line depreciation formula explained, calculating annual depreciation expense, useful life asset accounting, salvage value definition, depreciation methods comparison, financial reporting accounting" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-12" /> 
    <meta itemProp="url" content="/definitive-straight-line-depreciation-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Straight-Line Depreciation: The Simplest Method for Asset Allocation</h1>
    <p className="text-lg italic text-gray-700">Master the fundamental accounting method used to systematically expense the cost of a tangible asset over its useful life.</p>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">Depreciation: Core Concept and Purpose</a></li>
        <li><a href="#formula" className="hover:underline">The Straight-Line Depreciation Formula</a></li>
        <li><a href="#components" className="hover:underline">Key Components: Cost, Life, and Salvage Value</a></li>
        <li><a href="#book-value" className="hover:underline">Calculating Accumulated Depreciation and Book Value</a></li>
        <li><a href="#vs-accelerated" className="hover:underline">Straight-Line vs. Accelerated Depreciation</a></li>
    </ul>
<hr />

    {/* DEPRECIATION: CORE CONCEPT AND PURPOSE */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Depreciation: Core Concept and Purpose</h2>
    <p>**Depreciation** is an accounting concept used to allocate the cost of a tangible asset (such as machinery, vehicles, or buildings) over its useful economic life. It is the process of matching the asset's expense to the revenue it helps generate (the **matching principle**).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Non-Cash Expense</h3>
    <p>Depreciation is a **non-cash expense**. It is an accounting entry that reduces net income but does not involve an actual outflow of cash in the current period. The cash outflow occurred when the asset was originally purchased.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Straight-Line Principle</h3>
    <p>The **Straight-Line Method** is the simplest and most common form of depreciation. It assumes that the asset provides an equal amount of economic benefit or useful service in each year of its life. Therefore, the expense recorded each year is constant.</p>

<hr />

    {/* THE STRAIGHT-LINE DEPRECIATION FORMULA */}
    <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Straight-Line Depreciation Formula</h2>
    <p>The Straight-Line Method calculates the constant annual depreciation expense by determining the total depreciable cost and spreading it evenly over the useful life.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Annual Expense Identity</h3>
    <p>The annual depreciation expense is calculated as:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-500 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Annual Depreciation = (Asset Cost - Salvage Value) / Useful Life (in Years)'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Depreciable Base</h3>
    <p>The **Depreciable Base** is the total cost that will be expensed over the asset's life. It is calculated by subtracting the **Salvage Value** (residual value) from the original **Asset Cost**.</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-500 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Depreciable Base = Asset Cost - Salvage Value'}
        </p>
    </div>

<hr />

    {/* KEY COMPONENTS: COST, LIFE, AND SALVAGE VALUE */}
    <h2 id="components" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Components: Cost, Life, and Salvage Value</h2>
    <p>The three variables used in the formula are determined at the time the asset is placed into service.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Asset Cost</h3>
    <p>The cost includes the purchase price plus all necessary costs incurred to get the asset ready for its intended use. This includes installation costs, transportation fees, and testing fees. These initial expenses are capitalized (added to the asset's cost) rather than immediately expensed.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Useful Life</h3>
    <p>The **Useful Life** is the period over which the company expects to use the asset. This is an estimate based on management's experience, not necessarily the asset's physical life. It is measured in years, but can also be measured in units of production or usage hours.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Salvage Value (Residual Value)</h3>
    <p>The **Salvage Value** (or Residual Value) is the estimated net realizable value of the asset at the end of its useful life. This is the amount the company expects to sell the asset for when it is retired. If the asset is expected to be scrapped or have no residual value, the salvage value is zero.</p>

<hr />

    {/* CALCULATING ACCUMULATED DEPRECIATION AND BOOK VALUE */}
    <h2 id="book-value" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating Accumulated Depreciation and Book Value</h2>
    <p>Depreciation expense is tracked over time, creating two key figures on the Balance Sheet: Accumulated Depreciation and Net Book Value.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Accumulated Depreciation</h3>
    <p>**Accumulated Depreciation** is the cumulative total of all depreciation expense recorded from the time the asset was acquired up to the present balance sheet date. It is a contra-asset account, meaning it is tracked on the asset side of the Balance Sheet but carries a negative balance.</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-500 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Accumulated Depreciation = Annual Depreciation * Number of Years Used'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Net Book Value</h3>
    <p>The **Net Book Value** is the current worth of the asset according to the company's accounting records. It is the original cost of the asset minus the accumulated depreciation.</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-500 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Net Book Value = Asset Cost - Accumulated Depreciation'}
        </p>
    </div>
    <p>When the asset is fully depreciated (at the end of its useful life), its Net Book Value will equal its Salvage Value.</p>

<hr />

    {/* STRAIGHT-LINE VS. ACCELERATED DEPRECIATION */}
    <h2 id="vs-accelerated" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Straight-Line vs. Accelerated Depreciation</h2>
    <p>While the Straight-Line Method is the simplest, other methods, collectively known as **Accelerated Depreciation**, shift a larger portion of the expense to the early years of the asset's life.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Accelerated Methods (e.g., Double Declining Balance)</h3>
    <p>Accelerated methods assume the asset is more productive or loses more value in its early years. These methods record a **higher depreciation expense** initially and a lower expense later. This is often preferred for tax reporting (reducing taxable income sooner) but can be misleading for financial reporting.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Comparison of Impact</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Straight-Line:** Provides a smoother, more stable representation of profitability, preferred for financial statements (GAAP/IFRS).</li>
        <li>**Accelerated:** Provides faster tax deductions but results in lower reported net income in the early years.</li>
    </ul>
    <p>Over the full useful life of the asset, the total amount of depreciation expense recorded is identical across all methods; only the timing of the expense allocation differs.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The **Straight-Line Depreciation** method is the simplest accounting standard, calculating a constant annual expense by dividing the **Depreciable Base** (Cost minus Salvage Value) by the **Useful Life**.</p>
    <p>Its primary purpose is to systematically match the asset's cost to the revenue it generates. Tracking this expense is vital for calculating the asset's current **Net Book Value** and for providing a stable, predictable representation of profitability on the Income Statement.</p>
</section>
        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about straight-line depreciation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is straight-line depreciation?</h4>
              <p className="text-muted-foreground">
                Straight-line depreciation is the simplest method of calculating depreciation expense. It allocates the cost of an asset evenly over its useful life by dividing the depreciable base (asset cost minus salvage value) by the number of years in the asset's useful life. This results in the same depreciation expense each year.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I calculate straight-line depreciation?</h4>
              <p className="text-muted-foreground">
                The formula is: Annual Depreciation = (Asset Cost - Salvage Value) / Useful Life. For example, a $100,000 asset with a $10,000 salvage value and a 10-year useful life would have annual depreciation of $9,000. This amount is expensed each year on the income statement and reduces the asset's book value on the balance sheet.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What assets can use straight-line depreciation?</h4>
              <p className="text-muted-foreground">
                Straight-line depreciation can be used for most fixed assets including buildings, vehicles, machinery, equipment, furniture, and intangible assets like patents and copyrights. It's the most common method for book accounting purposes and is required for some asset types or preferred by companies seeking consistent expense recognition.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Why is straight-line depreciation popular?</h4>
              <p className="text-muted-foreground">
                Straight-line depreciation is popular because it's simple to understand and calculate, provides consistent expense recognition, makes financial planning easier with predictable annual expenses, reduces complexity in financial statements, and is often required or preferred for certain types of financial reporting.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between straight-line and accelerated depreciation?</h4>
              <p className="text-muted-foreground">
                Straight-line allocates depreciation evenly each year, while accelerated methods like double declining balance or sum-of-years digits allocate more depreciation in the early years. Accelerated methods better match actual asset usage for assets that deteriorate faster initially, but straight-line is simpler and provides more stable reported earnings.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I change the salvage value or useful life later?</h4>
              <p className="text-muted-foreground">
                Yes, changes in salvage value or useful life can be made if conditions change significantly. When such changes occur, the remaining book value is depreciated over the revised remaining useful life. These changes should be supported by documentation and applied prospectively, not retrospectively.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does straight-line depreciation affect taxes?</h4>
              <p className="text-muted-foreground">
                For tax purposes, straight-line depreciation may be different from book depreciation. Many tax systems allow different useful lives, depreciation methods, or special deductions like Section 179 or bonus depreciation. For US taxes, MACRS is commonly required, which differs from straight-line accounting depreciation.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What happens if an asset is sold before its useful life ends?</h4>
              <p className="text-muted-foreground">
                When an asset is sold before the end of its useful life, you calculate the remaining book value (original cost minus accumulated depreciation) and compare it to the sale proceeds. If sold for more than book value, you have a gain; if sold for less, you have a loss. Both are recognized on the income statement.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Does straight-line depreciation reflect actual asset value?</h4>
              <p className="text-muted-foreground">
                No, straight-line depreciation is an accounting convention that allocates cost systematically, not a reflection of actual market value changes. An asset's market value may decline faster or slower than straight-line depreciation suggests. Depreciation is about cost allocation, not valuation.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What is partial year depreciation?</h4>
              <p className="text-muted-foreground">
                Partial year depreciation applies when an asset is purchased mid-year. You prorate the annual depreciation based on how many months the asset was used. For example, if an asset is purchased in April and has annual depreciation of $12,000, the first year depreciation would be $9,000 (9 months / 12 months × $12,000).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
