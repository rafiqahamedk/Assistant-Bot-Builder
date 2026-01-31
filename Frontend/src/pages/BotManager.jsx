import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Unlock, ArrowLeft, Copy, Trash2, Globe, User, Check, AlertCircle } from "lucide-react";
import { getData, getLoggedUser, saveData } from "../utils/storage";
import bcrypt from "bcryptjs"; // Import bcryptjs

export default function BotManager() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const botId = Number(searchParams.get("id"));

  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [bot, setBot] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const email = getLoggedUser();
    if (!email) {
      navigate("/");
      return;
    }

    const data = getData();
    const user = data.users.find((u) => u.email === email);

    if (!user) {
      navigate("/dashboard");
      return;
    }

    const foundBot = user.bots.find((b) => b.id === botId);
    if (!foundBot) {
      navigate("/dashboard");
      return;
    }

    setBot(foundBot);
  }, [botId, navigate]);

  const unlockBot = () => {
    // VERIFY THE HASH
    const isMatch = bcrypt.compareSync(password, bot.botPass);

    if (isMatch) {
      setUnlocked(true);
    } else {
      alert("Incorrect bot password");
    }
  };

  const copyScript = () => {
    const script = `<script src="http://127.0.0.1:8000/widget.js" data-bot-id="${bot.id}"></script>`;
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteBot = () => {
    const confirmText = prompt(`Type DELETE ${bot.company} to confirm deletion`);
    if (confirmText !== `DELETE ${bot.company}`) return;

    const data = getData();
    const email = getLoggedUser();
    const user = data.users.find((u) => u.email === email);

    user.bots = user.bots.filter((b) => b.id !== bot.id);
    saveData(data);
    navigate("/dashboard");
  };

  if (!bot) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-bold">
      <div className="animate-pulse">Loading Secure Environment...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl">
        <button 
          onClick={() => navigate("/dashboard")}
          className="group flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Back to Dashboard</span>
        </button>

        {!unlocked ? (
          <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl text-center animate-in fade-in zoom-in duration-300">
            <div className="bg-cyan-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock className="text-cyan-500" size={32} />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Encrypted Access</h2>
            <p className="text-slate-500 mb-8">Enter the bot password for <span className="text-slate-300">{bot.company}</span></p>

            <div className="space-y-4">
              <input
                type="password"
                className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-center text-xl tracking-widest text-white"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                onClick={unlockBot}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-cyan-500/20"
              >
                Decrypt & Open
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-4xl font-black text-white">{bot.company}</h2>
                  <div className="flex gap-4 mt-3">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      <Globe size={14} /> {bot.website}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      <User size={14} /> {bot.userType}
                    </span>
                  </div>
                </div>
                <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-green-500/20">
                  Active
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Embed Script</label>
                  <button 
                    onClick={copyScript}
                    className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${copied ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <div className="relative group">
                  <pre className="bg-slate-950 p-6 rounded-2xl text-cyan-400 font-mono text-sm overflow-x-auto border border-slate-800 shadow-inner">
                    {`<script \n  src="http://127.0.0.1:8000/widget.js" \n  data-bot-id="${bot.id}"\n></script>`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-[2rem] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-red-500/10 p-3 rounded-xl">
                  <AlertCircle className="text-red-500" size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-red-500">Danger Zone</h4>
                  <p className="text-xs text-slate-500">Permanently remove this bot and all its data.</p>
                </div>
              </div>
              <button
                onClick={deleteBot}
                className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-5 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95"
              >
                Delete Bot
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}