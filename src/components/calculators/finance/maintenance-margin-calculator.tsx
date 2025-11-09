'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Info, Shield, Calculator, Globe, FileText } from 'lucide-react';
import Link from 'next/link';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  accountValue: z.number().positive('Enter account value'),
  marginUsed: z.number().min(0, 'Margin used cannot be negative'),
  positionValue: z.number().positive('Enter position value'),
  maintenanceMarginRate: z.number().min(0).max(100, 'Maintenance margin rate too high'),
  currentPrice: z.number().positive('Enter current price'),
  entryPrice: z.number().positive('Enter entry price'),
  positionSize: z.number().positive('Enter position size'),
  brokerMarginRate: z.number().min(0).max(100, 'Broker margin rate too high').optional(),
});

type FormValues = z.infer<typeof formSchema>;

const calculateMarginRisk = (values: FormValues) => {
  const {
    accountValue,
    marginUsed,
    positionValue,
    maintenanceMarginRate,
    currentPrice,
    entryPrice,
    positionSize,
    brokerMarginRate = 50
  } = values;

  // Basic calculations
  const equity = accountValue - marginUsed;
  const equityRatio = (equity / accountValue) * 100;
  
  // Maintenance margin calculations
  const requiredMaintenanceMargin = positionValue * (maintenanceMarginRate / 100);
  const maintenanceMarginExcess = equity - requiredMaintenanceMargin;
  const maintenanceMarginRatio = (equity / requiredMaintenanceMargin) * 100;
  
  // Margin call calculations
  const marginCallPrice = entryPrice * (1 - (1 - maintenanceMarginRate / 100) / (brokerMarginRate / 100));
  const marginCallDistance = ((currentPrice - marginCallPrice) / currentPrice) * 100;
  const marginCallDistanceDollars = currentPrice - marginCallPrice;
  
  // Risk assessment
  const riskLevel = maintenanceMarginRatio > 150 ? 'Low' : 
                   maintenanceMarginRatio > 120 ? 'Medium' : 
                   maintenanceMarginRatio > 100 ? 'High' : 'Critical';
  
  const riskColor = riskLevel === 'Low' ? 'text-green-600' : 
                   riskLevel === 'Medium' ? 'text-yellow-600' : 
                   riskLevel === 'High' ? 'text-orange-600' : 'text-red-600';
  
  // Additional metrics
  const maxLossBeforeMarginCall = (currentPrice - marginCallPrice) * positionSize;
  const priceDropToMarginCall = ((currentPrice - marginCallPrice) / currentPrice) * 100;
  const daysToMarginCall = priceDropToMarginCall > 0 ? Math.ceil(priceDropToMarginCall / 5) : 0; // Assuming 5% daily volatility
  
  return {
    equity,
    equityRatio,
    requiredMaintenanceMargin,
    maintenanceMarginExcess,
    maintenanceMarginRatio,
    marginCallPrice,
    marginCallDistance,
    marginCallDistanceDollars,
    riskLevel,
    riskColor,
    maxLossBeforeMarginCall,
    priceDropToMarginCall,
    daysToMarginCall
  };
};

const getRiskStatus = (result: ReturnType<typeof calculateMarginRisk>) => {
  let status = 'safe';
  let statusColor = 'text-green-600';
  let bgColor = 'bg-green-50';
  let borderColor = 'border-green-200';
  let icon = CheckCircle;
  let statusText = 'Safe Margin Level';
  let description = 'Your account has sufficient margin buffer';

  if (result.riskLevel === 'Critical') {
    status = 'critical';
    statusColor = 'text-red-600';
    bgColor = 'bg-red-50';
    borderColor = 'border-red-200';
    icon = AlertTriangle;
    statusText = 'Critical Margin Risk';
    description = 'Immediate action required - margin call imminent';
  } else if (result.riskLevel === 'High') {
    status = 'high';
    statusColor = 'text-orange-600';
    bgColor = 'bg-orange-50';
    borderColor = 'border-orange-200';
    icon = AlertTriangle;
    statusText = 'High Margin Risk';
    description = 'Monitor closely - consider reducing position size';
  } else if (result.riskLevel === 'Medium') {
    status = 'medium';
    statusColor = 'text-yellow-600';
    bgColor = 'bg-yellow-50';
    borderColor = 'border-yellow-200';
    icon = Shield;
    statusText = 'Medium Margin Risk';
    description = 'Moderate risk - monitor market conditions';
  }

  return { status, statusColor, bgColor, borderColor, icon, statusText, description };
};

