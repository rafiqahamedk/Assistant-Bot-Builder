import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Lock, ArrowLeft, Copy, Trash2, Globe, User, 
  Check, AlertCircle, Database, Upload, RefreshCw, Settings, Calendar 
} from "lucide-react";
import { getData, getLoggedUser, saveData } from "../utils/storage";
import { trainText, trainPDF } from "../utils/api";
import bcrypt from "bcryptjs";

export default function BotManager() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const botId = Number(searchParams.get("id"));

  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [bot, setBot] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Knowledge Update states
  const [newText, setNewText] = useState("");
  const [newFile, setNewFile] = useState(null);

  useEffect(() => {
    const email = getLoggedUser();
    const data = getData();
    const user = data.users.find((u) => u.email === email);
    const foundBot = user?.bots.find((b) => b.id === botId);

    if (!foundBot) { navigate("/dashboard"); return; }
    setBot(foundBot);
  }, [botId, navigate]);

  const unlockBot = () => {
    if (bcrypt.compareSync(password, bot.botPass)) {
      setUnlocked(true);
    } else {
      alert("Incorrect bot password");
    }
  };

  const handleUpdateKnowledge = async () => {
    if (!newText.trim() && !newFile) {
      alert("Please provide text or a file to update knowledge.");
      return;
    }
    setLoading(true);
    try {
      if (newText.trim()) await trainText(newText);
      if (newFile) await trainPDF(newFile);
      alert("✅ Knowledge synced to local database!");
      setNewText(""); setNewFile(null);
    } catch (err) { alert("Something went wrong with the update."); }
    finally { setLoading(false); }
  };

  const copyScript = () => {
    const script = `<script src="http://127.0.0.1:8000/widget.js" data-bot-id="${bot.id}"></script>`;
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteBot = () => {
    const confirmText = prompt(`Type DELETE ${bot.company} to confirm`);
    if (confirmText !== `DELETE ${bot.company}`) return;

    const data = getData();
    const email = getLoggedUser();
    const user = data.users.find((u) => u.email === email);

    user.bots = user.bots.filter((b) => b.id !== bot.id);
    saveData(data);
    navigate("/dashboard");
  };

  if (!bot) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors font-bold uppercase text-[10px] tracking-widest">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {!unlocked ? (
          /* 🔒 SECURITY GATE */
          <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl text-center mt-20">
            <Lock className="text-cyan-500 mx-auto mb-6" size={40} />
            <h2 className="text-2xl font-black text-white mb-8">Unlock {bot.company}</h2>
            <input
              type="password"
              className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-center text-white mb-4"
              placeholder="Enter Bot Password"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && unlockBot()}
            />
            <button onClick={unlockBot} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-4 rounded-2xl transition-all">
              Decrypt & Open
            </button>
          </div>
        ) : (
          /* 🔓 UNIFIED HUB */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* 1. Bot Profile & Script Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl">
                <Settings className="text-cyan-500 mb-4" size={28} />
                <h2 className="text-3xl font-black text-white">{bot.company}</h2>
                <div className="space-y-4 mt-6 pt-6 border-t border-slate-800 text-sm text-slate-400">
                  <div className="flex items-center gap-3"><Globe size={14} className="text-cyan-500"/> {bot.website}</div>
                  <div className="flex items-center gap-3"><User size={14} className="text-cyan-500"/> {bot.userType} Segment</div>
                  <div className="flex items-center gap-3"><Calendar size={14} className="text-cyan-500"/> Created: {new Date(bot.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Embed Script</label>
                  <button onClick={copyScript} className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${copied ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-300'}`}>
                    {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-slate-950 p-6 rounded-2xl text-cyan-400 font-mono text-xs overflow-x-auto border border-slate-800">
                  {`<script src="http://127.0.0.1:8000/widget.js" data-bot-id="${bot.id}"></script>`}
                </pre>
              </div>
            </div>

            {/* 2. Knowledge Expansion Section */}
            <div className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-[2.5rem] shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <Database className="text-purple-500" size={24} />
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Expand Knowledge Base</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Training Text</label>
                  <textarea 
                    className="w-full p-5 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none text-white min-h-[220px] resize-none"
                    placeholder="Paste updated technical documents, FAQs, or company details..."
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                  />
                </div>
                <div className="space-y-4 flex flex-col justify-between">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">PDF Document Update</label>
                    <div className="relative group cursor-pointer mt-2">
                      <input type="file" accept="application/pdf" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => setNewFile(e.target.files[0])} />
                      <div className={`w-full p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all ${newFile ? 'border-green-500 bg-green-500/5 text-green-500' : 'border-slate-800 bg-slate-950 text-slate-500 group-hover:border-purple-500'}`}>
                        <Upload size={32} />
                        <span className="text-sm font-bold">{newFile ? newFile.name : "Click or Drag to Upload PDF"}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={handleUpdateKnowledge} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20 active:scale-95">
                    {loading ? <RefreshCw className="animate-spin" /> : "Sync New Knowledge"}
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Danger Zone */}
            <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-[2rem] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AlertCircle className="text-red-500" size={24} />
                <div>
                  <h4 className="text-sm font-bold text-red-500">Danger Zone</h4>
                  <p className="text-xs text-slate-500">Permanently delete this assistant and its metadata.</p>
                </div>
              </div>
              <button onClick={deleteBot} className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-6 py-3 rounded-xl text-xs font-black transition-all">
                Delete Bot
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}