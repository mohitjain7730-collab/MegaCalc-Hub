'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  accountValue: z.number().positive('Enter account value'),
  marginUsed: z.number().min(0, 'Margin used cannot be negative'),
  leverageRatio: z.number().min(1, 'Leverage ratio must be at least 1').max(50, 'Leverage ratio too high'),
  positionSize: z.number().positive('Enter position size'),
  entryPrice: z.number().positive('Enter entry price'),
  currentPrice: z.number().positive('Enter current price'),
  interestRate: z.number().min(0).max(50, 'Interest rate too high').optional(),
  timeHeld: z.number().min(0).optional(), // days
});

type FormValues = z.infer<typeof formSchema>;

const calculateMarginMetrics = (values: FormValues) => {
  const {
    accountValue,
    marginUsed,
    leverageRatio,
    positionSize,
    entryPrice,
    currentPrice,
    interestRate = 0,
    timeHeld = 0
  } = values;

  // Basic calculations
  const totalPositionValue = positionSize * currentPrice;
  const totalEntryValue = positionSize * entryPrice;
  const priceChange = currentPrice - entryPrice;
  const priceChangePercent = (priceChange / entryPrice) * 100;
  
  // Leverage calculations
  const leveragedPositionValue = totalPositionValue * leverageRatio;
  const leveragedEntryValue = totalEntryValue * leverageRatio;
  const leveragedGainLoss = (totalPositionValue - totalEntryValue) * leverageRatio;
  const leveragedGainLossPercent = (leveragedGainLoss / leveragedEntryValue) * 100;
  
  // Margin calculations
  const marginRequired = totalPositionValue / leverageRatio;
  const marginAvailable = accountValue - marginUsed;
  const marginUtilization = (marginUsed / accountValue) * 100;
  const marginCallPrice = entryPrice * (1 - (1 / leverageRatio));
  const marginCallDistance = ((currentPrice - marginCallPrice) / currentPrice) * 100;
  
  // Interest calculations
  const dailyInterestRate = (interestRate / 100) / 365;
  const interestCost = marginUsed * dailyInterestRate * timeHeld;
  const netGainLoss = leveragedGainLoss - interestCost;
  
  // Risk metrics
  const maxLoss = totalEntryValue * leverageRatio;
  const riskRewardRatio = leveragedGainLoss / maxLoss;
  const marginCallRisk = marginCallDistance < 10 ? 'High' : marginCallDistance < 20 ? 'Medium' : 'Low';

  return {
    totalPositionValue,
    leveragedPositionValue,
    leveragedGainLoss,
    leveragedGainLossPercent,
    marginRequired,
    marginAvailable,
    marginUtilization,
    marginCallPrice,
    marginCallDistance,
    marginCallRisk,
    interestCost,
    netGainLoss,
    maxLoss,
    riskRewardRatio,
    priceChange,
    priceChangePercent
  };
};

const getLeverageStatus = (result: ReturnType<typeof calculateMarginMetrics>, values: FormValues) => {
  let status = 'conservative';
  let statusColor = 'text-green-600';
  let bgColor = 'bg-green-50';
  let borderColor = 'border-green-200';
  let icon = CheckCircle;
  let statusText = 'Conservative Leverage';
  let description = 'Low risk, sustainable leverage level';

  if (values.leverageRatio > 10) {
    status = 'extreme';
    statusColor = 'text-red-600';
    bgColor = 'bg-red-50';
    borderColor = 'border-red-200';
    icon = AlertTriangle;
    statusText = 'Extreme Leverage';
    description = 'Very high risk - potential for significant losses';
  } else if (values.leverageRatio > 5) {
    status = 'high';
    statusColor = 'text-orange-600';
    bgColor = 'bg-orange-50';
    borderColor = 'border-orange-200';
    icon = AlertTriangle;
    statusText = 'High Leverage';
    description = 'High risk - requires careful monitoring';
  } else if (values.leverageRatio > 2) {
    status = 'moderate';
    statusColor = 'text-blue-600';
    bgColor = 'bg-blue-50';
    borderColor = 'border-blue-200';
    icon = Info;
    statusText = 'Moderate Leverage';
    description = 'Balanced risk and reward potential';
  }

  return { status, statusColor, bgColor, borderColor, icon, statusText, description };
};