const getDetailedInterpretation = (result: ReturnType<typeof calculateMarginRisk>, values: FormValues) => {
  const interpretations = [];
  
  // Risk level interpretation
  if (result.riskLevel === 'Critical') {
    interpretations.push('Your account is at critical risk of a margin call');
    interpretations.push('Immediate action is required to prevent forced liquidation');
    interpretations.push('Consider closing positions or adding capital immediately');
  } else if (result.riskLevel === 'High') {
    interpretations.push('High risk of margin call - monitor position closely');
    interpretations.push('Consider reducing position size or adding capital');
    interpretations.push('Set stop-loss orders to limit downside risk');
  } else if (result.riskLevel === 'Medium') {
    interpretations.push('Moderate margin call risk - monitor market conditions');
    interpretations.push('Consider setting stop-loss orders to limit downside');
    interpretations.push('Have a plan for managing margin calls if they occur');
  } else {
    interpretations.push('Low margin call risk - your account is well-capitalized');
    interpretations.push('You have significant buffer before margin call');
    interpretations.push('Continue monitoring but you have good risk management');
  }

  // Margin call distance analysis
  if (result.marginCallDistance < 5) {
    interpretations.push('Very close to margin call - immediate action needed');
    interpretations.push('Consider closing positions or adding capital');
    interpretations.push('Monitor price movements closely');
  } else if (result.marginCallDistance < 15) {
    interpretations.push('Close to margin call - monitor position carefully');
    interpretations.push('Consider reducing position size or adding capital');
    interpretations.push('Set tight stop-loss orders to limit downside');
  } else if (result.marginCallDistance < 30) {
    interpretations.push('Moderate distance from margin call');
    interpretations.push('Monitor market conditions and position performance');
    interpretations.push('Consider setting stop-loss orders for protection');
  } else {
    interpretations.push('Good distance from margin call');
    interpretations.push('You have significant buffer before margin call');
    interpretations.push('Continue monitoring but you have good risk management');
  }

  // Maintenance margin analysis
  if (result.maintenanceMarginExcess < 0) {
    interpretations.push('Insufficient maintenance margin - margin call likely');
    interpretations.push('Immediate action required to meet margin requirements');
    interpretations.push('Consider closing positions or adding capital');
  } else if (result.maintenanceMarginExcess < values.accountValue * 0.1) {
    interpretations.push('Low maintenance margin excess - monitor closely');
    interpretations.push('Consider adding capital to increase margin buffer');
    interpretations.push('Set stop-loss orders to limit downside risk');
  } else {
    interpretations.push('Good maintenance margin excess');
    interpretations.push('You have sufficient buffer for market volatility');
    interpretations.push('Continue monitoring but you have good risk management');
  }

  return interpretations;
};

