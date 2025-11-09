
import { Question } from './types';

export const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "How much of your monthly income do you typically save?",
    options: [
      { text: "Over 20%", score: 4 },
      { text: "10% - 20%", score: 3 },
      { text: "Less than 10%", score: 2 },
      { text: "I don't save regularly", score: 1 },
    ],
  },
  {
    id: 2,
    text: "How confident are you about your ability to cover a $1,000 emergency expense?",
    options: [
      { text: "Very confident, I have it in cash", score: 4 },
      { text: "Confident, I could get it if needed", score: 3 },
      { text: "Not very confident, it would be a struggle", score: 2 },
      { text: "I would have to borrow money", score: 1 },
    ],
  },
  {
    id: 3,
    text: "How do you manage your monthly expenses?",
    options: [
      { text: "I have a detailed budget and stick to it", score: 4 },
      { text: "I have a general idea of my spending", score: 3 },
      { text: "I track my spending but don't budget", score: 2 },
      { text: "I don't track my spending", score: 1 },
    ],
  },
  {
    id: 4,
    text: "What best describes your credit card usage?",
    options: [
      { text: "I pay off the full balance every month", score: 4 },
      { text: "I usually pay more than the minimum", score: 3 },
      { text: "I only pay the minimum amount", score: 2 },
      { text: "I have maxed out one or more cards", score: 1 },
    ],
  },
  {
    id: 5,
    text: "How would you rate your current credit score?",
    options: [
      { text: "Excellent (750+)", score: 4 },
      { text: "Good (650-749)", score: 3 },
      { text: "Fair (550-649)", score: 2 },
      { text: "Poor (below 550) or I don't know", score: 1 },
    ],
  },
  {
    id: 6,
    text: "Are you currently investing for retirement?",
    options: [
      { text: "Yes, I contribute regularly to a retirement account", score: 4 },
      { text: "Yes, but I contribute irregularly", score: 3 },
      { text: "I have an account but am not contributing", score: 2 },
      { text: "No, I am not investing for retirement", score: 1 },
    ],
  },
  {
    id: 7,
    text: "How much high-interest debt (like credit cards or personal loans) do you have?",
    options: [
      { text: "None", score: 4 },
      { text: "A small, manageable amount", score: 3 },
      { text: "A significant amount that worries me", score: 2 },
      { text: "A very large amount", score: 1 },
    ],
  },
  {
    id: 8,
    text: "How often do you review your financial goals and progress?",
    options: [
      { text: "Monthly or quarterly", score: 4 },
      { text: "Annually", score: 3 },
      { text: "Rarely", score: 2 },
      { text: "Never", score: 1 },
    ],
  },
  {
    id: 9,
    text: "Do you have any sources of income besides your main job?",
    options: [
      { text: "Yes, I have multiple steady income streams", score: 4 },
      { text: "I have some occasional side income", score: 3 },
      { text: "I'm thinking about it, but nothing yet", score: 2 },
      { text: "No, I rely on one source of income", score: 1 },
    ],
  },
  {
    id: 10,
    text: "How would you describe your knowledge of personal finance and investing?",
    options: [
      { text: "Very knowledgeable", score: 4 },
      { text: "Somewhat knowledgeable", score: 3 },
      { text: "Beginner level", score: 2 },
      { text: "Not knowledgeable at all", score: 1 },
    ],
  },
  {
    id: 11,
    text: "How do you feel about your overall financial situation?",
    options: [
        { text: "Secure and optimistic", score: 4 },
        { text: "Stable, but could be better", score: 3 },
        { text: "Anxious and uncertain", score: 2 },
        { text: "Stressed and overwhelmed", score: 1 },
    ],
  },
  {
    id: 12,
    text: "Do you have insurance (health, life, disability) to protect against unexpected events?",
    options: [
      { text: "Yes, I have comprehensive coverage", score: 4 },
      { text: "I have some basic coverage", score: 3 },
      { text: "My coverage is minimal", score: 2 },
      { text: "I have no insurance", score: 1 },
    ],
  },
];
