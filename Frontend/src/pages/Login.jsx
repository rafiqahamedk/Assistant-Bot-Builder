import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import bcrypt from "bcryptjs";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleAuth = async (e) => {
    e.preventDefault();
    
    // Retrieve and parse data safely
    const rawData = localStorage.getItem("bot_data");
    const data = rawData ? JSON.parse(rawData) : { users: [] };

    if (isLogin) {
      // --- LOGIN LOGIC ---
      const user = data.users.find(u => u.email === formData.email);
      
      // SAFETY CHECK: Ensure user exists AND has a password string
      if (user && typeof user.password === "string") {
        try {
          // Compare input with stored hash
          const isMatch = bcrypt.compareSync(formData.password, user.password);
          
          if (isMatch) {
            localStorage.setItem("logged_user", formData.email);
            navigate("/dashboard");
          } else {
            alert("Invalid email or password.");
          }
        } catch (err) {
          console.error("Bcrypt Error:", err);
          alert("Security Error: This account may have been created with an older version of the app. Please register a new account.");
        }
      } else {
        alert("Account not found. If you just updated the app, please Signup again.");
      }
    } else {
      // --- SIGNUP LOGIC ---
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      
      if (data.users.find(u => u.email === formData.email)) {
        alert("Email already registered!");
        return;
      }

      // Hash the password with a salt round of 10
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(formData.password, salt);

      const newUser = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        password: hashedPassword, 
        bots: []
      };

      data.users.push(newUser);
      localStorage.setItem("bot_data", JSON.stringify(data));
      alert("Registration successful! You can now login.");
      setIsLogin(true); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
        
        {/* Header Toggle */}
        <div className="flex justify-center mb-8 bg-slate-800 p-1 rounded-2xl">
          <button 
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${isLogin ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
          >
            Login
          </button>
          <button 
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${!isLogin ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
          >
            Signup
          </button>
        </div>

        <h1 className="text-3xl font-black text-white text-center mb-2">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-center text-slate-500 mb-8 font-medium">
          {isLogin ? "AI-powered compliance management" : "Join the SCAP textile network"}
        </p>

        <form className="space-y-4" onSubmit={handleAuth}>
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none text-white transition-all"
                placeholder="John Doe"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-white transition-all"
              placeholder="name@company.com"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-white transition-all"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm Password</label>
              <input
                type="password"
                required
                className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none text-white transition-all"
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          )}

          <button 
            type="submit" 
            className={`w-full mt-4 font-black py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] ${isLogin ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20'}`}
          >
            {isLogin ? "Sign In" : "Register Now"}
          </button>
        </form>

        {/* Optional: Add a "Clear Legacy Data" button if you're stuck */}
        <div className="mt-8 text-center">
            <button 
                onClick={() => { localStorage.clear(); window.location.reload(); }}
                className="text-[10px] text-slate-700 hover:text-red-500 uppercase tracking-widest font-bold transition-colors"
            >
                Reset System (Clear LocalStorage)
            </button>
        </div>
      </div>
    </div>
  );
}