const getDetailedInterpretation = (result: ReturnType<typeof calculateMarginMetrics>, values: FormValues) => {
  const interpretations = [];
  
  // Leverage analysis
  if (values.leverageRatio > 10) {
    interpretations.push('Extreme leverage amplifies both gains and losses significantly');
    interpretations.push('A small price movement can result in substantial account impact');
    interpretations.push('Consider reducing leverage to manage risk better');
  } else if (values.leverageRatio > 5) {
    interpretations.push('High leverage provides significant amplification of returns');
    interpretations.push('Requires active monitoring and risk management');
    interpretations.push('Suitable for experienced traders with proper risk controls');
  } else if (values.leverageRatio > 2) {
    interpretations.push('Moderate leverage balances risk and reward potential');
    interpretations.push('Provides reasonable amplification without excessive risk');
    interpretations.push('Good for most trading strategies');
  } else {
    interpretations.push('Conservative leverage minimizes risk exposure');
    interpretations.push('Suitable for risk-averse investors');
    interpretations.push('Lower potential returns but more stable position');
  }

  // Margin utilization analysis
  if (result.marginUtilization > 80) {
    interpretations.push('High margin utilization limits your ability to take new positions');
    interpretations.push('Consider reducing position size or adding capital');
    interpretations.push('Monitor closely for potential margin calls');
  } else if (result.marginUtilization > 60) {
    interpretations.push('Moderate margin utilization provides some flexibility');
    interpretations.push('You have room for additional positions if needed');
    interpretations.push('Good balance between utilization and flexibility');
  } else {
    interpretations.push('Low margin utilization provides maximum flexibility');
    interpretations.push('You have significant capacity for additional positions');
    interpretations.push('Consider if you are underutilizing your available capital');
  }

  // Margin call risk analysis
  if (result.marginCallRisk === 'High') {
    interpretations.push('High risk of margin call - monitor position closely');
    interpretations.push('Consider reducing position size or adding capital');
    interpretations.push('Prepare for potential forced liquidation');
  } else if (result.marginCallRisk === 'Medium') {
    interpretations.push('Moderate margin call risk - monitor market conditions');
    interpretations.push('Consider setting stop-loss orders to limit downside');
    interpretations.push('Have a plan for managing margin calls');
  } else {
    interpretations.push('Low margin call risk - position is well-capitalized');
    interpretations.push('You have significant buffer before margin call');
    interpretations.push('Good risk management position');
  }

  return interpretations;
};

const getPersonalizedRecommendations = (result: ReturnType<typeof calculateMarginMetrics>, values: FormValues) => {
  const recommendations = [];
  
  // Leverage recommendations
  if (values.leverageRatio > 10) {
    recommendations.push('Consider reducing leverage to 5:1 or lower for better risk management');
    recommendations.push('Implement strict stop-loss orders to limit potential losses');
    recommendations.push('Only use extreme leverage with money you can afford to lose completely');
    recommendations.push('Consider using a smaller position size with lower leverage');
  } else if (values.leverageRatio > 5) {
    recommendations.push('Monitor your position closely and be prepared to reduce leverage if needed');
    recommendations.push('Set stop-loss orders at 10-15% below entry price');
    recommendations.push('Consider taking partial profits to reduce leverage over time');
    recommendations.push('Ensure you have sufficient capital to cover potential losses');
  } else if (values.leverageRatio > 2) {
    recommendations.push('Your leverage level is reasonable for most trading strategies');
    recommendations.push('Consider your risk tolerance and adjust leverage accordingly');
    recommendations.push('Monitor market conditions and adjust position size as needed');
  } else {
    recommendations.push('Conservative approach is good for risk-averse investors');
    recommendations.push('Consider if slightly higher leverage might improve returns');
    recommendations.push('Focus on position sizing and timing rather than leverage');
  }

  // Margin utilization recommendations
  if (result.marginUtilization > 80) {
    recommendations.push('Reduce margin utilization by closing some positions or adding capital');
    recommendations.push('Avoid taking new positions until margin utilization is below 70%');
    recommendations.push('Consider reducing position sizes to free up margin');
  } else if (result.marginUtilization > 60) {
    recommendations.push('Monitor margin utilization and avoid overextending');
    recommendations.push('Consider taking profits on winning positions to free up margin');
    recommendations.push('Maintain some margin buffer for market volatility');
  } else {
    recommendations.push('You have good margin flexibility for additional positions');
    recommendations.push('Consider if you are being too conservative with capital utilization');
    recommendations.push('Look for additional trading opportunities within your risk tolerance');
  }

  // Risk management recommendations
  if (result.marginCallRisk === 'High') {
    recommendations.push('Implement immediate risk management measures');
    recommendations.push('Consider reducing position size or adding capital immediately');
    recommendations.push('Set tight stop-loss orders to limit downside risk');
    recommendations.push('Prepare for potential margin call scenarios');
  } else if (result.marginCallRisk === 'Medium') {
    recommendations.push('Monitor position closely and be prepared to act if needed');
    recommendations.push('Consider setting stop-loss orders to limit downside');
    recommendations.push('Have a plan for managing margin calls if they occur');
  } else {
    recommendations.push('Your position is well-capitalized with low margin call risk');
    recommendations.push('Continue monitoring but you have good risk buffer');
    recommendations.push('Consider if you can optimize your capital allocation');
  }

  return recommendations;
};

