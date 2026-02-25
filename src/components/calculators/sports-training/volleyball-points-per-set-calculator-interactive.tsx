"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Calculator, Info, Target, TrendingUp, AlertCircle, Activity } from 'lucide-react';

export default function VolleyballPointsPerSetCalculatorInteractive() {
    const [totalPoints, setTotalPoints] = useState<string>('');
    const [totalSets, setTotalSets] = useState<string>('');
    const [pointsPerSet, setPointsPerSet] = useState<number | null>(null);

    const calculatePointsPerSet = () => {
        const points = parseFloat(totalPoints);
        const sets = parseFloat(totalSets);

        if (!isNaN(points) && !isNaN(sets) && sets > 0 && points >= 0) {
            setPointsPerSet(points / sets);
        } else {
            setPointsPerSet(null);
        }
    };

    const resetCalculator = () => {
        setTotalPoints('');
        setTotalSets('');
        setPointsPerSet(null);
    };

    const getRating = (value: number) => {
        if (value >= 24) return { text: 'Excellent', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' };
        if (value >= 21) return { text: 'Good', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' };
        if (value >= 18) return { text: 'Average', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/20' };
        return { text: 'Below Average', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20' };
    };

    return (
        <Card className="shadow-lg border-primary/10">
            <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Calculator className="h-4 w-4 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold">Match Statistics</h3>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="totalPoints" className="text-sm font-medium">
                                    Total Points Scored
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="totalPoints"
                                        type="number"
                                        min="0"
                                        placeholder="e.g., 350"
                                        value={totalPoints}
                                        onChange={(e) => setTotalPoints(e.target.value)}
                                        className="pl-10"
                                    />
                                    <Target className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground">Total points earned by the team or player.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="totalSets" className="text-sm font-medium">
                                    Total Sets Played
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="totalSets"
                                        type="number"
                                        min="1"
                                        placeholder="e.g., 15"
                                        value={totalSets}
                                        onChange={(e) => setTotalSets(e.target.value)}
                                        className="pl-10"
                                    />
                                    <Activity className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground">Number of sets completed in the period.</p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    onClick={calculatePointsPerSet}
                                    className="flex-1"
                                    disabled={!totalPoints || !totalSets || parseFloat(totalSets) <= 0}
                                >
                                    <Calculator className="w-4 h-4 mr-2" />
                                    Calculate
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={resetCalculator}
                                    className="px-4"
                                >
                                    <RefreshCcw className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg flex items-start gap-3 text-sm">
                            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <div className="text-blue-800 dark:text-blue-200">
                                <p className="font-medium mb-1">Did you know?</p>
                                <p>In standard indoor volleyball, a set is won by reaching 25 points. Averaging over 23 points per set typically indicates highly competitive performance.</p>
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
                        {pointsPerSet !== null ? (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <h3 className="text-lg font-semibold text-center mb-4">Performance Analysis</h3>

                                <div className="bg-background rounded-lg p-6 text-center shadow-sm border border-border shrink-0">
                                    <p className="text-sm text-muted-foreground mb-1">Points per Set</p>
                                    <p className="text-5xl font-bold font-mono tracking-tighter text-primary">
                                        {pointsPerSet.toFixed(2)}
                                    </p>

                                    <div className="mt-4 flex justify-center">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRating(pointsPerSet).bg} ${getRating(pointsPerSet).color}`}>
                                            {getRating(pointsPerSet).text}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-background p-4 rounded-lg shadow-sm border border-border">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="h-4 w-4 text-green-500" />
                                            <h4 className="font-medium text-sm">Smart Insights</h4>
                                        </div>
                                        <ul className="space-y-2 text-sm text-muted-foreground">
                                            <li className="flex items-start gap-2">
                                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                                <span>Measures overall scoring efficiency consistently across multiple sets.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                                <span>Useful for individual offensive players or total team offense.</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="bg-background p-4 rounded-lg shadow-sm border border-border">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertCircle className="h-4 w-4 text-amber-500" />
                                            <h4 className="font-medium text-sm">Risk Factors</h4>
                                        </div>
                                        <ul className="space-y-2 text-sm text-muted-foreground">
                                            <li className="flex items-start gap-2">
                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                                <span>Does not factor in opponent quality or points conceded.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                                <span>Shorter fifth sets (to 15) can slightly skew overall averages.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 opacity-50">
                                <Target className="w-16 h-16 text-muted-foreground" />
                                <div>
                                    <h3 className="text-lg font-medium text-muted-foreground">No Data Provided</h3>
                                    <p className="text-sm text-muted-foreground">Enter total points and sets to see your average.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
