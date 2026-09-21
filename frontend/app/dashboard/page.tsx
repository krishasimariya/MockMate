"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ROLES = [
  {
    title: "Full-Stack Developer",
    desc: "React, Next.js, Node.js, PostgreSQL & System APIs",
    tags: ["React", "Node.js", "SQL", "REST"],
    icon: <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
  },
  {
    title: "Frontend Engineer",
    desc: "React, TypeScript, CSS Architecture, Performance & Web APIs",
    tags: ["TypeScript", "React", "Tailwind", "State"],
    icon: <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>,
  },
  {
    title: "Backend Engineer",
    desc: "Python, FastAPI, Microservices, Databases & System Design",
    tags: ["Python", "FastAPI", "Docker", "PostgreSQL"],
    icon: <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  },
  {
    title: "AI / ML Engineer",
    desc: "LLMs, LangChain, RAG, PyTorch & Vector Databases",
    tags: ["PyTorch", "LLMs", "LangChain", "RAG"],
    icon: <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>,
  },
  {
    title: "System Design Expert",
    desc: "Distributed Systems, High Availability, Kafka & Cloud",
    tags: ["Microservices", "Kafka", "Redis", "AWS"],
    icon: <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>,
  },
  {
    title: "Behavioral & Leadership",
    desc: "STAR Method, Conflict Resolution, Team Leadership & Culture",
    tags: ["STAR Method", "Leadership", "Communication"],
    icon: <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/></svg>,
  },
];



const LEVELS = [
  { name: "Easy Level", desc: "Basic concepts & scenarios" },
  { name: "Medium Level", desc: "Intermediate knowledge" },
  { name: "Hard Level", desc: "Advanced design & edge cases" },
];

const DEFAULT_SKILLS_BY_ROLE: Record<string, string[]> = {
  "Full-Stack Developer": ["React", "Next.js", "Node.js", "PostgreSQL", "REST APIs", "TypeScript"],
  "Frontend Engineer": ["React", "TypeScript", "Tailwind CSS", "Next.js", "State Management", "Web Vitals"],
  "Backend Engineer": ["Python", "FastAPI", "Docker", "Redis", "PostgreSQL", "Microservices"],
  "AI / ML Engineer": ["PyTorch", "LangChain", "RAG Pipelines", "OpenAI APIs", "Python", "Vector DB"],
  "System Design Expert": ["Distributed Systems", "Kafka", "Redis Caching", "Kubernetes", "AWS Architecture"],
  "Behavioral & Leadership": ["STAR Method", "Cross-functional Leadership", "Conflict Resolution", "Agile Execution"],
};

