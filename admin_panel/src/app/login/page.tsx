"use client";
import React, { useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  const router = useRouter();

  const HARDCODED_EMAIL = 'admin@example.com';
  const HARDCODED_PASSWORD = 'password123';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        setError(result.error || 'Login failed');
        return;
      }

      // Store admin token and data in localStorage
      localStorage.setItem('adminToken', result.token);
      localStorage.setItem('adminData', JSON.stringify(result.admin));
      
      setShowAnimation(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1800);
    } catch (error) {
      setError('Network error. Please check if the backend server is running.');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('Admin sign up is not available. Please contact your administrator.');
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-6">
      <div className="relative w-full max-w-4xl h-[520px] rounded-3xl shadow-2xl overflow-hidden">
        {/* Card content: two panels */}
        {!showAnimation ? (
          <div className="absolute inset-0 flex">
          {/* Left: Login panel */}
          <div className={`w-1/2 bg-white p-10 flex flex-col justify-center transition-all duration-700 ${isSignup ? 'translate-x-6 opacity-60' : 'translate-x-0 opacity-100'}`}>
            <div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#19295C' }}>Sign In</h2>
              <p className="text-sm text-blue-600 mb-6">Sign in to access the admin dashboard</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">{error}</div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600">Email</label>
                <input
                  type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white login-input text-blue-900"
                    placeholder="admin@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600">Password</label>
                <input
                  type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white login-input text-blue-900"
                    placeholder="Enter your password"
                  required
                />
              </div>

              <button type="submit" className="w-full text-white py-2 rounded-md hover:opacity-95" style={{ backgroundColor: '#19295C' }}>Sign In</button>
            </form>

            <div className="mt-6 text-center">
              <button onClick={() => setIsSignup(true)} className="text-sm text-blue-700 hover:underline">Don't have an admin account? Sign up</button>
            </div>
          </div>

          {/* Right: Signup panel (hidden by default) */}
          <div className={`w-1/2 bg-white p-10 flex flex-col justify-center transition-all duration-700 ${isSignup ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-60'}`}>
            <div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#19295C' }}>Create Admin Account</h2>
              <p className="text-sm text-blue-600 mb-6">Register a new admin account for the dashboard</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600">Full Name</label>
                <input
                  type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white login-input text-blue-900"
                    placeholder="Admin Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600">Email</label>
                <input
                  type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white login-input text-blue-900"
                    placeholder="admin@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600">Password</label>
                <input
                  type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white login-input text-blue-900"
                    placeholder="Create a password"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" className="flex-1 text-white py-2 rounded-md hover:opacity-95" style={{ backgroundColor: '#19295C' }}>Sign Up</button>
                <button type="button" onClick={() => setIsSignup(false)} className="flex-1 border border-slate-200 py-2 rounded-md" style={{ color: '#19295C' }}>Back</button>
              </div>
            </form>
          </div>
          </div>
        ) : null}

        {/* Animation overlay shown after sign-in click */}
        {showAnimation && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90">
            <div className="w-80 h-80 sm:w-96 sm:h-96">
              <DotLottieReact
                src="https://lottie.host/1f6a8b61-14c0-45cc-9145-d2263fc3cd5e/Af1vlXVnO9.lottie"
                loop={false}
                autoplay={true}
              />
            </div>
          </div>
        )}

        {/* Animated themed panel that slides right->left on signup click */}
        <div className={`absolute top-0 right-0 h-full w-1/2 transition-transform duration-900 ease-in-out ${isSignup ? '-translate-x-full' : 'translate-x-0'}`}>
            <div className="h-full w-full rounded-l-3xl overflow-hidden flex flex-col items-center justify-center px-8 shadow-lg relative"
                 style={{
                   background: 'linear-gradient(135deg, #d6f0ff, #c2e8ff)',
                   // keep minimal blur but make solid so background doesn't show through
                   backdropFilter: 'blur(1px)',
                   WebkitBackdropFilter: 'blur(1px)',
                   borderLeft: '1px solid rgba(0,0,0,0.06)'
                 }}>
              {/* left arc shape to create curved panel edge */}
              <svg className="absolute left-0 top-0 h-full w-36 -translate-x-8" viewBox="0 0 160 520" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M160 0 C80 130 80 390 160 520 L0 520 L0 0 Z" fill="#ffffff" />
              </svg>

              <h3 className="text-2xl font-extrabold text-[#19295C] mb-3">Welcome Back!</h3>
              <p className="text-sm text-[#2D3F7B] text-center max-w-xs">Manage projects, view reports and configure settings from the admin dashboard.</p>
              <div className="mt-8">
                <button onClick={() => setIsSignup(true)} className="px-6 py-2 rounded-md font-semibold bg-[#19295C] text-white hover:opacity-95">Create Admin</button>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}

// Local styles for placeholder opacity and color
/* Add a global style tag to increase placeholder opacity for inputs with class login-input */
// We inject a small stylesheet at the end of the file to target placeholder pseudo-elements
const placeholderStyles = `
/* When the field is empty (placeholder shown) use a faint placeholder color */
.login-input:placeholder-shown { color: rgba(15, 23, 42, 0.45) !important; }
.login-input::placeholder { color: rgba(15, 23, 42, 0.45); opacity: 1; }
.login-input::-webkit-input-placeholder { color: rgba(15, 23, 42, 0.45); opacity: 1; }
.login-input:-ms-input-placeholder { color: rgba(15, 23, 42, 0.45); opacity: 1; }

/* When user types, use solid black for filled text */
.login-input { color: #000 !important; }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.setAttribute('data-generated', 'login-placeholder');
  style.innerHTML = placeholderStyles;
  document.head.appendChild(style);
}