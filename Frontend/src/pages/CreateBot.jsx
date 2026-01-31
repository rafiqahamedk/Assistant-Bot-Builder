import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Database, ArrowRight, Upload, CheckCircle2, Loader2 } from "lucide-react";
import { getData, saveData, getLoggedUser } from "../utils/storage";
import { trainText, trainPDF } from "../utils/api";
import bcrypt from "bcryptjs"; 

export default function CreateBot() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 States
  const [company, setCompany] = useState("");
  const [botPass, setBotPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  // Step 2 States
  const [website, setWebsite] = useState("");
  const [userType, setUserType] = useState("Business");
  const [knowledgeText, setKnowledgeText] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

  const goNext = () => {
    if (!company || !botPass || !confirmPass) {
      alert("All fields are required");
      return;
    }
    if (botPass !== confirmPass) {
      alert("Passwords do not match");
      return;
    }
    setStep(2);
  };

  const createBot = async () => {
    if (!website) {
      alert("Company website required");
      return;
    }
    setLoading(true);
    try {
      if (knowledgeText.trim()) await trainText(knowledgeText);
      if (pdfFile) await trainPDF(pdfFile);

      const data = getData();
      const email = getLoggedUser();
      let user = data.users.find((u) => u.email === email);

      if (!user) {
        user = { email, bots: [] };
        data.users.push(user);
      }

      // HASH THE BOT PASSWORD BEFORE SAVING
      const salt = bcrypt.genSaltSync(10);
      const hashedBotPass = bcrypt.hashSync(botPass, salt);

      user.bots.push({
        id: Date.now(),
        company,
        botPass: hashedBotPass, // Store hash instead of plain text
        website,
        userType,
        createdAt: new Date().toISOString(),
      });

      saveData(data);
      alert("✅ Chatbot created successfully!");
      navigate("/dashboard");
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Visual Stepper */}
        <div className="flex items-center justify-between mb-12 px-4">
          <div className="flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${step >= 1 ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-slate-800 text-slate-500'}`}>
              {step > 1 ? <CheckCircle2 size={20} /> : <ShieldCheck size={20} />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Security</span>
          </div>
          <div className={`h-[2px] flex-1 mx-4 rounded-full ${step > 1 ? 'bg-cyan-500' : 'bg-slate-800'}`}></div>
          <div className="flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${step === 2 ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-slate-800 text-slate-500'}`}>
              <Database size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Knowledge</span>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {step === 1 ? (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-3xl font-black text-white mb-2">Initialize Bot</h2>
              <p className="text-slate-400 mb-8">Set the security credentials for your AI assistant.</p>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter ml-1">Company Name</label>
                  <input
                    className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-white transition-all placeholder:text-slate-600"
                    placeholder="e.g. Acme Textiles"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter ml-1">Bot Password</label>
                    <input
                      type="password"
                      className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-white transition-all"
                      value={botPass}
                      onChange={(e) => setBotPass(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter ml-1">Confirm Access</label>
                    <input
                      type="password"
                      className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-white transition-all"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  onClick={goNext}
                  className="w-full mt-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-cyan-500/20"
                >
                  Next Step <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-3xl font-black text-white mb-2">Knowledge Base</h2>
              <p className="text-slate-400 mb-8">Train your bot with specific industry data.</p>
              
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter ml-1">Website URL</label>
                    <input
                      className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none text-white"
                      placeholder="https://..."
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter ml-1">User Segment</label>
                    <select
                      className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none appearance-none text-white"
                      value={userType}
                      onChange={(e) => setUserType(e.target.value)}
                    >
                      <option value="Business">Business</option>
                      <option value="Individual">Individual</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter ml-1">Training Text</label>
                  <textarea
                    className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none min-h-[120px] resize-none text-white"
                    placeholder="Paste documentation here..."
                    value={knowledgeText}
                    onChange={(e) => setKnowledgeText(e.target.value)}
                  />
                </div>

                <div className="relative group cursor-pointer">
                  <input
                    type="file"
                    accept="application/pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={(e) => setPdfFile(e.target.files[0])}
                  />
                  <div className={`w-full p-4 border-2 border-dashed rounded-2xl flex items-center justify-center gap-3 transition-all ${pdfFile ? 'border-green-500 bg-green-500/5 text-green-500' : 'border-slate-700 bg-slate-800/30 text-slate-400 group-hover:border-purple-500/50'}`}>
                    <Upload size={20} />
                    <span className="text-sm font-bold">{pdfFile ? pdfFile.name : 'Upload PDF (Optional)'}</span>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button onClick={() => setStep(1)} className="px-6 py-4 rounded-2xl font-bold text-slate-400 hover:text-white transition-colors">Back</button>
                  <button
                    onClick={createBot}
                    disabled={loading}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-purple-500/20 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : 'Finalize & Launch'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}