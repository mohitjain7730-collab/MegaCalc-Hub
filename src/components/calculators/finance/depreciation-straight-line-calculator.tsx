
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Complete Guide to Straight-Line Depreciation
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
