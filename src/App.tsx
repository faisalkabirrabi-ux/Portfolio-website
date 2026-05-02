import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { 
  Menu, X, Sun, Moon, MapPin, Mail, Save, Upload, Phone, MessageCircle, Gamepad2,
  Facebook, Instagram, Youtube, ChevronUp, Twitter, Users, Heart, Baby, Linkedin, Plus 
} from 'lucide-react';

// Dynamic data is handled by /api/content

const FadeIn: React.FC<{ delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

const ScaleInGalleryItem: React.FC<{ delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, delay, ease: "easeOut" }}
    className="h-full"
  >
    {children}
  </motion.div>
);

const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}> = ({ src, alt, className = "", onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "200px" } // Start loading 200px before it enters viewport
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) observer.unobserve(imgRef.current);
    };
  }, []);

  return (
    <div ref={imgRef} className={`relative overflow-hidden bg-neutral-200 dark:bg-neutral-900 ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 animate-pulse">
          <div className="text-[8px] font-black uppercase tracking-super opacity-20">Securely Loading...</div>
        </div>
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-1000 ease-in-out ${
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-110"
          } ${className.includes('grayscale') ? '' : ''}`}
          onClick={onClick}
        />
      )}
    </div>
  );
};

const GalleryItem: React.FC<{
  item: any;
  idx: number;
  isAdminMode: boolean;
  isUploading: boolean;
  updateContent: (path: string, value: any) => void;
  setLightboxImg: (url: string | null) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent, idx: number | 'new') => void;
  gallery: any[];
}> = ({ item, idx, isAdminMode, isUploading, updateContent, setLightboxImg, handleFileUpload, gallery }) => {
  return (
    <ScaleInGalleryItem delay={idx * 0.1}>
      <div
        className="group relative aspect-[4/5] overflow-hidden cursor-pointer"
      >
        <LazyImage 
          src={item.url}
          alt={item.alt || item.title}
          className={`w-full h-full grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105 ${isUploading ? 'opacity-20' : ''}`}
          onClick={() => !isAdminMode && setLightboxImg(item.url)}
        />

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {isAdminMode && (
          <div className="absolute top-2 right-2 flex flex-col gap-1 z-20">
            <label className="cursor-pointer bg-orange-600 text-white p-1 rounded hover:bg-orange-700 transition-colors flex items-center justify-center h-6 w-6">
              <Upload size={12} />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => handleFileUpload(e, idx)}
              />
            </label>
            <input 
              type="text" 
              value={item.url} 
              placeholder="Image URL"
              onChange={(e) => {
                const newGallery = [...gallery];
                newGallery[idx].url = e.target.value;
                updateContent('gallery', newGallery);
              }}
              className="text-[8px] bg-black/80 text-white p-1 rounded border border-white/20 focus:outline-none"
            />
            <input 
              type="text" 
              value={item.alt || ""} 
              placeholder="SEO / Alt Text"
              onChange={(e) => {
                const newGallery = [...gallery];
                newGallery[idx].alt = e.target.value;
                updateContent('gallery', newGallery);
              }}
              className="text-[8px] bg-black/80 text-white p-1 rounded border border-white/20 focus:outline-none"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex items-end p-6 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 w-full">
            <span className="text-white text-[9px] uppercase tracking-widest block mb-1">Index 0{idx + 1}</span>
            {isAdminMode ? (
              <div className="flex flex-col gap-2 w-full">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={item.title} 
                    placeholder="Title"
                    onChange={(e) => {
                      const newGallery = [...gallery];
                      newGallery[idx].title = e.target.value;
                      updateContent('gallery', newGallery);
                    }}
                    className="w-full bg-white/20 text-white font-serif italic text-xl focus:outline-none"
                  />
                  <button 
                    onClick={() => {
                      if (window.confirm("Permanently purge this entry from the archive?")) {
                        const newGallery = gallery.filter((_, i) => i !== idx);
                        updateContent('gallery', newGallery);
                      }
                    }}
                    className="bg-red-500/50 hover:bg-red-500 text-white p-1 text-[8px] uppercase font-bold"
                  >
                    DEL
                  </button>
                </div>
              </div>
            ) : (
              <span className="text-white font-serif italic text-xl">{item.title}</span>
            )}
          </div>
        </div>
      </div>
    </ScaleInGalleryItem>
  );
};


const GallerySectionWithScroll: React.FC<{
  gallery: any[];
  isAdminMode: boolean;
  updateContent: (path: string, value: any) => void;
  setLightboxImg: (url: string | null) => void;
  isDark: boolean;
}> = ({ gallery, isAdminMode, updateContent, setLightboxImg, isDark }) => {
  const galleryRef = useRef<HTMLElement>(null);
  const { scrollYProgress: galleryScroll } = useScroll({
    target: galleryRef,
    offset: ["start end", "end start"]
  });
  const backgroundY = useTransform(galleryScroll, [0, 1], ["0%", "30%"]);
  const [isUploading, setIsUploading] = useState<number | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent, idx: number | 'new') => {
    const file = 'files' in e ? (e as React.ChangeEvent<HTMLInputElement>).target.files?.[0] : (e as React.DragEvent).dataTransfer?.files[0];
    if (!file) return;

    const confirmMessage = idx === 'new' 
      ? "Upload this legacy record to the digital archive?" 
      : "Replace this archived visual entry? This action is irreversible until saved.";
    
    if (!window.confirm(confirmMessage)) {
      if ('target' in e) (e.target as HTMLInputElement).value = '';
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    const targetIdx = idx === 'new' ? gallery.length : idx;
    setIsUploading(targetIdx);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const newGallery = [...gallery];
        if (idx === 'new') {
          newGallery.push({ id: Date.now(), url: data.url, title: 'New Entry', alt: 'Describe this image for accessibility' });
        } else {
          newGallery[idx as number].url = data.url;
        }
        updateContent('gallery', newGallery);
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      alert('Network error during upload');
    } finally {
      setIsUploading(null);
    }
  };

  return (
    <section id="gallery" ref={galleryRef} className="py-24 border-t border-neutral-200 dark:border-white/10 relative z-10 overflow-hidden">
        {/* Parallax Background */}
        <motion.div 
          className="absolute inset-0 z-[-1] opacity-5 dark:opacity-10 grayscale"
          style={{
            y: backgroundY,
            backgroundImage: "url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000&auto=format&fit=crop')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-[-1] backdrop-blur-[2px]"></div>

        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="flex justify-between items-end mb-16">
              <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter">
                Visual <span className="text-transparent" style={{ WebkitTextStroke: isDark ? '1.5px rgba(255,255,255,0.8)' : '1.5px rgba(0,0,0,0.8)' }}>Archive</span>
              </h2>
              <div className="hidden md:block text-[10px] uppercase tracking-super font-bold text-neutral-500 dark:text-white/40 pb-3">{gallery.length} Items Indexed</div>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 px-1 bg-neutral-200/50 dark:bg-white/5 py-1 backdrop-blur-sm">
            {gallery.map((item: any, idx: number) => (
              <GalleryItem 
                key={item.id} 
                item={item} 
                idx={idx} 
                isAdminMode={isAdminMode} 
                isUploading={isUploading === idx} 
                updateContent={updateContent} 
                setLightboxImg={setLightboxImg} 
                handleFileUpload={handleFileUpload}
                gallery={gallery}
              />
            ))}
            {isAdminMode && (
              <ScaleInGalleryItem delay={gallery.length * 0.1}>
                <div className="aspect-[4/5] bg-neutral-200 dark:bg-white/5 border-2 border-dashed border-neutral-400 dark:border-white/10 flex flex-col items-center justify-center p-6 text-center hover:border-orange-500 transition-colors group">
                  {isUploading === gallery.length ? (
                    <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-neutral-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                        <Upload className="text-neutral-400 group-hover:text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-super">Append Visual</span>
                        <span className="text-[8px] opacity-60">Upload local image to archive</span>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'new')}
                      />
                    </label>
                  )}
                </div>
              </ScaleInGalleryItem>
            )}
          </div>
        </div>
      </section>
  );
};


