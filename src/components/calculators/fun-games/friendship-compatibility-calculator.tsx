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
import { Coffee, Heart, Eye, Sparkles, Star, Flame, Music, Camera, Gamepad2, Zap, Users } from "lucide-react";

interface FriendshipResult {
  percentage: number;
  title: string;
  description: string;
  emoji: string;
  color: string;
  advice: string;
  funFact: string;
  friendshipLevel: string;
}

const friendshipResults: FriendshipResult[] = [
  {
    percentage: 95,
    title: "Best Friends Forever! 🤝",
    description: "This is friendship goals! You two are practically soulmates in the friend zone!",
    emoji: "🤝",
    color: "text-blue-500",
    advice: "Cherish this friendship - it's the kind that lasts a lifetime!",
    funFact: "95% friendship compatibility is rarer than finding a four-leaf clover!",
    friendshipLevel: "BFF LEVEL"
  },
  {
    percentage: 85,
    title: "Amazing Friends! 🌟",
    description: "You two make an incredible team! This friendship has serious potential for greatness.",
    emoji: "🌟",
    color: "text-indigo-500",
    advice: "Keep investing in this friendship - it's worth every moment!",
    funFact: "85% friendship compatibility often leads to lifelong bonds!",
    friendshipLevel: "AMAZING FRIENDS"
  },
  {
    percentage: 75,
    title: "Great Buddies! 🎉",
    description: "You two click really well! This friendship is solid and full of good vibes.",
    emoji: "🎉",
    color: "text-green-500",
    advice: "Keep being awesome together - this friendship is going places!",
    funFact: "75% friendship compatibility is the sweet spot for lasting friendships!",
    friendshipLevel: "GREAT BUDDIES"
  },
  {
    percentage: 65,
    title: "Good Friends! 😊",
    description: "You two get along really well! There's definitely a solid friendship foundation here.",
    emoji: "😊",
    color: "text-emerald-500",
    advice: "Focus on shared interests and activities to strengthen your bond!",
    funFact: "65% friendship compatibility often leads to the most reliable friendships!",
    friendshipLevel: "GOOD FRIENDS"
  },
  {
    percentage: 55,
    title: "Potential Friends! 🌱",
    description: "There's potential here! With some effort, this could grow into a great friendship.",
    emoji: "🌱",
    color: "text-yellow-500",
    advice: "Spend more time together and find common ground - friendship takes time!",
    funFact: "55% friendship compatibility is where most great friendships start!",
    friendshipLevel: "POTENTIAL FRIENDS"
  },
  {
    percentage: 45,
    title: "Acquaintances Plus! 👋",
    description: "You're more than just acquaintances! There's something there worth exploring.",
    emoji: "👋",
    color: "text-orange-500",
    advice: "Keep an open mind and see where this connection leads!",
    funFact: "45% friendship compatibility can surprise you with unexpected depth!",
    friendshipLevel: "ACQUAINTANCES PLUS"
  },
  {
    percentage: 35,
    title: "Friendly Vibes! 😄",
    description: "There are friendly vibes here! You enjoy each other's company and that's nice.",
    emoji: "😄",
    color: "text-purple-500",
    advice: "Enjoy the casual friendship - sometimes that's exactly what you need!",
    funFact: "35% friendship compatibility often leads to the most relaxed friendships!",
    friendshipLevel: "FRIENDLY VIBES"
  },
  {
    percentage: 25,
    title: "Nice People! 👍",
    description: "You're both nice people! There's mutual respect and that's a good start.",
    emoji: "👍",
    color: "text-gray-500",
    advice: "Keep being kind to each other - every friendship starts somewhere!",
    funFact: "25% friendship compatibility can still lead to meaningful connections!",
    friendshipLevel: "NICE PEOPLE"
  },
  {
    percentage: 15,
    title: "Different Worlds! 🌍",
    description: "You're from different worlds, but that can be interesting! Opposites sometimes attract.",
    emoji: "🌍",
    color: "text-slate-500",
    advice: "Embrace your differences - they might be your greatest strength!",
    funFact: "15% friendship compatibility often leads to the most interesting friendships!",
    friendshipLevel: "DIFFERENT WORLDS"
  },
  {
    percentage: 5,
    title: "Unique Connection! 🎭",
    description: "This is a unique connection! Sometimes the most unexpected friendships are the best.",
    emoji: "🎭",
    color: "text-slate-600",
    advice: "Sometimes the universe has a sense of humor - embrace the journey!",
    funFact: "5% friendship compatibility means you're both unique individuals!",
    friendshipLevel: "UNIQUE CONNECTION"
  }
];

