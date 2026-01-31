import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Plus, LogOut, ExternalLink, Trash2, Bot, Settings } from "lucide-react"; 
import { getData, saveData, getLoggedUser } from "../utils/storage";

export default function Dashboard() {
  const navigate = useNavigate();
  const [bots, setBots] = useState([]);
  const userEmail = getLoggedUser();

  // Helper to get current user data
  const getUserData = (data) => data.users.find((u) => u.email === userEmail);

  useEffect(() => {
    if (!userEmail) {
      navigate("/");
      return;
    }

    const data = getData();
    const user = getUserData(data);
    setBots(user?.bots || []);
  }, [navigate, userEmail]);

  const logout = () => {
    localStorage.removeItem("logged_user");
    navigate("/");
  };

  const deleteBot = (id, company) => {
    const confirmText = prompt(`Type DELETE ${company} to confirm`);
    if (confirmText !== `DELETE ${company}`) return;

    const data = getData();
    const user = getUserData(data);
    
    if (user) {
      user.bots = user.bots.filter((b) => b.id !== id);
      saveData(data);
      setBots(user.bots);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Dashboard</h1>
            <p className="text-slate-400 mt-1">Manage your AI assistants for {userEmail}</p>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <button
              onClick={() => navigate("/create-bot")}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-purple-900/20 transition-all active:scale-95"
            >
              <Plus size={20} />
              Create Bot
            </button>

            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-400 px-6 py-3 rounded-2xl font-bold border border-slate-700 transition-all active:scale-95"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>

        {/* Content Section */}
        {bots.length === 0 ? (
          <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-[2rem] p-20 text-center">
            <div className="bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bot className="text-slate-500" size={32} />
            </div>
            <p className="text-slate-400 text-lg">No bots created yet. Start by building your first assistant!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {bots.map((bot) => (
              <div
                key={bot.id}
                className="group bg-slate-900 border border-slate-800 p-8 rounded-[2rem] hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all shadow-xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-cyan-500/10 p-3 rounded-2xl">
                    <Bot className="text-cyan-500" size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-800 px-2 py-1 rounded-md">
                    ID: {String(bot.id).slice(-4)}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                  {bot.company}
                </h3>
                <p className="text-slate-400 text-sm truncate mb-8">{bot.website}</p>

                <div className="flex gap-3">
                  {/* OPEN BOT (Chat Interface) */}
                  <button
                    onClick={() => navigate(`/bot?id=${bot.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-950 py-3 rounded-xl font-black text-sm hover:bg-cyan-400 transition-colors active:scale-95"
                  >
                    <ExternalLink size={16} />
                    Open
                  </button>

                  {/* NEW: SETTINGS/DETAILS BUTTON */}
                  <button
                    onClick={() => navigate(`/bot-details?id=${bot.id}`)}
                    className="p-3 bg-slate-800 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-xl transition-all active:scale-95"
                    title="Bot Details & Settings"
                  >
                    <Settings size={20} />
                  </button>

                  {/* DELETE BUTTON */}
                  <button
                    onClick={() => deleteBot(bot.id, bot.company)}
                    className="p-3 bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-95"
                    title="Delete Bot"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}