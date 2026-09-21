"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getVapi } from "@/lib/vapi";

interface Message {
  role: "user" | "assistant" | "system";
  text: string;
  ts: string;
}

const ROLE_QUESTIONS: Record<string, string[]> = {
  "Behavioral & Leadership": [
    "Tell me about a time you had to resolve a serious disagreement within your team. What was the conflict, and how did you reach an agreement?",
    "Can you share an example of a project where requirements changed unexpectedly? How did you adapt your plan and communicate with stakeholders?",
    "Describe a situation where you had to lead a critical initiative under tight deadlines. How did you prioritize tasks and keep the team motivated?",
    "Tell me about a mistake you made in a past role. What happened, what did you learn, and what would you do differently today?",
    "How do you handle giving difficult feedback to a peer or direct report while maintaining a positive working relationship?"
  ],
  "Full-Stack Developer": [
    "How do you approach architecting a scalable web application from frontend state management down to database schema design?",
    "Can you explain how you handle authentication and authorization across Next.js and backend microservices?",
    "What strategies do you use to optimize performance on both the client (e.g. Core Web Vitals) and the database query layer?",
    "Describe a complex API integration you built. What trade-offs did you consider between REST and GraphQL/WebSockets?",
    "How do you ensure test coverage across end-to-end user flows and backend business logic?"
  ],
  "Frontend Engineer": [
    "Can you explain the difference between Server Components and Client Components in Next.js App Router, and when to use each?",
    "How do you structure large-scale React applications to prevent unnecessary re-renders and keep bundle sizes small?",
    "Describe your approach to building an accessible, responsive design system with CSS and component libraries.",
    "How do you handle complex client-side state, caching, and optimistic UI updates?"
  ],
  "Backend Engineer": [
    "How do you design database schemas for high-concurrency read/write operations while ensuring ACID compliance?",
    "Can you walk me through your experience building asynchronous event-driven pipelines using message brokers like Kafka or RabbitMQ?",
    "What caching strategies (e.g. Redis Cache-Aside, Write-Through) do you implement to reduce database load?",
    "How do you monitor, log, and trace distributed requests across microservices?"
  ],
  "AI / ML Engineer": [
    "Can you explain how you design and evaluate a Retrieval-Augmented Generation (RAG) pipeline for domain-specific knowledge?",
    "What strategies do you use to minimize hallucination and latency in production LLM applications?",
    "How do you choose between fine-tuning a foundation model versus prompt engineering and contextual retrieval?",
    "What vector database indexing algorithms (e.g. HNSW, IVF) do you recommend for high-dimensional semantic search?"
  ],
  "System Design Expert": [
    "How would you design a URL shortener like Bitly capable of handling 100M active daily users with high availability?",
    "What architectural patterns would you use to design a globally distributed real-time chat application with minimal latency?",
    "How do you handle database sharding and data consistency across distributed replicas?",
    "How would you architect a rate-limiting service to prevent DDoS and API abuse in a microservices ecosystem?"
  ]
};

