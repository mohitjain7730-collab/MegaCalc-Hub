
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Factory, Calculator, Info, TrendingUp, Target, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  totalOverhead: z.number().positive(),
  totalAllocationBase: z.number().positive(),
  allocationBaseUnit: z.string().min(1, "Unit is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function OverheadRateAllocationCalculator() {
  const [result, setResult] = useState<{ rate: number; unit: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalOverhead: undefined,
      totalAllocationBase: undefined,
      allocationBaseUnit: 'machine hours',
    },
  });

  const onSubmit = (values: FormValues) => {
    const rate = values.totalOverhead / values.totalAllocationBase;
    setResult({ rate, unit: values.allocationBaseUnit });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculate Overhead Rate
          </CardTitle>
          <CardDescription>
            Establish a predetermined overhead rate to apply indirect manufacturing costs to products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="totalOverhead" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Factory className="h-4 w-4" />
                      Total Estimated Overhead Costs ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 50000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="totalAllocationBase" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Total Estimated Allocation Base
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 2000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="allocationBaseUnit" render={({ field }) => (
                  <FormItem className='md:col-span-2'>
                    <FormLabel className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Unit for Allocation Base
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., machine hours, direct labor hours" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Overhead Rate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Factory className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Predetermined Overhead Rate</CardTitle>
                <CardDescription>Use this rate to apply overhead costs to products or jobs</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8 bg-primary/5 rounded-lg">
              <p className="text-4xl font-bold text-primary mb-2">
                ${result.rate.toFixed(2)} per {result.unit}
              </p>
              <p className="text-muted-foreground">
                This rate should be used to apply overhead costs to products or jobs based on their consumption of the allocation base.
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
              <h4 className="font-semibold text-foreground mb-2">Total Estimated Overhead Costs</h4>
              <p className="text-muted-foreground">
                The sum of all indirect costs expected to be incurred in a production process for a given period (e.g., factory rent, utilities, supervisor salaries, maintenance, depreciation). These are costs that cannot be directly traced to a specific product.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Total Estimated Allocation Base</h4>
              <p className="text-muted-foreground">
                The total expected quantity of the activity that drives overhead costs. Common bases include direct labor hours, machine hours, direct labor cost, or direct material cost. Choose the base that has the strongest correlation with overhead costs.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Unit for Allocation Base</h4>
              <p className="text-muted-foreground">
                The unit of measure for your allocation base (e.g., "hours", "dollars", "units"). This helps clarify how the overhead rate will be applied.
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
              Explore other financial and business calculators for comprehensive cost management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/activity-based-costing-calculator" className="text-primary hover:underline">
                    Activity-Based Costing Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Allocate overhead costs more accurately based on specific activities and cost drivers.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/business-startup/break-even-point-calculator" className="text-primary hover:underline">
                    Break-Even Point Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate the sales volume needed to cover all fixed and variable costs.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/business-startup/contribution-margin-calculator" className="text-primary hover:underline">
                    Contribution Margin Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Determine the revenue left over after covering variable costs per unit.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/business-startup/customer-acquisition-cost-calculator" className="text-primary hover:underline">
                    Customer Acquisition Cost Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Measure the cost of acquiring one paying customer to optimize marketing spend.
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
              Complete Guide to Overhead Rate Allocation
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
              Common questions about overhead rate allocation and cost accounting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is a predetermined overhead rate?</h4>
              <p className="text-muted-foreground">
                A predetermined overhead rate is an estimated rate used to apply manufacturing overhead costs to products or jobs. It's calculated at the beginning of the period using estimated overhead costs and estimated activity levels. This allows companies to assign overhead costs as products are being produced rather than waiting until the end of the period.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Why use a predetermined overhead rate instead of actual overhead?</h4>
              <p className="text-muted-foreground">
                Using predetermined rates allows for timely product costing during the period, better job cost tracking, and more accurate pricing decisions. Waiting for actual overhead at the end of the period would delay product costing and decision-making. The difference between applied and actual overhead is recorded and allocated at period-end.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I choose the best allocation base?</h4>
              <p className="text-muted-foreground">
                The best allocation base is one that has a strong correlation with overhead costs. Machine hours work well when overhead is primarily driven by machine usage. Direct labor hours are appropriate when overhead is labor-intensive. Consider your production process and which cost driver most accurately represents the consumption of overhead resources.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What happens if actual overhead differs from applied overhead?</h4>
              <p className="text-muted-foreground">
                At the end of the period, the difference between actual and applied overhead is called underapplied (if actual > applied) or overapplied (if applied > actual) overhead. This variance can be allocated to cost of goods sold and inventory accounts, or closed directly to cost of goods sold, depending on the materiality of the amount.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How often should I recalculate the overhead rate?</h4>
              <p className="text-muted-foreground">
                Overhead rates are typically recalculated annually based on budgeted costs and activity levels. However, if there are significant changes in production processes, cost structure, or business conditions during the year, it may be appropriate to revise the rate mid-year for better accuracy.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I use different allocation bases for different cost pools?</h4>
              <p className="text-muted-foreground">
                Yes, this approach is known as activity-based costing (ABC). Different cost pools may use different allocation bases that better reflect their specific cost drivers. For example, quality inspection costs might be allocated based on number of inspections, while machine maintenance might use machine hours.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between plant-wide and department rates?</h4>
              <p className="text-muted-foreground">
                A plant-wide rate uses one single rate for the entire facility. Departmental rates use separate rates for different departments or cost centers, which can provide more accuracy when departments have different overhead structures and cost drivers. Departmental rates are more complex but offer better cost allocation precision.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does overhead rate allocation affect product pricing?</h4>
              <p className="text-muted-foreground">
                The overhead rate directly impacts the cost assigned to each product, which affects pricing decisions. If the rate is too low, products may be underpriced and unprofitable. If too high, products may be overpriced and non-competitive. Accurate overhead allocation ensures prices cover all costs including indirect manufacturing expenses.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What costs should be included in overhead?</h4>
              <p className="text-muted-foreground">
                Manufacturing overhead includes all indirect production costs that cannot be directly traced to specific products, such as factory rent, utilities, depreciation of manufacturing equipment, indirect materials and labor, maintenance, quality control, and production supervision. These costs are necessary for production but not part of direct materials or direct labor.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can overhead rates be used for service businesses?</h4>
              <p className="text-muted-foreground">
                Yes, service businesses can use overhead rates to allocate indirect costs to jobs or clients. Instead of manufacturing overhead, they allocate costs like office rent, administrative salaries, and support functions. The allocation base might be billable hours, service units, or revenue, depending on the nature of the service business.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