export default function DashboardPage() {
  const router = useRouter();

  // Session state
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [selectedRole, setSelectedRole] = useState("Full-Stack Developer");
  const selectedType = "Voice AI Mock Interview";
  const [selectedLevel, setSelectedLevel] = useState("Medium Level");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [parsedSkills, setParsedSkills] = useState<string[]>(DEFAULT_SKILLS_BY_ROLE["Full-Stack Developer"]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");

  // Check session on mount
  useEffect(() => {
    const raw = localStorage.getItem("ai_user_session");
    if (!raw) {
      router.push("/login");
      return;
    }
    try {
      const session = JSON.parse(raw);
      setUserName(session.name || "Candidate");
      setUserEmail(session.email || "");
    } catch {
      router.push("/login");
    }
    setIsLoading(false);
  }, [router]);

  // Update default skills when role changes if no custom file uploaded
  const handleRoleSelect = (roleTitle: string) => {
    setSelectedRole(roleTitle);
    if (!resumeFile) {
      setParsedSkills(DEFAULT_SKILLS_BY_ROLE[roleTitle] || ["Software Engineering", "Algorithms", "System Design"]);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("ai_user_session");
    localStorage.removeItem("ai_interview_config");
    router.push("/login");
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    setResumeFile(file);
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      const skills = DEFAULT_SKILLS_BY_ROLE[selectedRole] || ["JavaScript", "Python", "REST APIs"];
      // Add simulated resume-specific skills
      const customAdded = ["Git / CI-CD", "Unit Testing", ...skills];
      setParsedSkills(Array.from(new Set(customAdded)));
    }, 1200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileChange(f);
  };

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    if (newSkillInput.trim() && !parsedSkills.includes(newSkillInput.trim())) {
      setParsedSkills([...parsedSkills, newSkillInput.trim()]);
      setNewSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setParsedSkills(parsedSkills.filter((s) => s !== skillToRemove));
  };

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsStarting(true);

    const config = {
      userName,
      userEmail,
      targetRole: selectedRole,
      interviewType: selectedType,
      interviewLevel: selectedLevel,
      resumeFileName: resumeFile?.name || "",
      resumeSkills: parsedSkills.join(", "),
    };

    // Save config to backend database (gracefully degrades if server unavailable)
    try {
      await fetch("http://127.0.0.1:8000/api/save-interview-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: userEmail,
          user_name: userName,
          target_role: selectedRole,
          interview_type: selectedType,
          interview_level: selectedLevel,
          resume_filename: resumeFile?.name || "",
          resume_skills: parsedSkills.join(", "),
        }),
      });
    } catch {
      // Offline fallback
    }

    // Save to localStorage for instant client hydration
    localStorage.setItem("ai_interview_config", JSON.stringify(config));
    setTimeout(() => router.push("/interview"), 600);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-slate-500 text-xs font-medium">Loading interview dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 relative overflow-hidden pb-16">

      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* ── Top Navigation / Executive Header ── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-sm shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Candidate Dashboard</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 font-semibold">
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Setup & customize your AI mock interview session</p>
            </div>
          </div>

          {/* User Profile Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                {userName ? userName.charAt(0).toUpperCase() : "C"}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 leading-tight">{userName}</p>
                <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{userEmail}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 text-slate-500 text-xs font-medium transition-all shadow-sm"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* ── Main Setup Container ── */}
        <form onSubmit={handleStartInterview}>
          <div className="p-6 sm:p-9 rounded-3xl bg-white/80 border border-slate-200 backdrop-blur-xl shadow-lg shadow-slate-200/50 space-y-9">
            
            {/* Header Banner */}
            <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg></span>
                  Configure Mock Interview Session
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Select your target role, preferred interview format, and seniority level to generate customized interview questions.
                </p>
              </div>
            </div>

            {/* Candidate Identity Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Candidate Display Name
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Active Selected Role
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    readOnly
                    value={selectedRole}
                    className="w-full pl-10 pr-4 py-2.5 bg-indigo-50/50 border border-indigo-200 rounded-xl text-sm text-indigo-700 font-semibold cursor-default"
                  />
                </div>
              </div>
            </div>

            {/* ── Section 1: Target Role Grid ── */}
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  1. Select Target Job Role
                </label>
                <span className="text-[11px] text-slate-400">Tailors technical questions & evaluation criteria</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {ROLES.map((role) => {
                  const isSelected = selectedRole === role.title;
                  return (
                    <button
                      key={role.title}
                      type="button"
                      onClick={() => handleRoleSelect(role.title)}
                      className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? "bg-indigo-50 border-indigo-300 shadow-md shadow-indigo-100 ring-1 ring-indigo-300"
                          : "bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <span className="text-2xl p-2 rounded-xl bg-white border border-slate-200 shrink-0 shadow-sm">
                          {role.icon}
                        </span>
                        <div>
                          <p className={`text-xs font-bold ${isSelected ? "text-indigo-800" : "text-slate-800"}`}>{role.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{role.desc}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-slate-100">
                        {role.tags.map((t) => (
                          <span
                            key={t}
                            className={`text-[9px] px-2 py-0.5 rounded-md font-medium ${
                              isSelected
                                ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                                : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>



            {/* ── Section 3: Seniority & Experience Level ── */}
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  3. Select Experience Level
                </label>
                <span className="text-[11px] text-slate-400">Sets question complexity & scoring depth</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {LEVELS.map((lvl) => {
                  const isSelected = selectedLevel === lvl.name;
                  return (
                    <button
                      key={lvl.name}
                      type="button"
                      onClick={() => setSelectedLevel(lvl.name)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-indigo-600 text-white border-transparent shadow-sm"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-sm"
                      }`}
                    >
                      <p className="text-xs font-bold leading-tight">{lvl.name}</p>
                      <p className={`text-[10px] mt-1 ${isSelected ? "text-white/80" : "text-slate-400"}`}>
                        {lvl.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Section 4: Resume Upload (Optional) ── */}
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  4. Upload Resume (Optional)
                </label>
                <span className="text-[11px] text-slate-400">Personalize questions according to your resume</span>
              </div>

              {/* Upload Box */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="w-full relative border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30 rounded-2xl p-7 text-center transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[140px]"
              >
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                />
                <div className="flex flex-col items-center gap-2 pointer-events-none">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  {resumeFile ? (
                    <div>
                      <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 justify-center">
                        <span>✓</span> {resumeFile.name}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {(resumeFile.size / 1024).toFixed(1)} KB · Click or drag to replace
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-slate-600">
                        Drag & drop your resume here or <span className="text-indigo-600 underline">Browse files</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">PDF or DOCX (Max 10MB)</p>
                    </div>
                  )}
                  {isUploading && (
                    <p className="text-xs text-indigo-500 flex items-center gap-1.5 mt-1 font-medium">
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Uploading and parsing resume...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Section 5: Session Overview Preview ── */}
            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <span><svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg></span> Session Overview Summary
                </p>
                <span className="text-[10px] text-indigo-600 font-medium">Ready for launch</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {[
                  { label: "Candidate", value: userName || "Candidate", icon: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
                  { label: "Target Role", value: selectedRole, icon: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> },
                  { label: "Format", value: selectedType, icon: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg> },
                  { label: "Seniority", value: selectedLevel, icon: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      <span>{icon}</span> {label}
                    </div>
                    <p className="font-bold text-slate-800 mt-1 truncate">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs text-center">
                {error}
              </div>
            )}

            {/* ── Start Button ── */}
            <button
              type="submit"
              disabled={isStarting}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-sm active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isStarting ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Preparing AI Voice Interview Room...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <span>Start AI Voice Interview Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
