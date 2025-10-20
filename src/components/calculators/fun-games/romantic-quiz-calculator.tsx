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
import { Heart, Eye, Sparkles, Star, Flame, Coffee, Music, Camera, Gamepad2, Zap, Flower, ArrowRight } from "lucide-react"; // Fixed icons

interface QuizResult {
  percentage: number;
  title: string;
  description: string;
  emoji: string;
  color: string;
  advice: string;
  funFact: string;
  romanticLevel: string;
  personalityType: string;
  romanticTraits: string[];
  romanticSuggestions: string[];
}

const quizResults: QuizResult[] = [
  {
    percentage: 95,
    title: "Ultimate Romantic! 💕",
    description: "You are the epitome of romance! Your heart beats with pure romantic energy that could power a thousand love stories.",
    emoji: "💕",
    color: "text-pink-500",
    advice: "Your romantic nature is incredible - share it with the world and inspire others!",
    funFact: "95% romantic people are often the ones who create the most beautiful love stories!",
    romanticLevel: "ULTIMATE ROMANTIC",
    personalityType: "Hopeless Romantic",
    romanticTraits: ["Passionate", "Thoughtful", "Creative", "Expressive", "Devoted"],
    romanticSuggestions: ["Write love letters", "Plan surprise dates", "Create romantic gestures", "Express feelings openly", "Celebrate love daily"]
  },
  {
    percentage: 85,
    title: "Hopeless Romantic! 🌹",
    description: "You are a true hopeless romantic! Your heart is full of love and you see romance in everything around you.",
    emoji: "🌹",
    color: "text-red-500",
    advice: "Your romantic nature is beautiful - embrace it and let it guide your relationships!",
    funFact: "85% romantic people often find the most meaningful and lasting relationships!",
    romanticLevel: "HOPELESS ROMANTIC",
    personalityType: "Passionate Lover",
    romanticTraits: ["Passionate", "Thoughtful", "Creative", "Expressive", "Devoted"],
    romanticSuggestions: ["Write love letters", "Plan surprise dates", "Create romantic gestures", "Express feelings openly", "Celebrate love daily"]
  },
  {
    percentage: 75,
    title: "Romantic Soul! 💖",
    description: "You have a deeply romantic soul! You understand the beauty of love and express it beautifully.",
    emoji: "💖",
    color: "text-purple-500",
    advice: "Your romantic nature is strong - nurture it and let it flourish in your relationships!",
    funFact: "75% romantic people often create the most memorable and special moments!",
    romanticLevel: "ROMANTIC SOUL",
    personalityType: "Romantic Idealist",
    romanticTraits: ["Thoughtful", "Creative", "Expressive", "Devoted", "Sensitive"],
    romanticSuggestions: ["Plan thoughtful gestures", "Express feelings creatively", "Create romantic surprises", "Celebrate special moments", "Show appreciation"]
  },
  {
    percentage: 65,
    title: "Sweet Romantic! 🍯",
    description: "You are a sweet romantic! You have a gentle and loving heart that brings warmth to relationships.",
    emoji: "🍯",
    color: "text-orange-500",
    advice: "Your romantic nature is sweet and genuine - let it shine in your relationships!",
    funFact: "65% romantic people often have the most stable and loving relationships!",
    romanticLevel: "SWEET ROMANTIC",
    personalityType: "Gentle Lover",
    romanticTraits: ["Sweet", "Thoughtful", "Caring", "Loving", "Genuine"],
    romanticSuggestions: ["Show small acts of kindness", "Express appreciation", "Create cozy moments", "Be present and attentive", "Share your feelings"]
  },
  {
    percentage: 55,
    title: "Romantic at Heart! 💝",
    description: "You are romantic at heart! You have a natural inclination toward love and romance.",
    emoji: "💝",
    color: "text-blue-500",
    advice: "Your romantic nature is developing - explore it and let it grow in your relationships!",
    funFact: "55% romantic people often discover their romantic side through meaningful relationships!",
    romanticLevel: "ROMANTIC AT HEART",
    personalityType: "Developing Romantic",
    romanticTraits: ["Caring", "Loving", "Genuine", "Thoughtful", "Growing"],
    romanticSuggestions: ["Explore romantic activities", "Express feelings more", "Plan special moments", "Show appreciation", "Be more expressive"]
  },
  {
    percentage: 45,
    title: "Practical Romantic! 💼",
    description: "You are a practical romantic! You show love through actions and practical gestures rather than grand romantic displays.",
    emoji: "💼",
    color: "text-green-500",
    advice: "Your practical approach to romance is valuable - combine it with some romantic gestures!",
    funFact: "45% romantic people often have the most reliable and dependable relationships!",
    romanticLevel: "PRACTICAL ROMANTIC",
    personalityType: "Action-Oriented Lover",
    romanticTraits: ["Practical", "Reliable", "Caring", "Dependable", "Action-Oriented"],
    romanticSuggestions: ["Add romantic touches to practical gestures", "Plan surprise moments", "Express feelings verbally", "Create romantic surprises", "Show appreciation"]
  },
  {
    percentage: 35,
    title: "Growing Romantic! 🌱",
    description: "You are a growing romantic! You have the potential to develop a deeper romantic nature with time and experience.",
    emoji: "🌱",
    color: "text-yellow-500",
    advice: "Your romantic potential is there - nurture it and let it grow in your relationships!",
    funFact: "35% romantic people often discover their romantic side through meaningful experiences!",
    romanticLevel: "GROWING ROMANTIC",
    personalityType: "Developing Lover",
    romanticTraits: ["Growing", "Potential", "Learning", "Open", "Curious"],
    romanticSuggestions: ["Explore romantic activities", "Learn about love languages", "Practice expressing feelings", "Plan special moments", "Be more open"]
  },
  {
    percentage: 25,
    title: "Reserved Romantic! 🤐",
    description: "You are a reserved romantic! You feel deeply but express it in subtle and quiet ways.",
    emoji: "🤐",
    color: "text-gray-500",
    advice: "Your reserved nature is beautiful - find ways to express your feelings that feel comfortable!",
    funFact: "25% romantic people often have the most profound and meaningful connections!",
    romanticLevel: "RESERVED ROMANTIC",
    personalityType: "Quiet Lover",
    romanticTraits: ["Reserved", "Deep", "Thoughtful", "Quiet", "Meaningful"],
    romanticSuggestions: ["Write letters or notes", "Show love through actions", "Plan quiet romantic moments", "Express feelings in writing", "Be present and attentive"]
  },
  {
    percentage: 15,
    title: "Mysterious Romantic! 🔮",
    description: "You are a mysterious romantic! Your romantic nature is hidden but has the potential to surprise and delight.",
    emoji: "🔮",
    color: "text-indigo-500",
    advice: "Your mysterious nature is intriguing - let your romantic side surprise those you love!",
    funFact: "15% romantic people often create the most unexpected and magical moments!",
    romanticLevel: "MYSTERIOUS ROMANTIC",
    personalityType: "Enigmatic Lover",
    romanticTraits: ["Mysterious", "Intriguing", "Surprising", "Deep", "Unique"],
    romanticSuggestions: ["Create surprise moments", "Express feelings uniquely", "Plan unexpected gestures", "Show love in your own way", "Be authentic"]
  },
  {
    percentage: 5,
    title: "Plot Twist Romantic! 🎭",
    description: "Well, this is unexpected! But hey, the best romantic stories often have surprising beginnings.",
    emoji: "🎭",
    color: "text-slate-500",
    advice: "Sometimes the universe has a sense of humor - embrace your unique romantic journey!",
    funFact: "5% romantic people often have the most interesting and unconventional love stories!",
    romanticLevel: "PLOT TWIST ROMANTIC",
    personalityType: "Unique Lover",
    romanticTraits: ["Unique", "Surprising", "Unconventional", "Interesting", "Authentic"],
    romanticSuggestions: ["Find your own romantic style", "Express love authentically", "Create unique moments", "Be yourself", "Explore what romance means to you"]
  }
];

