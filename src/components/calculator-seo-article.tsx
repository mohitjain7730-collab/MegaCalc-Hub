import type { Calculator } from '@/types';
import type { CalculatorSeoContent } from '@/lib/calculator-seo-content';
import { getRelatedCalculatorUrl } from '@/lib/calculator-seo-content';

interface CalculatorSeoArticleProps {
  calculator: Calculator;
  categorySlug: string;
  extendedSeoContent: CalculatorSeoContent | undefined;
  faqContent: { question: string; answer: string }[];
  howToSteps: { name: string; text: string }[];
}

/**
 * Server-rendered SEO article: H1-level content, guide, formula, FAQ, related links.
 * All content is in initial HTML (visible in View Page Source).
 */
export function CalculatorSeoArticle({
  calculator,
  categorySlug,
  extendedSeoContent,
  faqContent,
  howToSteps,
}: CalculatorSeoArticleProps) {
  return (
    <article
      id="calculator-seo-content"
      className="mt-10 pt-8 border-t border-border prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-h2:mt-8 prose-h2:mb-3 prose-h3:mt-6 prose-h3:mb-2 prose-p:my-2 prose-ul:my-2 prose-li:my-0.5"
    >
      <h2>{calculator.name}</h2>
      <p>{calculator.description}</p>

      {extendedSeoContent ? (
        <>
          {extendedSeoContent.whatIs && (
            <>
              <h2>What Is the {calculator.name}?</h2>
              <p>{extendedSeoContent.whatIs}</p>
            </>
          )}
          {extendedSeoContent.formula && (
            <>
              <h2>Formula</h2>
              <div>
                <p><strong>Formula:</strong> {extendedSeoContent.formula}</p>
                {extendedSeoContent.formulaExplanation && (
                  <p>{extendedSeoContent.formulaExplanation}</p>
                )}
              </div>
            </>
          )}
          <h2>Calculator Inputs and Parameters</h2>
          <p>This calculator uses the following inputs:</p>
          <ul>
            {extendedSeoContent.inputs.map((input, i) => (
              <li key={i}>
                <strong>{input.label}</strong>
                {input.description ? ` — ${input.description}` : ''}
              </li>
            ))}
          </ul>
          {extendedSeoContent.howToUseSteps && extendedSeoContent.howToUseSteps.length > 0 && (
            <>
              <h2>How to Use the {calculator.name}</h2>
              <p>Follow these steps to get accurate results:</p>
              <ul>
                {extendedSeoContent.howToUseSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </>
          )}
          {extendedSeoContent.whatResultsMean && (
            <>
              <h2>What the Results Mean</h2>
              {extendedSeoContent.whatResultsMean.intro && (
                <p>{extendedSeoContent.whatResultsMean.intro}</p>
              )}
              <ul>
                {extendedSeoContent.whatResultsMean.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </>
          )}
          {extendedSeoContent.whyUse && extendedSeoContent.whyUse.length > 0 && (
            <>
              <h2>Why Use the {calculator.name}?</h2>
              <p>Understanding your results can help you make informed decisions. Here is how this calculator can be useful:</p>
              <ul>
                {extendedSeoContent.whyUse.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </>
          )}
          <h2>Results and Output</h2>
          <p>The calculator displays the following results:</p>
          <ul>
            {extendedSeoContent.results.map((result, i) => (
              <li key={i}>{result}</li>
            ))}
          </ul>
          <h2>Frequently Asked Questions (FAQ)</h2>
          {faqContent.map((faq, i) => (
            <div key={i}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
          {extendedSeoContent.conclusion && (
            <>
              <h2>Conclusion</h2>
              <p>{extendedSeoContent.conclusion}</p>
            </>
          )}
          {extendedSeoContent.aboutTheory && extendedSeoContent.aboutTheory.length > 0 && (
            <>
              <h2>About and Theory</h2>
              {extendedSeoContent.aboutTheory.map((block, i) => (
                <div key={i}>
                  <h3>{block.title}</h3>
                  <p>{block.content}</p>
                </div>
              ))}
            </>
          )}
          {extendedSeoContent.relatedCalculators && extendedSeoContent.relatedCalculators.length > 0 && (
            <>
              <h2>Related Calculators</h2>
              <p>Explore other related tools:</p>
              <ul>
                {extendedSeoContent.relatedCalculators.map((rel, i) => (
                  <li key={i}>
                    <a href={getRelatedCalculatorUrl(rel.slug, categorySlug)}>{rel.name}</a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      ) : (
        <>
          <h2>How to use {calculator.name}</h2>
          <p>Step-by-step guide to using the {calculator.name}:</p>
          <ol>
            {howToSteps.map((step, i) => (
              <li key={i}>
                <strong>{step.name}.</strong> {step.text}
              </li>
            ))}
          </ol>
          <h2>Frequently asked questions</h2>
          {faqContent.map((faq, i) => (
            <div key={i}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </>
      )}
    </article>
  );
}
