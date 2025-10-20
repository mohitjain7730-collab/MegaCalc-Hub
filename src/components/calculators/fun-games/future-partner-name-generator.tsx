"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Eye, Sparkles, Star, Flame, Coffee, Music, Camera, Gamepad2, Zap, User, Wand2 } from "lucide-react";

interface GeneratedName {
  name: string;
  meaning: string;
  compatibility: number;
  description: string;
  emoji: string;
  color: string;
  funFact: string;
  origin: string;
}

const nameOrigins = [
  "Any", "English", "Spanish", "French", "Italian", "German", "Irish", "Scottish", "Welsh",
  "Greek", "Latin", "Hebrew", "Arabic", "Japanese", "Chinese", "Korean", "Indian",
  "Russian", "Polish", "Dutch", "Swedish", "Norwegian", "Finnish", "Portuguese",
  "Brazilian", "Mexican", "African", "Native American", "Celtic", "Norse", "Roman"
];

const genderOptions = [
  "Male", "Female", "Non-binary", "Prefer not to say"
];

const personalityTypes = [
  "Romantic Dreamer", "Adventurous Explorer", "Creative Artist", "Logical Thinker",
  "Social Butterfly", "Quiet Observer", "Energetic Athlete", "Mysterious Soul",
  "Funny Comedian", "Caring Helper", "Practical Planner", "Spiritual Seeker"
];

