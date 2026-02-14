"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingDown, Clock, AlertCircle, Calculator, Activity, Trophy } from 'lucide-react';

interface BowlingStrikeRateMetrics {
    strikeRate: number;
    ballsPerWicket: number;
    wickets: number;
    totalBalls: number;
    rating: {
        label: string;
        color: string;
        description: string;
    };
}

export default function BowlingStrikeRateCalculatorInteractive() {
    const [totalBalls, setTotalBalls] = useState<string>('');
    const [wickets, setWickets] = useState<string>('');
    const [format, setFormat] = useState<string>('test');
    const [metrics, setMetrics] = useState<BowlingStrikeRateMetrics | null>(null);
    const [error, setError] = useState<string | null>(null);

    const calculateStrikeRate = () => {
        setError(null);

        const balls = parseInt(totalBalls);
        const wick = parseInt(wickets);

        if (isNaN(balls) || isNaN(wick)) {
            setError("Please enter valid numbers.");
            return;
        }

        if (balls <= 0) {
            setError("Total balls must be greater than 0.");
            return;
        }

        if (wick < 0) {
            setError("Wickets cannot be negative.");
            return;
        }

        if (wick > 10) {
            // While theoretically possible in a match context if bowling multiple innings, usually per innings constraint. 
            // But let's allow >10 for career stats. 
            // Just a soft warning? No, let's allow it.
        }

        // Strike Rate = Balls / Wickets
        // If wickets is 0, SR is infinite. Handle this.
        let strikeRate = 0;
        if (wick === 0) {
            strikeRate = Infinity;
        } else {
            strikeRate = balls / wick;
        }

        // Rating Logic
        let rating = { label: "Standard", color: "text-blue-600", description: "Average wicket-taking ability." };

        if (wick === 0) {
            rating = { label: "No Wickets", color: "text-gray-500", description: "Keep trying!" };
        } else {
            if (format === 't20') {
                // T20: Taking a wicket every 2-3 overs (12-18 balls) is great.
                if (strikeRate <= 12) rating = { label: "Lethal", color: "text-purple-600", description: "Wicket every 2 overs!" };
                else if (strikeRate <= 18) rating = { label: "Excellent", color: "text-green-600", description: "Consistent threat." };
                else if (strikeRate <= 24) rating = { label: "Good", color: "text-blue-600", description: "Standard T20 striker." };
                else rating = { label: "Defensive", color: "text-yellow-600", description: "Struggling to break partnerships." };
            } else if (format === 'odi') {
                // ODI: SR < 30 is amazing (Wicket every 5 overs).
                if (strikeRate <= 25) rating = { label: "World Class", color: "text-purple-600", description: "Starc / Shami level." };
                else if (strikeRate <= 35) rating = { label: "Very Good", color: "text-green-600", description: "Regular breakthroughs." };
                else if (strikeRate <= 45) rating = { label: "Average", color: "text-blue-600", description: "Container role." };
                else rating = { label: "High", color: "text-yellow-600", description: "Needs more bite." };
            } else { // Test
                // Test: SR < 50 is legendary (Steyn/Marshall).
                if (strikeRate <= 45) rating = { label: "Legendary", color: "text-purple-600", description: "Steyn/Marshall tier." };
                else if (strikeRate <= 60) rating = { label: "Excellent", color: "text-green-600", description: "Match winner." };
                else if (strikeRate <= 75) rating = { label: "Good", color: "text-blue-600", description: "Solid test bowler." };
                else rating = { label: "Toil", color: "text-yellow-600", description: "Hard work for wickets." };
            }
        }

        setMetrics({
            strikeRate,
            ballsPerWicket: strikeRate,
            wickets: wick,
            totalBalls: balls,
            rating
        });
    };

    useEffect(() => {
        if (totalBalls && wickets && !error) {
            const delayDebounceFn = setTimeout(() => {
                if (!isNaN(parseInt(totalBalls)) && !isNaN(parseInt(wickets))) {
                    calculateStrikeRate();
                }
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [totalBalls, wickets, format]);

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-blue-600" />
                        Bowling Stats Input
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
                                placeholder="e.g. 156"
                                value={totalBalls}
                                onChange={(e) => setTotalBalls(e.target.value)}
                                type="number"
                            />
                            <p className="text-xs text-muted-foreground">Or calculate from overs: 26 overs = 156 balls.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="wickets">Wickets Taken</Label>
                            <Input
                                id="wickets"
                                placeholder="e.g. 4"
                                value={wickets}
                                onChange={(e) => setWickets(e.target.value)}
                                type="number"
                            />
                            <p className="text-xs text-muted-foreground">Total legal wickets credited to bowler.</p>
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
                        onClick={calculateStrikeRate}
                        disabled={!totalBalls || !wickets}
                    >
                        Calculate Strike Rate
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
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Strike Rate</span>
                                        <Clock className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                        {metrics.strikeRate === Infinity ? "∞" : metrics.strikeRate.toFixed(1)}
                                    </div>
                                    <div className="text-xs text-gray-600/80 dark:text-gray-300 mt-1">
                                        balls per wicket
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className={`bg-gradient-to-br border ${metrics.rating.color.includes('green') || metrics.rating.color.includes('purple') ? 'from-green-50 to-emerald-50 border-green-200 dark:from-green-950 dark:to-emerald-950 dark:border-green-800' : metrics.rating.color.includes('yellow') ? 'from-orange-50 to-yellow-50 border-orange-200 dark:from-orange-950 dark:to-yellow-950 dark:border-orange-800' : 'from-blue-50 to-cyan-50 border-blue-200 dark:from-blue-950 dark:to-cyan-950 dark:border-blue-800'}`}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-sm font-medium ${metrics.rating.color} opacity-80`}>Potency Rating</span>
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
                                <CardTitle className="text-lg">Performance Analysis</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-sm text-muted-foreground">Wicket Frequency</span>
                                    <span className="font-medium">Every {metrics.strikeRate === Infinity ? "N/A" : Math.round(metrics.strikeRate)} balls</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-sm text-muted-foreground">Balls Bowled</span>
                                    <span className="font-medium">{metrics.totalBalls}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-sm text-muted-foreground">Wickets Taken</span>
                                    <span className="font-medium">{metrics.wickets}</span>
                                </div>

                                <div className="mt-4 p-4 bg-muted rounded-lg border border-border/50">
                                    <p className="text-sm">
                                        <strong>Tactical Insight:</strong>
                                        {metrics.strikeRate === Infinity ?
                                            " You haven't taken a wicket yet. Keep bowling tight lines to induce mistakes." :
                                            metrics.strikeRate < (format === 'test' ? 60 : format === 'odi' ? 40 : 20) ?
                                                ` You are attacking aggressively. Taking a wicket every ${metrics.strikeRate.toFixed(0)} balls is lethal in ${format.toUpperCase()}.` :
                                                ` You are playing a holding role. Taking a wicket every ${metrics.strikeRate.toFixed(0)} balls is steady, but focus on bowling partnerships.`
                                        }
                                    </p>
                                </div>

                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg bg-muted/20">
                        <Calculator className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold text-muted-foreground">Enter Bowling Figures</h3>
                        <p className="text-sm text-muted-foreground/70 max-w-xs mt-2">
                            Find out how often you take a wicket compared to legends of the game.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
