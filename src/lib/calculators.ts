import { Calculator } from '../types';
import { conversion_calculators } from '../data/calculators/conversion';

export const calculators: Calculator[] = [
  ...conversion_calculators,
  // Finance

  {
    id: 4701,
    name: 'Tangency Portfolio (Max Sharpe) Calculator',
    description: 'Compute two-asset tangency portfolio weights that maximize Sharpe relative to a risk-free rate.',
    slug: 'tangency-portfolio-calculator',
    category: 'finance',
    metaTitle: 'Tangency Portfolio (Max Sharpe) Calculator',
    metaDescription: 'Find max Sharpe (tangency) portfolio weights from expected returns, volatilities, correlation, and risk-free rate.'
  },
  {
    id: 4710,
    name: 'Portfolio Correlation Heatmap Tool',
    description: 'Visualize pairwise correlations between assets and identify clusters driving portfolio risk.',
    slug: 'portfolio-correlation-heatmap-tool',
    category: 'finance',
    metaTitle: 'Portfolio Correlation Heatmap Tool',
    metaDescription: 'Generate a correlation heatmap for multiple assets to spot diversification opportunities and risk clusters.'
  }
];