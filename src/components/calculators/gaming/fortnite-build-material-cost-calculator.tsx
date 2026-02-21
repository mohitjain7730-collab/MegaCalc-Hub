import Link from 'next/link';
import { Gamepad2, BrainCircuit, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FortniteBuildMaterialCostCalculatorInteractive from './fortnite-build-material-cost-calculator-interactive';

const steps = [
  'Enter the number of wood walls you want to build.',
  'Enter the number of stone walls you want to build.',
  'Enter the number of metal walls you want to build.',
  'Enter the number of wood floors you want to build.',
  'Enter the number of stone floors you want to build.',
  'Enter the number of metal floors you want to build.',
  'Enter the number of wood stairs you want to build.',
  'Enter the number of stone stairs you want to build.',
  'Enter the number of metal stairs you want to build.',
  'Enter the number of wood roofs you want to build.',
  'Enter the number of stone roofs you want to build.',
  'Enter the number of metal roofs you want to build.',
  'Review the total material costs, breakdown by material and structure type, and recommendations.',
];

const faqs = [
  {
    question: 'What are the material costs in Fortnite?',
    answer:
      'In Fortnite, each building piece costs materials: Wood costs 10 materials per piece, Stone costs 20 materials per piece, and Metal costs 30 materials per piece. These costs are consistent across all structure types (walls, floors, stairs, roofs). Material costs are the same regardless of structure type - only the material type affects cost.',
  },
  {
    question: 'How do I collect materials in Fortnite?',
    answer:
      'Materials are collected by harvesting objects with your pickaxe: Wood from trees, wooden structures, and wooden objects; Stone from rocks, stone structures, and stone objects; Metal from vehicles, metal structures, and metal objects. Each hit with the pickaxe grants materials. Different objects provide different material types and amounts.',
  },
  {
    question: 'Which material is best for building?',
    answer:
      'Material choice depends on situation: Wood is fastest to build and cheapest (10 materials) but weakest in health. Stone is balanced (20 materials) with moderate health and build speed. Metal is strongest in health but slowest to build and most expensive (30 materials). Use wood for quick builds, stone for balanced defense, and metal for strong fortifications.',
  },
  {
    question: 'How much material can I carry?',
    answer:
      'In Fortnite, players can carry up to 999 materials of each type (Wood, Stone, Metal), for a maximum total of 2,997 materials. This limit applies to each material type separately. Plan your builds to stay within material limits, and harvest additional materials as needed during gameplay.',
  },
  {
    question: 'Should I use the same material for all structures?',
    answer:
      'Not necessarily. Mix materials based on needs: Use wood for quick temporary builds and mobility structures. Use stone for balanced defensive structures that need moderate durability. Use metal for critical defensive positions that need maximum durability. Mixing materials optimizes both cost and effectiveness.',
  },
  {
    question: 'How do I minimize material costs?',
    answer:
      'To minimize costs: use wood for non-critical structures (10 materials vs 20-30), build only what you need (avoid over-building), reuse existing structures when possible, harvest materials efficiently, and prioritize material type based on structure importance. Wood is 3x cheaper than metal, so use it for temporary or non-critical builds.',
  },
  {
    question: 'What is the most cost-effective building strategy?',
    answer:
      'The most cost-effective strategy: use wood for quick builds and mobility (ramps, temporary cover), use stone for balanced defensive structures (walls, floors in combat zones), use metal sparingly for critical defensive positions (final circle fortifications, high-value positions). This balances cost, build speed, and durability effectively.',
  },
];

const relatedCalculators = [
  {
    name: 'Fortnite DPS Calculator',
    slug: 'fortnite-dps-calculator',
    description: 'Calculate damage per second (DPS) for Fortnite weapons based on damage, fire rate, and weapon stats.',
  },
  {
    name: 'Fortnite Storm Surge Timer',
    slug: 'fortnite-storm-surge-timer',
    description: 'Calculate storm surge timing, damage intervals, and survival requirements in Fortnite competitive matches.',
  },
  {
    name: 'Fortnite XP Per Match Optimizer',
    slug: 'fortnite-xp-per-match-optimizer',
    description: 'Optimize XP gains per match by calculating XP from eliminations, placement, and match performance.',
  },
  {
    name: 'Fortnite Shield Potency Calculator',
    slug: 'fortnite-shield-potency-calculator',
    description: 'Calculate shield effectiveness, damage absorption, and total effective health based on shield type and amount.',
  },
  {
    name: 'Fortnite Victory Royale Probability Estimator',
    slug: 'fortnite-victory-royale-probability-estimator',
    description: 'Estimate your probability of winning a Victory Royale based on current placement, player count, and skill level.',
  },
];

const baseUrl = 'https://mycalculating.com/fortnite-build-material-cost-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
        { '@type': 'ListItem', position: 3, name: 'Fortnite Build Material Cost Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Fortnite Build Material Cost Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate the total material cost for building structures in Fortnite based on structure type, size, and material requirements.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'Article',
      headline: 'The Complete Guide to Fortnite Building Material Costs: Understanding Resource Management',
      description: 'A comprehensive guide to calculating Fortnite building material costs, including resource collection methods, structure cost analysis, and strategies for efficient material management.',
      author: {
        '@type': 'Organization',
        name: 'MegaCalc Hub Gaming Team',
      },
      datePublished: '2025-01-24',
    },
    {
      '@type': 'HowTo',
      name: 'How to use the Fortnite Build Material Cost Calculator',
      step: steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: step,
      })),
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    }
  ],
};

