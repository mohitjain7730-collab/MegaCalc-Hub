"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart, Eye, Star, Flame, Coffee, Music, Camera, Gamepad2, Zap, Type } from "lucide-react";

interface NameResult {
  percentage: number;
  title: string;
  description: string;
  emoji: string;
  color: string;
  advice: string;
  funFact: string;
  compatibilityType: string;
  nameAnalysis: string;
}

const nameResults: NameResult[] = [
  {
    percentage: 95,
    title: "Name Soulmates! 💫",
    description: "Your names are practically written in the stars together! This is name compatibility at its finest.",
    emoji: "💫",
    color: "text-purple-500",
    advice: "These names were meant to be together - don't let this opportunity slip away!",
    funFact: "95% name compatibility occurs in only 0.1% of name combinations!",
    compatibilityType: "NAME SOULMATES",
    nameAnalysis: "Your names share incredible phonetic harmony and symbolic resonance."
  },
  {
    percentage: 85,
    title: "Perfect Match! ✨",
    description: "Your names flow together like poetry! There's something magical about this combination.",
    emoji: "✨",
    color: "text-pink-500",
    advice: "This name combination has serious potential - the universe is clearly on your side!",
    funFact: "85% name compatibility often leads to the most harmonious relationships!",
    compatibilityType: "PERFECT MATCH",
    nameAnalysis: "Your names create a beautiful melodic pattern when spoken together."
  },
  {
    percentage: 75,
    title: "Great Harmony! 🎵",
    description: "Your names sound great together! There's a natural rhythm and flow between them.",
    emoji: "🎵",
    color: "text-blue-500",
    advice: "These names complement each other beautifully - a promising combination!",
    funFact: "75% name compatibility is the sweet spot for lasting relationships!",
    compatibilityType: "GREAT HARMONY",
    nameAnalysis: "Your names share similar phonetic patterns and vowel structures."
  },
  {
    percentage: 65,
    title: "Nice Balance! ⚖️",
    description: "Your names create a nice balance together! There's potential for a good connection.",
    emoji: "⚖️",
    color: "text-green-500",
    advice: "Focus on the positive aspects of your name combination - it has merit!",
    funFact: "65% name compatibility often leads to stable and reliable relationships!",
    compatibilityType: "NICE BALANCE",
    nameAnalysis: "Your names have complementary characteristics that work well together."
  },
  {
    percentage: 55,
    title: "Interesting Mix! 🎨",
    description: "Your names create an interesting mix! There's something unique about this combination.",
    emoji: "🎨",
    color: "text-orange-500",
    advice: "Embrace the uniqueness of your name combination - it could be special!",
    funFact: "55% name compatibility often leads to the most creative relationships!",
    compatibilityType: "INTERESTING MIX",
    nameAnalysis: "Your names have contrasting elements that create an intriguing dynamic."
  },
  {
    percentage: 45,
    title: "Opposites Attract! ⚡",
    description: "Your names are quite different, but that might be exactly what you need!",
    emoji: "⚡",
    color: "text-yellow-500",
    advice: "Sometimes the best combinations come from opposites - embrace the difference!",
    funFact: "45% name compatibility often leads to the most exciting relationships!",
    compatibilityType: "OPPOSITES ATTRACT",
    nameAnalysis: "Your names have very different characteristics that create interesting tension."
  },
  {
    percentage: 35,
    title: "Mystery Combination! 🔮",
    description: "This is a mysterious combination! Your names have an intriguing dynamic.",
    emoji: "🔮",
    color: "text-indigo-500",
    advice: "Let this name combination unfold naturally - mystery can be beautiful!",
    funFact: "35% name compatibility often leads to the most surprising relationships!",
    compatibilityType: "MYSTERY COMBINATION",
    nameAnalysis: "Your names have an enigmatic quality that's hard to define but intriguing."
  },
  {
    percentage: 25,
    title: "Unique Pair! 🌟",
    description: "Your names are a unique pair! There's something special about this combination.",
    emoji: "🌟",
    color: "text-gray-500",
    advice: "Celebrate the uniqueness of your name combination - it's one of a kind!",
    funFact: "25% name compatibility often leads to the most memorable relationships!",
    compatibilityType: "UNIQUE PAIR",
    nameAnalysis: "Your names create a distinctive combination that stands out from the crowd."
  },
  {
    percentage: 15,
    title: "Adventure Awaits! 🗺️",
    description: "This name combination is an adventure waiting to happen! Who knows what will unfold?",
    emoji: "🗺️",
    color: "text-slate-500",
    advice: "Embrace the adventure of your name combination - every journey starts somewhere!",
    funFact: "15% name compatibility often leads to the most unexpected relationships!",
    compatibilityType: "ADVENTURE AWAITS",
    nameAnalysis: "Your names suggest an exciting journey with unknown possibilities."
  },
  {
    percentage: 5,
    title: "Plot Twist! 🎭",
    description: "Well, this is unexpected! But hey, the best stories often have surprising beginnings.",
    emoji: "🎭",
    color: "text-slate-600",
    advice: "Sometimes the universe has a sense of humor - embrace the journey!",
    funFact: "5% name compatibility means you're both unique individuals!",
    compatibilityType: "PLOT TWIST",
    nameAnalysis: "Your names create an unexpected combination that defies conventional analysis."
  }
];

