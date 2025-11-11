
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
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinancialCalculator">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Overhead Rate Allocation: Calculation, Absorption, and Cost Accounting" />
    <meta itemProp="description" content="An expert guide detailing the Overhead Rate Allocation formula, its core role in product costing, determining the basis for allocation (direct labor, machine hours), and its importance for accurate profitability and pricing decisions." />
    <meta itemProp="keywords" content="overhead rate calculation formula, absorption costing explained, predetermined overhead rate, cost allocation base, activity-based costing ABC, overhead absorption rate, product cost analysis" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-12" /> 
    <meta itemProp="url" content="/definitive-overhead-rate-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to the Overhead Rate: Calculating and Allocating Indirect Costs</h1>
    <p className="text-lg italic text-gray-700">Master the fundamental cost accounting metric used to assign factory-wide indirect expenses to specific products or services.</p>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">Overhead: Definition and Necessity of Allocation</a></li>
        <li><a href="#predetermined-rate" className="hover:underline">The Predetermined Overhead Rate Formula</a></li>
        <li><a href="#allocation-base" className="hover:underline">Selecting the Allocation Base (Cost Driver)</a></li>
        <li><a href="#absorption" className="hover:underline">Overhead Absorption and Product Costing</a></li>
        <li><a href="#vs-abc" className="hover:underline">Activity-Based Costing (ABC) vs. Traditional Allocation</a></li>
    </ul>
<hr />

    {/* OVERHEAD: DEFINITION AND NECESSITY OF ALLOCATION */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overhead: Definition and Necessity of Allocation</h2>
    <p>**Overhead** refers to all indirect costs associated with running a business, particularly manufacturing a product. These costs cannot be directly traced to a specific unit of output (unlike direct labor or direct materials) but are essential for production.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Examples of Overhead Costs</h3>
    <p>Overhead costs include:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>Factory rent and property taxes.</li>
        <li>Utilities (electricity, gas) for the plant.</li>
        <li>Supervisory salaries and maintenance wages.</li>
        <li>Depreciation of factory equipment.</li>
    </ul>
    <p>For accurate inventory valuation and pricing decisions (cost accounting), these indirect costs must be systematically assigned (allocated) to every product unit manufactured during the period. Failure to allocate overhead leads to understating the true cost of inventory.</p>

<hr />

    {/* THE PREDETERMINED OVERHEAD RATE FORMULA */}
    <h2 id="predetermined-rate" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Predetermined Overhead Rate Formula</h2>
    <p>Companies typically use a **Predetermined Overhead Rate (POHR)** to allocate costs. This rate is calculated *before* the start of the fiscal period to allow management to set prices and estimate costs throughout the year without waiting for final, actual overhead figures.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
    <p>The POHR is calculated by dividing the estimated total overhead costs for the coming year by the estimated total volume of the chosen allocation base (cost driver):</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-500 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'POHR = Estimated Total Overhead Cost / Estimated Total Volume of Allocation Base'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Applying the Rate (Costing)</h3>
    <p>Once the POHR is established (e.g., 20 dollars per machine hour), it is applied to each job or product unit based on how much of the allocation base that unit consumes:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-500 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Overhead Applied = POHR * Actual Amount of Allocation Base Used'}
        </p>
    </div>

<hr />

    {/* SELECTING THE ALLOCATION BASE (COST DRIVER) */}
    <h2 id="allocation-base" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Selecting the Allocation Base (Cost Driver)</h2>
    <p>The **Allocation Base** (or Cost Driver) is the factor that most closely correlates with the incurrence of overhead costs. Choosing the correct base is crucial for ensuring the allocated overhead is fair and accurate.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Common Cost Drivers</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Direct Labor Hours (DLH):</strong> Used when human labor is the primary source of complexity and time. Overhead costs like supervision and indirect labor correlate well with DLH.</li>
        <li><strong className="font-semibold">Machine Hours (MH):</strong> Used when production is highly automated. Overhead costs like equipment depreciation, maintenance, and utilities correlate better with machine time.</li>
        <li><strong className="font-semibold">Direct Material Dollars:</strong> Less common, used in processes where material handling and purchasing overhead is high.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Causation Principle</h3>
    <p>The best allocation base is the one that demonstrates a **cause-and-effect relationship** with the overhead costs. If machine time causes higher maintenance and electricity costs, machine hours should be the cost driver. Using an irrelevant base (e.g., allocating machine maintenance based on direct labor hours) leads to inaccurate product costing and skewed pricing decisions.</p>

<hr />

    {/* OVERHEAD ABSORPTION AND PRODUCT COSTING */}
    <h2 id="absorption" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overhead Absorption and Product Costing</h2>
    <p>**Overhead Absorption** is the process of applying the estimated overhead costs to the work in process (WIP) inventory, becoming part of the final inventory cost on the Balance Sheet.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Full Product Cost</h3>
    <p>The total manufacturing cost assigned to a unit of inventory is the sum of all three cost components:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-500 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Total Product Cost = Direct Materials + Direct Labor + Applied Overhead'}
        </p>
    </div>
    <p>This full cost is used for calculating the cost of goods sold (COGS) on the Income Statement and setting the minimum acceptable selling price for products.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Under- or Over-Applied Overhead</h3>
    <p>Because the POHR is based on estimates, the total overhead applied to inventory during the year rarely matches the total **actual overhead costs** incurred. This difference is called the under- or over-applied overhead. This discrepancy must be adjusted at the end of the period, usually by adjusting the COGS figure.</p>

<hr />

    {/* ACTIVITY-BASED COSTING (ABC) VS. TRADITIONAL ALLOCATION */}
    <h2 id="vs-abc" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Activity-Based Costing (ABC) vs. Traditional Allocation</h2>
    <p>The POHR method (traditional costing) is simple but often inaccurate for complex environments. **Activity-Based Costing (ABC)** offers a more precise, multi-driver approach.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Traditional Costing Flaw (Single Rate)</h3>
    <p>The traditional method often uses a single, plant-wide POHR. This assumes that all products consume overhead resources at the same rate, which is false in modern, diverse manufacturing facilities (e.g., a simple product may require few setups, while a custom product requires many setups and inspections).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">ABC Methodology (Multiple Drivers)</h3>
    <p>ABC refines allocation by assigning costs based on the specific activities that consume overhead (e.g., machine setup, quality inspection, engineering design). ABC uses a separate rate and base for each activity, providing highly accurate product costs, particularly for low-volume, complex products that consume disproportionate overhead.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The **Predetermined Overhead Rate (POHR)** is the essential cost accounting tool used to assign all indirect manufacturing expenses to product inventory. It is calculated by dividing estimated total overhead costs by the chosen **allocation base** (cost driver).</p>
    <p>Accurate overhead allocation is vital for determining the true **Total Product Cost**, ensuring correct inventory valuation, and setting profitable sales prices. While the traditional single-rate system is simple, sophisticated firms often rely on **Activity-Based Costing (ABC)** for greater precision in complex production environments.</p>
</section>

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