const getRiskManagementTips = (result: ReturnType<typeof calculateMarginMetrics>, values: FormValues) => {
  const tips = [];
  
  tips.push('Never risk more than you can afford to lose');
  tips.push('Set stop-loss orders to limit downside risk');
  tips.push('Monitor your margin utilization regularly');
  tips.push('Keep some capital in reserve for margin calls');
  tips.push('Understand the risks of leveraged trading');
  
  if (values.leverageRatio > 5) {
    tips.push('High leverage requires active monitoring and risk management');
    tips.push('Consider using a smaller position size with lower leverage');
    tips.push('Be prepared to reduce leverage quickly if market conditions change');
  }
  
  if (result.marginCallRisk === 'High') {
    tips.push('High margin call risk - consider reducing position size immediately');
    tips.push('Have a plan for managing margin calls before they occur');
    tips.push('Consider adding capital to reduce margin call risk');
  }

  return tips;
};

export default function MarginLeverageCalculator() {
  const [result, setResult] = useState<ReturnType<typeof calculateMarginMetrics> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountValue: undefined,
      marginUsed: undefined,
      leverageRatio: undefined,
      positionSize: undefined,
      entryPrice: undefined,
      currentPrice: undefined,
      interestRate: undefined,
      timeHeld: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const calculation = calculateMarginMetrics(values);
    setResult(calculation);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="accountValue" render={({ field }) => (
              <FormItem>
                <FormLabel>Account Value ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="e.g., 10000"
                    {...field} 
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">Total value of your trading account</p>
              </FormItem>
            )} />
            
            <FormField control={form.control} name="marginUsed" render={({ field }) => (
              <FormItem>
                <FormLabel>Margin Used ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="e.g., 5000"
                    {...field} 
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">Amount of margin currently used</p>
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="leverageRatio" render={({ field }) => (
              <FormItem>
                <FormLabel>Leverage Ratio</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1" 
                    placeholder="e.g., 3.0"
                    {...field} 
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">Leverage ratio (e.g., 3.0 for 3:1 leverage)</p>
              </FormItem>
            )} />
            
            <FormField control={form.control} name="positionSize" render={({ field }) => (
              <FormItem>
                <FormLabel>Position Size (units)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="e.g., 100"
                    {...field} 
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">Number of units in your position</p>
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="entryPrice" render={({ field }) => (
              <FormItem>
                <FormLabel>Entry Price ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="e.g., 50.00"
                    {...field} 
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">Price at which you entered the position</p>
              </FormItem>
            )} />
            
            <FormField control={form.control} name="currentPrice" render={({ field }) => (
              <FormItem>
                <FormLabel>Current Price ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="e.g., 55.00"
                    {...field} 
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">Current market price of the asset</p>
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="interestRate" render={({ field }) => (
              <FormItem>
                <FormLabel>Interest Rate (%) - Optional</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="e.g., 5.5"
                    {...field} 
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">Annual interest rate on margin</p>
              </FormItem>
            )} />
            
            <FormField control={form.control} name="timeHeld" render={({ field }) => (
              <FormItem>
                <FormLabel>Time Held (days) - Optional</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="1" 
                    placeholder="e.g., 30"
                    {...field} 
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(parseInt(e.target.value) || undefined)} 
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">Number of days position has been held</p>
              </FormItem>
            )} />
          </div>

          <Button type="submit" className="w-full">
            <TrendingUp className="mr-2 h-4 w-4" />
            Calculate Margin & Leverage
          </Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Margin & Leverage Analysis
            </CardTitle>
            <CardDescription>
              Your leveraged position analysis and risk assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`p-6 rounded-lg border ${getLeverageStatus(result, form.getValues()).bgColor} ${getLeverageStatus(result, form.getValues()).borderColor}`}>
              <div className="text-center space-y-4">
                <div>
                  <p className="text-4xl font-bold">{result.leveragedGainLossPercent.toFixed(2)}%</p>
                  <p className={`text-lg font-semibold ${getLeverageStatus(result, form.getValues()).statusColor}`}>
                    {getLeverageStatus(result, form.getValues()).statusText}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getLeverageStatus(result, form.getValues()).description}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Leveraged P&L</p>
                    <p className="font-semibold">${result.leveragedGainLoss.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Margin Utilization</p>
                    <p className="font-semibold">{result.marginUtilization.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Margin Call Risk</p>
                    <p className="font-semibold">{result.marginCallRisk}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Detailed Interpretation</h3>
              <ul className="space-y-2">
                {getDetailedInterpretation(result, form.getValues()).map((interpretation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{interpretation}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Personalized Recommendations</h3>
              <ul className="space-y-2">
                {getPersonalizedRecommendations(result, form.getValues()).map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Risk Management Tips</h3>
              <ul className="space-y-2">
                {getRiskManagementTips(result, form.getValues()).map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <MarginLeverageGuide />
      
      <EmbedWidget calculatorSlug="margin-leverage-calculator" calculatorName="Margin Leverage Calculator" />
    </div>
  );
}

function MarginLeverageGuide() {
  return (
    <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Calculator">
      <meta itemProp="name" content="Margin Leverage Calculator - Trading Risk Assessment" />
      <meta itemProp="description" content="Calculate margin requirements, leverage ratios, and risk metrics for leveraged trading positions. Assess margin call risk and optimize capital utilization." />
      <meta itemProp="keywords" content="margin calculator, leverage calculator, trading risk, margin call, leveraged trading, risk management" />
      
      <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Margin Leverage Calculator: Assess Your Trading Risk</h1>
      
      <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
      <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#what-is-margin" className="hover:underline">What is Margin Trading and Leverage?</a></li>
        <li><a href="#leverage-ratios" className="hover:underline">Understanding Leverage Ratios</a></li>
        <li><a href="#margin-requirements" className="hover:underline">Margin Requirements and Maintenance</a></li>
        <li><a href="#margin-calls" className="hover:underline">Margin Calls and Risk Management</a></li>
        <li><a href="#leverage-strategies" className="hover:underline">Leverage Strategies and Best Practices</a></li>
        <li><a href="#risk-management" className="hover:underline">Risk Management for Leveraged Trading</a></li>
        <li><a href="#faq" className="hover:underline">Margin Trading FAQs</a></li>
      </ul>

      <hr />

      <h2 id="what-is-margin" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Margin Trading and Leverage?</h2>
      <p><strong>Margin trading</strong> allows you to borrow money from your broker to buy securities, using your existing investments as collateral. This amplifies both your potential gains and losses through the use of <strong>leverage</strong>.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">How Margin Trading Works</h3>
      <p>When you trade on margin, you're essentially borrowing money to increase your buying power. For example, with a 2:1 leverage ratio, you can control $20,000 worth of securities with only $10,000 of your own money.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">The Leverage Formula</h3>
      <pre className="bg-gray-200 p-3 rounded-md my-4"><code>Leverage Ratio = Total Position Value ÷ Your Capital</code></pre>
      <p>Higher leverage ratios mean greater amplification of both gains and losses, but also increased risk.</p>

      <hr />

      <h2 id="leverage-ratios" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Leverage Ratios</h2>
      <p>Leverage ratios determine how much you can borrow relative to your own capital. Different ratios offer different risk-reward profiles:</p>
      
      <div className="overflow-x-auto my-6">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leverage Ratio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suitable For</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">1:1 (No Leverage)</td>
              <td className="px-6 py-4 whitespace-nowrap">Low</td>
              <td className="px-6 py-4 whitespace-nowrap">Conservative investors</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">2:1 to 3:1</td>
              <td className="px-6 py-4 whitespace-nowrap">Moderate</td>
              <td className="px-6 py-4 whitespace-nowrap">Most traders</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">5:1 to 10:1</td>
              <td className="px-6 py-4 whitespace-nowrap">High</td>
              <td className="px-6 py-4 whitespace-nowrap">Experienced traders</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">10:1+</td>
              <td className="px-6 py-4 whitespace-nowrap">Very High</td>
              <td className="px-6 py-4 whitespace-nowrap">Professional traders only</td>
            </tr>
          </tbody>
        </table>
      </div>

      <hr />

      <h2 id="margin-requirements" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Margin Requirements and Maintenance</h2>
      <p>Brokers require you to maintain a minimum amount of equity in your account, known as the <strong>maintenance margin</strong>. This protects both you and the broker from excessive losses.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Initial Margin vs. Maintenance Margin</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li><strong>Initial Margin:</strong> The minimum amount you must deposit to open a margin position (typically 50% of the position value)</li>
        <li><strong>Maintenance Margin:</strong> The minimum equity you must maintain in your account (typically 25-30% of the position value)</li>
      </ul>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Margin Utilization</h3>
      <p>Your margin utilization shows how much of your available margin you're currently using. High utilization limits your ability to take new positions and increases your risk of margin calls.</p>

      <hr />

      <h2 id="margin-calls" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Margin Calls and Risk Management</h2>
      <p>A <strong>margin call</strong> occurs when your account equity falls below the maintenance margin requirement. This forces you to either add more capital or close positions to meet the requirement.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">How to Avoid Margin Calls</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Monitor your margin utilization regularly</li>
        <li>Keep some capital in reserve for market volatility</li>
        <li>Use stop-loss orders to limit downside risk</li>
        <li>Don't overextend your margin capacity</li>
        <li>Understand the risks before using leverage</li>
      </ul>

      <hr />

      <h2 id="leverage-strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Leverage Strategies and Best Practices</h2>
      <p>Successful leveraged trading requires careful strategy and risk management. Here are some best practices:</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Conservative Approach (2:1 to 3:1)</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Good for beginners and risk-averse traders</li>
        <li>Provides reasonable amplification without excessive risk</li>
        <li>Easier to manage and monitor</li>
      </ul>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Moderate Approach (5:1 to 7:1)</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Balances risk and reward potential</li>
        <li>Requires active monitoring and risk management</li>
        <li>Suitable for experienced traders</li>
      </ul>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Aggressive Approach (10:1+)</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>High risk, high reward potential</li>
        <li>Requires professional-level risk management</li>
        <li>Only for experienced traders with proper risk controls</li>
      </ul>

      <hr />

      <h2 id="risk-management" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Risk Management for Leveraged Trading</h2>
      <p>Effective risk management is crucial when trading with leverage. Here are key strategies:</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Position Sizing</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Never risk more than you can afford to lose</li>
        <li>Use position sizing to control risk exposure</li>
        <li>Consider your total portfolio risk, not just individual positions</li>
      </ul>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Stop-Loss Orders</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Set stop-loss orders to limit downside risk</li>
        <li>Use trailing stops to protect profits</li>
        <li>Don't move stop-loss orders against you</li>
      </ul>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Diversification</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Don't put all your capital in one leveraged position</li>
        <li>Diversify across different assets and strategies</li>
        <li>Consider correlation between positions</li>
      </ul>

      <hr />

      <h2 id="faq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Margin Trading FAQs</h2>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">What happens if I get a margin call?</h3>
      <p>If you receive a margin call, you must either deposit more money into your account or close some positions to meet the maintenance margin requirement. If you don't act quickly, your broker may close positions for you.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">How much leverage should I use?</h3>
      <p>The appropriate leverage depends on your experience, risk tolerance, and trading strategy. Beginners should start with 2:1 or 3:1 leverage, while experienced traders may use higher ratios with proper risk management.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Can I lose more than my initial investment?</h3>
      <p>Yes, with leverage you can lose more than your initial investment. This is why risk management is so important. Always use stop-loss orders and never risk more than you can afford to lose.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">What's the difference between margin and leverage?</h3>
      <p>Margin is the amount of money you borrow from your broker, while leverage is the ratio of your total position size to your own capital. Higher leverage means you're borrowing more money relative to your own capital.</p>

      <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This tool is provided by mycalculating.com. Always consult with a financial advisor before making investment decisions.</p>
      </div>
    </section>
  );
}
