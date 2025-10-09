
import type { ComponentType } from 'react';

export interface LearningHubArticle {
  slug: string;
  title: string;
  Icon: string;
  content: string;
  chartComponent?: string;
}

// Chart components are dynamically imported in the page, so we just reference their names here for mapping.
export const articles: LearningHubArticle[] = [
  {
    slug: "what-is-compound-interest",
    title: "What is Compound Interest?",
    Icon: "PiggyBank",
    chartComponent: "CompoundInterestChart",
    content: `
      <h3 class="text-xl font-semibold mb-2">The Eighth Wonder of the World</h3>
      <p>Albert Einstein is famously said to have called compound interest "the eighth wonder of the world," adding, "He who understands it, earns it; he who doesn't, pays it." This single idea is the quiet engine behind almost every story of long-term wealth creation. It’s the financial principle that allows you to build a substantial nest egg for retirement, save for a child's college education, or achieve financial independence.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">1. Definition: Simple vs. Compound Interest</h4>
      <p>To understand compound interest, it's easiest to first understand simple interest. <strong>Simple interest</strong> is calculated only on the initial amount of money (the principal). In contrast, <strong>compound interest</strong> is "interest on interest"—it's calculated on the principal amount plus all of the accumulated interest from previous periods.</p>

      <h4 class="font-semibold mt-6 mb-2 text-lg">2. Formula & Variable Explanations</h4>
      <p>The formula for compound interest is: <strong>A = P(1 + r/n)^(nt)</strong></p>
      <ul class="list-disc list-inside mt-2 space-y-1">
        <li><strong>A:</strong> The future value of the investment/loan, including interest.</li>
        <li><strong>P:</strong> The principal investment amount (the initial deposit or loan amount).</li>
        <li><strong>r:</strong> The annual interest rate (in decimal form).</li>
        <li><strong>n:</strong> The number of times that interest is compounded per year.</li>
        <li><strong>t:</strong> The number of years the money is invested or borrowed for.</li>
      </ul>

      <h4 class="font-semibold mt-6 mb-2 text-lg">3. Example: The Snowball Effect</h4>
      <p>Imagine you invest $1,000 at a 10% annual interest rate. With simple interest, you would earn a flat $100 every year. After 20 years, you'd have your original $1,000 plus $2,000 in interest for a total of $3,000. With compound interest (compounded annually), the story is very different. After the first year, you have $1,100. In the second year, you earn 10% on the new total ($1,100), which is $110. Your new total is $1,210. This snowball effect continues, and after 20 years, your investment would be worth approximately $6,727. The chart below visualizes this dramatic difference.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">4. Real-World Uses</h4>
      <p>Compound interest is the engine behind retirement accounts like 401(k)s and IRAs, high-yield savings accounts, and stock market investments where dividends are reinvested.</p>

      <h4 class="font-semibold mt-6 mb-2 text-lg">5. Related Calculators</h4>
      <ul class="list-disc list-inside space-y-1">
        <li><a href="/category/finance/compound-interest-calculator" class="text-primary underline">Compound Interest Calculator</a></li>
        <li><a href="/category/finance/sip-calculator" class="text-primary underline">SIP/DCA Return Calculator</a></li>
        <li><a href="/category/finance/retirement-savings-calculator" class="text-primary underline">Retirement Savings Calculator</a></li>
      </ul>

      <h4 class="font-semibold mt-6 mb-2 text-lg">6. FAQs</h4>
      <p class="font-semibold">What is the "Rule of 72"?</p>
      <p>The Rule of 72 is a quick mental shortcut to estimate the number of years required to double your money at a given annual rate of return. You simply divide 72 by the interest rate. For example, at an 8% annual return, your money will double in approximately 9 years (72 / 8).</p>
    `
  },
  {
    slug: "apr-vs-apy",
    title: "Difference between APR and APY",
    Icon: "Percent",
    chartComponent: "AprVsApyChart",
    content: `
      <h3 class="text-xl font-semibold mb-2">APR vs. APY: What's the Real Rate?</h3>
      <p>While APR (Annual Percentage Rate) and APY (Annual Percentage Yield) both represent interest rates, they tell you two different stories about how your money grows or how much you pay in interest. Understanding the difference is crucial for making smart financial decisions.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">1. Definitions</h4>
      <p><strong>APR (Annual Percentage Rate):</strong> This is the simple, annual interest rate charged for borrowing, or earned through an investment. It represents the yearly cost of a loan or the yearly return on an investment, <strong>without</strong> taking the effect of compounding into account. It's the rate you'll most often see advertised for mortgages, auto loans, and credit cards.</p>
      <p class="mt-2"><strong>APY (Annual Percentage Yield):</strong> This represents the real rate of return you will earn in a year because it <strong>includes</strong> the effect of compound interest. APY will always be greater than or equal to the APR. For savers and investors, APY is the more important figure as it reflects the true earning potential of your money.</p>

      <h4 class="font-semibold mt-6 mb-2 text-lg">2. Formula & Variable Explanations</h4>
      <p>The formula to convert APR to APY is: <strong>APY = (1 + r/n)^n - 1</strong></p>
      <ul class="list-disc list-inside mt-2 space-y-1">
        <li><strong>r:</strong> The nominal annual interest rate (APR in decimal form).</li>
        <li><strong>n:</strong> The number of compounding periods per year.</li>
      </ul>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">3. Example: Why the Difference Matters</h4>
      <p>Imagine you deposit $1,000 into a savings account with a 5% APR that compounds monthly. While the APR is 5%, the APY is calculated as \`(1 + 0.05/12)^12 - 1\`, which equals 5.116%. This means by the end of the year, your actual earnings will reflect a 5.116% return due to the monthly compounding. The chart below shows how this small percentage difference can lead to significantly different outcomes over time.</p>

      <h4 class="font-semibold mt-6 mb-2 text-lg">4. Real-World Uses</h4>
      <p>When you are borrowing money (e.g., a credit card), the APR is the number to watch as it represents your cost. When you are saving or investing money (e.g., in a high-yield savings account), the APY is more important because it shows you your actual return.</p>

      <h4 class="font-semibold mt-6 mb-2 text-lg">5. Related Calculators</h4>
      <ul class="list-disc list-inside space-y-1">
        <li><a href="/category/finance/compound-interest-calculator" class="text-primary underline">Compound Interest Calculator</a></li>
        <li><a href="/category/finance/loan-emi-calculator" class="text-primary underline">Loan/EMI Calculator</a></li>
      </ul>

      <h4 class="font-semibold mt-6 mb-2 text-lg">6. FAQs</h4>
      <p class="font-semibold">Why do credit cards advertise APR but savings accounts advertise APY?</p>
      <p>It's a marketing choice. Lenders want to show you the lower number (APR), while banks want to show you the higher, more attractive number (APY) for savings.</p>
    `
  },
  {
    slug: "what-is-bmi",
    title: "What is BMI and Why It Matters",
    Icon: "HeartPulse",
    chartComponent: "BmiChart",
    content: `
      <h3 class="text-xl font-semibold mb-2">What is Body Mass Index (BMI)?</h3>
      <p>Body Mass Index (BMI) is a simple, widely used screening tool that measures a person's weight in relation to their height. It provides a numerical value that helps to categorize whether an individual is underweight, at a healthy weight, overweight, or obese.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">1. Definition</h4>
      <p>BMI is a numerical value of your weight in relation to your height. A high BMI is generally associated with higher body fatness and can be an indicator of potential health risks.</p>

      <h4 class="font-semibold mt-6 mb-2 text-lg">2. Formula & Variable Explanations</h4>
      <p>BMI is calculated using a person's weight and height. The formula is:</p>
      <p class="font-mono p-4 bg-muted rounded-md text-base my-2">BMI = weight (kg) / [height (m)]²</p>
      <p>For those using imperial units, the formula is \`(BMI = (weight (lbs) / [height (in)]²) * 703)\`.</p>

      <h4 class="font-semibold mt-6 mb-2 text-lg">3. Example Calculation</h4>
      <p>A person who is 1.75 meters tall and weighs 70 kg would have a BMI of: 70 / (1.75 * 1.75) = 22.9. This falls into the "Normal weight" category.</p>

      <h4 class="font-semibold mt-6 mb-2 text-lg">4. Real-World Uses</h4>
      <p>Doctors and health professionals use BMI as a quick screening tool to identify potential weight-related health problems. It's a useful starting point for a conversation about a healthy lifestyle.</p>

      <h4 class="font-semibold mt-6 mb-2 text-lg">5. Related Calculators</h4>
      <ul class="list-disc list-inside space-y-1">
        <li><a href="/category/health-fitness/bmi-calculator" class="text-primary underline">BMI Calculator</a></li>
        <li><a href="/category/health-fitness/bmr-calculator" class="text-primary underline">BMR Calculator</a></li>
        <li><a href="/category/health-fitness/body-fat-percentage-calculator" class="text-primary underline">Body Fat Percentage Calculator</a></li>
      </ul>

      <h4 class="font-semibold mt-6 mb-2 text-lg">6. FAQs</h4>
      <p class="font-semibold">What are the limitations of BMI?</p>
      <p>BMI is not a perfect measure. Its main limitation is that it does not distinguish between fat and muscle mass. A very muscular athlete, for example, may have a high BMI that classifies them as "overweight" even though they have a very low body fat percentage. For this reason, other metrics like waist-to-hip ratio or body fat percentage can provide a more complete picture of an individual's health.</p>
    `
  },
  {
    slug: "newtons-laws-of-motion",
    title: "Newton’s Laws of Motion – Explained Simply",
    Icon: "BookOpen",
    chartComponent: "NewtonsSecondLawChart",
    content: `
      <h3 class="text-xl font-semibold mb-2">An Introduction to Newton's Laws</h3>
      <p>Published by Sir Isaac Newton in 1687, these three laws of motion form the bedrock of classical mechanics. They describe the relationship between a physical body and the forces acting upon it, and how the body responds to those forces.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">1. First Law: The Law of Inertia</h4>
      <p><i>"An object will remain at rest or in uniform motion in a straight line unless acted upon by an external force."</i></p>
      <p class="mt-2 text-base">In simple terms, things tend to keep doing what they're already doing. If an object is still, it will stay still. If it's moving, it will keep moving at the same speed and in the same direction, unless something pushes or pulls on it. This property of resisting changes in motion is called inertia.</p>

      <h4 class="font-semibold mt-6 mb-2 text-lg">2. Second Law: Force, Mass, and Acceleration</h4>
      <p><i>"The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass."</i></p>
      <p class="mt-2 text-base">This is famously expressed by the formula: \`F = ma\`. This law tells us that to make an object accelerate (change its velocity), you need to apply a net force. The more mass an object has, the more force is required to achieve the same acceleration. The chart below illustrates this relationship: for a constant mass, applying more force results in greater acceleration.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">3. Third Law: Action and Reaction</h4>
      <p><i>"For every action, there is an equal and opposite reaction."</i></p>
      <p class="mt-2 text-base">This law means that forces always occur in pairs. If object A exerts a force on object B, then object B simultaneously exerts a force of the same magnitude but in the opposite direction on object A. When a rocket expels gas downwards (the action), the gas pushes the rocket upwards (the reaction), allowing it to launch into space.</p>

      <h4 class="font-semibold mt-6 mb-2 text-lg">4. Real-World Uses</h4>
      <p>These laws are fundamental to nearly every branch of engineering and physics, from designing cars and buildings to calculating the orbits of planets and spacecraft.</p>

      <h4 class="font-semibold mt-6 mb-2 text-lg">5. Related Calculators</h4>
      <ul class="list-disc list-inside space-y-1">
        <li><a href="/category/engineering/compressive-stress-calculator" class="text-primary underline">Compressive Stress Calculator</a></li>
        <li><a href="/category/engineering/beam-bending-calculator" class="text-primary underline">Beam Bending Calculator</a></li>
      </ul>

      <h4 class="font-semibold mt-6 mb-2 text-lg">6. FAQs</h4>
      <p class="font-semibold">Why is there a "net" force in the second law?</p>
      <p>Multiple forces can act on an object at once. Net force is the vector sum of all these forces. If two equal forces push on an object from opposite directions, the net force is zero, and the object's motion doesn't change, even though forces are being applied.</p>
    `
  },
  {
    slug: "units-of-pressure",
    title: "Units of Pressure and Their Conversion Chart",
    Icon: "ArrowRightLeft",
    chartComponent: "PressureUnitsChart",
    content: `
      <h3 class="text-xl font-semibold mb-2">A Guide to Common Units of Pressure</h3>
      <p>Pressure is defined as the force applied perpendicular to the surface of an object per unit area over which that force is distributed. Many different units are used to measure pressure, each with its own history and common application.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">1. Definitions of Common Units</h4>
      <ul class="list-disc list-inside text-base space-y-4 mt-2">
        <li><b>Pascal (Pa):</b> The standard unit of pressure in the SI system. It is defined as one newton per square meter (N/m²). Because it's a very small unit, it's often used with prefixes like kilopascal (kPa).</li>
        <li><b>Pounds per Square Inch (psi):</b> The standard unit in the United States, commonly used for measuring tire pressure and in industrial applications.</li>
        <li><b>Standard Atmosphere (atm):</b> Defined as the approximate pressure of the atmosphere at sea level. 1 atm ≈ 101,325 Pa ≈ 14.7 psi.</li>
        <li><b>Bar:</b> Very close in value to one atmosphere, the bar is widely used in meteorology and for tire pressure in Europe. 1 bar = 100,000 Pa.</li>
        <li><b>Torr (mmHg):</b> Originally defined as one millimeter of mercury, this unit is most often used for measuring high vacuums. 760 Torr ≈ 1 atm.</li>
      </ul>

      <h4 class="font-semibold mt-6 mb-2 text-lg">2. Formulas for Conversion to Pascals</h4>
      <ul class="list-disc list-inside mt-2 space-y-1 font-mono">
        <li>1 psi = 6,894.76 Pa</li>
        <li>1 bar = 100,000 Pa</li>
        <li>1 atm = 101,325 Pa</li>
        <li>1 Torr = 133.322 Pa</li>
      </ul>

      <h4 class="font-semibold mt-6 mb-2 text-lg">3. Example Calculation</h4>
      <p>A typical car tire is inflated to 32 psi. To convert this to Pascals: 32 psi * 6894.76 Pa/psi ≈ 220,632 Pa, or 220.6 kPa.</p>

      <h4 class="font-semibold mt-6 mb-2 text-lg">4. Real-World Uses</h4>
      <p>Understanding these units is vital for engineers, meteorologists, scuba divers, and mechanics. The chart below visualizes the vast difference in magnitude between these common units when converted to Pascals.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">5. Related Calculators</h4>
      <ul class="list-disc list-inside space-y-1">
        <li><a href="/category/conversions/psi-to-pascals-converter" class="text-primary underline">PSI to Pascals Converter</a></li>
        <li><a href="/category/conversions/bars-to-pascals-converter" class="text-primary underline">Bars to Pascals Converter</a></li>
        <li><a href="/category/conversions/atmospheres-to-pascals-converter" class="text-primary underline">Atmospheres to Pascals Converter</a></li>
      </ul>

      <h4 class="font-semibold mt-6 mb-2 text-lg">6. FAQs</h4>
      <p class="font-semibold">Why are there so many units for pressure?</p>
      <p>Different units evolved historically in different industries and regions before a global standard (the SI system) was widely adopted. Some units, like psi in the U.S., remain in common use due to convention.</p>
    `
  },
  {
    slug: "what-is-calorie-deficit",
    title: "What Is a Calorie Deficit and How Does It Help in Weight Loss?",
    Icon: "TrendingDown",
    content: `
      <h3 class="text-xl font-semibold mb-2">The Golden Rule of Weight Loss</h3>
      <p>At the heart of every successful weight loss journey lies a simple but powerful principle: the calorie deficit. It is the fundamental law of energy balance that governs whether we lose, gain, or maintain our weight. This guide will explain what a calorie deficit is, how it works, and how you can achieve it safely and sustainably.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">1. What is a Calorie?</h4>
      <p>A calorie is a unit of energy. In nutrition, calories refer to the energy people get from the food and drink they consume, as well as the energy they use in physical activity.</p>

      <h4 class="font-semibold mt-6 mb-2 text-lg">2. What is a Calorie Deficit?</h4>
      <p>A calorie deficit occurs when you consistently consume fewer calories than your body burns each day. Your body needs a certain amount of energy to perform all its functions, from breathing and circulating blood to walking and exercising. This total energy requirement is known as your Total Daily Energy Expenditure (TDEE).</p>
      <p class="mt-2">When you provide your body with less energy (calories) than it needs, it is forced to turn to its stored energy reserves—primarily body fat—to make up the difference. This process of using stored fat for energy is what leads to weight loss.</p>
      <p class="font-mono p-4 bg-muted rounded-md text-base my-2">Calories In < Calories Out = Weight Loss</p>

      <h4 class="font-semibold mt-6 mb-2 text-lg">3. How to Create a Calorie Deficit</h4>
      <p>There are three main ways to create a calorie deficit:</p>
      <ul class="list-disc list-inside mt-2 space-y-2">
        <li><strong>Eating Fewer Calories:</strong> By reducing your portion sizes or choosing lower-calorie foods, you can decrease your "Calories In" without changing your activity level.</li>
        <li><strong>Increasing Physical Activity:</strong> By exercising more, you increase your "Calories Out." This means you can eat the same amount of food but still create a deficit.</li>
        <li><strong>A Combination of Both:</strong> This is the most effective and sustainable approach. It allows you to create a meaningful deficit without feeling overly restricted in your diet or having to exercise for hours every day.</li>
      </ul>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">4. Safe and Sustainable Deficit</h4>
      <p>A general rule of thumb is that one pound of fat is equivalent to about 3,500 calories. Therefore, to lose one pound per week, you would need a deficit of 500 calories per day (500 calories/day * 7 days/week = 3,500 calories/week).</p>
      <p class="mt-2">It's important to create a moderate deficit. A very large deficit can lead to muscle loss, nutrient deficiencies, and fatigue, making it difficult to maintain long-term.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">5. Related Calculators</h4>
      <ul class="list-disc list-inside space-y-1">
        <li><a href="/category/health-fitness/calorie-deficit-calculator" class="text-primary underline">Calorie Deficit Calculator</a></li>
        <li><a href="/category/health-fitness/daily-calorie-needs-calculator" class="text-primary underline">Daily Calorie Needs Calculator (TDEE)</a></li>
        <li><a href="/category/health-fitness/bmr-calculator" class="text-primary underline">BMR Calculator</a></li>
      </ul>

      <h4 class="font-semibold mt-6 mb-2 text-lg">6. FAQs</h4>
      <p class="font-semibold">Do I have to count calories to lose weight?</p>
      <p>No, you don't have to count calories meticulously. However, being mindful of portion sizes and choosing nutrient-dense, lower-calorie foods naturally helps create a deficit. Calorie counting is simply a tool to make this process more precise.</p>
    `
  },
  {
    slug: "how-to-maintain-weight",
    title: "How Many Calories Should You Eat to Maintain Your Weight?",
    Icon: "HeartPulse",
    content: `
      <h3 class="text-xl font-semibold mb-2">Finding Your Body's Equilibrium</h3>
      <p>Weight management isn't just about losing or gaining; it's also about maintaining a healthy weight where you feel your best. The key to this stability is understanding your body's energy balance. Consuming the right number of calories to match the energy you expend is the cornerstone of weight maintenance.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">1. The Principle of Energy Balance</h4>
      <p>Your body weight is regulated by the simple principle of "Calories In vs. Calories Out." To maintain your weight, the calories you consume must equal the calories your body burns.</p>
       <p class="font-mono p-4 bg-muted rounded-md text-base my-2">Calories In = Calories Out = Weight Maintenance</p>
       <p>The "Calories Out" part of the equation is your Total Daily Energy Expenditure (TDEE).</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">2. What is TDEE?</h4>
      <p>TDEE is the total number of calories your body burns in a 24-hour period. It's composed of two main parts:</p>
      <ul class="list-disc list-inside mt-2 space-y-2">
        <li><strong>Basal Metabolic Rate (BMR):</strong> The energy your body uses at complete rest to perform vital functions like breathing, circulating blood, and maintaining body temperature. This accounts for the majority of your daily calorie burn.</li>
        <li><strong>Activity Level:</strong> This includes everything from walking to the kitchen to intense exercise. The more active you are, the higher your TDEE.</li>
      </ul>
      <p>To maintain your weight, your goal is to eat an amount of calories that is approximately equal to your TDEE.</p>

      <h4 class="font-semibold mt-6 mb-2 text-lg">3. Calculating Your Maintenance Calories</h4>
      <p>The most reliable way to determine your TDEE is by using a calculator that incorporates the Mifflin-St Jeor equation for BMR and then applies an activity multiplier. Our calculators can help with this:</p>
      <ul class="list-disc list-inside space-y-1">
        <li>First, find your BMR with the <a href="/category/health-fitness/bmr-calculator" class="text-primary underline">BMR Calculator</a>.</li>
        <li>Then, use that BMR value in the <a href="/category/health-fitness/daily-calorie-needs-calculator" class="text-primary underline">Daily Calorie Needs (TDEE) Calculator</a> to find your maintenance calories.</li>
      </ul>

      <h4 class="font-semibold mt-6 mb-2 text-lg">4. Practical Application</h4>
      <p>Once you know your TDEE (e.g., 2,200 calories), you can use it as a daily target. Tracking your food intake for a week or two using a calorie-counting app can give you a clear idea of your current consumption and help you adjust to meet your maintenance goal. Remember that this is an estimate; you may need to adjust your intake slightly based on how your weight responds over several weeks.</p>
    `
  }
];

    