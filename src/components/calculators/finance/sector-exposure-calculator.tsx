'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, PieChart } from 'lucide-react';

const formSchema = z.object({
  positions: z.string().min(1, 'Enter positions data'),
});

type FormValues = z.infer<typeof formSchema>;

function parsePositions(data: string): { name: string; weight: number; sector: string }[] | null {
  try {
    const lines = data.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return null;
    const positions: { name: string; weight: number; sector: string }[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length < 3) continue;
      const weight = parseFloat(parts[1].replace('%', ''));
      if (!Number.isFinite(weight)) continue;
      positions.push({
        name: parts[0],
        weight: Math.abs(weight) > 1 ? weight / 100 : weight,
        sector: parts[2]
      });
    }
    return positions.length > 0 ? positions : null;
  } catch {
    return null;
  }
}

export default function SectorExposureCalculator() {
  const [result, setResult] = useState<{
    sectorAllocations: { sector: string; weight: number; positions: number }[];
    concentrationRisk: number;
    interpretation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { positions: '' }
  });

  const onSubmit = (v: FormValues) => {
    const parsed = parsePositions(v.positions);
    if (!parsed || parsed.length === 0) {
      setResult(null);
      return;
    }
    const sectorMap = new Map<string, { weight: number; positions: number }>();
    for (const pos of parsed) {
      const existing = sectorMap.get(pos.sector) || { weight: 0, positions: 0 };
      sectorMap.set(pos.sector, {
        weight: existing.weight + pos.weight,
        positions: existing.positions + 1
      });
    }
    const sectorAllocations = Array.from(sectorMap.entries())
      .map(([sector, data]) => ({ sector, ...data }))
      .sort((a, b) => b.weight - a.weight);
    const topSectorWeight = sectorAllocations[0]?.weight || 0;
    const concentrationRisk = topSectorWeight > 0.4 ? 100 : topSectorWeight > 0.25 ? 50 : 0;
    const interpretation = `Portfolio has ${sectorAllocations.length} sectors. Top sector: ${sectorAllocations[0]?.sector} (${(sectorAllocations[0]?.weight * 100).toFixed(1)}%). ${concentrationRisk > 50 ? 'High concentration risk—consider diversifying across sectors.' : concentrationRisk > 0 ? 'Moderate concentration—monitor sector weights.' : 'Well-diversified across sectors.'}`;
    setResult({ sectorAllocations, concentrationRisk, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5"/> Sector Exposure Calculator</CardTitle>
          <CardDescription>Calculate portfolio sector allocation and concentration risk from position weights and sector classifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="positions" render={({ field }) => (
                <FormItem>
                  <FormLabel>Positions (CSV: Name, Weight%, Sector)</FormLabel>
                  <FormControl>
                    <Textarea rows={8} placeholder="Name,Weight%,Sector\nApple,25,Technology\nJPMorgan,15,Financials\nExxon,10,Energy" {...field} className="font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Sector allocation and concentration analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.sectorAllocations.slice(0, 6).map((s, i) => (
                <div key={i} className="border rounded-lg p-3">
                  <div className="text-sm font-semibold">{s.sector}</div>
                  <div className="text-2xl font-bold">{(s.weight * 100).toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">{s.positions} position{s.positions !== 1 ? 's' : ''}</div>
                </div>
              ))}
            </div>
            <div className="rounded-md border p-3 bg-muted/50">
              <div className="text-sm font-semibold mb-1">Concentration Risk Score</div>
              <div className="text-2xl font-bold">{result.concentrationRisk}/100</div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Portfolio analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/portfolio-correlation-heatmap-tool" className="text-primary hover:underline">Portfolio Correlation Heatmap</a></h4><p className="text-sm text-muted-foreground">Asset correlation analysis.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/style-drift-analyzer" className="text-primary hover:underline">Style Drift Analyzer</a></h4><p className="text-sm text-muted-foreground">Factor exposure tracking.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/mean-variance-optimization-calculator" className="text-primary hover:underline">Mean‑Variance Optimization</a></h4><p className="text-sm text-muted-foreground">Efficient allocations.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/tangency-portfolio-calculator" className="text-primary hover:underline">Tangency Portfolio</a></h4><p className="text-sm text-muted-foreground">Max Sharpe mix.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Understanding sector exposure and concentration risk</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Enter positions as CSV with Name, Weight%, and Sector. Weights can be percentages (25) or decimals (0.25).</li>
            <li>Sector exposure shows how your portfolio is allocated across economic sectors (Technology, Financials, Healthcare, etc.).</li>
            <li>High concentration in one sector (e.g., &gt;40%) increases sector-specific risk and reduces diversification benefits.</li>
            <li>Monitor sector weights regularly and rebalance if concentration exceeds your risk tolerance or policy limits.</li>
            <li>Consider sector correlations—some sectors move together during market cycles, reducing effective diversification.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Sector exposure, concentration risk, and portfolio diversification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is sector exposure?</h4><p className="text-muted-foreground">Sector exposure measures how much of your portfolio is allocated to different economic sectors (Technology, Financials, Energy, Healthcare, etc.).</p></div>
          <div><h4 className="font-semibold mb-2">Why does sector concentration matter?</h4><p className="text-muted-foreground">High concentration in one sector increases vulnerability to sector-specific risks, economic cycles, and regulatory changes, reducing diversification benefits.</p></div>
          <div><h4 className="font-semibold mb-2">What is an acceptable sector concentration?</h4><p className="text-muted-foreground">It depends on your risk tolerance. Generally, no single sector should exceed 25–30% of the portfolio. For institutional portfolios, policy limits are often stricter.</p></div>
          <div><h4 className="font-semibold mb-2">How do I reduce sector concentration?</h4><p className="text-muted-foreground">Rebalance by reducing positions in overweight sectors and increasing exposure to underweight sectors. Consider sector ETFs for efficient rebalancing.</p></div>
          <div><h4 className="font-semibold mb-2">Should I weight sectors equally?</h4><p className="text-muted-foreground">Not necessarily. Equal weighting may not align with market capitalization or your investment views. Consider market weights or strategic tilts based on your outlook.</p></div>
          <div><h4 className="font-semibold mb-2">How often should I check sector exposure?</h4><p className="text-muted-foreground">Review quarterly or when significant market movements occur. Sector weights drift as individual positions appreciate or depreciate at different rates.</p></div>
          <div><h4 className="font-semibold mb-2">What about sub-sectors or industries?</h4><p className="text-muted-foreground">Sector-level analysis is a starting point. For deeper analysis, consider industry-level exposure (e.g., Software vs. Hardware within Technology).</p></div>
          <div><h4 className="font-semibold mb-2">Can sector exposure change over time?</h4><p className="text-muted-foreground">Yes. Sector classifications can change, and portfolio drift occurs naturally as positions appreciate/depreciate at different rates without rebalancing.</p></div>
          <div><h4 className="font-semibold mb-2">How does sector exposure relate to style factors?</h4><p className="text-muted-foreground">Sectors can have different factor exposures (value, growth, size). High sector concentration may also imply factor concentration, amplifying risk.</p></div>
          <div><h4 className="font-semibold mb-2">What sectors are most correlated?</h4><p className="text-muted-foreground">Financials and Real Estate are often correlated. Technology and Consumer Discretionary can move together. Utilities and Consumer Staples are typically defensive sectors with lower correlation to growth sectors.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


