
import React, { useMemo } from 'react';
import { ResultCategory } from '../types';

interface ResultProps {
  category: ResultCategory;
  report: string;
  onRestart: () => void;
}

interface ParsedReport {
  snapshot: { title: string; content: string };
  tips: { title: string; content: string[] };
  motivation: { title: string; content: string };
}

const parseReport = (reportText: string): ParsedReport => {
  const sections = reportText.split('## ').filter(s => s.trim() !== '');

  const parsed: ParsedReport = {
    snapshot: { title: '', content: '' },
    tips: { title: '', content: [] },
    motivation: { title: '', content: '' },
  };

  sections.forEach(section => {
    const lines = section.split('\n').filter(l => l.trim() !== '');
    const title = lines[0] || '';
    const content = lines.slice(1).join('\n');

    if (title.includes('Snapshot')) {
      parsed.snapshot = { title, content };
    } else if (title.includes('Tips')) {
      const tipsContent = content.split(/\d\.\s/).filter(t => t.trim() !== '');
      parsed.tips = { title, content: tipsContent };
    } else if (title.includes('Boost')) {
      parsed.motivation = { title, content };
    }
  });

  return parsed;
};

const Result: React.FC<ResultProps> = ({ category, report, onRestart }) => {
  const parsedReport = useMemo(() => parseReport(report), [report]);

  const categoryInfo = {
    [ResultCategory.Fit]: {
      emoji: "🏆",
      textColor: "text-green-600",
      bgColor: "bg-green-100",
      borderColor: "border-green-300",
    },
    [ResultCategory.Stable]: {
      emoji: "🙂",
      textColor: "text-blue-600",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-300",
    },
    [ResultCategory.Improvement]: {
      emoji: "🌱",
      textColor: "text-amber-600",
      bgColor: "bg-amber-100",
      borderColor: "border-amber-300",
    },
  };

  const info = categoryInfo[category];

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className={`text-center p-6 rounded-2xl border-2 ${info.bgColor} ${info.borderColor} mb-8`}>
        <h1 className={`text-3xl md:text-4xl font-extrabold ${info.textColor}`}>
          {category} {info.emoji}
        </h1>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-slate-800 mb-3">{parsedReport.snapshot.title}</h2>
          <p className="text-slate-600 leading-relaxed">{parsedReport.snapshot.content}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">{parsedReport.tips.title}</h2>
          <ul className="space-y-4">
            {parsedReport.tips.content.map((tip, index) => (
              <li key={index} className="flex items-start">
                <span className="text-teal-500 font-bold mr-3">💡</span>
                <p className="text-slate-600" dangerouslySetInnerHTML={{ __html: tip.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-slate-800 mb-3">{parsedReport.motivation.title}</h2>
          <p className="text-slate-600 italic leading-relaxed">{parsedReport.motivation.content}</p>
        </div>
      </div>
      
      <div className="text-center mt-10">
        <button
          onClick={onRestart}
          className="px-8 py-3 bg-teal-500 text-white font-bold rounded-full hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-transform transform hover:scale-105"
        >
          Take Quiz Again
        </button>
      </div>
    </div>
  );
};

export default Result;
