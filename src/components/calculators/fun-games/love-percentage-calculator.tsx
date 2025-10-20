"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Heart, Sparkles, Star, Flame, Coffee, Music, Camera, Gamepad2 } from "lucide-react";

interface LoveResult {
  percentage: number;
  title: string;
  description: string;
  emoji: string;
  color: string;
  advice: string;
  funFact: string;
}

const loveResults: LoveResult[] = [
  {
    percentage: 95,
    title: "Soulmate Alert! 💕",
    description: "This is the kind of love that makes Disney movies jealous! You two are practically made for each other.",
    emoji: "💕",
    color: "text-red-500",
    advice: "Don't let this one slip away! This level of compatibility is rarer than a unicorn at a coffee shop.",
    funFact: "Only 0.1% of couples achieve this level of compatibility naturally!"
  },
  {
    percentage: 85,
    title: "Love Birds! 🕊️",
    description: "You two are soaring high in the love department! This relationship has serious potential.",
    emoji: "🕊️",
    color: "text-pink-500",
    advice: "Keep nurturing this connection - you're on the path to something beautiful!",
    funFact: "85% compatibility means you share 17 out of 20 core values!"
  },
  {
    percentage: 75,
    title: "Sweet Chemistry! 🍯",
    description: "There's definitely something sweet brewing between you two! The sparks are real.",
    emoji: "🍯",
    color: "text-orange-500",
    advice: "Focus on your common interests and watch this relationship blossom!",
    funFact: "75% is the average compatibility for successful long-term relationships!"
  },
  {
    percentage: 65,
    title: "Potential Partners! 🌱",
    description: "There's a solid foundation here! With some effort, this could grow into something amazing.",
    emoji: "🌱",
    color: "text-green-500",
    advice: "Communication is key - talk about your dreams and goals together!",
    funFact: "65% compatibility is where most relationships start before growing stronger!"
  },
  {
    percentage: 55,
    title: "Friends with Benefits! 😊",
    description: "You two make great friends! Whether romance blooms depends on how much you both want it.",
    emoji: "😊",
    color: "text-blue-500",
    advice: "Take it slow and see where the journey leads you naturally.",
    funFact: "55% compatibility often leads to the strongest friendships!"
  },
  {
    percentage: 45,
    title: "Opposites Attract! ⚡",
    description: "You're different, but that might be exactly what you both need! Sometimes opposites create the best chemistry.",
    emoji: "⚡",
    color: "text-purple-500",
    advice: "Embrace your differences - they might be your greatest strength!",
    funFact: "Many successful couples have 45% compatibility but 100% chemistry!"
  },
  {
    percentage: 35,
    title: "Mystery Romance! 🔮",
    description: "There's something intriguing here, but it's wrapped in mystery! Time will tell what unfolds.",
    emoji: "🔮",
    color: "text-indigo-500",
    advice: "Be patient and let things develop naturally - some love stories take time to write!",
    funFact: "35% compatibility often leads to the most interesting relationships!"
  },
  {
    percentage: 25,
    title: "Adventure Awaits! 🗺️",
    description: "This is uncharted territory! Every relationship is an adventure, and this one has potential.",
    emoji: "🗺️",
    color: "text-yellow-500",
    advice: "Focus on building genuine friendship first - love often follows naturally.",
    funFact: "25% compatibility can still lead to 100% happiness with the right approach!"
  },
  {
    percentage: 15,
    title: "Learning Experience! 📚",
    description: "Every relationship teaches us something! This one might be about growth and discovery.",
    emoji: "📚",
    color: "text-gray-500",
    advice: "Keep an open mind and heart - sometimes the best relationships surprise us!",
    funFact: "Even 15% compatibility can lead to lifelong friendships!"
  },
  {
    percentage: 5,
    title: "Plot Twist! 🎭",
    description: "Well, this is unexpected! But hey, the best stories often have the most surprising beginnings.",
    emoji: "🎭",
    color: "text-slate-500",
    advice: "Sometimes the universe has a sense of humor - embrace the journey!",
    funFact: "5% compatibility means you're both unique individuals - and that's beautiful!"
  }
];

