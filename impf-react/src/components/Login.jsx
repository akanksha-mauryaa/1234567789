import { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === 'mauryaakanksha109@gmail.com' && password === 'AWS@10akan') {
      onLoginSuccess();
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#050511] overflow-hidden" style={{ zIndex: 9999, fontFamily: 'monospace' }}>
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#3b82f6] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#8b5cf6] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative w-[90%] sm:w-full max-w-md bg-[#0a0a1a]/80 backdrop-blur-2xl rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.15)] p-6 sm:p-10 border border-[#1e1e38] z-10 mx-auto">
        
        {/* Logo Icon */}
        <div className="flex justify-center mb-8 relative">
          <div className="absolute inset-0 bg-[#3b82f6] blur-lg opacity-40 rounded-full animate-pulse"></div>
          <div className="w-16 h-16 bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] text-white flex items-center justify-center rounded-2xl text-3xl shadow-xl relative z-10 border border-white/10">
            🛡️
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2 tracking-widest uppercase">Welcome Back</h2>
        <p className="text-center text-[#64748b] text-xs font-mono tracking-widest mb-8">SIGN IN TO CONTINUE</p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm text-center font-sans flex items-center gap-2 justify-center">
            <span className="text-xl">⚠️</span> [ACCESS DENIED]
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-[#1e1e38] rounded-xl focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] text-[#e2e8f0] bg-[#050511]/50 placeholder-[#334155] transition-all font-sans"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-[#1e1e38] rounded-xl focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] text-[#e2e8f0] bg-[#050511]/50 placeholder-[#334155] transition-all font-sans"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit"
            className="w-full relative group overflow-hidden bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-white font-bold tracking-[0.2em] uppercase py-4 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] active:scale-[0.98] mt-4"
          >
            <span className="relative z-10">Sign In</span>
            <div className="absolute inset-0 h-full w-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
          </button>
        </form>
      </div>
    </div>
  );
}
