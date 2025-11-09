
import React from 'react';
import { Question, Option } from '../types';

interface QuizProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (score: number, questionText: string, answerText:string) => void;
}

const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => {
  const percentage = (current / total) * 100;
  return (
    <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4">
      <div
        className="bg-teal-500 h-2.5 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

const Quiz: React.FC<QuizProps> = ({ question, questionNumber, totalQuestions, onAnswer }) => {
  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-8">
       <div className="text-center mb-6">
        <p className="text-teal-600 font-semibold">
          Question {questionNumber} of {totalQuestions}
        </p>
        <ProgressBar current={questionNumber} total={totalQuestions} />
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg animate-fade-in">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 text-center mb-8">
            {question.text}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options.map((option: Option, index: number) => (
            <button
              key={index}
              onClick={() => onAnswer(option.score, question.text, option.text)}
              className="w-full p-4 text-left text-slate-700 bg-slate-100 rounded-lg border-2 border-transparent hover:bg-teal-100 hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200"
            >
              {option.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
