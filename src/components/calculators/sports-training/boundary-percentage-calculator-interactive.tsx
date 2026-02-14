"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingDown, TrendingUp, AlertCircle, Calculator, Activity, Trophy, PieChart, Zap } from 'lucide-react';

interface BoundaryMetrics {
    boundaryRuns: number;
    nonBoundaryRuns: number;
    boundaryPercentage: number;
    nonBoundaryPercentage: number;
    foursRuns: number;
    sixesRuns: number;
    rating: {
        label: string;
        color: string;
        description: string;
    };
}

export default function BoundaryPercentageCalculatorInteractive() {
    const [totalRuns, setTotalRuns] = useState<string>('');
    const [fours, setFours] = useState<string>('');
    const [sixes, setSixes] = useState<string>('');
    const [format, setFormat] = useState<string>('t20');
    const [metrics, setMetrics] = useState<BoundaryMetrics | null>(null);
    const [error, setError] = useState<string | null>(null);

    const calculateBoundaryPercentage = () => {
        setError(null);

        // Parse inputs
        const runsInt = parseInt(totalRuns);
        const foursInt = parseInt(fours) || 0; // Default to 0 if empty
        const sixesInt = parseInt(sixes) || 0; // Default to 0 if empty

        if (isNaN(runsInt)) {
            setError("Please enter total runs scored.");
            return;
        }

        if (runsInt <= 0) {
            setError("Total runs must be greater than 0.");
            return;
        }

        const foursRuns = foursInt * 4;
        const sixesRuns = sixesInt * 6;
        const boundaryRuns = foursRuns + sixesRuns;

        if (boundaryRuns > runsInt) {
            setError(`Boundary runs (${boundaryRuns}) cannot exceed total runs (${runsInt}).`);
            return;
        }

        const nonBoundaryRuns = runsInt - boundaryRuns;
        const boundaryPercentage = (boundaryRuns / runsInt) * 100;
        const nonBoundaryPercentage = 100 - boundaryPercentage;

        // Determine Rating
        let rating = { label: "Balanced", color: "text-blue-600", description: "Good mix of boundaries and running." };

        if (format === 't20') {
            if (boundaryPercentage >= 75) rating = { label: "Elite Power Hitter", color: "text-green-600", description: "Dominated by boundaries (Russell/Pollard style)." };
            else if (boundaryPercentage >= 60) rating = { label: "Aggressive", color: "text-emerald-600", description: "Ideal T20 scoring pattern." };
            else if (boundaryPercentage >= 45) rating = { label: "Accumulator", color: "text-yellow-600", description: "Relies on placement (Kohli style)." };
            else rating = { label: "Slow / Anchor", color: "text-orange-600", description: "Possibly struggling to find gaps." };
        } else if (format === 'odi') {
            if (boundaryPercentage >= 65) rating = { label: "Destructive", color: "text-green-600", description: "Winning match single-handedly." };
            else if (boundaryPercentage >= 50) rating = { label: "Very Good", color: "text-emerald-600", description: "Standard modern ODI inning." };
            else if (boundaryPercentage >= 35) rating = { label: "Builder", color: "text-blue-600", description: "Focus on rotation." };
            else rating = { label: "Defensive", color: "text-orange-600", description: "Old school approach." };
        } else { // Test
            if (boundaryPercentage >= 60) rating = { label: "Sehwag-esque", color: "text-green-600", description: "Attacking test batting." };
            else if (boundaryPercentage >= 45) rating = { label: "Positive", color: "text-emerald-600", description: "Looking to score." };
            else if (boundaryPercentage >= 30) rating = { label: "Solid", color: "text-blue-600", description: "Traditional test grinding." };
            else rating = { label: "Blockathon", color: "text-gray-600", description: "Pure survival mode." };
        }

        setMetrics({
            boundaryRuns,
            nonBoundaryRuns,
            boundaryPercentage,
            nonBoundaryPercentage,
            foursRuns,
            sixesRuns,
            rating
        });
    };

    useEffect(() => {
        // Auto calculate if valid
        if (totalRuns && !error) {
            const delayDebounceFn = setTimeout(() => {
                if (!isNaN(parseInt(totalRuns))) {
                    const f = parseInt(fours) || 0;
                    const s = parseInt(sixes) || 0;
                    if ((f * 4 + s * 6) <= parseInt(totalRuns)) {
                        calculateBoundaryPercentage();
                    }
                }
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [totalRuns, fours, sixes, format]);

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-blue-600" />
                        Input Score Details
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
                            <Label htmlFor="totalRuns">Total Runs Scored</Label>
                            <Input
                                id="totalRuns"
                                placeholder="e.g. 50"
                                value={totalRuns}
                                onChange={(e) => setTotalRuns(e.target.value)}
                                type="number"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fours">Number of 4s</Label>
                                <Input
                                    id="fours"
                                    placeholder="e.g. 4"
                                    value={fours}
                                    onChange={(e) => setFours(e.target.value)}
                                    type="number"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sixes">Number of 6s</Label>
                                <Input
                                    id="sixes"
                                    placeholder="e.g. 2"
                                    value={sixes}
                                    onChange={(e) => setSixes(e.target.value)}
                                    type="number"
                                />
                            </div>
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
                        onClick={calculateBoundaryPercentage}
                        disabled={!totalRuns}
                    >
                        Calculate %
                    </Button>
                </CardContent>
            </Card>

            <div className="space-y-6">
                {metrics ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-800">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Boundary %</span>
                                        <PieChart className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <div className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">
                                        {metrics.boundaryPercentage.toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-indigo-600/80 dark:text-indigo-300 mt-1">
                                        of total runs
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className={`bg-gradient-to-br border ${metrics.rating.color.includes('green') ? 'from-green-50 to-emerald-50 border-green-200 dark:from-green-950 dark:to-emerald-950 dark:border-green-800' : 'from-blue-50 to-cyan-50 border-blue-200 dark:from-blue-950 dark:to-cyan-950 dark:border-blue-800'}`}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-sm font-medium ${metrics.rating.color} opacity-80`}>Style Rating</span>
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
                                <CardTitle className="text-lg">Scoring Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="flex items-center gap-2"><Zap className="h-4 w-4 text-orange-500" /> Boundaries</span>
                                        <span>{metrics.boundaryRuns} runs ({metrics.boundaryPercentage.toFixed(0)}%)</span>
                                    </div>
                                    <Progress value={metrics.boundaryPercentage} className="h-2 bg-muted [&>div]:bg-orange-500" />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="flex items-center gap-2"><Activity className="h-4 w-4 text-blue-500" /> Running (1s, 2s, 3s)</span>
                                        <span>{metrics.nonBoundaryRuns} runs ({metrics.nonBoundaryPercentage.toFixed(0)}%)</span>
                                    </div>
                                    <Progress value={metrics.nonBoundaryPercentage} className="h-2 bg-muted [&>div]:bg-blue-500" />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50">
                                    <div className="p-3 bg-muted rounded text-center">
                                        <p className="text-xs text-muted-foreground uppercase font-semibold">Runs in 4s</p>
                                        <p className="text-xl font-bold">{metrics.foursRuns}</p>
                                    </div>
                                    <div className="p-3 bg-muted rounded text-center">
                                        <p className="text-xs text-muted-foreground uppercase font-semibold">Runs in 6s</p>
                                        <p className="text-xl font-bold">{metrics.sixesRuns}</p>
                                    </div>
                                </div>

                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg bg-muted/20">
                        <Calculator className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold text-muted-foreground">Enter Batting Stats</h3>
                        <p className="text-sm text-muted-foreground/70 max-w-xs mt-2">
                            Input total runs and boundaries to analyze the scoring distribution and aggression levels.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
