import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FinancePage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/learning-hub">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Learning Hub
            </Link>
          </Button>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Finance Articles
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Essential financial knowledge for smart borrowing and lending decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/learning-hub/finance/what-is-bmi" className="group block h-full"><Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50"><CardHeader><CardTitle className="text-lg">What is BMI? Understanding Body Mass Index</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-sm">Science, formula, history, and medical context of BMI vs other metrics.</p></CardContent></Card></Link>
          <Link href="/learning-hub/finance/how-to-calculate-your-bmi" className="group block h-full"><Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50"><CardHeader><CardTitle className="text-lg">How to Calculate Your BMI: Step by Step Guide</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-sm">Manual calculation, online tools, metric vs imperial, and error tips.</p></CardContent></Card></Link>
          <Link href="/learning-hub/finance/bmi-ranges-meaning" className="group block h-full"><Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50"><CardHeader><CardTitle className="text-lg">BMI Ranges: What Do Your Scores Mean?</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-sm">Adult & youth categories, regional guidelines, and interpretation.</p></CardContent></Card></Link>
          <Link href="/learning-hub/finance/bmi-vs-body-fat-percentage" className="group block h-full"><Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50"><CardHeader><CardTitle className="text-lg">BMI vs. Body Fat Percentage: Key Differences</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-sm">Compare BMI to body fat %, waist-to-hip ratio, and Ponderal Index.</p></CardContent></Card></Link>
          <Link href="/learning-hub/finance/health-risks-of-bmi" className="group block h-full"><Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50"><CardHeader><CardTitle className="text-lg">Health Risks Associated with High or Low BMI</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-sm">Evidence for heart disease, diabetes, cancer, fertility; caveats included.</p></CardContent></Card></Link>
          <Link href="/learning-hub/finance/bmi-and-children" className="group block h-full"><Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50"><CardHeader><CardTitle className="text-lg">BMI and Children: Growth Charts and Percentiles</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-sm">Child/teen BMI, percentile interpretation, and CDC growth charts.</p></CardContent></Card></Link>
          <Link href="/learning-hub/finance/limitations-of-bmi" className="group block h-full"><Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50"><CardHeader><CardTitle className="text-lg">Limitations of BMI: When Is It Inaccurate?</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-sm">Why BMI misleads in athletes, elderly, and across ethnic groups.</p></CardContent></Card></Link>
          <Link href="/learning-hub/finance/how-to-improve-your-bmi" className="group block h-full"><Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50"><CardHeader><CardTitle className="text-lg">How to Improve Your BMI: Healthy Weight Management Tips</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-sm">Evidence-based nutrition, training, sleep, and habit strategies.</p></CardContent></Card></Link>
          <Link href="/learning-hub/finance/bmi-healthcare-policies" className="group block h-full"><Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50"><CardHeader><CardTitle className="text-lg">BMI and Access to Healthcare: Policies & Controversies</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-sm">How BMI influences policy (e.g., IVF eligibility) and ethics.</p></CardContent></Card></Link>
          <Link href="/learning-hub/finance/bmi-and-fitness-goals" className="group block h-full"><Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50"><CardHeader><CardTitle className="text-lg">BMI and Fitness Goals: Tracking Progress Effectively</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-sm">Using BMI among multiple metrics for athletes and gym-goers.</p></CardContent></Card></Link>
          <Link href="/learning-hub/finance/bmi-calculators-accuracy" className="group block h-full"><Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50"><CardHeader><CardTitle className="text-lg">BMI Calculators: Accuracy, Reliability, Best Practices</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-sm">What makes a calculator trustworthy and how to avoid mistakes.</p></CardContent></Card></Link>
          <Link href="/learning-hub/finance/bmi-myths-and-facts" className="group block h-full"><Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50"><CardHeader><CardTitle className="text-lg">Myths and Facts About BMI You Should Know</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-sm">Debunks misconceptions with evidence-based answers.</p></CardContent></Card></Link>
        </div>
      </div>
    </div>
  );
}
