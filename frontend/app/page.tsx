"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<string>("Checking connection...");
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/")
      .then((res) => res.json())
      .then((data) => {
        setBackendStatus(data.message || "Connected");
        setIsBackendConnected(true);
      })
      .catch(() => {
        setBackendStatus("Offline (Ensure FastAPI is running on port 8000)");
        setIsBackendConnected(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 sm:px-12 py-6 max-w-7xl mx-auto w-full">
        {/* Left Side: Logo & Links */}
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              InterviewAI
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
            <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <Link href="#about" className="hover:text-slate-900 transition-colors">About Us</Link>
            <Link href="#contact" className="hover:text-slate-900 transition-colors">Contact</Link>
            <Link href="/dashboard" className="hover:text-slate-900 transition-colors">Dashboard</Link>
          </div>
        </div>

        {/* Right Side: Auth */}
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/login" className="text-slate-500 hover:text-slate-900 transition-colors hidden sm:block">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center pt-20 pb-16 px-6 flex-1 flex flex-col justify-center">
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-medium mb-10 shadow-sm mx-auto">
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendConnected === true
                ? "bg-green-500"
                : isBackendConnected === false
                ? "bg-red-500"
                : "bg-yellow-500"
            }`}
          />
          <span className="text-slate-600">
            System Status: {backendStatus}
          </span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-8">
          Master the technical <br className="hidden sm:block" /> interview.
        </h1>
        <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
          Realistic real-time voice mock interviews tailored for software engineers. 
          Practice coding, system design, and behavioral questions with instant AI feedback.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Start Voice Interview
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white border border-slate-200 text-slate-900 font-semibold text-base hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center"
          >
            View Dashboard
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-5xl mx-auto px-6 py-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Voice AI Simulation",
              desc: "Natural, conversational AI interviewer powered by real-time voice latency technology.",
              icon: <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>,
            },
            {
              title: "Resume Parsing",
              desc: "Upload your resume to automatically customize technical questions to your experience.",
              icon: <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
            },
            {
              title: "Tailored Practice",
              desc: "Practice for Frontend, Backend, Full-Stack, AI/ML, and System Design at your exact level.",
              icon: <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
            },
          ].map((feat) => (
             <div
               key={feat.title}
               className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
             >
               <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-xl mb-6">
                 {feat.icon}
               </div>
               <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
               <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
             </div>
          ))}
        </div>
      </section>
      {/* Mission & Vision */}
      <section id="about" className="w-full bg-slate-900 text-white py-20 px-6 mt-12">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12">Our Mission & Vision</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 text-left">
            <div>
              <svg className="w-10 h-10 text-indigo-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
              <h3 className="text-2xl font-bold mb-3">The Mission</h3>
              <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
                To democratize access to elite technical interview preparation. We believe that every candidate deserves the tools, practice, and feedback necessary to land their dream role, without paying thousands of dollars for coaching.
              </p>
            </div>
            <div>
              <svg className="w-10 h-10 text-indigo-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              <h3 className="text-2xl font-bold mb-3">The Vision</h3>
              <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
                To become the global standard for AI-assisted career development, creating a world where technical hiring is based purely on merit, preparedness, and skill—eliminating interview anxiety for good.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Why Choose InterviewAI?</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-base">Experience a fundamentally better way to prepare for your next big opportunity.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
          {[
            {
              title: "Overcome Interview Anxiety",
              desc: "Practice makes perfect. Replicate the pressure of a real interview in a safe environment so you can walk into the real thing feeling confident and prepared.",
              icon: <svg className="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            },
            {
              title: "Instant, Actionable Feedback",
              desc: "No more waiting days to hear back. Get immediate grading on your communication, technical accuracy, and problem-solving approach right after you finish.",
              icon: <svg className="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            },
            {
              title: "Available 24/7",
              desc: "Schedule mock interviews whenever it fits your calendar. Whether it's 2 PM or 2 AM, your AI interviewer is always ready to help you practice.",
              icon: <svg className="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            },
            {
              title: "Cost-Effective Preparation",
              desc: "Mock interviews with human experts can cost hundreds of dollars per session. Get unlimited practice across multiple roles at a fraction of the cost.",
              icon: <svg className="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            }
          ].map((benefit) => (
             <div key={benefit.title} className="flex gap-5">
               <div className="w-14 h-14 shrink-0 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl shadow-sm border border-indigo-100">
                 {benefit.icon}
               </div>
               <div>
                 <h3 className="text-lg font-bold text-slate-900 mb-2">{benefit.title}</h3>
                 <p className="text-sm text-slate-500 leading-relaxed">{benefit.desc}</p>
               </div>
             </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 text-sm text-slate-400 border-t border-slate-200 w-full mt-8">
        <p>© {new Date().getFullYear()} InterviewAI. All rights reserved.</p>
      </footer>
    </main>
  );
}
