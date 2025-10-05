
export interface LearningHubArticle {
  title: string;
  Icon: string;
  content: string;
}

export const articles: LearningHubArticle[] = [
  {
    title: "What is Compound Interest?",
    Icon: "PiggyBank",
    content: `
      <p>Compound interest is the interest on an investment's principal plus the interest that has already been earned. This "interest on interest" effect is why investments can grow at an exponential rate over time.</p>
      <h4 class="font-semibold mt-4 mb-2">The Formula</h4>
      <p class="font-mono p-2 bg-muted rounded-md text-sm">A = P(1 + r/n)^(nt)</p>
      <ul class="list-disc list-inside text-sm space-y-1 mt-2">
        <li><b>A</b> = the future value of the investment/loan</li>
        <li><b>P</b> = the principal investment amount</li>
        <li><b>r</b> = the annual interest rate (decimal)</li>
        <li><b>n</b> = the number of times that interest is compounded per year</li>
        <li><b>t</b> = the number of years the money is invested for</li>
      </ul>
      <p class="mt-4 text-sm">The longer your money is invested, the more powerful compounding becomes, turning small, regular savings into a substantial nest egg.</p>
    `
  },
  {
    title: "Difference between APR and APY",
    Icon: "Percent",
    content: `
      <p>APR and APY both relate to interest rates, but they measure different things.</p>
      <h4 class="font-semibold mt-4 mb-2">APR (Annual Percentage Rate)</h4>
      <p class="text-sm">APR is the annual rate of interest charged for borrowing, or earned through an investment. It is the simple interest rate for a year. It does <b>not</b> take compounding into account.</p>
      <h4 class="font-semibold mt-4 mb-2">APY (Annual Percentage Yield)</h4>
      <p class="text-sm">APY is the real rate of return earned on an investment, taking into account the effect of compounding interest. Because it includes compounding, APY is a more accurate measure of the return you'll earn. For savers, a higher APY is better.</p>
      <p class="mt-4 text-sm"><b>Key takeaway:</b> APY will always be higher than or equal to the APR because it includes the effects of compounding.</p>
    `
  },
  {
    title: "What is BMI and Why It Matters",
    Icon: "HeartPulse",
    content: `
      <p>Body Mass Index (BMI) is a simple screening tool that uses your height and weight to measure whether you are underweight, at a healthy weight, overweight, or obese.</p>
      <h4 class="font-semibold mt-4 mb-2">The Calculation</h4>
      <p class="font-mono p-2 bg-muted rounded-md text-sm">BMI = weight (kg) / [height (m)]²</p>
      <h4 class="font-semibold mt-4 mb-2">Why It Matters</h4>
      <p class="text-sm">While BMI is not a perfect diagnostic tool (it doesn't distinguish between muscle and fat), it's a useful indicator of potential health risks associated with being over or underweight. A high BMI is linked to an increased risk of conditions like heart disease, high blood pressure, and type 2 diabetes. It provides a quick and easy way for both individuals and healthcare professionals to assess weight status.</p>
    `
  },
  {
    title: "Newton’s Laws of Motion – Explained Simply",
    Icon: "BookOpen",
    content: `
      <p>Isaac Newton's three laws of motion form the foundation of classical mechanics and describe the relationship between an object and the forces acting upon it.</p>
      <ul class="list-disc list-inside text-sm space-y-2 mt-2">
        <li><b>First Law (Inertia):</b> An object will remain at rest or in uniform motion in a straight line unless acted upon by an external force. Simply put, things keep doing what they're doing unless you push or pull them.</li>
        <li><b>Second Law (F=ma):</b> The force acting on an object is equal to the mass of that object times its acceleration. This means a heavier object requires more force to move at the same acceleration as a lighter one.</li>
        <li><b>Third Law (Action-Reaction):</b> For every action, there is an equal and opposite reaction. When you push on a wall, the wall pushes back on you with equal force.</li>
      </ul>
    `
  },
  {
    title: "Units of Pressure and Their Conversion Chart",
    Icon: "ArrowRightLeft",
    content: `
      <p>Pressure is the force applied perpendicular to the surface of an object per unit area. Different units are used in various fields.</p>
      <ul class="list-disc list-inside text-sm space-y-2 mt-2">
        <li><b>Pascal (Pa):</b> The standard SI unit, equal to one newton per square meter.</li>
        <li><b>Atmosphere (atm):</b> Roughly the air pressure at sea level. 1 atm ≈ 101,325 Pa.</li>
        <li><b>Pounds per Square Inch (psi):</b> Common in the US, especially for tire pressure. 1 atm ≈ 14.7 psi.</li>
        <li><b>Bar:</b> Widely used in meteorology and for car tires in Europe. 1 bar = 100,000 Pa.</li>
        <li><b>Torr (mmHg):</b> Used in vacuum measurements, defined as 1/760 of an atmosphere.</li>
      </ul>
      <p class="mt-4 text-sm">Understanding these conversions is crucial for engineering, science, and even everyday tasks like inflating your car tires correctly.</p>
    `
  },
];
