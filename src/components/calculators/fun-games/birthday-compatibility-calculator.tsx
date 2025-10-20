"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Heart, Eye, Sparkles, Star, Flame, Coffee, Music, Camera, Gamepad2, Zap, Cake } from "lucide-react";

interface BirthdayResult {
  percentage: number;
  title: string;
  description: string;
  emoji: string;
  color: string;
  advice: string;
  funFact: string;
  compatibilityType: string;
  birthdayAnalysis: string;
  ageDifference: number;
}

const birthdayResults: BirthdayResult[] = [
  {
    percentage: 95,
    title: "Birthday Soulmates! 🎂",
    description: "Your birthdays are perfectly aligned! This is cosmic compatibility at its finest.",
    emoji: "🎂",
    color: "text-pink-500",
    advice: "This birthday combination is incredibly rare - cherish this special connection!",
    funFact: "95% birthday compatibility occurs in only 0.05% of birthday combinations!",
    compatibilityType: "BIRTHDAY SOULMATES",
    birthdayAnalysis: "Your birthdays create a perfect cosmic harmony that's truly magical.",
    ageDifference: 0
  },
  {
    percentage: 85,
    title: "Perfect Birthday Match! 🌟",
    description: "Your birthdays complement each other beautifully! There's something special about this combination.",
    emoji: "🌟",
    color: "text-purple-500",
    advice: "This birthday pairing has incredible potential - the stars are clearly aligned!",
    funFact: "85% birthday compatibility often leads to the most harmonious relationships!",
    compatibilityType: "PERFECT BIRTHDAY MATCH",
    birthdayAnalysis: "Your birthdays share remarkable astrological and numerological connections.",
    ageDifference: 0
  },
  {
    percentage: 75,
    title: "Great Birthday Harmony! 🎉",
    description: "Your birthdays work really well together! There's a natural rhythm between your birth dates.",
    emoji: "🎉",
    color: "text-blue-500",
    advice: "This birthday combination has great potential - nurture this special connection!",
    funFact: "75% birthday compatibility is the sweet spot for lasting relationships!",
    compatibilityType: "GREAT BIRTHDAY HARMONY",
    birthdayAnalysis: "Your birthdays create a beautiful energetic resonance that's very promising.",
    ageDifference: 0
  },
  {
    percentage: 65,
    title: "Nice Birthday Balance! ⚖️",
    description: "Your birthdays create a nice balance together! There's potential for a good connection.",
    emoji: "⚖️",
    color: "text-green-500",
    advice: "Focus on the positive aspects of your birthday combination - it has merit!",
    funFact: "65% birthday compatibility often leads to stable and reliable relationships!",
    compatibilityType: "NICE BIRTHDAY BALANCE",
    birthdayAnalysis: "Your birthdays have complementary characteristics that work well together.",
    ageDifference: 0
  },
  {
    percentage: 55,
    title: "Interesting Birthday Mix! 🎨",
    description: "Your birthdays create an interesting mix! There's something unique about this combination.",
    emoji: "🎨",
    color: "text-orange-500",
    advice: "Embrace the uniqueness of your birthday combination - it could be special!",
    funFact: "55% birthday compatibility often leads to the most creative relationships!",
    compatibilityType: "INTERESTING BIRTHDAY MIX",
    birthdayAnalysis: "Your birthdays have contrasting elements that create an intriguing dynamic.",
    ageDifference: 0
  },
  {
    percentage: 45,
    title: "Opposite Birthdays! ⚡",
    description: "Your birthdays are quite different, but that might be exactly what you need!",
    emoji: "⚡",
    color: "text-yellow-500",
    advice: "Sometimes the best combinations come from opposites - embrace the difference!",
    funFact: "45% birthday compatibility often leads to the most exciting relationships!",
    compatibilityType: "OPPOSITE BIRTHDAYS",
    birthdayAnalysis: "Your birthdays have very different characteristics that create interesting tension.",
    ageDifference: 0
  },
  {
    percentage: 35,
    title: "Mystery Birthday Combination! 🔮",
    description: "This is a mysterious birthday combination! Your birth dates have an intriguing dynamic.",
    emoji: "🔮",
    color: "text-indigo-500",
    advice: "Let this birthday combination unfold naturally - mystery can be beautiful!",
    funFact: "35% birthday compatibility often leads to the most surprising relationships!",
    compatibilityType: "MYSTERY BIRTHDAY COMBINATION",
    birthdayAnalysis: "Your birthdays have an enigmatic quality that's hard to define but intriguing.",
    ageDifference: 0
  },
  {
    percentage: 25,
    title: "Unique Birthday Pair! 🌟",
    description: "Your birthdays are a unique pair! There's something special about this combination.",
    emoji: "🌟",
    color: "text-gray-500",
    advice: "Celebrate the uniqueness of your birthday combination - it's one of a kind!",
    funFact: "25% birthday compatibility often leads to the most memorable relationships!",
    compatibilityType: "UNIQUE BIRTHDAY PAIR",
    birthdayAnalysis: "Your birthdays create a distinctive combination that stands out from the crowd.",
    ageDifference: 0
  },
  {
    percentage: 15,
    title: "Adventure Birthday Awaits! 🗺️",
    description: "This birthday combination is an adventure waiting to happen! Who knows what will unfold?",
    emoji: "🗺️",
    color: "text-slate-500",
    advice: "Embrace the adventure of your birthday combination - every journey starts somewhere!",
    funFact: "15% birthday compatibility often leads to the most unexpected relationships!",
    compatibilityType: "ADVENTURE BIRTHDAY AWAITS",
    birthdayAnalysis: "Your birthdays suggest an exciting journey with unknown possibilities.",
    ageDifference: 0
  },
  {
    percentage: 5,
    title: "Birthday Plot Twist! 🎭",
    description: "Well, this is unexpected! But hey, the best stories often have surprising beginnings.",
    emoji: "🎭",
    color: "text-slate-600",
    advice: "Sometimes the universe has a sense of humor - embrace the journey!",
    funFact: "5% birthday compatibility means you're both unique individuals!",
    compatibilityType: "BIRTHDAY PLOT TWIST",
    birthdayAnalysis: "Your birthdays create an unexpected combination that defies conventional analysis.",
    ageDifference: 0
  }
];

