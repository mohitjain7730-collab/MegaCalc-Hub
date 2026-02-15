'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Activity, AlertCircle, Target, Calculator, Shield, Info, CheckCircle2, TrendingUp, TrendingDown, Users, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
    position: z.enum(["GK", "DEF", "MID", "FWD"]),
    minutesPlayed: z.coerce.number().min(0).max(120),
    goalsScored: z.coerce.number().min(0),
    assists: z.coerce.number().min(0),
    cleanSheet: z.boolean().default(false),
    goalsConceded: z.coerce.number().min(0),
    penaltiesSaved: z.coerce.number().min(0),
    penaltiesMissed: z.coerce.number().min(0),
    ownGoals: z.coerce.number().min(0),
    yellowCards: z.coerce.number().min(0).max(2),
    redCards: z.coerce.number().min(0).max(1),
    saves: z.coerce.number().min(0),
    bonusPoints: z.coerce.number().min(0).max(3),
});

type FormValues = z.infer<typeof formSchema>;

export default function FootballFantasyPointsCalculatorInteractive() {
    const [result, setResult] = useState<{
        totalPoints: number;
        breakdown: { label: string; points: number }[];
        rating: string;
        performanceLevel: string;
        insights: string[];
        recommendation: string;
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            position: "MID",
            minutesPlayed: 90,
            goalsScored: 0,
            assists: 0,
            cleanSheet: false,
            goalsConceded: 0,
            penaltiesSaved: 0,
            penaltiesMissed: 0,
            ownGoals: 0,
            yellowCards: 0,
            redCards: 0,
            saves: 0,
            bonusPoints: 0,
        },
    });

    const calculate = (values: FormValues) => {
        let points = 0;
        const breakdown = [];

        // Minutes
        let minPts = 0;
        if (values.minutesPlayed > 0) {
            minPts = values.minutesPlayed >= 60 ? 2 : 1;
        }
        points += minPts;
        breakdown.push({ label: "Minutes Played", points: minPts });

        // Goals
        let goalPts = 0;
        if (values.position === "GK" || values.position === "DEF") goalPts = values.goalsScored * 6;
        else if (values.position === "MID") goalPts = values.goalsScored * 5;
        else goalPts = values.goalsScored * 4;
        points += goalPts;
        if (goalPts > 0) breakdown.push({ label: "Goals Scored", points: goalPts });

        // Assists
        const assistPts = values.assists * 3;
        points += assistPts;
        if (assistPts > 0) breakdown.push({ label: "Assists", points: assistPts });

        // Clean Sheet
        let csPts = 0;
        if (values.cleanSheet && values.minutesPlayed >= 60) {
            if (values.position === "GK" || values.position === "DEF") csPts = 4;
            else if (values.position === "MID") csPts = 1;
        }
        points += csPts;
        if (csPts > 0) breakdown.push({ label: "Clean Sheet", points: csPts });

        // Goals Conceded
        let gcPts = 0;
        if (values.position === "GK" || values.position === "DEF") {
            gcPts = Math.floor(values.goalsConceded / 2) * -1;
        }
        points += gcPts;
        if (gcPts !== 0) breakdown.push({ label: "Goals Conceded", points: gcPts });

        // Penalties Saved
        const penSavePts = values.penaltiesSaved * 5;
        points += penSavePts;
        if (penSavePts > 0) breakdown.push({ label: "Penalties Saved", points: penSavePts });

        // Penalties Missed
        const penMissPts = values.penaltiesMissed * -2;
        points += penMissPts;
        if (penMissPts !== 0) breakdown.push({ label: "Penalties Missed", points: penMissPts });

        // Cards
        const cardPts = (values.yellowCards * -1) + (values.redCards * -3);
        points += cardPts;
        if (cardPts !== 0) breakdown.push({ label: "Cards", points: cardPts });

        // Own Goals
        const ogPts = values.ownGoals * -2;
        points += ogPts;
        if (ogPts !== 0) breakdown.push({ label: "Own Goals", points: ogPts });

        // Saves
        let savePts = 0;
        if (values.position === "GK") {
            savePts = Math.floor(values.saves / 3);
        }
        points += savePts;
        if (savePts > 0) breakdown.push({ label: "Saves", points: savePts });

        // Bonus
        const bonusPts = values.bonusPoints;
        points += bonusPts;
        if (bonusPts > 0) breakdown.push({ label: "Bonus Points", points: bonusPts });

        // Interpretation
        let rating = "Blank";
        if (points >= 15) rating = "Gameweek Legend";
        else if (points >= 10) rating = "Outstanding Haul";
        else if (points >= 6) rating = "Solid Return";
        else if (points >= 3) rating = "Respectable";
        else if (points <= 0) rating = "Disaster Class";

        let performanceLevel = "Average";
        if (points >= 12) performanceLevel = "Elite";
        else if (points >= 8) performanceLevel = "High";
        else if (points >= 5) performanceLevel = "Good";
        else if (points <= 2) performanceLevel = "Poor";

        // Insights
        const insights = [];
        if (values.minutesPlayed < 60 && points > 5) insights.push("Super sub impact! Huge points in limited time.");
        if (values.position === "DEF" && goalPts > 0) insights.push("Goal-scoring defender is fantasy gold.");
        if (values.bonusPoints === 3) insights.push("Man of the Match performance.");
        if (gcPts < -2) insights.push("Defensive collapse hurt score significantly.");

        let recommendation = "";
        if (points >= 10) recommendation = "Essential Asset. Captaincy material for next week if fixture is good.";
        else if (points >= 6) recommendation = "Keep in team. Delivering consistent returns.";
        else if (points <= 2 && values.minutesPlayed > 60) recommendation = "Monitor form. If blank continues for 3 weeks, consider selling.";
        else recommendation = "Rotation risk or poor form. Bench option.";

        setResult({
            totalPoints: points,
            breakdown,
            rating,
            performanceLevel,
            insights,
            recommendation
        });
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Match Statistics</h2>
                    </CardTitle>
                    <CardDescription>
                        Enter player performance data to calculate fantasy score
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(calculate)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <FormField
                                    control={form.control}
                                    name="position"
                                    render={({ field }) => (
                                        <FormItem className="col-span-1 md:col-span-2">
                                            <FormLabel>Position</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Position" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="GK">Goalkeeper (GK)</SelectItem>
                                                    <SelectItem value="DEF">Defender (DEF)</SelectItem>
                                                    <SelectItem value="MID">Midfielder (MID)</SelectItem>
                                                    <SelectItem value="FWD">Forward (FWD)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="minutesPlayed"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Minutes Played</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="goalsScored"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Goals</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="assists"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Assists</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <div className="flex items-center space-x-2 pt-8">
                                    <FormField
                                        control={form.control}
                                        name="cleanSheet"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 w-full">
                                                <FormControl>
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>
                                                        Clean Sheet?
                                                    </FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="goalsConceded"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Goals Conceded</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="saves"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Saves (GK)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="bonusPoints"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bonus Points</FormLabel>
                                            <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={field.value.toString()}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="0" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="0">0</SelectItem>
                                                    <SelectItem value="1">1</SelectItem>
                                                    <SelectItem value="2">2</SelectItem>
                                                    <SelectItem value="3">3</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                {/* Advanced Stats Accordion or just simpler fields */}
                                <FormField
                                    control={form.control}
                                    name="yellowCards"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Yellow Cards</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <Calculator className="mr-2 h-4 w-4" />
                                Calculate Points
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Star className="h-8 w-8 text-primary fill-primary" />
                                    <div>
                                        <h2 className="text-2xl font-bold">Total Fantasy Points</h2>
                                        <p className="text-muted-foreground">{result.rating}</p>
                                    </div>
                                </div>
                                <div className="text-5xl font-extrabold text-primary">
                                    {result.totalPoints}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Separator className="my-4" />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {result.breakdown.map((item, index) => (
                                    <div key={index} className="flex flex-col p-2 bg-background rounded border">
                                        <span className="text-xs text-muted-foreground uppercase font-bold">{item.label}</span>
                                        <span className={`text-xl font-bold ${item.points > 0 ? "text-green-600" : "text-red-500"}`}>
                                            {item.points > 0 ? "+" : ""}{item.points}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                                    <TrendingUp className="h-6 w-6" />
                                    Performance Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {result.insights.map((insight, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                        <span className="text-sm font-medium">{insight}</span>
                                    </div>
                                ))}
                                {result.insights.length === 0 && <p className="text-sm text-muted-foreground">No specific insights for this performance.</p>}
                            </CardContent>
                        </Card>

                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Target className="h-6 w-6" />
                                    Verdict
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Strategy:</strong> {result.recommendation}
                                    </AlertDescription>
                                </Alert>
                                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm font-semibold mb-2">Efficiency Rating</p>
                                    <Badge variant={result.performanceLevel === "Elite" ? "default" : "secondary"}>
                                        {result.performanceLevel} Value
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
