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
import { Heart, Eye, Sparkles, Star, Flame, Coffee, Music, Camera, Gamepad2, Zap } from "lucide-react";

interface CrushResult {
  percentage: number;
  title: string;
  description: string;
  emoji: string;
  color: string;
  advice: string;
  funFact: string;
  crushLevel: string;
}

const crushResults: CrushResult[] = [
  {
    percentage: 95,
    title: "Crush Alert! 💥",
    description: "This is more than a crush - this is CRUSH LEVEL MAXIMUM! Your heart is doing backflips!",
    emoji: "💥",
    color: "text-red-500",
    advice: "Stop overthinking and make your move! This level of compatibility is rare!",
    funFact: "95% crush compatibility means you're basically soulmates in disguise!",
    crushLevel: "MAXIMUM CRUSH"
  },
  {
    percentage: 85,
    title: "Major Crush! 💕",
    description: "You've got it BAD! This crush is serious business and totally worth pursuing.",
    emoji: "💕",
    color: "text-pink-500",
    advice: "The signs are all there - time to step up your flirting game!",
    funFact: "85% crush compatibility often leads to the most passionate relationships!",
    crushLevel: "MAJOR CRUSH"
  },
  {
    percentage: 75,
    title: "Sweet Crush! 🍯",
    description: "This crush is sweet like honey! There's definitely something special brewing here.",
    emoji: "🍯",
    color: "text-orange-500",
    advice: "Take it slow and let the chemistry build naturally - it's working!",
    funFact: "75% crush compatibility is the sweet spot for long-term potential!",
    crushLevel: "SWEET CRUSH"
  },
  {
    percentage: 65,
    title: "Growing Crush! 🌱",
    description: "This crush is growing stronger every day! You're definitely on the right track.",
    emoji: "🌱",
    color: "text-green-500",
    advice: "Keep being yourself and let this crush blossom into something beautiful!",
    funFact: "65% crush compatibility often leads to the strongest relationships!",
    crushLevel: "GROWING CRUSH"
  },
  {
    percentage: 55,
    title: "Potential Crush! ⚡",
    description: "There's potential here! This could definitely develop into something more.",
    emoji: "⚡",
    color: "text-blue-500",
    advice: "Focus on building a genuine connection - the crush will follow naturally!",
    funFact: "55% crush compatibility is where most great relationships start!",
    crushLevel: "POTENTIAL CRUSH"
  },
  {
    percentage: 45,
    title: "Curious Crush! 🔍",
    description: "You're curious about this person! There's something intriguing that draws you in.",
    emoji: "🔍",
    color: "text-purple-500",
    advice: "Explore this curiosity - sometimes the best crushes start with intrigue!",
    funFact: "45% crush compatibility often leads to the most interesting relationships!",
    crushLevel: "CURIOUS CRUSH"
  },
  {
    percentage: 35,
    title: "Mystery Crush! 🔮",
    description: "This is a mystery crush! You're not sure what it is, but something's there.",
    emoji: "🔮",
    color: "text-indigo-500",
    advice: "Give it time to develop - some crushes need space to grow!",
    funFact: "35% crush compatibility can surprise you with unexpected chemistry!",
    crushLevel: "MYSTERY CRUSH"
  },
  {
    percentage: 25,
    title: "Friendly Crush! 😊",
    description: "This feels more like a friendly crush! You enjoy their company and that's beautiful.",
    emoji: "😊",
    color: "text-yellow-500",
    advice: "Enjoy the friendship - sometimes that's exactly what you both need!",
    funFact: "25% crush compatibility often leads to lifelong friendships!",
    crushLevel: "FRIENDLY CRUSH"
  },
  {
    percentage: 15,
    title: "Mild Interest! 🤔",
    description: "There's mild interest here! You're curious but not head-over-heels yet.",
    emoji: "🤔",
    color: "text-gray-500",
    advice: "Keep an open mind - sometimes the best connections start slowly!",
    funFact: "15% crush compatibility can still lead to meaningful relationships!",
    crushLevel: "MILD INTEREST"
  },
  {
    percentage: 5,
    title: "Plot Twist! 🎭",
    description: "Well, this is unexpected! But hey, the best stories often have surprising beginnings.",
    emoji: "🎭",
    color: "text-slate-500",
    advice: "Sometimes the universe has a sense of humor - embrace the journey!",
    funFact: "5% crush compatibility means you're both unique individuals!",
    crushLevel: "PLOT TWIST"
  }
];

