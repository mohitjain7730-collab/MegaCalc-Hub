# Embed Widget Integration Guide

## Overview
All calculators should include the embed widget to allow users to embed the calculator on their websites.

## How to Add Embed Widget to Any Calculator

### 1. Import the EmbedWidget Component
Add this import to your calculator file:
```typescript
import { EmbedWidget } from '@/components/embed-widget';
```

### 2. Add the Widget to Your Calculator
Place the EmbedWidget component at the end of your calculator, just before the closing `</div>` tag:

```typescript
// At the end of your calculator component, before the closing </div>
<EmbedWidget calculatorSlug="your-calculator-slug" calculatorName="Your Calculator Name" />
```

### 3. Example Integration
```typescript
export default function YourCalculator() {
  return (
    <div className="space-y-8">
      {/* Your calculator content */}
      
      <div className="space-y-6">
        <RelatedCalculators />
        <YourGuide />
        <EmbedWidget calculatorSlug="your-calculator-slug" calculatorName="Your Calculator Name" />
      </div>
    </div>
  );
}
```

## Parameters

- `calculatorSlug`: The URL slug for your calculator (e.g., "bmi-calculator")
- `calculatorName`: The display name of your calculator (e.g., "Body Mass Index (BMI) Calculator")

## Widget Features

- Generates embed code with the correct calculator URL
- Includes copy-to-clipboard functionality
- Uses MyCalculating.com branding
- Responsive iframe with proper styling
- SEO-friendly with proper titles and descriptions

## Already Integrated Calculators

✅ Blood Pressure Risk Calculator
✅ Cholesterol Risk Calculator  
✅ Diabetes Risk (Type 2) Calculator
✅ BMI Calculator
✅ Protein Intake Calculator
✅ Meditation Time Progress Tracker Calculator
✅ Work-Life Balance Time Allocation Calculator
✅ Bone Density T-Score Calculator

## Future Calculators

When creating new calculators, always include the EmbedWidget component following the pattern above.
