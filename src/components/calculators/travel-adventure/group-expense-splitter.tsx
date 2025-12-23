'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateSplit, formatCurrency } from '@/lib/travel-utils';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import Link from 'next/link';
import { Users, Receipt, PlusCircle, Trash2, Info, Shield, Compass } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';


const expenseSchema = z.object({
    name: z.string().min(1, 'Expense name is required.'),
    amount: z.coerce.number().positive('Amount must be positive.'),
    paidBy: z.string().min(1, 'Payer name is required.'),
    splitBetween: z.array(z.string()).min(1, 'Must split with at least one person.'),
});

const formSchema = z.object({
    participants: z.array(z.object({ name: z.string().min(1, 'Name is required.') })),
    expenses: z.array(expenseSchema),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Backpack Weight Calculator', href: '/category/travel-adventure/backpack-weight-calculator' },
    { name: 'Bus vs. Train Cost Comparison', href: '/category/travel-adventure/bus-vs-train-cost-calculator' },
    { name: 'Car vs. Flight Cost Comparison', href: '/category/travel-adventure/car-vs-flight-calculator' },
    { name: 'Cruise Cost Calculator', href: '/category/travel-adventure/cruise-cost-calculator' },
    { name: 'Fuel Cost Calculator', href: '/category/travel-adventure/fuel-cost-calculator' },
    { name: 'Hiking Calorie Calculator', href: '/category/travel-adventure/hiking-calorie-calculator' },
    { name: 'Hiking Time Calculator', href: '/category/travel-adventure/hiking-time-calculator' },
    { name: 'Hotel Cost Calculator', href: '/category/travel-adventure/hotel-cost-calculator' },
    { name: 'Rental Car Cost Calculator', href: '/category/travel-adventure/rental-car-cost-calculator' },
    { name: 'Trip Budget Calculator', href: '/category/travel-adventure/trip-budget-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function GroupExpenseSplitter() {
    const [result, setResult] = useState<ReturnType<typeof calculateSplit> | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            participants: [{ name: '' }, { name: '' }],
            expenses: [],
        },
    });

    const { fields: participantFields, append: appendParticipant, remove: removeParticipant } = useFieldArray({
        control: form.control,
        name: "participants"
    });

    const { fields: expenseFields, append: appendExpense, remove: removeExpense } = useFieldArray({
        control: form.control,
        name: "expenses"
    });

    const participantNames = form.watch('participants').map(p => p.name).filter(Boolean);

    const onSubmit = (data: FormValues) => {
        const res = calculateSplit(data.participants.map(p => p.name), data.expenses);
        setResult(res);
    };

    const schemaMarkup = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Group Expense Splitter",
        "description": "Fairly split costs for group trips, dinners, and shared expenses. Track who paid for what and calculate who owes whom.",
        "applicationCategory": "TravelApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        }
    };

    return (
        <div className="space-y-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
            />
            <Card>
                <CardHeader>
                    <CardTitle>Group Expense Splitter</CardTitle>
                    <CardDescription>
                        Fairly split costs for group trips, dinners, and shared expenses. Track who paid for what and calculate who owes whom.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* Participants */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Users /> Participants</h3>
                                <div className="space-y-2">
                                    {participantFields.map((field, index) => (
                                        <div key={field.id} className="flex items-center gap-2">
                                            <FormField control={form.control} name={`participants.${index}.name`} render={({ field }) => (
                                                <FormItem className="flex-grow"><FormControl><Input placeholder={`Person ${index + 1}`} {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <Button type="button" variant="destructive" size="icon" onClick={() => removeParticipant(index)} disabled={participantFields.length <= 1}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    ))}
                                </div>
                                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendParticipant({ name: '' })}><PlusCircle className="h-4 w-4 mr-2" />Add Person</Button>
                            </div>

                            <Separator />

                            {/* Expenses */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Receipt /> Expenses</h3>
                                <div className="space-y-4">
                                    {expenseFields.map((field, index) => (
                                        <div key={field.id} className="p-4 border rounded-lg space-y-4">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-medium pt-2">Expense #{index + 1}</h4>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeExpense(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <FormField control={form.control} name={`expenses.${index}.name`} render={({ field }) => (
                                                    <FormItem><FormLabel>Expense Name</FormLabel><FormControl><Input placeholder="e.g., Groceries" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={form.control} name={`expenses.${index}.amount`} render={({ field }) => (
                                                    <FormItem><FormLabel>Amount ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 75.50" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                            </div>
                                            <FormField control={form.control} name={`expenses.${index}.paidBy`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Paid by</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Who paid?" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            {participantNames.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name={`expenses.${index}.splitBetween`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Split between</FormLabel>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                        {participantNames.map(name => (
                                                            <FormField key={name} control={form.control} name={`expenses.${index}.splitBetween`} render={({ field }) => (
                                                                <FormItem className="flex items-center space-x-2 p-2 border rounded-md">
                                                                    <FormControl>
                                                                        <input type="checkbox"
                                                                            className="form-checkbox h-4 w-4 rounded text-primary focus:ring-primary"
                                                                            checked={(field.value || []).includes(name)}
                                                                            onChange={e => {
                                                                                const newValues = e.target.checked
                                                                                    ? [...(field.value || []), name]
                                                                                    : (field.value || []).filter(v => v !== name);
                                                                                field.onChange(newValues);
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className="text-sm font-normal">{name}</FormLabel>
                                                                </FormItem>
                                                            )} />
                                                        ))}
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    ))}
                                </div>
                                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendExpense({ name: '', amount: undefined as any, paidBy: participantNames[0] || '', splitBetween: participantNames })}><PlusCircle className="h-4 w-4 mr-2" />Add Expense</Button>
                            </div>

                            <Button type="submit" size="lg" className="w-full">Calculate Who Owes Whom</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Expense Settlement</CardTitle>
                        <CardDescription>Here's the simplest way to settle all debts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {result.settlements.length === 0 ? (
                            <p className="text-center text-muted-foreground p-4 bg-muted rounded-lg">Everyone is settled up!</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Who Owes</TableHead>
                                        <TableHead>Who Gets Paid</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {result.settlements.map((s, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{s.from}</TableCell>
                                            <TableCell>{s.to}</TableCell>
                                            <TableCell className="text-right font-medium text-primary">{formatCurrency(s.amount)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        <Separator className="my-6" />
                        <h3 className="text-lg font-semibold mb-4">Final Balances</h3>
                        <Table>
                            <TableHeader><TableRow><TableHead>Participant</TableHead><TableHead className="text-right">Balance</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {Object.entries(result.balances).map(([name, balance]) => (
                                    <TableRow key={name}>
                                        <TableCell>{name}</TableCell>
                                        <TableCell className={`text-right font-medium ${balance > 0 ? 'text-green-600' : balance < 0 ? 'text-destructive' : ''}`}>
                                            {balance > 0 ? `Gets back ${formatCurrency(balance)}` : balance < 0 ? `Owes ${formatCurrency(Math.abs(balance))}` : 'Settled'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding the Tool</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg">Participants</h3>
                        <p className="text-muted-foreground">Start by listing everyone involved in the group. Their names will be used to track who paid for items and who needs to settle up.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Expenses</h3>
                        <p className="text-muted-foreground">For each expense, record what it was, the total amount, who paid for it, and who it should be split between. You can select multiple people for each expense.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The calculator uses an algorithm to minimize the number of transactions required to settle all debts. It first calculates the net balance for each person (total spent minus total owed). Then, it matches those who are owed money with those who owe money, creating the simplest possible payment plan.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Compass className="h-5 w-5" />Related Calculators</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {relatedCalculators.map((calc) => (
                        <Link href={calc.href} key={calc.name} className="block hover:no-underline">
                            <Card className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors h-full text-center">
                                <span className="font-semibold">{calc.name}</span>
                            </Card>
                        </Link>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">The Fair Way to Share Costs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">A Guide to Splitting Group Expenses Without the Headache</h2>
                    <p>Traveling with friends or family is one of life's great joys, but managing shared expenses can quickly become a source of tension and confusion. Who paid for dinner? Did everyone chip in for the groceries? Keeping track of IOUs on a napkin is a recipe for disaster. This guide explains the logic behind fair expense splitting and how using a systematic approach can keep your finances and friendships intact.</p>

                    <h3 className="text-lg font-semibold text-foreground">The Challenge of Group Expenses</h3>
                    <p>In any group, different people will pay for different things at different times. Alice might buy the groceries, Bob pays for dinner, and Carol covers the gas. Some expenses might be for the whole group (like a shared rental car), while others are only for a few (like a round of drinks). The goal of an expense splitter is to create a clear ledger of these transactions to determine each person's final balance.</p>

                    <h3 className="text-lg font-semibold text-foreground">Tips for a Smooth Group Trip</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Designate a "Banker":</strong> Have one person responsible for logging all expenses in the calculator as they happen. This avoids a frantic data entry session at the end of the trip.</li>
                        <li><strong>Keep Receipts:</strong> Take photos of receipts. This provides a record in case of any discrepancies later on.</li>
                        <li><strong>Settle Up Periodically:</strong> For longer trips, it's a good idea to calculate the balances and settle up every few days. This prevents a single person from carrying too large of a financial burden.</li>
                        <li><strong>Discuss Shared Costs Upfront:</strong> Before the trip, have a conversation about what will be considered a group expense (e.g., groceries, gas for a shared car) versus a personal expense (e.g., souvenirs, optional activities).</li>
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>What if someone paid for an expense that wasn't for the whole group?</AccordionTrigger>
                            <AccordionContent>
                                <p>That's exactly what the "Split between" checklist is for. When you log the expense, simply uncheck the names of the people who did not participate. The calculator will then only divide the cost among the selected individuals.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>How does the calculator simplify payments?</AccordionTrigger>
                            <AccordionContent>
                                <p>It uses a mathematical algorithm to minimize transactions. Instead of having everyone pay back everyone they owe directly, it consolidates the debt. For example, if A owes B $10 and B owes C $10, the simplified solution is for A to pay C $10 directly, saving a step.</p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">The Group Expense Splitter removes the ambiguity and potential conflict from managing shared finances. By providing a clear and simple system for logging expenses and calculating balances, it ensures fairness and transparency. The tool's ability to generate a minimal set of settlement payments makes the process of squaring up debts efficient and painless, allowing everyone to focus on enjoying the trip.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