const RomanticQuizCalculator: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [favoriteRomanticActivity, setFavoriteRomanticActivity] = useState("");
  const [loveLanguage, setLoveLanguage] = useState("");
  const [romanticStyle, setRomanticStyle] = useState("");
  const [idealDate, setIdealDate] = useState("");
  const [romanticMemory, setRomanticMemory] = useState("");
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const romanticActivities = [
    "Candlelit dinner", "Stargazing", "Dancing", "Writing love letters", "Surprise gifts",
    "Long walks", "Cooking together", "Watching sunsets", "Picnics", "Traveling together"
  ];

  const loveLanguages = [
    "Words of Affirmation", "Acts of Service", "Receiving Gifts", "Quality Time", "Physical Touch"
  ];

  const romanticStyles = [
    "Grand gestures", "Small daily acts", "Creative surprises", "Traditional romance", "Adventure romance",
    "Quiet moments", "Public displays", "Private expressions", "Spontaneous acts", "Planned surprises"
  ];

  const idealDates = [
    "Fancy restaurant dinner", "Cozy home movie night", "Adventure hiking trip", "Art museum visit", "Beach sunset walk",
    "Cooking class together", "Concert or show", "Weekend getaway", "Picnic in the park", "Dancing lessons"
  ];

  const calculateRomanticScore = (): number => {
    if (!name) return 0;
    
    let score = 0;
    
    // Base romantic score
    score += 20;
    
    // Enhanced name analysis
    const nameLower = name.toLowerCase().replace(/\s/g, '');
    const vowels = nameLower.match(/[aeiou]/g)?.length || 0;
    score += vowels * 2.5;
    
    // Name length bonus
    score += Math.min(nameLower.length * 1.8, 25);
    
    // Enhanced age factor
    if (age) {
      const ageNum = parseInt(age);
      if (ageNum >= 18 && ageNum <= 25) score += 12;
      else if (ageNum >= 26 && ageNum <= 35) score += 18;
      else if (ageNum >= 36 && ageNum <= 50) score += 15;
      else if (ageNum >= 51 && ageNum <= 65) score += 12;
      else if (ageNum >= 66) score += 8;
    }
    
    // Enhanced romantic activity bonus
    if (favoriteRomanticActivity) {
      const activityBonuses = {
        "Candlelit dinner": 18,
        "Stargazing": 16,
        "Dancing": 12,
        "Writing love letters": 22,
        "Surprise gifts": 17,
        "Long walks": 10,
        "Cooking together": 11,
        "Watching sunsets": 14,
        "Picnics": 9,
        "Traveling together": 16
      };
      score += activityBonuses[favoriteRomanticActivity as keyof typeof activityBonuses] || 6;
    }
    
    // Enhanced love language bonus
    if (loveLanguage) {
      const loveLanguageBonuses = {
        "Words of Affirmation": 15,
        "Acts of Service": 10,
        "Receiving Gifts": 12,
        "Quality Time": 18,
        "Physical Touch": 11
      };
      score += loveLanguageBonuses[loveLanguage as keyof typeof loveLanguageBonuses] || 6;
    }
    
    // Enhanced romantic style bonus
    if (romanticStyle) {
      const styleBonuses = {
        "Grand gestures": 18,
        "Small daily acts": 10,
        "Creative surprises": 15,
        "Traditional romance": 12,
        "Adventure romance": 11,
        "Quiet moments": 8,
        "Public displays": 9,
        "Private expressions": 10,
        "Spontaneous acts": 14,
        "Planned surprises": 11
      };
      score += styleBonuses[romanticStyle as keyof typeof styleBonuses] || 6;
    }
    
    // Enhanced ideal date bonus
    if (idealDate) {
      const dateBonuses = {
        "Fancy restaurant dinner": 15,
        "Cozy home movie night": 10,
        "Adventure hiking trip": 11,
        "Art museum visit": 12,
        "Beach sunset walk": 14,
        "Cooking class together": 11,
        "Concert or show": 10,
        "Weekend getaway": 16,
        "Picnic in the park": 9,
        "Dancing lessons": 12
      };
      score += dateBonuses[idealDate as keyof typeof dateBonuses] || 6;
    }
    
    // Enhanced romantic memory bonus
    if (romanticMemory) {
      const memoryLength = romanticMemory.length;
      if (memoryLength >= 150) score += 20;
      else if (memoryLength >= 100) score += 15;
      else if (memoryLength >= 75) score += 12;
      else if (memoryLength >= 50) score += 8;
      else if (memoryLength >= 25) score += 5;
      else if (memoryLength >= 10) score += 3;
      
      // Bonus for romantic keywords in memory
      const romanticKeywords = ['love', 'romantic', 'beautiful', 'special', 'amazing', 'perfect', 'sweet', 'caring', 'passionate', 'intimate', 'heart', 'soul', 'forever', 'together', 'happiness'];
      const keywordCount = romanticKeywords.filter(keyword => 
        romanticMemory.toLowerCase().includes(keyword)
      ).length;
      score += keywordCount * 2;
    }
    
    // Enhanced special letter bonuses
    if (nameLower.includes('l')) score += 4; // Love
    if (nameLower.includes('o')) score += 3; // Love
    if (nameLower.includes('v')) score += 5; // Love
    if (nameLower.includes('e')) score += 3; // Love
    if (nameLower.includes('r')) score += 3; // Romance
    if (nameLower.includes('m')) score += 3; // Romance
    if (nameLower.includes('a')) score += 2; // Romance
    if (nameLower.includes('n')) score += 2; // Romance
    if (nameLower.includes('c')) score += 2; // Romance
    if (nameLower.includes('h')) score += 2; // Heart
    
    // Romantic name patterns bonus
    const romanticPatterns = ['rose', 'lily', 'jade', 'ruby', 'pearl', 'diamond', 'crystal', 'amber', 'sapphire', 'emerald', 'love', 'heart', 'soul', 'angel', 'prince', 'princess', 'king', 'queen'];
    if (romanticPatterns.some(pattern => nameLower.includes(pattern))) score += 8;
    
    // Vowel pattern analysis
    const vowelPattern = nameLower.replace(/[^aeiou]/g, '');
    if (vowelPattern.length >= 3) score += 5;
    if (vowelPattern.includes('ae') || vowelPattern.includes('ea') || vowelPattern.includes('ou')) score += 3;
    
    // Name ending analysis
    const romanticEndings = ['ia', 'elle', 'ette', 'ina', 'ana', 'ena', 'ora', 'ara', 'ira', 'ura'];
    const nameEnding = nameLower.slice(-3);
    if (romanticEndings.some(ending => nameEnding.includes(ending))) score += 6;
    
    // Enhanced random factor for more variety
    const randomFactor = Math.random() * 25;
    score += randomFactor;
    
    return Math.max(5, Math.min(95, Math.round(score)));
  };

  const getResultByPercentage = (percentage: number): QuizResult => {
    if (percentage >= 90) return quizResults[0];
    if (percentage >= 80) return quizResults[1];
    if (percentage >= 70) return quizResults[2];
    if (percentage >= 60) return quizResults[3];
    if (percentage >= 50) return quizResults[4];
    if (percentage >= 40) return quizResults[5];
    if (percentage >= 30) return quizResults[6];
    if (percentage >= 20) return quizResults[7];
    if (percentage >= 10) return quizResults[8];
    return quizResults[9];
  };

  const handleCalculate = () => {
    if (!name.trim()) return;
    
    setIsCalculating(true);
    
    setTimeout(() => {
      const percentage = calculateRomanticScore();
      const quizResult = getResultByPercentage(percentage);
      setResult(quizResult);
      setIsCalculating(false);
    }, 2000);
  };

  const resetQuiz = () => {
    setName("");
    setAge("");
    setFavoriteRomanticActivity("");
    setLoveLanguage("");
    setRomanticStyle("");
    setIdealDate("");
    setRomanticMemory("");
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Flower className="h-8 w-8 text-pink-500 animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
            How Romantic Are You? Quiz
          </h1>
          <ArrowRight className="h-8 w-8 text-pink-500 animate-pulse" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover your romantic nature! Our comprehensive quiz analyzes your preferences, 
          behaviors, and personality to reveal just how romantic you really are. 💕
        </p>
      </div>

      {/* Quiz Card */}
      <Card className="border-2 border-pink-200 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-pink-600">Tell Us About Your Romantic Side</CardTitle>
          <CardDescription>
            Answer these questions to discover your romantic nature! ✨
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Your Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-2 border-pink-200 focus:border-pink-400"
                />
              </div>
              <div>
                <Label htmlFor="age" className="text-sm font-medium">
                  Your Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age..."
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="border-2 border-pink-200 focus:border-pink-400"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="favoriteRomanticActivity" className="text-sm font-medium">
                Favorite Romantic Activity
              </Label>
              <Select value={favoriteRomanticActivity} onValueChange={setFavoriteRomanticActivity}>
                <SelectTrigger className="border-2 border-pink-200 focus:border-pink-400">
                  <SelectValue placeholder="Select your favorite romantic activity" />
                </SelectTrigger>
                <SelectContent>
                  {romanticActivities.map((activity) => (
                    <SelectItem key={activity} value={activity}>
                      {activity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="loveLanguage" className="text-sm font-medium">
                Your Love Language
              </Label>
              <Select value={loveLanguage} onValueChange={setLoveLanguage}>
                <SelectTrigger className="border-2 border-pink-200 focus:border-pink-400">
                  <SelectValue placeholder="Select your love language" />
                </SelectTrigger>
                <SelectContent>
                  {loveLanguages.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="romanticStyle" className="text-sm font-medium">
                Your Romantic Style
              </Label>
              <Select value={romanticStyle} onValueChange={setRomanticStyle}>
                <SelectTrigger className="border-2 border-pink-200 focus:border-pink-400">
                  <SelectValue placeholder="Select your romantic style" />
                </SelectTrigger>
                <SelectContent>
                  {romanticStyles.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="idealDate" className="text-sm font-medium">
                Your Ideal Date
              </Label>
              <Select value={idealDate} onValueChange={setIdealDate}>
                <SelectTrigger className="border-2 border-pink-200 focus:border-pink-400">
                  <SelectValue placeholder="Select your ideal date" />
                </SelectTrigger>
                <SelectContent>
                  {idealDates.map((date) => (
                    <SelectItem key={date} value={date}>
                      {date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="romanticMemory" className="text-sm font-medium">
                Share a Romantic Memory (Optional)
              </Label>
              <Input
                id="romanticMemory"
                type="text"
                placeholder="Describe a romantic moment you've experienced..."
                value={romanticMemory}
                onChange={(e) => setRomanticMemory(e.target.value)}
                className="border-2 border-pink-200 focus:border-pink-400"
              />
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={handleCalculate}
              disabled={!name.trim() || isCalculating}
              className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {isCalculating ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Analyzing Romance...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Flower className="h-5 w-5" />
                  <span>Calculate Romance %</span>
                </div>
              )}
            </Button>
            <Button
              onClick={resetQuiz}
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
                  {result.romanticLevel}
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

                {/* Personality Type */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-700 mb-1">
                    💫 Your Romantic Personality
                  </h3>
                  <p className="text-purple-600">
                    {result.personalityType}
                  </p>
                </div>

                {/* Romantic Traits */}
                <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
                  <h3 className="text-xl font-semibold text-pink-700 mb-3">
                    💕 Your Romantic Traits
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {result.romanticTraits.map((trait, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-pink-500" />
                        <span className="text-pink-600">{trait}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Romantic Suggestions */}
                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <h3 className="text-xl font-semibold text-red-700 mb-3">
                    💖 Romantic Suggestions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {result.romanticSuggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="h-4 w-4 rounded-full bg-red-500"></div>
                        <span className="text-red-600">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advice */}
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="text-xl font-semibold text-purple-700 mb-2">
                    💡 Romantic Advice
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
            💕 How Romantic Are You? Quiz - Discover Your Romantic Nature
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            Our "How Romantic Are You?" Quiz is the ultimate tool for discovering your romantic nature and personality. 
            Whether you're curious about your romantic tendencies or want to understand your love style better, 
            this comprehensive quiz provides detailed insights based on your preferences, behaviors, and personality traits.
          </p>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            How Our Romantic Quiz Works
          </h3>
          <p className="text-gray-700 mb-4">
            Our advanced algorithm analyzes multiple factors including your romantic preferences, love language, 
            romantic style, ideal date preferences, and personal characteristics to calculate your romantic percentage. 
            The results reveal your romantic personality type and provide personalized suggestions for expressing love.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Perfect For:
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Discovering your romantic nature</li>
            <li>Understanding your love style</li>
            <li>Fun activities and self-discovery</li>
            <li>Improving your romantic relationships</li>
            <li>Entertainment and curiosity about romance</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Romantic Quiz Features
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Comprehensive romantic personality analysis</li>
            <li>Love language assessment</li>
            <li>Romantic style evaluation</li>
            <li>Personalized romantic suggestions</li>
            <li>Romantic trait identification</li>
            <li>Fun and entertaining results</li>
            <li>Detailed personality type explanations</li>
            <li>Beautiful animations and visual effects</li>
            <li>Mobile-friendly responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RomanticQuizCalculator;
