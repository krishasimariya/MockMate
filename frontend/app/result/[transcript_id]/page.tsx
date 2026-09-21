"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface EvaluationMetrics {
  Confidence: number;
  Grammar: number;
  Communication: number;
  Answer_Quality: number;
  Technical_Score: number;
  Feedback: string;
}

interface EvaluationResult {
  transcript_id: string;
  user_email: string;
  metrics: EvaluationMetrics;
  created_at: string;
}

export default function ResultDashboard() {
  const params = useParams();
  const router = useRouter();
  const transcript_id = params?.transcript_id as string;

  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!transcript_id) return;

    const fetchEvaluation = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/evaluations/${transcript_id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch evaluation results");
        }
        const data = await res.json();
        setEvaluation(data.evaluation);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvaluation();
  }, [transcript_id]);

  const ScoreBar = ({ label, score, color, icon }: { label: string; score: number; color: string; icon: React.ReactNode }) => {
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
            <span>{icon}</span> {label}
          </span>
          <span className={`text-sm font-extrabold ${color.replace('bg-', 'text-')}`}>{score}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div
            className={`${color} h-3 rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center mb-4 shadow-sm">
             <svg className="w-8 h-8 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Analyzing Transcript...</h2>
          <p className="text-slate-500 text-sm mt-2">Performance is being evaluated...</p>
        </div>
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4 block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Evaluation Error</h2>
          <p className="text-slate-600 mb-6">{error || "Could not load the result dashboard."}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-md shadow-red-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { metrics } = evaluation;
  
  // Calculate average score
  const scores = [
    metrics.Confidence, 
    metrics.Grammar, 
    metrics.Communication, 
    metrics.Answer_Quality, 
    metrics.Technical_Score
  ];
  const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Interview Results
          </h1>
          <p className="text-slate-500 font-medium">Your personalized AI evaluation is ready</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Overall Score Card */}
          <div className="md:col-span-1 bg-white rounded-3xl p-8 shadow-xl shadow-indigo-100 border border-white flex flex-col items-center justify-center relative overflow-hidden group">
             <div className="absolute inset-0 bg-indigo-500/5 group-hover:opacity-100 transition-opacity"></div>
             
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Overall Score</h3>
             
             <div className="relative w-40 h-40 flex items-center justify-center rounded-full bg-indigo-50 border-[6px] border-white shadow-inner mb-4">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="74" cy="74" r="70" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                  <circle 
                    cx="74" cy="74" r="70" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    strokeDasharray="439.8" 
                    strokeDashoffset={439.8 - (439.8 * overallScore) / 100}
                    className="transition-all duration-1500 ease-out text-slate-800"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-center z-10">
                   <span className="text-5xl font-black text-slate-900">
                     {overallScore}
                   </span>
                   <span className="text-sm font-bold text-slate-400 block mt-1">/ 100</span>
                </div>
             </div>
             
             <p className="text-sm text-slate-600 text-center mt-2 font-medium">
                {overallScore >= 80 ? "Exceptional performance!" : 
                 overallScore >= 60 ? "Good effort, room to grow." : 
                 "Needs improvement. Keep practicing!"}
             </p>
          </div>

          {/* Metrics Card */}
          <div className="md:col-span-2 bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-white">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span><svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg></span> Performance Metrics
            </h3>
            
            <div className="space-y-5">
              <ScoreBar label="Technical Score" score={metrics.Technical_Score} color="bg-indigo-500" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>} />
              <ScoreBar label="Answer Quality" score={metrics.Answer_Quality} color="bg-blue-500" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
              <ScoreBar label="Communication" score={metrics.Communication} color="bg-purple-500" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>} />
              <ScoreBar label="Confidence" score={metrics.Confidence} color="bg-pink-500" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>} />
              <ScoreBar label="Grammar" score={metrics.Grammar} color="bg-emerald-500" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>} />
            </div>
          </div>
        </div>

        {/* Detailed Feedback */}
        <div className="mt-6 bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-white">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span><svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg></span> AI Feedback
          </h3>
          <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-6 text-slate-700 leading-relaxed font-medium">
            {metrics.Feedback}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <button 
            onClick={() => router.push("/dashboard")}
            className="px-8 py-3.5 bg-white text-slate-700 border border-slate-200 font-bold rounded-2xl hover:bg-slate-50 hover:shadow-md transition-all"
          >
            Back to Dashboard
          </button>
          <button 
            onClick={() => router.push("/interview")}
            className="px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl hover:shadow-sm transition-all"
          >
            Start New Interview
          </button>
        </div>
      </div>
    </main>
  );
}
