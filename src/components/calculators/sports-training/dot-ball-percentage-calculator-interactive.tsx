"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingDown, EyeOff, AlertCircle, Calculator, Activity, Trophy, Ban } from 'lucide-react';

interface DotBallMetrics {
    dotPercentage: number;
    scoringPercentage: number;
    totalBalls: number;
    expectedDots: number; // For comparison
    rating: {
        label: string;
        color: string;
        description: string;
    };
}

export default function DotBallPercentageCalculatorInteractive() {
    const [totalBalls, setTotalBalls] = useState<string>('');
    const [dotBalls, setDotBalls] = useState<string>('');
    const [format, setFormat] = useState<string>('t20');
    const [metrics, setMetrics] = useState<DotBallMetrics | null>(null);
    const [error, setError] = useState<string | null>(null);

    const calculateDots = () => {
        setError(null);

        const total = parseInt(totalBalls);
        const dots = parseInt(dotBalls);

        if (isNaN(total) || isNaN(dots)) {
            setError("Please enter valid numbers for balls.");
            return;
        }

        if (total <= 0) {
            setError("Total balls must be greater than 0.");
            return;
        }

        if (dots > total) {
            setError(`Dot balls (${dots}) cannot exceed total balls (${total}).`);
            return;
        }

        const dotPercentage = (dots / total) * 100;
        const scoringPercentage = 100 - dotPercentage;

        // Rating Logic
        let rating = { label: "Standard", color: "text-blue-600", description: "Average consistency." };

        if (format === 't20') {
            // T20: High dot % is gold. 40-50% is elite.
            if (dotPercentage >= 50) rating = { label: "Elite Control", color: "text-green-600", description: "Choking the opposition." };
            else if (dotPercentage >= 40) rating = { label: "Excellent", color: "text-emerald-600", description: "Match-winning pressure." };
            else if (dotPercentage >= 30) rating = { label: "Average", color: "text-yellow-600", description: "Acceptable for T20." };
            else rating = { label: "Leaking Runs", color: "text-red-600", description: "Not enough pressure." };
        } else if (format === 'odi') {
            if (dotPercentage >= 60) rating = { label: "World Class", color: "text-green-600", description: "Exceptional discipline." };
            else if (dotPercentage >= 50) rating = { label: "Very Good", color: "text-emerald-600", description: "Building solid pressure." };
            else if (dotPercentage >= 40) rating = { label: "Average", color: "text-yellow-600", description: "Standard ODI spell." };
            else rating = { label: "Below Par", color: "text-red-600", description: "Easy rotation allowed." };
        } else { // Test
            if (dotPercentage >= 80) rating = { label: "Metronomic", color: "text-green-600", description: "McGrath-like precision." };
            else if (dotPercentage >= 70) rating = { label: "Controlled", color: "text-emerald-600", description: "Good test match line." };
            else if (dotPercentage >= 60) rating = { label: "Average", color: "text-yellow-600", description: "Standard test bowling." };
            else rating = { label: "Loose", color: "text-red-600", description: "Releasing pressure often." };
        }

        setMetrics({
            dotPercentage,
            scoringPercentage,
            totalBalls: total,
            expectedDots: total * (format === 't20' ? 0.4 : format === 'odi' ? 0.55 : 0.75),
            rating
        });
    };

    useEffect(() => {
        if (totalBalls && dotBalls && !error) {
            const delayDebounceFn = setTimeout(() => {
                if (!isNaN(parseInt(totalBalls)) && !isNaN(parseInt(dotBalls))) {
                    if (parseInt(dotBalls) <= parseInt(totalBalls)) {
                        calculateDots();
                    }
                }
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [totalBalls, dotBalls, format]);

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

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="totalBalls">Total Balls Bowled</Label>
                            <Input
                                id="totalBalls"
                                placeholder="e.g. 24"
                                value={totalBalls}
                                onChange={(e) => setTotalBalls(e.target.value)}
                                type="number"
                            />
                            <p className="text-xs text-muted-foreground">Excludes wide balls (usually), but includes no-balls if they were hit.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dotBalls">Dot Balls Bowled</Label>
                            <Input
                                id="dotBalls"
                                placeholder="e.g. 12"
                                value={dotBalls}
                                onChange={(e) => setDotBalls(e.target.value)}
                                type="number"
                            />
                            <p className="text-xs text-muted-foreground">Deliveries with 0 runs scored (including leg byes/byes, as they don't count against bowler).</p>
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
                        onClick={calculateDots}
                        disabled={!totalBalls || !dotBalls}
                    >
                        Calculate Impact
                    </Button>
                </CardContent>
            </Card>

            <div className="space-y-6">
                {metrics ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950 dark:to-slate-950 border-gray-200 dark:border-gray-800">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dot Ball %</span>
                                        <Ban className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                        {metrics.dotPercentage.toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-gray-600/80 dark:text-gray-300 mt-1">
                                        of deliveries
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className={`bg-gradient-to-br border ${metrics.rating.color.includes('green') ? 'from-green-50 to-emerald-50 border-green-200 dark:from-green-950 dark:to-emerald-950 dark:border-green-800' : metrics.rating.color.includes('red') ? 'from-red-50 to-orange-50 border-red-200 dark:from-red-950 dark:to-orange-950 dark:border-red-800' : 'from-blue-50 to-cyan-50 border-blue-200 dark:from-blue-950 dark:to-cyan-950 dark:border-blue-800'}`}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-sm font-medium ${metrics.rating.color} opacity-80`}>Discipline Rating</span>
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
                                <CardTitle className="text-lg">Metric Analysis</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="flex items-center gap-2"><Ban className="h-4 w-4 text-gray-500" /> Pressure Building (Dots)</span>
                                        <span>{metrics.dotPercentage.toFixed(0)}%</span>
                                    </div>
                                    <Progress value={metrics.dotPercentage} className="h-2 bg-muted [&>div]:bg-gray-600" />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="flex items-center gap-2"><Activity className="h-4 w-4 text-orange-500" /> Scoring Shots</span>
                                        <span>{metrics.scoringPercentage.toFixed(0)}%</span>
                                    </div>
                                    <Progress value={metrics.scoringPercentage} className="h-2 bg-muted [&>div]:bg-orange-500" />
                                </div>

                                <div className="mt-4 p-4 bg-muted rounded-lg border border-border/50">
                                    <p className="text-sm">
                                        <strong>Tactical Insight:</strong> In {format.toUpperCase()}, an average bowler delivers around {Math.round(metrics.expectedDots / metrics.totalBalls * metrics.totalBalls)} dot balls in a spell of this length.
                                        {metrics.dotPercentage > (metrics.expectedDots / metrics.totalBalls * 100)
                                            ? " You are exceeding the average, creating significant pressure."
                                            : " You are slightly below average, batsmen are rotating strike easily."}
                                    </p>
                                </div>

                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg bg-muted/20">
                        <Calculator className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold text-muted-foreground">Enter Field Stats</h3>
                        <p className="text-sm text-muted-foreground/70 max-w-xs mt-2">
                            Input total balls and dot balls to visualize the pressure your bowling is creating.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