const FriendshipCompatibilityCalculator: React.FC = () => {
  const router = useRouter();
  const [friend1Name, setFriend1Name] = useState("");
  const [friend2Name, setFriend2Name] = useState("");
  const [friend1Age, setFriend1Age] = useState("");
  const [friend2Age, setFriend2Age] = useState("");
  const [friend1Personality, setFriend1Personality] = useState("");
  const [friend2Personality, setFriend2Personality] = useState("");
  const [sharedInterests, setSharedInterests] = useState("");
  const [result, setResult] = useState<FriendshipResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const personalityTypes = [
    "Social Butterfly",
    "Quiet Observer",
    "Adventurous Explorer",
    "Creative Artist",
    "Logical Thinker",
    "Energetic Athlete",
    "Caring Helper",
    "Funny Comedian",
    "Mysterious Soul",
    "Practical Planner"
  ];

  const interestCategories = [
    "Sports & Fitness",
    "Music & Arts",
    "Technology & Gaming",
    "Travel & Adventure",
    "Food & Cooking",
    "Books & Learning",
    "Movies & TV",
    "Nature & Outdoors",
    "Fashion & Beauty",
    "Science & Discovery"
  ];

  const calculateFriendshipCompatibility = (): number => {
    if (!friend1Name || !friend2Name) return 0;
    
    let score = 0;
    
    // Base friendship compatibility score
    score += 35;
    
    // Name analysis
    const friend1Lower = friend1Name.toLowerCase().replace(/\s/g, '');
    const friend2Lower = friend2Name.toLowerCase().replace(/\s/g, '');
    const combined = friend1Lower + friend2Lower;
    
    // Name length compatibility
    const lengthDiff = Math.abs(friend1Lower.length - friend2Lower.length);
    if (lengthDiff === 0) score += 10;
    else if (lengthDiff <= 2) score += 7;
    else if (lengthDiff <= 4) score += 4;
    else if (lengthDiff <= 6) score += 2;
    
    // Vowel harmony analysis
    const vowels1 = friend1Lower.match(/[aeiou]/g)?.length || 0;
    const vowels2 = friend2Lower.match(/[aeiou]/g)?.length || 0;
    const vowelDiff = Math.abs(vowels1 - vowels2);
    if (vowelDiff === 0) score += 8;
    else if (vowelDiff <= 1) score += 5;
    else if (vowelDiff <= 2) score += 3;
    
    // Shared letters bonus
    const sharedLetters = new Set();
    for (const letter of friend1Lower) {
      if (friend2Lower.includes(letter)) {
        sharedLetters.add(letter);
      }
    }
    score += sharedLetters.size * 2;
    
    // Enhanced age compatibility (friends can have bigger age gaps)
    if (friend1Age && friend2Age) {
      const age1 = parseInt(friend1Age);
      const age2 = parseInt(friend2Age);
      const ageDiff = Math.abs(age1 - age2);
      
      if (ageDiff === 0) score += 18;
      else if (ageDiff <= 2) score += 15;
      else if (ageDiff <= 5) score += 12;
      else if (ageDiff <= 8) score += 10;
      else if (ageDiff <= 12) score += 8;
      else if (ageDiff <= 18) score += 6;
      else if (ageDiff <= 25) score += 4;
      else if (ageDiff <= 35) score += 2;
      else score += 1;
      
      // Bonus for being in similar life stages
      if ((age1 >= 18 && age1 <= 25 && age2 >= 18 && age2 <= 25) ||
          (age1 >= 26 && age1 <= 35 && age2 >= 26 && age2 <= 35) ||
          (age1 >= 36 && age1 <= 50 && age2 >= 36 && age2 <= 50) ||
          (age1 >= 51 && age2 >= 51)) {
        score += 5;
      }
    }
    
    // Enhanced personality compatibility for friendships
    if (friend1Personality && friend2Personality) {
      if (friend1Personality === friend2Personality) score += 20;
      else {
        // Detailed friendship compatibility matrix
        const friendshipMatrix = {
          "Social Butterfly": {
            "Funny Comedian": 18, "Caring Helper": 15, "Adventurous Explorer": 12,
            "Creative Artist": 10, "Energetic Athlete": 8, "Romantic Dreamer": 6,
            "Practical Planner": 5, "Logical Thinker": 4, "Quiet Observer": 3, "Mysterious Soul": 2
          },
          "Quiet Observer": {
            "Mysterious Soul": 16, "Logical Thinker": 12, "Practical Planner": 10,
            "Creative Artist": 8, "Caring Helper": 6, "Romantic Dreamer": 5,
            "Adventurous Explorer": 4, "Energetic Athlete": 3, "Funny Comedian": 4, "Social Butterfly": 3
          },
          "Adventurous Explorer": {
            "Energetic Athlete": 16, "Creative Artist": 14, "Social Butterfly": 12,
            "Funny Comedian": 8, "Caring Helper": 6, "Romantic Dreamer": 5,
            "Practical Planner": 4, "Logical Thinker": 3, "Quiet Observer": 4, "Mysterious Soul": 3
          },
          "Creative Artist": {
            "Adventurous Explorer": 14, "Romantic Dreamer": 12, "Mysterious Soul": 10,
            "Social Butterfly": 10, "Caring Helper": 8, "Quiet Observer": 8,
            "Funny Comedian": 6, "Logical Thinker": 4, "Energetic Athlete": 3, "Practical Planner": 2
          },
          "Logical Thinker": {
            "Practical Planner": 16, "Quiet Observer": 12, "Mysterious Soul": 8,
            "Caring Helper": 6, "Social Butterfly": 4, "Funny Comedian": 5,
            "Adventurous Explorer": 3, "Energetic Athlete": 2, "Romantic Dreamer": 3, "Creative Artist": 4
          },
          "Energetic Athlete": {
            "Adventurous Explorer": 16, "Social Butterfly": 8, "Funny Comedian": 6,
            "Practical Planner": 5, "Caring Helper": 4, "Creative Artist": 3,
            "Logical Thinker": 2, "Quiet Observer": 3, "Romantic Dreamer": 4, "Mysterious Soul": 3
          },
          "Caring Helper": {
            "Social Butterfly": 15, "Practical Planner": 12, "Creative Artist": 8,
            "Quiet Observer": 6, "Romantic Dreamer": 6, "Adventurous Explorer": 6,
            "Logical Thinker": 6, "Funny Comedian": 5, "Energetic Athlete": 4, "Mysterious Soul": 4
          },
          "Practical Planner": {
            "Logical Thinker": 16, "Caring Helper": 12, "Quiet Observer": 10,
            "Energetic Athlete": 5, "Social Butterfly": 5, "Adventurous Explorer": 4,
            "Creative Artist": 2, "Romantic Dreamer": 3, "Mysterious Soul": 4, "Funny Comedian": 3
          },
          "Mysterious Soul": {
            "Quiet Observer": 16, "Creative Artist": 10, "Romantic Dreamer": 8,
            "Logical Thinker": 8, "Caring Helper": 4, "Adventurous Explorer": 3,
            "Practical Planner": 4, "Social Butterfly": 2, "Energetic Athlete": 3, "Funny Comedian": 2
          },
          "Funny Comedian": {
            "Social Butterfly": 18, "Adventurous Explorer": 8, "Energetic Athlete": 6,
            "Creative Artist": 6, "Caring Helper": 5, "Romantic Dreamer": 4,
            "Logical Thinker": 5, "Quiet Observer": 4, "Practical Planner": 3, "Mysterious Soul": 2
          }
        };
        
        const compatibility = friendshipMatrix[friend1Personality as keyof typeof friendshipMatrix]?.[friend2Personality as keyof typeof friendshipMatrix] || 4;
        score += compatibility;
      }
    }
    
    // Enhanced shared interests bonus
    if (sharedInterests) {
      const interests = sharedInterests.split(',').map(i => i.trim().toLowerCase());
      score += interests.length * 2.5;
      
      // Bonus for having many shared interests
      if (interests.length >= 5) score += 5;
      else if (interests.length >= 3) score += 3;
      else if (interests.length >= 2) score += 2;
    }
    
    // Special letter bonuses for friendship
    if (combined.includes('f')) score += 4; // Friend
    if (combined.includes('r')) score += 3; // Friend
    if (combined.includes('i')) score += 3; // Friend
    if (combined.includes('e')) score += 3; // Friend
    if (combined.includes('n')) score += 3; // Friend
    if (combined.includes('d')) score += 3; // Friend
    if (combined.includes('s')) score += 2; // Support
    if (combined.includes('u')) score += 2; // Support
    if (combined.includes('p')) score += 2; // Support
    if (combined.includes('o')) score += 2; // Support
    if (combined.includes('r')) score += 2; // Support
    if (combined.includes('t')) score += 2; // Support
    
    // Name ending compatibility
    const ending1 = friend1Lower.slice(-2);
    const ending2 = friend2Lower.slice(-2);
    if (ending1 === ending2) score += 6;
    else if (ending1[1] === ending2[1]) score += 4;
    else if (ending1[0] === ending2[0]) score += 2;
    
    // Enhanced random factor for more variety
    const randomFactor = Math.random() * 25;
    score += randomFactor;
    
    return Math.max(5, Math.min(95, Math.round(score)));
  };

  const getResultByPercentage = (percentage: number): FriendshipResult => {
    if (percentage >= 90) return friendshipResults[0];
    if (percentage >= 80) return friendshipResults[1];
    if (percentage >= 70) return friendshipResults[2];
    if (percentage >= 60) return friendshipResults[3];
    if (percentage >= 50) return friendshipResults[4];
    if (percentage >= 40) return friendshipResults[5];
    if (percentage >= 30) return friendshipResults[6];
    if (percentage >= 20) return friendshipResults[7];
    if (percentage >= 10) return friendshipResults[8];
    return friendshipResults[9];
  };

  const handleCalculate = () => {
    if (!friend1Name.trim() || !friend2Name.trim()) return;
    
    setIsCalculating(true);
    
    setTimeout(() => {
      const percentage = calculateFriendshipCompatibility();
      const friendshipResult = getResultByPercentage(percentage);
      setResult(friendshipResult);
      setIsCalculating(false);
    }, 2000);
  };

  const resetCalculator = () => {
    setFriend1Name("");
    setFriend2Name("");
    setFriend1Age("");
    setFriend2Age("");
    setFriend1Personality("");
    setFriend2Personality("");
    setSharedInterests("");
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Users className="h-8 w-8 text-blue-500 animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
            Friendship Compatibility Calculator
          </h1>
          <Coffee className="h-8 w-8 text-blue-500 animate-pulse" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover the friendship potential between two people! Our calculator analyzes compatibility 
          to reveal if you're destined to be best friends. 🤝
        </p>
      </div>

      {/* Calculator Card */}
      <Card className="border-2 border-blue-200 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-blue-600">Tell Us About Your Friendship</CardTitle>
          <CardDescription>
            Fill in the details and let our algorithm calculate your friendship compatibility! ✨
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Friend 1 Info */}
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-700">First Friend</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="friend1Name" className="text-sm font-medium">
                    Name
                  </Label>
                  <Input
                    id="friend1Name"
                    type="text"
                    placeholder="Enter first friend's name..."
                    value={friend1Name}
                    onChange={(e) => setFriend1Name(e.target.value)}
                    className="border-2 border-blue-200 focus:border-blue-400"
                  />
                </div>
                <div>
                  <Label htmlFor="friend1Age" className="text-sm font-medium">
                    Age
                  </Label>
                  <Input
                    id="friend1Age"
                    type="number"
                    placeholder="Enter age..."
                    value={friend1Age}
                    onChange={(e) => setFriend1Age(e.target.value)}
                    className="border-2 border-blue-200 focus:border-blue-400"
                  />
                </div>
                <div>
                  <Label htmlFor="friend1Personality" className="text-sm font-medium">
                    Personality Type
                  </Label>
                  <Select value={friend1Personality} onValueChange={setFriend1Personality}>
                    <SelectTrigger className="border-2 border-blue-200 focus:border-blue-400">
                      <SelectValue placeholder="Select personality type" />
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

            {/* Friend 2 Info */}
            <div className="space-y-4 p-4 bg-green-50 rounded-lg">
              <h3 className="text-lg font-semibold text-green-700">Second Friend</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="friend2Name" className="text-sm font-medium">
                    Name
                  </Label>
                  <Input
                    id="friend2Name"
                    type="text"
                    placeholder="Enter second friend's name..."
                    value={friend2Name}
                    onChange={(e) => setFriend2Name(e.target.value)}
                    className="border-2 border-green-200 focus:border-green-400"
                  />
                </div>
                <div>
                  <Label htmlFor="friend2Age" className="text-sm font-medium">
                    Age
                  </Label>
                  <Input
                    id="friend2Age"
                    type="number"
                    placeholder="Enter age..."
                    value={friend2Age}
                    onChange={(e) => setFriend2Age(e.target.value)}
                    className="border-2 border-green-200 focus:border-green-400"
                  />
                </div>
                <div>
                  <Label htmlFor="friend2Personality" className="text-sm font-medium">
                    Personality Type
                  </Label>
                  <Select value={friend2Personality} onValueChange={setFriend2Personality}>
                    <SelectTrigger className="border-2 border-green-200 focus:border-green-400">
                      <SelectValue placeholder="Select personality type" />
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

          {/* Shared Interests */}
          <div className="space-y-3">
            <Label htmlFor="sharedInterests" className="text-lg font-semibold">
              Shared Interests (comma-separated)
            </Label>
            <Input
              id="sharedInterests"
              type="text"
              placeholder="e.g., Music, Sports, Gaming, Travel..."
              value={sharedInterests}
              onChange={(e) => setSharedInterests(e.target.value)}
              className="border-2 border-purple-200 focus:border-purple-400"
            />
            <p className="text-sm text-muted-foreground">
              List common interests, hobbies, or activities you both enjoy
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={handleCalculate}
              disabled={!friend1Name.trim() || !friend2Name.trim() || isCalculating}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {isCalculating ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Analyzing Friendship...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Calculate Friendship %</span>
                </div>
              )}
            </Button>
            <Button
              onClick={resetCalculator}
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
                <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white">
                  {result.friendshipLevel}
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

                {/* Advice */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-xl font-semibold text-blue-700 mb-2">
                    💡 Friendship Advice
                  </h3>
                  <p className="text-lg text-blue-600">
                    {result.advice}
                  </p>
                </div>

                {/* Fun Fact */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-xl font-semibold text-green-700 mb-2">
                    🎉 Fun Fact
                  </h3>
                  <p className="text-lg text-green-600">
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
              className="h-20 flex flex-col items-center justify-center space-y-2 border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50"
              onClick={() => router.push('/category/fun-games/zodiac-match-calculator')}
            >
              <Star className="h-6 w-6 text-indigo-500" />
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
            🤝 Friendship Compatibility Calculator - Find Your Perfect Friend
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            Our Friendship Compatibility Calculator is the ultimate tool for analyzing friendship potential between two people. 
            Whether you're curious about a new acquaintance or testing compatibility with an existing friend, 
            this calculator provides detailed insights based on names, ages, personalities, and shared interests.
          </p>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            How Our Friendship Calculator Works
          </h3>
          <p className="text-gray-700 mb-4">
            Our advanced algorithm analyzes multiple factors including name compatibility, age differences, 
            personality type matching, and shared interests to calculate your friendship compatibility percentage. 
            The results help you understand the potential for a lasting and meaningful friendship.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Perfect For:
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Testing friendship potential with new acquaintances</li>
            <li>Analyzing compatibility with existing friends</li>
            <li>Fun activities and ice-breaker conversations</li>
            <li>Understanding personality compatibility in friendships</li>
            <li>Entertainment and social exploration</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Friendship Calculator Features
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Comprehensive friendship compatibility analysis</li>
            <li>Personality type matching system</li>
            <li>Age compatibility considerations for friendships</li>
            <li>Shared interests analysis</li>
            <li>Humorous and entertaining results</li>
            <li>Detailed friendship level classifications</li>
            <li>Personalized advice and fun facts</li>
            <li>Beautiful animations and visual effects</li>
            <li>Mobile-friendly responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FriendshipCompatibilityCalculator;