const nameDatabase = [
  // Male names
  { name: "Alexander", meaning: "Defender of the people", origin: "Greek", gender: "Male", emoji: "👑", compatibility: 95 },
  { name: "Sebastian", meaning: "Venerable, revered", origin: "Greek", gender: "Male", emoji: "🎭", compatibility: 88 },
  { name: "Gabriel", meaning: "God is my strength", origin: "Hebrew", gender: "Male", emoji: "👼", compatibility: 87 },
  { name: "Lucas", meaning: "Light", origin: "Latin", gender: "Male", emoji: "💡", compatibility: 89 },
  { name: "Mateo", meaning: "Gift of God", origin: "Hebrew", gender: "Male", emoji: "🎁", compatibility: 86 },
  { name: "Ethan", meaning: "Strong, firm", origin: "Hebrew", gender: "Male", emoji: "💪", compatibility: 88 },
  { name: "Noah", meaning: "Rest, comfort", origin: "Hebrew", gender: "Male", emoji: "🕊️", compatibility: 85 },
  { name: "Liam", meaning: "Strong-willed warrior", origin: "Irish", gender: "Male", emoji: "⚔️", compatibility: 87 },
  { name: "William", meaning: "Resolute protector", origin: "German", gender: "Male", emoji: "🛡️", compatibility: 91 },
  { name: "James", meaning: "Supplanter", origin: "Hebrew", gender: "Male", emoji: "👑", compatibility: 86 },
  { name: "Benjamin", meaning: "Son of the right hand", origin: "Hebrew", gender: "Male", emoji: "🤝", compatibility: 89 },
  { name: "Henry", meaning: "Estate ruler", origin: "German", gender: "Male", emoji: "👑", compatibility: 88 },
  { name: "Samuel", meaning: "Name of God", origin: "Hebrew", gender: "Male", emoji: "🙏", compatibility: 85 },
  { name: "Jack", meaning: "God is gracious", origin: "English", gender: "Male", emoji: "🎭", compatibility: 86 },
  { name: "Owen", meaning: "Young warrior", origin: "Welsh", gender: "Male", emoji: "⚔️", compatibility: 87 },
  { name: "Daniel", meaning: "God is my judge", origin: "Hebrew", gender: "Male", emoji: "⚖️", compatibility: 89 },
  { name: "Christopher", meaning: "Bearer of Christ", origin: "Greek", gender: "Male", emoji: "✝️", compatibility: 86 },
  { name: "Anthony", meaning: "Priceless one", origin: "Latin", gender: "Male", emoji: "💎", compatibility: 87 },
  { name: "David", meaning: "Beloved", origin: "Hebrew", gender: "Male", emoji: "💕", compatibility: 90 },
  { name: "Joseph", meaning: "He will add", origin: "Hebrew", gender: "Male", emoji: "➕", compatibility: 85 },
  
  // Female names
  { name: "Isabella", meaning: "Devoted to God", origin: "Hebrew", gender: "Female", emoji: "👸", compatibility: 92 },
  { name: "Olivia", meaning: "Olive tree", origin: "Latin", gender: "Female", emoji: "🕊️", compatibility: 90 },
  { name: "Sophia", meaning: "Wisdom", origin: "Greek", gender: "Female", emoji: "🧠", compatibility: 94 },
  { name: "Emma", meaning: "Universal", origin: "German", gender: "Female", emoji: "🌍", compatibility: 91 },
  { name: "Luna", meaning: "Moon", origin: "Latin", gender: "Female", emoji: "🌙", compatibility: 93 },
  { name: "Aria", meaning: "Air, song", origin: "Italian", gender: "Female", emoji: "🎵", compatibility: 92 },
  { name: "Mia", meaning: "Mine", origin: "Italian", gender: "Female", emoji: "💎", compatibility: 90 },
  { name: "Charlotte", meaning: "Free woman", origin: "French", gender: "Female", emoji: "👑", compatibility: 88 },
  { name: "Amelia", meaning: "Work", origin: "German", gender: "Female", emoji: "💼", compatibility: 92 },
  { name: "Ava", meaning: "Life", origin: "Hebrew", gender: "Female", emoji: "🌸", compatibility: 89 },
  { name: "Harper", meaning: "Harp player", origin: "English", gender: "Female", emoji: "🎵", compatibility: 87 },
  { name: "Evelyn", meaning: "Desired", origin: "English", gender: "Female", emoji: "💕", compatibility: 90 },
  { name: "Abigail", meaning: "Father's joy", origin: "Hebrew", gender: "Female", emoji: "😊", compatibility: 91 },
  { name: "Emily", meaning: "Rival", origin: "Latin", gender: "Female", emoji: "⚔️", compatibility: 89 },
  { name: "Elizabeth", meaning: "God is my oath", origin: "Hebrew", gender: "Female", emoji: "👑", compatibility: 93 },
  { name: "Grace", meaning: "Grace of God", origin: "Latin", gender: "Female", emoji: "✨", compatibility: 92 },
  { name: "Chloe", meaning: "Blooming", origin: "Greek", gender: "Female", emoji: "🌺", compatibility: 90 },
  { name: "Victoria", meaning: "Victory", origin: "Latin", gender: "Female", emoji: "🏆", compatibility: 88 },
  { name: "Scarlett", meaning: "Red", origin: "English", gender: "Female", emoji: "🌹", compatibility: 89 },
  { name: "Penelope", meaning: "Weaver", origin: "Greek", gender: "Female", emoji: "🧵", compatibility: 87 },
  // Indian female names (to support origin filtering)
  { name: "Aanya", meaning: "Grace", origin: "Indian", gender: "Female", emoji: "🌸", compatibility: 90 },
  { name: "Ananya", meaning: "Unique, matchless", origin: "Indian", gender: "Female", emoji: "✨", compatibility: 91 },
  { name: "Priya", meaning: "Beloved", origin: "Indian", gender: "Female", emoji: "💕", compatibility: 92 },
  { name: "Diya", meaning: "Lamp, light", origin: "Indian", gender: "Female", emoji: "🪔", compatibility: 89 },
  { name: "Kavya", meaning: "Poetry", origin: "Indian", gender: "Female", emoji: "📜", compatibility: 88 },
  { name: "Isha", meaning: "Goddess, protector", origin: "Indian", gender: "Female", emoji: "🕉️", compatibility: 90 },
  { name: "Riya", meaning: "Singer", origin: "Indian", gender: "Female", emoji: "🎶", compatibility: 87 },
  { name: "Neha", meaning: "Rain, love", origin: "Indian", gender: "Female", emoji: "🌧️", compatibility: 88 },
  { name: "Sanya", meaning: "Brilliant, moment", origin: "Indian", gender: "Female", emoji: "🌟", compatibility: 86 },
  { name: "Aarohi", meaning: "Musical tune", origin: "Indian", gender: "Female", emoji: "🎼", compatibility: 89 },
  
  // Non-binary names
  { name: "Alex", meaning: "Defender of the people", origin: "Greek", gender: "Non-binary", emoji: "🛡️", compatibility: 88 },
  { name: "Jordan", meaning: "To flow down", origin: "Hebrew", gender: "Non-binary", emoji: "🌊", compatibility: 87 },
  { name: "Taylor", meaning: "Tailor", origin: "English", gender: "Non-binary", emoji: "✂️", compatibility: 86 },
  { name: "Casey", meaning: "Brave", origin: "Irish", gender: "Non-binary", emoji: "⚔️", compatibility: 89 },
  { name: "Riley", meaning: "Courageous", origin: "Irish", gender: "Non-binary", emoji: "💪", compatibility: 88 },
  { name: "Avery", meaning: "Ruler of the elves", origin: "English", gender: "Non-binary", emoji: "🧝", compatibility: 87 },
  { name: "Quinn", meaning: "Wise", origin: "Irish", gender: "Non-binary", emoji: "🧠", compatibility: 90 },
  { name: "Sage", meaning: "Wise one", origin: "Latin", gender: "Non-binary", emoji: "🌿", compatibility: 89 },
  { name: "River", meaning: "Stream of water", origin: "English", gender: "Non-binary", emoji: "🌊", compatibility: 88 },
  { name: "Phoenix", meaning: "Mythical bird", origin: "Greek", gender: "Non-binary", emoji: "🔥", compatibility: 91 }
];

