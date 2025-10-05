
export interface LearningHubArticle {
  slug: string;
  title: string;
  Icon: string;
  content: string;
}

export const articles: LearningHubArticle[] = [
  {
    slug: "what-is-compound-interest",
    title: "What is Compound Interest?",
    Icon: "PiggyBank",
    content: `
      <h3 class="text-xl font-semibold mb-2">What is Compound Interest?</h3>
      <p>Compound interest is the interest on an investment's principal plus the interest that has already been earned. This phenomenon, often called "interest on interest," is the engine behind long-term wealth creation, allowing investments to grow at an exponential rate rather than a linear one.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">The Formula</h4>
      <p>The future value of an investment with compound interest is calculated using the following formula:</p>
      <p class="font-mono p-4 bg-muted rounded-md text-base my-2">A = P(1 + r/n)^(nt)</p>
      <ul class="list-disc list-inside text-base space-y-2 mt-2">
        <li><b>A</b> = the future value of the investment/loan, including interest.</li>
        <li><b>P</b> = the principal amount (the initial amount of money).</li>
        <li><b>r</b> = the annual interest rate (in decimal form, so 8% = 0.08).</li>
        <li><b>n</b> = the number of times that interest is compounded per year.</li>
        <li><b>t</b> = the number of years the money is invested for.</li>
      </ul>

      <h4 class="font-semibold mt-6 mb-2 text-lg">Example Calculation</h4>
      <p>Imagine you invest $1,000 (P) at an annual interest rate of 5% (r), compounded monthly (n=12), for 10 years (t).</p>
      <p class="font-mono p-4 bg-muted rounded-md text-base my-2">A = 1000(1 + 0.05/12)^(12*10) = $1,647.01</p>
      <p>After 10 years, your initial $1,000 would grow to approximately $1,647.01. The total interest earned would be $647.01.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">Real-World Uses</h4>
       <ul class="list-disc list-inside text-base space-y-2 mt-2">
        <li><b>Retirement Savings:</b> Your 401(k) or IRA grows using compound interest.</li>
        <li><b>Savings Accounts:</b> High-yield savings accounts compound interest, helping your money grow faster than in a traditional account.</li>
        <li><b>Credit Card Debt:</b> Unfortunately, compounding also works against you with debt. Unpaid credit card balances compound, causing debt to grow quickly.</li>
      </ul>

      <h4 class="font-semibold mt-6 mb-2 text-lg">Related Calculators</h4>
      <ul class="list-disc list-inside text-base space-y-2 mt-2">
        <li><a href="/category/finance/compound-interest-calculator" class="text-primary underline">Compound Interest Calculator</a></li>
        <li><a href="/category/finance/sip-calculator" class="text-primary underline">SIP/DCA Return Calculator</a></li>
        <li><a href="/category/finance/retirement-savings-calculator" class="text-primary underline">Retirement Savings Calculator</a></li>
      </ul>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">FAQs</h4>
      <p class="font-semibold">What is the difference between simple and compound interest?</p>
      <p class="text-base mb-4">Simple interest is calculated only on the principal amount. Compound interest is calculated on the principal and also on the accumulated interest from previous periods.</p>
      <p class="font-semibold">How often is interest compounded?</p>
      <p class="text-base">It can be compounded daily, monthly, quarterly, or annually. The more frequent the compounding, the faster your investment grows.</p>
    `
  },
  {
    slug: "apr-vs-apy",
    title: "Difference between APR and APY",
    Icon: "Percent",
    content: `
      <h3 class="text-xl font-semibold mb-2">APR vs. APY: What's the Real Rate?</h3>
      <p>While APR (Annual Percentage Rate) and APY (Annual Percentage Yield) both represent interest rates, they tell you two different stories about how your money grows or how much you pay in interest. Understanding the difference is crucial for making smart financial decisions.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">APR (Annual Percentage Rate)</h4>
      <p>APR is the simple, annual interest rate. It represents the yearly cost of borrowing money, or the yearly return on an investment, <strong>without</strong> taking the effect of compounding into account. It's the rate you'll most often see advertised for mortgages, auto loans, and credit cards.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">APY (Annual Percentage Yield)</h4>
      <p>APY represents the real rate of return you will earn in a year because it <strong>includes</strong> the effect of compound interest. APY will always be greater than or equal to the APR. For savers and investors, APY is the more important figure as it reflects the true earning potential of your money.</p>

      <h4 class="font-semibold mt-6 mb-2 text-lg">Example Calculation</h4>
      <p>Imagine you deposit $1,000 into a savings account with a 5% APR that compounds monthly.</p>
      <p class="mt-2 text-base">While the APR is 5%, the APY is calculated as \`(1 + 0.05/12)^12 - 1\`, which equals 5.116%. This means by the end of the year, your actual earnings will reflect a 5.116% return due to the monthly compounding, not just the 5% stated APR.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">Real-World Uses</h4>
       <ul class="list-disc list-inside text-base space-y-2 mt-2">
        <li><b>Borrowing:</b> Lenders are required to disclose the APR for loans, which helps you compare the cost of different credit cards or mortgages.</li>
        <li><b>Saving:</b> Banks advertise the APY on savings accounts and CDs to show you the effective annual return you'll receive after compounding.</li>
      </ul>

      <h4 class="font-semibold mt-6 mb-2 text-lg">Related Calculators</h4>
      <ul class="list-disc list-inside text-base space-y-2 mt-2">
        <li><a href="/category/finance/compound-interest-calculator" class="text-primary underline">Compound Interest Calculator</a></li>
        <li><a href="/category/crypto-web3/crypto-apy-calculator" class="text-primary underline">Crypto APY Calculator</a></li>
      </ul>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">FAQs</h4>
      <p class="font-semibold">Which is more important?</p>
      <p class="text-base mb-4">When you are <b>saving or investing</b>, look for the highest <b>APY</b>. When you are <b>borrowing</b>, look for the lowest <b>APR</b>.</p>
      <p class="font-semibold">Can APR and APY be the same?</p>
      <p class="text-base">Yes, they are the same only if interest is compounded just once a year. If compounding occurs more frequently (e.g., monthly or daily), the APY will be higher than the APR.</p>
    `
  },
  {
    slug: "what-is-bmi",
    title: "What is BMI and Why It Matters",
    Icon: "HeartPulse",
    content: `
      <h3 class="text-xl font-semibold mb-2">What is Body Mass Index (BMI)?</h3>
      <p>Body Mass Index (BMI) is a simple, widely used screening tool that measures a person's weight in relation to their height. It provides a numerical value that helps to categorize whether an individual is underweight, at a healthy weight, overweight, or obese.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">The Formula</h4>
      <p>BMI is calculated using a person's weight and height. The formula is:</p>
      <p class="font-mono p-4 bg-muted rounded-md text-base my-2">BMI = weight (kg) / [height (m)]²</p>
      <p>For those using imperial units, the formula is \`BMI = (weight (lbs) / [height (in)]²) * 703\`.</p>

      <h4 class="font-semibold mt-6 mb-2 text-lg">Standard BMI Categories</h4>
      <p>For adults, the BMI value is interpreted using the following standard weight status categories:</p>
      <ul class="list-disc list-inside text-base space-y-2 mt-2">
        <li><b>Below 18.5:</b> Underweight</li>
        <li><b>18.5 – 24.9:</b> Normal weight</li>
        <li><b>25.0 – 29.9:</b> Overweight</li>
        <li><b>30.0 and Above:</b> Obese</li>
      </ul>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">Why It Matters</h4>
       <p>While BMI is a screening tool and not a diagnostic one, it is a good indicator of potential health risks. A high BMI is associated with an increased risk of developing several chronic conditions, including:</p>
       <ul class="list-disc list-inside text-base space-y-2 mt-2">
        <li>Cardiovascular diseases (heart disease, stroke)</li>
        <li>Type 2 diabetes</li>
        <li>High blood pressure (hypertension)</li>
        <li>Certain types of cancer</li>
      </ul>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">Limitations of BMI</h4>
       <p>It's important to recognize that BMI is not a perfect measure. Its main limitation is that it does not distinguish between fat and muscle mass. A very muscular athlete, for example, may have a high BMI that classifies them as "overweight" even though they have a very low body fat percentage. Conversely, an older adult with low muscle mass might have a "normal" BMI but still have excess body fat.</p>

      <h4 class="font-semibold mt-6 mb-2 text-lg">Related Calculators</h4>
      <ul class="list-disc list-inside text-base space-y-2 mt-2">
        <li><a href="/category/health-fitness/bmi-calculator" class="text-primary underline">BMI Calculator</a></li>
        <li><a href="/category/health-fitness/body-fat-percentage-calculator" class="text-primary underline">Body Fat Percentage Calculator</a></li>
        <li><a href="/category/health-fitness/waist-to-hip-ratio-calculator" class="text-primary underline">Waist-to-Hip Ratio Calculator</a></li>
      </ul>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">FAQs</h4>
      <p class="font-semibold">Is BMI the same for men and women?</p>
      <p class="text-base mb-4">Yes, the BMI calculation and categories are the same for both adult men and women.</p>
      <p class="font-semibold">Should children use the same BMI chart?</p>
      <p class="text-base">No. For children and teens, BMI is age- and sex-specific because body fat composition changes with age and differs between boys and girls. Their BMI is interpreted using percentile charts.</p>
    `
  },
  {
    slug: "newtons-laws-of-motion",
    title: "Newton’s Laws of Motion – Explained Simply",
    Icon: "BookOpen",
    content: `
      <h3 class="text-xl font-semibold mb-2">An Introduction to Newton's Laws</h3>
      <p>Published by Sir Isaac Newton in 1687 in his work "Philosophiæ Naturalis Principia Mathematica," these three laws of motion form the bedrock of classical mechanics. They describe the relationship between a physical body and the forces acting upon it, and how the body responds to those forces.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">First Law: The Law of Inertia</h4>
      <p><i>"An object will remain at rest or in uniform motion in a straight line unless acted upon by an external force."</i></p>
      <p class="mt-2 text-base">In simple terms, things tend to keep doing what they're already doing. If an object is still, it will stay still. If it's moving, it will keep moving at the same speed and in the same direction, unless something pushes or pulls on it.</p>
      <p class="mt-2 text-base"><b>Example:</b> If you push a book across a table, it eventually stops. This isn't because its natural state is to be at rest, but because an external force—friction—is acting on it. In the vacuum of space, if you pushed the same book, it would travel in a straight line at a constant speed forever.</p>

      <h4 class="font-semibold mt-6 mb-2 text-lg">Second Law: Force, Mass, and Acceleration</h4>
      <p><i>"The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass."</i></p>
      <p class="mt-2 text-base">This is famously expressed by the formula:</p>
      <p class="font-mono p-4 bg-muted rounded-md text-base my-2">F = ma (Force = Mass × Acceleration)</p>
      <p class="mt-2 text-base">This law tells us two things:</p>
      <ul class="list-disc list-inside text-base space-y-2 mt-2">
        <li>To make an object accelerate (change its velocity), you need to apply a net force.</li>
        <li>The more massive an object is, the more force is required to accelerate it at the same rate as a less massive object.</li>
      </ul>
      <p class="mt-2 text-base"><b>Example:</b> It takes much more force to push a car to a speed of 10 mph than it does to push a shopping cart to the same speed because the car has significantly more mass.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">Third Law: Action and Reaction</h4>
      <p><i>"For every action, there is an equal and opposite reaction."</i></p>
      <p class="mt-2 text-base">This law means that forces always occur in pairs. If object A exerts a force on object B, then object B simultaneously exerts a force of the same magnitude but in the opposite direction on object A.</p>
      <p class="mt-2 text-base"><b>Example:</b> When a rocket expels gas downwards (the action), the gas pushes the rocket upwards (the reaction), allowing it to overcome gravity and launch into space. When you jump, your legs push down on the ground, and the ground pushes up on you with equal force, propelling you into the air.</p>
    `
  },
  {
    slug: "units-of-pressure",
    title: "Units of Pressure and Their Conversion Chart",
    Icon: "ArrowRightLeft",
    content: `
      <h3 class="text-xl font-semibold mb-2">A Guide to Common Units of Pressure</h3>
      <p>Pressure is defined as the force applied perpendicular to the surface of an object per unit area over which that force is distributed. Many different units are used to measure pressure, each with its own history and common application.</p>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">Common Units and Their Uses</h4>
       <ul class="list-disc list-inside text-base space-y-4 mt-2">
        <li><b>Pascal (Pa):</b> The standard unit of pressure in the SI system. It is defined as one newton per square meter (N/m²). Because it's a very small unit, it's often used with prefixes like kilopascal (kPa) or megapascal (MPa) in engineering and science.</li>
        <li><b>Pounds per Square Inch (psi):</b> The standard unit in the United States. It's commonly used for measuring tire pressure, scuba tank pressure, and in many industrial applications.</li>
        <li><b>Standard Atmosphere (atm):</b> Defined as the approximate pressure of the atmosphere at sea level. It's often used as a reference point in chemistry and physics. 1 atm ≈ 101,325 Pa ≈ 14.7 psi.</li>
        <li><b>Bar:</b> Very close in value to one atmosphere, the bar is widely used in meteorology to report atmospheric pressure and in Europe for tire pressure. 1 bar = 100,000 Pa.</li>
        <li><b>Torr (mmHg):</b> Originally defined as one millimeter of mercury (mmHg), this unit is most often used for measuring high vacuums in scientific research and industrial processes. 760 Torr ≈ 1 atm.</li>
      </ul>
      
      <h4 class="font-semibold mt-6 mb-2 text-lg">Conversion Table</h4>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="p-2 text-left">Unit</th>
              <th class="p-2 text-left">in Pascals (Pa)</th>
              <th class="p-2 text-left">in atmospheres (atm)</th>
              <th class="p-2 text-left">in psi</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b"><td class="p-2">1 Pa</td><td class="p-2">1</td><td class="p-2">9.87 x 10⁻⁶</td><td class="p-2">0.000145</td></tr>
            <tr class="border-b"><td class="p-2">1 atm</td><td class="p-2">101,325</td><td class="p-2">1</td><td class="p-2">14.696</td></tr>
            <tr class="border-b"><td class="p-2">1 bar</td><td class="p-2">100,000</td><td class="p-2">0.987</td><td class="p-2">14.504</td></tr>
            <tr class="border-b"><td class="p-2">1 psi</td><td class="p-2">6,894.76</td><td class="p-2">0.068</td><td class="p-2">1</td></tr>
          </tbody>
        </table>
      </div>

      <h4 class="font-semibold mt-6 mb-2 text-lg">Related Calculators</h4>
      <ul class="list-disc list-inside text-base space-y-2 mt-2">
        <li><a href="/category/conversions/pascals-to-psi-converter" class="text-primary underline">Pascals to PSI Converter</a></li>
        <li><a href="/category/conversions/bars-to-psi-converter" class="text-primary underline">Bars to PSI Converter</a></li>
        <li><a href="/category/conversions/atmospheres-to-pascals-converter" class="text-primary underline">Atmospheres to Pascals Converter</a></li>
      </ul>
    `
  }
];
