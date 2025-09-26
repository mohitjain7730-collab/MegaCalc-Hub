

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';

import { Button } from '@/components/ui/button';
import { categories } from '@/lib/categories';
import { calculators } from '@/lib/calculators';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryIcon } from '@/components/category-icon';

const calculatorComponents: { [key: string]: React.ComponentType } = {
    'sip-calculator': dynamic(() => import('@/components/calculators/finance/sip-calculator')),
    'loan-emi-calculator': dynamic(() => import('@/components/calculators/finance/loan-emi-calculator')),
    'retirement-savings-calculator': dynamic(() => import('@/components/calculators/finance/retirement-savings-calculator')),
    'compound-interest-calculator': dynamic(() => import('@/components/calculators/finance/compound-interest-calculator')),
    '401k-contribution-calculator': dynamic(() => import('@/components/calculators/finance/401k-contribution-calculator')),
    'net-worth-calculator': dynamic(() => import('@/components/calculators/finance/net-worth-calculator')),
    'credit-card-payoff-calculator': dynamic(() => import('@/components/calculators/finance/credit-card-payoff-calculator')),
    'mortgage-payment-calculator': dynamic(() => import('@/components/calculators/finance/mortgage-payment-calculator')),
    'student-loan-repayment-calculator': dynamic(() => import('@/components/calculators/finance/student-loan-repayment-calculator')),
    'inflation-calculator': dynamic(() => import('@/components/calculators/finance/inflation-calculator')),
    'roth-ira-contribution-limit-calculator': dynamic(() => import('@/components/calculators/finance/roth-ira-contribution-limit-calculator')),
    'emergency-fund-calculator': dynamic(() => import('@/components/calculators/finance/emergency-fund-calculator')),
    'water-footprint-of-food-calculator': dynamic(() => import('@/components/calculators/health-fitness/water-footprint-of-food-calculator')),
    'bmi-calculator': dynamic(() => import('@/components/calculators/health-fitness/bmi-calculator')),
    'bmr-calculator': dynamic(() => import('@/components/calculators/health-fitness/bmr-calculator')),
    'target-heart-rate-calculator': dynamic(() => import('@/components/calculators/health-fitness/target-heart-rate-calculator')),
    'paint-coverage-calculator': dynamic(() => import('@/components/calculators/home-improvement/paint-coverage-calculator')),
    'tile-flooring-calculator': dynamic(() => import('@/components/calculators/home-improvement/tile-flooring-calculator')),
    'wallpaper-roll-calculator': dynamic(() => import('@/components/calculators/home-improvement/wallpaper-roll-calculator')),
    'drywall-plasterboard-calculator': dynamic(() => import('@/components/calculators/home-improvement/drywall-plasterboard-calculator')),
    'insulation-r-value-calculator': dynamic(() => import('@/components/calculators/home-improvement/insulation-r-value-calculator')),
    'decking-materials-calculator': dynamic(() => import('@/components/calculators/home-improvement/decking-materials-calculator')),
    'roofing-shingle-calculator': dynamic(() => import('@/components/calculators/home-improvement/roofing-shingle-calculator')),
    'concrete-volume-calculator': dynamic(() => import('@/components/calculators/home-improvement/concrete-volume-calculator')),
    'lighting-layout-calculator': dynamic(() => import('@/components/calculators/home-improvement/lighting-layout-calculator')),
    'hvac-sizing-calculator': dynamic(() => import('@/components/calculators/home-improvement/hvac-sizing-calculator')),
    'staircase-rise-run-calculator': dynamic(() => import('@/components/calculators/home-improvement/staircase-rise-run-calculator')),
    'cost-estimator-renovation-calculator': dynamic(() => import('@/components/calculators/home-improvement/cost-estimator-renovation-calculator')),
    'water-usage-plumbing-flow-calculator': dynamic(() => import('@/components/calculators/home-improvement/water-usage-plumbing-flow-calculator')),
    'garden-landscape-soil-mulch-calculator': dynamic(() => import('@/components/calculators/home-improvement/garden-landscape-soil-mulch-calculator')),
    'beam-bending-calculator': dynamic(() => import('@/components/calculators/engineering/beam-bending-calculator')),
    'hydraulic-pipe-flow-calculator': dynamic(() => import('@/components/calculators/engineering/hydraulic-pipe-flow-calculator')),
    'heat-transfer-calculator': dynamic(() => import('@/components/calculators/engineering/heat-transfer-calculator')),
    'electrical-power-calculator': dynamic(() => import('@/components/calculators/engineering/electrical-power-calculator')),
    'compressive-stress-calculator': dynamic(() => import('@/components/calculators/engineering/compressive-stress-calculator')),
    'cantilever-beam-deflection-calculator': dynamic(() => import('@/components/calculators/engineering/cantilever-beam-deflection-calculator')),
    'natural-frequency-calculator': dynamic(() => import('@/components/calculators/engineering/natural-frequency-calculator')),
    'reynolds-number-calculator': dynamic(() => import('@/components/calculators/engineering/reynolds-number-calculator')),
    'thermal-expansion-calculator': dynamic(() => import('@/components/calculators/engineering/thermal-expansion-calculator')),
    'shear-stress-calculator': dynamic(() => import('@/components/calculators/engineering/shear-stress-calculator')),
    'iq-score-estimator': dynamic(() => import('@/components/calculators/cognitive-psychology/iq-score-estimator')),
    'memory-span-calculator': dynamic(() => import('@/components/calculators/cognitive-psychology/memory-span-calculator')),
    'cognitive-load-calculator': dynamic(() => import('@/components/calculators/cognitive-psychology/cognitive-load-calculator')),
    'personality-trait-calculator': dynamic(() => import('@/components/calculators/cognitive-psychology/personality-trait-calculator')),
    'stroop-effect-reaction-time-calculator': dynamic(() => import('@/components/calculators/cognitive-psychology/stroop-effect-reaction-time-calculator')),
    'mental-fatigue-index-calculator': dynamic(() => import('@/components/calculators/cognitive-psychology/mental-fatigue-index-calculator')),
    'sleep-debt-calculator': dynamic(() => import('@/components/calculators/cognitive-psychology/sleep-debt-calculator')),
    'stress-level-index-calculator': dynamic(() => import('@/components/calculators/cognitive-psychology/stress-level-index-calculator')),
    'ancestry-composition-estimator': dynamic(() => import('@/components/calculators/genetic-ancestry/ancestry-composition-estimator')),
    'genetic-trait-probability-calculator': dynamic(() => import('@/components/calculators/genetic-ancestry/genetic-trait-probability-calculator')),
    'pedigree-analysis-calculator': dynamic(() => import('@/components/calculators/genetic-ancestry/pedigree-analysis-calculator')),
    'genealogy-timeline-generator': dynamic(() => import('@/components/calculators/genetic-ancestry/genealogy-timeline-generator')),
    'carbon-footprint-reduction-calculator': dynamic(() => import('@/components/calculators/environment/carbon-footprint-reduction-calculator')),
    'water-usage-efficiency-calculator': dynamic(() => import('@/components/calculators/environment/water-usage-efficiency-calculator')),
    'recycling-impact-calculator': dynamic(() => import('@/components/calculators/environment/recycling-impact-calculator')),
    'sustainable-diet-impact-calculator': dynamic(() => import('@/components/calculators/environment/sustainable-diet-impact-calculator')),
    'paint-coverage-estimator': dynamic(() => import('@/components/calculators/diy-crafts/paint-coverage-estimator')),
    'knitting-pattern-calculator': dynamic(() => import('@/components/calculators/diy-crafts/knitting-pattern-calculator')),
    'sewing-fabric-yardage-calculator': dynamic(() => import('@/components/calculators/diy-crafts/sewing-fabric-yardage-calculator')),
    'woodworking-material-calculator': dynamic(() => import('@/components/calculators/diy-crafts/woodworking-material-calculator')),
    'artifact-dating-calculator': dynamic(() => import('@/components/calculators/historical-archaeological/artifact-dating-calculator')),
    'historical-population-density-calculator': dynamic(() => import('@/components/calculators/historical-archaeological/historical-population-density-calculator')),
    'archaeological-site-excavation-calculator': dynamic(() => import('@/components/calculators/historical-archaeological/archaeological-site-excavation-calculator')),
    'ancient-civilization-timeline-generator': dynamic(() => import('@/components/calculators/historical-archaeological/ancient-civilization-timeline-generator')),
    'backpacking-load-weight-calculator': dynamic(() => import('@/components/calculators/travel-adventure/backpacking-load-weight-calculator')),
    'hiking-elevation-gain-calculator': dynamic(() => import('@/components/calculators/travel-adventure/hiking-elevation-gain-calculator')),
    'travel-budget-estimator': dynamic(() => import('@/components/calculators/travel-adventure/travel-budget-estimator')),
    'adventure-activity-risk-calculator': dynamic(() => import('@/components/calculators/travel-adventure/adventure-activity-risk-calculator')),
    'battery-life-estimator': dynamic(() => import('@/components/calculators/technology/battery-life-estimator')),
    'power-supply-wattage-calculator': dynamic(() => import('@/components/calculators/technology/power-supply-wattage-calculator')),
    'overclocking-thermal-calculator': dynamic(() => import('@/components/calculators/technology/overclocking-thermal-calculator')),
    'network-bandwidth-calculator': dynamic(() => import('@/components/calculators/technology/network-bandwidth-calculator')),
    'ping-latency-distance-calculator': dynamic(() => import('@/components/calculators/technology/ping-latency-distance-calculator')),
    'ups-runtime-calculator': dynamic(() => import('@/components/calculators/technology/ups-runtime-calculator')),
    'internet-data-usage-estimator': dynamic(() => import('@/components/calculators/technology/internet-data-usage-estimator')),
    'disk-raid-capacity-calculator': dynamic(() => import('@/components/calculators/technology/disk-raid-capacity-calculator')),
    'api-rate-limit-planner': dynamic(() => import('@/components/calculators/technology/api-rate-limit-planner')),
    'regex-performance-checker': dynamic(() => import('@/components/calculators/technology/regex-performance-checker')),
    'image-compression-size-calculator': dynamic(() => import('@/components/calculators/technology/image-compression-size-calculator')),
    'password-entropy-calculator': dynamic(() => import('@/components/calculators/technology/password-entropy-calculator')),
    'hash-collision-probability-calculator': dynamic(() => import('@/components/calculators/technology/hash-collision-probability-calculator')),
    'cloud-cost-estimator': dynamic(() => import('@/components/calculators/technology/cloud-cost-estimator')),
    'subnet-mask-cidr-calculator': dynamic(() => import('@/components/calculators/technology/subnet-mask-cidr-calculator')),
    'download-time-calculator': dynamic(() => import('@/components/calculators/technology/download-time-calculator')),
    'latency-to-throughput-calculator': dynamic(() => import('@/components/calculators/technology/latency-to-throughput-calculator')),
    '3d-print-time-material-calculator': dynamic(() => import('@/components/calculators/technology/3d-print-time-material-calculator')),
    'solar-panel-output-calculator': dynamic(() => import('@/components/calculators/technology/solar-panel-output-calculator')),
    'dice-roll-probability': dynamic(() => import('@/components/calculators/fun-games/dice-roll-probability-calculator')),
    'board-game-scoring': dynamic(() => import('@/components/calculators/fun-games/board-game-scoring-calculator')),
    'rpg-character-stat': dynamic(() => import('@/components/calculators/fun-games/rpg-character-stat-calculator')),
    'esports-kd-ratio': dynamic(() => import('@/components/calculators/fun-games/esports-kd-ratio-calculator')),
    'video-game-xp-level-up': dynamic(() => import('@/components/calculators/fun-games/video-game-xp-level-up-calculator')),
    'movie-marathon-time': dynamic(() => import('@/components/calculators/fun-games/movie-marathon-time-calculator')),
    'book-series-reading-time': dynamic(() => import('@/components/calculators/fun-games/book-series-reading-time-calculator')),
    'song-playlist-duration': dynamic(() => import('@/components/calculators/fun-games/song-playlist-duration-calculator')),
    'pop-culture-age': dynamic(() => import('@/components/calculators/fun-games/pop-culture-age-calculator')),
    'pet-name-popularity': dynamic(() => import('@/components/calculators/fun-games/pet-name-popularity-calculator')),
    'meme-lifespan': dynamic(() => import('@/components/calculators/fun-games/meme-lifespan-calculator')),
    'emoji-compatibility': dynamic(() => import('@/components/calculators/fun-games/emoji-compatibility-calculator')),
    'random-nickname-generator': dynamic(() => import('@/components/calculators/fun-games/random-nickname-generator-calculator')),
    'friendship-anniversary': dynamic(() => import('@/components/calculators/fun-games/friendship-anniversary-calculator')),
    'bowling-score': dynamic(() => import('@/components/calculators/fun-games/bowling-score-calculator')),
    'golf-handicap': dynamic(() => import('@/components/calculators/fun-games/golf-handicap-calculator')),
    'fantasy-league-points': dynamic(() => import('@/components/calculators/fun-games/fantasy-league-points-calculator')),
    'party-budget-per-person': dynamic(() => import('@/components/calculators/fun-games/party-budget-per-person-calculator')),
    'bbq-food-drink-quantity': dynamic(() => import('@/components/calculators/fun-games/bbq-food-drink-quantity-calculator')),
    'karaoke-queue-time': dynamic(() => import('@/components/calculators/fun-games/karaoke-queue-time-calculator')),
    'recipe-ingredient-converter': dynamic(() => import('@/components/calculators/cooking-food/recipe-ingredient-converter')),
    'cooking-time-adjuster': dynamic(() => import('@/components/calculators/cooking-food/cooking-time-adjuster')),
    'recipe-nutrition-calculator': dynamic(() => import('@/components/calculators/cooking-food/recipe-nutrition-calculator')),
    'brining-solution-calculator': dynamic(() => import('@/components/calculators/cooking-food/brining-solution-calculator')),
    'meat-thawing-time-calculator': dynamic(() => import('@/components/calculators/cooking-food/meat-thawing-time-calculator')),
  };