const getPersonalizedRecommendations = (result: ReturnType<typeof calculateMarginRisk>, values: FormValues) => {
  const recommendations = [];
  
  // Risk level recommendations
  if (result.riskLevel === 'Critical') {
    recommendations.push('Immediately close positions or add capital to meet margin requirements');
    recommendations.push('Contact your broker to discuss margin call procedures');
    recommendations.push('Consider reducing position size to prevent future margin calls');
    recommendations.push('Review your risk management strategy');
  } else if (result.riskLevel === 'High') {
    recommendations.push('Consider reducing position size to lower margin requirements');
    recommendations.push('Add capital to increase margin buffer');
    recommendations.push('Set stop-loss orders to limit downside risk');
    recommendations.push('Monitor position closely and be prepared to act quickly');
  } else if (result.riskLevel === 'Medium') {
    recommendations.push('Monitor position closely and be prepared to act if needed');
    recommendations.push('Consider setting stop-loss orders to limit downside');
    recommendations.push('Have a plan for managing margin calls if they occur');
    recommendations.push('Consider adding capital to increase margin buffer');
  } else {
    recommendations.push('Your margin position is well-managed');
    recommendations.push('Continue monitoring but you have good risk management');
    recommendations.push('Consider if you can optimize your capital allocation');
    recommendations.push('Maintain your current risk management approach');
  }

  // Margin call distance recommendations
  if (result.marginCallDistance < 5) {
    recommendations.push('Immediate action required - consider closing positions');
    recommendations.push('Add capital to increase margin buffer');
    recommendations.push('Set tight stop-loss orders to limit downside');
    recommendations.push('Monitor price movements very closely');
  } else if (result.marginCallDistance < 15) {
    recommendations.push('Monitor position closely and be prepared to act');
    recommendations.push('Consider reducing position size or adding capital');
    recommendations.push('Set stop-loss orders to limit downside risk');
    recommendations.push('Have a plan for managing margin calls');
  } else if (result.marginCallDistance < 30) {
    recommendations.push('Monitor market conditions and position performance');
    recommendations.push('Consider setting stop-loss orders for protection');
    recommendations.push('Have a plan for managing margin calls if they occur');
    recommendations.push('Consider adding capital to increase margin buffer');
  } else {
    recommendations.push('Good distance from margin call - continue monitoring');
    recommendations.push('Maintain your current risk management approach');
    recommendations.push('Consider if you can optimize your capital allocation');
    recommendations.push('Continue monitoring but you have good risk management');
  }

  // Maintenance margin recommendations
  if (result.maintenanceMarginExcess < 0) {
    recommendations.push('Immediately add capital to meet margin requirements');
    recommendations.push('Consider closing positions to reduce margin requirements');
    recommendations.push('Contact your broker to discuss margin call procedures');
    recommendations.push('Review your risk management strategy');
  } else if (result.maintenanceMarginExcess < values.accountValue * 0.1) {
    recommendations.push('Consider adding capital to increase margin buffer');
    recommendations.push('Monitor position closely and be prepared to act');
    recommendations.push('Set stop-loss orders to limit downside risk');
    recommendations.push('Have a plan for managing margin calls');
  } else {
    recommendations.push('Good maintenance margin excess - continue monitoring');
    recommendations.push('Maintain your current risk management approach');
    recommendations.push('Consider if you can optimize your capital allocation');
    recommendations.push('Continue monitoring but you have good risk management');
  }

  return recommendations;
};

const getRiskManagementTips = (result: ReturnType<typeof calculateMarginRisk>, values: FormValues) => {
  const tips = [];
  
  tips.push('Never risk more than you can afford to lose');
  tips.push('Monitor your margin utilization regularly');
  tips.push('Set stop-loss orders to limit downside risk');
  tips.push('Keep some capital in reserve for margin calls');
  tips.push('Understand the risks of margin trading');
  
  if (result.riskLevel === 'Critical' || result.riskLevel === 'High') {
    tips.push('High margin risk requires immediate attention');
    tips.push('Consider reducing position size or adding capital');
    tips.push('Be prepared to close positions quickly if needed');
  }
  
  if (result.marginCallDistance < 15) {
    tips.push('Close to margin call - monitor position very closely');
    tips.push('Have a plan for managing margin calls');
    tips.push('Consider setting tight stop-loss orders');
  }

  return tips;
};

