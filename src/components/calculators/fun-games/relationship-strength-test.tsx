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
import { Heart, Eye, Sparkles, Star, Flame, Coffee, Music, Camera, Gamepad2, Zap, Shield, CheckCircle } from "lucide-react";

interface RelationshipResult {
  percentage: number;
  title: string;
  description: string;
  emoji: string;
  color: string;
  advice: string;
  funFact: string;
  strengthLevel: string;
  relationshipAnalysis: string;
  strengths: string[];
  areasForImprovement: string[];
}

const relationshipResults: RelationshipResult[] = [
  {
    percentage: 95,
    title: "Unbreakable Bond! 💎",
    description: "Your relationship is incredibly strong! This is the kind of bond that legends are made of.",
    emoji: "💎",
    color: "text-pink-500",
    advice: "Your relationship is exceptional - continue nurturing this incredible bond!",
    funFact: "95% relationship strength is achieved by only 0.1% of couples!",
    strengthLevel: "UNBREAKABLE",
    relationshipAnalysis: "Your relationship demonstrates exceptional strength across all areas with outstanding communication, trust, and mutual respect.",
    strengths: ["Exceptional Communication", "Unwavering Trust", "Perfect Compatibility", "Strong Emotional Bond", "Shared Values"],
    areasForImprovement: ["Continue current practices", "Maintain the magic", "Keep growing together"]
  },
  {
    percentage: 85,
    title: "Rock Solid! 🪨",
    description: "Your relationship is very strong! This partnership has excellent foundations and great potential.",
    emoji: "🪨",
    color: "text-purple-500",
    advice: "Your relationship is strong - focus on maintaining and building on your strengths!",
    funFact: "85% relationship strength often leads to the most harmonious partnerships!",
    strengthLevel: "ROCK SOLID",
    relationshipAnalysis: "Your relationship shows excellent strength with strong communication, trust, and mutual understanding.",
    strengths: ["Strong Communication", "High Trust Level", "Good Compatibility", "Emotional Connection", "Shared Goals"],
    areasForImprovement: ["Minor communication improvements", "Continue building trust", "Explore new activities together"]
  },
  {
    percentage: 75,
    title: "Strong Foundation! 🏗️",
    description: "Your relationship has a solid foundation! There's good strength here with room for growth.",
    emoji: "🏗️",
    color: "text-blue-500",
    advice: "Your relationship has good strength - focus on building on your solid foundation!",
    funFact: "75% relationship strength is the sweet spot for lasting partnerships!",
    strengthLevel: "STRONG FOUNDATION",
    relationshipAnalysis: "Your relationship demonstrates good strength with solid communication and mutual respect.",
    strengths: ["Good Communication", "Solid Trust", "Decent Compatibility", "Emotional Support", "Shared Interests"],
    areasForImprovement: ["Enhance communication", "Build deeper trust", "Strengthen emotional connection"]
  },
  {
    percentage: 65,
    title: "Good Potential! 🌱",
    description: "Your relationship has good potential! With effort and understanding, this could grow stronger.",
    emoji: "🌱",
    color: "text-green-500",
    advice: "Focus on communication and mutual understanding - your relationship has real potential!",
    funFact: "65% relationship strength often leads to stable and reliable partnerships!",
    strengthLevel: "GOOD POTENTIAL",
    relationshipAnalysis: "Your relationship shows promising potential with room for growth in key areas.",
    strengths: ["Basic Communication", "Some Trust", "Potential Compatibility", "Emotional Awareness", "Shared Values"],
    areasForImprovement: ["Improve communication", "Build trust", "Strengthen compatibility", "Deepen emotional connection"]
  },
  {
    percentage: 55,
    title: "Growing Stronger! 📈",
    description: "Your relationship is growing! There's potential here with the right approach and effort.",
    emoji: "📈",
    color: "text-orange-500",
    advice: "Take time to understand each other better - your relationship could blossom beautifully!",
    funFact: "55% relationship strength often leads to the most creative and unique partnerships!",
    strengthLevel: "GROWING STRONGER",
    relationshipAnalysis: "Your relationship shows growth potential with some strengths and areas for development.",
    strengths: ["Developing Communication", "Building Trust", "Exploring Compatibility", "Growing Together", "Learning About Each Other"],
    areasForImprovement: ["Strengthen communication", "Build deeper trust", "Improve compatibility", "Enhance emotional connection"]
  },
  {
    percentage: 45,
    title: "Work in Progress! 🔧",
    description: "Your relationship is a work in progress! There are challenges, but also opportunities for growth.",
    emoji: "🔧",
    color: "text-yellow-500",
    advice: "Embrace the challenges as opportunities for growth - this relationship could be very rewarding!",
    funFact: "45% relationship strength often leads to the most dynamic and exciting partnerships!",
    strengthLevel: "WORK IN PROGRESS",
    relationshipAnalysis: "Your relationship has potential but requires effort and understanding to grow stronger.",
    strengths: ["Some Communication", "Basic Trust", "Potential Growth", "Mutual Interest", "Willingness to Try"],
    areasForImprovement: ["Improve communication significantly", "Build trust", "Strengthen compatibility", "Enhance emotional connection"]
  },
  {
    percentage: 35,
    title: "Needs Attention! ⚠️",
    description: "Your relationship needs attention! There are areas that require focus and improvement.",
    emoji: "⚠️",
    color: "text-red-500",
    advice: "Focus on the fundamentals - communication, trust, and mutual respect are key!",
    funFact: "35% relationship strength often leads to the most surprising transformations!",
    strengthLevel: "NEEDS ATTENTION",
    relationshipAnalysis: "Your relationship requires significant attention and effort to strengthen the foundation.",
    strengths: ["Basic Communication", "Some Trust", "Potential", "Interest", "Effort"],
    areasForImprovement: ["Major communication improvements", "Build trust", "Strengthen compatibility", "Enhance emotional connection", "Focus on fundamentals"]
  },
  {
    percentage: 25,
    title: "Challenging Times! 🌪️",
    description: "Your relationship is going through challenging times! But challenges can lead to growth and strength.",
    emoji: "🌪️",
    color: "text-gray-500",
    advice: "Focus on understanding and patience - every relationship has its challenges!",
    funFact: "25% relationship strength often leads to the most memorable and transformative experiences!",
    strengthLevel: "CHALLENGING TIMES",
    relationshipAnalysis: "Your relationship is facing challenges that require significant effort and understanding to overcome.",
    strengths: ["Some Communication", "Basic Trust", "Potential", "Interest", "Effort"],
    areasForImprovement: ["Major communication improvements", "Build trust", "Strengthen compatibility", "Enhance emotional connection", "Focus on fundamentals"]
  },
  {
    percentage: 15,
    title: "Rough Waters! 🌊",
    description: "Your relationship is in rough waters! But sometimes the strongest bonds are forged in difficult times.",
    emoji: "🌊",
    color: "text-slate-500",
    advice: "Focus on the basics - communication, respect, and understanding are essential!",
    funFact: "15% relationship strength often leads to the most unexpected and beautiful transformations!",
    strengthLevel: "ROUGH WATERS",
    relationshipAnalysis: "Your relationship is facing significant challenges that require major effort and understanding.",
    strengths: ["Some Communication", "Basic Trust", "Potential", "Interest", "Effort"],
    areasForImprovement: ["Major communication improvements", "Build trust", "Strengthen compatibility", "Enhance emotional connection", "Focus on fundamentals"]
  },
  {
    percentage: 5,
    title: "New Beginning! 🌅",
    description: "Your relationship is at a new beginning! Every journey starts somewhere, and this could be the start of something beautiful.",
    emoji: "🌅",
    color: "text-slate-600",
    advice: "Focus on building a strong foundation - every relationship starts somewhere!",
    funFact: "5% relationship strength means you're both unique individuals with potential to grow together!",
    strengthLevel: "NEW BEGINNING",
    relationshipAnalysis: "Your relationship is at the beginning stages with potential for growth and development.",
    strengths: ["Some Communication", "Basic Trust", "Potential", "Interest", "Effort"],
    areasForImprovement: ["Major communication improvements", "Build trust", "Strengthen compatibility", "Enhance emotional connection", "Focus on fundamentals"]
  }
];

