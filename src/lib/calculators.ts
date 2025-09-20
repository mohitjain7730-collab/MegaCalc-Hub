export interface Calculator {
  id: number;
  name: string;
  description: string;
  slug: string;
  category: string;
}

export const calculators: Calculator[] = [
  // Home Improvement
  {
    id: 1,
    name: 'Paint Coverage Calculator',
    description: 'How many litres/gallons of paint are needed for a given room size and number of coats.',
    slug: 'paint-coverage',
    category: 'home-improvement',
  },
  {
    id: 2,
    name: 'Tile & Flooring Calculator',
    description: 'Number of tiles or square metres/feet of flooring material needed, including a % for wastage.',
    slug: 'tile-flooring',
    category: 'home-improvement',
  },
  {
    id: 3,
    name: 'Wallpaper Roll Calculator',
    description: 'Rolls of wallpaper required based on wall area and pattern repeat.',
    slug: 'wallpaper-roll',
    category: 'home-improvement',
  },
  {
    id: 4,
    name: 'Drywall/Plasterboard Calculator',
    description: 'Number of drywall sheets and joint compound needed for a room.',
    slug: 'drywall-plasterboard',
    category: 'home-improvement',
  },
  {
    id: 5,
    name: 'Insulation R-Value Calculator',
    description: 'Recommended insulation thickness and material type for a target R-value.',
    slug: 'insulation-r-value',
    category: 'home-improvement',
  },
  {
    id: 6,
    name: 'Decking Materials Calculator',
    description: 'Boards, fasteners, and joists needed for a deck of specific size.',
    slug: 'decking-materials',
    category: 'home-improvement',
  },
  {
    id: 7,
    name: 'Roofing Shingle Calculator',
    description: 'Bundles of shingles and underlayment required for a roof area with pitch adjustment.',
    slug: 'roofing-shingle',
    category: 'home-improvement',
  },
  {
    id: 8,
    name: 'Concrete Volume Calculator',
    description: 'Cubic metres/feet of concrete required for a slab, footing, or driveway.',
    slug: 'concrete-volume',
    category: 'home-improvement',
  },
  {
    id: 9,
    name: 'Lumber/Framing Calculator',
    description: 'Quantity of studs, plates, and beams for building or remodeling walls.',
    slug: 'lumber-framing',
    category: 'home-improvement',
  },
  {
    id: 10,
    name: 'Lighting Layout Calculator',
    description: 'Number and placement of light fixtures needed to achieve a target lux/foot-candle level.',
    slug: 'lighting-layout',
    category: 'home-improvement',
  },
  {
    id: 11,
    name: 'HVAC Sizing Calculator',
    description: 'Approximate BTU or tonnage of heating/cooling system needed for a room/house size.',
    slug: 'hvac-sizing',
    category: 'home-improvement',
  },
  {
    id: 12,
    name: 'Staircase Rise & Run Calculator',
    description: 'Number of steps, tread depth, and riser height for a given total height.',
    slug: 'staircase-rise-run',
    category: 'home-improvement',
  },
  {
    id: 13,
    name: 'Cost Estimator for Renovation',
    description: 'Rough cost breakdown based on square footage and type of work (kitchen, bathroom, etc.).',
    slug: 'cost-estimator-renovation',
    category: 'home-improvement',
  },
  {
    id: 14,
    name: 'Water Usage / Plumbing Flow Calculator',
    description: 'Expected water flow and pipe size requirements for new fixtures.',
    slug: 'water-usage-plumbing-flow',
    category: 'home-improvement',
  },
  {
    id: 15,
    name: 'Garden/Landscape Soil & Mulch Calculator',
    description: 'Volume of soil or mulch needed for beds or planters.',
    slug: 'garden-landscape-soil-mulch',
    category: 'home-improvement',
  },
];
