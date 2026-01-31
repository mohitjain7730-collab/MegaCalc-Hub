/**
 * Extended SEO content for calculators: inputs, formula, results, and UI text
 * so crawlers see full calculator details in the page source.
 * Keyed by calculator slug.
 */
export interface CalculatorSeoContent {
  inputs: { label: string; description?: string }[];
  formula?: string;
  formulaExplanation?: string;
  results: string[];
  sections?: { title: string; content: string }[];
}

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
  },
  'compound-interest-calculator': {
    inputs: [
      { label: 'Principal Amount', description: 'The initial amount of money you are investing. This is the foundation that will grow through compound interest over time.' },
      { label: 'Annual Interest Rate (%)', description: 'The nominal annual interest rate for the investment. Higher rates lead to faster growth, but also higher risk.' },
      { label: 'Number of Years', description: 'The total number of years the money will be invested. Time is the most powerful factor in compound interest growth.' },
      { label: 'Compounding Frequency', description: 'How often interest is calculated and added to the principal. Options: Annually, Semi-Annually, Quarterly, Monthly, Daily. More frequent compounding results in slightly higher returns.' },
    ],
    formula: 'A = P(1 + r/n)^(nt). A = Final Amount, P = Principal Investment, r = Annual Interest Rate (decimal), n = Compounding Frequency per year, t = Number of Years. Rule of 72: Years to double ≈ 72 / annual rate.',
    formulaExplanation: 'Compound interest means you earn interest on your interest. The formula shows how your initial investment grows over time. Effective annual rate is higher when compounding is more frequent.',
    results: [
      'Future Value (total amount after the period)',
      'Principal Amount (your initial investment)',
      'Interest Earned (and percentage return on investment)',
      'Annualized Return (average annual growth rate)',
      'Years to Double (Rule of 72 calculation)',
      'Investment Growth Over Time (chart: Future Value vs Principal)',
      'Smart Actions & Recommendations (e.g. High Growth Trajectory, Power of Compounding)',
    ],
    sections: [
      { title: 'Investment Parameters', content: 'Enter your investment details to see the power of compound interest.' },
      { title: 'Your Investment Growth', content: 'Results show future value, principal, interest earned, annualized return, and years to double. Chart visualizes growth over time.' },
      { title: 'Understanding the Inputs', content: 'Principal is your initial investment. Annual rate and number of years drive growth. Compounding frequency (annually to daily) affects the final amount.' },
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
      'Interpretation (e.g. Negative net worth, Low net worth, Strong net worth)',
      'Asset Breakdown (by category with amount and percentage)',
      'Liability Breakdown (by category with amount and percentage)',
      'Smart Actions & Recommendations',
      'Warning Signs to Watch',
    ],
    sections: [
      { title: 'Financial Assets & Liabilities', content: 'Enter your financial information to calculate your net worth and get personalized recommendations.' },
      { title: 'Your Net Worth Analysis', content: 'Complete financial position with total assets, total liabilities, net worth, financial health badge, and interpretation. Asset and liability breakdowns show category breakdown.' },
      { title: 'Understanding Net Worth', content: 'Net worth is the difference between total assets and total liabilities. It is a key indicator of financial health. Assets are what you own; liabilities are what you owe.' },
    ],
  },
  'credit-card-payoff-calculator': {
    inputs: [
      { label: 'Current Balance', description: 'Your current credit card balance.' },
      { label: 'Annual Interest Rate (%)', description: 'The APR on your credit card.' },
      { label: 'Minimum Payment', description: 'The minimum monthly payment required by the issuer.' },
      { label: 'Extra Payment (Optional)', description: 'Additional amount you can pay each month to speed up payoff.' },
      { label: 'Payoff Strategy', description: 'Minimum Payment, Fixed Payment, Debt Snowball, or Debt Avalanche. Snowball: pay smallest balance first. Avalanche: pay highest interest first.' },
    ],
    formula: 'N = -ln(1 - (r×P)/A) / ln(1+r). N = Number of Months, P = Principal Balance, r = Monthly Interest Rate, A = Monthly Payment, ln = Natural Logarithm. Each month: interest = balance × monthly rate; principal = payment - interest; new balance = balance - principal.',
    formulaExplanation: 'Payoff time is calculated by simulating each month: interest is applied to the balance, then payment is applied (interest first, then principal). Total interest is the sum of interest paid over all months until balance is zero.',
    results: [
      'Payoff Time (years and months, total months)',
      'Total Interest (interest cost over the life of the debt)',
      'Monthly Payment (minimum plus extra)',
      'Strategy used (e.g. Minimum Payment Strategy, Fixed Payment Strategy)',
      'Interpretation (e.g. Short payoff time, Long payoff time, Consider debt consolidation)',
      'Payment Schedule (first 12 months: Month, Balance, Payment, Interest, Principal)',
      'Smart Actions & Recommendations',
      'Warning Signs to Watch',
    ],
    sections: [
      { title: 'Credit Card Debt Information', content: 'Enter your credit card details to calculate payoff timeline and strategies.' },
      { title: 'Your Credit Card Payoff Plan', content: 'Timeline and strategy for becoming debt-free. Shows payoff time, total interest, monthly payment, and payment schedule for the first 12 months.' },
      { title: 'Understanding Credit Card Payoff Strategies', content: 'Minimum Payment: longest payoff, highest interest. Debt Snowball: pay smallest balance first for psychological wins. Debt Avalanche: pay highest interest first to save money. Fixed Payment: same amount each month for predictable budgeting.' },
    ],
  },
};

export function getCalculatorSeoContent(slug: string): CalculatorSeoContent | undefined {
  return calculatorSeoContent[slug];
}
