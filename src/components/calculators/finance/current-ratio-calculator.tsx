import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, CheckCircle2, DollarSign, AlertCircle, FunctionSquare, Calculator, Shield, BarChart3, TrendingUp, Users, AlertTriangle, Briefcase, Landmark } from 'lucide-react';
import CurrentRatioCalculatorInteractive from './current-ratio-calculator-interactive';

export default function CurrentRatioCalculator() {
  return (
    <div className="space-y-8">
      {/* SEO-Optimized Header */}
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold">Current Ratio Calculator</h1>
        <p className="text-lg text-muted-foreground">
          Measure your company's ability to pay short-term obligations with the Current Ratio Calculator. Assess liquidity, financial health, and working capital efficiency.
        </p>
      </div>

      <CurrentRatioCalculatorInteractive />

      {/* Understanding the Inputs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>
            Key components required for the Current Ratio calculation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                Current Assets
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Assets expected to be converted to cash, sold, or consumed within one year.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Cash & Cash Equivalents</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Accounts Receivable</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Inventory / Stock</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Short-term Investments</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <AlertCircle className="h-4 w-4" />
                Current Liabilities
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Financial obligations and debts that are due to be paid within one year.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Accounts Payable</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Short-term Debt</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Accrued Expenses</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Dividends Payable</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Current Ratio = Current Assets / Current Liabilities
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Measures short-term liquidity by comparing assets convertible to cash within one year against liabilities due within one year.
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>
            Explore other liquidity and financial analysis tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/quick-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Quick Ratio</p>
                      <p className="text-sm text-muted-foreground">Acid-test liquidity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/working-capital-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Working Capital</p>
                      <p className="text-sm text-muted-foreground">Operational liquidity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/cash-conversion-cycle-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Cash Conversion Cycle</p>
                      <p className="text-sm text-muted-foreground">Working capital efficiency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/interest-coverage-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Interest Coverage Ratio</p>
                      <p className="text-sm text-muted-foreground">Debt servicing capability</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/debt-to-equity-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Debt-to-Equity Ratio</p>
                      <p className="text-sm text-muted-foreground">Capital structure analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/free-cash-flow-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Free Cash Flow</p>
                      <p className="text-sm text-muted-foreground">Cash generation analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
        {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
        <meta itemProp="name" content="The Definitive Guide to the Current Ratio: Calculation, Interpretation, and Liquidity Analysis" />
        <meta itemProp="description" content="An expert guide detailing the Current Ratio formula, its primary role in measuring a company's short-term liquidity, interpreting ideal and dangerous thresholds, and its comparison to the more stringent Quick Ratio (Acid-Test Ratio)." />
        <meta itemProp="keywords" content="current ratio formula explained, calculating current ratio, short-term liquidity analysis, working capital ratio, ideal current ratio threshold, quick ratio vs current ratio, solvency analysis" />
        <meta itemProp="author" content="MegaCalc Financial Analysis Team" />
        <meta itemProp="datePublished" content="2026-02-14" />

        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to the Current Ratio: Measuring Short-Term Liquidity and Solvency</h2>
        <p className="text-lg italic text-muted-foreground">Master the fundamental metric that assesses a company's ability to cover its immediate financial obligations with its readily available assets.</p>

        {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">Current Ratio: Definition and Core Purpose</a></li>
          <li><a href="#calculation" className="hover:underline">The Current Ratio Formula and Components</a></li>
          <li><a href="#interpretation" className="hover:underline">Interpreting the Ratio and Ideal Thresholds</a></li>
          <li><a href="#quick-ratio" className="hover:underline">Current Ratio vs. Quick Ratio (Acid-Test)</a></li>
          <li><a href="#applications" className="hover:underline">Role in Credit and Financial Analysis</a></li>
        </ul>
        <hr />

        {/* CURRENT RATIO: DEFINITION AND CORE PURPOSE */}
        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Current Ratio: Definition and Core Purpose</h2>
        <p>The <strong>Current Ratio</strong>, often called the <strong>Working Capital Ratio</strong>, is a primary measure of a company’s liquidity. It assesses the firm’s ability to pay off its short-term liabilities (debts due within one year) using its short-term assets (assets convertible to cash within one year).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">A Measure of Short-Term Solvency</h3>
        <p>The ratio provides a crucial snapshot of a company's financial health, demonstrating whether the business has sufficient cash and near-cash assets to cover its immediate operating expenses and debt obligations. It is a vital metric for creditors, suppliers, and short-term investors.</p>

        <hr />

        {/* THE CURRENT RATIO FORMULA AND COMPONENTS */}
        <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Current Ratio Formula and Components</h2>
        <p>The Current Ratio is calculated by dividing the total value of current assets by the total value of current liabilities, both of which are found on the company's Balance Sheet.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
        <p>The formula for the Current Ratio is:</p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">
            Current Ratio = Total Current Assets / Total Current Liabilities
          </p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-6">Defining Current Assets</h3>
        <p>Current Assets include items expected to be converted into cash within one year:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Cash and Cash Equivalents (most liquid).</li>
          <li>Accounts Receivable (money owed by customers).</li>
          <li>Inventory (raw materials, work-in-progress, finished goods).</li>
          <li>Marketable Securities (short-term investments).</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Defining Current Liabilities</h3>
        <p>Current Liabilities include obligations due for repayment within one year:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Accounts Payable (money owed to suppliers).</li>
          <li>Short-Term Debt (current portion of long-term debt).</li>
          <li>Accrued Expenses (salaries, utilities).</li>
          <li>Unearned Revenue (advance payments from customers).</li>
        </ul>

        <hr />

        {/* INTERPRETING THE RATIO AND IDEAL THRESHOLDS */}
        <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting the Ratio and Ideal Thresholds</h2>
        <p>The Current Ratio is expressed as a number (e.g., 2.0). A result of 2.0 means the company has two dollars in current assets for every one dollar in current liabilities.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">General Interpretation Guidelines</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong className="font-semibold">Ratio = 1.0:</strong> The company's current assets exactly cover its current liabilities. This is the minimum acceptable threshold for solvency, offering no margin of safety.</li>
          <li><strong className="font-semibold">Ratio &lt; 1.0 (Danger Zone):</strong> The company is technically insolvent in the short term, meaning it lacks sufficient liquid assets to cover its immediate debts. This signals high risk of bankruptcy or operational disruption.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Ideal Threshold (The 2:1 Rule)</h3>
        <p>Historically, a Current Ratio of <strong>2.0 or higher</strong> has been considered the ideal benchmark. This 2:1 ratio provides a strong safety buffer, indicating that even if liquid assets decrease unexpectedly, the company should still be able to meet its short-term obligations comfortably.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Danger of a Very High Ratio</h3>
        <p>A ratio that is excessively high (e.g., 5.0 or 6.0) is not always positive. It may suggest the company is being inefficient with its assets—perhaps holding too much cash in low-yield accounts or carrying excessive, slow-moving inventory rather than investing the capital for growth.</p>

        <hr />

        {/* CURRENT RATIO VS. QUICK RATIO (ACID-TEST) */}
        <h2 id="quick-ratio" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Current Ratio vs. Quick Ratio (Acid-Test)</h2>
        <p>The <strong>Quick Ratio</strong> is a more stringent measure of liquidity that addresses the main flaw of the Current Ratio: the inclusion of inventory.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Inventory Flaw</h3>
        <p>The Current Ratio includes <strong>Inventory</strong> in current assets. Inventory is often the least liquid current asset, as it may take time to sell, or its value may be volatile (obsolescence). The Current Ratio may overstate true liquidity if inventory makes up a large portion of assets.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Quick Ratio Formula</h3>
        <p>The Quick Ratio (or Acid-Test Ratio) excludes inventory and often prepaid expenses, focusing only on the most immediately convertible assets:</p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">
            Quick Ratio = (Cash + Marketable Securities + Accounts Receivable) / Total Current Liabilities
          </p>
        </div>
        <p>A Quick Ratio of <strong>1.0 or higher</strong> is generally considered healthy, as it means the company can cover its immediate debts without having to sell any inventory.</p>

        <hr />

        {/* ROLE IN CREDIT AND FINANCIAL ANALYSIS */}
        <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Role in Credit and Financial Analysis</h2>
        <p>The Current Ratio is a foundational tool for credit analysis, guiding decisions made by banks, vendors, and suppliers.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Lending Decisions</h3>
        <p>Banks use the Current Ratio to assess the borrower's ability to service short-term debt and the interest component of long-term debt. A low ratio increases the perceived risk of the loan, potentially leading to higher interest rates or rejection.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Industry Benchmarks</h3>
        <p>The <strong>acceptable</strong> Current Ratio varies significantly by industry. Supermarkets (retail) may operate safely with a ratio near 1.1 because their inventory turns over rapidly (high liquidity). Conversely, manufacturing firms with slow inventory turnover require a higher ratio (2.0+) for the same level of safety.</p>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>The Current Ratio is the core metric for measuring <strong>short-term liquidity</strong>, quantifying the margin of safety between a company's liquid assets and its immediate liabilities. It serves as the initial screening tool for financial solvency.</p>
        <p>While a ratio of <strong>2.0</strong> is the traditional ideal benchmark, prudent analysis requires comparing the ratio against industry peers and analyzing the components, particularly the volume of slow-moving inventory, which is often better assessed using the more stringent <strong>Quick Ratio</strong>.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Current Ratio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the Current Ratio?</h4>
              <p className="text-muted-foreground">
                The Current Ratio is a liquidity ratio that measures a company's ability to pay short-term obligations or those due within one year. It's calculated by dividing current assets by current liabilities. This ratio indicates how many times a company can cover its current liabilities with its current assets.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered a good Current Ratio?</h4>
              <p className="text-muted-foreground">
                Generally, a ratio between 1.5 and 2 is considered healthy, indicating good short-term financial strength. A ratio above 2 may indicate excess liquidity, while a ratio below 1 suggests potential liquidity problems. However, optimal ratios vary by industry and business model.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate the Current Ratio?</h4>
              <p className="text-muted-foreground">
                The formula is: Current Ratio = Current Assets ÷ Current Liabilities. Current Assets include cash, accounts receivable, inventory, and other assets expected to be converted to cash within one year. Current Liabilities include accounts payable, short-term debt, and other obligations due within one year.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Do Current Ratios vary by industry?</h4>
              <p className="text-muted-foreground">
                Yes, acceptable ratios vary significantly by industry. Retail companies typically have lower ratios due to high inventory turnover. Service companies may have higher ratios due to fewer current assets. Manufacturing companies often have moderate ratios. Always compare within the same industry for meaningful analysis.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of the Current Ratio?</h4>
              <p className="text-muted-foreground">
                The ratio doesn't consider the quality or liquidity of specific assets. Inventory may not be easily convertible to cash. It's a snapshot in time and doesn't reflect cash flow timing. Seasonal businesses may have fluctuating ratios. It doesn't account for off-balance sheet obligations or credit lines.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How can a company improve its Current Ratio?</h4>
              <p className="text-muted-foreground">
                Companies can improve the ratio by increasing current assets through better cash management, faster receivables collection, or inventory optimization. They can also reduce current liabilities by paying down short-term debt or extending payment terms with suppliers. However, excessive liquidity may indicate inefficient capital allocation.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What if current liabilities exceed current assets?</h4>
              <p className="text-muted-foreground">
                A ratio below 1 indicates that current liabilities exceed current assets, suggesting potential liquidity problems. This means the company may struggle to meet its short-term obligations without additional financing, asset sales, or improved cash flow generation. It's a warning sign for creditors and investors.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does Current Ratio differ from Quick Ratio?</h4>
              <p className="text-muted-foreground">
                The Current Ratio includes all current assets (including inventory), while the Quick Ratio excludes inventory and other less liquid assets. The Quick Ratio is more conservative and provides a stricter test of liquidity. Both ratios should be analyzed together for a complete liquidity assessment.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why is the Current Ratio important for investors?</h4>
              <p className="text-muted-foreground">
                For investors, this ratio indicates the company's short-term financial stability and ability to meet obligations without disrupting operations. A healthy ratio suggests lower bankruptcy risk and more predictable cash flows. It also indicates whether the company has sufficient liquidity for growth investments or unexpected expenses.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do creditors use the Current Ratio?</h4>
              <p className="text-muted-foreground">
                Creditors use this ratio to assess short-term credit risk and determine loan terms. Higher ratios may result in better credit terms and lower interest rates. Creditors often require minimum ratios in loan covenants to ensure borrowers maintain adequate liquidity throughout the loan term.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage of this Calculator */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Practical applications and real-world context
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Who should use */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Who Should Use This Calculator?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Small Business Owners</strong>
                <span className="text-sm text-muted-foreground">To regularly check liquidity health and ensure you can meet upcoming payroll and supplier payments.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Stock Investors</strong>
                <span className="text-sm text-muted-foreground">To screen potential investments. A ratio &lt; 1.0 is a red flag suggesting dilution risk (raising capital) or bankruptcy risk.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Credit Analysts</strong>
                <span className="text-sm text-muted-foreground">To determine creditworthiness before approving a loan or extending trade credit terms.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Financial Students</strong>
                <span className="text-sm text-muted-foreground">To understand the mechanics of balance sheet analysis and liquidity constraints.</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          {/* When it might be inaccurate */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations & Accuracy nuances
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Seasonal Variations:</strong> For retailers, the Current Ratio spikes during holiday inventory build-up and drops after sales. Calculating it in the "off-season" may give a misleadingly low value.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Just-in-Time (JIT) Inventory:</strong> Modern firms (like Dell or Walmart) keep inventory extremely low intentionally. This lowers their Current Ratio, but it signals efficiency, not distress.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>"Window Dressing":</strong> Companies may pay off debts with cash right before the financial reporting date to artificially inflate the ratio for appearing healthier than they are.</span>
              </li>
            </ul>
          </div>

          <hr className="border-border/50" />

          {/* Real World Examples */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Landmark className="h-5 w-5 text-green-600" />
              Real-World Examples
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: The Tech Giant (Apple/Google)</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  Often maintains a lower Current Ratio (around 1.0 - 1.2). Why? Because they hold massive cash reserves in <em>non-current</em> long-term investments for higher yields. They can liquidate these easily if needed, so a lower ratio is not a risk.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Case B: The Heavy Manufacturer (Ford/GM)</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  Typically requires a higher ratio (1.5 - 2.0). They carry significant raw material inventory and work-in-progress parts. If their ratio drops to 1.0, a simple supply chain delay could cause a liquidity crisis.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Info className="h-6 w-6 text-primary mt-1 shrink-0" />
            <div>
              <h2 className="font-semibold text-lg mb-2">Summary</h2>
              <p className="text-sm text-muted-foreground">
                The Current Ratio Calculator measures a company's ability to pay short-term obligations with its current assets.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                It is a fundamental metric for assessing liquidity and working capital health.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Use this tool to track liquidity trends and ensure the company maintains sufficient working capital.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
