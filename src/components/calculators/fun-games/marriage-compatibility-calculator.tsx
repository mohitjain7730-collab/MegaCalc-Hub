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
import { Heart, Eye, Sparkles, Star, Flame, Coffee, Music, Camera, Gamepad2, Zap, Circle } from "lucide-react";

interface MarriageResult {
  percentage: number;
  title: string;
  description: string;
  emoji: string;
  color: string;
  advice: string;
  funFact: string;
  compatibilityType: string;
  marriageAnalysis: string;
  relationshipStrength: string;
}

const marriageResults: MarriageResult[] = [
  {
    percentage: 95,
    title: "Perfect Marriage Match! 💍",
    description: "Your marriage compatibility is off the charts! This is the kind of union that legends are made of.",
    emoji: "💍",
    color: "text-pink-500",
    advice: "This marriage has incredible potential - cherish and nurture this special bond!",
    funFact: "95% marriage compatibility occurs in only 0.1% of couples!",
    compatibilityType: "PERFECT MARRIAGE MATCH",
    marriageAnalysis: "Your compatibility creates a perfect foundation for a lasting and fulfilling marriage.",
    relationshipStrength: "Exceptional"
  },
  {
    percentage: 85,
    title: "Excellent Marriage Potential! 🌟",
    description: "Your marriage compatibility is excellent! This partnership has all the ingredients for success.",
    emoji: "🌟",
    color: "text-purple-500",
    advice: "This marriage has great potential - focus on communication and mutual respect!",
    funFact: "85% marriage compatibility often leads to the most harmonious marriages!",
    compatibilityType: "EXCELLENT MARRIAGE POTENTIAL",
    marriageAnalysis: "Your compatibility suggests a strong foundation for a happy and successful marriage.",
    relationshipStrength: "Very Strong"
  },
  {
    percentage: 75,
    title: "Great Marriage Foundation! 🏠",
    description: "Your marriage compatibility is solid! There's a strong foundation for a successful partnership.",
    emoji: "🏠",
    color: "text-blue-500",
    advice: "This marriage has good potential - work together to build on your strengths!",
    funFact: "75% marriage compatibility is the sweet spot for lasting marriages!",
    compatibilityType: "GREAT MARRIAGE FOUNDATION",
    marriageAnalysis: "Your compatibility provides a solid base for building a successful marriage together.",
    relationshipStrength: "Strong"
  },
  {
    percentage: 65,
    title: "Good Marriage Potential! 🤝",
    description: "Your marriage compatibility is good! With effort and understanding, this could work well.",
    emoji: "🤝",
    color: "text-green-500",
    advice: "Focus on communication and compromise - this marriage has real potential!",
    funFact: "65% marriage compatibility often leads to stable and reliable marriages!",
    compatibilityType: "GOOD MARRIAGE POTENTIAL",
    marriageAnalysis: "Your compatibility suggests a promising foundation for a successful marriage.",
    relationshipStrength: "Good"
  },
  {
    percentage: 55,
    title: "Promising Marriage! 🌱",
    description: "Your marriage compatibility shows promise! There's potential here with the right approach.",
    emoji: "🌱",
    color: "text-orange-500",
    advice: "Take time to understand each other better - this marriage could blossom beautifully!",
    funFact: "55% marriage compatibility often leads to the most creative and unique marriages!",
    compatibilityType: "PROMISING MARRIAGE",
    marriageAnalysis: "Your compatibility has interesting dynamics that could lead to a unique partnership.",
    relationshipStrength: "Promising"
  },
  {
    percentage: 45,
    title: "Challenging Marriage! ⚡",
    description: "Your marriage compatibility presents challenges, but that can lead to growth and strength.",
    emoji: "⚡",
    color: "text-yellow-500",
    advice: "Embrace the challenges as opportunities for growth - this marriage could be very rewarding!",
    funFact: "45% marriage compatibility often leads to the most dynamic and exciting marriages!",
    compatibilityType: "CHALLENGING MARRIAGE",
    marriageAnalysis: "Your compatibility suggests a dynamic relationship that will require effort but could be very rewarding.",
    relationshipStrength: "Challenging"
  },
  {
    percentage: 35,
    title: "Complex Marriage! 🔮",
    description: "Your marriage compatibility is complex! There are many layers to explore and understand.",
    emoji: "🔮",
    color: "text-indigo-500",
    advice: "Take time to explore your differences - this marriage could surprise you!",
    funFact: "35% marriage compatibility often leads to the most surprising and unexpected marriages!",
    compatibilityType: "COMPLEX MARRIAGE",
    marriageAnalysis: "Your compatibility has many complex layers that could lead to a deep and meaningful partnership.",
    relationshipStrength: "Complex"
  },
  {
    percentage: 25,
    title: "Unique Marriage! 🌟",
    description: "Your marriage compatibility is unique! This partnership will be one of a kind.",
    emoji: "🌟",
    color: "text-gray-500",
    advice: "Celebrate your uniqueness - this marriage will be unlike any other!",
    funFact: "25% marriage compatibility often leads to the most memorable and distinctive marriages!",
    compatibilityType: "UNIQUE MARRIAGE",
    marriageAnalysis: "Your compatibility creates a unique dynamic that will make your marriage special.",
    relationshipStrength: "Unique"
  },
  {
    percentage: 15,
    title: "Adventure Marriage! 🗺️",
    description: "Your marriage compatibility is an adventure! This journey will be full of surprises.",
    emoji: "🗺️",
    color: "text-slate-500",
    advice: "Embrace the adventure - this marriage will be an exciting journey!",
    funFact: "15% marriage compatibility often leads to the most adventurous and exciting marriages!",
    compatibilityType: "ADVENTURE MARRIAGE",
    marriageAnalysis: "Your compatibility suggests an exciting and unpredictable journey together.",
    relationshipStrength: "Adventurous"
  },
  {
    percentage: 5,
    title: "Plot Twist Marriage! 🎭",
    description: "Well, this is unexpected! But hey, the best stories often have surprising beginnings.",
    emoji: "🎭",
    color: "text-slate-600",
    advice: "Sometimes the universe has a sense of humor - embrace the journey!",
    funFact: "5% marriage compatibility means you're both unique individuals!",
    compatibilityType: "PLOT TWIST MARRIAGE",
    marriageAnalysis: "Your compatibility creates an unexpected combination that defies conventional analysis.",
    relationshipStrength: "Unexpected"
  }
];