const BirthdayCompatibilityCalculator: React.FC = () => {
  const router = useRouter();
  const [birthday1, setBirthday1] = useState("");
  const [birthday2, setBirthday2] = useState("");
  const [result, setResult] = useState<BirthdayResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateBirthdayCompatibility = (date1: string, date2: string): number => {
    if (!date1 || !date2) return 0;
    
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
    
    let score = 0;
    
    // Base birthday compatibility score
    score += 20;
    
    // Same birthday bonus (incredibly rare!)
    if (d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()) {
      score += 40;
    }
    
    // Same month bonus
    if (d1.getMonth() === d2.getMonth()) {
      score += 18;
    }
    
    // Same day of month bonus
    if (d1.getDate() === d2.getDate()) {
      score += 12;
    }
    
    // Same day of week bonus
    if (d1.getDay() === d2.getDay()) {
      score += 8;
    }
    
    // Enhanced age difference analysis
    const ageDiff = Math.abs(d1.getFullYear() - d2.getFullYear());
    if (ageDiff === 0) score += 15;
    else if (ageDiff <= 1) score += 12;
    else if (ageDiff <= 2) score += 10;
    else if (ageDiff <= 3) score += 8;
    else if (ageDiff <= 5) score += 6;
    else if (ageDiff <= 8) score += 4;
    else if (ageDiff <= 12) score += 3;
    else if (ageDiff <= 20) score += 2;
    else if (ageDiff <= 30) score += 1;
    
    // Season compatibility
    const getSeason = (date: Date) => {
      const month = date.getMonth();
      if (month >= 2 && month <= 4) return 'spring';
      if (month >= 5 && month <= 7) return 'summer';
      if (month >= 8 && month <= 10) return 'autumn';
      return 'winter';
    };
    
    const season1 = getSeason(d1);
    const season2 = getSeason(d2);
    if (season1 === season2) score += 10;
    
    // Enhanced zodiac sign compatibility
    const getZodiacSign = (date: Date) => {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
      if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
      if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
      if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
      if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
      if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
      if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
      if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
      if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
      if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
      if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
      return 'Pisces';
    };
    
    const zodiac1 = getZodiacSign(d1);
    const zodiac2 = getZodiacSign(d2);
    
    // Enhanced zodiac compatibility matrix
    const zodiacCompatibility = {
      'Aries': { 'Leo': 18, 'Sagittarius': 16, 'Gemini': 12, 'Aquarius': 10, 'Libra': 8, 'Cancer': 6, 'Capricorn': 4, 'Taurus': 3, 'Virgo': 2, 'Scorpio': 1, 'Pisces': 2 },
      'Taurus': { 'Virgo': 18, 'Capricorn': 16, 'Cancer': 12, 'Pisces': 10, 'Scorpio': 8, 'Leo': 6, 'Aquarius': 4, 'Gemini': 3, 'Libra': 2, 'Sagittarius': 1, 'Aries': 3 },
      'Gemini': { 'Libra': 18, 'Aquarius': 16, 'Aries': 12, 'Leo': 10, 'Sagittarius': 8, 'Virgo': 6, 'Pisces': 4, 'Cancer': 3, 'Scorpio': 2, 'Capricorn': 1, 'Taurus': 3 },
      'Cancer': { 'Scorpio': 18, 'Pisces': 16, 'Taurus': 12, 'Virgo': 10, 'Capricorn': 8, 'Gemini': 6, 'Sagittarius': 4, 'Leo': 3, 'Aquarius': 2, 'Aries': 1, 'Libra': 3 },
      'Leo': { 'Aries': 18, 'Sagittarius': 16, 'Gemini': 12, 'Libra': 10, 'Aquarius': 8, 'Cancer': 6, 'Capricorn': 4, 'Taurus': 3, 'Scorpio': 2, 'Pisces': 1, 'Virgo': 3 },
      'Virgo': { 'Taurus': 18, 'Capricorn': 16, 'Cancer': 12, 'Scorpio': 10, 'Pisces': 8, 'Leo': 6, 'Aquarius': 4, 'Gemini': 3, 'Sagittarius': 2, 'Aries': 1, 'Libra': 3 },
      'Libra': { 'Gemini': 18, 'Aquarius': 16, 'Leo': 12, 'Sagittarius': 10, 'Aries': 8, 'Virgo': 6, 'Pisces': 4, 'Cancer': 3, 'Capricorn': 2, 'Taurus': 1, 'Scorpio': 3 },
      'Scorpio': { 'Cancer': 18, 'Pisces': 16, 'Virgo': 12, 'Capricorn': 10, 'Taurus': 8, 'Libra': 6, 'Sagittarius': 4, 'Gemini': 3, 'Aquarius': 2, 'Leo': 1, 'Aries': 3 },
      'Sagittarius': { 'Aries': 18, 'Leo': 16, 'Libra': 12, 'Aquarius': 10, 'Gemini': 8, 'Scorpio': 6, 'Pisces': 4, 'Cancer': 3, 'Capricorn': 2, 'Virgo': 1, 'Taurus': 3 },
      'Capricorn': { 'Taurus': 18, 'Virgo': 16, 'Scorpio': 12, 'Pisces': 10, 'Cancer': 8, 'Sagittarius': 6, 'Aquarius': 4, 'Leo': 3, 'Aries': 2, 'Gemini': 1, 'Libra': 3 },
      'Aquarius': { 'Gemini': 18, 'Libra': 16, 'Sagittarius': 12, 'Aries': 10, 'Leo': 8, 'Capricorn': 6, 'Pisces': 4, 'Taurus': 3, 'Scorpio': 2, 'Cancer': 1, 'Virgo': 3 },
      'Pisces': { 'Cancer': 18, 'Scorpio': 16, 'Capricorn': 12, 'Taurus': 10, 'Virgo': 8, 'Aquarius': 6, 'Sagittarius': 4, 'Gemini': 3, 'Aries': 2, 'Leo': 1, 'Libra': 3 }
    };
    
    const zodiacScore = zodiacCompatibility[zodiac1 as keyof typeof zodiacCompatibility]?.[zodiac2 as keyof typeof zodiacCompatibility] || 2;
    score += zodiacScore;
    
    // Enhanced numerology analysis
    const getNumerology = (date: Date) => {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      let sum = day + month + year;
      while (sum > 9) {
        sum = sum.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
      }
      return sum;
    };
    
    const numerology1 = getNumerology(d1);
    const numerology2 = getNumerology(d2);
    
    if (numerology1 === numerology2) score += 15;
    else if (Math.abs(numerology1 - numerology2) === 1) score += 10;
    else if (Math.abs(numerology1 - numerology2) === 2) score += 6;
    else if (Math.abs(numerology1 - numerology2) <= 3) score += 3;
    
    // Month distance analysis
    const monthDiff = Math.abs(d1.getMonth() - d2.getMonth());
    if (monthDiff === 0) score += 8;
    else if (monthDiff === 1 || monthDiff === 11) score += 5;
    else if (monthDiff === 2 || monthDiff === 10) score += 3;
    else if (monthDiff === 3 || monthDiff === 9) score += 2;
    else if (monthDiff === 6) score += 1; // Opposite months
    
    // Day of year analysis
    const dayOfYear1 = Math.floor((d1.getTime() - new Date(d1.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const dayOfYear2 = Math.floor((d2.getTime() - new Date(d2.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const dayDiff = Math.abs(dayOfYear1 - dayOfYear2);
    
    if (dayDiff === 0) score += 12;
    else if (dayDiff <= 7) score += 8;
    else if (dayDiff <= 30) score += 5;
    else if (dayDiff <= 60) score += 3;
    else if (dayDiff <= 90) score += 2;
    else if (dayDiff <= 180) score += 1;
    
    // Enhanced random factor for more variety
    const randomFactor = Math.random() * 25;
    score += randomFactor;
    
    return Math.max(5, Math.min(95, Math.round(score)));
  };

  const getResultByPercentage = (percentage: number): BirthdayResult => {
    const ageDiff = birthday1 && birthday2 ? 
      Math.abs(new Date(birthday1).getFullYear() - new Date(birthday2).getFullYear()) : 0;
    
    const result = birthdayResults.find(r => r.percentage <= percentage) || birthdayResults[birthdayResults.length - 1];
    return { ...result, ageDifference: ageDiff };
  };

  const handleCalculate = () => {
    if (!birthday1 || !birthday2) return;
    
    setIsCalculating(true);
    
    setTimeout(() => {
      const percentage = calculateBirthdayCompatibility(birthday1, birthday2);
      const birthdayResult = getResultByPercentage(percentage);
      setResult(birthdayResult);
      setIsCalculating(false);
    }, 2000);
  };

  const resetCalculator = () => {
    setBirthday1("");
    setBirthday2("");
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Cake className="h-8 w-8 text-pink-500 animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Birthday Compatibility Calculator
          </h1>
          <Calendar className="h-8 w-8 text-pink-500 animate-pulse" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover the cosmic compatibility between two birthdays! Our calculator analyzes birth dates, 
          zodiac signs, and numerological patterns to reveal your birthday compatibility. 🎂
        </p>
      </div>

      {/* Calculator Card */}
      <Card className="border-2 border-pink-200 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-pink-600">Enter Two Birthdays</CardTitle>
          <CardDescription>
            Select two birth dates and let our cosmic algorithm calculate your birthday compatibility! ✨
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="birthday1" className="text-lg font-semibold">
                First Birthday
              </Label>
              <Input
                id="birthday1"
                type="date"
                value={birthday1}
                onChange={(e) => setBirthday1(e.target.value)}
                className="text-lg h-12 border-2 border-pink-200 focus:border-pink-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthday2" className="text-lg font-semibold">
                Second Birthday
              </Label>
              <Input
                id="birthday2"
                type="date"
                value={birthday2}
                onChange={(e) => setBirthday2(e.target.value)}
                className="text-lg h-12 border-2 border-pink-200 focus:border-pink-400"
              />
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={handleCalculate}
              disabled={!birthday1 || !birthday2 || isCalculating}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {isCalculating ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Analyzing Birthdays...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Cake className="h-5 w-5" />
                  <span>Calculate Compatibility</span>
                </div>
              )}
            </Button>
            <Button
              onClick={resetCalculator}
              variant="outline"
              className="px-6 py-3 text-lg border-2 border-pink-200 hover:border-pink-400 rounded-full"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Result Card */}
      {result && (
        <Card className="border-2 border-pink-300 shadow-xl animate-in slide-in-from-bottom-4 duration-500">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* Percentage Display */}
              <div className="relative">
                <div className="text-8xl font-bold text-pink-500 mb-4 animate-bounce">
                  {result.percentage}%
                </div>
                <div className="text-6xl mb-4">{result.emoji}</div>
              </div>

              {/* Result Details */}
              <div className="space-y-4">
                <h2 className={`text-3xl font-bold ${result.color}`}>
                  {result.title}
                </h2>
                <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                  {result.compatibilityType}
                </Badge>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  {result.description}
                </p>
                
                {/* Progress Bar */}
                <div className="w-full max-w-md mx-auto">
                  <Progress 
                    value={result.percentage} 
                    className="h-4 bg-pink-100"
                  />
                </div>

                {/* Age Difference */}
                {result.ageDifference > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-700 mb-1">
                      📅 Age Difference
                    </h3>
                    <p className="text-blue-600">
                      {result.ageDifference} year{result.ageDifference !== 1 ? 's' : ''} apart
                    </p>
                  </div>
                )}

                {/* Birthday Analysis */}
                <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
                  <h3 className="text-xl font-semibold text-pink-700 mb-2">
                    🔍 Birthday Analysis
                  </h3>
                  <p className="text-lg text-pink-600">
                    {result.birthdayAnalysis}
                  </p>
                </div>

                {/* Advice */}
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="text-xl font-semibold text-purple-700 mb-2">
                    💡 Compatibility Advice
                  </h3>
                  <p className="text-lg text-purple-600">
                    {result.advice}
                  </p>
                </div>

                {/* Fun Fact */}
                <div className="bg-gradient-to-r from-indigo-50 to-pink-50 p-6 rounded-lg border border-indigo-200">
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
              onClick={() => router.push('/category/fun-games/zodiac-match-calculator')}
            >
              <Star className="h-6 w-6 text-green-500" />
              <span className="text-sm font-medium">Zodiac Match</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SEO Content */}
      <div className="prose max-w-none space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🎂 Birthday Compatibility Calculator - Discover Your Cosmic Connection
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            Our Birthday Compatibility Calculator is the ultimate tool for analyzing the cosmic compatibility between two birth dates. 
            Whether you're curious about romantic compatibility, friendship potential, or just having fun with birthdays, 
            this calculator provides detailed insights based on astrological patterns, numerology, and cosmic alignment.
          </p>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            How Our Birthday Compatibility Calculator Works
          </h3>
          <p className="text-gray-700 mb-4">
            Our advanced algorithm analyzes multiple factors including birth date patterns, zodiac sign compatibility, 
            numerological connections, season alignment, and age differences to calculate your birthday compatibility percentage. 
            The results reveal the cosmic connection between two birth dates.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Perfect For:
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Testing birthday compatibility for relationships</li>
            <li>Analyzing cosmic connections between friends</li>
            <li>Fun activities and party games</li>
            <li>Understanding astrological patterns</li>
            <li>Entertainment and curiosity exploration</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Birthday Compatibility Features
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Advanced astrological analysis</li>
            <li>Zodiac sign compatibility assessment</li>
            <li>Numerological pattern recognition</li>
            <li>Season and month alignment analysis</li>
            <li>Age difference considerations</li>
            <li>Humorous and entertaining results</li>
            <li>Detailed birthday analysis explanations</li>
            <li>Beautiful animations and visual effects</li>
            <li>Mobile-friendly responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BirthdayCompatibilityCalculator;
