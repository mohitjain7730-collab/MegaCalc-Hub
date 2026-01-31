/**
 * Extended SEO content for calculators: full article-style content in page source
 * so crawlers see all details like reference calculator sites (e.g. Calculator.now).
 * Keyed by calculator slug.
 */
export interface CalculatorSeoContent {
  inputs: { label: string; description?: string }[];
  formula?: string;
  formulaExplanation?: string;
  results: string[];
  sections?: { title: string; content: string }[];
  /** What Is the [Calculator]? - intro paragraph(s) */
  whatIs?: string;
  /** Detailed how-to steps (bullet list) */
  howToUseSteps?: string[];
  /** What the Results Mean - intro + list of interpretations */
  whatResultsMean?: { intro?: string; items: string[] };
  /** Why Use this calculator - bullet list */
  whyUse?: string[];
  /** Conclusion paragraph */
  conclusion?: string;
  /** About / Theory: formula, categories, limitations, disclaimer */
  aboutTheory?: { title: string; content: string }[];
  /** Related calculators: name + slug (category is finance for these) */
  relatedCalculators?: { name: string; slug: string }[];
}

const BASE_URL = 'https://mycalculating.com';

export const calculatorSeoContent: Record<string, CalculatorSeoContent> = {
  'retirement-savings-calculator': {
    inputs: [
      { label: 'Current Age (years)', description: 'Your current age in years.' },
      { label: 'Retirement Age (years)', description: 'The age at which you plan to retire.' },
      { label: 'Current Savings', description: 'Amount you have already saved for retirement.' },
      { label: 'Monthly Contribution', description: 'Amount you contribute each month (Project My Savings mode).' },
      { label: 'Expected Annual Return (%)', description: 'Expected annual investment return rate.' },
      { label: 'Target Retirement Corpus', description: 'Target amount you want at retirement (Calculate for a Target mode).' },
    ],
    formula: 'Future Value = Current Savings × (1 + r)^n + Monthly Contribution × [((1 + r)^n - 1) / r], where r = monthly rate, n = months to retirement. Required monthly contribution for a target uses the same formula solved for contribution.',
    formulaExplanation: 'Retirement balance grows from current savings and monthly contributions with compound interest. A 4% withdrawal rule is used to estimate sustainable retirement income.',
    results: [
      'Retirement Balance (at retirement age)',
      'Total Invested (your contributions over time)',
      'Interest Earned (and percentage of total balance)',
      'Monthly Retirement Income (based on 4% withdrawal rule)',
      'Annual Retirement Income (sustainable)',
      'Required Monthly Contribution (when using target mode)',
      'Retirement Savings Growth Over Time (chart)',
      'Recommendations and action plan (Boost, Optimize, Diversify, Review)',
    ],
    sections: [
      { title: 'Retirement Planning Parameters', content: 'Plan your retirement with comprehensive projections and target calculations. Two modes: Project My Savings (see balance at retirement) or Calculate for a Target (find required monthly contribution).' },
      { title: 'Your Retirement Projection', content: 'Summary shows retirement balance at target age, total invested, interest earned, and estimated monthly and annual income using the 4% withdrawal rule. Growth chart shows savings and future value over time.' },
    ],
    whatIs: 'The Retirement Savings Calculator helps you plan for your future by estimating how much you will have at retirement based on your current savings, monthly contributions, and expected returns. It can also tell you how much you need to save each month to reach a target retirement corpus. The calculator uses compound interest and supports two modes: project your savings over time or calculate the required monthly contribution for a target amount.',
    howToUseSteps: [
      'Select your mode: Project My Savings (see balance at retirement) or Calculate for a Target (find required monthly contribution).',
      'Enter your current age and planned retirement age in years.',
      'Enter your current retirement savings and, for Project mode, your monthly contribution; for Target mode, enter your target retirement corpus.',
      'Enter your expected annual return (e.g. 7 for 7%).',
      'Click Calculate Retirement Projection.',
      'Review your retirement balance, total invested, interest earned, monthly and annual retirement income (4% rule), and the growth chart.',
    ],
    whatResultsMean: {
      intro: 'Once calculated, you see your projected retirement balance at your target age, how much you invested vs how much came from interest, and your estimated sustainable retirement income using the 4% withdrawal rule. In Target mode you see the required monthly contribution to reach your goal.',
      items: [
        'Retirement Balance: Total amount at retirement age from current savings and contributions plus growth.',
        'Total Invested: Sum of your current savings and all monthly contributions.',
        'Interest Earned: Growth from compounding; shown as amount and percentage of total balance.',
        'Monthly/Annual Retirement Income: Estimated sustainable income using a 4% annual withdrawal.',
        'Required Monthly Contribution: In Target mode, the amount you need to save each month to reach your goal.',
      ],
    },
    whyUse: [
      'Quick snapshot of whether you are on track for retirement.',
      'See how much of your balance comes from contributions vs compound growth.',
      'Set a target corpus and find the monthly savings needed to reach it.',
      'Compare different retirement ages and return assumptions.',
      'Use the 4% rule to estimate sustainable retirement income.',
    ],
    conclusion: 'The Retirement Savings Calculator is a simple yet powerful tool to see how your savings can grow and whether you are on track for retirement. By entering your age, savings, contributions, and expected return, you get a clear projection and, in Target mode, the monthly contribution needed to hit your goal. Use it regularly to adjust your plan as your situation changes.',
    aboutTheory: [
      { title: 'About retirement projections', content: 'The calculator uses the future value of a lump sum plus the future value of an annuity (monthly contributions). The 4% rule is a common guideline: withdrawing 4% of your portfolio annually is often considered sustainable over a long retirement.' },
      { title: 'Limitations', content: 'Returns are not guaranteed; actual results will vary. Inflation, taxes, and expenses are not included. Use this for planning only; consult a financial advisor for personalized advice.' },
    ],
    relatedCalculators: [
      { name: 'Compound Interest Calculator', slug: 'compound-interest-calculator' },
      { name: 'Net Worth Calculator', slug: 'net-worth-calculator' },
      { name: 'Credit Card Payoff Calculator', slug: 'credit-card-payoff-calculator' },
      { name: 'Savings Goal Timeline Calculator', slug: 'savings-goal-timeline-calculator' },
      { name: 'Emergency Fund Calculator', slug: 'emergency-fund-calculator' },
    ],
  },
  'compound-interest-calculator': {
    inputs: [
      { label: 'Principal Amount', description: 'The initial amount of money you are investing.' },
      { label: 'Annual Interest Rate (%)', description: 'The nominal annual interest rate for the investment.' },
      { label: 'Number of Years', description: 'The total number of years the money will be invested.' },
      { label: 'Compounding Frequency', description: 'How often interest is calculated: Annually, Semi-Annually, Quarterly, Monthly, or Daily.' },
    ],
    formula: 'A = P(1 + r/n)^(nt). A = Final Amount, P = Principal, r = Annual Interest Rate (decimal), n = Compounding Frequency per year, t = Number of Years. Rule of 72: Years to double ≈ 72 / annual rate.',
    formulaExplanation: 'Compound interest means you earn interest on your interest. The formula shows how your initial investment grows over time. More frequent compounding (e.g. monthly vs annually) yields slightly higher returns.',
    results: [
      'Future Value (total amount after the period)',
      'Principal Amount (your initial investment)',
      'Interest Earned (and percentage return on investment)',
      'Annualized Return (average annual growth rate)',
      'Years to Double (Rule of 72)',
      'Investment Growth Over Time (chart)',
      'Smart Actions & Recommendations',
    ],
    sections: [
      { title: 'Investment Parameters', content: 'Enter your investment details to see the power of compound interest.' },
      { title: 'Your Investment Growth', content: 'Results show future value, principal, interest earned, annualized return, and years to double.' },
    ],
    whatIs: 'The Compound Interest Calculator helps you see how an initial investment grows over time when interest is compounded. You enter the principal amount, annual interest rate, number of years, and compounding frequency (annually to daily). The calculator shows the future value, total interest earned, annualized return, and years to double (Rule of 72), plus a growth chart and recommendations.',
    howToUseSteps: [
      'Enter the principal amount (initial investment).',
      'Enter the annual interest rate as a percentage (e.g. 7 for 7%).',
      'Enter the number of years the money will be invested.',
      'Select compounding frequency: Annually, Semi-Annually, Quarterly, Monthly, or Daily.',
      'Click Calculate Compound Interest.',
      'Review future value, interest earned, annualized return, years to double, and the growth chart.',
    ],
    whatResultsMean: {
      intro: 'Your results show how much your investment will be worth, how much of that is interest, and how long it takes to double at your rate.',
      items: [
        'Future Value: Total amount at the end of the period (principal plus interest).',
        'Principal: Your initial investment (unchanged).',
        'Interest Earned: The growth from compounding; also shown as percentage of principal.',
        'Annualized Return: Average annual growth rate over the period.',
        'Years to Double: Approximate time to double your money (Rule of 72: 72 ÷ rate).',
      ],
    },
    whyUse: [
      'Visualize how compound interest grows your money over time.',
      'Compare different rates and time horizons.',
      'See the impact of compounding frequency (monthly vs annually).',
      'Use the Rule of 72 to estimate doubling time.',
      'Set realistic expectations for long-term savings and investments.',
    ],
    conclusion: 'The Compound Interest Calculator is a simple tool to see how your money can grow with compounding. By entering your principal, rate, years, and compounding frequency, you get the future value, interest earned, and years to double. Use it to plan savings and investments and to understand the power of time and rate.',
    aboutTheory: [
      { title: 'About compound interest', content: 'Compound interest means you earn interest on your principal and on previously earned interest. The formula A = P(1 + r/n)^(nt) gives the future value. More frequent compounding (e.g. monthly) results in a slightly higher effective return than annual compounding.' },
      { title: 'Rule of 72', content: 'To estimate how long it takes to double your money, divide 72 by the annual rate. For example, at 8% it takes about 9 years. This is an approximation.' },
      { title: 'Limitations', content: 'Actual returns vary; this calculator is for illustration only. Taxes, fees, and inflation are not included. Past performance does not guarantee future results.' },
    ],
    relatedCalculators: [
      { name: 'Retirement Savings Calculator', slug: 'retirement-savings-calculator' },
      { name: 'Net Worth Calculator', slug: 'net-worth-calculator' },
      { name: 'Savings Goal Timeline Calculator', slug: 'savings-goal-timeline-calculator' },
      { name: 'Investment Goal Tracker', slug: 'investment-goal-tracker-calculator' },
      { name: 'Present Value Calculator', slug: 'present-value-calculator' },
    ],
  },
  'net-worth-calculator': {
    inputs: [
      { label: 'Liquid Assets (Cash, Savings, Checking)', description: 'Cash and easily accessible accounts.' },
      { label: 'Investment Assets (Stocks, Bonds, 401k, IRA)', description: 'Retirement and brokerage accounts.' },
      { label: 'Real Estate Value', description: 'Estimated value of property you own.' },
      { label: 'Vehicle Value', description: 'Estimated value of cars and other vehicles.' },
      { label: 'Other Assets (Jewelry, Art, Collectibles)', description: 'Other valuable possessions.' },
      { label: 'Mortgage Debt', description: 'Outstanding mortgage balance.' },
      { label: 'Credit Card Debt', description: 'Total credit card balances.' },
      { label: 'Student Loan Debt', description: 'Outstanding student loans.' },
      { label: 'Auto Loan Debt', description: 'Outstanding auto loan balance.' },
      { label: 'Other Debt (Personal Loans, etc.)', description: 'Other loans and debt.' },
    ],
    formula: 'Net Worth = Total Assets - Total Liabilities. Total Assets = sum of all asset categories. Total Liabilities = sum of all debt categories.',
    formulaExplanation: 'Net worth is your financial snapshot: everything you own minus everything you owe. Assets include cash, investments, real estate, vehicles, and other valuables. Liabilities include mortgage, credit cards, student loans, auto loans, and other debt.',
    results: [
      'Total Assets (sum of all asset categories)',
      'Total Liabilities (sum of all debt)',
      'Net Worth (assets minus liabilities)',
      'Financial Health (Critical, Poor, Fair, Good, Excellent)',
      'Interpretation and recommendations',
      'Asset Breakdown (by category with amount and percentage)',
      'Liability Breakdown (by category with amount and percentage)',
      'Smart Actions & Recommendations',
      'Warning Signs to Watch',
    ],
    sections: [
      { title: 'Financial Assets & Liabilities', content: 'Enter your financial information to calculate your net worth and get personalized recommendations.' },
      { title: 'Your Net Worth Analysis', content: 'Complete financial position with total assets, total liabilities, net worth, financial health badge, and interpretation.' },
    ],
    whatIs: 'The Net Worth Calculator helps you see your overall financial position by adding up your assets (cash, investments, real estate, vehicles, other) and subtracting your liabilities (mortgage, credit cards, student loans, auto loans, other debt). You get a single net worth number, a financial health rating, asset and liability breakdowns, and personalized recommendations and warning signs.',
    howToUseSteps: [
      'Enter all asset values: liquid assets, investment assets, real estate value, vehicle value, other assets. Use 0 for categories that do not apply.',
      'Enter all liability (debt) values: mortgage, credit cards, student loans, auto loans, other debt. Use 0 for categories that do not apply.',
      'Click Calculate My Net Worth.',
      'Review total assets, total liabilities, net worth, financial health rating, interpretation, asset and liability breakdowns, recommendations, and warning signs.',
    ],
    whatResultsMean: {
      intro: 'Your net worth is the difference between what you own and what you owe. The calculator also categorizes your financial health and explains what to focus on.',
      items: [
        'Total Assets: Sum of all asset categories you entered.',
        'Total Liabilities: Sum of all debt categories you entered.',
        'Net Worth: Assets minus liabilities. Positive means you own more than you owe.',
        'Financial Health: Critical (negative net worth), Poor, Fair, Good, or Excellent based on net worth relative to assets.',
        'Interpretation: Short explanation (e.g. focus on debt reduction, good foundation, strong position).',
        'Asset/Liability Breakdown: Each category shown with amount and percentage of total.',
      ],
    },
    whyUse: [
      'Get a clear snapshot of your overall financial position.',
      'Track progress over time by recalculating periodically.',
      'Identify if debt is too high relative to assets.',
      'See which assets and debts dominate your balance sheet.',
      'Use recommendations and warning signs to prioritize next steps.',
    ],
    conclusion: 'The Net Worth Calculator is a straightforward way to see your true financial position. By entering your assets and liabilities, you get your net worth, financial health rating, breakdowns, and actionable recommendations. Use it regularly to track progress and guide debt payoff and savings decisions.',
    aboutTheory: [
      { title: 'About net worth', content: 'Net worth is total assets minus total liabilities. It is a key measure of financial health. A positive and growing net worth indicates you are building wealth; negative net worth means you owe more than you own and should focus on debt reduction and building assets.' },
      { title: 'Limitations', content: 'Values are estimates; use current market values where possible. The calculator does not include future income or expenses. Consult a financial advisor for comprehensive planning.' },
    ],
    relatedCalculators: [
      { name: 'Retirement Savings Calculator', slug: 'retirement-savings-calculator' },
      { name: 'Compound Interest Calculator', slug: 'compound-interest-calculator' },
      { name: 'Credit Card Payoff Calculator', slug: 'credit-card-payoff-calculator' },
      { name: 'Debt Snowball Avalanche Calculator', slug: 'debt-snowball-avalanche-repayment-calculator' },
      { name: 'Emergency Fund Calculator', slug: 'emergency-fund-calculator' },
    ],
  },
  'credit-card-payoff-calculator': {
    inputs: [
      { label: 'Current Balance', description: 'Your current credit card balance.' },
      { label: 'Annual Interest Rate (%)', description: 'The APR on your credit card.' },
      { label: 'Minimum Payment', description: 'The minimum monthly payment required by the issuer.' },
      { label: 'Extra Payment (Optional)', description: 'Additional amount you can pay each month to speed up payoff.' },
      { label: 'Payoff Strategy', description: 'Minimum Payment, Fixed Payment, Debt Snowball, or Debt Avalanche.' },
    ],
    formula: 'N = -ln(1 - (r×P)/A) / ln(1+r). N = Number of Months, P = Principal Balance, r = Monthly Interest Rate, A = Monthly Payment, ln = Natural Logarithm. Each month: interest = balance × monthly rate; principal = payment - interest; new balance = balance - principal.',
    formulaExplanation: 'Payoff time is calculated by simulating each month: interest is applied to the balance, then payment is applied (interest first, then principal). Total interest is the sum of interest paid over all months until balance is zero.',
    results: [
      'Payoff Time (years and months, total months)',
      'Total Interest (interest cost over the life of the debt)',
      'Monthly Payment (minimum plus extra)',
      'Strategy used (e.g. Minimum Payment, Fixed Payment)',
      'Interpretation (e.g. short payoff, long payoff, consider consolidation)',
      'Payment Schedule (first 12 months: Month, Balance, Payment, Interest, Principal)',
      'Smart Actions & Recommendations',
      'Warning Signs to Watch',
    ],
    sections: [
      { title: 'Credit Card Debt Information', content: 'Enter your credit card details to calculate payoff timeline and strategies.' },
      { title: 'Your Credit Card Payoff Plan', content: 'Timeline and strategy for becoming debt-free. Shows payoff time, total interest, monthly payment, and payment schedule.' },
    ],
    whatIs: 'The Credit Card Payoff Calculator shows how long it will take to pay off your credit card balance based on your monthly payment and interest rate. You enter your current balance, annual interest rate (APR), minimum payment, and optional extra payment. The calculator shows payoff time in years and months, total interest you will pay, a month-by-month schedule (first 12 months), and recommendations and warning signs.',
    howToUseSteps: [
      'Enter your current credit card balance.',
      'Enter the annual interest rate (APR) as a percentage (e.g. 18.99).',
      'Enter your minimum monthly payment.',
      'Optionally enter an extra amount you can pay each month to speed up payoff.',
      'Select payoff strategy: Minimum Payment, Fixed Payment, Debt Snowball, or Debt Avalanche (for context; payoff math is based on your total monthly payment).',
      'Click Calculate Payoff Plan.',
      'Review payoff time, total interest, monthly payment, payment schedule, recommendations, and warning signs.',
    ],
    whatResultsMean: {
      intro: 'The results show how many months (and years) until you are debt-free, how much interest you will pay in total, and what to do if the timeline is too long.',
      items: [
        'Payoff Time: Number of months (and years) until balance is zero.',
        'Total Interest: Total interest you will pay over the life of the debt.',
        'Monthly Payment: Your minimum plus any extra payment you entered.',
        'Interpretation: Short payoff (good), moderate (consider increasing payments), long (consider consolidation or balance transfer).',
        'Payment Schedule: First 12 months showing balance, payment, interest, and principal each month.',
      ],
    },
    whyUse: [
      'See how long it will take to become debt-free with your current payment.',
      'See how much total interest you will pay.',
      'Test the effect of adding an extra payment each month.',
      'Get recommendations (e.g. consolidation, balance transfer, snowball/avalanche).',
      'Identify warning signs (e.g. payoff over 25 years, interest exceeding balance).',
    ],
    conclusion: 'The Credit Card Payoff Calculator is a practical tool to see your path to being debt-free. By entering your balance, rate, and payment, you get payoff time, total interest, and a payment schedule. Use it to decide whether to increase payments or explore consolidation or balance transfer options.',
    aboutTheory: [
      { title: 'Payoff strategies', content: 'Minimum Payment: pay only the minimum; longest time and most interest. Fixed Payment: pay the same amount each month; faster payoff as balance drops. Debt Snowball: pay smallest balance first for psychological wins. Debt Avalanche: pay highest interest rate first to minimize total interest.' },
      { title: 'Limitations', content: 'Assumes fixed rate and payment; actual terms may vary. Does not include fees or new charges. For multiple cards, use one card at a time or a dedicated multi-debt calculator.' },
    ],
    relatedCalculators: [
      { name: 'Retirement Savings Calculator', slug: 'retirement-savings-calculator' },
      { name: 'Compound Interest Calculator', slug: 'compound-interest-calculator' },
      { name: 'Net Worth Calculator', slug: 'net-worth-calculator' },
      { name: 'Debt Snowball Avalanche Calculator', slug: 'debt-snowball-avalanche-repayment-calculator' },
      { name: 'Loan EMI Calculator', slug: 'loan-emi-calculator' },
    ],
  },
};

export function getCalculatorSeoContent(slug: string): CalculatorSeoContent | undefined {
  return calculatorSeoContent[slug];
}

export function getRelatedCalculatorUrl(slug: string, category: string): string {
  return `${BASE_URL}/category/${category}/${slug}`;
}
