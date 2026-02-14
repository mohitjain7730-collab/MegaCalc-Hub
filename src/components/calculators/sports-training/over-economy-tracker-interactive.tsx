"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingDown, TrendingUp, AlertCircle, Calculator, Activity, Trophy } from 'lucide-react';

interface EconomyMetrics {
    economyRate: number;
    totalBalls: number;
    runsPerBall: number;
    projectedRuns: number;
    rating: {
        label: string;
        color: string;
        description: string;
    };
}

export default function OverEconomyTrackerInteractive() {
    const [overs, setOvers] = useState<string>('');
    const [runs, setRuns] = useState<string>('');
    const [format, setFormat] = useState<string>('t20');
    const [metrics, setMetrics] = useState<EconomyMetrics | null>(null);
    const [error, setError] = useState<string | null>(null);

    const calculateEconomy = () => {
        setError(null);

        // Parse inputs
        const oversFloat = parseFloat(overs);
        const runsInt = parseInt(runs);

        if (isNaN(oversFloat) || isNaN(runsInt)) {
            setError("Please enter valid numbers for overs and runs.");
            return;
        }

        if (oversFloat <= 0) {
            setError("Overs must be greater than 0.");
            return;
        }

        // Validate decimal part of overs (must be .0 to .5)
        const decimalPart = Math.round((oversFloat % 1) * 10);
        if (decimalPart >= 6) {
            setError("Invalid over format. Use .0 to .5 for balls (e.g., 3.4 is 3 overs 4 balls).");
            return;
        }

        const completedOvers = Math.floor(oversFloat);
        const balls = decimalPart;
        const totalBalls = (completedOvers * 6) + balls;
        const totalOversDecimal = totalBalls / 6;

        const economyRate = runsInt / totalOversDecimal;
        const runsPerBall = runsInt / totalBalls;

        // Full quota based on format
        let maxOvers = 4; // T20
        if (format === 'odi') maxOvers = 10;
        if (format === 'test') maxOvers = 0; // Unlimited, usually measure complexity differently

        const projectedRuns = format === 'test' ? 0 : economyRate * maxOvers;

        // Determine Rating
        let rating = { label: "Standard", color: "text-yellow-600", description: "Average performance." };

        if (format === 't20') {
            if (economyRate < 6) rating = { label: "World Class", color: "text-green-600", description: "Exceptional spell, match-winning economy." };
            else if (economyRate < 7.5) rating = { label: "Excellent", color: "text-emerald-600", description: "Very economical, piling pressure." };
            else if (economyRate < 9) rating = { label: "Average", color: "text-yellow-600", description: "Par for modern T20s." };
            else if (economyRate < 11) rating = { label: "Expensive", color: "text-orange-600", description: "Leaking runs, needs containment." };
            else rating = { label: "Very Expensive", color: "text-red-600", description: "Severe run leakage." };
        } else if (format === 'odi') {
            if (economyRate < 4.5) rating = { label: "World Class", color: "text-green-600", description: "Stifling the opposition completely." };
            else if (economyRate < 5.5) rating = { label: "Excellent", color: "text-emerald-600", description: "Great control." };
            else if (economyRate < 6.5) rating = { label: "Average", color: "text-yellow-600", description: "Acceptable in modern ODIs." };
            else if (economyRate < 8) rating = { label: "Expensive", color: "text-orange-600", description: "Putting team under pressure." };
            else rating = { label: "Very Expensive", color: "text-red-600", description: "Costly spell." };
        } else { // Test
            if (economyRate < 2.5) rating = { label: "Miserly", color: "text-green-600", description: "Building immense pressure." };
            else if (economyRate < 3.5) rating = { label: "Controlled", color: "text-emerald-600", description: "Good consistent line and length." };
            else if (economyRate < 4.5) rating = { label: "Loose", color: "text-yellow-600", description: "Allowing easy rotation." };
            else rating = { label: "Expensive", color: "text-red-600", description: "Leaking too many runs for Test cricket." };
        }

        setMetrics({
            economyRate,
            totalBalls,
            runsPerBall,
            projectedRuns,
            rating
        });
    };

    useEffect(() => {
        if (overs && runs) {
            const delayDebounceFn = setTimeout(() => {
                // Auto-calculate if inputs look valid to avoid manual button press repeatedly
                if (!isNaN(parseFloat(overs)) && !isNaN(parseInt(runs))) {
                    calculateEconomy(); // Warning: this might trigger error if partially typed 3.7. Let's rely on button or careful effect? 
                    // Actually user might type 3. (waiting for 3.1). 
                    // We can just calculate and store error or success.
                }
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [overs, runs, format]);


    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-blue-600" />
                        Input Statistics
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="format">Match Format</Label>
                        <Select value={format} onValueChange={setFormat}>
                            <SelectTrigger id="format">
                                <SelectValue placeholder="Select Format" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="t20">T20 / T20I</SelectItem>
                                <SelectItem value="odi">ODI (50 Overs)</SelectItem>
                                <SelectItem value="test">Test Match</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="overs">Overs Bowled</Label>
                            <Input
                                id="overs"
                                placeholder="e.g. 3.4"
                                value={overs}
                                onChange={(e) => setOvers(e.target.value)}
                                type="number"
                                step="0.1"
                            />
                            <p className="text-xs text-muted-foreground">Use 3.4 for 3 overs, 4 balls.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="runs">Runs Conceded</Label>
                            <Input
                                id="runs"
                                placeholder="e.g. 28"
                                value={runs}
                                onChange={(e) => setRuns(e.target.value)}
                                type="number"
                            />
                        </div>
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={calculateEconomy}
                        disabled={!overs || !runs}
                    >
                        Calculate Economy
                    </Button>
                </CardContent>
            </Card>

            <div className="space-y-6">
                {metrics ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Economy Rate</span>
                                        <Activity className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                                        {metrics.economyRate.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-blue-600/80 dark:text-blue-300 mt-1">
                                        Runs per Over
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className={`bg-gradient-to-br border ${metrics.rating.color.includes('green') ? 'from-green-50 to-emerald-50 border-green-200 dark:from-green-950 dark:to-emerald-950 dark:border-green-800' : metrics.rating.color.includes('red') ? 'from-red-50 to-orange-50 border-red-200 dark:from-red-950 dark:to-orange-950 dark:border-red-800' : 'from-yellow-50 to-amber-50 border-yellow-200 dark:from-yellow-950 dark:to-amber-950 dark:border-yellow-800'}`}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-sm font-medium ${metrics.rating.color} opacity-80`}>Performance Rating</span>
                                        <Trophy className={`h-4 w-4 ${metrics.rating.color}`} />
                                    </div>
                                    <div className={`text-3xl font-bold ${metrics.rating.color}`}>
                                        {metrics.rating.label}
                                    </div>
                                    <div className={`text-xs ${metrics.rating.color} opacity-80 mt-1`}>
                                        {metrics.rating.description}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Analysis & Projection</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-purple-500" />
                                        <div>
                                            <p className="text-sm font-medium">Runs Per Ball</p>
                                            <p className="text-xs text-muted-foreground">{metrics.runsPerBall.toFixed(2)} runs</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold">{metrics.runsPerBall.toFixed(2)}</span>
                                    </div>
                                </div>

                                {format !== 'test' && (
                                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Target className="h-5 w-5 text-indigo-500" />
                                            <div>
                                                <p className="text-sm font-medium">Projected Cost (Full Quota)</p>
                                                <p className="text-xs text-muted-foreground">Based on current economy</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold">{Math.round(metrics.projectedRuns)} Runs</span>
                                            <p className="text-xs text-muted-foreground">in {format === 't20' ? '4' : '10'} Overs</p>
                                        </div>
                                    </div>
                                )}

                                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20 rounded-lg">
                                    <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 mb-1 flex items-center gap-2">
                                        <TrendingDown className="h-4 w-4" /> Next Over Strategy
                                    </h4>
                                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                        To lower your economy by 0.5 next over, you need to concede less than {Math.max(0, Math.floor(metrics.economyRate - 0.5))} runs.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg bg-muted/20">
                        <Calculator className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold text-muted-foreground">No Data Calculated</h3>
                        <p className="text-sm text-muted-foreground/70 max-w-xs mt-2">
                            Enter your overs and runs conceded to analyze your bowling economy and receive performance insights.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