const FuturePartnerNameGenerator: React.FC = () => {
  const router = useRouter();
  const [yourName, setYourName] = useState("");
  const [yourGender, setYourGender] = useState("");
  const [preferredGender, setPreferredGender] = useState("");
  const [preferredOrigin, setPreferredOrigin] = useState("");
  const [personalityType, setPersonalityType] = useState("");
  const [generatedName, setGeneratedName] = useState<GeneratedName | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);

  const generatePartnerName = (): GeneratedName => {
    // Filter names based on preferences
    let filteredNames = nameDatabase;

    // First, apply gender filter (sticky even if origin has no matches)
    let genderFiltered = filteredNames;
    if (preferredGender && preferredGender !== "Any") {
      genderFiltered = filteredNames.filter(name => name.gender === preferredGender);
    }

    // Then, try applying origin filter on top of gender filter
    let genderAndOriginFiltered = genderFiltered;
    if (preferredOrigin && preferredOrigin !== "Any") {
      genderAndOriginFiltered = genderFiltered.filter(name => name.origin === preferredOrigin);
    }

    // Choose the most specific non-empty set
    if (preferredOrigin && preferredOrigin !== "Any" && genderAndOriginFiltered.length > 0) {
      filteredNames = genderAndOriginFiltered;
    } else if (preferredGender && preferredGender !== "Any" && genderFiltered.length > 0) {
      filteredNames = genderFiltered;
    } else {
      filteredNames = nameDatabase;
    }
    
    // Select a random name
    const randomIndex = Math.floor(Math.random() * filteredNames.length);
    const selectedName = filteredNames[randomIndex];
    
    // Calculate compatibility based on name and preferences
    let compatibility = selectedName.compatibility;
    
    // Adjust compatibility based on personality type
    if (personalityType) {
      const personalityBonuses = {
        "Romantic Dreamer": 5,
        "Adventurous Explorer": 3,
        "Creative Artist": 4,
        "Logical Thinker": 2,
        "Social Butterfly": 6,
        "Quiet Observer": 1,
        "Energetic Athlete": 3,
        "Mysterious Soul": 4,
        "Funny Comedian": 7,
        "Caring Helper": 5,
        "Practical Planner": 2,
        "Spiritual Seeker": 4
      };
      
      compatibility += personalityBonuses[personalityType as keyof typeof personalityBonuses] || 0;
    }
    
    // Adjust compatibility based on your name
    if (yourName) {
      const yourNameLower = yourName.toLowerCase();
      const partnerNameLower = selectedName.name.toLowerCase();
      
      // Check for shared letters
      const sharedLetters = new Set();
      for (const letter of yourNameLower) {
        if (partnerNameLower.includes(letter)) {
          sharedLetters.add(letter);
        }
      }
      
      compatibility += sharedLetters.size * 2;
      
      // Check for similar length
      const lengthDiff = Math.abs(yourName.length - selectedName.name.length);
      if (lengthDiff <= 2) compatibility += 3;
      else if (lengthDiff <= 4) compatibility += 1;
    }
    
    // Ensure compatibility is between 50 and 99
    compatibility = Math.max(50, Math.min(99, compatibility));
    
    // Generate description based on compatibility
    let description = "";
    if (compatibility >= 90) {
      description = "This name has incredible compatibility with yours! The stars have truly aligned for this perfect match.";
    } else if (compatibility >= 80) {
      description = "This name shows excellent compatibility! There's something special about this combination.";
    } else if (compatibility >= 70) {
      description = "This name has good compatibility with yours! This could be a promising match.";
    } else if (compatibility >= 60) {
      description = "This name shows decent compatibility! There's potential for a good connection.";
    } else {
      description = "This name has interesting compatibility! Sometimes opposites attract in the most beautiful ways.";
    }
    
    // Generate fun fact
    const funFacts = [
      `Names starting with '${selectedName.name[0]}' are known for their ${selectedName.meaning.toLowerCase()} energy!`,
      `In ${selectedName.origin} culture, this name is associated with ${selectedName.meaning.toLowerCase()}.`,
      `People with this name often have a natural ${selectedName.meaning.toLowerCase()} quality.`,
      `This name has been popular for centuries due to its ${selectedName.meaning.toLowerCase()} meaning.`,
      `The ${selectedName.origin} origin of this name gives it a special ${selectedName.meaning.toLowerCase()} charm.`
    ];
    
    const randomFunFact = funFacts[Math.floor(Math.random() * funFacts.length)];
    
    // Determine color based on compatibility
    let color = "text-gray-500";
    if (compatibility >= 90) color = "text-pink-500";
    else if (compatibility >= 80) color = "text-purple-500";
    else if (compatibility >= 70) color = "text-blue-500";
    else if (compatibility >= 60) color = "text-green-500";
    else color = "text-orange-500";
    
    return {
      name: selectedName.name,
      meaning: selectedName.meaning,
      compatibility,
      description,
      emoji: selectedName.emoji,
      color,
      funFact: randomFunFact,
      origin: selectedName.origin
    };
  };

  const handleGenerate = () => {
    if (!yourName.trim()) return;
    
    setIsGenerating(true);
    setGenerationCount(prev => prev + 1);
    
    setTimeout(() => {
      const name = generatePartnerName();
      setGeneratedName(name);
      setIsGenerating(false);
    }, 2000);
  };

  const resetGenerator = () => {
    setYourName("");
    setYourGender("");
    setPreferredGender("");
    setPreferredOrigin("");
    setPersonalityType("");
    setGeneratedName(null);
    setGenerationCount(0);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Wand2 className="h-8 w-8 text-purple-500 animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Future Partner Name Generator
          </h1>
          <User className="h-8 w-8 text-purple-500 animate-pulse" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover the perfect name for your future partner! Our magical generator analyzes your preferences 
          and compatibility to reveal the ideal name for your soulmate. ✨
        </p>
      </div>

      {/* Generator Card */}
      <Card className="border-2 border-purple-200 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-purple-600">Tell Us About Your Preferences</CardTitle>
          <CardDescription>
            Fill in your details including your gender and preferred partner gender, and let our magical algorithm generate the perfect partner name! 🔮
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="yourName" className="text-lg font-semibold">
                Your Name
              </Label>
              <Input
                id="yourName"
                type="text"
                placeholder="Enter your name..."
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
                className="text-lg h-12 border-2 border-purple-200 focus:border-purple-400"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="yourGender" className="text-sm font-medium">
                  Your Gender
                </Label>
                <Select value={yourGender} onValueChange={setYourGender}>
                  <SelectTrigger className="border-2 border-purple-200 focus:border-purple-400">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="preferredGender" className="text-sm font-medium">
                  Preferred Partner Gender
                </Label>
                <Select value={preferredGender} onValueChange={setPreferredGender}>
                  <SelectTrigger className="border-2 border-purple-200 focus:border-purple-400">
                    <SelectValue placeholder="Select preferred gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Any">Any Gender</SelectItem>
                    {genderOptions.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferredOrigin" className="text-sm font-medium">
                  Preferred Name Origin (Optional)
                </Label>
                <Select value={preferredOrigin} onValueChange={setPreferredOrigin}>
                  <SelectTrigger className="border-2 border-purple-200 focus:border-purple-400">
                    <SelectValue placeholder="Select preferred origin" />
                  </SelectTrigger>
                  <SelectContent>
                    {nameOrigins.map((origin) => (
                      <SelectItem key={origin} value={origin}>
                        {origin}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="personalityType" className="text-sm font-medium">
                  Your Personality Type (Optional)
                </Label>
                <Select value={personalityType} onValueChange={setPersonalityType}>
                  <SelectTrigger className="border-2 border-purple-200 focus:border-purple-400">
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

          <div className="flex justify-center space-x-4">
            <Button
              onClick={handleGenerate}
              disabled={!yourName.trim() || !yourGender || !preferredGender || isGenerating}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {isGenerating ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating Name...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Wand2 className="h-5 w-5" />
                  <span>Generate Partner Name</span>
                </div>
              )}
            </Button>
            <Button
              onClick={resetGenerator}
              variant="outline"
              className="px-6 py-3 text-lg border-2 border-purple-200 hover:border-purple-400 rounded-full"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Name Card */}
      {generatedName && (
        <Card className="border-2 border-purple-300 shadow-xl animate-in slide-in-from-bottom-4 duration-500">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* Name Display */}
              <div className="relative">
                <div className="text-6xl mb-4">{generatedName.emoji}</div>
                <div className={`text-5xl font-bold ${generatedName.color} mb-4`}>
                  {generatedName.name}
                </div>
                <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  {generatedName.compatibility}% Compatible
                </Badge>
              </div>

              {/* Name Details */}
              <div className="space-y-4">
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="text-xl font-semibold text-purple-700 mb-2">
                    📖 Name Meaning
                  </h3>
                  <p className="text-lg text-purple-600">
                    <strong>{generatedName.name}</strong> means "{generatedName.meaning}" and originates from {generatedName.origin} culture.
                  </p>
                </div>

                <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
                  <h3 className="text-xl font-semibold text-pink-700 mb-2">
                    💕 Compatibility Analysis
                  </h3>
                  <p className="text-lg text-pink-600">
                    {generatedName.description}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-200">
                  <h3 className="text-xl font-semibold text-indigo-700 mb-2">
                    🎉 Fun Fact
                  </h3>
                  <p className="text-lg text-indigo-600">
                    {generatedName.funFact}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Counter */}
      {generationCount > 0 && (
        <Card className="border-2 border-blue-200">
          <CardContent className="p-4 text-center">
            <p className="text-blue-600 font-semibold">
              🎲 You've generated {generationCount} name{generationCount !== 1 ? 's' : ''} so far!
            </p>
            <p className="text-sm text-muted-foreground">
              Keep generating to find your perfect match!
            </p>
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
            ✨ Future Partner Name Generator - Discover Your Perfect Match
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            Our Future Partner Name Generator is the ultimate tool for discovering the perfect name for your future partner. 
            Whether you're curious about what your soulmate might be named or just having fun with name generation, 
            this calculator provides detailed insights based on your gender preferences, name origin preferences, personality, and compatibility factors.
          </p>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            How Our Name Generator Works
          </h3>
          <p className="text-gray-700 mb-4">
            Our advanced algorithm analyzes your name, gender preferences, personality type, and preferred name origins to generate 
            the perfect partner name. The generator considers compatibility factors, cultural origins, name meanings, 
            gender preferences, and personal preferences to create the most suitable match for you.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Perfect For:
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Discovering potential partner names</li>
            <li>Fun activities and entertainment</li>
            <li>Understanding name compatibility</li>
            <li>Exploring different cultural names</li>
            <li>Curiosity about future relationships</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Name Generator Features
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Extensive name database with meanings</li>
            <li>Cultural origin preferences</li>
            <li>Personality-based name matching</li>
            <li>Compatibility analysis</li>
            <li>Name meaning explanations</li>
            <li>Fun facts about names</li>
            <li>Multiple generation options</li>
            <li>Beautiful animations and visual effects</li>
            <li>Mobile-friendly responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FuturePartnerNameGenerator;