export default function FortniteBuildMaterialCostCalculator() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card className="border-l-4 border-l-blue-500 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Gamepad2 className="h-6 w-6 text-blue-500" />
            Fortnite Build Material Cost Calculator
          </CardTitle>
          <CardDescription>
            Calculate the total material cost for building structures in Fortnite based on structure type, size, and material requirements.
          </CardDescription>
        </CardHeader>
      </Card>

      <FortniteBuildMaterialCostCalculatorInteractive />

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="name" content="The Complete Guide to Fortnite Building Material Costs: Understanding Resource Management" />
        <meta itemProp="description" content="A comprehensive guide to Fortnite building material costs, resource collection, material types, and cost optimization strategies." />
        <meta itemProp="keywords" content="Fortnite building, material costs, wood stone metal, resource management, building calculator, Fortnite construction" />
        <meta itemProp="author" content="MegaCalc Hub Gaming Team" />
        <meta itemProp="datePublished" content="2025-01-24" />
        <meta itemProp="url" content={baseUrl} />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Fortnite Building Material Costs: Understanding Resource Management</h1>
        <p className="text-lg italic text-muted-foreground">A comprehensive guide to Fortnite building material costs, resource collection, material types, and cost optimization strategies.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#overview" className="hover:underline">Overview: Fortnite Building Materials</a></li>
          <li><a href="#materials" className="hover:underline">Material Types and Costs</a></li>
          <li><a href="#collection" className="hover:underline">Material Collection Methods</a></li>
          <li><a href="#structures" className="hover:underline">Structure Types and Costs</a></li>
          <li><a href="#optimization" className="hover:underline">Cost Optimization Strategies</a></li>
          <li><a href="#management" className="hover:underline">Material Management and Planning</a></li>
          <li><a href="#strategies" className="hover:underline">Building Strategies by Material</a></li>
        </ul>
        <hr />

        <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Fortnite Building Materials</h2>
        <p>Fortnite's building system requires three types of materials: Wood, Stone, and Metal. Each material has different costs, durability, and build speeds, making material choice crucial for effective building. Understanding material costs helps players plan builds, manage resources, and optimize construction strategies.</p>

        <p>Material costs are consistent across all structure types: Wood costs 10 materials per piece, Stone costs 20 materials per piece, and Metal costs 30 materials per piece. These costs apply to walls, floors, stairs, and roofs equally. The only difference between materials is cost, durability, and build speed.</p>

        <p>Players can carry up to 999 materials of each type, for a maximum total of 2,997 materials. This limit requires strategic material management, especially for large builds. Understanding material costs helps players plan builds within material limits and optimize resource usage.</p>

        <p>Material choice affects both cost and effectiveness. Wood is cheapest (10 materials) but weakest and fastest to build. Stone is balanced (20 materials) with moderate durability and build speed. Metal is most expensive (30 materials) but strongest and slowest to build. Players must balance cost with durability needs.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Economics of Building</h3>
        <p>Building in Fortnite requires constant material management. Efficient players balance material costs with durability needs, using cheaper materials for temporary structures and expensive materials for critical defensive positions. Understanding costs helps players make informed building decisions and optimize resource usage.</p>

        <hr />

        <h2 id="materials" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Material Types and Costs</h2>

        <p>Fortnite features three material types, each with distinct characteristics and costs. Understanding these differences helps players choose appropriate materials for different situations.</p>

        <p>Wood is the cheapest material at 10 materials per piece. It builds fastest, making it ideal for quick defensive structures and mobility builds (ramps, temporary cover). However, wood has the lowest durability, making it vulnerable to enemy fire. Use wood for temporary structures, quick builds, and situations where speed matters more than durability.</p>

        <p>Stone costs 20 materials per piece, double the cost of wood. It has moderate durability and build speed, making it a balanced choice for most defensive structures. Stone provides good cost-to-durability ratio and is suitable for medium-term defensive positions. Use stone for balanced defense when you need moderate durability without the high cost of metal.</p>

        <p>Metal costs 30 materials per piece, triple the cost of wood and 1.5x the cost of stone. It has the highest durability but builds slowest, making it ideal for strong defensive fortifications. Metal is best reserved for critical defensive positions, final circle builds, and situations where maximum durability is needed. Use metal sparingly due to high cost and slow build speed.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Cost Comparison</h3>
        <p>Cost comparison: Wood (10) is 3x cheaper than Metal (30) and 2x cheaper than Stone (20). For the same material cost, you can build 3 wood pieces, 1.5 stone pieces, or 1 metal piece. This cost difference significantly impacts build planning and material management strategies.</p>

        <hr />

        <h2 id="collection" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Material Collection Methods</h2>

        <p>Materials are collected by harvesting objects with your pickaxe. Different objects provide different material types and amounts. Understanding collection methods helps players gather materials efficiently and plan harvesting routes.</p>

        <p>Wood is collected from trees, wooden structures, wooden furniture, and wooden objects throughout the map. Trees provide the most wood per object, making them ideal for wood collection. Wooden structures in buildings also provide wood but typically less per object. Focus on trees for efficient wood harvesting.</p>

        <p>Stone is collected from rocks, stone structures, stone walls, and stone objects. Large rocks provide the most stone per object. Stone structures in buildings also provide stone. Rocks are more scattered than trees, requiring more movement for efficient stone collection.</p>

        <p>Metal is collected from vehicles, metal structures, metal objects, and metal fixtures. Vehicles provide significant metal per object, making them valuable for metal collection. Metal structures in buildings also provide metal but typically less per object. Vehicles are the most efficient metal source.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Harvesting Efficiency</h3>
        <p>Harvesting efficiency tips: target high-yield objects (large trees for wood, large rocks for stone, vehicles for metal), use the pickaxe's weak point indicator for maximum materials per hit, harvest during safe moments (not during combat), and plan harvesting routes to minimize time spent collecting materials.</p>

        <hr />

        <h2 id="structures" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Structure Types and Costs</h2>

        <p>Fortnite features four main structure types: Walls, Floors, Stairs, and Roofs. All structure types have the same material costs regardless of material type. Understanding structure costs helps players plan builds and calculate total material requirements.</p>

        <p>Walls are vertical structures used for defense and cover. Each wall costs 10/20/30 materials depending on material type (wood/stone/metal). Walls are essential for defensive builds and provide cover from enemy fire. Plan wall counts based on defensive needs and available materials.</p>

        <p>Floors are horizontal structures used for platforms and foundations. Each floor costs 10/20/30 materials depending on material type. Floors are essential for multi-level builds and provide stable platforms. Plan floor counts based on build height and platform needs.</p>

        <p>Stairs (ramps) are sloped structures used for mobility and elevation. Each stair costs 10/20/30 materials depending on material type. Stairs are essential for building up and gaining high ground advantage. Plan stair counts based on mobility needs and build height.</p>

        <p>Roofs are angled structures used for cover and building completion. Each roof costs 10/20/30 materials depending on material type. Roofs provide additional cover and complete builds. Plan roof counts based on build design and cover needs.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Structure Cost Planning</h3>
        <p>Structure cost planning: calculate total structures needed for your build design, multiply by material costs based on chosen materials, sum costs across all structure types, and ensure total cost stays within material limits (999 per type). Use calculators to plan builds before construction.</p>

        <hr />

        <h2 id="optimization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Cost Optimization Strategies</h2>

        <p>Cost optimization strategies help players build effectively while minimizing material usage. Multiple approaches can reduce costs without significantly compromising build effectiveness.</p>

        <p>Material mixing optimizes costs by using appropriate materials for different structures. Use wood for temporary structures, quick builds, and mobility structures (ramps). Use stone for balanced defensive structures that need moderate durability. Use metal only for critical defensive positions that need maximum durability. This approach can reduce costs by 30-50% compared to using expensive materials for everything.</p>

        <p>Structure minimization reduces costs by building only what's necessary. Avoid over-building unnecessary structures. Build defensively but efficiently. Reuse existing structures when possible. Minimize structure counts to reduce total material costs.</p>

        <p>Material prioritization focuses expensive materials on critical structures. Reserve metal for final circle fortifications and high-value defensive positions. Use stone for standard defensive structures. Use wood for everything else. This ensures maximum durability where it matters most while minimizing overall costs.</p>

        <p>Harvesting efficiency reduces time spent collecting materials. Target high-yield objects for maximum materials per harvest. Plan harvesting routes to minimize travel time. Harvest during safe moments, not during active combat. Efficient harvesting ensures adequate materials without excessive time investment.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>FAQs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <h4 className="font-semibold text-sm">{faq.question}</h4>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related Calculators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {relatedCalculators.map((calc) => (
              <div key={calc.slug} className="group">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                  <Link href={`/gaming/${calc.slug}`} className="text-foreground hover:text-blue-500 transition-colors">
                    {calc.name}
                  </Link>
                </h4>
                <p className="text-xs text-muted-foreground ml-5">{calc.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            Summary for AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            A Fortnite Build Material Cost Calculator that estimates total material requirements.
            Inputs: Counts for Wood/Stone/Metal Walls, Floors, Stairs, and Roofs.
            Outputs: Total material cost, breakdown by material type, breakdown by structure type, and cost efficiency recommendations.
          </p>
          <p>
            It helps players plan resource management and optimize build strategies by analyzing material usage and costs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