const MarriageCompatibilityCalculator: React.FC = () => {
  const router = useRouter();
  const [partner1Name, setPartner1Name] = useState("");
  const [partner2Name, setPartner2Name] = useState("");
  const [partner1Age, setPartner1Age] = useState("");
  const [partner2Age, setPartner2Age] = useState("");
  const [relationshipLength, setRelationshipLength] = useState("");
  const [sharedValues, setSharedValues] = useState("");
  const [communicationStyle, setCommunicationStyle] = useState("");
  const [result, setResult] = useState<MarriageResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const communicationStyles = [
    "Direct and Honest",
    "Gentle and Diplomatic",
    "Logical and Analytical",
    "Emotional and Expressive",
    "Quiet and Reserved",
    "Outgoing and Social",
    "Practical and Down-to-Earth",
    "Creative and Imaginative",
    "Supportive and Encouraging",
    "Challenging and Motivational"
  ];

  const calculateMarriageCompatibility = (): number => {
    if (!partner1Name || !partner2Name) return 0;
    
    let score = 0;
    
    // Base marriage compatibility score
    score += 30;
    
    // Enhanced name analysis
    const partner1Lower = partner1Name.toLowerCase().replace(/\s/g, '');
    const partner2Lower = partner2Name.toLowerCase().replace(/\s/g, '');
    const combined = partner1Lower + partner2Lower;
    
    // Name length compatibility
    const lengthDiff = Math.abs(partner1Lower.length - partner2Lower.length);
    if (lengthDiff === 0) score += 12;
    else if (lengthDiff <= 2) score += 8;
    else if (lengthDiff <= 4) score += 5;
    else if (lengthDiff <= 6) score += 3;
    
    // Vowel harmony analysis
    const vowels1 = partner1Lower.match(/[aeiou]/g)?.length || 0;
    const vowels2 = partner2Lower.match(/[aeiou]/g)?.length || 0;
    const vowelDiff = Math.abs(vowels1 - vowels2);
    if (vowelDiff === 0) score += 10;
    else if (vowelDiff <= 1) score += 6;
    else if (vowelDiff <= 2) score += 3;
    
    // Shared letters bonus
    const sharedLetters = new Set();
    for (const letter of partner1Lower) {
      if (partner2Lower.includes(letter)) {
        sharedLetters.add(letter);
      }
    }
    score += sharedLetters.size * 2.5;
    
    // Enhanced age compatibility for marriage
    if (partner1Age && partner2Age) {
      const age1 = parseInt(partner1Age);
      const age2 = parseInt(partner2Age);
      const ageDiff = Math.abs(age1 - age2);
      
      if (ageDiff === 0) score += 18;
      else if (ageDiff <= 2) score += 15;
      else if (ageDiff <= 5) score += 12;
      else if (ageDiff <= 8) score += 8;
      else if (ageDiff <= 12) score += 5;
      else if (ageDiff <= 18) score += 3;
      else if (ageDiff <= 25) score += 1;
      
      // Bonus for being in similar life stages
      if ((age1 >= 25 && age1 <= 35 && age2 >= 25 && age2 <= 35) ||
          (age1 >= 36 && age1 <= 45 && age2 >= 36 && age2 <= 45) ||
          (age1 >= 46 && age1 <= 60 && age2 >= 46 && age2 <= 60)) {
        score += 8;
      }
    }
    
    // Enhanced relationship length bonus
    if (relationshipLength) {
      const years = parseInt(relationshipLength);
      if (years >= 10) score += 25;
      else if (years >= 7) score += 20;
      else if (years >= 5) score += 15;
      else if (years >= 3) score += 12;
      else if (years >= 2) score += 8;
      else if (years >= 1) score += 5;
      else if (years >= 6) score += 3;
    }
    
    // Enhanced shared values bonus
    if (sharedValues) {
      const values = sharedValues.split(',').map(v => v.trim().toLowerCase());
      score += values.length * 2.5;
      
      // Bonus for having many shared values
      if (values.length >= 5) score += 8;
      else if (values.length >= 3) score += 5;
      else if (values.length >= 2) score += 3;
      
      // Bonus for important marriage values
      const importantValues = ['family', 'love', 'trust', 'respect', 'communication', 'loyalty', 'commitment', 'honesty', 'support', 'understanding'];
      const importantMatches = values.filter(v => importantValues.includes(v));
      score += importantMatches.length * 3;
    }
    
    // Enhanced communication style compatibility
    if (communicationStyle) {
      // Detailed communication compatibility matrix
      const communicationMatrix = {
        "Direct and Honest": {
          "Supportive and Encouraging": 18, "Gentle and Diplomatic": 12, "Logical and Analytical": 15,
          "Emotional and Expressive": 8, "Quiet and Reserved": 6, "Outgoing and Social": 10,
          "Practical and Down-to-Earth": 14, "Creative and Imaginative": 5, "Challenging and Motivational": 16
        },
        "Gentle and Diplomatic": {
          "Emotional and Expressive": 18, "Supportive and Encouraging": 16, "Quiet and Reserved": 14,
          "Direct and Honest": 12, "Logical and Analytical": 8, "Outgoing and Social": 10,
          "Practical and Down-to-Earth": 6, "Creative and Imaginative": 12, "Challenging and Motivational": 4
        },
        "Logical and Analytical": {
          "Practical and Down-to-Earth": 18, "Direct and Honest": 15, "Supportive and Encouraging": 12,
          "Gentle and Diplomatic": 8, "Emotional and Expressive": 6, "Quiet and Reserved": 10,
          "Outgoing and Social": 8, "Creative and Imaginative": 4, "Challenging and Motivational": 14
        },
        "Emotional and Expressive": {
          "Gentle and Diplomatic": 18, "Supportive and Encouraging": 16, "Creative and Imaginative": 14,
          "Direct and Honest": 8, "Logical and Analytical": 6, "Quiet and Reserved": 8,
          "Outgoing and Social": 12, "Practical and Down-to-Earth": 4, "Challenging and Motivational": 6
        },
        "Quiet and Reserved": {
          "Supportive and Encouraging": 16, "Gentle and Diplomatic": 14, "Logical and Analytical": 10,
          "Direct and Honest": 6, "Emotional and Expressive": 8, "Outgoing and Social": 4,
          "Practical and Down-to-Earth": 8, "Creative and Imaginative": 6, "Challenging and Motivational": 2
        },
        "Outgoing and Social": {
          "Challenging and Motivational": 18, "Emotional and Expressive": 12, "Direct and Honest": 10,
          "Gentle and Diplomatic": 10, "Logical and Analytical": 8, "Quiet and Reserved": 4,
          "Practical and Down-to-Earth": 6, "Creative and Imaginative": 10, "Supportive and Encouraging": 14
        },
        "Practical and Down-to-Earth": {
          "Logical and Analytical": 18, "Direct and Honest": 14, "Supportive and Encouraging": 12,
          "Gentle and Diplomatic": 6, "Emotional and Expressive": 4, "Quiet and Reserved": 8,
          "Outgoing and Social": 6, "Creative and Imaginative": 2, "Challenging and Motivational": 10
        },
        "Creative and Imaginative": {
          "Emotional and Expressive": 14, "Gentle and Diplomatic": 12, "Supportive and Encouraging": 10,
          "Direct and Honest": 5, "Logical and Analytical": 4, "Quiet and Reserved": 6,
          "Outgoing and Social": 10, "Practical and Down-to-Earth": 2, "Challenging and Motivational": 6
        },
        "Supportive and Encouraging": {
          "Direct and Honest": 18, "Gentle and Diplomatic": 16, "Emotional and Expressive": 16,
          "Logical and Analytical": 12, "Quiet and Reserved": 16, "Outgoing and Social": 14,
          "Practical and Down-to-Earth": 12, "Creative and Imaginative": 10, "Challenging and Motivational": 8
        },
        "Challenging and Motivational": {
          "Outgoing and Social": 18, "Direct and Honest": 16, "Logical and Analytical": 14,
          "Gentle and Diplomatic": 4, "Emotional and Expressive": 6, "Quiet and Reserved": 2,
          "Practical and Down-to-Earth": 10, "Creative and Imaginative": 6, "Supportive and Encouraging": 8
        }
      };
      
      const compatibility = communicationMatrix[communicationStyle as keyof typeof communicationMatrix] || 5;
      score += compatibility;
    }
    
    // Enhanced special letter bonuses for marriage
    if (combined.includes('l')) score += 5; // Love
    if (combined.includes('o')) score += 4; // Love
    if (combined.includes('v')) score += 5; // Love
    if (combined.includes('e')) score += 4; // Love
    if (combined.includes('m')) score += 4; // Marriage
    if (combined.includes('a')) score += 3; // Marriage
    if (combined.includes('r')) score += 3; // Marriage
    if (combined.includes('i')) score += 3; // Marriage
    if (combined.includes('g')) score += 3; // Marriage
    if (combined.includes('h')) score += 2; // Happiness
    if (combined.includes('p')) score += 2; // Partnership
    if (combined.includes('n')) score += 2; // Partnership
    
    // Name ending compatibility
    const ending1 = partner1Lower.slice(-2);
    const ending2 = partner2Lower.slice(-2);
    if (ending1 === ending2) score += 8;
    else if (ending1[1] === ending2[1]) score += 5;
    else if (ending1[0] === ending2[0]) score += 3;
    
    // Enhanced random factor for more variety
    const randomFactor = Math.random() * 25;
    score += randomFactor;
    
    return Math.max(5, Math.min(95, Math.round(score)));
  };

  const getResultByPercentage = (percentage: number): MarriageResult => {
    if (percentage >= 90) return marriageResults[0];
    if (percentage >= 80) return marriageResults[1];
    if (percentage >= 70) return marriageResults[2];
    if (percentage >= 60) return marriageResults[3];
    if (percentage >= 50) return marriageResults[4];
    if (percentage >= 40) return marriageResults[5];
    if (percentage >= 30) return marriageResults[6];
    if (percentage >= 20) return marriageResults[7];
    if (percentage >= 10) return marriageResults[8];
    return marriageResults[9];
  };

  const handleCalculate = () => {
    if (!partner1Name.trim() || !partner2Name.trim()) return;
    
    setIsCalculating(true);
    
    setTimeout(() => {
      const percentage = calculateMarriageCompatibility();
      const marriageResult = getResultByPercentage(percentage);
      setResult(marriageResult);
      setIsCalculating(false);
    }, 2000);
  };

  const resetCalculator = () => {
    setPartner1Name("");
    setPartner2Name("");
    setPartner1Age("");
    setPartner2Age("");
    setRelationshipLength("");
    setSharedValues("");
    setCommunicationStyle("");
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Circle className="h-8 w-8 text-pink-500 animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
            Marriage Compatibility Calculator
          </h1>
          <Heart className="h-8 w-8 text-pink-500 animate-pulse" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover the marriage compatibility between two partners! Our calculator analyzes 
          relationship factors, communication styles, and shared values to reveal your marriage potential. 💍
        </p>
      </div>

      {/* Calculator Card */}
      <Card className="border-2 border-pink-200 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-pink-600">Tell Us About Your Partnership</CardTitle>
          <CardDescription>
            Fill in the details and let our algorithm calculate your marriage compatibility! ✨
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Partner 1 Info */}
            <div className="space-y-4 p-4 bg-pink-50 rounded-lg">
              <h3 className="text-lg font-semibold text-pink-700">Partner 1</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="partner1Name" className="text-sm font-medium">
                    Name
                  </Label>
                  <Input
                    id="partner1Name"
                    type="text"
                    placeholder="Enter partner 1's name..."
                    value={partner1Name}
                    onChange={(e) => setPartner1Name(e.target.value)}
                    className="border-2 border-pink-200 focus:border-pink-400"
                  />
                </div>
                <div>
                  <Label htmlFor="partner1Age" className="text-sm font-medium">
                    Age
                  </Label>
                  <Input
                    id="partner1Age"
                    type="number"
                    placeholder="Enter age..."
                    value={partner1Age}
                    onChange={(e) => setPartner1Age(e.target.value)}
                    className="border-2 border-pink-200 focus:border-pink-400"
                  />
                </div>
              </div>
            </div>

            {/* Partner 2 Info */}
            <div className="space-y-4 p-4 bg-red-50 rounded-lg">
              <h3 className="text-lg font-semibold text-red-700">Partner 2</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="partner2Name" className="text-sm font-medium">
                    Name
                  </Label>
                  <Input
                    id="partner2Name"
                    type="text"
                    placeholder="Enter partner 2's name..."
                    value={partner2Name}
                    onChange={(e) => setPartner2Name(e.target.value)}
                    className="border-2 border-red-200 focus:border-red-400"
                  />
                </div>
                <div>
                  <Label htmlFor="partner2Age" className="text-sm font-medium">
                    Age
                  </Label>
                  <Input
                    id="partner2Age"
                    type="number"
                    placeholder="Enter age..."
                    value={partner2Age}
                    onChange={(e) => setPartner2Age(e.target.value)}
                    className="border-2 border-red-200 focus:border-red-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="relationshipLength" className="text-sm font-medium">
                  Relationship Length (years)
                </Label>
                <Input
                  id="relationshipLength"
                  type="number"
                  placeholder="How long have you been together?"
                  value={relationshipLength}
                  onChange={(e) => setRelationshipLength(e.target.value)}
                  className="border-2 border-purple-200 focus:border-purple-400"
                />
              </div>
              <div>
                <Label htmlFor="communicationStyle" className="text-sm font-medium">
                  Communication Style
                </Label>
                <Select value={communicationStyle} onValueChange={setCommunicationStyle}>
                  <SelectTrigger className="border-2 border-purple-200 focus:border-purple-400">
                    <SelectValue placeholder="Select communication style" />
                  </SelectTrigger>
                  <SelectContent>
                    {communicationStyles.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="sharedValues" className="text-sm font-medium">
                Shared Values (comma-separated)
              </Label>
              <Input
                id="sharedValues"
                type="text"
                placeholder="e.g., Family, Honesty, Adventure, Faith, Education..."
                value={sharedValues}
                onChange={(e) => setSharedValues(e.target.value)}
                className="border-2 border-green-200 focus:border-green-400"
              />
              <p className="text-sm text-muted-foreground mt-1">
                List values, beliefs, or goals you both share
              </p>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={handleCalculate}
              disabled={!partner1Name.trim() || !partner2Name.trim() || isCalculating}
              className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {isCalculating ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Analyzing Marriage...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Circle className="h-5 w-5" />
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
                <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white">
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

                {/* Relationship Strength */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h3 className="text-lg font-semibold text-red-700 mb-1">
                    💪 Relationship Strength
                  </h3>
                  <p className="text-red-600">
                    {result.relationshipStrength}
                  </p>
                </div>

                {/* Marriage Analysis */}
                <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
                  <h3 className="text-xl font-semibold text-pink-700 mb-2">
                    🔍 Marriage Analysis
                  </h3>
                  <p className="text-lg text-pink-600">
                    {result.marriageAnalysis}
                  </p>
                </div>

                {/* Advice */}
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="text-xl font-semibold text-purple-700 mb-2">
                    💡 Marriage Advice
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
            💍 Marriage Compatibility Calculator - Discover Your Perfect Marriage Match
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            Our Marriage Compatibility Calculator is the ultimate tool for analyzing marriage potential between two partners. 
            Whether you're considering marriage, already engaged, or just curious about your relationship's potential, 
            this calculator provides detailed insights based on relationship factors, communication styles, and shared values.
          </p>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            How Our Marriage Compatibility Calculator Works
          </h3>
          <p className="text-gray-700 mb-4">
            Our advanced algorithm analyzes multiple factors including name compatibility, age differences, 
            relationship length, communication styles, shared values, and personal characteristics to calculate your marriage compatibility percentage. 
            The results help you understand the potential for a successful and lasting marriage.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Perfect For:
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Testing marriage compatibility before engagement</li>
            <li>Analyzing relationship potential for couples</li>
            <li>Understanding relationship dynamics and strengths</li>
            <li>Fun activities and relationship exploration</li>
            <li>Entertainment and curiosity about marriage potential</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Marriage Compatibility Features
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Comprehensive marriage compatibility analysis</li>
            <li>Communication style assessment</li>
            <li>Shared values evaluation</li>
            <li>Relationship length consideration</li>
            <li>Age compatibility analysis</li>
            <li>Humorous and entertaining results</li>
            <li>Detailed marriage analysis explanations</li>
            <li>Personalized advice and fun facts</li>
            <li>Beautiful animations and visual effects</li>
            <li>Mobile-friendly responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MarriageCompatibilityCalculator;