const WorkSection: React.FC<{ 
  experience: any[]; 
  isAdminMode: boolean; 
  updateContent: (path: string, value: any) => void;
  isDark: boolean;
}> = ({ experience, isAdminMode, updateContent, isDark }) => {
  return (
    <section id="work" className="py-24 border-t border-neutral-200 dark:border-white/10 relative z-10 bg-neutral-50/50 dark:bg-neutral-900/10">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn>
           <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
              <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-neutral-900 dark:text-white">
                Work <span className="text-transparent" style={{ WebkitTextStroke: isDark ? '1.5px rgba(249, 115, 22, 0.5)' : '1.5px rgba(249, 115, 22, 0.5)' }}>Archive</span>
              </h2>
              <p className="text-[10px] uppercase tracking-super font-bold text-neutral-500 dark:text-white/40 pb-3">Professional Records & Current Position</p>
           </div>
        </FadeIn>

        <div className="space-y-6">
          {experience.map((item: any, idx: number) => (
            <FadeIn key={item.id} delay={idx * 0.1}>
              <div className="group relative grid grid-cols-1 md:grid-cols-12 gap-8 items-start py-12 border-b border-neutral-200 dark:border-white/5 last:border-0 px-4 hover:bg-neutral-100 dark:hover:bg-white/5 transition-all duration-500 rounded-2xl">
                <div className="md:col-span-3">
                   {isAdminMode ? (
                     <input 
                       value={item.duration}
                       onChange={(e) => {
                         const newExp = [...experience];
                         newExp[idx].duration = e.target.value;
                         updateContent('experience', newExp);
                       }}
                       className="bg-orange-500/10 text-[10px] font-black uppercase tracking-super text-orange-500 mb-2 block focus:outline-none w-full"
                     />
                   ) : (
                     <span className="text-[10px] font-black uppercase tracking-super text-orange-500 mb-2 block">{item.duration}</span>
                   )}
                   {isAdminMode ? (
                     <input 
                       value={item.location}
                       onChange={(e) => {
                         const newExp = [...experience];
                         newExp[idx].location = e.target.value;
                         updateContent('experience', newExp);
                       }}
                       className="bg-orange-500/10 text-xs text-neutral-400 dark:text-white/20 uppercase tracking-widest focus:outline-none w-full"
                     />
                   ) : (
                     <span className="text-xs text-neutral-400 dark:text-white/20 uppercase tracking-widest">{item.location}</span>
                   )}
                </div>
                <div className="md:col-span-9">
                  {isAdminMode ? (
                    <input 
                      value={item.position}
                      onChange={(e) => {
                        const newExp = [...experience];
                        newExp[idx].position = e.target.value;
                        updateContent('experience', newExp);
                      }}
                      className="w-full bg-orange-500/10 text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 focus:outline-none dark:text-white"
                    />
                  ) : (
                    <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-neutral-900 dark:text-white group-hover:text-orange-500 transition-colors mb-4">{item.position}</h3>
                  )}
                  {isAdminMode ? (
                    <input 
                      value={item.company}
                      onChange={(e) => {
                        const newExp = [...experience];
                        newExp[idx].company = e.target.value;
                        updateContent('experience', newExp);
                      }}
                      className="w-full bg-orange-500/10 text-xl font-serif italic text-neutral-500 focus:outline-none"
                    />
                  ) : (
                    <p className="text-xl font-serif italic text-neutral-500 dark:text-white/40">{item.company}</p>
                  )}
                </div>
                <div className="absolute top-0 right-4 text-[70px] md:text-[100px] font-black text-neutral-100 dark:text-white/[0.02] pointer-events-none select-none group-hover:text-orange-500/5 transition-colors z-[-1]">0{idx+1}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [content, setContent] = useState<any>(null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === '1234') {
      setIsAdminMode(true);
      setShowAdminLogin(false);
      setAdminPassword('');
      alert("System Overridden / Admin Access Granted.");
    } else {
      alert("Invalid Clearance / Access Denied.");
    }
  };

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => setContent(data));
  }, []);

  const saveContent = async () => {
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      if (response.ok) {
        alert('Changes saved to system.');
        setIsAdminMode(false);
      }
    } catch (error) {
      alert('Save failed.');
    }
  };

  const updateContent = (path: string, value: any) => {
    const newContent = { ...content };
    const keys = path.split('.');
    let current = newContent;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setContent(newContent);
  };
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxImg(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => setIsDark(!isDark);

  const handleShare = (e: React.MouseEvent, platform: string, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    const url = window.location.href;
    let shareUrl = '';
    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    } else if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
    }
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [serverMessage, setServerMessage] = useState('');

  const validateField = (name: string, value: string) => {
    let error = '';
    if (name === 'name') {
      if (value.trim().length < 2) error = 'Name too short';
      if (value.length > 100) error = 'Name too long';
    } else if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) error = 'Invalid email signal';
    } else if (name === 'message') {
      if (value.trim().length < 10) error = 'Insufficient data / Min 10 chars';
      if (value.length > 5000) error = 'Buffer overflow / Max 5k chars';
    }
    return error;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation feedback
    const error = validateField(name, value);
    setFormErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final check
    const errors: Record<string, string> = {
      name: validateField('name', formState.name),
      email: validateField('email', formState.email),
      message: validateField('message', formState.message)
    };

    const hasErrors = Object.values(errors).some(err => err !== '');
    if (hasErrors) {
      setFormErrors(errors);
      return;
    }

    setSubmitStatus('submitting');
    setServerMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState)
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setServerMessage(data.message);
        setFormState({ name: '', email: '', message: '' });
      } else {
        setSubmitStatus('error');
        setServerMessage(data.message || 'Signal jamming / Connection lost.');
        if (data.errors) setFormErrors(data.errors);
      }
    } catch (error) {
      setSubmitStatus('error');
      setServerMessage('Critical system failure / Could not reach node.');
    }
  };

  const NavLinks = () => (
    <>
      {['About', 'Work', 'Gallery', 'Family', 'Updates', 'Contact'].map((item) => (
        <a 
          key={item} 
          href={`#${item.toLowerCase()}`}
          onClick={() => setIsMenuOpen(false)}
          className="text-[11px] uppercase tracking-[0.2em] font-semibold text-neutral-500 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          {item}
        </a>
      ))}
    </>
  );

  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  if (!content) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <motion.div 
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-[10px] font-black uppercase tracking-super text-orange-500"
        >
          Initializing Secure Archive...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] dark:bg-[#080808] text-[#111] dark:text-[#EFEFEF] font-sans transition-colors duration-300 overflow-x-hidden selection:bg-orange-500/30 selection:text-orange-900 dark:selection:text-white">
      
      {/* Admin Floating Controls */}
      <AnimatePresence>
        {isAdminMode && (
          <motion.div 
            initial={{ y: 100 }} 
            animate={{ y: 0 }} 
            className="fixed bottom-6 right-6 left-24 md:left-32 z-[70] flex items-center justify-between bg-orange-600 text-white px-6 py-4 rounded-xl shadow-2xl border-4 border-white/20 backdrop-blur-xl"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-super">System Administrator Mode</span>
              <span className="text-[8px] font-bold opacity-80">Click on any text or use "Edit Content" buttons to modify the archive.</span>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsAdminMode(false)}
                className="px-4 py-2 bg-black/20 hover:bg-black/40 rounded-lg text-[9px] font-black uppercase tracking-super transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveContent}
                className="px-4 py-2 bg-white text-orange-600 hover:bg-orange-50 rounded-lg text-[9px] font-black uppercase tracking-super flex items-center gap-2 transition-all shadow-lg"
              >
                <Save size={12} /> Save System Changes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#f9f9f9] dark:bg-[#080808] border border-neutral-200 dark:border-white/10 p-10 max-w-sm w-full relative">
              <button onClick={() => setShowAdminLogin(false)} className="absolute top-4 right-4 text-neutral-400"><X size={20} /></button>
              <h3 className="text-xl font-black uppercase tracking-super mb-6 text-orange-500">Security Check</h3>
              <form onSubmit={handleAdminLogin} className="space-y-6">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-super text-neutral-400 mb-2 block">Admin Access Token (Hint: 1234)</label>
                  <input 
                    type="password" 
                    value={adminPassword} 
                    onChange={(e) => setAdminPassword(e.target.value)} 
                    className="w-full bg-transparent border-0 border-b border-orange-500 pb-2 focus:outline-none focus:ring-0 text-sm tracking-[0.5em]" 
                    autoFocus
                  />
                </div>
                <button type="submit" className="w-full py-4 bg-orange-600 text-white text-[10px] font-bold uppercase tracking-super hover:bg-orange-700 transition-colors">Request Access</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Left Side Navigation Sidebar */}
      <nav className="fixed left-0 inset-y-0 w-16 md:w-24 z-50 border-r border-neutral-200 dark:border-white/10 flex flex-col items-center justify-between py-12 bg-[#f9f9f9] dark:bg-[#080808] transition-all duration-300">
        <div className="flex flex-col gap-1 items-center rotate-180 [writing-mode:vertical-lr]">
          <span className="text-[10px] font-bold uppercase tracking-super text-orange-500">
            Faisal Kabir Rabi
          </span>
          <span className="text-[8px] font-medium uppercase tracking-widest text-neutral-400 dark:text-white/20">
            Portfolio v1.0
          </span>
        </div>
        
        <div className="flex flex-col gap-10">
          {[
            { id: 'home', label: 'Index', icon: '01' },
            { id: 'about', label: 'Story', icon: '02' },
            { id: 'work', label: 'Work', icon: '03' },
            { id: 'gallery', label: 'Visuals', icon: '04' },
            { id: 'family', label: 'Circle', icon: '05' },
            { id: 'contact', label: 'Signal', icon: '06' }
          ].map((item) => (
            <a 
              key={item.id}
              href={`#${item.id}`} 
              className="group relative flex flex-col items-center"
              aria-label={`Go to ${item.id}`}
            >
              <div className="text-[9px] font-bold font-mono text-neutral-300 dark:text-white/10 group-hover:text-orange-500 transition-colors mb-1">
                {item.icon}
              </div>
              <div className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-white/20 group-hover:h-4 group-hover:w-0.5 group-hover:bg-orange-500 transition-all duration-300"></div>
              <span className="opacity-0 group-hover:opacity-100 text-[10px] uppercase font-black tracking-widest text-orange-500 transition-all absolute left-full ml-6 bg-[#f9f9f9] dark:bg-[#080808] px-3 py-1 border border-neutral-200 dark:border-white/10 pointer-events-none whitespace-nowrap translate-x-2 group-hover:translate-x-0 z-50">
                {item.label}
              </span>
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-6 items-center">
          <button 
            onClick={toggleTheme}
            className="p-2 text-neutral-400 hover:text-orange-500 transition-colors bg-white dark:bg-white/5 rounded-full shadow-sm border border-neutral-200 dark:border-white/10"
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </nav>

      {/* Main Content Area - Shifted for Left Nav */}
      <div className="pl-16 md:pl-24 transition-all duration-300">
        {/* Mobile Navigation Header (Fallback for tiny screens) */}
        <nav className="fixed top-0 right-0 left-16 md:hidden z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-neutral-200 dark:border-white/10">
          <span className="text-xs font-bold uppercase tracking-super text-orange-500">FKR / Portfolio</span>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-neutral-500">
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden bg-[#f9f9f9] dark:bg-[#080808] border-b border-neutral-200 dark:border-white/10"
            >
              <div className="flex flex-col space-y-4 p-6">
                <NavLinks />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden z-10">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl -z-10 mix-blend-multiply dark:mix-blend-overlay"></div>
        <div className="absolute -right-10 md:-right-20 top-40 text-[150px] md:text-[400px] font-black text-black/[0.03] dark:text-white/[0.02] leading-none select-none pointer-events-none font-sans z-[-1]">FKR</div>

        <div className="max-w-6xl mx-auto px-6 w-full flex flex-col md:flex-row gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full md:w-3/5 text-left"
          >
            <h1 className="text-[60px] md:text-[110px] font-black leading-[0.82] tracking-tighter uppercase font-sans mb-8">
              Faisal<br/>
              <span className="text-transparent" style={{ WebkitTextStroke: isDark ? '1.5px rgba(255,255,255,0.8)' : '1.5px rgba(0,0,0,0.8)' }}>Kabir</span><br/>
              <span className="text-orange-500">Rabi</span>
            </h1>
            <h2 className="text-xl md:text-2xl font-serif italic font-light leading-snug text-neutral-800 dark:text-white/90 underline decoration-orange-500/30 underline-offset-8 mb-10 max-w-xl">
              {isAdminMode ? (
                <input 
                  value={content.about.tagline || ""} 
                  onChange={(e) => updateContent('about.tagline', e.target.value)}
                  className="bg-orange-500/10 border-b border-orange-500 w-full focus:outline-none"
                />
              ) : (
                `"${content.about.tagline || "Architecture of memory, coded into digital existence."}"`
              )}
            </h2>
            
            <div className="flex flex-wrap gap-12 items-end border-t border-neutral-300 dark:border-white/20 pt-6">
              <div className="flex-1">
                <span className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-white/40 block mb-2">Based In</span>
                <span className="text-sm font-medium">{content.contact.present_address}</span>
              </div>
              <div className="flex-1 hidden sm:block">
                <span className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-white/40 block mb-2">Personality</span>
                <span className="text-sm font-medium">Creative / Driven</span>
              </div>
              <div className="flex-1">
                <a href="#about" className="group cursor-pointer inline-block">
                  <span className="text-[9px] uppercase tracking-super text-neutral-500 dark:text-white/40 mb-2 group-hover:text-orange-500 transition-colors block">The Story</span>
                  <span className="text-sm md:text-lg font-bold font-serif italic whitespace-nowrap text-neutral-900 dark:text-white group-hover:text-neutral-900 dark:group-hover:text-white">About Faisal &rarr;</span>
                </a>
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full md:w-2/5 flex justify-center py-10"
          >
            <div className="relative w-full max-w-sm aspect-[4/5] overflow-hidden border border-neutral-200 dark:border-white/10 p-2 group cursor-pointer" onClick={() => window.open('https://www.facebook.com/share/1CimePjjPF/', '_blank')}>
              <LazyImage 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop" 
                alt="Faisal Kabir Rabi" 
                className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 hover:opacity-100 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Facebook size={16} /> View Profile</span>
              </div>
              <div className="absolute bottom-4 right-4 text-[9px] font-bold uppercase tracking-widest text-white/80 mix-blend-difference">FKR / Vol.01</div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30"
        >
          <span className="text-[8px] uppercase tracking-super font-bold">Scroll</span>
          <div className="h-10 w-[1px] bg-neutral-400 dark:bg-white/20 relative overflow-hidden">
            <motion.div 
              animate={{ y: [0, 40] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 w-full h-4 bg-orange-500"
            />
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 border-t border-neutral-200 dark:border-white/10 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-16 text-neutral-200 dark:text-[#111] mix-blend-multiply dark:mix-blend-screen relative">
              <span className="absolute inset-0 text-neutral-900 dark:text-white opacity-10 blur-[1px]">Timeline</span>
              The <span className="text-transparent" style={{ WebkitTextStroke: isDark ? '1.5px rgba(255,255,255,0.4)' : '1.5px rgba(0,0,0,0.4)' }}>Story</span>
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.updates.map((item: any, idx: number) => (
              <FadeIn key={item.id} delay={idx * 0.1}>
                <div className="border-t-2 border-neutral-900 dark:border-white/20 pt-6 group hover:border-orange-500 transition-colors">
                  <span className="text-[10px] uppercase tracking-super font-bold text-orange-500 block mb-4">Phase 0{idx + 1}</span>
                  {isAdminMode ? (
                    <input 
                      type="text" 
                      value={item.title} 
                      onChange={(e) => {
                        const newUpdates = [...content.updates];
                        newUpdates[idx].title = e.target.value;
                        updateContent('updates', newUpdates);
                      }}
                      className="w-full bg-orange-500/10 border-b border-orange-500 text-xl font-bold font-serif italic mb-4 focus:outline-none"
                    />
                  ) : (
                    <h3 className="text-xl font-bold font-serif italic mb-4 text-neutral-900 dark:text-white group-hover:text-orange-500 transition-colors">{item.title}</h3>
                  )}
                  {isAdminMode ? (
                    <textarea 
                      value={item.desc}
                      onChange={(e) => {
                        const newUpdates = [...content.updates];
                        newUpdates[idx].desc = e.target.value;
                        updateContent('updates', newUpdates);
                      }}
                      className="w-full bg-orange-500/10 border-b border-orange-500 text-sm text-neutral-600 dark:text-white/60 leading-relaxed font-sans focus:outline-none resize-none"
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-neutral-600 dark:text-white/60 leading-relaxed font-sans">{item.desc}</p>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
      
      {/* Work Section */}
      <WorkSection 
        experience={content.experience || []} 
        isAdminMode={isAdminMode} 
        updateContent={updateContent} 
        isDark={isDark}
      />

      {/* Gallery Section */}
        <GallerySectionWithScroll 
          gallery={content.gallery} 
          isAdminMode={isAdminMode} 
          updateContent={updateContent} 
          setLightboxImg={setLightboxImg}
          isDark={isDark}
        />

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImg(null)}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <button
              className="absolute top-6 right-6 text-white/50 hover:text-white p-2 transition-colors uppercase text-[10px] tracking-widest font-bold flex items-center gap-2"
              onClick={(e) => { e.stopPropagation(); setLightboxImg(null); }}
            >
              <X size={16} /> Close
            </button>
            <div className="text-[100px] md:text-[300px] absolute font-black text-white/[0.02] pointer-events-none select-none uppercase font-sans tracking-tighter">View</div>
            <motion.img
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300, duration: 0.6 }}
              src={lightboxImg}
              alt="Memory Full View"
              className="max-w-full max-h-[90vh] object-contain shadow-2xl relative z-10"
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="absolute bottom-6 left-6 text-white/50 flex gap-4 uppercase text-[10px] tracking-[0.2em] font-bold items-center z-20" onClick={(e) => e.stopPropagation()}>
              <span className="hidden md:inline">Share:</span>
              <button className="hover:text-white transition-colors cursor-pointer" onClick={(e) => handleShare(e, 'twitter', 'Check out this memory from Faisal Kabir Rabi!')}>X(TW)</button>
              <button className="hover:text-white transition-colors cursor-pointer" onClick={(e) => handleShare(e, 'facebook', 'Check out this memory from Faisal Kabir Rabi!')}>FB</button>
              <button className="hover:text-white transition-colors cursor-pointer" onClick={(e) => handleShare(e, 'linkedin', 'Check out this memory from Faisal Kabir Rabi!')}>IN</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Family Section - VOL 2 */}
      <section id="family" className="py-24 border-t border-neutral-200 dark:border-white/10 relative z-10 bg-neutral-50 dark:bg-[#050505]">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 mb-16">
              <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter">
                VOL. <span className="text-orange-500">02</span>
              </h2>
              <div className="flex flex-col md:text-right">
                <span className="text-[10px] font-black uppercase tracking-super text-orange-500">Family & Heritage</span>
                <span className="text-[9px] font-medium uppercase tracking-[0.3em] text-neutral-400 dark:text-white/20">The Biological Archive</span>
              </div>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Sisters Pillar */}
            <div className="space-y-12">
              <FadeIn>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-2 bg-orange-500/10 rounded-full">
                    <Users className="text-orange-500" size={20} />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">The Sisters</h3>
                </div>
              </FadeIn>

              <div className="grid grid-cols-1 gap-12">
                {content.family?.sisters?.map((sister: any, idx: number) => (
                  <FadeIn key={idx} delay={idx * 0.1}>
                    <div className="group relative">
                      {/* Sister Card */}
                      <div className="border-l-2 border-neutral-200 dark:border-white/10 pl-6 group-hover:border-orange-500 transition-colors">
                        <div className="flex justify-between items-baseline mb-2">
                          {isAdminMode ? (
                            <input 
                              value={sister.name} 
                              onChange={(e) => {
                                const newSisters = [...(content.family?.sisters || [])];
                                newSisters[idx].name = e.target.value;
                                updateContent('family.sisters', newSisters);
                              }}
                              className="text-2xl font-bold font-serif italic text-neutral-900 dark:text-white bg-orange-500/10 w-full"
                            />
                          ) : (
                            <h4 className="text-2xl font-bold font-serif italic text-neutral-900 dark:text-white group-hover:text-orange-500 transition-colors">{sister.name}</h4>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Class:</span>
                            {isAdminMode ? (
                              <input 
                                value={sister.birth_year} 
                                onChange={(e) => {
                                  const newSisters = [...(content.family?.sisters || [])];
                                  newSisters[idx].birth_year = e.target.value;
                                  updateContent('family.sisters', newSisters);
                                }}
                                className="text-[10px] font-bold text-orange-500 bg-orange-500/10 w-12"
                              />
                            ) : (
                              <span className="text-[10px] font-bold text-orange-500">{sister.birth_year}</span>
                            )}
                          </div>
                        </div>

                        {isAdminMode ? (
                          <textarea 
                            value={sister.bio}
                            onChange={(e) => {
                              const newSisters = [...(content.family?.sisters || [])];
                              newSisters[idx].bio = e.target.value;
                              updateContent('family.sisters', newSisters);
                            }}
                            className="text-sm text-neutral-500 dark:text-white/50 font-sans mt-2 bg-orange-500/10 w-full"
                            rows={2}
                          />
                        ) : (
                          <p className="text-sm text-neutral-500 dark:text-white/50 font-sans mt-2 leading-relaxed">{sister.bio}</p>
                        )}

                        {/* Relatives */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded">
                            <div className="text-[8px] font-black uppercase tracking-super text-neutral-400 mb-1">Companion</div>
                            <div className="flex justify-between items-center">
                              {isAdminMode ? (
                                <input 
                                  value={sister.husband.name} 
                                  onChange={(e) => {
                                    const newSisters = [...(content.family?.sisters || [])];
                                    newSisters[idx].husband.name = e.target.value;
                                    updateContent('family.sisters', newSisters);
                                  }}
                                  className="text-[11px] font-bold text-neutral-800 dark:text-white/80 bg-orange-500/10"
                                />
                              ) : (
                                <span className="text-[11px] font-bold text-neutral-800 dark:text-white/80">{sister.husband.name}</span>
                              )}
                              <span className="text-[9px] font-mono text-neutral-400">'{sister.husband?.birth_year?.slice(-2)}</span>
                            </div>
                          </div>
                          
                          <div className="p-3 bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded group/desc">
                            <div className="flex justify-between items-center mb-1">
                              <div className="text-[8px] font-black uppercase tracking-super text-neutral-400">Descendants</div>
                              {isAdminMode && (
                                <button 
                                  onClick={() => {
                                    const newSisters = [...(content.family?.sisters || [])];
                                    if (!newSisters[idx].children) newSisters[idx].children = [];
                                    newSisters[idx].children.push({ name: "New Child", birth_year: "20XX" });
                                    updateContent('family.sisters', newSisters);
                                  }}
                                  className="p-1 bg-orange-500 text-white rounded-sm hover:bg-orange-600 transition-colors"
                                  title="Add Child"
                                >
                                  <Plus size={8} />
                                </button>
                              )}
                            </div>
                            <div className="flex gap-1.5 flex-wrap">
                              {sister.children?.length > 0 ? sister.children.map((child: any, cIdx: number) => (
                                <div key={cIdx} className="flex flex-col relative group/child">
                                  {isAdminMode ? (
                                    <>
                                      <input 
                                        value={child.name} 
                                        onChange={(e) => {
                                          const newSisters = [...(content.family?.sisters || [])];
                                          newSisters[idx].children[cIdx].name = e.target.value;
                                          updateContent('family.sisters', newSisters);
                                        }}
                                        className="text-[10px] font-bold text-neutral-700 dark:text-white/70 italic bg-orange-500/5 w-16"
                                      />
                                      <input 
                                        value={child.birth_year} 
                                        onChange={(e) => {
                                          const newSisters = [...(content.family?.sisters || [])];
                                          newSisters[idx].children[cIdx].birth_year = e.target.value;
                                          updateContent('family.sisters', newSisters);
                                        }}
                                        className="text-[8px] font-mono text-orange-500/60 bg-orange-500/5 w-12"
                                      />
                                      <button 
                                        onClick={() => {
                                          const newSisters = [...(content.family?.sisters || [])];
                                          newSisters[idx].children.splice(cIdx, 1);
                                          updateContent('family.sisters', newSisters);
                                        }}
                                        className="absolute -top-1 -right-1 text-[6px] text-red-500 opacity-0 group-hover/child:opacity-100"
                                      >
                                        ×
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-[10px] font-bold text-neutral-700 dark:text-white/70 italic">{child.name}</span>
                                      <span className="text-[8px] font-mono text-orange-500/60">({child.birth_year})</span>
                                    </>
                                  )}
                                </div>
                              )) : <span className="text-[10px] italic text-neutral-400">None registered</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>

            {/* Core Unit Pillar */}
            <div className="space-y-12">
              <FadeIn>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-2 bg-orange-500/10 rounded-full">
                    <Heart className="text-orange-500" size={20} />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Inner Circle</h3>
                </div>
              </FadeIn>

              {/* Wife Display */}
              <FadeIn delay={0.2}>
                <div className="group relative overflow-hidden bg-neutral-900 border-l-4 border-orange-500 p-8 shadow-2xl">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Heart size={80} className="text-white" />
                  </div>
                  <div className="relative z-10">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-orange-500 block mb-2">The Matriarch</span>
                    <div className="flex items-baseline gap-4 mb-4">
                      {isAdminMode ? (
                        <input 
                          value={content.family?.immediate?.wife?.name || ''} 
                          onChange={(e) => updateContent('family.immediate.wife.name', e.target.value)}
                          className="text-4xl font-black uppercase tracking-tighter text-white bg-white/10 w-full"
                        />
                      ) : (
                        <h4 className="text-4xl font-black uppercase tracking-tighter text-white">{content.family?.immediate?.wife?.name}</h4>
                      )}
                      <span className="text-[10px] font-mono text-white/40">{content.family?.immediate?.wife?.birth_year}</span>
                    </div>
                    {isAdminMode ? (
                      <textarea 
                        value={content.family?.immediate?.wife?.bio || ''}
                        onChange={(e) => updateContent('family.immediate.wife.bio', e.target.value)}
                        className="text-sm font-sans text-white/60 bg-white/10 w-full italic"
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm font-sans text-white/60 leading-relaxed italic border-l border-white/10 pl-6">{content.family?.immediate?.wife?.bio}</p>
                    )}
                  </div>
                </div>
              </FadeIn>

              {/* Children Display */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Baby className="text-neutral-400" size={16} />
                  <span className="text-[10px] font-black uppercase tracking-super text-neutral-400">Next Generation</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {content.family?.immediate?.children?.map((child: any, idx: number) => (
                    <FadeIn key={idx} delay={0.3 + (idx * 0.1)}>
                      <div className="p-5 border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-orange-500 transition-colors">
                        <div className="flex flex-col">
                          {isAdminMode ? (
                            <input 
                              value={child.name} 
                              onChange={(e) => {
                                const newChildren = [...(content.family?.immediate?.children || [])];
                                newChildren[idx].name = e.target.value;
                                updateContent('family.immediate.children', newChildren);
                              }}
                              className="text-sm font-black uppercase tracking-widest text-neutral-900 dark:text-white bg-orange-500/10 w-full"
                            />
                          ) : (
                            <span className="text-sm font-black uppercase tracking-widest text-neutral-900 dark:text-white">{child.name}</span>
                          )}
                          <div className="flex items-center gap-2 mt-1 mb-3">
                            <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest">Born:</span>
                            {isAdminMode ? (
                                <input 
                                  value={child.birth_year} 
                                  onChange={(e) => {
                                    const newChildren = [...(content.family?.immediate?.children || [])];
                                    newChildren[idx].birth_year = e.target.value;
                                    updateContent('family.immediate.children', newChildren);
                                  }}
                                  className="text-[10px] font-mono text-neutral-400 bg-orange-500/10 w-12"
                                />
                              ) : (
                                <span className="text-[10px] font-mono text-neutral-400">{child.birth_year}</span>
                              )}
                          </div>
                          {isAdminMode ? (
                            <textarea 
                              value={child.bio}
                              onChange={(e) => {
                                const newChildren = [...(content.family?.immediate?.children || [])];
                                newChildren[idx].bio = e.target.value;
                                updateContent('family.immediate.children', newChildren);
                              }}
                              className="text-[10px] text-neutral-500 dark:text-white/40 font-sans leading-relaxed bg-orange-500/10 w-full"
                              rows={2}
                            />
                          ) : (
                            <p className="text-[10px] text-neutral-500 dark:text-white/40 font-sans leading-relaxed italic">{child.bio}</p>
                          )}
                        </div>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Updates & Contact Sections Group */}
      <section className="py-24 border-t border-neutral-200 dark:border-white/10 relative z-10 bg-[#f4f4f4] dark:bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Updates & Socials */}
          <div id="updates" className="flex flex-col justify-between">
            <div>
              <FadeIn>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
                  Digital <span className="text-orange-500">Presence</span>
                </h2>
                <p className="text-sm font-serif italic text-neutral-500 dark:text-white/40 mb-12 max-w-md">Logs, dispatches, and coordinates across the web.</p>
              </FadeIn>
              
              <FadeIn delay={0.1}>
                <div className="space-y-8 mb-16">
                  <div className="border-b border-neutral-300 dark:border-white/10 pb-4">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400 dark:text-white/30 block mb-6">Recent Dispatches</span>
                    <div className="space-y-6">
                      {content.updates.map((update: any, idx: number) => (
                        <div key={update.id} className="group">
                          <div className="flex gap-4 items-baseline">
                            {isAdminMode ? (
                               <input 
                               type="text" 
                               value={update.date}
                               onChange={(e) => {
                                 const newUpdates = [...content.updates];
                                 newUpdates[idx].date = e.target.value;
                                 updateContent('updates', newUpdates);
                               }}
                               className="text-[10px] text-orange-500 font-bold bg-orange-500/10"
                             />
                            ) : (
                              <span className="text-[10px] text-orange-500 font-bold whitespace-nowrap">{update.date}</span>
                            )}
                            {isAdminMode ? (
                               <input 
                               type="text" 
                               value={update.title}
                               onChange={(e) => {
                                 const newUpdates = [...content.updates];
                                 newUpdates[idx].title = e.target.value;
                                 updateContent('updates', newUpdates);
                               }}
                               className="text-lg font-bold font-serif italic bg-orange-500/10 w-full"
                             />
                            ) : (
                              <h4 className="text-lg font-bold font-serif italic text-neutral-800 dark:text-white/90 group-hover:text-orange-500 transition-colors">{update.title}</h4>
                            )}
                          </div>
                          {isAdminMode ? (
                             <textarea 
                             value={update.desc}
                             onChange={(e) => {
                               const newUpdates = [...content.updates];
                               newUpdates[idx].desc = e.target.value;
                               updateContent('updates', newUpdates);
                             }}
                             className="text-sm text-neutral-500 dark:text-white/50 mt-2 ml-16 md:ml-24 font-sans bg-orange-500/10 w-full"
                             rows={2}
                           />
                          ) : (
                            <p className="text-sm text-neutral-500 dark:text-white/50 mt-2 pl-16 md:pl-24 font-sans">{update.desc}</p>
                          )}
                          <div className="mt-4 pl-16 md:pl-24 flex items-center gap-6 text-[9px] font-bold uppercase tracking-widest text-neutral-400 dark:text-white/30">
                            <span className="hidden md:inline">TRANSMIT:</span>
                            <div className="flex gap-4">
                              <button 
                                className="group/share hover:text-orange-500 transition-all flex items-center gap-1.5"
                                onClick={(e) => handleShare(e, 'twitter', update.title)}
                                title="Share on X"
                              >
                                <Twitter size={12} className="group-hover/share:scale-110 transition-transform" />
                                <span className="opacity-0 group-hover/share:opacity-100 transition-opacity">X</span>
                              </button>
                              <button 
                                className="group/share hover:text-orange-500 transition-all flex items-center gap-1.5"
                                onClick={(e) => handleShare(e, 'facebook', update.title)}
                                title="Share on Facebook"
                              >
                                <Facebook size={12} className="group-hover/share:scale-110 transition-transform" />
                                <span className="opacity-0 group-hover/share:opacity-100 transition-opacity">FB</span>
                              </button>
                              <button 
                                className="group/share hover:text-orange-500 transition-all flex items-center gap-1.5"
                                onClick={(e) => handleShare(e, 'linkedin', update.title)}
                                title="Share on LinkedIn"
                              >
                                <Linkedin size={12} className="group-hover/share:scale-110 transition-transform" />
                                <span className="opacity-0 group-hover/share:opacity-100 transition-opacity">IN</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={0.2}>
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400 dark:text-white/30 block mb-6">Network Nodes</span>
                <div className="flex flex-wrap gap-8">
                  {[
                    { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/share/1CimePjjPF/" },
                    { icon: Instagram, label: "Instagram", href: content.contact.instagram },
                    { icon: Youtube, label: "YouTube", href: "#" }
                  ].map((item, i) => (
                    <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 hover:text-orange-500 transition-colors">
                      <item.icon size={20} className="text-neutral-900 dark:text-white group-hover:text-orange-500 transition-colors" strokeWidth={1.5} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-white/50 group-hover:text-orange-500 transition-colors">{item.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Contact Form */}
          <div id="contact">
            <FadeIn>
              <div className="border border-neutral-300 dark:border-white/10 p-8 md:p-12 bg-[#f9f9f9] dark:bg-[#080808]">
                <div className="mb-12">
                  <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Initiate <span className="text-orange-500">Contact</span></h2>
                  <p className="text-xs font-serif italic text-neutral-500 dark:text-white/40">Secure channel / Direct transmission</p>
                </div>

                <div className="flex flex-col gap-6 mb-10 text-sm text-neutral-600 dark:text-white/60">
                  <div className="flex items-center gap-4">
                    <Mail className="text-orange-500" size={16} />
                    {isAdminMode ? (
                      <input 
                        value={content.contact.email} 
                        onChange={(e) => updateContent('contact.email', e.target.value)}
                        className="bg-orange-500/10 text-xs font-mono uppercase tracking-widest text-neutral-900 dark:text-white focus:outline-none w-full"
                      />
                    ) : (
                      <a href={`mailto:${content.contact.email}`} className="font-mono text-xs uppercase tracking-widest text-neutral-900 dark:text-white hover:text-orange-500 transition-colors">{content.contact.email}</a>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Phone className="text-orange-500" size={16} />
                    {isAdminMode ? (
                      <input 
                        value={content.contact.phone} 
                        onChange={(e) => updateContent('contact.phone', e.target.value)}
                        className="bg-orange-500/10 text-xs font-mono uppercase tracking-widest text-neutral-900 dark:text-white focus:outline-none w-full"
                      />
                    ) : (
                      <div className="flex items-center gap-4">
                        <a href={`tel:${content.contact.phone}`} className="font-mono text-xs uppercase tracking-widest text-neutral-900 dark:text-white hover:text-orange-500 transition-colors">{content.contact.phone}</a>
                        <a 
                          href={`https://wa.me/${content.contact.phone.replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-super bg-green-500/10 text-green-500 px-2 py-0.5 rounded hover:bg-green-500/20 transition-colors"
                        >
                          <MessageCircle size={10} /> WhatsApp
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <Gamepad2 className="text-orange-600" size={16} />
                    {isAdminMode ? (
                      <div className="flex flex-col gap-1 w-full">
                        <span className="text-[10px] font-black uppercase tracking-super text-neutral-400 dark:text-white/20">Free Fire UID</span>
                        <input 
                          value={content.contact.free_fire_uid} 
                          onChange={(e) => updateContent('contact.free_fire_uid', e.target.value)}
                          className="bg-orange-500/10 text-xs font-mono uppercase tracking-widest text-neutral-900 dark:text-white focus:outline-none w-full"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-super text-orange-600 mb-0.5">Free Fire Archive</span>
                        <span className="font-mono text-xs uppercase tracking-widest text-neutral-900 dark:text-white">UID: {content.contact.free_fire_uid}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-4">
                    <MapPin className="text-orange-500 mt-1" size={16} />
                    <div className="flex flex-col gap-4 w-full">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-super text-neutral-400 dark:text-white/20 mb-1">Present Address</span>
                        {isAdminMode ? (
                          <input 
                            value={content.contact.present_address} 
                            onChange={(e) => updateContent('contact.present_address', e.target.value)}
                            className="bg-orange-500/10 text-xs font-mono uppercase tracking-widest text-neutral-900 dark:text-white focus:outline-none w-full"
                          />
                        ) : (
                          <span className="font-mono text-xs uppercase tracking-widest text-neutral-900 dark:text-white">{content.contact.present_address}</span>
                        )}
                      </div>
                      <div className="flex flex-col border-t border-neutral-200 dark:border-white/5 pt-4">
                        <span className="text-[10px] font-black uppercase tracking-super text-neutral-400 dark:text-white/20 mb-1">Home Town Address</span>
                        {isAdminMode ? (
                          <input 
                            value={content.contact.hometown} 
                            onChange={(e) => updateContent('contact.hometown', e.target.value)}
                            className="bg-orange-500/10 text-xs font-mono uppercase tracking-widest text-neutral-900 dark:text-white focus:outline-none w-full"
                          />
                        ) : (
                          <span className="font-mono text-xs uppercase tracking-widest text-neutral-900 dark:text-white">{content.contact.hometown}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Instagram className="text-orange-500" size={16} />
                    {isAdminMode ? (
                      <input 
                        value={content.contact.instagram} 
                        onChange={(e) => updateContent('contact.instagram', e.target.value)}
                        className="bg-orange-500/10 text-xs font-mono uppercase tracking-widest text-neutral-900 dark:text-white focus:outline-none w-full"
                      />
                    ) : (
                      <a href={content.contact.instagram} target="_blank" rel="noopener noreferrer" className="font-mono text-xs uppercase tracking-widest text-neutral-900 dark:text-white hover:text-orange-500 transition-colors">Instagram Profile</a>
                    )}
                  </div>
                </div>

                <form className="space-y-10" onSubmit={handleContactSubmit}>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="name"
                      value={formState.name}
                      onChange={handleInputChange}
                      placeholder="IDENTIFICATION / NAME" 
                      className={`w-full bg-transparent border-0 border-b ${formErrors.name ? 'border-red-500' : 'border-neutral-300 dark:border-white/20'} pb-3 text-xs uppercase tracking-widest focus:outline-none focus:ring-0 focus:border-orange-500 transition-colors placeholder:text-neutral-400 dark:placeholder:text-white/40`}
                    />
                    {formErrors.name && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute right-0 top-0 text-[8px] font-bold text-red-500 uppercase tracking-tighter">
                        {formErrors.name}
                      </motion.span>
                    )}
                  </div>
                  <div className="relative">
                    <input 
                      type="email" 
                      name="email"
                      value={formState.email}
                      onChange={handleInputChange}
                      placeholder="RETURN SIGNAL / EMAIL" 
                      className={`w-full bg-transparent border-0 border-b ${formErrors.email ? 'border-red-500' : 'border-neutral-300 dark:border-white/20'} pb-3 text-xs uppercase tracking-widest focus:outline-none focus:ring-0 focus:border-orange-500 transition-colors placeholder:text-neutral-400 dark:placeholder:text-white/40`}
                    />
                    {formErrors.email && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute right-0 top-0 text-[8px] font-bold text-red-500 uppercase tracking-tighter">
                        {formErrors.email}
                      </motion.span>
                    )}
                  </div>
                  <div className="relative">
                    <textarea 
                      rows={4} 
                      name="message"
                      value={formState.message}
                      onChange={handleInputChange}
                      placeholder="TRANSMISSION DATA / MESSAGE" 
                      className={`w-full bg-transparent border-0 border-b ${formErrors.message ? 'border-red-500' : 'border-neutral-300 dark:border-white/20'} pb-3 text-xs uppercase tracking-widest focus:outline-none focus:ring-0 focus:border-orange-500 transition-colors resize-none placeholder:text-neutral-400 dark:placeholder:text-white/40`}
                    ></textarea>
                    {formErrors.message && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute right-0 top-0 text-[8px] font-bold text-red-500 uppercase tracking-tighter">
                        {formErrors.message}
                      </motion.span>
                    )}
                  </div>

                  <div className="flex flex-col gap-4">
                    <button 
                      type="submit" 
                      disabled={submitStatus === 'submitting'}
                      className="w-full group relative inline-flex items-center justify-center overflow-hidden border border-neutral-900 dark:border-white/20 px-8 py-4 transition-all hover:border-orange-500 disabled:opacity-50"
                    >
                      <span className={`absolute left-0 top-0 h-full bg-orange-500 transition-all duration-300 ease-out ${submitStatus === 'submitting' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                      <span className="relative text-xs uppercase tracking-[0.2em] font-bold text-neutral-900 dark:text-white group-hover:text-white transition-colors duration-300">
                        {submitStatus === 'submitting' ? 'Transmitting...' : 'Transmit Data'}
                      </span>
                    </button>

                    <AnimatePresence>
                      {serverMessage && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`text-[10px] uppercase tracking-widest font-bold text-center py-2 border ${submitStatus === 'success' ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-red-500 border-red-500/20 bg-red-500/5'}`}
                        >
                          {serverMessage}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </form>
              </div>
            </FadeIn>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f9f9f9] dark:bg-[#080808] py-12 border-t border-neutral-200 dark:border-white/10 transition-colors z-10 relative">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-end flex-wrap gap-8">
          <div className="flex gap-12 md:gap-20">
            <a href="#about" className="group cursor-pointer hidden md:block">
              <div className="text-[9px] uppercase tracking-super text-neutral-500 dark:text-white/30 mb-2 group-hover:text-orange-500 transition-colors">The Story</div>
              <div className="text-sm font-bold font-serif italic text-neutral-900 dark:text-white">About Faisal &rarr;</div>
            </a>
            <a href="#gallery" className="group cursor-pointer hidden md:block">
              <div className="text-[9px] uppercase tracking-super text-neutral-500 dark:text-white/30 mb-2 group-hover:text-orange-500 transition-colors">The Gallery</div>
              <div className="text-sm font-bold font-serif italic text-neutral-900 dark:text-white">Digital Memories &rarr;</div>
            </a>
            <div className="md:hidden flex flex-col gap-1">
              <div className="text-[10px] font-bold uppercase tracking-super text-orange-500">Vol. 01</div>
              <div className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 dark:text-white/40 italic font-serif">KABIR RABI</div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 text-right">
            <div className="flex items-center gap-6 text-[9px] font-bold uppercase tracking-widest text-neutral-500 dark:text-white/40">
              <button 
                onClick={() => setShowAdminLogin(true)} 
                className="hover:text-orange-500 transition-colors border border-orange-500/20 px-2 py-0.5 rounded"
              >
                Admin Gateway
              </button>
              <div className="flex items-center gap-4">
                <a href={content.contact.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-100 dark:bg-white/5 rounded-full hover:text-orange-500 transition-all hover:scale-110" title="Instagram">
                  <Instagram size={14} />
                </a>
                <a href="https://www.facebook.com/share/1CimePjjPF/" target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-100 dark:bg-white/5 rounded-full hover:text-orange-500 transition-all hover:scale-110" title="Facebook">
                  <Facebook size={14} />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-100 dark:bg-white/5 rounded-full hover:text-orange-500 transition-all hover:scale-110" title="Twitter">
                  <Twitter size={14} />
                </a>
              </div>
            </div>
            <div className="text-[9px] font-medium text-neutral-400 dark:text-white/30 uppercase tracking-[0.4em] flex items-center gap-4 mt-2">
              &copy; {new Date().getFullYear()} KABIR RABI
              <a 
                href="#home" 
                className="hover:text-orange-500 transition-colors border border-neutral-300 dark:border-white/20 p-2 rounded-full"
                aria-label="Back to top"
              >
                <ChevronUp size={14} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
);
}
