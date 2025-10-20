"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Heart, Eye, Sparkles, Flame, Coffee, Music, Camera, Gamepad2, Zap, Moon } from "lucide-react";

interface ZodiacResult {
  percentage: number;
  title: string;
  description: string;
  emoji: string;
  color: string;
  advice: string;
  funFact: string;
  compatibilityType: string;
  zodiacAnalysis: string;
  elementMatch: string;
}

const zodiacSigns = [
  { name: "Aries", element: "Fire", dates: "Mar 21 - Apr 19", emoji: "♈" },
  { name: "Taurus", element: "Earth", dates: "Apr 20 - May 20", emoji: "♉" },
  { name: "Gemini", element: "Air", dates: "May 21 - Jun 20", emoji: "♊" },
  { name: "Cancer", element: "Water", dates: "Jun 21 - Jul 22", emoji: "♋" },
  { name: "Leo", element: "Fire", dates: "Jul 23 - Aug 22", emoji: "♌" },
  { name: "Virgo", element: "Earth", dates: "Aug 23 - Sep 22", emoji: "♍" },
  { name: "Libra", element: "Air", dates: "Sep 23 - Oct 22", emoji: "♎" },
  { name: "Scorpio", element: "Water", dates: "Oct 23 - Nov 21", emoji: "♏" },
  { name: "Sagittarius", element: "Fire", dates: "Nov 22 - Dec 21", emoji: "♐" },
  { name: "Capricorn", element: "Earth", dates: "Dec 22 - Jan 19", emoji: "♑" },
  { name: "Aquarius", element: "Air", dates: "Jan 20 - Feb 18", emoji: "♒" },
  { name: "Pisces", element: "Water", dates: "Feb 19 - Mar 20", emoji: "♓" }
];

