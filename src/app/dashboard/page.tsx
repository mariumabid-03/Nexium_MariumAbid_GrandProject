'use client';
import { useEffect, useState } from 'react';
import {
  FileText, Moon, Sun, Download, Copy, RotateCcw, Sparkles,
  User, Briefcase, GraduationCap, Award, Star, MapPin,
  Phone, Mail, Globe, Plus, Trash2, Eye, Settings,
  CheckCircle, AlertCircle, Info, LogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { jsPDF } from 'jspdf';
import PDFViewer from '@/components/ui/PDFViewer';
import { toast } from 'react-toastify';

type SectionType = 'experience' | 'education';

// Define TypeScript interfaces
interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
}

interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

interface FormData {
  personal: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: string[];
  achievements: string[];
}

interface Popup {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function ResumeTailorDashboard() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('modern');
  const [popup, setPopup] = useState<Popup | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [formData, setFormData] = useState<FormData>({
    personal: {
      fullName: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      summary: ''
    },
    experience: [{
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    }],
    education: [{
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: ''
    }],
    skills: [],
    achievements: []
  });

  const router = useRouter();

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto dark mode based on system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setDarkMode(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Popup management
  const showPopup = (type: 'success' | 'error' | 'info', message: string): void => {
    setPopup({ type, message });
    setTimeout(() => setPopup(null), 3000);
  };

  // Form data management
  const updateFormData = (
    section: keyof FormData,
    index: number | undefined,
    field: string,
    value: string | boolean
  ): void => {
    setFormData((prev: FormData): FormData => {
      if (index !== undefined && (section === 'experience' || section === 'education')) {
        const newData = { ...prev };
        const sectionData = newData[section] as Experience[] | Education[];
        sectionData[index] = {
          ...sectionData[index],
          [field]: value,
        };
        return newData;
      } else if (section === 'personal') {
        return {
          ...prev,
          personal: {
            ...prev.personal,
            [field]: value,
          },
        };
      } else if (section === 'skills' || section === 'achievements') {
        const newData = { ...prev };
        const sectionData = newData[section] as string[];
        if (index !== undefined) {
          sectionData[index] = value as string;
        }
        return newData;
      }
      return prev;
    });
  };

  const addSection = (section: SectionType) => {
    const templates: Record<SectionType, any> = {
      experience: { company: '', position: '', startDate: '', endDate: '', current: false, description: '' },
      education: { institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }
    };

    setFormData((prev: FormData) => ({
      ...prev,
      [section]: [...prev[section], templates[section]]
    }));
  };

  const removeSection = (section: SectionType, index: number) => {
    setFormData((prev: FormData) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    const skillInput = document.getElementById('skillInput') as HTMLInputElement | null;
    const skill = skillInput?.value.trim();
    if (skill && !formData.skills.includes(skill)) {
      setFormData((prev: FormData) => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      if (skillInput) skillInput.value = '';
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev: FormData) => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addAchievement = () => {
    const achievementInput = document.getElementById('achievementInput') as HTMLInputElement | null;
    const achievement = achievementInput?.value.trim();
    if (achievement && !formData.achievements.includes(achievement)) {
      setFormData((prev: FormData) => ({
        ...prev,
        achievements: [...prev.achievements, achievement]
      }));
      if (achievementInput) achievementInput.value = '';
    }
  };

  const removeAchievement = (achievementToRemove: string) => {
    setFormData((prev: FormData) => ({
      ...prev,
      achievements: prev.achievements.filter(achievement => achievement !== achievementToRemove)
    }));
  };

  const generateResume = () => {
    showPopup('success', '🎉 Resume generated successfully!');
  };

  const downloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Set font based on template
    const fontMap = {
      modern: 'helvetica',
      corporate: 'times',
      creative: 'helvetica', // Note: 'comic sans ms' not standard in jsPDF; using helvetica as fallback
    };
    doc.setFont(fontMap[selectedTemplate] || 'helvetica', 'normal');

    // Define margins and starting position
    const margin = 10;
    let yPosition = 10;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;

    // Helper function to add text and manage page breaks
    const addText = (text: string, x: number, y: number, size: number, style = 'normal', color: [number, number, number] = [0, 0, 0]) => {
      doc.setFontSize(size);
      doc.setFont(fontMap[selectedTemplate] || 'helvetica', style);
      doc.setTextColor(...color);
      const splitText = doc.splitTextToSize(text, 190); // Wrap text within 190mm width
      splitText.forEach((line: string) => {
        if (yPosition + lineHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, x, yPosition);
        yPosition += lineHeight;
      });
    };

    // Helper function to add section header
    const addSectionHeader = (title: string) => {
      const colors: { [key: string]: [number, number, number] } = {
        modern: [0, 102, 204], // Blue
        corporate: [0, 0, 0], // Black
        creative: [255, 105, 180], // Pink
      };
      addText(title.toUpperCase(), margin, yPosition, 14, 'bold', colors[selectedTemplate]);
      yPosition += 2; // Small gap after header
      if (selectedTemplate === 'corporate') {
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition, 200, yPosition); // Horizontal line for corporate template
        yPosition += 5;
      }
    };

    // Personal Information
    const personalColors: { [key: string]: [number, number, number] } = {
      modern: [0, 0, 0], // Black
      corporate: [0, 0, 0], // Black
      creative: [255, 105, 180], // Pink
    };
    addText(formData.personal.fullName || 'Your Name', margin, yPosition, 20, 'bold', personalColors[selectedTemplate]);
    addText(formData.personal.title || 'Professional Title', margin, yPosition, 12, 'italic', personalColors[selectedTemplate]);
    yPosition += 5;

    const contactInfo = [
      formData.personal.email && `Email: ${formData.personal.email}`,
      formData.personal.phone && `Phone: ${formData.personal.phone}`,
      formData.personal.location && `Location: ${formData.personal.location}`,
      formData.personal.website && `Website: ${formData.personal.website}`,
    ].filter(Boolean).join(' | ');
    addText(contactInfo, margin, yPosition, 10);

    // Summary
    if (formData.personal.summary) {
      yPosition += 10;
      addSectionHeader(selectedTemplate === 'creative' ? 'My Story' : 'Summary');
      addText(formData.personal.summary, margin, yPosition, 10);
    }

    // Experience
    if (formData.experience.length > 0) {
      yPosition += 10;
      addSectionHeader(selectedTemplate === 'creative' ? 'Adventures' : 'Experience');
      formData.experience.forEach((exp) => {
        addText(`${exp.position} at ${exp.company}`, margin, yPosition, 12, 'bold');
        addText(`${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`, margin, yPosition, 10, 'italic');
        if (exp.description) {
          addText(exp.description, margin, yPosition, 10);
        }
        yPosition += 5;
      });
    }

    // Education
    if (formData.education.length > 0) {
      yPosition += 10;
      addSectionHeader(selectedTemplate === 'creative' ? 'Learning Journey' : 'Education');
      formData.education.forEach((edu) => {
        addText(`${edu.degree} in ${edu.field}`, margin, yPosition, 12, 'bold');
        addText(`${edu.institution}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}`, margin, yPosition, 10);
        addText(`${edu.startDate} - ${edu.endDate}`, margin, yPosition, 10, 'italic');
        yPosition += 5;
      });
    }

    // Skills
    if (formData.skills.length > 0) {
      yPosition += 10;
      addSectionHeader(selectedTemplate === 'creative' ? 'Superpowers' : 'Skills');
      const skillsText = formData.skills.join(', ');
      addText(skillsText, margin, yPosition, 10);
    }

    // Achievements
    if (formData.achievements.length > 0) {
      yPosition += 10;
      addSectionHeader(selectedTemplate === 'creative' ? 'Trophies' : 'Achievements');
      formData.achievements.forEach((achievement) => {
        addText(`• ${achievement}`, margin, yPosition, 10);
        yPosition += 5;
      });
    }

    // Save PDF and set blob for PDFViewer
    try {
      const blob = doc.output('blob');
      setPdfBlob(blob);
      doc.save('resume.pdf');
      showPopup('success', '📄 PDF downloaded successfully!');
    } catch (error) {
      showPopup('error', 'Failed to generate PDF. Please try again.');
      console.error(error);
    }
  };

  const copyToClipboard = () => {
    const resumeText = `
      ${formData.personal.fullName}
      ${formData.personal.title}
      ${formData.personal.email} | ${formData.personal.phone}
      ${formData.personal.location} | ${formData.personal.website}
      
      Summary
      ${formData.personal.summary}
      
      Experience
      ${formData.experience.map(exp => `${exp.position} at ${exp.company}\n${exp.startDate} - ${exp.endDate || 'Present'}\n${exp.description}`).join('\n\n')}
      
      Education
      ${formData.education.map(edu => `${edu.degree} in ${edu.field}\n${edu.institution}\n${edu.startDate} - ${edu.endDate}${edu.gpa ? `\nGPA: ${edu.gpa}` : ''}`).join('\n\n')}
      
      Skills
      ${formData.skills.join(', ')}
      
      Achievements
      ${formData.achievements.join('\n')}
    `;
    navigator.clipboard.writeText(resumeText);
    showPopup('success', '📋 Resume copied to clipboard!');
  };

  const resetForm = () => {
    if (confirm('Are you sure you want to reset all fields?')) {
      setFormData({
        personal: { fullName: '', title: '', email: '', phone: '', location: '', website: '', summary: '' },
        experience: [{ company: '', position: '', startDate: '', endDate: '', current: false, description: '' }],
        education: [{ institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }],
        skills: [],
        achievements: []
      });
      showPopup('info', '🔄 Form reset successfully!');
    }
  };

  const handleLogout = () => {
    showPopup('info', '👋 Logged out successfully!');
    router.push('/');
  };

  const templates = {
    modern: {
      name: 'Modern',
      description: 'Clean and minimal design with subtle gradients.',
      color: 'from-blue-500 to-cyan-500',
      previewClass: 'modern-preview',
    },
    corporate: {
      name: 'Corporate',
      description: 'Formal structure with bold sections and lines.',
      color: 'from-gray-700 to-gray-500',
      previewClass: 'corporate-preview',
    },
    creative: {
      name: 'Creative',
      description: 'Vibrant colors and asymmetric layout.',
      color: 'from-pink-500 to-yellow-500',
      previewClass: 'creative-preview',
    }
  } as const;

  type TemplateKey = keyof typeof templates;

  const inputClass = (darkMode: boolean) => `p-3 rounded-xl border transition-all duration-300 focus:scale-105 ${darkMode
      ? 'bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-blue-400'
      : 'bg-white/70 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-violet-500'
    }`;

  return (
    <div className={`min-h-screen transition-all duration-700 overflow-hidden relative ${darkMode
        ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900'
        : 'bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50'
      }`}>

      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-10 left-10 w-72 h-72 rounded-full blur-3xl opacity-20 animate-pulse ${darkMode ? 'bg-blue-400' : 'bg-violet-400'
          }`}
          style={{
            animation: 'float 6s ease-in-out infinite',
            transform: `translate(${Math.sin(Date.now() * 0.001) * 20}px, ${Math.cos(Date.now() * 0.001) * 20}px)`
          }} />

        <div className={`absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse delay-1000 ${darkMode ? 'bg-indigo-400' : 'bg-cyan-400'
          }`}
          style={{ animation: 'float 7s ease-in-out infinite reverse' }} />

        <div
          className={`absolute w-80 h-80 rounded-full blur-3xl opacity-8 pointer-events-none transition-all duration-500 ${darkMode ? 'bg-gradient-to-r from-cyan-400 to-blue-500' : 'bg-gradient-to-r from-violet-400 to-purple-500'
            }`}
          style={{
            left: mousePosition.x - 160,
            top: mousePosition.y - 160,
            transform: `scale(${1 + Math.sin(Date.now() * 0.002) * 0.1})`,
          }}
        />

        <div className={`absolute inset-0 opacity-5 ${darkMode ? 'bg-blue-100' : 'bg-gray-900'}`}
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }} />
      </div>

      {/* Header Controls: Dark Mode and Logout */}
      <div className="fixed top-6 right-6 z-50 flex space-x-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-3 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:scale-110 hover:rotate-12 group ${darkMode
              ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              : 'bg-black/10 border-black/20 text-gray-800 hover:bg-black/20'
            }`}
        >
          {darkMode ? (
            <Sun className="w-5 h-5 transition-transform group-hover:rotate-90" />
          ) : (
            <Moon className="w-5 h-5 transition-transform group-hover:-rotate-12" />
          )}
        </button>
        <button
          onClick={handleLogout}
          className={`p-3 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:scale-110 hover:rotate-12 group ${darkMode
              ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              : 'bg-black/10 border-black/20 text-gray-800 hover:bg-black/20'
            }`}
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:rotate-180" />
        </button>
      </div>

      {/* Popup Notifications */}
      {popup && (
        <div className={`fixed top-20 right-6 z-50 p-4 rounded-2xl backdrop-blur-md border shadow-lg transition-all duration-300 animate-bounce ${popup.type === 'success' ? (darkMode ? 'bg-green-900/90 border-green-500/50 text-green-100' : 'bg-green-100/90 border-green-500/50 text-green-800') :
            popup.type === 'error' ? (darkMode ? 'bg-red-900/90 border-red-500/50 text-red-100' : 'bg-red-100/90 border-red-500/50 text-red-800') :
              (darkMode ? 'bg-blue-900/90 border-blue-500/50 text-blue-100' : 'bg-blue-100/90 border-blue-500/50 text-blue-800')
          }`}>
          <div className="flex items-center space-x-2">
            {popup.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {popup.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {popup.type === 'info' && <Info className="w-5 h-5" />}
            <span className="font-medium">{popup.message}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 pt-4">
            <div className="flex items-center justify-center mb-4">
              <div className={`p-4 rounded-3xl shadow-lg transition-all duration-300 hover:scale-110 ${darkMode
                  ? 'bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600'
                  : 'bg-gradient-to-r from-violet-500 via-purple-600 to-indigo-600'
                }`}>
                <FileText className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
            </div>
            <h1 className={`text-3xl md:text-5xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent ${darkMode
                ? 'from-blue-400 via-purple-400 to-indigo-400'
                : 'from-violet-600 via-purple-600 to-indigo-600'
              }`}>
              Resume Tailor Dashboard
            </h1>
            <p className={`text-lg md:text-xl ${darkMode ? 'text-blue-100' : 'text-gray-600'}`}>
              Craft your perfect resume with AI-powered assistance
            </p>
          </div>

          {/* Template Selection */}
          <div className={`backdrop-blur-md border rounded-2xl p-6 mb-8 shadow-xl transition-all duration-300 hover:shadow-2xl ${darkMode
              ? 'bg-white/10 border-white/20'
              : 'bg-white/80 border-white/30'
            }`}>
            <h2 className={`text-xl md:text-2xl font-bold mb-6 flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-gray-900'
              }`}>
              <Sparkles className="w-6 h-6" />
              <span>Choose Your Template</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Object.entries(templates).map(([key, template]) => {
                const typedKey = key as TemplateKey;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedTemplate(typedKey)}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${selectedTemplate === typedKey
                        ? (darkMode ? 'border-blue-400 bg-blue-500/20' : 'border-violet-500 bg-violet-500/20')
                        : (darkMode ? 'border-white/20 bg-white/5 hover:bg-white/10' : 'border-gray-200 bg-white/50 hover:bg-white/80')
                      }`}
                  >
                    <div className={`w-full h-32 rounded-lg mb-4 bg-gradient-to-r ${template.color} shadow-md`} />
                    <h3 className={`font-semibold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {template.name}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-gray-600'}`}>
                      {template.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Grid: Form and Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="space-y-8">
              {/* Personal Information */}
              <div className={`backdrop-blur-md border rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl ${darkMode
                  ? 'bg-white/10 border-white/20'
                  : 'bg-white/80 border-white/30'
                }`}>
                <h2 className={`text-xl md:text-2xl font-bold mb-6 flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                  <User className="w-6 h-6" />
                  <span>Personal Information</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.personal.fullName}
                    onChange={(e) => updateFormData('personal', undefined, 'fullName', e.target.value)}
                    className={inputClass(darkMode)}
                  />
                  <input
                    type="text"
                    placeholder="Professional Title"
                    value={formData.personal.title}
                    onChange={(e) => updateFormData('personal', undefined, 'title', e.target.value)}
                    className={inputClass(darkMode)}
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={formData.personal.email}
                    onChange={(e) => updateFormData('personal', undefined, 'email', e.target.value)}
                    className={inputClass(darkMode)}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.personal.phone}
                    onChange={(e) => updateFormData('personal', undefined, 'phone', e.target.value)}
                    className={inputClass(darkMode)}
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={formData.personal.location}
                    onChange={(e) => updateFormData('personal', undefined, 'location', e.target.value)}
                    className={inputClass(darkMode)}
                  />
                  <input
                    type="url"
                    placeholder="Website/Portfolio"
                    value={formData.personal.website}
                    onChange={(e) => updateFormData('personal', undefined, 'website', e.target.value)}
                    className={inputClass(darkMode)}
                  />
                </div>
                <textarea
                  placeholder="Professional Summary"
                  rows={4}
                  value={formData.personal.summary}
                  onChange={(e) => updateFormData('personal', undefined, 'summary', e.target.value)}
                  className={`w-full mt-4 p-3 rounded-xl border transition-all duration-300 focus:scale-105 resize-none ${darkMode
                      ? 'bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-blue-400'
                      : 'bg-white/70 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-violet-500'
                    }`}
                />
              </div>

              {/* Experience Section */}
              <div className={`backdrop-blur-md border rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl ${darkMode
                  ? 'bg-white/10 border-white/20'
                  : 'bg-white/80 border-white/30'
                }`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl md:text-2xl font-bold flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                    <Briefcase className="w-6 h-6" />
                    <span>Work Experience</span>
                  </h2>
                  <button
                    onClick={() => addSection('experience')}
                    className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${darkMode
                        ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                        : 'bg-violet-500/20 text-violet-600 hover:bg-violet-500/30'
                      }`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {formData.experience.map((exp, index) => (
                  <div key={index} className={`mb-6 p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white/50'
                    }`}>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`font-medium text-lg ${darkMode ? 'text-blue-200' : 'text-violet-600'}`}>
                        Experience #{index + 1}
                      </span>
                      {formData.experience.length > 1 && (
                        <button
                          onClick={() => removeSection('experience', index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Company Name"
                        value={exp.company}
                        onChange={(e) => updateFormData('experience', index, 'company', e.target.value)}
                        className={inputClass(darkMode)}
                      />
                      <input
                        type="text"
                        placeholder="Position Title"
                        value={exp.position}
                        onChange={(e) => updateFormData('experience', index, 'position', e.target.value)}
                        className={inputClass(darkMode)}
                      />
                      <input
                        type="date"
                        placeholder="Start Date"
                        value={exp.startDate}
                        onChange={(e) => updateFormData('experience', index, 'startDate', e.target.value)}
                        className={inputClass(darkMode)}
                      />
                      <input
                        type="date"
                        placeholder="End Date"
                        value={exp.endDate}
                        disabled={exp.current}
                        onChange={(e) => updateFormData('experience', index, 'endDate', e.target.value)}
                        className={`${inputClass(darkMode)} ${exp.current ? 'opacity-50' : ''}`}
                      />
                    </div>
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id={`current-${index}`}
                        checked={exp.current}
                        onChange={(e) => updateFormData('experience', index, 'current', e.target.checked)}
                        className="mr-2 accent-blue-500"
                      />
                      <label htmlFor={`current-${index}`} className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Currently working here
                      </label>
                    </div>
                    <textarea
                      placeholder="Job Description & Achievements"
                      rows={3}
                      value={exp.description}
                      onChange={(e) => updateFormData('experience', index, 'description', e.target.value)}
                      className={`w-full p-3 rounded-xl border transition-all duration-300 focus:scale-105 resize-none ${darkMode
                          ? 'bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-blue-400'
                          : 'bg-white/70 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-violet-500'
                        }`}
                    />
                  </div>
                ))}
              </div>

              {/* Education Section */}
              <div className={`backdrop-blur-md border rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl ${darkMode
                  ? 'bg-white/10 border-white/20'
                  : 'bg-white/80 border-white/30'
                }`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl md:text-2xl font-bold flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                    <GraduationCap className="w-6 h-6" />
                    <span>Education</span>
                  </h2>
                  <button
                    onClick={() => addSection('education')}
                    className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${darkMode
                        ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                        : 'bg-violet-500/20 text-violet-600 hover:bg-violet-500/30'
                      }`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {formData.education.map((edu, index) => (
                  <div key={index} className={`mb-6 p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white/50'
                    }`}>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`font-medium text-lg ${darkMode ? 'text-blue-200' : 'text-violet-600'}`}>
                        Education #{index + 1}
                      </span>
                      {formData.education.length > 1 && (
                        <button
                          onClick={() => removeSection('education', index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Institution Name"
                        value={edu.institution}
                        onChange={(e) => updateFormData('education', index, 'institution', e.target.value)}
                        className={inputClass(darkMode)}
                      />
                      <input
                        type="text"
                        placeholder="Degree"
                        value={edu.degree}
                        onChange={(e) => updateFormData('education', index, 'degree', e.target.value)}
                        className={inputClass(darkMode)}
                      />
                      <input
                        type="text"
                        placeholder="Field of Study"
                        value={edu.field}
                        onChange={(e) => updateFormData('education', index, 'field', e.target.value)}
                        className={inputClass(darkMode)}
                      />
                      <input
                        type="text"
                        placeholder="GPA (Optional)"
                        value={edu.gpa}
                        onChange={(e) => updateFormData('education', index, 'gpa', e.target.value)}
                        className={inputClass(darkMode)}
                      />
                      <input
                        type="date"
                        placeholder="Start Date"
                        value={edu.startDate}
                        onChange={(e) => updateFormData('education', index, 'startDate', e.target.value)}
                        className={inputClass(darkMode)}
                      />
                      <input
                        type="date"
                        placeholder="End Date"
                        value={edu.endDate}
                        onChange={(e) => updateFormData('education', index, 'endDate', e.target.value)}
                        className={inputClass(darkMode)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills Section */}
              <div className={`backdrop-blur-md border rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl ${darkMode
                  ? 'bg-white/10 border-white/20'
                  : 'bg-white/80 border-white/30'
                }`}>
                <h2 className={`text-xl md:text-2xl font-bold mb-6 flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                  <Star className="w-6 h-6" />
                  <span>Skills</span>
                </h2>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-6">
                  <input
                    id="skillInput"
                    type="text"
                    placeholder="Add a skill"
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    className={`flex-1 ${inputClass(darkMode)}`}
                  />
                  <button
                    onClick={addSkill}
                    className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${darkMode
                        ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                        : 'bg-violet-500/20 text-violet-600 hover:bg-violet-500/30'
                      }`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {formData.skills.map((skill, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 shadow-sm ${darkMode
                          ? 'bg-blue-500/20 text-blue-200 border border-blue-500/30'
                          : 'bg-violet-500/20 text-violet-700 border border-violet-500/30'
                        }`}
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => removeSkill(skill)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements Section */}
              <div className={`backdrop-blur-md border rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl ${darkMode
                  ? 'bg-white/10 border-white/20'
                  : 'bg-white/80 border-white/30'
                }`}>
                <h2 className={`text-xl md:text-2xl font-bold mb-6 flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                  <Award className="w-6 h-6" />
                  <span>Achievements</span>
                </h2>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-6">
                  <input
                    id="achievementInput"
                    type="text"
                    placeholder="Add an achievement"
                    onKeyPress={(e) => e.key === 'Enter' && addAchievement()}
                    className={`flex-1 ${inputClass(darkMode)}`}
                  />
                  <button
                    onClick={addAchievement}
                    className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${darkMode
                        ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                        : 'bg-violet-500/20 text-violet-600 hover:bg-violet-500/30'
                      }`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-sm ${darkMode
                          ? 'bg-blue-500/20 text-blue-200 border border-blue-500/30'
                          : 'bg-violet-500/20 text-violet-700 border border-violet-500/30'
                        }`}
                    >
                      <span className="flex-1">{achievement}</span>
                      <button
                        onClick={() => removeAchievement(achievement)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview and Controls Section (Sticky on large screens) */}
            <div className="space-y-8 lg:sticky lg:top-4 self-start">
              {/* Live Preview */}
              <div className={`backdrop-blur-md border rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl ${darkMode
                  ? 'bg-white/10 border-white/20'
                  : 'bg-white/80 border-white/30'
                } print:bg-white print:border-none print:shadow-none`}>
                <h2 className={`text-xl md:text-2xl font-bold mb-6 flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-gray-900'
                  } print:text-black`}>
                  <Eye className="w-6 h-6" />
                  <span>Live Preview</span>
                </h2>
                <div className={`p-6 rounded-xl shadow-inner overflow-auto max-h-[80vh] print:max-h-none print:overflow-visible ${darkMode ? 'bg-white/5' : 'bg-white/50'} print:bg-white ${templates[selectedTemplate].previewClass}`}>
                  {/* Template-specific Preview */}
                  {selectedTemplate === 'modern' && (
                    <div className="modern-template space-y-6">
                      <div className={`bg-gradient-to-r ${templates[selectedTemplate].color} p-8 rounded-t-2xl print:bg-none print:p-0 print:rounded-none`}>
                        <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-white'} print:text-black`}>
                          {formData.personal.fullName || 'Your Name'}
                        </h3>
                        <p className={`text-xl italic ${darkMode ? 'text-blue-100' : 'text-blue-50'} print:text-gray-600`}>
                          {formData.personal.title || 'Professional Title'}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-4 print:mt-2 text-sm">
                          {formData.personal.email && (
                            <span className={`flex items-center gap-1 ${darkMode ? 'text-blue-100' : 'text-blue-50'} print:text-gray-600`}>
                              <Mail className="w-4 h-4" /> {formData.personal.email}
                            </span>
                          )}
                          {formData.personal.phone && (
                            <span className={`flex items-center gap-1 ${darkMode ? 'text-blue-100' : 'text-blue-50'} print:text-gray-600`}>
                              <Phone className="w-4 h-4" /> {formData.personal.phone}
                            </span>
                          )}
                          {formData.personal.location && (
                            <span className={`flex items-center gap-1 ${darkMode ? 'text-blue-100' : 'text-blue-50'} print:text-gray-600`}>
                              <MapPin className="w-4 h-4" /> {formData.personal.location}
                            </span>
                          )}
                          {formData.personal.website && (
                            <span className={`flex items-center gap-1 ${darkMode ? 'text-blue-100' : 'text-blue-50'} print:text-gray-600`}>
                              <Globe className="w-4 h-4" /> {formData.personal.website}
                            </span>
                          )}
                        </div>
                      </div>
                      {formData.personal.summary && (
                        <section className="border-b pb-4 print:border-b print:pb-2">
                          <h4 className={`text-lg font-semibold uppercase tracking-wide ${darkMode ? 'text-blue-200' : 'text-gray-900'} print:text-black`}>Summary</h4>
                          <p className={`mt-2 text-sm leading-relaxed ${darkMode ? 'text-blue-100' : 'text-gray-600'} print:text-gray-600`}>{formData.personal.summary}</p>
                        </section>
                      )}
                      {formData.experience.length > 0 && (
                        <section className="border-b pb-4 print:border-b print:pb-2">
                          <h4 className={`text-lg font-semibold uppercase tracking-wide ${darkMode ? 'text-blue-200' : 'text-gray-900'} print:text-black`}>Experience</h4>
                          {formData.experience.map((exp, index) => (
                            <div key={index} className="mt-4 print:mt-2">
                              <h5 className={`font-medium text-base ${darkMode ? 'text-blue-100' : 'text-gray-800'} print:text-gray-800`}>
                                {exp.position} <span className="text-sm font-normal">at {exp.company}</span>
                              </h5>
                              <p className={`text-xs italic ${darkMode ? 'text-blue-200' : 'text-gray-500'} print:text-gray-500`}>
                                {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                              </p>
                              <p className={`mt-1 text-sm leading-relaxed ${darkMode ? 'text-blue-100' : 'text-gray-600'} print:text-gray-600`}>{exp.description}</p>
                            </div>
                          ))}
                        </section>
                      )}
                      {formData.education.length > 0 && (
                        <section className="border-b pb-4 print:border-b print:pb-2">
                          <h4 className={`text-lg font-semibold uppercase tracking-wide ${darkMode ? 'text-blue-200' : 'text-gray-900'} print:text-black`}>Education</h4>
                          {formData.education.map((edu, index) => (
                            <div key={index} className="mt-4 print:mt-2">
                              <h5 className={`font-medium text-base ${darkMode ? 'text-blue-100' : 'text-gray-800'} print:text-gray-800`}>
                                {edu.degree} in {edu.field}
                              </h5>
                              <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-gray-600'} print:text-gray-600`}>
                                {edu.institution} {edu.gpa && `| GPA: ${edu.gpa}`}
                              </p>
                              <p className={`text-xs italic ${darkMode ? 'text-blue-200' : 'text-gray-500'} print:text-gray-500`}>
                                {edu.startDate} - {edu.endDate}
                              </p>
                            </div>
                          ))}
                        </section>
                      )}
                      {formData.skills.length > 0 && (
                        <section className="border-b pb-4 print:border-b print:pb-2">
                          <h4 className={`text-lg font-semibold uppercase tracking-wide ${darkMode ? 'text-blue-200' : 'text-gray-900'} print:text-black`}>Skills</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.skills.map((skill, index) => (
                              <span
                                key={index}
                                className={`px-3 py-1 rounded-full text-sm shadow-sm ${darkMode
                                    ? 'bg-blue-500/20 text-blue-200 border border-blue-500/30'
                                    : 'bg-violet-500/20 text-violet-700 border border-violet-500/30'
                                  } print:bg-gray-100 print:text-gray-800 print:border-gray-200`}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </section>
                      )}
                      {formData.achievements.length > 0 && (
                        <section>
                          <h4 className={`text-lg font-semibold uppercase tracking-wide ${darkMode ? 'text-blue-200' : 'text-gray-900'} print:text-black`}>Achievements</h4>
                          <ul className={`mt-2 list-disc list-inside space-y-1 text-sm ${darkMode ? 'text-blue-100' : 'text-gray-600'} print:text-gray-600`}>
                            {formData.achievements.map((achievement, index) => (
                              <li key={index}>{achievement}</li>
                            ))}
                          </ul>
                        </section>
                      )}
                    </div>
                  )}
                  {selectedTemplate === 'corporate' && (
                    <div className="corporate-template space-y-6">
                      <div className="border-b-2 pb-4 print:border-b-2 print:pb-2 border-gray-300 print:border-gray-300">
                        <h3 className={`text-3xl font-serif font-bold uppercase ${darkMode ? 'text-gray-100' : 'text-gray-900'} print:text-black`}>
                          {formData.personal.fullName || 'Your Name'}
                        </h3>
                        <p className={`text-xl font-serif ${darkMode ? 'text-gray-300' : 'text-gray-600'} print:text-gray-600`}>
                          {formData.personal.title || 'Professional Title'}
                        </p>
                        <div className="grid grid-cols-2 gap-2 mt-4 text-sm print:mt-2">
                          {formData.personal.email && (
                            <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'} print:text-gray-600`}>
                              <Mail className="w-4 h-4" /> {formData.personal.email}
                            </span>
                          )}
                          {formData.personal.phone && (
                            <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'} print:text-gray-600`}>
                              <Phone className="w-4 h-4" /> {formData.personal.phone}
                            </span>
                          )}
                          {formData.personal.location && (
                            <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'} print:text-gray-600`}>
                              <MapPin className="w-4 h-4" /> {formData.personal.location}
                            </span>
                          )}
                          {formData.personal.website && (
                            <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'} print:text-gray-600`}>
                              <Globe className="w-4 h-4" /> {formData.personal.website}
                            </span>
                          )}
                        </div>
                      </div>
                      {formData.personal.summary && (
                        <section className="border-b-2 pb-4 print:border-b-2 print:pb-2 border-gray-300 print:border-gray-300">
                          <h4 className={`text-lg font-serif font-bold uppercase ${darkMode ? 'text-gray-100' : 'text-gray-900'} print:text-black`}>Professional Summary</h4>
                          <p className={`mt-2 text-sm leading-relaxed ${darkMode ? 'text-gray-200' : 'text-gray-600'} print:text-gray-600`}>{formData.personal.summary}</p>
                        </section>
                      )}
                      {formData.experience.length > 0 && (
                        <section className="border-b-2 pb-4 print:border-b-2 print:pb-2 border-gray-300 print:border-gray-300">
                          <h4 className={`text-lg font-serif font-bold uppercase ${darkMode ? 'text-gray-100' : 'text-gray-900'} print:text-black`}>Professional Experience</h4>
                          {formData.experience.map((exp, index) => (
                            <div key={index} className="mt-4 print:mt-2 border-t pt-2 print:border-t print:pt-2">
                              <h5 className={`font-bold text-base uppercase ${darkMode ? 'text-gray-100' : 'text-gray-800'} print:text-gray-800`}>
                                {exp.position}
                              </h5>
                              <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} print:text-gray-600`}>
                                {exp.company} | {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                              </p>
                              <p className={`mt-1 text-sm ${darkMode ? 'text-gray-200' : 'text-gray-600'} print:text-gray-600`}>{exp.description}</p>
                            </div>
                          ))}
                        </section>
                      )}
                      {formData.education.length > 0 && (
                        <section className="border-b-2 pb-4 print:border-b-2 print:pb-2 border-gray-300 print:border-gray-300">
                          <h4 className={`text-lg font-serif font-bold uppercase ${darkMode ? 'text-gray-100' : 'text-gray-900'} print:text-black`}>Education</h4>
                          {formData.education.map((edu, index) => (
                            <div key={index} className="mt-4 print:mt-2">
                              <h5 className={`font-bold text-base uppercase ${darkMode ? 'text-gray-100' : 'text-gray-800'} print:text-gray-800`}>
                                {edu.degree}
                              </h5>
                              <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} print:text-gray-600`}>
                                {edu.field} | {edu.institution} | {edu.gpa && `GPA: ${edu.gpa}`}
                              </p>
                              <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-500'} print:text-gray-500`}>
                                {edu.startDate} - {edu.endDate}
                              </p>
                            </div>
                          ))}
                        </section>
                      )}
                      {formData.skills.length > 0 && (
                        <section className="border-b-2 pb-4 print:border-b-2 print:pb-2 border-gray-300 print:border-gray-300">
                          <h4 className={`text-lg font-serif font-bold uppercase ${darkMode ? 'text-gray-100' : 'text-gray-900'} print:text-black`}>Skills</h4>
                          <ul className="mt-2 columns-2 text-sm list-disc list-inside space-y-1 print:columns-1">
                            {formData.skills.map((skill, index) => (
                              <li key={index} className={`${darkMode ? 'text-gray-200' : 'text-gray-600'} print:text-gray-600`}>{skill}</li>
                            ))}
                          </ul>
                        </section>
                      )}
                      {formData.achievements.length > 0 && (
                        <section>
                          <h4 className={`text-lg font-serif font-bold uppercase ${darkMode ? 'text-gray-100' : 'text-gray-900'} print:text-black`}>Achievements</h4>
                          <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                            {formData.achievements.map((achievement, index) => (
                              <li key={index} className={`${darkMode ? 'text-gray-200' : 'text-gray-600'} print:text-gray-600`}>{achievement}</li>
                            ))}
                          </ul>
                        </section>
                      )}
                    </div>
                  )}

                  {selectedTemplate === 'creative' && (
                    <div className="creative-template space-y-8 relative">
                      <div className="relative p-8 rounded-2xl shadow-lg transform -rotate-1 print:transform-none print:shadow-none print:rounded-none print:p-0">
                        <div className={`absolute inset-0 bg-gradient-to-r ${templates[selectedTemplate].color} opacity-20 rounded-2xl print:hidden`}></div>
                        <h3 className={`text-4xl font-handwritten font-bold text-pink-600 print:text-black`}>
                          {formData.personal.fullName || 'Your Name'}
                        </h3>
                        <p className={`text-2xl font-cursive italic text-yellow-600 print:text-gray-600`}>
                          {formData.personal.title || 'Professional Title'}
                        </p>
                        <div className="flex flex-wrap gap-6 mt-6 print:mt-2 text-base">
                          {formData.personal.email && (
                            <span className={`flex items-center gap-2 text-pink-500 print:text-gray-600`}>
                              <Mail className="w-5 h-5" /> {formData.personal.email}
                            </span>
                          )}
                          {formData.personal.phone && (
                            <span className={`flex items-center gap-2 text-yellow-500 print:text-gray-600`}>
                              <Phone className="w-5 h-5" /> {formData.personal.phone}
                            </span>
                          )}
                          {formData.personal.location && (
                            <span className={`flex items-center gap-2 text-pink-500 print:text-gray-600`}>
                              <MapPin className="w-5 h-5" /> {formData.personal.location}
                            </span>
                          )}
                          {formData.personal.website && (
                            <span className={`flex items-center gap-2 text-yellow-500 print:text-gray-600`}>
                              <Globe className="w-5 h-5" /> {formData.personal.website}
                            </span>
                          )}
                        </div>
                      </div>
                      {formData.personal.summary && (
                        <section className="p-4 rounded-lg shadow-md transform rotate-1 print:transform-none print:shadow-none print:rounded-none print:p-0">
                          <h4 className={`text-xl font-bold text-pink-600 print:text-black`}>My Story</h4>
                          <p className={`mt-2 text-base leading-loose text-yellow-800 print:text-gray-600`}>{formData.personal.summary}</p>
                        </section>
                      )}
                      {formData.experience.length > 0 && (
                        <section className="p-4 rounded-lg shadow-md transform -rotate-2 print:transform-none print:shadow-none print:rounded-none print:p-0">
                          <h4 className={`text-xl font-bold text-pink-600 print:text-black`}>Adventures</h4>
                          {formData.experience.map((exp, index) => (
                            <div key={index} className="mt-4 print:mt-2">
                              <h5 className={`font-bold text-lg text-yellow-600 print:text-gray-800`}>
                                {exp.position} @ {exp.company}
                              </h5>
                              <p className={`text-sm text-pink-500 print:text-gray-500`}>
                                {exp.startDate} - {exp.current ? 'Ongoing' : exp.endDate}
                              </p>
                              <p className={`mt-1 text-base text-yellow-800 print:text-gray-600`}>{exp.description}</p>
                            </div>
                          ))}
                        </section>
                      )}
                      {formData.education.length > 0 && (
                        <section className="p-4 rounded-lg shadow-md transform rotate-2 print:transform-none print:shadow-none print:rounded-none print:p-0">
                          <h4 className={`text-xl font-bold text-pink-600 print:text-black`}>Learning Journey</h4>
                          {formData.education.map((edu, index) => (
                            <div key={index} className="mt-4 print:mt-2">
                              <h5 className={`font-bold text-lg text-yellow-600 print:text-gray-800`}>
                                {edu.degree} in {edu.field}
                              </h5>
                              <p className={`text-sm text-pink-500 print:text-gray-600`}>
                                {edu.institution} {edu.gpa && ` (GPA: ${edu.gpa})`}
                              </p>
                              <p className={`text-sm text-pink-500 print:text-gray-500`}>
                                {edu.startDate} - {edu.endDate}
                              </p>
                            </div>
                          ))}
                        </section>
                      )}
                      {formData.skills.length > 0 && (
                        <section className="p-4 rounded-lg shadow-md transform -rotate-1 print:transform-none print:shadow-none print:rounded-none print:p-0">
                          <h4 className={`text-xl font-bold text-pink-600 print:text-black`}>Superpowers</h4>
                          <div className="flex flex-wrap gap-3 mt-2">
                            {formData.skills.map((skill, index) => (
                              <span
                                key={index}
                                className={`px-4 py-2 rounded-full text-base shadow-md bg-gradient-to-r from-pink-200 to-yellow-200 text-pink-800 print:bg-gray-100 print:text-gray-800 print:border-gray-200 print:shadow-none`}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </section>
                      )}
                      {formData.achievements.length > 0 && (
                        <section className="p-4 rounded-lg shadow-md transform rotate-1 print:transform-none print:shadow-none print:rounded-none print:p-0">
                          <h4 className={`text-xl font-bold text-pink-600 print:text-black`}>Trophies</h4>
                          <ul className={`mt-2 list-none space-y-2 text-base`}>
                            {formData.achievements.map((achievement, index) => (
                              <li key={index} className={`flex items-center gap-2 text-yellow-800 print:text-gray-600`}>
                                <Star className="w-5 h-5 text-pink-500" /> {achievement}
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}
                    </div>
                  )}
                </div>
                {/* Render PDFViewer if pdfBlob exists */}
                {pdfBlob && (
                  <div className="mt-6">
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      PDF Preview
                    </h3>
                    <PDFViewer pdfBlob={pdfBlob} />
                  </div>
                )}
              </div>

              {/* Statistics Dashboard */}
              <div className={`backdrop-blur-md border rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl ${darkMode
                  ? 'bg-white/10 border-white/20'
                  : 'bg-white/80 border-white/30'
                }`}>
                <h2 className={`text-xl md:text-2xl font-bold mb-6 flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                  <Settings className="w-6 h-6" />
                  <span>Statistics</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 ${darkMode ? 'bg-blue-500/20' : 'bg-violet-500/20'
                    }`}>
                    <p className={`font-semibold text-2xl ${darkMode ? 'text-blue-200' : 'text-violet-700'}`}>
                      {formData.experience.length}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-blue-100' : 'text-gray-600'}`}>Experiences</p>
                  </div>
                  <div className={`p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 ${darkMode ? 'bg-blue-500/20' : 'bg-violet-500/20'
                    }`}>
                    <p className={`font-semibold text-2xl ${darkMode ? 'text-blue-200' : 'text-violet-700'}`}>
                      {formData.education.length}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-blue-100' : 'text-gray-600'}`}>Education Entries</p>
                  </div>
                  <div className={`p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 ${darkMode ? 'bg-blue-500/20' : 'bg-violet-500/20'
                    }`}>
                    <p className={`font-semibold text-2xl ${darkMode ? 'text-blue-200' : 'text-violet-700'}`}>
                      {formData.skills.length}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-blue-100' : 'text-gray-600'}`}>Skills</p>
                  </div>
                  <div className={`p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 ${darkMode ? 'bg-blue-500/20' : 'bg-violet-500/20'
                    }`}>
                    <p className={`font-semibold text-2xl ${darkMode ? 'text-blue-200' : 'text-violet-700'}`}>
                      {formData.achievements.length}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-blue-100' : 'text-gray-600'}`}>Achievements</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`backdrop-blur-md border rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl ${darkMode
                  ? 'bg-white/10 border-white/20'
                  : 'bg-white/80 border-white/30'
                }`}>
                <h2 className={`text-xl md:text-2xl font-bold mb-6 flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                  <Settings className="w-6 h-6" />
                  <span>Actions</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <button
                    onClick={generateResume}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md ${darkMode
                        ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                        : 'bg-violet-500/20 text-violet-600 hover:bg-violet-500/30'
                      }`}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Generate</span>
                  </button>
                  <button
                    onClick={downloadPDF}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md ${darkMode
                        ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                        : 'bg-violet-500/20 text-violet-600 hover:bg-violet-500/30'
                      }`}
                  >
                    <Download className="w-5 h-5" />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md ${darkMode
                        ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                        : 'bg-violet-500/20 text-violet-600 hover:bg-violet-500/30'
                      }`}
                  >
                    <Copy className="w-5 h-5" />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={resetForm}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md ${darkMode
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-red-500/20 text-red-600 hover:bg-red-500/30'
                      }`}
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles and Animations */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print\\:bg-white {
            background: white !important;
          }
          .print\\:text-black {
            color: black !important;
          }
          .print\\:text-gray-600 {
            color: #4b5563 !important;
          }
          .print\\:text-gray-800 {
            color: #1f2937 !important;
          }
          .print\\:bg-gray-100 {
            background: #f3f4f6 !important;
          }
          .print\\:border-gray-200 {
            border-color: #e5e7eb !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:mt-1 {
            margin-top: 0.25rem !important;
          }
          .print\\:mt-2 {
            margin-top: 0.5rem !important;
          }
          .print\\:mb-2 {
            margin-bottom: 0.5rem !important;
          }
          .print\\:border-none {
            border: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:transform-none {
            transform: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .print\\:columns-1 {
            column-count: 1 !important;
          }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(-10px); }
          50% { transform: translateY(0); }
        }
        /* Custom font styles for creative template */
        .font-handwritten {
          font-family: 'Brush Script MT', cursive; /* Add font import if needed */
        }
        .font-cursive {
          font-family: 'Cursive', sans-serif;
        }
        /* Preview classes */
        .modern-preview {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
        }
        .corporate-preview {
          font-family: 'Times New Roman', serif;
          line-height: 1.5;
        }
        .creative-preview {
          font-family: 'Comic Sans MS', cursive, sans-serif; /* For fun; replace with better fonts */
          line-height: 1.7;
        }
      `}</style>
    </div>
  );
}