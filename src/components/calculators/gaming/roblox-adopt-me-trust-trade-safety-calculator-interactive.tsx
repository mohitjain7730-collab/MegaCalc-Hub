'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldAlert, ShieldCheck, Lock, AlertTriangle, UserX } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
    tradeType: z.enum(['trust', 'cross_trade', 'fail_trade', 'add_after', 'giveaway']),
    partner: z.enum(['stranger', 'online_friend', 'irl_friend', 'youtuber']),
    location: z.enum(['in_game', 'discord', 'social_media']),
    promise: z.enum(['robux', 'better_pet', 'code', 'nothing']),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    riskLevel: number; // 0 to 100
    verdict: string;
    verdictColor: string;
    explanation: string;
    action: string;
};

const calculateSafety = (values: FormValues): ResultPayload => {
    let risk = 0;

    // Base Risk by Type
    if (values.tradeType === 'trust') risk += 100; // Trust trades are always scams
    if (values.tradeType === 'fail_trade') risk += 90;
    if (values.tradeType === 'cross_trade') risk += 95; // Against TOS, extremely risky
    if (values.tradeType === 'add_after') risk += 80;
    if (values.tradeType === 'giveaway') risk += 50;

    // Modifiers
    if (values.partner === 'stranger') risk += 20;
    if (values.partner === 'online_friend') risk += 10;
    if (values.partner === 'youtuber') risk += 10; // Impersonators are common
    if (values.partner === 'irl_friend') risk -= 50; // Real life friends are safer (usually)

    if (values.location === 'discord' || values.location === 'social_media') risk += 30;

    if (values.promise === 'robux') risk += 40; // Robux trades are almost always scams
    if (values.promise === 'code') risk += 50;

    // Cap at 100, Min 0
    risk = Math.min(100, Math.max(0, risk));

    let verdict = "SAFE";
    let color = "text-green-500";
    let explanation = "This appears to be a standard, safe interaction.";
    let action = "Proceed with normal caution.";

    if (risk >= 90) {
        verdict = "GUARANTEED SCAM";
        color = "text-red-600";
        explanation = "This trade pattern matches known scam methods perfectly. You will lose your items.";
        action = "BLOCK THIS USER IMMEDIATELY.";
    } else if (risk >= 70) {
        verdict = "CRITICAL RISK";
        color = "text-red-500";
        explanation = "The markers for this trade are extremely dangerous. Do not proceed.";
        action = "Do not trade. Report the user if they persist.";
    } else if (risk >= 40) {
        verdict = "HIGH RISK";
        color = "text-orange-500";
        explanation = "This is suspicious. Why can't the trade be done in a single window?";
        action = "Ask to trade everything in one window. If they refuse, leave.";
    } else if (risk > 10) {
        verdict = "CAUTION";
        color = "text-yellow-500";
        explanation = "Be careful. Verify they are who they say they are.";
        action = "Double check the second trade window.";
    }

    // Override for specific keywords
    if (values.tradeType === 'trust') {
        explanation = "There is no such thing as a valid 'Trust Trade'. It is a made-up term by scammers. You give the item, they leave.";
    }
    if (values.tradeType === 'fail_trade') {
        explanation = "Fail Trades are patched or fake. The trade will go through and you will lose your pet.";
    }

    return {
        riskLevel: risk,
        verdict,
        verdictColor: color,
        explanation,
        action
    };
};

export default function RobloxAdoptMeTrustTradeInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tradeType: 'trust',
            partner: 'stranger',
            location: 'in_game',
            promise: 'better_pet',
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateSafety(values));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Trade Context</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                <FormField
                                    control={form.control}
                                    name="tradeType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>They are asking for a...</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="trust">Trust Trade (Give item first)</SelectItem>
                                                    <SelectItem value="fail_trade">Fail Trade</SelectItem>
                                                    <SelectItem value="cross_trade">Cross Trade (for Robux/Money)</SelectItem>
                                                    <SelectItem value="add_after">"I'll Add After" Trade</SelectItem>
                                                    <SelectItem value="giveaway">"Won a Giveaway" (need to claim)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="partner"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Who is the trader?</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="stranger">Stranger (Server)</SelectItem>
                                                    <SelectItem value="online_friend">Online Friend (Never met IRL)</SelectItem>
                                                    <SelectItem value="youtuber">Famous YouTuber / Admin</SelectItem>
                                                    <SelectItem value="irl_friend">Real Life Friend / Family</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="promise"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>What is promised?</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="better_pet">Better Pet / Dream Pet</SelectItem>
                                                    <SelectItem value="robux">Robux / Gift Card</SelectItem>
                                                    <SelectItem value="code">Cheat Code / Dupe Glitch</SelectItem>
                                                    <SelectItem value="nothing">Nothing / Fair Trade</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 font-bold text-white">
                                    CHECK SAFETY
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
                {result ? (
                    <>
                        <Card className="bg-slate-950 text-white border-slate-800 relative overflow-hidden">
                            <div className={`absolute inset-0 bg-gradient-to-r ${result.riskLevel > 50 ? 'from-red-900/40 to-red-600/10' : 'from-green-900/40 to-green-600/10'} animate-pulse`}></div>
                            <CardHeader className="relative pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Security Assessment</CardTitle>
                            </CardHeader>
                            <CardContent className="relative">
                                <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-4">
                                    <span className={`text-4xl font-black tracking-tight ${result.verdictColor}`}>
                                        {result.verdict}
                                    </span>
                                    <span className="text-xl text-slate-300">
                                        Risk Score: {result.riskLevel}%
                                    </span>
                                </div>
                                <p className="text-lg font-medium text-white mb-6">
                                    {result.explanation}
                                </p>

                                <div className="p-4 bg-white/10 rounded-lg border border-white/20">
                                    <h4 className="flex items-center gap-2 font-bold mb-2">
                                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                        Recommended Action:
                                    </h4>
                                    <p className="text-sm">{result.action}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className={result.riskLevel > 50 ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"}>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    {result.riskLevel > 50 ? <UserX className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                                    Safety Tip
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Remember: If something sounds too good to be true (like a free Shadow Dragon for trust), it is 100% a scam. Legitimate players trade Fair for Fair.
                                </p>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                        <div className="text-center space-y-4 max-w-sm">
                            <Lock className="w-16 h-16 mx-auto opacity-20" />
                            <h3 className="text-lg font-semibold">Scam Detector</h3>
                            <p>Input the details of the suspicious trade to see if you are being targeted.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
