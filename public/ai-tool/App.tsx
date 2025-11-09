
import React, { useState, useCallback } from 'react';
import { QUIZ_QUESTIONS } from './constants';
import { QuizState, ResultCategory, UserAnswer } from './types';
import Quiz from './components/Quiz';
import Result from './components/Result';
import { generateFinancialReport } from './services/geminiService';

const WelcomeScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="text-center p-8 max-w-2xl mx-auto animate-fade-in">
    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4">
      Your Financial Health Check-Up
    </h1>
    <p className="text-lg text-slate-600 mb-8">
      Take this quick 12-question quiz to understand your financial wellness. Get a personalized report with actionable tips to secure your financial future.
    </p>
    <button
      onClick={onStart}
      className="px-10 py-4 bg-teal-500 text-white font-bold rounded-full text-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-transform transform hover:scale-105 shadow-lg"
    >
      Start the Quiz
    </button>
  </div>
);

const LoadingScreen: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div className="w-16 h-16 border-4 border-teal-500 border-dashed rounded-full animate-spin mb-4"></div>
        <h2 className="text-2xl font-bold text-slate-700">Analyzing Your Results...</h2>
        <p className="text-slate-500">Our financial wellness assistant is crafting your personalized report!</p>
    </div>
);


const App: React.FC = () => {
  const [quizState, setQuizState] = useState<QuizState>(QuizState.Start);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resultData, setResultData] = useState<{ category: ResultCategory; report: string } | null>(null);

  const handleStartQuiz = useCallback(() => {
    setQuizState(QuizState.InProgress);
  }, []);
  
  const getResultCategory = (score: number): ResultCategory => {
    if (score >= 38) return ResultCategory.Fit;
    if (score >= 24) return ResultCategory.Stable;
    return ResultCategory.Improvement;
  };

  const generateReport = useCallback(async (finalScore: number, finalAnswers: UserAnswer[]) => {
    setIsLoading(true);
    const category = getResultCategory(finalScore);
    const report = await generateFinancialReport(category, finalAnswers);
    setResultData({ category, report });
    setIsLoading(false);
  }, []);

  const handleAnswer = useCallback((score: number, questionText: string, answerText: string) => {
    const newScore = totalScore + score;
    const newAnswers = [...userAnswers, { question: questionText, answer: answerText }];
    
    setTotalScore(newScore);
    setUserAnswers(newAnswers);

    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < QUIZ_QUESTIONS.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      setQuizState(QuizState.Finished);
      generateReport(newScore, newAnswers);
    }
  }, [totalScore, userAnswers, currentQuestionIndex, generateReport]);

  const handleRestart = useCallback(() => {
    setQuizState(QuizState.Start);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTotalScore(0);
    setResultData(null);
    setIsLoading(false);
  }, []);

  const renderContent = () => {
    if (quizState === QuizState.Finished) {
      if (isLoading) {
        return <LoadingScreen />;
      }
      if (resultData) {
        return <Result category={resultData.category} report={resultData.report} onRestart={handleRestart} />;
      }
    }

    if (quizState === QuizState.InProgress) {
      return (
        <Quiz
          question={QUIZ_QUESTIONS[currentQuestionIndex]}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={QUIZ_QUESTIONS.length}
          onAnswer={handleAnswer}
        />
      );
    }

    return <WelcomeScreen onStart={handleStartQuiz} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
      <main className="container mx-auto">
        {renderContent()}
      </main>
      <footer className="text-center py-4 text-slate-500 text-sm">
        <p>This quiz is for educational purposes only. For financial advice, please consult a professional.</p>
      </footer>
    </div>
  );
};

export default App;
