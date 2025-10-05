
import type { ComponentType } from 'react';
import type { BmiChart } from '@/components/learning-hub/charts/bmi-chart';
import type { CompoundInterestChart } from '@/components/learning-hub/charts/compound-interest-chart';
import type { AprVsApyChart } from '@/components/learning-hub/charts/apr-vs-apy-chart';
import type { NewtonsSecondLawChart } from '@/components/learning-hub/charts/newtons-second-law-chart';
import type { PressureUnitsChart } from '@/components/learning-hub/charts/pressure-units-chart';

export interface LearningHubArticle {
  slug: string;
  title: string;
  Icon: string;
  content: string;
  chartComponent?: ComponentType;
}

// Chart components are dynamically imported in the page, so we just reference their names here for mapping.
export const articles: LearningHubArticle[] = [
  {
    slug: "what-is-compound-interest",
    title: "What is Compound Interest?",
    Icon: "PiggyBank",
    chartComponent: "CompoundInterestChart" as any,
    content: `
      <h3 class="text-xl font-semibold mb-2">What is Compound Interest?</h3>
      <p>Albert Einstein is famously said to have called compound interest "the eighth wonder of the world," adding, "He who understands it, earns it; he who doesn't, pays it." This single idea is the quiet engine behind almost every story of long-term wealth creation. It’s the financial principle that allows you to build a substantial nest egg for retirement, save for a child's college education, or achieve financial independence.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">Simple vs. Compound Interest</h4>
      <p>To understand compound interest, it's easiest to first understand simple interest. Simple interest is calculated only on the initial amount of money (the principal). In contrast, compound interest is "interest on interest"—it's calculated on the principal amount plus all of the accumulated interest from previous periods.</p>

      <h4 class="font-semibold mt-6 mb-2 text-lg">Example: The Snowball Effect</h4>
      <p>Imagine you invest $1,000 at a 10% annual interest rate. With simple interest, you would earn a flat $100 every year. After 20 years, you'd have your original $1,000 plus $2,000 in interest for a total of $3,000.</p>
      <p>With compound interest, the story is very different. After the first year, you have $1,100. In the second year, you earn 10% on the new total ($1,100), which is $110. Your new total is $1,210. This snowball effect continues, and after 20 years, your investment would be worth approximately $6,727. The chart below visualizes this dramatic difference.</p>
    `
  },
  {
    slug: "apr-vs-apy",
    title: "Difference between APR and APY",
    Icon: "Percent",
    chartComponent: "AprVsApyChart" as any,
    content: `
      <h3 class="text-xl font-semibold mb-2">APR vs. APY: What's the Real Rate?</h3>
      <p>While APR (Annual Percentage Rate) and APY (Annual Percentage Yield) both represent interest rates, they tell you two different stories about how your money grows or how much you pay in interest. Understanding the difference is crucial for making smart financial decisions.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">APR (Annual Percentage Rate)</h4>
      <p>APR is the simple, annual interest rate charged for borrowing, or earned through an investment. It represents the yearly cost of a loan or the yearly return on an investment, <strong>without</strong> taking the effect of compounding into account. It's the rate you'll most often see advertised for mortgages, auto loans, and credit cards.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">APY (Annual Percentage Yield)</h4>
      <p>APY represents the real rate of return you will earn in a year because it <strong>includes</strong> the effect of compound interest. APY will always be greater than or equal to the APR. For savers and investors, APY is the more important figure as it reflects the true earning potential of your money.</p>

      <h4 class="font-semibold mt-6 mb-2 text-lg">Why the Difference Matters: An Example</h4>
      <p>Imagine you deposit $1,000 into a savings account with a 5% APR that compounds monthly. While the APR is 5%, the APY is calculated as \`(1 + 0.05/12)^12 - 1\`, which equals 5.116%. This means by the end of the year, your actual earnings will reflect a 5.116% return due to the monthly compounding. The chart below shows how this small percentage difference can lead to significantly different outcomes over time.</p>
    `
  },
  {
    slug: "what-is-bmi",
    title: "What is BMI and Why It Matters",
    Icon: "HeartPulse",
    chartComponent: "BmiChart" as any,
    content: `
      <h3 class="text-xl font-semibold mb-2">What is Body Mass Index (BMI)?</h3>
      <p>Body Mass Index (BMI) is a simple, widely used screening tool that measures a person's weight in relation to their height. It provides a numerical value that helps to categorize whether an individual is underweight, at a healthy weight, overweight, or obese.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">The Formula</h4>
      <p>BMI is calculated using a person's weight and height. The formula is:</p>
      <p class="font-mono p-4 bg-muted rounded-md text-base my-2">BMI = weight (kg) / [height (m)]²</p>
      <p>For those using imperial units, the formula is \`BMI = (weight (lbs) / [height (in)]²) * 703\`.</p>

      <h4 class="font-semibold mt-6 mb-2 text-lg">Standard BMI Categories</h4>
      <p>For adults, the BMI value is interpreted using the standard weight status categories shown in the chart below. A higher BMI is generally associated with higher body fatness.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">Why It Matters</h4>
       <p>While BMI is a screening tool and not a diagnostic one, it is a good indicator of potential health risks. A high BMI is associated with an increased risk of developing several chronic conditions, including cardiovascular diseases, type 2 diabetes, and high blood pressure.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">Limitations of BMI</h4>
       <p>It's important to recognize that BMI is not a perfect measure. Its main limitation is that it does not distinguish between fat and muscle mass. A very muscular athlete, for example, may have a high BMI that classifies them as "overweight" even though they have a very low body fat percentage. For this reason, other metrics like waist-to-hip ratio or body fat percentage can provide a more complete picture.</p>
    `
  },
  {
    slug: "newtons-laws-of-motion",
    title: "Newton’s Laws of Motion – Explained Simply",
    Icon: "BookOpen",
    chartComponent: "NewtonsSecondLawChart" as any,
    content: `
      <h3 class="text-xl font-semibold mb-2">An Introduction to Newton's Laws</h3>
      <p>Published by Sir Isaac Newton in 1687, these three laws of motion form the bedrock of classical mechanics. They describe the relationship between a physical body and the forces acting upon it, and how the body responds to those forces.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">First Law: The Law of Inertia</h4>
      <p><i>"An object will remain at rest or in uniform motion in a straight line unless acted upon by an external force."</i></p>
      <p class="mt-2 text-base">In simple terms, things tend to keep doing what they're already doing. If an object is still, it will stay still. If it's moving, it will keep moving at the same speed and in the same direction, unless something pushes or pulls on it.</p>

      <h4 class="font-semibold mt-6 mb-2 text-lg">Second Law: Force, Mass, and Acceleration</h4>
      <p><i>"The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass."</i></p>
      <p class="mt-2 text-base">This is famously expressed by the formula: \`F = ma\`. This law tells us that to make an object accelerate (change its velocity), you need to apply a net force. The chart below illustrates this relationship: for a constant mass, applying more force results in greater acceleration.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">Third Law: Action and Reaction</h4>
      <p><i>"For every action, there is an equal and opposite reaction."</i></p>
      <p class="mt-2 text-base">This law means that forces always occur in pairs. If object A exerts a force on object B, then object B simultaneously exerts a force of the same magnitude but in the opposite direction on object A. When a rocket expels gas downwards (the action), the gas pushes the rocket upwards (the reaction), allowing it to launch into space.</p>
    `
  },
  {
    slug: "units-of-pressure",
    title: "Units of Pressure and Their Conversion Chart",
    Icon: "ArrowRightLeft",
    chartComponent: "PressureUnitsChart" as any,
    content: `
      <h3 class="text-xl font-semibold mb-2">A Guide to Common Units of Pressure</h3>
      <p>Pressure is defined as the force applied perpendicular to the surface of an object per unit area over which that force is distributed. Many different units are used to measure pressure, each with its own history and common application.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">Common Units and Their Uses</h4>
       <ul class="list-disc list-inside text-base space-y-4 mt-2">
        <li><b>Pascal (Pa):</b> The standard unit of pressure in the SI system. It is defined as one newton per square meter (N/m²). Because it's a very small unit, it's often used with prefixes like kilopascal (kPa).</li>
        <li><b>Pounds per Square Inch (psi):</b> The standard unit in the United States, commonly used for measuring tire pressure and in industrial applications.</li>
        <li><b>Standard Atmosphere (atm):</b> Defined as the approximate pressure of the atmosphere at sea level. 1 atm ≈ 101,325 Pa ≈ 14.7 psi.</li>
        <li><b>Bar:</b> Very close in value to one atmosphere, the bar is widely used in meteorology and for tire pressure in Europe. 1 bar = 100,000 Pa.</li>
        <li><b>Torr (mmHg):</b> Originally defined as one millimeter of mercury, this unit is most often used for measuring high vacuums. 760 Torr ≈ 1 atm.</li>
      </ul>
      <p class="mt-4">The chart below visualizes the vast difference in magnitude between these common units when converted to Pascals.</p>
    `
  }
];