const NameCompatibilityCalculator: React.FC = () => {
  const router = useRouter();
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [result, setResult] = useState<NameResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const calculateNameCompatibility = (name1: string, name2: string): number => {
    if (!name1 || !name2) return 0;
    
    let score = 0;
    const name1Lower = name1.toLowerCase().replace(/\s/g, '');
    const name2Lower = name2.toLowerCase().replace(/\s/g, '');
    const combined = name1Lower + name2Lower;
    
    // Base name compatibility score
    score += 25;
    
    // Enhanced length compatibility
    const lengthDiff = Math.abs(name1Lower.length - name2Lower.length);
    if (lengthDiff === 0) score += 18;
    else if (lengthDiff <= 1) score += 15;
    else if (lengthDiff <= 2) score += 12;
    else if (lengthDiff <= 3) score += 8;
    else if (lengthDiff <= 4) score += 5;
    else if (lengthDiff <= 6) score += 3;
    else if (lengthDiff <= 8) score += 1;
    
    // Enhanced vowel analysis
    const vowels1 = name1Lower.match(/[aeiou]/g)?.length || 0;
    const vowels2 = name2Lower.match(/[aeiou]/g)?.length || 0;
    const vowelDiff = Math.abs(vowels1 - vowels2);
    if (vowelDiff === 0) score += 12;
    else if (vowelDiff <= 1) score += 8;
    else if (vowelDiff <= 2) score += 5;
    else if (vowelDiff <= 3) score += 3;
    
    // Enhanced consonant analysis
    const consonants1 = name1Lower.match(/[bcdfghjklmnpqrstvwxyz]/g)?.length || 0;
    const consonants2 = name2Lower.match(/[bcdfghjklmnpqrstvwxyz]/g)?.length || 0;
    const consonantDiff = Math.abs(consonants1 - consonants2);
    if (consonantDiff === 0) score += 12;
    else if (consonantDiff <= 1) score += 8;
    else if (consonantDiff <= 2) score += 5;
    else if (consonantDiff <= 3) score += 3;
    
    // Enhanced shared letters analysis
    const sharedLetters = new Set();
    for (const letter of name1Lower) {
      if (name2Lower.includes(letter)) {
        sharedLetters.add(letter);
      }
    }
    score += sharedLetters.size * 2.5;
    
    // Bonus for having many shared letters
    if (sharedLetters.size >= 5) score += 8;
    else if (sharedLetters.size >= 3) score += 5;
    else if (sharedLetters.size >= 2) score += 3;
    
    // Enhanced special letter bonuses
    if (combined.includes('l')) score += 6; // Love
    if (combined.includes('o')) score += 4; // Love
    if (combined.includes('v')) score += 5; // Love
    if (combined.includes('e')) score += 4; // Love
    if (combined.includes('h')) score += 3; // Heart
    if (combined.includes('a')) score += 3; // Heart
    if (combined.includes('r')) score += 3; // Heart
    if (combined.includes('t')) score += 3; // Heart
    if (combined.includes('s')) score += 2; // Soul
    if (combined.includes('u')) score += 2; // Soul
    if (combined.includes('p')) score += 2; // Partner
    if (combined.includes('n')) score += 2; // Partner
    
    // Enhanced phonetic patterns
    const patterns1 = name1Lower.match(/(.)\1/g) || [];
    const patterns2 = name2Lower.match(/(.)\1/g) || [];
    if (patterns1.length > 0 && patterns2.length > 0) score += 8;
    
    // Syllable analysis
    const getSyllables = (name: string) => {
      return name.toLowerCase().replace(/[^aeiou]/g, '').length;
    };
    
    const syllables1 = getSyllables(name1Lower);
    const syllables2 = getSyllables(name2Lower);
    const syllableDiff = Math.abs(syllables1 - syllables2);
    
    if (syllableDiff === 0) score += 10;
    else if (syllableDiff <= 1) score += 6;
    else if (syllableDiff <= 2) score += 3;
    
    // Enhanced ending compatibility
    const ending1 = name1Lower.slice(-2);
    const ending2 = name2Lower.slice(-2);
    if (ending1 === ending2) score += 12;
    else if (ending1[1] === ending2[1]) score += 8;
    else if (ending1[0] === ending2[0]) score += 4;
    
    // Beginning compatibility
    const beginning1 = name1Lower.slice(0, 2);
    const beginning2 = name2Lower.slice(0, 2);
    if (beginning1 === beginning2) score += 8;
    else if (beginning1[0] === beginning2[0]) score += 4;
    
    // Name origin compatibility (simplified)
    const romanticNames = ['rose', 'lily', 'jade', 'ruby', 'pearl', 'diamond', 'crystal', 'amber', 'sapphire', 'emerald', 'love', 'heart', 'soul'];
    const strongNames = ['alex', 'max', 'leo', 'ace', 'rex', 'zeus', 'thor', 'odin', 'titan', 'atlas', 'king', 'queen', 'prince', 'princess'];
    const natureNames = ['river', 'ocean', 'mountain', 'forest', 'sky', 'star', 'moon', 'sun', 'wind', 'rain', 'snow', 'flower', 'tree'];
    
    if (romanticNames.some(name => name1Lower.includes(name) || name2Lower.includes(name))) score += 8;
    if (strongNames.some(name => name1Lower.includes(name) || name2Lower.includes(name))) score += 6;
    if (natureNames.some(name => name1Lower.includes(name) || name2Lower.includes(name))) score += 5;
    
    // Letter frequency analysis
    const getLetterFrequency = (name: string) => {
      const freq: { [key: string]: number } = {};
      for (const letter of name) {
        freq[letter] = (freq[letter] || 0) + 1;
      }
      return freq;
    };
    
    const freq1 = getLetterFrequency(name1Lower);
    const freq2 = getLetterFrequency(name2Lower);
    
    let commonFreqScore = 0;
    for (const letter in freq1) {
      if (freq2[letter]) {
        commonFreqScore += Math.min(freq1[letter], freq2[letter]);
      }
    }
    score += commonFreqScore * 1.5;
    
    // Enhanced random factor for more variety
    const randomFactor = Math.random() * 30;
    score += randomFactor;
    
    return Math.max(5, Math.min(95, Math.round(score)));
  };

  const getResultByPercentage = (percentage: number): NameResult => {
    if (percentage >= 90) return nameResults[0];
    if (percentage >= 80) return nameResults[1];
    if (percentage >= 70) return nameResults[2];
    if (percentage >= 60) return nameResults[3];
    if (percentage >= 50) return nameResults[4];
    if (percentage >= 40) return nameResults[5];
    if (percentage >= 30) return nameResults[6];
    if (percentage >= 20) return nameResults[7];
    if (percentage >= 10) return nameResults[8];
    return nameResults[9];
  };

  const handleCalculate = () => {
    if (!name1.trim() || !name2.trim()) return;
    
    setIsCalculating(true);
    setAnimationKey(prev => prev + 1);
    
    setTimeout(() => {
      const percentage = calculateNameCompatibility(name1, name2);
      const nameResult = getResultByPercentage(percentage);
      setResult(nameResult);
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
          <Type className="h-8 w-8 text-purple-500 animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Name Compatibility Calculator
          </h1>
          <Sparkles className="h-8 w-8 text-purple-500 animate-pulse" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover the magical compatibility between two names! Our algorithm analyzes phonetic patterns, 
          letter combinations, and linguistic harmony to reveal your name compatibility. ✨
        </p>
      </div>

      {/* Calculator Card */}
      <Card className="border-2 border-purple-200 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-purple-600">Enter Two Names</CardTitle>
          <CardDescription>
            Type in two names and let our name analysis algorithm work its magic! 🔮
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
                className="text-lg h-12 border-2 border-purple-200 focus:border-purple-400"
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
                className="text-lg h-12 border-2 border-purple-200 focus:border-purple-400"
              />
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={handleCalculate}
              disabled={!name1.trim() || !name2.trim() || isCalculating}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {isCalculating ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Analyzing Names...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Type className="h-5 w-5" />
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
                <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
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

                {/* Name Analysis */}
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="text-xl font-semibold text-purple-700 mb-2">
                    🔍 Name Analysis
                  </h3>
                  <p className="text-lg text-purple-600">
                    {result.nameAnalysis}
                  </p>
                </div>

                {/* Advice */}
                <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
                  <h3 className="text-xl font-semibold text-pink-700 mb-2">
                    💡 Compatibility Advice
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
            ✨ Name Compatibility Calculator - Discover Your Perfect Name Match
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            Our Name Compatibility Calculator is the ultimate tool for analyzing the compatibility between two names. 
            Whether you're curious about romantic compatibility, friendship potential, or just having fun with names, 
            this calculator provides detailed insights based on phonetic analysis, letter patterns, and linguistic harmony.
          </p>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            How Our Name Compatibility Calculator Works
          </h3>
          <p className="text-gray-700 mb-4">
            Our advanced algorithm analyzes multiple factors including name length, vowel and consonant patterns, 
            shared letters, phonetic harmony, and special character bonuses to calculate your name compatibility percentage. 
            The results reveal the linguistic and symbolic connection between two names.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Perfect For:
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Testing name compatibility for relationships</li>
            <li>Analyzing friendship potential through names</li>
            <li>Fun activities and party games</li>
            <li>Understanding linguistic patterns in names</li>
            <li>Entertainment and curiosity exploration</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Name Compatibility Features
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Advanced phonetic analysis</li>
            <li>Letter pattern recognition</li>
            <li>Vowel and consonant harmony analysis</li>
            <li>Shared letter identification</li>
            <li>Ending compatibility assessment</li>
            <li>Humorous and entertaining results</li>
            <li>Detailed name analysis explanations</li>
            <li>Beautiful animations and visual effects</li>
            <li>Mobile-friendly responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NameCompatibilityCalculator;
