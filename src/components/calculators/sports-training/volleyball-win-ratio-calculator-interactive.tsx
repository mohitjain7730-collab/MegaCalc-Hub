"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Calculator, Info, Target, TrendingUp, AlertCircle, Award } from 'lucide-react';

export default function VolleyballWinRatioCalculatorInteractive() {
    const [matchesWon, setMatchesWon] = useState<string>('');
    const [matchesLost, setMatchesLost] = useState<string>('');
    const [winRatio, setWinRatio] = useState<number | null>(null);

    const calculateWinRatio = () => {
        const won = parseFloat(matchesWon);
        const lost = parseFloat(matchesLost);

        if (!isNaN(won) && !isNaN(lost) && won >= 0 && lost >= 0) {
            const total = won + lost;
            if (total > 0) {
                setWinRatio((won / total) * 100);
            } else {
                setWinRatio(0);
            }
        } else {
            setWinRatio(null);
        }
    };

    const resetCalculator = () => {
        setMatchesWon('');
        setMatchesLost('');
        setWinRatio(null);
    };

    const getRating = (value: number) => {
        if (value >= 75) return { text: 'Elite / Championship Level', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' };
        if (value >= 60) return { text: 'Playoff Contender', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' };
        if (value >= 50) return { text: 'Average', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/20' };
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
                                <Label htmlFor="matchesWon" className="text-sm font-medium">
                                    Matches Won
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="matchesWon"
                                        type="number"
                                        min="0"
                                        placeholder="e.g., 20"
                                        value={matchesWon}
                                        onChange={(e) => setMatchesWon(e.target.value)}
                                        className="pl-10"
                                    />
                                    <Award className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground">Total number of matches your team won.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="matchesLost" className="text-sm font-medium">
                                    Matches Lost
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="matchesLost"
                                        type="number"
                                        min="0"
                                        placeholder="e.g., 5"
                                        value={matchesLost}
                                        onChange={(e) => setMatchesLost(e.target.value)}
                                        className="pl-10"
                                    />
                                    <AlertCircle className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground">Total number of matches your team lost.</p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    onClick={calculateWinRatio}
                                    className="flex-1"
                                    disabled={matchesWon === '' || matchesLost === '' || (parseFloat(matchesWon) === 0 && parseFloat(matchesLost) === 0)}
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
                                <p>You can substitute the word "Matches" with "Sets" if you want to calculate your <strong>Set Win Ratio</strong>—often a better indicator of true dominance than match record alone.</p>
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
                        {winRatio !== null ? (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <h3 className="text-lg font-semibold text-center mb-4">Performance Analysis</h3>

                                <div className="bg-background rounded-lg p-6 text-center shadow-sm border border-border shrink-0">
                                    <p className="text-sm text-muted-foreground mb-1">Win Percentage</p>
                                    <p className="text-5xl font-bold font-mono tracking-tighter text-primary">
                                        {winRatio.toFixed(1)}%
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Record: {matchesWon} - {matchesLost}
                                    </p>

                                    <div className="mt-4 flex justify-center">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRating(winRatio).bg} ${getRating(winRatio).color}`}>
                                            {getRating(winRatio).text}
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
                                                <span>A win ratio above 60% historically indicates strong contention for league titles.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                                <span>Provides the definitive, bottom-line measure of seasonal success.</span>
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
                                                <span>Misses nuance: a 15-0 blowout feels mathematically the same as a 15-13 nailbiter.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                                <span>Weak non-conference schedules often artificially inflate early season win percentages.</span>
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
                                    <p className="text-sm text-muted-foreground">Enter your team's wins and losses to see your overall success rate.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