const zodiacResults: ZodiacResult[] = [
  {
    percentage: 95,
    title: "Cosmic Soulmates! 🌟",
    description: "Your zodiac signs are perfectly aligned! This is astrological compatibility at its finest.",
    emoji: "🌟",
    color: "text-purple-500",
    advice: "This zodiac combination is incredibly rare - the stars have truly aligned for you!",
    funFact: "95% zodiac compatibility occurs in only 0.1% of sign combinations!",
    compatibilityType: "COSMIC SOULMATES",
    zodiacAnalysis: "Your signs create a perfect cosmic harmony that's truly magical.",
    elementMatch: "Perfect Element Harmony"
  },
  {
    percentage: 85,
    title: "Perfect Zodiac Match! ✨",
    description: "Your zodiac signs complement each other beautifully! There's something special about this combination.",
    emoji: "✨",
    color: "text-pink-500",
    advice: "This zodiac pairing has incredible potential - the universe is clearly on your side!",
    funFact: "85% zodiac compatibility often leads to the most harmonious relationships!",
    compatibilityType: "PERFECT ZODIAC MATCH",
    zodiacAnalysis: "Your signs share remarkable astrological connections and mutual understanding.",
    elementMatch: "Excellent Element Compatibility"
  },
  {
    percentage: 75,
    title: "Great Zodiac Harmony! 🎵",
    description: "Your zodiac signs work really well together! There's a natural rhythm between your astrological energies.",
    emoji: "🎵",
    color: "text-blue-500",
    advice: "This zodiac combination has great potential - nurture this special connection!",
    funFact: "75% zodiac compatibility is the sweet spot for lasting relationships!",
    compatibilityType: "GREAT ZODIAC HARMONY",
    zodiacAnalysis: "Your signs create a beautiful energetic resonance that's very promising.",
    elementMatch: "Good Element Compatibility"
  },
  {
    percentage: 65,
    title: "Nice Zodiac Balance! ⚖️",
    description: "Your zodiac signs create a nice balance together! There's potential for a good connection.",
    emoji: "⚖️",
    color: "text-green-500",
    advice: "Focus on the positive aspects of your zodiac combination - it has merit!",
    funFact: "65% zodiac compatibility often leads to stable and reliable relationships!",
    compatibilityType: "NICE ZODIAC BALANCE",
    zodiacAnalysis: "Your signs have complementary characteristics that work well together.",
    elementMatch: "Moderate Element Compatibility"
  },
  {
    percentage: 55,
    title: "Interesting Zodiac Mix! 🎨",
    description: "Your zodiac signs create an interesting mix! There's something unique about this combination.",
    emoji: "🎨",
    color: "text-orange-500",
    advice: "Embrace the uniqueness of your zodiac combination - it could be special!",
    funFact: "55% zodiac compatibility often leads to the most creative relationships!",
    compatibilityType: "INTERESTING ZODIAC MIX",
    zodiacAnalysis: "Your signs have contrasting elements that create an intriguing dynamic.",
    elementMatch: "Mixed Element Compatibility"
  },
  {
    percentage: 45,
    title: "Opposite Zodiac Signs! ⚡",
    description: "Your zodiac signs are quite different, but that might be exactly what you need!",
    emoji: "⚡",
    color: "text-yellow-500",
    advice: "Sometimes the best combinations come from opposites - embrace the difference!",
    funFact: "45% zodiac compatibility often leads to the most exciting relationships!",
    compatibilityType: "OPPOSITE ZODIAC SIGNS",
    zodiacAnalysis: "Your signs have very different characteristics that create interesting tension.",
    elementMatch: "Challenging Element Mix"
  },
  {
    percentage: 35,
    title: "Mystery Zodiac Combination! 🔮",
    description: "This is a mysterious zodiac combination! Your signs have an intriguing dynamic.",
    emoji: "🔮",
    color: "text-indigo-500",
    advice: "Let this zodiac combination unfold naturally - mystery can be beautiful!",
    funFact: "35% zodiac compatibility often leads to the most surprising relationships!",
    compatibilityType: "MYSTERY ZODIAC COMBINATION",
    zodiacAnalysis: "Your signs have an enigmatic quality that's hard to define but intriguing.",
    elementMatch: "Mysterious Element Connection"
  },
  {
    percentage: 25,
    title: "Unique Zodiac Pair! 🌟",
    description: "Your zodiac signs are a unique pair! There's something special about this combination.",
    emoji: "🌟",
    color: "text-gray-500",
    advice: "Celebrate the uniqueness of your zodiac combination - it's one of a kind!",
    funFact: "25% zodiac compatibility often leads to the most memorable relationships!",
    compatibilityType: "UNIQUE ZODIAC PAIR",
    zodiacAnalysis: "Your signs create a distinctive combination that stands out from the crowd.",
    elementMatch: "Unique Element Pairing"
  },
  {
    percentage: 15,
    title: "Adventure Zodiac Awaits! 🗺️",
    description: "This zodiac combination is an adventure waiting to happen! Who knows what will unfold?",
    emoji: "🗺️",
    color: "text-slate-500",
    advice: "Embrace the adventure of your zodiac combination - every journey starts somewhere!",
    funFact: "15% zodiac compatibility often leads to the most unexpected relationships!",
    compatibilityType: "ADVENTURE ZODIAC AWAITS",
    zodiacAnalysis: "Your signs suggest an exciting journey with unknown possibilities.",
    elementMatch: "Adventurous Element Mix"
  },
  {
    percentage: 5,
    title: "Zodiac Plot Twist! 🎭",
    description: "Well, this is unexpected! But hey, the best stories often have surprising beginnings.",
    emoji: "🎭",
    color: "text-slate-600",
    advice: "Sometimes the universe has a sense of humor - embrace the journey!",
    funFact: "5% zodiac compatibility means you're both unique individuals!",
    compatibilityType: "ZODIAC PLOT TWIST",
    zodiacAnalysis: "Your signs create an unexpected combination that defies conventional analysis.",
    elementMatch: "Unexpected Element Combination"
  }
];

