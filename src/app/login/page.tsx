'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Moon, Sun, FileText, Sparkles, ArrowRight, Mail, AlertCircle, Shield, Star, CheckCircle
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [emailValid, setEmailValid] = useState(true);
  const [focusedInput, setFocusedInput] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) router.push('/dashboard');
    };
    checkUser();
  }, [router]);

  // Auto dark mode detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setDarkMode(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  type NotificationType = 'success' | 'error' | 'info' | 'warning';

  const showNotification = (type: NotificationType, message: string): void => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  // Login handler
  const handleLogin = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showNotification('error', 'Please enter your email address');
      setEmailValid(false);
      return;
    }

    if (!validateEmail(email)) {
      showNotification('error', 'Please enter a valid email address');
      setEmailValid(false);
      return;
    }

    setEmailValid(true);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: { source: 'resume_tailor_app' },
        },
      });

      if (error) {
        showNotification('error', `Authentication failed: ${error.message}`);
      } else {
        showNotification('success', 'Magic link sent! Check your inbox and spam folder.');
        setEmail('');
      }
    } catch (err) {
      showNotification('error', 'An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full pl-14 pr-6 py-4 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-0 text-lg ${
    !emailValid 
      ? (darkMode 
          ? 'bg-red-900/20 border-red-400 text-white placeholder-red-200 focus:border-red-400' 
          : 'bg-red-50 border-red-300 text-gray-900 placeholder-red-400 focus:border-red-300')
      : (darkMode 
          ? 'bg-white/10 border-white/20 text-white placeholder-blue-200 focus:border-blue-400 focus:bg-white/15' 
          : 'bg-white/50 border-pink-200 text-gray-900 placeholder-gray-600 focus:border-pink-400 focus:bg-white/70')
  } ${focusedInput || email ? 'scale-105' : ''}`;

  return (
    <div className={`min-h-screen transition-all duration-700 relative overflow-hidden ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900' 
        : 'bg-gradient-to-br from-pink-100 via-violet-100 to-peach-100'
    }`}>

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-20 w-80 h-80 rounded-full blur-3xl opacity-20 animate-pulse ${
          darkMode ? 'bg-blue-400' : 'bg-pink-400'
        }`} 
          style={{ animation: 'float 8s ease-in-out infinite' }} />
        <div className={`absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse delay-1000 ${
          darkMode ? 'bg-indigo-400' : 'bg-peach-400'
        }`} 
          style={{ animation: 'float 9s ease-in-out infinite reverse' }} />
        <div className={`absolute top-1/2 left-1/2 w-72 h-72 rounded-full blur-3xl opacity-15 animate-pulse delay-500 ${
          darkMode ? 'bg-purple-400' : 'bg-violet-400'
        }`} 
          style={{ animation: 'float 7s ease-in-out infinite', animationDelay: '2s' }} />
        <div 
          className={`absolute w-96 h-96 rounded-full blur-3xl opacity-8 pointer-events-none transition-all duration-700 ${
            darkMode ? 'bg-gradient-to-r from-cyan-400 to-blue-500' : 'bg-gradient-to-r from-pink-400 to-violet-500'
          }`}
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            transform: `scale(${1 + Math.sin(Date.now() * 0.003) * 0.1})`,
          }}
        />
        <div className={`absolute inset-0 opacity-5 ${
          darkMode ? 'bg-blue-100' : 'bg-pink-200'
        }`} 
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }} />
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute transition-all duration-1000 ${
              darkMode ? 'text-blue-300' : 'text-pink-300'
            }`}
            style={{
              left: `${15 + (i * 12)}%`,
              top: `${10 + (i * 10)}%`,
              animation: `float ${4 + (i * 0.5)}s ease-in-out infinite`,
              animationDelay: `${i * 0.7}s`,
              opacity: 0.3,
            }}
          >
            <Sparkles className="w-5 h-5" />
          </div>
        ))}
      </div>

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-4 right-4 z-40 p-4 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:scale-110 hover:rotate-12 group ${
          darkMode 
            ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
            : 'bg-white/20 border-pink-200 text-gray-800 hover:bg-white/30'
        }`}
      >
        {darkMode ? (
          <Sun className="w-6 h-6 transition-transform group-hover:rotate-90" />
        ) : (
          <Moon className="w-6 h-6 transition-transform group-hover:-rotate-12" />
        )}
      </button>

      {/* Notification System */}
      {notification.show && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-2xl backdrop-blur-md border shadow-2xl transition-all duration-500 animate-bounce ${
          notification.type === 'success' 
            ? (darkMode ? 'bg-green-900/80 border-green-400/30 text-green-100' : 'bg-green-100/80 border-green-400/30 text-green-800')
            : (darkMode ? 'bg-red-900/80 border-red-400/30 text-red-100' : 'bg-red-100/80 border-red-400/30 text-red-800')
        }`}>
          <div className="flex items-center space-x-3">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Section - Hero Content */}
          <div className="space-y-8 sm:space-y-10 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-4">
              <div className={`p-4 rounded-3xl shadow-xl transition-all duration-300 hover:scale-110 hover:rotate-3 ${
                darkMode 
                  ? 'bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600' 
                  : 'bg-gradient-to-r from-pink-500 via-violet-600 to-peach-600'
              }`}>
                <FileText className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
              <span className={`text-3xl sm:text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                darkMode 
                  ? 'from-blue-400 via-purple-400 to-indigo-400' 
                  : 'from-pink-600 via-violet-600 to-peach-600'
              }`}>
                Resume Tailor
              </span>
            </div>
            <div className="space-y-6">
              <div className="flex justify-center lg:justify-start">
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium border ${
                  darkMode 
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                    : 'bg-pink-500/20 text-pink-600 border-pink-500/30'
                }`}>
                  <Star className="w-4 h-4" />
                  <span>Trusted by 50,000+ job seekers</span>
                </div>
              </div>
              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Craft Your
                <span className={`block bg-gradient-to-r ${
                  darkMode 
                    ? 'from-blue-500 via-purple-500 to-indigo-500' 
                    : 'from-pink-500 via-violet-500 to-peach-500'
                } bg-clip-text text-transparent`}>
                  Perfect Resume
                </span>
                <span className="block text-2xl sm:text-3xl lg:text-4xl mt-2 opacity-80">
                  with AI Magic ✨
                </span>
              </h1>
              <p className={`text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0 ${
                darkMode ? 'text-blue-100' : 'text-gray-700'
              }`}>
                Create ATS-friendly resumes that stand out, optimized by AI to match your dream job.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-8 sm:mt-12">
              {[
                { icon: Sparkles, title: 'AI-Powered Matching', desc: 'Smart resume optimization for any job' },
                { icon: Shield, title: 'Secure & Private', desc: 'Your data is encrypted and safe' },
              ].map((feature, index) => (
                <div 
                  key={index}
                  className={`group p-4 sm:p-6 rounded-3xl backdrop-blur-md border transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer ${
                    darkMode 
                      ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20' 
                      : 'bg-white/60 border-pink-200 hover:bg-white/80 hover:border-pink-300'
                  }`}
                >
                  <div className={`p-3 rounded-2xl w-fit mb-4 transition-all duration-300 group-hover:scale-110 ${
                    darkMode 
                      ? 'bg-blue-500/20' 
                      : 'bg-pink-100'
                  }`}>
                    <feature.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${
                      darkMode ? 'text-blue-400' : 'text-pink-600'
                    }`} />
                  </div>
                  <h3 className={`font-bold text-base sm:text-lg mb-3 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${
                    darkMode ? 'text-blue-100' : 'text-gray-700'
                  }`}>
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Section - Login Card */}
          <div className="flex justify-center lg:justify-end">
            <div className={`w-full max-w-md p-6 sm:p-8 md:p-10 rounded-3xl backdrop-blur-md border shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-3xl ${
              darkMode 
                ? 'bg-white/10 border-white/20 shadow-blue-500/20 hover:bg-white/15' 
                : 'bg-white/80 border-pink-200 shadow-pink-500/20 hover:bg-white/90'
            }`}>
              <div className="text-center mb-8 sm:mb-10">
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium mb-4 sm:mb-6 transition-all duration-300 hover:scale-105 ${
                  darkMode 
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                    : 'bg-pink-500/20 text-pink-600 border-pink-500/30'
                }`}>
                  <Sparkles className="w-4 h-4" />
                  <span>Get Started for Free</span>
                </div>
                <h2 className={`text-3xl sm:text-4xl font-bold mb-3 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Welcome Back
                </h2>
                <p className={`text-base sm:text-lg ${
                  darkMode ? 'text-blue-100' : 'text-gray-700'
                }`}>
                  Sign in with a secure magic link
                </p>
              </div>
              <div className="space-y-6 sm:space-y-8">
                <div className="relative">
                  <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                    focusedInput || email 
                      ? (darkMode ? 'text-blue-400' : 'text-pink-500') 
                      : (darkMode ? 'text-blue-300' : 'text-gray-500')
                  }`}>
                    <Mail className="w-6 h-6" />
                  </div>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (!emailValid && validateEmail(e.target.value)) {
                        setEmailValid(true);
                      }
                    }}
                    onFocus={() => setFocusedInput(true)}
                    onBlur={() => setFocusedInput(false)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
                    className={inputClass}
                  />
                  {!emailValid && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleLogin}
                  disabled={loading || !email.trim()}
                  className={`w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3 ${
                    darkMode 
                      ? 'bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 hover:from-blue-600 hover:via-purple-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-500/25' 
                      : 'bg-gradient-to-r from-pink-500 via-violet-600 to-peach-600 hover:from-pink-600 hover:via-violet-700 hover:to-peach-700 text-white shadow-xl shadow-pink-500/25'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                      <span>Sending magic link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Magic Link</span>
                      <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className={`text-sm ${
                      darkMode ? 'text-blue-200' : 'text-gray-700'
                    }`}>
                      No password needed. We'll send a secure link to your email.
                    </p>
                  </div>
                  <div className="flex items-center justify-center space-x-3">
                    <div className={`h-px flex-1 ${darkMode ? 'bg-white/20' : 'bg-pink-200'}`}></div>
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
                      darkMode ? 'bg-green-500/20 text-green-300' : 'bg-pink-100 text-pink-600'
                    }`}>
                      <Shield className="w-3 h-3" />
                      <span>Bank-level Security</span>
                    </div>
                    <div className={`h-px flex-1 ${darkMode ? 'bg-white/20' : 'bg-pink-200'}`}></div>
                  </div>
                  <p className={`text-xs text-center leading-relaxed ${
                    darkMode ? 'text-blue-300' : 'text-gray-600'
                  }`}>
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          25% { transform: translateY(-20px) rotate(90deg); opacity: 0.6; }
          50% { transform: translateY(-40px) rotate(180deg); opacity: 0.4; }
          75% { transform: translateY(-20px) rotate(270deg); opacity: 0.6; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(-10px); }
          50% { transform: translateY(0); }
        }
        html {
          font-size: clamp(14px, 2.5vw, 16px);
        }
      `}</style>
    </div>
  );
}