const LovePercentageCalculator: React.FC = () => {
  const router = useRouter();
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [result, setResult] = useState<LoveResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const calculateLovePercentage = (name1: string, name2: string): number => {
    if (!name1 || !name2) return 0;
    
    // Create a more sophisticated and fun algorithm
    const name1Lower = name1.toLowerCase().replace(/\s/g, '');
    const name2Lower = name2.toLowerCase().replace(/\s/g, '');
    const combined = name1Lower + name2Lower;
    let score = 0;
    
    // Base compatibility score (starts higher for more realistic results)
    score += 30;
    
    // Name length compatibility
    const lengthDiff = Math.abs(name1Lower.length - name2Lower.length);
    if (lengthDiff === 0) score += 15;
    else if (lengthDiff <= 2) score += 10;
    else if (lengthDiff <= 4) score += 5;
    else if (lengthDiff <= 6) score += 2;
    
    // Vowel harmony analysis
    const vowels1 = name1Lower.match(/[aeiou]/g)?.length || 0;
    const vowels2 = name2Lower.match(/[aeiou]/g)?.length || 0;
    const vowelDiff = Math.abs(vowels1 - vowels2);
    if (vowelDiff === 0) score += 12;
    else if (vowelDiff <= 1) score += 8;
    else if (vowelDiff <= 2) score += 4;
    
    // Consonant compatibility
    const consonants1 = name1Lower.match(/[bcdfghjklmnpqrstvwxyz]/g)?.length || 0;
    const consonants2 = name2Lower.match(/[bcdfghjklmnpqrstvwxyz]/g)?.length || 0;
    const consonantDiff = Math.abs(consonants1 - consonants2);
    if (consonantDiff === 0) score += 10;
    else if (consonantDiff <= 1) score += 6;
    else if (consonantDiff <= 2) score += 3;
    
    // Shared letters bonus
    const sharedLetters = new Set();
    for (const letter of name1Lower) {
      if (name2Lower.includes(letter)) {
        sharedLetters.add(letter);
      }
    }
    score += sharedLetters.size * 3;
    
    // Special romantic letter bonuses
    if (combined.includes('l')) score += 8; // Love
    if (combined.includes('o')) score += 6; // Love
    if (combined.includes('v')) score += 7; // Love
    if (combined.includes('e')) score += 6; // Love
    if (combined.includes('h')) score += 4; // Heart
    if (combined.includes('a')) score += 4; // Heart
    if (combined.includes('r')) score += 4; // Heart
    if (combined.includes('t')) score += 4; // Heart
    
    // Name ending compatibility
    const ending1 = name1Lower.slice(-2);
    const ending2 = name2Lower.slice(-2);
    if (ending1 === ending2) score += 12;
    else if (ending1[1] === ending2[1]) score += 8;
    else if (ending1[0] === ending2[0]) score += 4;
    
    // Phonetic patterns
    const patterns1 = name1Lower.match(/(.)\1/g) || [];
    const patterns2 = name2Lower.match(/(.)\1/g) || [];
    if (patterns1.length > 0 && patterns2.length > 0) score += 8;
    
    // Name origin compatibility (simplified)
    const romanticNames = ['rose', 'lily', 'jade', 'ruby', 'pearl', 'diamond', 'crystal', 'amber', 'sapphire', 'emerald'];
    const strongNames = ['alex', 'max', 'leo', 'ace', 'rex', 'zeus', 'thor', 'odin', 'titan', 'atlas'];
    
    if (romanticNames.some(name => name1Lower.includes(name) || name2Lower.includes(name))) score += 10;
    if (strongNames.some(name => name1Lower.includes(name) || name2Lower.includes(name))) score += 8;
    
    // Enhanced random factor for more variety
    const randomFactor = Math.random() * 35;
    score += randomFactor;
    
    // Ensure result is between 5 and 95 with better distribution
    return Math.max(5, Math.min(95, Math.round(score)));
  };

  const getResultByPercentage = (percentage: number): LoveResult => {
    if (percentage >= 90) return loveResults[0];
    if (percentage >= 80) return loveResults[1];
    if (percentage >= 70) return loveResults[2];
    if (percentage >= 60) return loveResults[3];
    if (percentage >= 50) return loveResults[4];
    if (percentage >= 40) return loveResults[5];
    if (percentage >= 30) return loveResults[6];
    if (percentage >= 20) return loveResults[7];
    if (percentage >= 10) return loveResults[8];
    return loveResults[9];
  };

  const handleCalculate = () => {
    if (!name1.trim() || !name2.trim()) return;
    
    setIsCalculating(true);
    setAnimationKey(prev => prev + 1);
    
    setTimeout(() => {
      const percentage = calculateLovePercentage(name1, name2);
      const loveResult = getResultByPercentage(percentage);
      setResult(loveResult);
      setIsCalculating(false);
    }, 2000);
  };

  const resetCalculator = () => {
    setName1("");
    setName2("");
    setResult(null);
    setAnimationKey(prev => prev + 1);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Heart className="h-8 w-8 text-red-500 animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
            Love Percentage Calculator
          </h1>
          <Heart className="h-8 w-8 text-red-500 animate-pulse" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover the magical compatibility percentage between two names! 
          Our scientifically-unsound but incredibly fun algorithm will reveal your love potential. 💕
        </p>
      </div>

      {/* Calculator Card */}
      <Card className="border-2 border-pink-200 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-pink-600">Enter Your Names</CardTitle>
          <CardDescription>
            Type in two names and let our love algorithm work its magic! ✨
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name1" className="text-lg font-semibold">
                First Name
              </Label>
              <Input
                id="name1"
                type="text"
                placeholder="Enter first name..."
                value={name1}
                onChange={(e) => setName1(e.target.value)}
                className="text-lg h-12 border-2 border-pink-200 focus:border-pink-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name2" className="text-lg font-semibold">
                Second Name
              </Label>
              <Input
                id="name2"
                type="text"
                placeholder="Enter second name..."
                value={name2}
                onChange={(e) => setName2(e.target.value)}
                className="text-lg h-12 border-2 border-pink-200 focus:border-pink-400"
              />
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={handleCalculate}
              disabled={!name1.trim() || !name2.trim() || isCalculating}
              className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {isCalculating ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Calculating Love...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>Calculate Love %</span>
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

                {/* Advice */}
                <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
                  <h3 className="text-xl font-semibold text-pink-700 mb-2">
                    💡 Love Advice
                  </h3>
                  <p className="text-lg text-pink-600">
                    {result.advice}
                  </p>
                </div>

                {/* Fun Fact */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="text-xl font-semibold text-purple-700 mb-2">
                    🎉 Fun Fact
                  </h3>
                  <p className="text-lg text-purple-600">
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
              onClick={() => router.push('/category/fun-games/crush-compatibility-calculator')}
            >
              <Heart className="h-6 w-6 text-pink-500" />
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
              className="h-20 flex flex-col items-center justify-center space-y-2 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50"
              onClick={() => router.push('/category/fun-games/zodiac-match-calculator')}
            >
              <Star className="h-6 w-6 text-purple-500" />
              <span className="text-sm font-medium">Zodiac Match</span>
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
            💕 Love Percentage Calculator - Find Your Perfect Match
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            Our Love Percentage Calculator is the ultimate tool for discovering romantic compatibility between two people. 
            Whether you're curious about a crush, testing your relationship, or just having fun with friends, 
            this calculator provides entertaining and insightful results based on name analysis.
          </p>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            How Our Love Calculator Works
          </h3>
          <p className="text-gray-700 mb-4">
            Our algorithm analyzes various factors including vowel patterns, name length, unique letter combinations, 
            and special character bonuses to calculate your love percentage. While it's designed for entertainment, 
            it often reveals interesting patterns in name compatibility!
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Perfect For:
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Testing compatibility with your crush or partner</li>
            <li>Fun activities with friends and family</li>
            <li>Ice-breaker conversations and party games</li>
            <li>Understanding name patterns and their meanings</li>
            <li>Entertainment and relationship exploration</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Love Calculator Features
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Instant love percentage calculation</li>
            <li>Humorous and entertaining result interpretations</li>
            <li>Beautiful animations and visual effects</li>
            <li>Detailed compatibility analysis</li>
            <li>Fun facts and relationship advice</li>
            <li>Mobile-friendly responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LovePercentageCalculator;
