'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ruler, Target } from 'lucide-react';

const formSchema = z.object({
	waist: z.number().positive(),
	height: z.number().positive(),
	unit: z.enum(['cm', 'in'])
});

type FormValues = z.infer<typeof formSchema>;

function categorize(whtr: number) {
	return whtr < 0.5
		? { label: 'Healthy', color: 'text-green-600' }
		: { label: 'Increased Risk', color: 'text-red-600' };
}

export default function WaistToHeightRatioCalculator() {
  const [result, setResult] = useState<{ whtr: number; label: string; color: string } | null>(null);
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: { unit: 'cm', waist: undefined as unknown as number, height: undefined as unknown as number }
	});

	const unit = form.watch('unit');

  const onSubmit = (values: FormValues) => {
    const whtr = values.waist / values.height;
    const category = categorize(whtr);
    setResult({ whtr, label: category.label, color: category.color });
  };

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Target className="h-5 w-5" />
						Waist-to-Height Ratio Calculator
					</CardTitle>
					<CardDescription>Waist should be less than half of height.</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="unit"
									render={({ field }) => (
										<FormItem className="md:col-span-2">
											<FormLabel>Units</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select units" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="cm">Centimeters (cm)</SelectItem>
													<SelectItem value="in">Inches (in)</SelectItem>
												</SelectContent>
											</Select>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="waist"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Waist ({unit})</FormLabel>
											<FormControl>
												<Input
													type="number"
													value={field.value ?? ''}
													onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="height"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Height ({unit})</FormLabel>
											<FormControl>
												<Input
													type="number"
													value={field.value ?? ''}
													onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<Button type="submit">Calculate</Button>
						</form>
					</Form>
				</CardContent>
			</Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Ruler className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your WHtR Result</CardTitle>
                  <CardDescription>Metabolic health assessment</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Waist-to-Height Ratio</p>
                  <p className="text-3xl font-bold text-primary">{result.whtr.toFixed(2)}</p>
                </div>
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Category</p>
                  <p className={`text-2xl font-bold ${result.color}`}>{result.label}</p>
                </div>
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Rule of Thumb</p>
                  <p className="text-lg font-semibold">Waist &lt; 0.5 × Height</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">A WHtR below 0.5 generally indicates lower cardiometabolic risk. Values 0.5–0.59 suggest increased risk; ≥ 0.6 indicate high risk.</p>
            </CardContent>
          </Card>
        </div>
      )}

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Ruler className="h-5 w-5" />
						What is WHtR?
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						WHtR = Waist / Height. A value below 0.5 is generally considered healthy.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