const ZodiacMatchCalculator: React.FC = () => {
  const router = useRouter();
  const [sign1, setSign1] = useState("");
  const [sign2, setSign2] = useState("");
  const [result, setResult] = useState<ZodiacResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateZodiacCompatibility = (sign1: string, sign2: string): number => {
    if (!sign1 || !sign2) return 0;
    
    let score = 0;
    
    // Base zodiac compatibility score
    score += 20;
    
    // Same sign bonus (incredibly rare!)
    if (sign1 === sign2) {
      score += 35;
    }
    
    // Enhanced element compatibility
    const sign1Data = zodiacSigns.find(s => s.name === sign1);
    const sign2Data = zodiacSigns.find(s => s.name === sign2);
    
    if (sign1Data && sign2Data) {
      const element1 = sign1Data.element;
      const element2 = sign2Data.element;
      
      // Same element
      if (element1 === element2) {
        score += 22;
      }
      // Compatible elements
      else if (
        (element1 === "Fire" && element2 === "Air") ||
        (element1 === "Air" && element2 === "Fire") ||
        (element1 === "Water" && element2 === "Earth") ||
        (element1 === "Earth" && element2 === "Water")
      ) {
        score += 18;
      }
      // Challenging elements (but can work with effort)
      else if (
        (element1 === "Fire" && element2 === "Water") ||
        (element1 === "Water" && element2 === "Fire") ||
        (element1 === "Air" && element2 === "Earth") ||
        (element1 === "Earth" && element2 === "Air")
      ) {
        score += 8;
      }
    }
    
    // Enhanced specific sign compatibility matrix
    const compatibilityMatrix = {
      'Aries': { 'Leo': 28, 'Sagittarius': 25, 'Gemini': 18, 'Aquarius': 16, 'Libra': 12, 'Cancer': 8, 'Capricorn': 6, 'Taurus': 4, 'Virgo': 3, 'Scorpio': 2, 'Pisces': 5 },
      'Taurus': { 'Virgo': 28, 'Capricorn': 25, 'Cancer': 18, 'Pisces': 16, 'Scorpio': 12, 'Leo': 8, 'Aquarius': 6, 'Gemini': 4, 'Libra': 3, 'Sagittarius': 2, 'Aries': 4 },
      'Gemini': { 'Libra': 28, 'Aquarius': 25, 'Aries': 18, 'Leo': 16, 'Sagittarius': 12, 'Virgo': 8, 'Pisces': 6, 'Cancer': 4, 'Scorpio': 3, 'Capricorn': 2, 'Taurus': 4 },
      'Cancer': { 'Scorpio': 28, 'Pisces': 25, 'Taurus': 18, 'Virgo': 16, 'Capricorn': 12, 'Gemini': 8, 'Sagittarius': 6, 'Leo': 4, 'Aquarius': 3, 'Aries': 2, 'Libra': 4 },
      'Leo': { 'Aries': 28, 'Sagittarius': 25, 'Gemini': 18, 'Libra': 16, 'Aquarius': 12, 'Cancer': 8, 'Capricorn': 6, 'Taurus': 4, 'Scorpio': 3, 'Pisces': 2, 'Virgo': 4 },
      'Virgo': { 'Taurus': 28, 'Capricorn': 25, 'Cancer': 18, 'Scorpio': 16, 'Pisces': 12, 'Leo': 8, 'Aquarius': 6, 'Gemini': 4, 'Sagittarius': 3, 'Aries': 2, 'Libra': 4 },
      'Libra': { 'Gemini': 28, 'Aquarius': 25, 'Leo': 18, 'Sagittarius': 16, 'Aries': 12, 'Virgo': 8, 'Pisces': 6, 'Cancer': 4, 'Capricorn': 3, 'Taurus': 2, 'Scorpio': 4 },
      'Scorpio': { 'Cancer': 28, 'Pisces': 25, 'Virgo': 18, 'Capricorn': 16, 'Taurus': 12, 'Libra': 8, 'Sagittarius': 6, 'Gemini': 4, 'Aquarius': 3, 'Leo': 2, 'Aries': 4 },
      'Sagittarius': { 'Aries': 28, 'Leo': 25, 'Libra': 18, 'Aquarius': 16, 'Gemini': 12, 'Scorpio': 8, 'Pisces': 6, 'Cancer': 4, 'Capricorn': 3, 'Virgo': 2, 'Taurus': 4 },
      'Capricorn': { 'Taurus': 28, 'Virgo': 25, 'Scorpio': 18, 'Pisces': 16, 'Cancer': 12, 'Sagittarius': 8, 'Aquarius': 6, 'Leo': 4, 'Aries': 3, 'Gemini': 2, 'Libra': 4 },
      'Aquarius': { 'Gemini': 28, 'Libra': 25, 'Sagittarius': 18, 'Aries': 16, 'Leo': 12, 'Capricorn': 8, 'Pisces': 6, 'Taurus': 4, 'Scorpio': 3, 'Cancer': 2, 'Virgo': 4 },
      'Pisces': { 'Cancer': 28, 'Scorpio': 25, 'Capricorn': 18, 'Taurus': 16, 'Virgo': 12, 'Aquarius': 8, 'Sagittarius': 6, 'Gemini': 4, 'Aries': 3, 'Leo': 2, 'Libra': 4 }
    };
    
    const compatibility = compatibilityMatrix[sign1 as keyof typeof compatibilityMatrix]?.[sign2 as keyof typeof compatibilityMatrix] || 2;
    score += compatibility;
    
    // Modality compatibility
    const modalities = {
      'Aries': 'Cardinal', 'Cancer': 'Cardinal', 'Libra': 'Cardinal', 'Capricorn': 'Cardinal',
      'Taurus': 'Fixed', 'Leo': 'Fixed', 'Scorpio': 'Fixed', 'Aquarius': 'Fixed',
      'Gemini': 'Mutable', 'Virgo': 'Mutable', 'Sagittarius': 'Mutable', 'Pisces': 'Mutable'
    };
    
    const modality1 = modalities[sign1 as keyof typeof modalities];
    const modality2 = modalities[sign2 as keyof typeof modalities];
    
    if (modality1 === modality2) {
      score += 15;
    } else {
      // Different modalities can complement each other
      score += 8;
    }
    
    // Polarity compatibility (yin/yang)
    const polarities = {
      'Aries': 'Yang', 'Gemini': 'Yang', 'Leo': 'Yang', 'Libra': 'Yang', 'Sagittarius': 'Yang', 'Aquarius': 'Yang',
      'Taurus': 'Yin', 'Cancer': 'Yin', 'Virgo': 'Yin', 'Scorpio': 'Yin', 'Capricorn': 'Yin', 'Pisces': 'Yin'
    };
    
    const polarity1 = polarities[sign1 as keyof typeof polarities];
    const polarity2 = polarities[sign2 as keyof typeof polarities];
    
    if (polarity1 !== polarity2) {
      score += 8; // Opposite polarities can create balance
    } else {
      score += 4; // Same polarity can create harmony
    }
    
    // Ruling planet compatibility
    const planets = {
      'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
      'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Pluto',
      'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Uranus', 'Pisces': 'Neptune'
    };
    
    const planet1 = planets[sign1 as keyof typeof planets];
    const planet2 = planets[sign2 as keyof typeof planets];
    
    if (planet1 === planet2) {
      score += 10;
    } else {
      // Some planets work well together
      const compatiblePlanets = {
        'Sun': ['Moon', 'Venus', 'Jupiter'],
        'Moon': ['Sun', 'Venus', 'Neptune'],
        'Mercury': ['Venus', 'Jupiter'],
        'Venus': ['Sun', 'Moon', 'Mercury', 'Jupiter'],
        'Mars': ['Jupiter', 'Pluto'],
        'Jupiter': ['Sun', 'Venus', 'Mercury', 'Mars'],
        'Saturn': ['Pluto', 'Uranus'],
        'Uranus': ['Saturn', 'Neptune'],
        'Neptune': ['Moon', 'Uranus'],
        'Pluto': ['Mars', 'Saturn']
      };
      
      if (compatiblePlanets[planet1 as keyof typeof compatiblePlanets]?.includes(planet2)) {
        score += 6;
      }
    }
    
    // Enhanced random factor for more variety
    const randomFactor = Math.random() * 25;
    score += randomFactor;
    
    return Math.max(5, Math.min(95, Math.round(score)));
  };

  const getResultByPercentage = (percentage: number): ZodiacResult => {
    if (percentage >= 90) return zodiacResults[0];
    if (percentage >= 80) return zodiacResults[1];
    if (percentage >= 70) return zodiacResults[2];
    if (percentage >= 60) return zodiacResults[3];
    if (percentage >= 50) return zodiacResults[4];
    if (percentage >= 40) return zodiacResults[5];
    if (percentage >= 30) return zodiacResults[6];
    if (percentage >= 20) return zodiacResults[7];
    if (percentage >= 10) return zodiacResults[8];
    return zodiacResults[9];
  };

  const getElementMatch = (sign1: string, sign2: string): string => {
    const sign1Data = zodiacSigns.find(s => s.name === sign1);
    const sign2Data = zodiacSigns.find(s => s.name === sign2);
    
    if (!sign1Data || !sign2Data) return "Unknown";
    
    const element1 = sign1Data.element;
    const element2 = sign2Data.element;
    
    if (element1 === element2) return "Same Element";
    
    if (
      (element1 === "Fire" && element2 === "Air") ||
      (element1 === "Air" && element2 === "Fire") ||
      (element1 === "Water" && element2 === "Earth") ||
      (element1 === "Earth" && element2 === "Water")
    ) {
      return "Compatible Elements";
    }
    
    return "Different Elements";
  };

  const handleCalculate = () => {
    if (!sign1 || !sign2) return;
    
    setIsCalculating(true);
    
    setTimeout(() => {
      const percentage = calculateZodiacCompatibility(sign1, sign2);
      const zodiacResult = getResultByPercentage(percentage);
      const elementMatch = getElementMatch(sign1, sign2);
      setResult({ ...zodiacResult, elementMatch });
      setIsCalculating(false);
    }, 2000);
  };

  const resetCalculator = () => {
    setSign1("");
    setSign2("");
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Moon className="h-8 w-8 text-purple-500 animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Zodiac Match Calculator
          </h1>
          <Star className="h-8 w-8 text-purple-500 animate-pulse" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover the astrological compatibility between two zodiac signs! Our calculator analyzes 
          cosmic energies, elements, and planetary influences to reveal your zodiac compatibility. ⭐
        </p>
      </div>

      {/* Calculator Card */}
      <Card className="border-2 border-purple-200 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-purple-600">Select Two Zodiac Signs</CardTitle>
          <CardDescription>
            Choose two zodiac signs and let our cosmic algorithm calculate your astrological compatibility! ✨
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="sign1" className="text-lg font-semibold">
                First Zodiac Sign
              </Label>
              <Select value={sign1} onValueChange={setSign1}>
                <SelectTrigger className="text-lg h-12 border-2 border-purple-200 focus:border-purple-400">
                  <SelectValue placeholder="Select first zodiac sign" />
                </SelectTrigger>
                <SelectContent>
                  {zodiacSigns.map((sign) => (
                    <SelectItem key={sign.name} value={sign.name}>
                      <div className="flex items-center space-x-2">
                        <span>{sign.emoji}</span>
                        <span>{sign.name}</span>
                        <span className="text-sm text-muted-foreground">({sign.dates})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sign2" className="text-lg font-semibold">
                Second Zodiac Sign
              </Label>
              <Select value={sign2} onValueChange={setSign2}>
                <SelectTrigger className="text-lg h-12 border-2 border-purple-200 focus:border-purple-400">
                  <SelectValue placeholder="Select second zodiac sign" />
                </SelectTrigger>
                <SelectContent>
                  {zodiacSigns.map((sign) => (
                    <SelectItem key={sign.name} value={sign.name}>
                      <div className="flex items-center space-x-2">
                        <span>{sign.emoji}</span>
                        <span>{sign.name}</span>
                        <span className="text-sm text-muted-foreground">({sign.dates})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={handleCalculate}
              disabled={!sign1 || !sign2 || isCalculating}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {isCalculating ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Analyzing Zodiac Signs...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Calculate Compatibility</span>
                </div>
              )}
            </Button>
            <Button
              onClick={resetCalculator}
              variant="outline"
              className="px-6 py-3 text-lg border-2 border-purple-200 hover:border-purple-400 rounded-full"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Result Card */}
      {result && (
        <Card className="border-2 border-purple-300 shadow-xl animate-in slide-in-from-bottom-4 duration-500">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* Percentage Display */}
              <div className="relative">
                <div className="text-8xl font-bold text-purple-500 mb-4 animate-bounce">
                  {result.percentage}%
                </div>
                <div className="text-6xl mb-4">{result.emoji}</div>
              </div>

              {/* Result Details */}
              <div className="space-y-4">
                <h2 className={`text-3xl font-bold ${result.color}`}>
                  {result.title}
                </h2>
                <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                  {result.compatibilityType}
                </Badge>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  {result.description}
                </p>
                
                {/* Progress Bar */}
                <div className="w-full max-w-md mx-auto">
                  <Progress 
                    value={result.percentage} 
                    className="h-4 bg-purple-100"
                  />
                </div>

                {/* Element Match */}
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <h3 className="text-lg font-semibold text-indigo-700 mb-1">
                    🌟 Element Compatibility
                  </h3>
                  <p className="text-indigo-600">
                    {result.elementMatch}
                  </p>
                </div>

                {/* Zodiac Analysis */}
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="text-xl font-semibold text-purple-700 mb-2">
                    🔍 Zodiac Analysis
                  </h3>
                  <p className="text-lg text-purple-600">
                    {result.zodiacAnalysis}
                  </p>
                </div>

                {/* Advice */}
                <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
                  <h3 className="text-xl font-semibold text-pink-700 mb-2">
                    💡 Astrological Advice
                  </h3>
                  <p className="text-lg text-pink-600">
                    {result.advice}
                  </p>
                </div>

                {/* Fun Fact */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-200">
                  <h3 className="text-xl font-semibold text-indigo-700 mb-2">
                    🎉 Fun Fact
                  </h3>
                  <p className="text-lg text-indigo-600">
                    {result.funFact}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Calculators */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-600 text-center">
            🔗 Related Fun Calculators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 border-2 border-pink-200 hover:border-pink-400 hover:bg-pink-50"
              onClick={() => router.push('/category/fun-games/love-percentage-calculator')}
            >
              <Heart className="h-6 w-6 text-pink-500" />
              <span className="text-sm font-medium">Love Percentage</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50"
              onClick={() => router.push('/category/fun-games/crush-compatibility-calculator')}
            >
              <Eye className="h-6 w-6 text-purple-500" />
              <span className="text-sm font-medium">Crush Compatibility</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
              onClick={() => router.push('/category/fun-games/friendship-compatibility-calculator')}
            >
              <Coffee className="h-6 w-6 text-blue-500" />
              <span className="text-sm font-medium">Friendship Test</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 border-2 border-green-200 hover:border-green-400 hover:bg-green-50"
              onClick={() => router.push('/category/fun-games/name-compatibility-calculator')}
            >
              <Sparkles className="h-6 w-6 text-green-500" />
              <span className="text-sm font-medium">Name Compatibility</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SEO Content */}
      <div className="prose max-w-none space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            ⭐ Zodiac Match Calculator - Discover Your Astrological Compatibility
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            Our Zodiac Match Calculator is the ultimate tool for analyzing astrological compatibility between two zodiac signs. 
            Whether you're curious about romantic compatibility, friendship potential, or just having fun with astrology, 
            this calculator provides detailed insights based on cosmic energies, elements, and planetary influences.
          </p>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            How Our Zodiac Match Calculator Works
          </h3>
          <p className="text-gray-700 mb-4">
            Our advanced algorithm analyzes multiple factors including element compatibility, sign relationships, 
            astrological patterns, and cosmic energies to calculate your zodiac compatibility percentage. 
            The results reveal the astrological connection between two zodiac signs.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Perfect For:
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Testing zodiac compatibility for relationships</li>
            <li>Analyzing astrological connections between friends</li>
            <li>Fun activities and party games</li>
            <li>Understanding astrological patterns and elements</li>
            <li>Entertainment and cosmic exploration</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Zodiac Match Features
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Advanced astrological analysis</li>
            <li>Element compatibility assessment</li>
            <li>Sign relationship analysis</li>
            <li>Cosmic energy evaluation</li>
            <li>Planetary influence consideration</li>
            <li>Humorous and entertaining results</li>
            <li>Detailed zodiac analysis explanations</li>
            <li>Beautiful animations and visual effects</li>
            <li>Mobile-friendly responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ZodiacMatchCalculator;