const CrushCompatibilityCalculator: React.FC = () => {
  const router = useRouter();
  const [yourName, setYourName] = useState("");
  const [crushName, setCrushName] = useState("");
  const [yourAge, setYourAge] = useState("");
  const [crushAge, setCrushAge] = useState("");
  const [yourPersonality, setYourPersonality] = useState("");
  const [crushPersonality, setCrushPersonality] = useState("");
  const [result, setResult] = useState<CrushResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const personalityTypes = [
    "Adventurous Explorer",
    "Creative Artist",
    "Logical Thinker",
    "Social Butterfly",
    "Quiet Observer",
    "Energetic Athlete",
    "Romantic Dreamer",
    "Practical Planner",
    "Mysterious Soul",
    "Funny Comedian"
  ];

  const calculateCrushCompatibility = (): number => {
    if (!yourName || !crushName) return 0;
    
    let score = 0;
    
    // Base crush compatibility score
    score += 25;
    
    // Name analysis
    const yourNameLower = yourName.toLowerCase().replace(/\s/g, '');
    const crushNameLower = crushName.toLowerCase().replace(/\s/g, '');
    const combined = yourNameLower + crushNameLower;
    
    // Name length compatibility
    const lengthDiff = Math.abs(yourNameLower.length - crushNameLower.length);
    if (lengthDiff === 0) score += 12;
    else if (lengthDiff <= 2) score += 8;
    else if (lengthDiff <= 4) score += 4;
    else if (lengthDiff <= 6) score += 2;
    
    // Vowel harmony analysis
    const vowels1 = yourNameLower.match(/[aeiou]/g)?.length || 0;
    const vowels2 = crushNameLower.match(/[aeiou]/g)?.length || 0;
    const vowelDiff = Math.abs(vowels1 - vowels2);
    if (vowelDiff === 0) score += 10;
    else if (vowelDiff <= 1) score += 6;
    else if (vowelDiff <= 2) score += 3;
    
    // Shared letters bonus
    const sharedLetters = new Set();
    for (const letter of yourNameLower) {
      if (crushNameLower.includes(letter)) {
        sharedLetters.add(letter);
      }
    }
    score += sharedLetters.size * 2.5;
    
    // Age compatibility (more detailed)
    if (yourAge && crushAge) {
      const age1 = parseInt(yourAge);
      const age2 = parseInt(crushAge);
      const ageDiff = Math.abs(age1 - age2);
      
      if (ageDiff === 0) score += 15;
      else if (ageDiff <= 1) score += 12;
      else if (ageDiff <= 2) score += 10;
      else if (ageDiff <= 3) score += 8;
      else if (ageDiff <= 5) score += 6;
      else if (ageDiff <= 8) score += 4;
      else if (ageDiff <= 12) score += 2;
      else if (ageDiff <= 20) score += 1;
      
      // Bonus for being in similar life stages
      if ((age1 >= 18 && age1 <= 25 && age2 >= 18 && age2 <= 25) ||
          (age1 >= 26 && age1 <= 35 && age2 >= 26 && age2 <= 35) ||
          (age1 >= 36 && age1 <= 50 && age2 >= 36 && age2 <= 50)) {
        score += 5;
      }
    }
    
    // Enhanced personality compatibility
    if (yourPersonality && crushPersonality) {
      if (yourPersonality === crushPersonality) score += 18;
      else {
        // More detailed personality compatibility matrix
        const compatibilityMatrix = {
          "Adventurous Explorer": {
            "Creative Artist": 15, "Energetic Athlete": 12, "Social Butterfly": 10,
            "Romantic Dreamer": 8, "Mysterious Soul": 6, "Quiet Observer": 4,
            "Logical Thinker": 3, "Practical Planner": 2, "Funny Comedian": 7
          },
          "Creative Artist": {
            "Romantic Dreamer": 16, "Adventurous Explorer": 15, "Mysterious Soul": 12,
            "Social Butterfly": 8, "Quiet Observer": 6, "Funny Comedian": 5,
            "Logical Thinker": 4, "Energetic Athlete": 3, "Practical Planner": 2
          },
          "Logical Thinker": {
            "Practical Planner": 14, "Quiet Observer": 10, "Mysterious Soul": 8,
            "Social Butterfly": 6, "Funny Comedian": 5, "Creative Artist": 4,
            "Adventurous Explorer": 3, "Energetic Athlete": 2, "Romantic Dreamer": 3
          },
          "Social Butterfly": {
            "Funny Comedian": 16, "Adventurous Explorer": 10, "Energetic Athlete": 8,
            "Creative Artist": 8, "Romantic Dreamer": 6, "Practical Planner": 5,
            "Logical Thinker": 6, "Quiet Observer": 4, "Mysterious Soul": 3
          },
          "Quiet Observer": {
            "Mysterious Soul": 14, "Logical Thinker": 10, "Creative Artist": 6,
            "Practical Planner": 8, "Romantic Dreamer": 5, "Funny Comedian": 4,
            "Social Butterfly": 4, "Adventurous Explorer": 4, "Energetic Athlete": 2
          },
          "Energetic Athlete": {
            "Adventurous Explorer": 12, "Social Butterfly": 8, "Funny Comedian": 6,
            "Practical Planner": 5, "Creative Artist": 3, "Logical Thinker": 2,
            "Romantic Dreamer": 4, "Quiet Observer": 2, "Mysterious Soul": 3
          },
          "Romantic Dreamer": {
            "Creative Artist": 16, "Mysterious Soul": 10, "Adventurous Explorer": 8,
            "Social Butterfly": 6, "Quiet Observer": 5, "Funny Comedian": 4,
            "Logical Thinker": 3, "Energetic Athlete": 4, "Practical Planner": 3
          },
          "Practical Planner": {
            "Logical Thinker": 14, "Quiet Observer": 8, "Energetic Athlete": 5,
            "Social Butterfly": 5, "Adventurous Explorer": 2, "Creative Artist": 2,
            "Romantic Dreamer": 3, "Mysterious Soul": 4, "Funny Comedian": 3
          },
          "Mysterious Soul": {
            "Creative Artist": 12, "Romantic Dreamer": 10, "Quiet Observer": 14,
            "Logical Thinker": 8, "Adventurous Explorer": 6, "Practical Planner": 4,
            "Social Butterfly": 3, "Energetic Athlete": 3, "Funny Comedian": 2
          },
          "Funny Comedian": {
            "Social Butterfly": 16, "Adventurous Explorer": 7, "Energetic Athlete": 6,
            "Creative Artist": 5, "Romantic Dreamer": 4, "Logical Thinker": 5,
            "Quiet Observer": 4, "Practical Planner": 3, "Mysterious Soul": 2
          }
        };
        
        const compatibility = compatibilityMatrix[yourPersonality as keyof typeof compatibilityMatrix]?.[crushPersonality as keyof typeof compatibilityMatrix] || 3;
        score += compatibility;
      }
    }
    
    // Special romantic letter bonuses
    if (combined.includes('l')) score += 6; // Love
    if (combined.includes('o')) score += 4; // Love
    if (combined.includes('v')) score += 5; // Love
    if (combined.includes('e')) score += 4; // Love
    if (combined.includes('h')) score += 3; // Heart
    if (combined.includes('a')) score += 3; // Heart
    if (combined.includes('r')) score += 3; // Heart
    if (combined.includes('t')) score += 3; // Heart
    
    // Name ending compatibility
    const ending1 = yourNameLower.slice(-2);
    const ending2 = crushNameLower.slice(-2);
    if (ending1 === ending2) score += 8;
    else if (ending1[1] === ending2[1]) score += 5;
    else if (ending1[0] === ending2[0]) score += 3;
    
    // Enhanced random factor for more variety
    const randomFactor = Math.random() * 30;
    score += randomFactor;
    
    return Math.max(5, Math.min(95, Math.round(score)));
  };

  const getResultByPercentage = (percentage: number): CrushResult => {
    if (percentage >= 90) return crushResults[0];
    if (percentage >= 80) return crushResults[1];
    if (percentage >= 70) return crushResults[2];
    if (percentage >= 60) return crushResults[3];
    if (percentage >= 50) return crushResults[4];
    if (percentage >= 40) return crushResults[5];
    if (percentage >= 30) return crushResults[6];
    if (percentage >= 20) return crushResults[7];
    if (percentage >= 10) return crushResults[8];
    return crushResults[9];
  };

  const handleCalculate = () => {
    if (!yourName.trim() || !crushName.trim()) return;
    
    setIsCalculating(true);
    
    setTimeout(() => {
      const percentage = calculateCrushCompatibility();
      const crushResult = getResultByPercentage(percentage);
      setResult(crushResult);
      setIsCalculating(false);
    }, 2000);
  };

  const resetCalculator = () => {
    setYourName("");
    setCrushName("");
    setYourAge("");
    setCrushAge("");
    setYourPersonality("");
    setCrushPersonality("");
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Eye className="h-8 w-8 text-pink-500 animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Crush Compatibility Calculator
          </h1>
          <Heart className="h-8 w-8 text-pink-500 animate-pulse" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover if your crush is worth pursuing! Our compatibility calculator analyzes names, 
          ages, and personalities to reveal your crush potential. 💕
        </p>
      </div>

      {/* Calculator Card */}
      <Card className="border-2 border-pink-200 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-pink-600">Tell Us About Your Crush</CardTitle>
          <CardDescription>
            Fill in the details and let our algorithm calculate your crush compatibility! ✨
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Your Info */}
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-700">Your Information</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="yourName" className="text-sm font-medium">
                    Your Name
                  </Label>
                  <Input
                    id="yourName"
                    type="text"
                    placeholder="Enter your name..."
                    value={yourName}
                    onChange={(e) => setYourName(e.target.value)}
                    className="border-2 border-blue-200 focus:border-blue-400"
                  />
                </div>
                <div>
                  <Label htmlFor="yourAge" className="text-sm font-medium">
                    Your Age
                  </Label>
                  <Input
                    id="yourAge"
                    type="number"
                    placeholder="Enter your age..."
                    value={yourAge}
                    onChange={(e) => setYourAge(e.target.value)}
                    className="border-2 border-blue-200 focus:border-blue-400"
                  />
                </div>
                <div>
                  <Label htmlFor="yourPersonality" className="text-sm font-medium">
                    Your Personality
                  </Label>
                  <Select value={yourPersonality} onValueChange={setYourPersonality}>
                    <SelectTrigger className="border-2 border-blue-200 focus:border-blue-400">
                      <SelectValue placeholder="Select your personality type" />
                    </SelectTrigger>
                    <SelectContent>
                      {personalityTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Crush Info */}
            <div className="space-y-4 p-4 bg-pink-50 rounded-lg">
              <h3 className="text-lg font-semibold text-pink-700">Your Crush's Information</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="crushName" className="text-sm font-medium">
                    Crush's Name
                  </Label>
                  <Input
                    id="crushName"
                    type="text"
                    placeholder="Enter crush's name..."
                    value={crushName}
                    onChange={(e) => setCrushName(e.target.value)}
                    className="border-2 border-pink-200 focus:border-pink-400"
                  />
                </div>
                <div>
                  <Label htmlFor="crushAge" className="text-sm font-medium">
                    Crush's Age
                  </Label>
                  <Input
                    id="crushAge"
                    type="number"
                    placeholder="Enter crush's age..."
                    value={crushAge}
                    onChange={(e) => setCrushAge(e.target.value)}
                    className="border-2 border-pink-200 focus:border-pink-400"
                  />
                </div>
                <div>
                  <Label htmlFor="crushPersonality" className="text-sm font-medium">
                    Crush's Personality
                  </Label>
                  <Select value={crushPersonality} onValueChange={setCrushPersonality}>
                    <SelectTrigger className="border-2 border-pink-200 focus:border-pink-400">
                      <SelectValue placeholder="Select crush's personality type" />
                    </SelectTrigger>
                    <SelectContent>
                      {personalityTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={handleCalculate}
              disabled={!yourName.trim() || !crushName.trim() || isCalculating}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {isCalculating ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Analyzing Crush...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Calculate Crush %</span>
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
                  {result.crushLevel}
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

                {/* Advice */}
                <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
                  <h3 className="text-xl font-semibold text-pink-700 mb-2">
                    💡 Crush Advice
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
              onClick={() => router.push('/category/fun-games/love-percentage-calculator')}
            >
              <Heart className="h-6 w-6 text-pink-500" />
              <span className="text-sm font-medium">Love Percentage</span>
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
            💕 Crush Compatibility Calculator - Is Your Crush Worth It?
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            Our Crush Compatibility Calculator is the perfect tool for analyzing your romantic potential with someone special. 
            Whether you're wondering about a new crush or testing compatibility with someone you've been eyeing, 
            this calculator provides detailed insights based on names, ages, and personality types.
          </p>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            How Our Crush Calculator Works
          </h3>
          <p className="text-gray-700 mb-4">
            Our advanced algorithm analyzes multiple factors including name compatibility, age differences, 
            personality type matching, and special character patterns to calculate your crush compatibility percentage. 
            The results are both entertaining and surprisingly insightful!
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Perfect For:
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Testing compatibility with your current crush</li>
            <li>Analyzing romantic potential with friends</li>
            <li>Fun party games and ice-breaker activities</li>
            <li>Understanding personality compatibility</li>
            <li>Entertainment and relationship exploration</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Crush Calculator Features
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Comprehensive compatibility analysis</li>
            <li>Personality type matching system</li>
            <li>Age compatibility considerations</li>
            <li>Humorous and entertaining results</li>
            <li>Detailed crush level classifications</li>
            <li>Personalized advice and fun facts</li>
            <li>Beautiful animations and visual effects</li>
            <li>Mobile-friendly responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CrushCompatibilityCalculator;