const RelationshipStrengthTest: React.FC = () => {
  const router = useRouter();
  const [partner1Name, setPartner1Name] = useState("");
  const [partner2Name, setPartner2Name] = useState("");
  const [relationshipLength, setRelationshipLength] = useState("");
  const [communicationQuality, setCommunicationQuality] = useState("");
  const [trustLevel, setTrustLevel] = useState("");
  const [sharedValues, setSharedValues] = useState("");
  const [conflictResolution, setConflictResolution] = useState("");
  const [result, setResult] = useState<RelationshipResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const qualityLevels = [
    "Excellent", "Very Good", "Good", "Fair", "Poor", "Very Poor"
  ];

  const calculateRelationshipStrength = (): number => {
    if (!partner1Name || !partner2Name) return 0;
    
    let score = 0;
    
    // Base relationship strength score
    score += 25;
    
    // Enhanced name compatibility
    const partner1Lower = partner1Name.toLowerCase().replace(/\s/g, '');
    const partner2Lower = partner2Name.toLowerCase().replace(/\s/g, '');
    const combined = partner1Lower + partner2Lower;
    
    // Name length compatibility
    const lengthDiff = Math.abs(partner1Lower.length - partner2Lower.length);
    if (lengthDiff === 0) score += 8;
    else if (lengthDiff <= 2) score += 6;
    else if (lengthDiff <= 4) score += 4;
    else if (lengthDiff <= 6) score += 2;
    
    // Vowel harmony analysis
    const vowels1 = partner1Lower.match(/[aeiou]/g)?.length || 0;
    const vowels2 = partner2Lower.match(/[aeiou]/g)?.length || 0;
    const vowelDiff = Math.abs(vowels1 - vowels2);
    if (vowelDiff === 0) score += 6;
    else if (vowelDiff <= 1) score += 4;
    else if (vowelDiff <= 2) score += 2;
    
    // Shared letters bonus
    const sharedLetters = new Set();
    for (const letter of partner1Lower) {
      if (partner2Lower.includes(letter)) {
        sharedLetters.add(letter);
      }
    }
    score += sharedLetters.size * 1.5;
    
    // Enhanced relationship length bonus
    if (relationshipLength) {
      const years = parseInt(relationshipLength);
      if (years >= 15) score += 25;
      else if (years >= 10) score += 20;
      else if (years >= 7) score += 16;
      else if (years >= 5) score += 12;
      else if (years >= 3) score += 8;
      else if (years >= 2) score += 5;
      else if (years >= 1) score += 3;
      else if (years >= 6) score += 1;
    }
    
    // Enhanced communication quality scoring
    if (communicationQuality) {
      const communicationScores = {
        "Excellent": 22,
        "Very Good": 18,
        "Good": 14,
        "Fair": 8,
        "Poor": 2,
        "Very Poor": -3
      };
      score += communicationScores[communicationQuality as keyof typeof communicationScores] || 0;
    }
    
    // Enhanced trust level scoring
    if (trustLevel) {
      const trustScores = {
        "Excellent": 22,
        "Very Good": 18,
        "Good": 14,
        "Fair": 8,
        "Poor": 2,
        "Very Poor": -3
      };
      score += trustScores[trustLevel as keyof typeof trustScores] || 0;
    }
    
    // Enhanced shared values bonus
    if (sharedValues) {
      const values = sharedValues.split(',').map(v => v.trim().toLowerCase());
      score += values.length * 2.5;
      
      // Bonus for having many shared values
      if (values.length >= 5) score += 8;
      else if (values.length >= 3) score += 5;
      else if (values.length >= 2) score += 3;
      
      // Bonus for important relationship values
      const importantValues = ['love', 'trust', 'respect', 'communication', 'loyalty', 'commitment', 'honesty', 'support', 'understanding', 'patience', 'forgiveness', 'compromise'];
      const importantMatches = values.filter(v => importantValues.includes(v));
      score += importantMatches.length * 3;
    }
    
    // Enhanced conflict resolution scoring
    if (conflictResolution) {
      const conflictScores = {
        "Excellent": 18,
        "Very Good": 15,
        "Good": 12,
        "Fair": 6,
        "Poor": 1,
        "Very Poor": -2
      };
      score += conflictScores[conflictResolution as keyof typeof conflictScores] || 0;
    }
    
    // Relationship quality multiplier based on multiple factors
    let qualityMultiplier = 1.0;
    const qualityFactors = [communicationQuality, trustLevel, conflictResolution];
    const excellentCount = qualityFactors.filter(factor => factor === "Excellent").length;
    const veryGoodCount = qualityFactors.filter(factor => factor === "Very Good").length;
    const goodCount = qualityFactors.filter(factor => factor === "Good").length;
    const poorCount = qualityFactors.filter(factor => factor === "Poor" || factor === "Very Poor").length;
    
    if (excellentCount >= 2) qualityMultiplier = 1.3;
    else if (excellentCount >= 1 && veryGoodCount >= 1) qualityMultiplier = 1.2;
    else if (veryGoodCount >= 2) qualityMultiplier = 1.15;
    else if (goodCount >= 2) qualityMultiplier = 1.05;
    else if (poorCount >= 2) qualityMultiplier = 0.8;
    else if (poorCount >= 1) qualityMultiplier = 0.9;
    
    score *= qualityMultiplier;
    
    // Enhanced special letter bonuses for relationship strength
    if (combined.includes('l')) score += 4; // Love
    if (combined.includes('o')) score += 3; // Love
    if (combined.includes('v')) score += 4; // Love
    if (combined.includes('e')) score += 3; // Love
    if (combined.includes('r')) score += 3; // Relationship
    if (combined.includes('s')) score += 3; // Strong
    if (combined.includes('t')) score += 2; // Trust
    if (combined.includes('u')) score += 2; // Trust
    if (combined.includes('h')) score += 2; // Happiness
    if (combined.includes('p')) score += 2; // Partnership
    
    // Name ending compatibility
    const ending1 = partner1Lower.slice(-2);
    const ending2 = partner2Lower.slice(-2);
    if (ending1 === ending2) score += 5;
    else if (ending1[1] === ending2[1]) score += 3;
    else if (ending1[0] === ending2[0]) score += 2;
    
    // Enhanced random factor for more variety
    const randomFactor = Math.random() * 20;
    score += randomFactor;
    
    return Math.max(5, Math.min(95, Math.round(score)));
  };

  const getResultByPercentage = (percentage: number): RelationshipResult => {
    if (percentage >= 90) return relationshipResults[0];
    if (percentage >= 80) return relationshipResults[1];
    if (percentage >= 70) return relationshipResults[2];
    if (percentage >= 60) return relationshipResults[3];
    if (percentage >= 50) return relationshipResults[4];
    if (percentage >= 40) return relationshipResults[5];
    if (percentage >= 30) return relationshipResults[6];
    if (percentage >= 20) return relationshipResults[7];
    if (percentage >= 10) return relationshipResults[8];
    return relationshipResults[9];
  };

  const handleCalculate = () => {
    if (!partner1Name.trim() || !partner2Name.trim()) return;
    
    setIsCalculating(true);
    
    setTimeout(() => {
      const percentage = calculateRelationshipStrength();
      const relationshipResult = getResultByPercentage(percentage);
      setResult(relationshipResult);
      setIsCalculating(false);
    }, 2000);
  };

  const resetTest = () => {
    setPartner1Name("");
    setPartner2Name("");
    setRelationshipLength("");
    setCommunicationQuality("");
    setTrustLevel("");
    setSharedValues("");
    setConflictResolution("");
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Shield className="h-8 w-8 text-blue-500 animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Relationship Strength Test
          </h1>
          <Heart className="h-8 w-8 text-blue-500 animate-pulse" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover the strength of your relationship! Our comprehensive test analyzes communication, 
          trust, compatibility, and more to reveal your relationship's true strength. 💪
        </p>
      </div>

      {/* Test Card */}
      <Card className="border-2 border-blue-200 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-blue-600">Tell Us About Your Relationship</CardTitle>
          <CardDescription>
            Fill in the details and let our algorithm calculate your relationship strength! ✨
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Partner Names */}
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-700">Partner Information</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="partner1Name" className="text-sm font-medium">
                    Partner 1 Name
                  </Label>
                  <Input
                    id="partner1Name"
                    type="text"
                    placeholder="Enter partner 1's name..."
                    value={partner1Name}
                    onChange={(e) => setPartner1Name(e.target.value)}
                    className="border-2 border-blue-200 focus:border-blue-400"
                  />
                </div>
                <div>
                  <Label htmlFor="partner2Name" className="text-sm font-medium">
                    Partner 2 Name
                  </Label>
                  <Input
                    id="partner2Name"
                    type="text"
                    placeholder="Enter partner 2's name..."
                    value={partner2Name}
                    onChange={(e) => setPartner2Name(e.target.value)}
                    className="border-2 border-blue-200 focus:border-blue-400"
                  />
                </div>
              </div>
            </div>

            {/* Relationship Details */}
            <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-700">Relationship Details</h3>
              <div className="space-y-3">
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
                  <Label htmlFor="sharedValues" className="text-sm font-medium">
                    Shared Values (comma-separated)
                  </Label>
                  <Input
                    id="sharedValues"
                    type="text"
                    placeholder="e.g., Family, Honesty, Adventure, Faith..."
                    value={sharedValues}
                    onChange={(e) => setSharedValues(e.target.value)}
                    className="border-2 border-purple-200 focus:border-purple-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quality Assessments */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Relationship Quality Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="communicationQuality" className="text-sm font-medium">
                  Communication Quality
                </Label>
                <Select value={communicationQuality} onValueChange={setCommunicationQuality}>
                  <SelectTrigger className="border-2 border-green-200 focus:border-green-400">
                    <SelectValue placeholder="Select communication quality" />
                  </SelectTrigger>
                  <SelectContent>
                    {qualityLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="trustLevel" className="text-sm font-medium">
                  Trust Level
                </Label>
                <Select value={trustLevel} onValueChange={setTrustLevel}>
                  <SelectTrigger className="border-2 border-green-200 focus:border-green-400">
                    <SelectValue placeholder="Select trust level" />
                  </SelectTrigger>
                  <SelectContent>
                    {qualityLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="conflictResolution" className="text-sm font-medium">
                  Conflict Resolution
                </Label>
                <Select value={conflictResolution} onValueChange={setConflictResolution}>
                  <SelectTrigger className="border-2 border-green-200 focus:border-green-400">
                    <SelectValue placeholder="Select conflict resolution" />
                  </SelectTrigger>
                  <SelectContent>
                    {qualityLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={handleCalculate}
              disabled={!partner1Name.trim() || !partner2Name.trim() || isCalculating}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {isCalculating ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Analyzing Relationship...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Calculate Strength</span>
                </div>
              )}
            </Button>
            <Button
              onClick={resetTest}
              variant="outline"
              className="px-6 py-3 text-lg border-2 border-blue-200 hover:border-blue-400 rounded-full"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Result Card */}
      {result && (
        <Card className="border-2 border-blue-300 shadow-xl animate-in slide-in-from-bottom-4 duration-500">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* Percentage Display */}
              <div className="relative">
                <div className="text-8xl font-bold text-blue-500 mb-4 animate-bounce">
                  {result.percentage}%
                </div>
                <div className="text-6xl mb-4">{result.emoji}</div>
              </div>

              {/* Result Details */}
              <div className="space-y-4">
                <h2 className={`text-3xl font-bold ${result.color}`}>
                  {result.title}
                </h2>
                <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {result.strengthLevel}
                </Badge>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  {result.description}
                </p>
                
                {/* Progress Bar */}
                <div className="w-full max-w-md mx-auto">
                  <Progress 
                    value={result.percentage} 
                    className="h-4 bg-blue-100"
                  />
                </div>

                {/* Relationship Analysis */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-xl font-semibold text-blue-700 mb-2">
                    🔍 Relationship Analysis
                  </h3>
                  <p className="text-lg text-blue-600">
                    {result.relationshipAnalysis}
                  </p>
                </div>

                {/* Strengths */}
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-xl font-semibold text-green-700 mb-3">
                    💪 Relationship Strengths
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {result.strengths.map((strength, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-600">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Areas for Improvement */}
                <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                  <h3 className="text-xl font-semibold text-orange-700 mb-3">
                    📈 Areas for Improvement
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {result.areasForImprovement.map((area, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="h-4 w-4 rounded-full bg-orange-500"></div>
                        <span className="text-orange-600">{area}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advice */}
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="text-xl font-semibold text-purple-700 mb-2">
                    💡 Relationship Advice
                  </h3>
                  <p className="text-lg text-purple-600">
                    {result.advice}
                  </p>
                </div>

                {/* Fun Fact */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg border border-indigo-200">
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
            💪 Relationship Strength Test - Discover Your Relationship's True Power
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            Our Relationship Strength Test is the ultimate tool for analyzing the strength and health of your relationship. 
            Whether you're curious about your relationship's current state or want to identify areas for improvement, 
            this comprehensive test provides detailed insights based on communication, trust, compatibility, and more.
          </p>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            How Our Relationship Strength Test Works
          </h3>
          <p className="text-gray-700 mb-4">
            Our advanced algorithm analyzes multiple factors including communication quality, trust level, 
            conflict resolution skills, shared values, relationship length, and compatibility to calculate your relationship strength percentage. 
            The results help you understand your relationship's current state and areas for improvement.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Perfect For:
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Testing relationship strength and health</li>
            <li>Identifying areas for improvement</li>
            <li>Understanding relationship dynamics</li>
            <li>Fun activities and relationship exploration</li>
            <li>Curiosity about relationship potential</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Relationship Strength Test Features
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Comprehensive relationship analysis</li>
            <li>Communication quality assessment</li>
            <li>Trust level evaluation</li>
            <li>Conflict resolution analysis</li>
            <li>Shared values consideration</li>
            <li>Relationship length factors</li>
            <li>Detailed strength and improvement areas</li>
            <li>Personalized advice and recommendations</li>
            <li>Beautiful animations and visual effects</li>
            <li>Mobile-friendly responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RelationshipStrengthTest;
