import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  BarChart3, 
  RotateCcw, 
  Cpu,
  ShieldCheck,
  Zap,
  ArrowRight,
  BookOpen,
  Upload,
  XCircle,
  FileCheck,
  FileText,
  Target,
  Trophy,
  BrainCircuit,
  Settings2,
  Database,
  Globe,
  Server,
  Microchip
} from 'lucide-react';

// INBUILT JOB REQUIREMENTS (Benchmarks)
const CATEGORY_DATA = {
  Frontend: {
    icon: <Globe size={18} />,
    benchmarkTitle: "Senior Frontend Engineer (Tier 1 Tech)",
    benchmarkDescription: "Expertise in React 18+, TypeScript, and modern state management (Redux/Zustand). Deep understanding of CSS/Tailwind, Browser APIs, Performance Optimization, and Unit Testing with Jest/Cypress. Experience with Next.js, Webpack/Vite, and CI/CD pipelines. Knowledge of accessibility (a11y) and responsive design systems is mandatory.",
    keywords: ['React', 'Vue', 'Angular', 'Tailwind', 'JavaScript', 'TypeScript', 'CSS', 'HTML', 'Redux', 'Next.js', 'Webpack', 'Vite', 'Testing Library', 'Jest', 'GitHub', 'Figma', 'SASS', 'Accessibility', 'Performance'],
    suggestions: 'Focus on building responsive UIs, state management efficiency, and performance optimization.'
  },
  Backend: {
    icon: <Server size={18} />,
    benchmarkTitle: "Systems Architect / Backend Lead",
    benchmarkDescription: "Proficiency in Node.js, Python, or Go. Extensive experience with distributed systems, Microservices architecture, and REST/GraphQL API design. Expertise in PostgreSQL, MongoDB, and Redis caching strategies. Must understand Docker, Kubernetes, and system security protocols. Experience with message brokers like RabbitMQ or Kafka is preferred.",
    keywords: ['Node.js', 'Python', 'Go', 'Java', 'Postgres', 'MongoDB', 'Redis', 'Docker', 'GraphQL', 'REST', 'Microservices', 'Express', 'Django', 'Spring Boot', 'GitHub', 'SQL', 'Kafka', 'Security', 'Distributed Systems'],
    suggestions: 'Highlight experience with system design, database optimization, and robust API security.'
  },
  'Cloud/DevOps': {
    icon: <Cpu size={18} />,
    benchmarkTitle: "Cloud Infrastructure & SRE Specialist",
    benchmarkDescription: "Deep knowledge of AWS, Azure, or GCP services. Professional experience with Infrastructure as Code (Terraform/CloudFormation) and Container Orchestration (Kubernetes). Mastery of CI/CD pipelines (Jenkins/GitHub Actions). Strong Linux administration, networking (VPC/DNS), and monitoring (Prometheus/Grafana) skills.",
    keywords: ['AWS', 'Azure', 'GCP', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Jenkins', 'Ansible', 'Linux', 'CloudFormation', 'Monitoring', 'Prometheus', 'GitHub', 'SRE', 'VPC', 'Grafana', 'Networking'],
    suggestions: 'Emphasize infrastructure as code (IaC), scalability, and automated deployment pipelines.'
  },
  Data: {
    icon: <Database size={18} />,
    benchmarkTitle: "Lead Data Engineer / Analytics Manager",
    benchmarkDescription: "Expert SQL skills and Python/R proficiency. Experience building scalable ETL/ELT pipelines with Spark or Airflow. Familiarity with Data Warehousing (Snowflake/BigQuery) and Data Lakes. Ability to create complex visualizations in Tableau/PowerBI and perform advanced statistical analysis with Pandas and Matplotlib.",
    keywords: ['SQL', 'Python', 'R', 'Tableau', 'PowerBI', 'Pandas', 'Spark', 'Hadoop', 'Warehouse', 'ETL', 'Snowflake', 'Statistics', 'Matplotlib', 'GitHub', 'DataLake', 'Airflow', 'BigQuery'],
    suggestions: 'Showcase data storytelling, complex ETL pipeline development, and predictive modeling.'
  },
  'AI/ML': {
    icon: <Microchip size={18} />,
    benchmarkTitle: "Machine Learning / GenAI Researcher",
    benchmarkDescription: "Strong background in Deep Learning using PyTorch or TensorFlow. Experience with Large Language Models (LLMs), Prompt Engineering, and Vector Databases (Pinecone/Milvus). Proficiency in NLP, Computer Vision, and Scikit-learn. Familiarity with MLOps practices, model fine-tuning, and deployment of scalable inference endpoints.",
    keywords: ['PyTorch', 'TensorFlow', 'Scikit-learn', 'NLP', 'Vision', 'LLM', 'Prompting', 'Keras', 'Reinforcement', 'MLOps', 'Vector', 'GitHub', 'HuggingFace', 'Fine-tuning', 'Transformers'],
    suggestions: 'Focus on model evaluation metrics, fine-tuning techniques, and deployment of inference endpoints.'
  }
};

const App = () => {
  const [resumeText, setResumeText] = useState('');
  const [category, setCategory] = useState('Frontend');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!window.pdfjsLib) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.async = true;
      script.onload = () => {
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        window.pdfjsLib = pdfjsLib;
      };
      document.head.appendChild(script);
    }
  }, []);

  const resetAll = () => {
    setResumeText('');
    setResults(null);
    setUploadedFileName('');
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const extractPdfText = async (data) => {
    if (!window.pdfjsLib) throw new Error("Initializing PDF engine...");
    const loadingTask = window.pdfjsLib.getDocument({ data });
    const pdf = await loadingTask.promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
    }
    return fullText;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError('');
    setIsUploading(true);
    setUploadedFileName(file.name);
    try {
      const reader = new FileReader();
      if (file.type === "application/pdf") {
        reader.onload = async (event) => {
          try {
            const text = await extractPdfText(new Uint8Array(event.target.result));
            setResumeText(text);
          } catch (err) { setUploadError("Parsing failed."); setUploadedFileName(''); }
          setIsUploading(false);
        };
        reader.readAsArrayBuffer(file);
      } else {
        reader.onload = (event) => { setResumeText(event.target.result); setIsUploading(false); };
        reader.readAsText(file);
      }
    } catch (err) { setIsUploading(false); }
  };

  const analyzeMatch = () => {
    if (!resumeText) return;
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const resumeWords = resumeText.toLowerCase().split(/[\W_]+/).filter(Boolean);
      const activeCat = CATEGORY_DATA[category];
      const benchmarkWords = activeCat.benchmarkDescription.toLowerCase().split(/[\W_]+/).filter(Boolean);
      const catKeywords = activeCat.keywords.map(k => k.toLowerCase());

      // Use inbuilt keywords + relevant benchmark words as the target
      const targetKeywords = [...new Set([...catKeywords, ...benchmarkWords.filter(w => w.length > 5)])];

      const foundInResume = targetKeywords.filter(word => 
        resumeWords.some(r => r.includes(word) || word.includes(r))
      );
      
      const missingFromResume = targetKeywords.filter(word => 
        !resumeWords.some(r => r.includes(word) || word.includes(r))
      ).slice(0, 12); // Limit for display

      const score = Math.min(Math.max(Math.round((foundInResume.length / targetKeywords.length) * 100), 10), 98);

      setResults({
        score,
        found: foundInResume.map(s => s.toUpperCase()).slice(0, 15),
        missing: missingFromResume.map(s => s.toUpperCase()),
        suggestions: [activeCat.suggestions, "Ensure your resume quantifies achievements with metrics (e.g., 'Reduced latency by 20%')."],
        roles: [category + ' Specialist', 'Lead Architect'].slice(0, score > 60 ? 2 : 1)
      });
      setIsAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#05060b] text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden pb-12">
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-12">
        <header className="flex flex-col items-center text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-widest uppercase">
            <BrainCircuit size={14} className="animate-pulse" />
            <span>Autonomous Talent Evaluator</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 tracking-tighter">
            AI <span className="text-blue-500">RESUME–JOB</span> MATCH ANALYZER
          </h1>
          <p className="text-slate-500 max-w-xl text-lg font-medium">
            Scan your resume against inbuilt, industry-standard role requirements for Tier 1 tech companies.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#0c0e17]/80 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] shadow-2xl">
              <div className="mb-10">
                <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                  <Target size={14} /> 1. Select Target Role (Inbuilt Benchmarks)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {Object.keys(CATEGORY_DATA).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setCategory(cat); setResults(null); }}
                      className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all ${
                        category === cat 
                          ? 'bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-600/20' 
                          : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                      }`}
                    >
                      {CATEGORY_DATA[cat].icon}
                      <span className="text-[10px] font-black uppercase tracking-tighter">{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Inbuilt Requirement Display */}
              <div className="mb-10 p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-blue-400 font-bold text-sm uppercase tracking-wide">
                    {CATEGORY_DATA[category].benchmarkTitle}
                  </h4>
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[9px] font-black rounded border border-blue-500/30 tracking-widest">SYSTEM BENCHMARK</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed italic">
                  "{CATEGORY_DATA[category].benchmarkDescription}"
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    <FileText size={14} /> 2. Provide Your Resume
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl text-[10px] font-black transition-all hover:bg-blue-500 hover:text-white"
                  >
                    <Upload size={12} /> {isUploading ? 'PARSING...' : 'UPLOAD PDF'}
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.txt" className="hidden" />
                </div>

                <div className="relative group">
                  <textarea
                    className="w-full h-72 bg-slate-950/50 border border-slate-800/50 rounded-[1.5rem] p-6 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all resize-none placeholder:text-slate-800 font-mono text-xs leading-relaxed"
                    placeholder="Upload your document or paste the raw text here for neural alignment..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                  {!resumeText && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-5">
                      <FileText size={48} className="mb-2" />
                      <p className="text-[10px] uppercase font-black">Awaiting Input</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={analyzeMatch}
                disabled={isAnalyzing || !resumeText}
                className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-20 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
              >
                {isAnalyzing ? <RotateCcw size={16} className="animate-spin" /> : <Zap size={16} />}
                Run Alignment Scan
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-5 space-y-6">
            {!results && !isAnalyzing ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-900/10 border-2 border-slate-800 border-dashed rounded-[2.5rem] p-12 text-center opacity-40">
                <Search size={40} className="mb-6 text-slate-700" />
                <h3 className="text-xl font-bold text-slate-500 uppercase tracking-widest">Standby Mode</h3>
                <p className="text-slate-700 text-xs font-medium max-w-xs mt-2">Initialize scan to view compatibility metrics against role benchmarks.</p>
              </div>
            ) : isAnalyzing ? (
              <div className="h-full min-h-[500px] bg-[#0c0e17]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center p-12">
                <div className="relative mb-8">
                  <div className="w-20 h-20 rounded-full border-t-2 border-blue-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-b-2 border-indigo-500 animate-spin-slow" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white tracking-[0.3em]">PROCESSING</h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase mt-4">Calibrating against {category} standards</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* Score */}
                <div className="bg-[#0c0e17]/90 border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full" />
                  <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] mb-4">Compatibility Index</p>
                  <div className="flex items-end gap-1 mb-8">
                    <span className="text-8xl font-black text-white leading-none tracking-tighter">{results.score}</span>
                    <span className="text-4xl font-black text-blue-500 mb-2">%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${results.score}%` }} />
                  </div>
                </div>

                {/* Found Keywords */}
                <div className="bg-[#0c0e17]/80 border border-white/5 p-8 rounded-[2rem]">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-emerald-500" /> Benchmark Matches
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {results.found.map(skill => (
                      <span key={skill} className="px-3 py-1.5 bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 rounded-lg text-[10px] font-bold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Gaps */}
                <div className="bg-[#0c0e17]/80 border border-white/5 p-8 rounded-[2rem]">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <AlertCircle size={12} className="text-amber-500" /> Identified Gaps
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {results.missing.length > 0 ? results.missing.map(skill => (
                      <span key={skill} className="px-3 py-1.5 bg-white/5 text-slate-500 border border-white/5 rounded-lg text-[10px] font-bold">
                        {skill}
                      </span>
                    )) : <p className="text-emerald-500 text-xs font-bold">100% Benchmark Alignment.</p>}
                  </div>

                  <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5">
                    <h5 className="text-blue-400 text-[10px] font-black uppercase mb-4 tracking-widest">Optimization Strategy</h5>
                    <ul className="space-y-4">
                      {results.suggestions.map((s, i) => (
                        <li key={i} className="flex gap-3 text-xs text-slate-400 font-medium leading-relaxed">
                          <ArrowRight size={14} className="text-blue-500 shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-16 pt-8 border-t border-white/5 text-center text-slate-700 text-[9px] font-black uppercase tracking-[0.5em]">
          Automated Talent Acquisition Protocol — Standard Rev. 2026.04
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        .animate-spin-slow { animation: spin-slow 6s linear infinite; }
      `}} />
    </div>
  );
};

export default App;