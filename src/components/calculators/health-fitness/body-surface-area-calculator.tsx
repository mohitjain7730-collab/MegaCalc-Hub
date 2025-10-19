'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ruler } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  height: z.number().positive('Height must be positive'),
  weight: z.number().positive('Weight must be positive'),
  gender: z.enum(['male', 'female']),
  age: z.number().positive('Age must be positive'),
  formula: z.enum(['mosteller', 'du_bois', 'haycock', 'gehan_george']),
  unitSystem: z.enum(['metric', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

export default function BodySurfaceAreaCalculator() {
  const [result, setResult] = useState<{
    bsa: number;
    bsaPerKg: number;
    interpretation: string;
    clinicalSignificance: string[];
    applications: string[];
    comparison: {
      average: number;
      percentile: string;
    };
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      height: undefined,
      weight: undefined,
      gender: undefined,
      age: undefined,
      formula: 'mosteller',
      unitSystem: 'metric',
    },
  });

  const calculateBSA = (height: number, weight: number, formula: string, unitSystem: string) => {
    let h = height;
    let w = weight;

    // Convert to metric if needed
    if (unitSystem === 'imperial') {
      h = height * 2.54; // inches to cm
      w = weight * 0.453592; // pounds to kg
    }

    let bsa = 0;

    switch (formula) {
      case 'mosteller':
        // Mosteller formula: √((height × weight) / 3600)
        bsa = Math.sqrt((h * w) / 3600);
        break;
      case 'du_bois':
        // Du Bois formula: 0.007184 × height^0.725 × weight^0.425
        bsa = 0.007184 * Math.pow(h, 0.725) * Math.pow(w, 0.425);
        break;
      case 'haycock':
        // Haycock formula: 0.024265 × height^0.3964 × weight^0.5378
        bsa = 0.024265 * Math.pow(h, 0.3964) * Math.pow(w, 0.5378);
        break;
      case 'gehan_george':
        // Gehan & George formula: 0.0235 × height^0.42246 × weight^0.51456
        bsa = 0.0235 * Math.pow(h, 0.42246) * Math.pow(w, 0.51456);
        break;
      default:
        bsa = Math.sqrt((h * w) / 3600); // Default to Mosteller
    }

    return Math.round(bsa * 10000) / 10000; // Round to 4 decimal places
  };

  const getBSAInterpretation = (bsa: number, gender: string, age: number) => {
    let averageBSA = 0;
    
    // Average BSA by gender and age
    if (gender === 'male') {
      if (age < 18) averageBSA = 1.2 + (age * 0.05);
      else if (age < 30) averageBSA = 1.9;
      else if (age < 50) averageBSA = 1.95;
      else averageBSA = 1.9;
    } else {
      if (age < 18) averageBSA = 1.1 + (age * 0.04);
      else if (age < 30) averageBSA = 1.7;
      else if (age < 50) averageBSA = 1.75;
      else averageBSA = 1.7;
    }

    const difference = ((bsa - averageBSA) / averageBSA) * 100;

    if (Math.abs(difference) < 5) {
      return `Your BSA is within the normal range for your age and gender. This indicates a healthy body size and proportion.`;
    } else if (difference > 10) {
      return `Your BSA is significantly above average, which may indicate a larger body frame or higher body weight. Consider discussing with a healthcare provider.`;
    } else if (difference < -10) {
      return `Your BSA is below average, which may indicate a smaller body frame or lower body weight. Ensure you're maintaining adequate nutrition.`;
    } else {
      return `Your BSA is slightly ${difference > 0 ? 'above' : 'below'} average, which is within normal variation for body size and composition.`;
    }
  };

  const getPercentile = (bsa: number, gender: string, age: number) => {
    // Simplified percentile estimation based on typical BSA distributions
    let averageBSA = 0;
    let stdDev = 0;

    if (gender === 'male') {
      if (age < 18) {
        averageBSA = 1.2 + (age * 0.05);
        stdDev = 0.15;
      } else {
        averageBSA = 1.9;
        stdDev = 0.2;
      }
    } else {
      if (age < 18) {
        averageBSA = 1.1 + (age * 0.04);
        stdDev = 0.12;
      } else {
        averageBSA = 1.7;
        stdDev = 0.18;
      }
    }

    const zScore = (bsa - averageBSA) / stdDev;
    
    if (zScore > 2) return '95th+ percentile';
    if (zScore > 1.5) return '90th-95th percentile';
    if (zScore > 1) return '80th-90th percentile';
    if (zScore > 0.5) return '60th-80th percentile';
    if (zScore > 0) return '50th-60th percentile';
    if (zScore > -0.5) return '40th-50th percentile';
    if (zScore > -1) return '20th-40th percentile';
    if (zScore > -1.5) return '10th-20th percentile';
    if (zScore > -2) return '5th-10th percentile';
    return 'Below 5th percentile';
  };

  const onSubmit = (values: FormValues) => {
    const bsa = calculateBSA(values.height, values.weight, values.formula, values.unitSystem);
    const bsaPerKg = bsa / values.weight;
    const interpretation = getBSAInterpretation(bsa, values.gender, values.age);
    const percentile = getPercentile(bsa, values.gender, values.age);

    const clinicalSignificance = [
      'Used for calculating drug dosages in chemotherapy and other medications',
      'Important for determining fluid requirements in burn patients',
      'Used in cardiology for calculating cardiac index and other hemodynamic parameters',
      'Essential for pediatric dosing calculations',
      'Used in research studies for normalizing metabolic parameters',
      'Important for determining appropriate ventilator settings in critical care'
    ];

    const applications = [
      'Medical dosing calculations for medications',
      'Burn injury assessment and fluid resuscitation',
      'Cardiovascular function assessment',
      'Metabolic rate calculations',
      'Research study normalization',
      'Pediatric growth and development assessment'
    ];

    const averageBSA = values.gender === 'male' ? 1.9 : 1.7;

    setResult({
      bsa,
      bsaPerKg: Math.round(bsaPerKg * 10000) / 10000,
      interpretation,
      clinicalSignificance,
      applications,
      comparison: {
        average: averageBSA,
        percentile,
      },
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField 
              control={form.control} 
              name="unitSystem" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit System</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit system" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="metric">Metric (cm, kg)</SelectItem>
                      <SelectItem value="imperial">Imperial (inches, lbs)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="formula" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BSA Formula</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select formula" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mosteller">Mosteller (Most Common)</SelectItem>
                      <SelectItem value="du_bois">Du Bois</SelectItem>
                      <SelectItem value="haycock">Haycock</SelectItem>
                      <SelectItem value="gehan_george">Gehan & George</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="height" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height ({form.watch('unitSystem') === 'metric' ? 'cm' : 'inches'})</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder={`Enter height in ${form.watch('unitSystem') === 'metric' ? 'cm' : 'inches'}`}
                      {...field} 
                      value={field.value ?? ''} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="weight" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight ({form.watch('unitSystem') === 'metric' ? 'kg' : 'lbs'})</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder={`Enter weight in ${form.watch('unitSystem') === 'metric' ? 'kg' : 'lbs'}`}
                      {...field} 
                      value={field.value ?? ''} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="gender" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="age" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age (years)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter your age"
                      {...field} 
                      value={field.value ?? ''} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
          </div>
          <Button type="submit">Calculate Body Surface Area</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Ruler className="h-8 w-8 text-primary" />
                <CardTitle>Body Surface Area (BSA) Results</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{result.bsa} m²</p>
                  <p className="text-sm text-muted-foreground">Body Surface Area</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{result.bsaPerKg} m²/kg</p>
                  <p className="text-sm text-muted-foreground">BSA per kg Body Weight</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{result.comparison.percentile}</p>
                  <p className="text-sm text-muted-foreground">Percentile Rank</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analysis & Interpretation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{result.interpretation}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Clinical Significance:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                    {result.clinicalSignificance.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Medical Applications:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                    {result.applications.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>
              Body Surface Area (BSA) is calculated using mathematical formulas that estimate the total surface area 
              of the human body based on height and weight measurements. The Mosteller formula is the most commonly 
              used method in clinical practice.
            </p>
            <p>
              Different formulas may yield slightly different results, but they all provide estimates within a 
              reasonable range for medical applications. The choice of formula often depends on the specific 
              clinical context and institutional preferences.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="guide">
          <AccordionTrigger>Complete Guide to Body Surface Area (BSA)</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is Body Surface Area?</h4>
              <p>
                Body Surface Area (BSA) is the total surface area of the human body. It's a crucial measurement 
                in medicine used for calculating drug dosages, determining fluid requirements, and assessing 
                various physiological parameters. BSA provides a more accurate way to normalize measurements 
                across individuals of different sizes than body weight alone.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Common BSA Formulas</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Mosteller Formula:</strong> √((height × weight) / 3600) - Most widely used</li>
                <li><strong>Du Bois Formula:</strong> 0.007184 × height^0.725 × weight^0.425 - Classic formula</li>
                <li><strong>Haycock Formula:</strong> 0.024265 × height^0.3964 × weight^0.5378 - Good for children</li>
                <li><strong>Gehan & George Formula:</strong> 0.0235 × height^0.42246 × weight^0.51456 - Alternative method</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Clinical Applications</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Drug Dosing:</strong> Many medications, especially chemotherapy drugs, are dosed per m²</li>
                <li><strong>Burn Assessment:</strong> Burn severity is often expressed as percentage of total BSA</li>
                <li><strong>Fluid Resuscitation:</strong> Fluid requirements calculated based on BSA</li>
                <li><strong>Cardiac Function:</strong> Cardiac index and other hemodynamic parameters normalized to BSA</li>
                <li><strong>Metabolic Studies:</strong> Metabolic rate and oxygen consumption normalized to BSA</li>
                <li><strong>Pediatric Care:</strong> Growth charts and medication dosing in children</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Normal BSA Ranges</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Adult Males:</strong> 1.7-2.1 m² (average ~1.9 m²)</li>
                <li><strong>Adult Females:</strong> 1.5-1.9 m² (average ~1.7 m²)</li>
                <li><strong>Children:</strong> Varies significantly with age and growth</li>
                <li><strong>Infants:</strong> 0.2-0.3 m² at birth</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Factors Affecting BSA</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Height:</strong> Taller individuals generally have larger BSA</li>
                <li><strong>Weight:</strong> Heavier individuals typically have larger BSA</li>
                <li><strong>Body Composition:</strong> Muscle mass vs. fat mass affects BSA</li>
                <li><strong>Age:</strong> BSA changes with growth and aging</li>
                <li><strong>Gender:</strong> Males typically have larger BSA than females</li>
                <li><strong>Ethnicity:</strong> Some variations exist between populations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Limitations and Considerations</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Formulas provide estimates, not exact measurements</li>
                <li>May not account for body shape variations</li>
                <li>Less accurate in extreme cases (very tall/short, very heavy/thin)</li>
                <li>Different formulas may yield different results</li>
                <li>Should be used as a guide, not absolute truth</li>
                <li>Clinical judgment always important in medical applications</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">When to Use BSA</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Calculating medication dosages (especially chemotherapy)</li>
                <li>Assessing burn injuries and fluid needs</li>
                <li>Evaluating cardiac function and hemodynamics</li>
                <li>Research studies requiring normalization</li>
                <li>Pediatric growth and development assessment</li>
                <li>Metabolic and physiological studies</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related-calculators">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Body Composition</h4>
                <ul className="space-y-1">
                  <li><a href="/category/health-fitness/bmi-calculator" className="text-primary underline">BMI Calculator</a></li>
                  <li><a href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary underline">Body Fat Percentage Calculator</a></li>
                  <li><a href="/category/health-fitness/lean-body-mass-calculator" className="text-primary underline">Lean Body Mass Calculator</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Health Assessment</h4>
                <ul className="space-y-1">
                  <li><a href="/category/health-fitness/ideal-body-weight-calculator" className="text-primary underline">Ideal Body Weight Calculator</a></li>
                  <li><a href="/category/health-fitness/waist-to-height-ratio-calculator" className="text-primary underline">Waist-to-Height Ratio Calculator</a></li>
                  <li><a href="/category/health-fitness/ponderal-index-calculator" className="text-primary underline">Ponderal Index Calculator</a></li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

