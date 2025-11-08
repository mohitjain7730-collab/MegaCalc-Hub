'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, BarChart3 } from 'lucide-react';

const formSchema = z.object({
  trades: z.string().min(1, 'Enter trade data'),
});

type FormValues = z.infer<typeof formSchema>;

function parseTrades(data: string): { result: number }[] | null {
  try {
    const lines = data.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return null;
    const trades: { result: number }[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length < 2) continue;
      const result = parseFloat(parts[1].replace(/[$%,]/g, ''));
      if (!Number.isFinite(result)) continue;
      trades.push({ result });
    }
    return trades.length > 0 ? trades : null;
  } catch {
    return null;
  }
}

export default function WinRateExpectancyCalculator() {
  const [result, setResult] = useState<{
    winRate: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    averageWin: number;
    averageLoss: number;
    expectancy: number;
    expectedValue: number;
    interpretation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trades: '',
    }
  });

  const onSubmit = (v: FormValues) => {
    const parsed = parseTrades(v.trades);
    if (!parsed || parsed.length === 0) {
      setResult(null);
      return;
    }
    const winning = parsed.filter(t => t.result > 0);
    const losing = parsed.filter(t => t.result < 0);
    const totalTrades = parsed.length;
    const winningTrades = winning.length;
    const losingTrades = losing.length;
    const winRate = (winningTrades / totalTrades) * 100;
    const averageWin = winning.length > 0 ? winning.reduce((s, t) => s + t.result, 0) / winning.length : 0;
    const averageLoss = losing.length > 0 ? Math.abs(losing.reduce((s, t) => s + t.result, 0) / losing.length) : 0;
    const winProb = winningTrades / totalTrades;
    const lossProb = losingTrades / totalTrades;
    const expectancy = (winProb * averageWin) - (lossProb * averageLoss);
    const expectedValue = expectancy;
    const interpretation = `Win rate: ${winRate.toFixed(1)}% (${winningTrades} wins, ${losingTrades} losses). Average win: $${averageWin.toFixed(2)}. Average loss: $${averageLoss.toFixed(2)}. Expectancy: $${expectancy.toFixed(2)} per trade. ${expectancy > 0 ? 'Positive expectancy indicates a profitable strategy over time.' : 'Negative expectancy indicates the strategy is not profitable. Consider revising or improving the strategy.'}`;
    setResult({
      winRate,
      totalTrades,
      winningTrades,
      losingTrades,
      averageWin,
      averageLoss,
      expectancy,
      expectedValue,
      interpretation
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5"/> Win Rate & Expectancy Calculator</CardTitle>
          <CardDescription>Calculate win rate, expectancy, and expected value from trade history to assess trading strategy performance.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="trades" render={({ field }) => (
                <FormItem>
                  <FormLabel>Trades (CSV: Trade ID, P/L)</FormLabel>
                  <FormControl>
                    <Textarea rows={8} placeholder="Trade ID,P/L\n1,150\n2,-50\n3,200\n4,-75\n5,100" {...field} className="font-mono" />
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
            <CardDescription>Win rate and expectancy analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><div className="text-sm text-muted-foreground">Win Rate</div><div className="text-2xl font-semibold">{result.winRate.toFixed(1)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Total Trades</div><div className="text-xl font-medium">{result.totalTrades}</div></div>
              <div><div className="text-sm text-muted-foreground">Winning Trades</div><div className="text-xl font-medium text-green-600">{result.winningTrades}</div></div>
              <div><div className="text-sm text-muted-foreground">Losing Trades</div><div className="text-xl font-medium text-red-600">{result.losingTrades}</div></div>
              <div><div className="text-sm text-muted-foreground">Average Win</div><div className="text-lg font-medium text-green-600">${result.averageWin.toFixed(2)}</div></div>
              <div><div className="text-sm text-muted-foreground">Average Loss</div><div className="text-lg font-medium text-red-600">${result.averageLoss.toFixed(2)}</div></div>
              <div><div className="text-sm text-muted-foreground">Expectancy</div><div className={`text-xl font-semibold ${result.expectancy > 0 ? 'text-green-600' : 'text-red-600'}`}>${result.expectancy.toFixed(2)}</div></div>
              <div><div className="text-sm text-muted-foreground">Expected Value</div><div className={`text-lg font-medium ${result.expectedValue > 0 ? 'text-green-600' : 'text-red-600'}`}>${result.expectedValue.toFixed(2)}</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Strategy performance analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/kelly-criterion-calculator" className="text-primary hover:underline">Kelly Criterion</a></h4><p className="text-sm text-muted-foreground">Optimal position sizing.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/risk-reward-ratio-calculator" className="text-primary hover:underline">Risk/Reward Ratio</a></h4><p className="text-sm text-muted-foreground">Trade evaluation.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/cagr-from-trade-history-calculator" className="text-primary hover:underline">CAGR from Trade History</a></h4><p className="text-sm text-muted-foreground">Portfolio growth rate.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/maximum-drawdown-calculator" className="text-primary hover:underline">Maximum Drawdown</a></h4><p className="text-sm text-muted-foreground">Downside risk.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Understanding win rate, expectancy, and strategy performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Win rate = (Winning Trades / Total Trades) × 100%. Higher win rates are generally better, but win rate alone doesn't determine profitability.</li>
            <li>Expectancy = (Win Rate × Average Win) - (Loss Rate × Average Loss). Positive expectancy indicates a profitable strategy over time.</li>
            <li>A strategy with 40% win rate and 2:1 risk/reward can be more profitable than 60% win rate with 1:1 risk/reward due to higher expectancy.</li>
            <li>Expected value = Expectancy per trade. Multiply by number of trades to estimate total profit over time (before costs).</li>
            <li>Analyze win rate and expectancy together. High win rate with negative expectancy means losses outweigh wins. Low win rate with positive expectancy can still be profitable.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Win rate, expectancy, and trading strategy performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is win rate?</h4><p className="text-muted-foreground">Win rate is the percentage of profitable trades out of total trades. Win rate = (Winning Trades / Total Trades) × 100%.</p></div>
          <div><h4 className="font-semibold mb-2">What is expectancy?</h4><p className="text-muted-foreground">Expectancy is the average expected profit (or loss) per trade, calculated as (Win Rate × Average Win) - (Loss Rate × Average Loss). Positive expectancy indicates profitability.</p></div>
          <div><h4 className="font-semibold mb-2">Is a higher win rate always better?</h4><p className="text-muted-foreground">Not necessarily. Win rate alone doesn't determine profitability. A strategy with 40% win rate and 2:1 risk/reward can be more profitable than 60% win rate with 1:1 risk/reward due to higher expectancy.</p></div>
          <div><h4 className="font-semibold mb-2">What is a good win rate?</h4><p className="text-muted-foreground">Win rate depends on risk/reward ratio and strategy. Generally, win rates above 50% are favorable, but positive expectancy is more important than win rate alone.</p></div>
          <div><h4 className="font-semibold mb-2">How do I improve expectancy?</h4><p className="text-muted-foreground">Improve expectancy by increasing average win size, reducing average loss size, improving win rate, or combining these. Focus on risk/reward ratio and trade quality.</p></div>
          <div><h4 className="font-semibold mb-2">What is expected value?</h4><p className="text-muted-foreground">Expected value is the average profit (or loss) per trade, equal to expectancy. Multiply by number of trades to estimate total profit over time (before costs).</p></div>
          <div><h4 className="font-semibold mb-2">Can a strategy with negative win rate be profitable?</h4><p className="text-muted-foreground">No. Win rate cannot be negative (it's a percentage). However, a strategy with low win rate (e.g., 30%) can be profitable if average wins are much larger than average losses (high risk/reward).</p></div>
          <div><h4 className="font-semibold mb-2">How many trades do I need for reliable statistics?</h4><p className="text-muted-foreground">More trades provide more reliable statistics. At least 30-50 trades for initial assessment, 100+ for more reliable estimates. Larger sample sizes reduce statistical variance.</p></div>
          <div><h4 className="font-semibold mb-2">How do transaction costs affect expectancy?</h4><p className="text-muted-foreground">Transaction costs (commissions, spreads, slippage) reduce expectancy. Subtract average transaction costs from expectancy to get net expectancy. High-frequency strategies are more affected by costs.</p></div>
          <div><h4 className="font-semibold mb-2">Should I track win rate and expectancy separately?</h4><p className="text-muted-foreground">Yes. Track both metrics together. Win rate shows consistency, while expectancy shows profitability. A strategy with high win rate and negative expectancy is not profitable, while low win rate with positive expectancy can be profitable.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