export async function generateStaticParams() {
  return calculators.map((calc) => ({
    slug: calc.category,
    calcSlug: calc.slug,
  }));
}

export default function CalculatorPage({ params }: { params: { slug: string, calcSlug: string } }) {
  const category = categories.find((c) => c.slug === params.slug);
  const calculator = calculators.find((c) => c.slug === params.calcSlug && c.category === params.slug);

  if (!category || !calculator) {
    notFound();
  }

  const CalculatorComponent = calculatorComponents[calculator.slug];

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-8">
       <div className="w-full max-w-4xl">
        <div className="mb-8">
            <Button asChild variant="ghost" className='mb-4'>
                <Link href={`/category/${category.slug}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {category.name}
                </Link>
            </Button>
            <Card className="w-full shadow-md">
                <CardContent className="p-8 text-center">
                    <CategoryIcon name={category.Icon} className="mx-auto h-16 w-16 mb-6 text-primary" strokeWidth={1.5} />
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {calculator.name}
                    </h1>
                    <p className='text-muted-foreground mb-4'>{category.name}</p>
                    <p className="text-lg text-muted-foreground">
                        {calculator.description}
                    </p>
                </CardContent>
            </Card>
        </div>

        {CalculatorComponent ? (
          <Card className='w-full shadow-md'>
            <CardContent className='p-8'>
              <CalculatorComponent />
            </CardContent>
          </Card>
        ) : (
            <Card className="w-full max-w-lg text-center shadow-md mx-auto">
                <CardContent className="p-8">
                    <p className="text-lg text-muted-foreground">
                    This calculator is coming soon.
                    </p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}

    