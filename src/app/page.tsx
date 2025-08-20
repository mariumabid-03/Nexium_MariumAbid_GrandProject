'use client';
import { useEffect, useState } from 'react';
import { FileText, Moon, Sun, Sparkles, Zap, Shield, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing...');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
        return;
      }

      const loadingSteps = [
        { progress: 15, text: 'Initializing Resume Tailor...', delay: 600 },
        { progress: 35, text: 'Loading AI models...', delay: 800 },
        { progress: 55, text: 'Preparing templates...', delay: 700 },
        { progress: 75, text: 'Setting up workspace...', delay: 600 },
        { progress: 90, text: 'Almost there...', delay: 500 },
        { progress: 100, text: 'Ready to craft your resume!', delay: 800 },
      ];

      for (let i = 0; i < loadingSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, loadingSteps[i].delay));
        setLoadingProgress(loadingSteps[i].progress);
        setLoadingText(loadingSteps[i].text);
      }

      setIsLoaded(true);
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

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  return (
    <div className={`min-h-screen transition-all duration-700 overflow-hidden relative ${
      darkMode
        ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900'
        : 'bg-gradient-to-br from-pink-100 via-violet-100 to-peach-100'
    }`}>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-10 left-10 w-72 h-72 rounded-full blur-3xl opacity-20 animate-pulse ${
          darkMode ? 'bg-blue-400' : 'bg-pink-400'
        }`} 
          style={{ 
            animation: 'float 6s ease-in-out infinite',
            transform: `translate(${Math.sin(Date.now() * 0.001) * 20}px, ${Math.cos(Date.now() * 0.001) * 20}px)`
          }} />
        <div className={`absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse delay-1000 ${
          darkMode ? 'bg-indigo-400' : 'bg-peach-400'
        }`} 
          style={{ animation: 'float 7s ease-in-out infinite reverse' }} />
        <div className={`absolute top-1/3 right-1/4 w-52 h-52 rounded-full blur-3xl opacity-15 animate-pulse delay-500 ${
          darkMode ? 'bg-purple-400' : 'bg-violet-400'
        }`} />
        <div className={`absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-15 animate-pulse delay-700 ${
          darkMode ? 'bg-cyan-400' : 'bg-orange-400'
        }`} />
        <div 
          className={`absolute w-80 h-80 rounded-full blur-3xl opacity-8 pointer-events-none transition-all duration-500 ${
            darkMode ? 'bg-gradient-to-r from-cyan-400 to-blue-500' : 'bg-gradient-to-r from-pink-400 to-violet-500'
          }`}
          style={{
            left: mousePosition.x - 160,
            top: mousePosition.y - 160,
            transform: `scale(${1 + Math.sin(Date.now() * 0.002) * 0.1})`,
          }}
        />
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full opacity-40 ${
              darkMode ? 'bg-blue-300' : 'bg-pink-300'
            }`}
            style={{
              width: `${4 + (i % 3)}px`,
              height: `${4 + (i % 3)}px`,
              left: `${5 + (i * 8)}%`,
              top: `${10 + (i * 7)}%`,
              animation: `bounce ${2 + (i * 0.3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
        <div className={`absolute inset-0 opacity-5 ${
          darkMode ? 'bg-blue-100' : 'bg-pink-200'
        }`} 
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }} />
      </div>

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-4 right-4 z-50 p-3 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:scale-110 hover:rotate-12 group ${
          darkMode 
            ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
            : 'bg-white/20 border-pink-200 text-gray-800 hover:bg-white/30'
        }`}
      >
        {darkMode ? (
          <Sun className="w-5 h-5 transition-transform group-hover:rotate-90" />
        ) : (
          <Moon className="w-5 h-5 transition-transform group-hover:-rotate-12" />
        )}
      </button>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl mx-auto">
          {/* Loading Card */}
          {!isLoaded ? (
            <div className={`backdrop-blur-md border rounded-3xl p-8 sm:p-10 md:p-12 shadow-2xl transition-all duration-500 hover:shadow-3xl ${
              darkMode 
                ? 'bg-white/10 border-white/20 shadow-blue-500/20 hover:bg-white/15' 
                : 'bg-white/80 border-pink-200 shadow-pink-500/20 hover:bg-white/90'
            }`}>
              <div className="text-center mb-10">
                <div className="flex items-center justify-center mb-6">
                  <div className={`p-5 rounded-3xl shadow-lg transition-all duration-300 hover:scale-110 ${
                    darkMode 
                      ? 'bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600' 
                      : 'bg-gradient-to-r from-pink-500 via-violet-600 to-peach-600'
                  }`}>
                    <FileText className="w-12 h-12 text-white drop-shadow-lg" />
                  </div>
                </div>
                <h1 className={`text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r bg-clip-text text-transparent ${
                  darkMode 
                    ? 'from-blue-400 via-purple-400 to-indigo-400' 
                    : 'from-pink-600 via-violet-600 to-peach-600'
                }`}>
                  Resume Tailor
                </h1>
                <p className={`text-lg sm:text-xl mb-6 ${
                  darkMode ? 'text-blue-100' : 'text-gray-700'
                }`}>
                  Crafting Your Career Story with AI
                </p>
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  {[
                    { icon: Sparkles, text: 'AI-Powered' },
                    { icon: Zap, text: 'Lightning Fast' },
                    { icon: Shield, text: 'Secure' },
                  ].map((feature, index) => (
                    <div 
                      key={index}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                        darkMode 
                          ? 'bg-white/10 text-blue-200 border border-white/20' 
                          : 'bg-pink-100 text-pink-700 border border-pink-200'
                      }`}
                    >
                      <feature.icon className="w-4 h-4" />
                      <span>{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-8">
                <div className="flex justify-center space-x-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full transition-all duration-300 ${
                        darkMode ? 'bg-blue-400' : 'bg-pink-500'
                      }`}
                      style={{
                        animation: `pulse 1.4s ease-in-out infinite`,
                        animationDelay: `${i * 0.2}s`,
                        transform: `scale(${loadingProgress > (i * 25) ? 1.2 : 1})`,
                      }}
                    />
                  ))}
                </div>
                <div className="text-center">
                  <p className={`text-xl font-semibold mb-2 transition-all duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {loadingText}
                  </p>
                  {isLoaded && (
                    <p className={`text-sm animate-bounce ${
                      darkMode ? 'text-green-400' : 'text-pink-600'
                    }`}>
                      🎉 Ready! Redirecting to login...
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <div className={`w-full h-3 rounded-full overflow-hidden shadow-inner ${
                    darkMode ? 'bg-white/20' : 'bg-pink-200'
                  }`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden ${
                        darkMode 
                          ? 'bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-500' 
                          : 'bg-gradient-to-r from-pink-500 via-violet-600 to-peach-600'
                      }`}
                      style={{ width: `${loadingProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-medium ${
                      darkMode ? 'text-blue-200' : 'text-gray-700'
                    }`}>
                      {loadingProgress}% Complete
                    </span>
                    <div className="flex space-x-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-6 rounded-full transition-all duration-500 ${
                            i < Math.floor(loadingProgress / 25) 
                              ? (darkMode ? 'bg-blue-400 shadow-lg shadow-blue-400/50' : 'bg-pink-500 shadow-lg shadow-pink-500/50')
                              : (darkMode ? 'bg-white/20' : 'bg-gray-300')
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-center pt-4">
                  <p className={`text-sm transition-all duration-300 ${
                    darkMode ? 'text-blue-200' : 'text-gray-700'
                  }`}>
                    {loadingProgress < 100 
                      ? 'Setting up your personalized workspace...' 
                      : '✨ Your resume crafting journey begins now!'
                    }
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-12 text-center">
              <div className="flex items-center justify-center mb-6">
                <div className={`p-5 rounded-3xl shadow-lg transition-all duration-300 hover:scale-110 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600' 
                    : 'bg-gradient-to-r from-pink-500 via-violet-600 to-peach-600'
                }`}>
                  <FileText className="w-12 h-12 text-white drop-shadow-lg" />
                </div>
              </div>
              <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r bg-clip-text text-transparent ${
                darkMode 
                  ? 'from-blue-400 via-purple-400 to-indigo-400' 
                  : 'from-pink-600 via-violet-600 to-peach-600'
              }`}>
                Welcome to Resume Tailor
              </h1>
              <p className={`text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto ${
                darkMode ? 'text-blue-100' : 'text-gray-700'
              }`}>
                Build professional, ATS-friendly resumes in minutes with our AI-powered platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleLoginRedirect}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-md ${
                    darkMode 
                      ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
                      : 'bg-pink-500/20 text-pink-600 hover:bg-pink-500/30'
                  }`}
                >
                  <LogIn className="w-5 h-5" />
                  <span>Log In</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-md ${
                    darkMode 
                      ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
                      : 'bg-violet-500/20 text-violet-600 hover:bg-violet-500/30'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Explore Dashboard</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 max-w-3xl mx-auto">
                {[
                  { value: '50K+', label: 'Happy Users', color: 'pink' },
                  { value: '98%', label: 'Success Rate', color: 'violet' },
                  { value: '24/7', label: 'AI Support', color: 'peach' },
                ].map((stat, index) => (
                  <div key={index} className="text-center group cursor-pointer">
                    <div className={`text-3xl font-bold mb-1 transition-all duration-300 group-hover:scale-110 ${
                      darkMode ? 'text-white' : `text-${stat.color}-600`
                    }`}>
                      {stat.value}
                    </div>
                    <div className={`text-sm ${
                      darkMode ? 'text-blue-200 group-hover:text-blue-100' : 'text-gray-700 group-hover:text-gray-900'
                    }`}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
              <p className={`text-sm italic max-w-md mx-auto mt-8 ${
                darkMode ? 'text-blue-200' : 'text-gray-700'
              }`}>
                "Resume Tailor transformed my job search with a resume that stood out!" - Sarah M.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none">
        <div className={`w-full h-full ${
          darkMode 
            ? 'bg-gradient-to-t from-blue-900/50 via-indigo-900/30 to-transparent' 
            : 'bg-gradient-to-t from-pink-200/50 via-violet-200/30 to-transparent'
        }`} />
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        html {
          font-size: clamp(14px, 2.5vw, 16px);
        }
      `}</style>
    </div>
  );
}