export default function VoiceInterviewPage() {
  const router = useRouter();

  // Suppress known Vapi/Daily WebRTC transport disconnect errors from polluting the Next.js error overlay
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('send transport changed to disconnected') ||
         args[0].includes('recv transport changed to disconnected'))
      ) {
        return;
      }
      originalError.apply(console, args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

  // Candidate configuration
  const [candidateName, setCandidateName] = useState("Candidate");
  const [targetRole, setTargetRole] = useState("Behavioral & Leadership");
  const [interviewLevel, setInterviewLevel] = useState("Mid-Level Engineer");
  const [interviewType, setInterviewType] = useState("Voice AI Mock Interview");
  const [resumeSkills, setResumeSkills] = useState("");

  // Engine selection: 'browser' or 'vapi'
  const [engineMode, setEngineMode] = useState<"browser" | "vapi">("browser");

  // Call states
  const [isCalling, setIsCalling] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const [copied, setCopied] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);

  // Live speech & typed answer inputs
  const [liveTranscript, setLiveTranscript] = useState("");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);

  // Vapi API settings
  const [showConfig, setShowConfig] = useState(false);
  const [vapiKey, setVapiKey] = useState("");
  const [assistantId, setAssistantId] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Transcripts & refs
  const [messages, setMessages] = useState<Message[]>([]);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const vapiRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Check browser speech support on mount
  useEffect(() => {
    const session = localStorage.getItem("ai_user_session");
    const config = localStorage.getItem("ai_interview_config");
    const savedKey = localStorage.getItem("vapi_public_key") || process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "";
    const savedAssistant = localStorage.getItem("vapi_assistant_id") || process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "";
    const savedEngine = (localStorage.getItem("ai_voice_engine") as "browser" | "vapi") || "browser";

    if (savedKey && !savedKey.includes("YOUR_")) setVapiKey(savedKey);
    if (savedAssistant && !savedAssistant.includes("YOUR_")) setAssistantId(savedAssistant);
    setEngineMode(savedEngine);

    if (typeof window !== "undefined") {
      if ("speechSynthesis" in window) {
        synthRef.current = window.speechSynthesis;
      }
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) {
        setSpeechSupported(false);
      }
    }

    if (!session) {
      router.push("/login");
      return;
    }

    try {
      const s = JSON.parse(session);
      if (s.name) setCandidateName(s.name);
    } catch {}

    if (config) {
      try {
        const c = JSON.parse(config);
        if (c.targetRole) setTargetRole(c.targetRole);
        if (c.interviewLevel) setInterviewLevel(c.interviewLevel);
        if (c.interviewType) setInterviewType(c.interviewType);
        if (c.resumeSkills) setResumeSkills(c.resumeSkills);
        if (c.userName) setCandidateName(c.userName);
      } catch {}
    }
  }, [router]);

  const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const addMsg = (role: Message["role"], text: string) =>
    setMessages((prev) => [...prev, { role, text, ts: now() }]);

  // Welcome greeting
  useEffect(() => {
    if (candidateName) {
      setMessages([
        {
          role: "system",
          text: `Welcome ${candidateName}! You are configured for a "${interviewType}" session for ${targetRole} (${interviewLevel}). Click "Start Voice Interview Now" to begin.`,
          ts: now(),
        },
      ]);
    }
  }, [candidateName, targetRole, interviewLevel, interviewType]);

  // Auto scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTo({
        top: transcriptRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, liveTranscript]);

  // Call timer
  useEffect(() => {
    if (isCalling) {
      timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCalling]);

  // Setup Real Microphone Volume Analyzer
  const setupAudioAnalyzer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!mediaStreamRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(avg / 100, 1);
        if (normalized > 0.05) {
          setVolumeLevel(normalized);
        } else {
          setVolumeLevel(0);
        }
        requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (err) {
      console.warn("Microphone stream error:", err);
    }
  };

  // -------------------------------------------------------------
  // Built-in Browser Voice Engine (Web Speech API)
  // -------------------------------------------------------------
  const speakWithBrowserVoice = (text: string, onEndCallback?: () => void) => {
    if (!synthRef.current) {
      if (onEndCallback) onEndCallback();
      return;
    }

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = synthRef.current.getVoices();
    const englishVoice =
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha"))
      ) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0];

    if (englishVoice) utterance.voice = englishVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsListening(false);
      setVolumeLevel(0.6);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setVolumeLevel(0);
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setVolumeLevel(0);
      if (onEndCallback) onEndCallback();
    };

    synthRef.current.speak(utterance);
  };

  const startBrowserListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsListening(false);
      addMsg("system", "💡 Tip: Microphone speech-to-text is not supported in this browser. You can type your answer below or use Chrome/Edge.");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += trans;
          } else {
            interim += trans;
          }
        }

        if (final.trim()) {
          setLiveTranscript("");
          addMsg("user", final.trim());
          processCandidateAnswer(final.trim());
        } else if (interim.trim()) {
          setLiveTranscript(interim.trim());
        }
      };

      recognition.onerror = (e: any) => {
        console.warn("Speech recognition notice:", e.error);
        if (e.error === "network" || e.error === "not-allowed" || e.error === "service-not-allowed") {
          setIsListening(false);
          addMsg("system", "🎙️ Mic Note: If your browser (e.g. Brave) blocks Google Speech Services, you can speak and also click 'Submit Answer' or type your response in the box below!");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Failed to start speech recognition:", err);
    }
  };

  // Submit Answer (from Speech or Typed input)
  const submitManualAnswer = (customText?: string) => {
    const ans = customText || typedAnswer || liveTranscript;
    if (!ans || !ans.trim()) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    setLiveTranscript("");
    setTypedAnswer("");
    addMsg("user", ans.trim());
    processCandidateAnswer(ans.trim());
  };

  const processCandidateAnswer = (candidateAnswer: string) => {
    const questions = ROLE_QUESTIONS[targetRole] || ROLE_QUESTIONS["Behavioral & Leadership"];
    const nextIdx = questionIndex + 1;

    setIsListening(false);

    setTimeout(() => {
      if (nextIdx < questions.length) {
        setQuestionIndex(nextIdx);
        const nextQ = `Great response! Here is your next question: ${questions[nextIdx]}`;
        addMsg("assistant", nextQ);
        speakWithBrowserVoice(nextQ, () => {
          startBrowserListening();
        });
      } else {
        const wrapUp = `Thank you ${candidateName}. That concludes our mock interview session! You demonstrated excellent communication and structured answers. Great job!`;
        addMsg("assistant", wrapUp);
        speakWithBrowserVoice(wrapUp, () => {
          setIsCalling(false);
          setIsConnecting(false);
          completeAndEvaluate();
        });
      }
    }, 600);
  };

  // -------------------------------------------------------------
  // Start Voice Interview Flow
  // -------------------------------------------------------------
  const handleStart = async () => {
    setIsConnecting(true);
    await setupAudioAnalyzer();

    // Vapi Cloud Engine
    if (engineMode === "vapi") {
      if (!vapiKey || vapiKey.includes("YOUR_")) {
        setIsConnecting(false);
        addMsg("system", "⚠️ Cannot start Vapi: Please enter your Vapi Public Key in the Voice Engine settings first.");
        return;
      }
      
      addMsg("system", `Connecting to Vapi Cloud Voice Engine for ${targetRole}...`);
      try {
        const vapi = getVapi(vapiKey);
        vapiRef.current = vapi;

        vapi.on("call-start", () => {
          setIsConnecting(false);
          setIsCalling(true);
          addMsg("system", "Voice AI Interview session initiated via Vapi! Listening...");
        });

        vapi.on("call-end", () => {
          setIsCalling(false);
          setIsConnecting(false);
          setIsSpeaking(false);
          setVolumeLevel(0);
          addMsg("system", "Interview session completed.");
        });

        vapi.on("speech-start", () => setIsSpeaking(true));
        vapi.on("speech-end", () => setIsSpeaking(false));
        vapi.on("volume-level", (v: number) => setVolumeLevel(v));

        vapi.on("message", (m: any) => {
          if (m.type === "transcript" && m.transcriptType === "final") {
            addMsg(m.role === "user" ? "user" : "assistant", m.transcript);
          }
        });

        vapi.on("error", (e: any) => {
          setIsConnecting(false);
          setIsCalling(false);
          addMsg("system", `Vapi Error: ${e?.message || "Connection failed. Please check your Vapi Public Key."}`);
        });

        if (assistantId && !assistantId.includes("YOUR_")) {
          await vapi.start(assistantId);
        } else {
          const vapiConfig: any = {
            name: "AI Technical Interviewer",
            model: {
              provider: "openai" as const,
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "system" as const,
                  content: `You are an expert AI Technical Interviewer interviewing ${candidateName} for ${targetRole} (${interviewLevel}). Ask one clear question at a time.`,
                },
              ],
            },
            voice: { provider: "11labs" as const, voiceId: "paula" },
          };
          console.log("✅ Starting Vapi with model configuration:", vapiConfig.model);
          await vapi.start(vapiConfig);
        }
        return;
      } catch (err: any) {
        console.warn("Vapi connection failed:", err);
        setIsConnecting(false);
        addMsg("system", `⚠️ Vapi initialization failed: ${err.message}`);
        return;
      }
    }

    // Built-in Browser Voice Engine
    try {
      setIsConnecting(false);
      setIsCalling(true);
      setQuestionIndex(0);

      const questions = ROLE_QUESTIONS[targetRole] || ROLE_QUESTIONS["Behavioral & Leadership"];
      const firstQ = `Hello ${candidateName}! Welcome to your ${targetRole} mock interview. Let's begin with our first question: ${questions[0]}`;

      addMsg("system", "🎙️ Voice AI Interview started (Microphone Active). Answer by speaking or typing below!");
      addMsg("assistant", firstQ);

      speakWithBrowserVoice(firstQ, () => {
        startBrowserListening();
      });
    } catch (err: any) {
      setIsConnecting(false);
      setIsCalling(false);
      addMsg("system", `Voice initialization error: ${err.message}`);
    }
  };

  const handleEnd = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (vapiRef.current) {
      try {
        vapiRef.current.stop();
      } catch {}
    }
    setIsCalling(false);
    setIsConnecting(false);
    setIsSpeaking(false);
    setIsListening(false);
    setVolumeLevel(0);
    completeAndEvaluate();
  };

  const completeAndEvaluate = async () => {
    setIsEvaluating(true);
    addMsg("system", "Saving interview transcript and generating AI evaluation...");
    
    try {
      const sessionStr = localStorage.getItem("ai_user_session");
      const userEmail = sessionStr ? JSON.parse(sessionStr).email : "candidate@example.com";
      
      // 1. Save Transcript
      const saveRes = await fetch("http://127.0.0.1:8000/api/save-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: userEmail,
          user_name: candidateName,
          target_role: targetRole,
          interview_level: interviewLevel,
          messages: messages.map(m => ({ role: m.role, text: m.text, ts: m.ts }))
        })
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.detail || "Failed to save transcript");
      
      const transcriptId = saveData.transcript_id;
      
      // 2. Evaluate Transcript
      const evalRes = await fetch(`http://127.0.0.1:8000/api/evaluate-transcript/${transcriptId}`, {
        method: "POST"
      });
      if (!evalRes.ok) throw new Error("Failed to evaluate transcript");
      
      // 3. Redirect
      router.push(`/result/${transcriptId}`);
    } catch (err: any) {
      console.error(err);
      addMsg("system", `Evaluation Error: ${err.message}`);
      setIsEvaluating(false);
    }
  };

  const handleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (next) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      setIsListening(false);
    } else {
      if (!isSpeaking) {
        startBrowserListening();
      }
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem("vapi_public_key", vapiKey.trim());
    localStorage.setItem("vapi_assistant_id", assistantId.trim());
    localStorage.setItem("ai_voice_engine", engineMode);
    setShowConfig(false);
    addMsg(
      "system",
      `Voice Engine switched to: ${
        engineMode === "browser" ? "Built-in Browser Voice AI (Free)" : "Vapi Cloud Voice AI"
      }`
    );
  };

  const handleCopyTranscript = () => {
    const text = messages
      .map(
        (m) =>
          `[${m.ts}] ${
            m.role === "user" ? candidateName : m.role === "assistant" ? "AI Interviewer" : "System"
          }: ${m.text}`
      )
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 flex flex-col relative overflow-hidden">
      {/* Ambient background glow */}
      <div
        className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl transition-all duration-700 pointer-events-none ${
          isCalling
            ? isSpeaking
              ? "bg-purple-200/40 scale-110"
              : isListening
              ? "bg-emerald-200/35 scale-105"
              : "bg-indigo-200/30"
            : "bg-indigo-100/20"
        }`}
      />

      {/* ── Topbar ── */}
      <header className="relative z-10 border-b border-slate-200 bg-white/90 backdrop-blur-xl px-5 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all border border-slate-200 cursor-pointer"
            title="Back to Dashboard"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">AI Voice Interview Room</h1>
              <p className="text-[10px] text-slate-500">
                {candidateName} · {targetRole} · {interviewLevel}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Active Voice Engine Badge */}
          <span className="hidden sm:inline-flex text-[11px] px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            {engineMode === "browser" ? "Built-in Voice AI (Free)" : "Vapi Cloud AI"}
          </span>

          {/* Live Call Duration */}
          {isCalling && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 font-mono text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>LIVE {fmt(callDuration)}</span>
            </div>
          )}

          {/* Voice Settings Button */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 text-xs flex items-center gap-1.5 transition-all font-medium cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Voice Engine</span>
          </button>
        </div>
      </header>

      {/* ── Voice Settings Modal ── */}
      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-4 max-w-md w-full animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span><svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg></span> Choose Voice AI Engine
              </p>
              <button
                onClick={() => setShowConfig(false)}
                className="text-slate-400 hover:text-slate-700 text-sm p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Engine Selector */}
            <div className="space-y-2.5">
              <label
                onClick={() => setEngineMode("browser")}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  engineMode === "browser"
                    ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200"
                    : "bg-slate-50 border-slate-200 hover:bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="engine"
                  checked={engineMode === "browser"}
                  onChange={() => setEngineMode("browser")}
                  className="mt-1 accent-indigo-600"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    Built-in Browser Voice AI
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                      Instant & Free
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Uses browser speech synthesis & microphone. Works immediately without any API keys or paid accounts!
                  </p>
                </div>
              </label>

              <label
                onClick={() => setEngineMode("vapi")}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  engineMode === "vapi"
                    ? "bg-purple-50 border-purple-300 ring-2 ring-purple-200"
                    : "bg-slate-50 border-slate-200 hover:bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="engine"
                  checked={engineMode === "vapi"}
                  onChange={() => setEngineMode("vapi")}
                  className="mt-1 accent-purple-600"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    Vapi Cloud Voice AI
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">
                      Cloud Latency
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Ultra-low latency conversational AI streamed from Vapi cloud. Requires your Vapi Public Key.
                  </p>
                </div>
              </label>
            </div>

            {/* Vapi Credentials fields if Vapi is selected */}
            {engineMode === "vapi" && (
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-500 mb-1 font-semibold uppercase tracking-wider">
                    Vapi Public Key
                  </p>
                  <input
                    type="password"
                    value={vapiKey}
                    onChange={(e) => setVapiKey(e.target.value)}
                    placeholder="Enter your Vapi Public Key (UUID)..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-1 font-semibold uppercase tracking-wider">
                    Assistant ID (Optional)
                  </p>
                  <input
                    type="text"
                    value={assistantId}
                    onChange={(e) => setAssistantId(e.target.value)}
                    placeholder="Enter Assistant ID if created in Vapi..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleSaveSettings}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              Save Engine Preferences
            </button>
          </div>
        </div>
      )}

      {/* ── Evaluating Overlay ── */}
      {isEvaluating && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center mb-4 shadow-sm">
               <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
               </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Analyzing Performance</h2>
            <p className="text-indigo-200 text-sm">Performance is being evaluated...</p>
          </div>
        </div>
      )}

      {/* ── Main Layout Grid ── */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-6 max-w-7xl mx-auto w-full my-auto">
        
        {/* ── LEFT: Voice Visualizer & Controls ── */}
        <div className="lg:col-span-5 flex flex-col items-center justify-between p-6 rounded-3xl bg-white/85 border border-slate-200 backdrop-blur-xl shadow-lg relative min-h-[420px]">
          
          {/* Header Status */}
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-semibold">
              <span
                className={`w-2 h-2 rounded-full ${
                  isCalling
                    ? isSpeaking
                      ? "bg-purple-500 animate-pulse"
                      : isListening
                      ? "bg-emerald-500 animate-ping"
                      : "bg-indigo-500"
                    : isConnecting
                    ? "bg-amber-500 animate-ping"
                    : "bg-slate-400"
                }`}
              />
              <span className="text-slate-700 font-medium">
                {isConnecting
                  ? "Connecting Voice Engine..."
                  : isCalling
                  ? isSpeaking
                    ? "AI Interviewer Speaking..."
                    : isListening
                    ? (
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                        Listening to you now...
                      </span>
                    )
                    : "Listening for your response..."
                  : "Ready to Start Interview"}
              </span>
            </div>
          </div>

          {/* Concentric Pulsing Mic Visualizer */}
          <div className="relative flex items-center justify-center my-6">
            {isCalling && (
              <>
              </>
            )}
            
            <div
              className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                isCalling
                  ? isSpeaking
                    ? "bg-indigo-600 scale-105"
                    : isListening
                    ? "bg-indigo-500 scale-105"
                    : "bg-indigo-500"
                  : "bg-slate-200 border border-slate-300"
              }`}
            >
              <svg className={`w-12 h-12 ${isCalling ? "text-white" : "text-slate-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
          </div>

          {/* Real-time Listening Transcript Box */}
          {isCalling && (
            <div className="w-full mb-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center min-h-[38px] flex items-center justify-center">
              {liveTranscript ? (
                <p className="text-xs text-indigo-700 font-medium animate-pulse flex items-center gap-1.5 justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                  Hearing: &ldquo;{liveTranscript}&rdquo;
                </p>
              ) : isSpeaking ? (
                <p className="text-xs text-purple-700 font-medium flex items-center gap-1.5 justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z"/></svg>
                  AI Interviewer is asking question...
                </p>
              ) : (
                <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5 justify-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Speak into your mic or use the text box on the right
                </p>
              )}
            </div>
          )}

          {/* Action Control Buttons */}
          <div className="w-full flex flex-col items-center gap-3">
            {!isCalling ? (
              <button
                onClick={handleStart}
                disabled={isConnecting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer"
              >
                {isConnecting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Connecting Voice Engine...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <span>Start Voice Interview Now</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2.5 w-full justify-center">
                {/* Submit Spoken Answer Button */}
                {liveTranscript && (
                  <button
                    onClick={() => submitManualAnswer()}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer animate-bounce"
                  >
                    <span>✓ Submit Spoken Answer</span>
                  </button>
                )}

                <button
                  onClick={handleMute}
                  className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer ${
                    isMuted
                      ? "bg-red-50 border-red-200 text-red-600"
                      : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        isMuted
                          ? "M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                          : "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      }
                    />
                  </svg>
                  <span>{isMuted ? "Unmute Mic" : "Mute Mic"}</span>
                </button>

                <button
                  onClick={handleEnd}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                  </svg>
                  <span>End Interview</span>
                </button>
              </div>
            )}

            {/* Target Role Pills */}
            <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
              {[targetRole, interviewType, interviewLevel].map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Real-Time Conversation Transcript & Input Bar ── */}
        <div className="lg:col-span-7 flex flex-col rounded-3xl bg-white/85 border border-slate-200 backdrop-blur-xl shadow-lg h-[490px] lg:h-auto overflow-hidden">
          {/* Transcript Header */}
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Live Conversation Transcript
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {isCalling && (
                <span className="text-[10px] text-emerald-600 font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE AUDIO
                </span>
              )}
              {messages.length > 1 && (
                <button
                  onClick={handleCopyTranscript}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium border border-slate-200 transition-all cursor-pointer"
                >
                  {copied ? "✓ Copied" : "Copy Transcript"}
                </button>
              )}
            </div>
          </div>

          {/* Transcript Messages Feed */}
          <div ref={transcriptRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${
                  msg.role === "user"
                    ? "items-end"
                    : msg.role === "assistant"
                    ? "items-start"
                    : "items-center"
                }`}
              >
                {msg.role === "system" ? (
                  <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 max-w-[90%] text-center shadow-sm">
                    {msg.text}
                  </div>
                ) : (
                  <div className="max-w-[85%]">
                    <div
                      className={`flex items-center gap-1.5 mb-1 px-1 ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span className="text-[10px] font-bold text-slate-600">
                        {msg.role === "user" ? candidateName : "AI Interviewer"}
                      </span>
                      <span className="text-[9px] text-slate-400">• {msg.ts}</span>
                    </div>

                    <div
                      className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white rounded-tr-none shadow-sm"
                          : "bg-slate-50 text-slate-800 rounded-tl-none border border-slate-200 shadow-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Live Typing/Speech Interim Bubble */}
            {liveTranscript && (
              <div className="flex flex-col items-end">
                <div className="text-[10px] font-bold text-indigo-600 mb-1 px-1">{candidateName} (Speaking...)</div>
                <div className="px-4 py-3 rounded-2xl rounded-tr-none bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs italic">
                  {liveTranscript}
                </div>
              </div>
            )}

            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center h-full text-center p-6 text-slate-400 space-y-2">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <p className="text-xs">Live transcription of spoken questions and candidate responses will appear here.</p>
              </div>
            )}
          </div>

          {/* ── Optional Quick Answer Input Bar ── */}
          {isCalling && (
            <div className="p-3 border-t border-slate-200 bg-slate-50/80 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitManualAnswer();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  placeholder="Type your answer or speak into microphone..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
                <button
                  type="submit"
                  disabled={!typedAnswer.trim() && !liveTranscript}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                >
                  <span>Submit Answer</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-3 text-[10px] text-slate-400 border-t border-slate-200">
        Enterprise AI Mock Interview Engine · Multi-Mode Voice Simulation Platform
      </footer>
    </main>
  );
}