export default function MaintenanceMarginCalculator() {
  const [result, setResult] = useState<ReturnType<typeof calculateMarginRisk> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountValue: 0,
      marginUsed: 0,
      positionValue: 0,
      maintenanceMarginRate: 0,
      currentPrice: 0,
      entryPrice: 0,
      positionSize: 0,
      brokerMarginRate: 0,
    },
  });

  const onSubmit = (values: FormValues) => {
    const calculation = calculateMarginRisk(values);
    setResult(calculation);
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Maintenance Margin Calculation
          </CardTitle>
          <CardDescription>
            Calculate maintenance margin requirements and margin call risk
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                    value={field.value || ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
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
                    value={field.value || ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">Amount of margin currently used</p>
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="positionValue" render={({ field }) => (
              <FormItem>
                <FormLabel>Position Value ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="e.g., 20000"
                    {...field} 
                    value={field.value || ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">Total value of your position</p>
              </FormItem>
            )} />
            
            <FormField control={form.control} name="maintenanceMarginRate" render={({ field }) => (
              <FormItem>
                <FormLabel>Maintenance Margin Rate (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1" 
                    placeholder="e.g., 25"
                    {...field} 
                    value={field.value || ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">Required maintenance margin percentage</p>
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="currentPrice" render={({ field }) => (
              <FormItem>
                <FormLabel>Current Price ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="e.g., 50.00"
                    {...field} 
                    value={field.value || ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">Current market price of the asset</p>
              </FormItem>
            )} />
            
            <FormField control={form.control} name="entryPrice" render={({ field }) => (
              <FormItem>
                <FormLabel>Entry Price ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="e.g., 55.00"
                    {...field} 
                    value={field.value || ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">Price at which you entered the position</p>
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="positionSize" render={({ field }) => (
              <FormItem>
                <FormLabel>Position Size (units)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="e.g., 400"
                    {...field} 
                    value={field.value || ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">Number of units in your position</p>
              </FormItem>
            )} />
            
            <FormField control={form.control} name="brokerMarginRate" render={({ field }) => (
              <FormItem>
                <FormLabel>Broker Margin Rate (%) - Optional</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1" 
                    placeholder="e.g., 50"
                    {...field} 
                    value={field.value || ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">Initial margin requirement percentage</p>
              </FormItem>
            )} />
          </div>

            <Button type="submit" className="w-full">
              <Shield className="mr-2 h-4 w-4" />
              Calculate Margin Risk
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>

    {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Margin Risk Analysis
            </CardTitle>
            <CardDescription>
              Your margin call risk assessment and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`p-6 rounded-lg border ${getRiskStatus(result).bgColor} ${getRiskStatus(result).borderColor}`}>
              <div className="text-center space-y-4">
                <div>
                  <p className="text-4xl font-bold">{result.maintenanceMarginRatio.toFixed(1)}%</p>
                  <p className={`text-lg font-semibold ${getRiskStatus(result).statusColor}`}>
                    {getRiskStatus(result).statusText}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getRiskStatus(result).description}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Margin Call Distance</p>
                    <p className="font-semibold">{result.marginCallDistance.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Margin Call Price</p>
                    <p className="font-semibold">${result.marginCallPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Risk Level</p>
                    <p className="font-semibold">{result.riskLevel}</p>
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

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>
            Explore other trading and risk management calculators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/margin-leverage-calculator" className="text-primary hover:underline">
                  Margin & Leverage Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate margin requirements and leverage ratios for your positions.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/leverage-debt-ratio-calculator" className="text-primary hover:underline">
                  Leverage Ratio Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate financial leverage and debt-to-equity ratios.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/risk-return-calculator" className="text-primary hover:underline">
                  Risk-Return Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Analyze risk-adjusted returns and portfolio performance.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/position-size-calculator" className="text-primary hover:underline">
                  Position Size Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate optimal position sizes based on risk tolerance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Maintenance Margin, Margin Call Risk, and Equity Calculation" />
    <meta itemProp="description" content="An expert guide detailing the formulas for initial margin, maintenance margin, and the calculation of margin call price. Covers margin call risk mitigation and the use of leverage in brokerage accounts." />
    <meta itemProp="keywords" content="maintenance margin calculation, margin call risk explained, initial margin requirement, equity calculation brokerage account, margin call price formula, leverage trading risk" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-margin-call-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Maintenance Margin and Margin Call Risk</h1>
    <p className="text-lg italic text-muted-foreground">Master the critical thresholds that govern leveraged trading and determine the price level at which your broker liquidates your position.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#basics" className="hover:underline">Margin Trading Basics: Initial Margin and Leverage</a></li>
        <li><a href="#maintenance" className="hover:underline">Maintenance Margin: The Safety Threshold</a></li>
        <li><a href="#equity-calc" className="hover:underline">Equity Calculation and Margin Status</a></li>
        <li><a href="#call-price" className="hover:underline">Calculating the Margin Call Price</a></li>
        <li><a href="#risk-mitigation" className="hover:underline">Margin Call Risk and Mitigation Strategies</a></li>
    </ul>
<hr />

    {/* MARGIN TRADING BASICS: INITIAL MARGIN AND LEVERAGE */}
    <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Margin Trading Basics: Initial Margin and Leverage</h2>
    <p>Margin trading involves borrowing money from a broker to purchase securities. This practice, known as using leverage, allows a trader to control a larger position than their account capital would otherwise allow, magnifying both potential gains and losses.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Initial Margin Requirement</h3>
    <p>The Initial Margin is the minimum percentage of the security's purchase price that a trader must fund with their own capital. Regulatory bodies, such as the Federal Reserve Board in the U.S. (Regulation T), set the minimum initial margin, but brokers can require higher percentages based on risk.</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Borrowed Amount = Total Value of Position * (1 - Initial Margin %)'}
        </p>
    </div>
    <p>The remaining portion is the trader's required equity.</p>

<hr />

    {/* MAINTENANCE MARGIN: THE SAFETY THRESHOLD */}
    <h2 id="maintenance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Maintenance Margin: The Safety Threshold</h2>
    <p>The Maintenance Margin is the minimum level of equity a trader must maintain in the margin account relative to the market value of the securities. It acts as a safety buffer for the broker against potential losses.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Purpose of the Maintenance Margin</h3>
    <p>If the value of the securities declines, the trader's equity falls. The maintenance margin is the threshold that, if breached, triggers a <strong className="font-semibold">Margin Call</strong>. Brokerages often set their maintenance margin higher than the regulatory minimum (typically 25% of the position value) to protect their loan capital.</p>
    <p>The broker allows the trader to manage the position freely as long as the equity remains above this maintenance margin percentage.</p>

<hr />

    {/* EQUITY CALCULATION AND MARGIN STATUS */}
    <h2 id="equity-calc" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Equity Calculation and Margin Status</h2>
    <p>A trader's margin status is continuously monitored by comparing their actual equity to the maintenance margin requirement.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Calculating Account Equity</h3>
    <p>Account equity represents the current value of the trader's cash claim in the position. It is the core metric used to determine if a margin call is imminent.</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Account Equity = Market Value of Securities - Borrowed Amount'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Margin Call Trigger</h3>
    <p>A margin call is triggered when the trader's account equity drops below the dollar amount required by the maintenance margin rule.</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Margin Call Trigger = Maintenance Margin % * Market Value of Securities'}
        </p>
    </div>
    <p>When the actual Account Equity falls below the Margin Call Trigger dollar amount, the broker issues the call.</p>

<hr />

    {/* CALCULATING THE MARGIN CALL PRICE */}
    <h2 id="call-price" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating the Margin Call Price</h2>
    <p>The Margin Call Price is the exact price point at which the security's value falls low enough to trigger the maintenance margin requirement, forcing the trader to take action.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Margin Call Price Formula</h3>
    <p>For a long position (buying a security), the margin call price is calculated based on the initial borrowing and the maintenance margin percentage (MM):</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Margin Call Price = Borrowed Amount / (1 - Maintenance Margin %)'}
        </p>
    </div>
    <p>This formula determines the market value where the equity equals the maintenance margin requirement, allowing the trader to know their downside risk threshold.</p>

<hr />

    {/* MARGIN CALL RISK AND MITIGATION STRATEGIES */}
    <h2 id="risk-mitigation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Margin Call Risk and Mitigation Strategies</h2>
    <p>A margin call requires the trader to deposit additional funds immediately or face mandatory liquidation of their assets by the broker. This liquidation is performed regardless of market price, locking in the loss.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Actions Following a Margin Call</h3>
    <p>Upon receiving a margin call, the trader must do one of two things, typically within a few days:</p>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Deposit Cash:</strong> Inject enough cash into the account to raise the equity back above the maintenance margin threshold.</li>
        <li><strong className="font-semibold">Sell Securities:</strong> Liquidate enough securities in the account to reduce the borrowed amount and meet the margin requirement.</li>
    </ol>
    <p>If the trader fails to meet the call, the broker will unilaterally liquidate assets to protect their loan, potentially selling at the worst possible time.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Mitigation Strategy: Over-Collateralization</h3>
    <p>The best way to mitigate margin call risk is to <strong className="font-semibold">over-collateralize</strong> the account—maintaining an equity percentage well above the maintenance margin. This creates a larger buffer against market fluctuations, reducing the likelihood of liquidation during routine market volatility.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The Maintenance Margin is the financial line in the sand that separates leveraged trading from mandatory liquidation. It is the minimum percentage of equity required to secure the broker's loan.</p>
    <p>The Margin Call Price calculation provides the essential knowledge of the market value at which the margin loan becomes structurally vulnerable. Traders must proactively track their equity against this threshold and maintain a sufficient capital buffer to avoid the costly, forced liquidation that follows an unmet margin call.</p>
</section>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about maintenance margin and margin calls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">What is maintenance margin?</h4>
            <p className="text-muted-foreground">
              Maintenance margin is the minimum amount of equity you must maintain in your margin account to keep a position open. It's a safety mechanism that protects both you and your broker from excessive losses.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What happens if I get a margin call?</h4>
            <p className="text-muted-foreground">
              If you receive a margin call, you must either deposit more money into your account or close some positions to meet the maintenance margin requirement. If you don't act quickly, your broker may close positions for you.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How can I avoid margin calls?</h4>
            <p className="text-muted-foreground">
              To avoid margin calls, keep sufficient capital in reserve for market volatility, don't overextend your margin capacity, use stop-loss orders to limit downside risk, monitor your positions closely, and maintain a margin buffer above the minimum requirement.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What's the difference between initial margin and maintenance margin?</h4>
            <p className="text-muted-foreground">
              Initial margin is the amount required to open a position (typically 50% of the position value), while maintenance margin is the minimum amount you must maintain to keep the position open (typically 25-30% of the position value). Maintenance margin is typically lower than initial margin.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How is the margin call price calculated?</h4>
            <p className="text-muted-foreground">
              The margin call price is calculated using the formula: Margin Call Price = Entry Price × (1 - (1 - Maintenance Margin Rate) / Initial Margin Rate). This determines the price at which your account equity will fall below the maintenance margin requirement.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Can I lose more than my initial investment with margin?</h4>
            <p className="text-muted-foreground">
              Yes, with margin trading you can lose more than your initial investment. This is why risk management is so important. Always use stop-loss orders and never risk more than you can afford to lose completely.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What is a good maintenance margin ratio?</h4>
            <p className="text-muted-foreground">
              A maintenance margin ratio above 150% is considered low risk, 120-150% is moderate risk, 100-120% is high risk, and below 100% indicates a margin call situation. Aim to maintain a ratio of at least 120% to provide a buffer against market volatility.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How often should I monitor my margin utilization?</h4>
            <p className="text-muted-foreground">
              You should monitor your margin utilization regularly, especially during volatile market conditions. Daily monitoring is recommended for active traders, while position holders should check at least weekly. Set up alerts with your broker for automatic notifications when your margin ratio approaches dangerous levels.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What should I do if my margin ratio falls below 120%?</h4>
            <p className="text-muted-foreground">
              If your margin ratio falls below 120%, consider reducing your position size, adding capital to your account, setting stop-loss orders to limit downside risk, or closing some positions to free up margin. Have a plan ready before this situation occurs.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How does the maintenance margin rate differ by asset type?</h4>
            <p className="text-muted-foreground">
              Maintenance margin rates vary by asset type and broker. Stocks typically require 25-30% maintenance margin, while futures contracts may require 5-15%, and forex positions often use much lower rates. Always check your broker's specific requirements for each asset class.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MaintenanceMarginGuide() {
  return (
    <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Calculator">
      <meta itemProp="name" content="Maintenance Margin Calculator - Margin Call Risk Assessment" />
      <meta itemProp="description" content="Calculate maintenance margin requirements, assess margin call risk, and optimize your leveraged trading positions for better risk management." />
      <meta itemProp="keywords" content="maintenance margin calculator, margin call risk, trading risk management, leveraged trading, margin requirements" />
      
      <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Maintenance Margin Calculator: Assess Your Margin Call Risk</h1>
      
      <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
      <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#what-is-maintenance-margin" className="hover:underline">What is Maintenance Margin?</a></li>
        <li><a href="#margin-call-process" className="hover:underline">Understanding Margin Calls</a></li>
        <li><a href="#risk-assessment" className="hover:underline">Risk Assessment and Management</a></li>
        <li><a href="#preventing-margin-calls" className="hover:underline">Preventing Margin Calls</a></li>
        <li><a href="#margin-strategies" className="hover:underline">Margin Trading Strategies</a></li>
        <li><a href="#faq" className="hover:underline">Maintenance Margin FAQs</a></li>
      </ul>

      <hr />

      <h2 id="what-is-maintenance-margin" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Maintenance Margin?</h2>
      <p><strong>Maintenance margin</strong> is the minimum amount of equity that must be maintained in a margin account to keep a position open. It's a safety mechanism that protects both you and your broker from excessive losses.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">How Maintenance Margin Works</h3>
      <p>When you open a margin position, you must maintain a minimum equity level. If your account equity falls below this threshold, you'll receive a margin call requiring you to either add more capital or close positions.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Maintenance Margin Formula</h3>
      <pre className="bg-muted p-3 rounded-md my-4"><code>Maintenance Margin = Position Value × Maintenance Margin Rate</code></pre>
      <p>Your account equity must always be greater than the required maintenance margin to avoid margin calls.</p>

      <hr />

      <h2 id="margin-call-process" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Margin Calls</h2>
      <p>A <strong>margin call</strong> occurs when your account equity falls below the maintenance margin requirement. This triggers a requirement to either deposit more money or close positions to meet the margin requirement.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Margin Call Process</h3>
      <ol className="list-decimal ml-6 space-y-2">
        <li>Your account equity falls below the maintenance margin requirement</li>
        <li>Your broker issues a margin call notification</li>
        <li>You have a limited time to meet the margin requirement</li>
        <li>If you don't act, your broker may close positions for you</li>
      </ol>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Margin Call Price Calculation</h3>
      <pre className="bg-muted p-3 rounded-md my-4"><code>Margin Call Price = Entry Price × (1 - (1 - Maintenance Margin Rate) / Initial Margin Rate)</code></pre>
      <p>This formula calculates the price at which a margin call will occur based on your entry price and margin requirements.</p>

      <hr />

      <h2 id="risk-assessment" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Risk Assessment and Management</h2>
      <p>Effective risk management requires understanding your margin call risk and taking appropriate measures to protect your account.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Risk Levels</h3>
      <div className="overflow-x-auto my-6">
        <table className="min-w-full divide-y divide-border border border-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Risk Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Margin Ratio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Action Required</th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Low</td>
              <td className="px-6 py-4 whitespace-nowrap">150%+</td>
              <td className="px-6 py-4 whitespace-nowrap">Continue monitoring</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Medium</td>
              <td className="px-6 py-4 whitespace-nowrap">120-150%</td>
              <td className="px-6 py-4 whitespace-nowrap">Monitor closely</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">High</td>
              <td className="px-6 py-4 whitespace-nowrap">100-120%</td>
              <td className="px-6 py-4 whitespace-nowrap">Consider reducing position</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">Critical</td>
              <td className="px-6 py-4 whitespace-nowrap">&lt;100%</td>
              <td className="px-6 py-4 whitespace-nowrap">Immediate action required</td>
            </tr>
          </tbody>
        </table>
      </div>

      <hr />

      <h2 id="preventing-margin-calls" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Preventing Margin Calls</h2>
      <p>Prevention is the best strategy for managing margin call risk. Here are key strategies to avoid margin calls:</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Capital Management</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Keep sufficient capital in reserve for market volatility</li>
        <li>Don't use all available margin capacity</li>
        <li>Monitor your margin utilization regularly</li>
        <li>Add capital when needed to maintain buffer</li>
      </ul>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Position Sizing</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Size positions appropriately for your account size</li>
        <li>Don't overextend your margin capacity</li>
        <li>Consider the impact of adverse price movements</li>
        <li>Use position sizing to control risk exposure</li>
      </ul>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Risk Controls</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Set stop-loss orders to limit downside risk</li>
        <li>Use trailing stops to protect profits</li>
        <li>Monitor market conditions and position performance</li>
        <li>Have a plan for managing margin calls</li>
      </ul>

      <hr />

      <h2 id="margin-strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Margin Trading Strategies</h2>
      <p>Successful margin trading requires careful strategy and risk management. Here are some effective approaches:</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Conservative Strategy</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Use low leverage ratios (2:1 to 3:1)</li>
        <li>Keep high margin buffer (150%+ maintenance margin ratio)</li>
        <li>Focus on high-probability trades</li>
        <li>Use strict risk management rules</li>
      </ul>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Moderate Strategy</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Use moderate leverage ratios (5:1 to 7:1)</li>
        <li>Maintain adequate margin buffer (120-150% maintenance margin ratio)</li>
        <li>Balance risk and reward potential</li>
        <li>Use active risk management</li>
      </ul>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Aggressive Strategy</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Use higher leverage ratios (10:1+)</li>
        <li>Accept higher margin call risk</li>
        <li>Requires professional-level risk management</li>
        <li>Only for experienced traders</li>
      </ul>

      <hr />

      <h2 id="faq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Maintenance Margin FAQs</h2>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">What happens if I get a margin call?</h3>
      <p>If you receive a margin call, you must either deposit more money into your account or close some positions to meet the maintenance margin requirement. If you don't act quickly, your broker may close positions for you.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">How can I avoid margin calls?</h3>
      <p>To avoid margin calls, keep sufficient capital in reserve, don't overextend your margin capacity, use stop-loss orders, and monitor your positions closely. Always maintain a margin buffer above the minimum requirement.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">What's the difference between initial margin and maintenance margin?</h3>
      <p>Initial margin is the amount required to open a position, while maintenance margin is the minimum amount you must maintain to keep the position open. Maintenance margin is typically lower than initial margin.</p>
      
      <h3 className="text-xl font-semibold text-foreground mt-6">Can I lose more than my initial investment with margin?</h3>
      <p>Yes, with margin trading you can lose more than your initial investment. This is why risk management is so important. Always use stop-loss orders and never risk more than you can afford to lose.</p>

      <div className="text-sm italic text-center mt-8 pt-4 border-t border-border">
        <p>This tool is provided by mycalculating.com. Always consult with a financial advisor before making investment decisions.</p>
      </div>
    </section>
  );
}
