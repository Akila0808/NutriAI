import { useState, useEffect, useRef } from "react";
import { 
  Camera, 
  Home, 
  MessageSquare, 
  Calendar, 
  User as UserIcon, 
  Droplets, 
  Activity, 
  ChevronRight, 
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Loader2,
  Plus,
  Utensils,
  History
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, MealLog, Habit, FoodAnalysis, ThaliAnalysis } from "./types";
import { analyzeFoodImage, analyzeThaliImage, getChatbotResponse, generateDietPlan } from "./services/geminiService";

// --- Components ---

const Button = ({ children, onClick, variant = "primary", className = "", disabled = false }: any) => {
  const variants: any = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-secondary text-white hover:bg-secondary/90",
    outline: "border-2 border-primary text-primary hover:bg-primary/5",
    ghost: "text-primary hover:bg-primary/5",
    accent: "bg-accent text-white hover:bg-accent/90"
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`px-6 py-3 rounded-2xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }: any) => (
  <div className={`bg-white rounded-3xl p-6 card-shadow ${className}`}>
    {children}
  </div>
);

const HealthScore = ({ score }: { score: number }) => {
  const getColor = () => {
    if (score >= 8) return "text-primary";
    if (score >= 5) return "text-yellow-500";
    return "text-red-500";
  };
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`text-5xl font-bold ${getColor()}`}>
        {score}
        <span className="text-xl text-gray-400">/10</span>
      </div>
      <div className="text-xs font-medium uppercase tracking-wider text-gray-400 mt-1">Health Score</div>
    </div>
  );
};

// --- Screens ---

const Onboarding = ({ onComplete }: { onComplete: (user: User) => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    lifestyle: "",
    goal: "",
    age: 25,
    weight: 70,
    height: 170
  });

  const lifestyles = [
    "Gym / Fitness Enthusiast",
    "Adults / Working Professionals",
    "Senior Citizens",
    "Yoga / Wellness Users",
    "Weight Loss Users",
    "Diabetic Users"
  ];

  const goals = [
    "Weight Loss",
    "Muscle Gain",
    "Diabetes Control",
    "General Health"
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else {
      // Save to DB
      fetch("/api/users/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      .then(res => res.json())
      .then(data => onComplete({ ...formData, id: data.id }));
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col justify-center max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-primary">HELLO!</h1>
              <p className="text-gray-500">Welcome to NutriAI. Let's start your health journey.</p>
            </div>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Full Name"
                className="w-full p-4 rounded-2xl bg-white border-none card-shadow focus:ring-2 focus:ring-primary outline-none"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <input 
                type="email" 
                placeholder="Email Address"
                className="w-full p-4 rounded-2xl bg-white border-none card-shadow focus:ring-2 focus:ring-primary outline-none"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <Button 
              onClick={handleNext} 
              className="w-full" 
              disabled={!formData.name.trim() || !formData.email.trim() || !formData.email.includes('@')}
            >
              Get Started
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-primary">Your Lifestyle</h1>
              <p className="text-gray-500">Select the category that best describes you.</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {lifestyles.map(l => (
                <button
                  key={l}
                  onClick={() => setFormData({ ...formData, lifestyle: l })}
                  className={`p-4 rounded-2xl text-left transition-all ${formData.lifestyle === l ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-700 card-shadow'}`}
                >
                  {l}
                </button>
              ))}
            </div>
            <Button onClick={handleNext} className="w-full" disabled={!formData.lifestyle}>Next</Button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-primary">Health Goal</h1>
              <p className="text-gray-500">What do you want to achieve?</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {goals.map(g => (
                <button
                  key={g}
                  onClick={() => setFormData({ ...formData, goal: g })}
                  className={`p-4 rounded-2xl text-left transition-all ${formData.goal === g ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-700 card-shadow'}`}
                >
                  {g}
                </button>
              ))}
            </div>
            <Button onClick={handleNext} className="w-full" disabled={!formData.goal}>Next</Button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-primary">Basic Info</h1>
              <p className="text-gray-500">Help us personalize your nutrition plan.</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Age</label>
                <input 
                  type="range" min="10" max="100" 
                  className="w-full accent-primary"
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) })}
                />
                <div className="text-right font-bold text-primary">{formData.age} years</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Weight (kg)</label>
                <input 
                  type="range" min="30" max="200" 
                  className="w-full accent-primary"
                  value={formData.weight}
                  onChange={e => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                />
                <div className="text-right font-bold text-primary">{formData.weight} kg</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Height (cm)</label>
                <input 
                  type="range" min="100" max="250" 
                  className="w-full accent-primary"
                  value={formData.height}
                  onChange={e => setFormData({ ...formData, height: parseInt(e.target.value) })}
                />
                <div className="text-right font-bold text-primary">{formData.height} cm</div>
              </div>
            </div>
            <Button onClick={handleNext} className="w-full">Complete Onboarding</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Dashboard = ({ user, onResult, isScannerOpen, onScannerToggle, meals, habits, onRefresh }: { 
  user: User, 
  onResult: (analysis: FoodAnalysis, image: string) => void, 
  isScannerOpen: boolean, 
  onScannerToggle: () => void,
  meals: MealLog[],
  habits: Habit[],
  onRefresh: () => void
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (isScannerOpen) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
          setCameraError(null);
        }).catch(err => {
          console.error("Camera error:", err);
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setCameraError("Camera access denied. Please enable camera permissions in your browser settings and try again.");
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            setCameraError("No camera found on this device.");
          } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            setCameraError("Camera is already in use by another application.");
          } else {
            setCameraError("Could not access camera. Please ensure you have granted permission.");
          }
        });
    }

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [isScannerOpen]);

  const autoCapture = async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing || !isScannerOpen) return;
    
    setIsAnalyzing(true);
    
    const context = canvasRef.current.getContext("2d");
    if (!context) {
      setIsAnalyzing(false);
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      setIsAnalyzing(false);
      return;
    }

    const size = Math.min(video.videoWidth, video.videoHeight);
    const startX = (video.videoWidth - size) / 2;
    const startY = (video.videoHeight - size) / 2;
    
    canvas.width = 640;
    canvas.height = 640;
    context.drawImage(video, startX, startY, size, size, 0, 0, 640, 640);
    
    const base64Image = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
    const fullImage = canvas.toDataURL("image/jpeg", 0.7);
    
    try {
      const result = await analyzeFoodImage(base64Image);
      if (result.foodName && result.foodName !== "Unknown" && result.calories > 0) {
        onResult(result, fullImage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (isAnalyzing || cameraError || !isScannerOpen) return;
    
    const timer = setTimeout(() => {
      if (document.visibilityState === 'visible') {
        autoCapture();
      }
    }, 2500); // Reduced from 5000ms to 2500ms for faster response

    return () => clearTimeout(timer);
  }, [isAnalyzing, cameraError, user.id, isScannerOpen]);

  const waterIntake = habits.filter(h => h.type === 'water').reduce((acc, curr) => acc + curr.value, 0);
  const caloriesToday = meals.filter(m => new Date(m.created_at).toDateString() === new Date().toDateString()).reduce((acc, curr) => acc + curr.calories, 0);

  return (
    <div className="p-6 space-y-8 pb-32 max-w-md mx-auto min-h-screen">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">Welcome Back</h2>
          <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white card-shadow flex items-center justify-center text-primary border border-gray-50">
          <UserIcon size={24} />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white p-6 flex flex-col justify-between h-40 border border-gray-50">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Calories</p>
            <h3 className="text-2xl font-bold text-gray-800">{Math.round(caloriesToday)} <span className="text-xs font-normal text-gray-400">kcal</span></h3>
          </div>
        </Card>
        <Card className="bg-white p-6 flex flex-col justify-between h-40 border border-gray-50">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Droplets size={20} />
            </div>
            <button 
              onClick={() => {
                fetch("/api/habits", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ user_id: user.id, type: "water", value: 0.25 })
                }).then(() => {
                  onRefresh();
                });
              }}
              className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center active:scale-90 transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus size={16} />
            </button>
          </div>
          <div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Water</p>
            <h3 className="text-2xl font-bold text-gray-800">{waterIntake} <span className="text-xs font-normal text-gray-400">L</span></h3>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-gray-800">Recent Meals</h3>
          <button className="text-primary text-xs font-bold uppercase tracking-widest">See All</button>
        </div>
        <div className="space-y-3">
          {meals.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs bg-white/50 rounded-[32px] border border-dashed border-gray-200">No meals logged yet.</div>
          ) : (
            meals.slice(0, 3).map(meal => (
              <Card key={meal.id} className="p-3 flex items-center space-x-4 border border-gray-50">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden">
                  <img src={meal.image_url} alt={meal.food_name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-sm">{meal.food_name}</h4>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{meal.calories} kcal • {meal.health_score}/10 Health</p>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Camera Modal */}
      <AnimatePresence>
        {isScannerOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm aspect-[4/5] bg-black rounded-[40px] overflow-hidden relative shadow-2xl border border-white/20"
            >
              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <AlertCircle className="text-red-500" size={48} />
                  <p className="text-white text-sm leading-relaxed">{cameraError}</p>
                  <div className="flex flex-col w-full space-y-2">
                    <Button 
                      onClick={() => {
                        setCameraError(null);
                        // Re-trigger the useEffect by toggling scanner off and on
                        onScannerToggle();
                        setTimeout(onScannerToggle, 100);
                      }} 
                      className="w-full bg-primary text-white"
                    >
                      Try Again
                    </Button>
                    <Button onClick={onScannerToggle} variant="outline" className="w-full text-white border-white/20">
                      Close
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    className="w-full h-full object-cover opacity-90" 
                  />
                  
                  {/* Glowing Scan Line */}
                  <div className="absolute inset-0 pointer-events-none">
                    <motion.div 
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-1 bg-primary/50 shadow-[0_0_15px_rgba(0,255,100,0.8)] z-10"
                    />
                  </div>

                  {/* Manual Capture Button */}
                  <div className="absolute bottom-10 left-0 right-0 flex justify-center z-20">
                    <button 
                      onClick={autoCapture}
                      disabled={isAnalyzing}
                      className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 backdrop-blur-sm active:scale-90 transition-all disabled:opacity-50"
                    >
                      <div className={`w-12 h-12 rounded-full ${isAnalyzing ? 'bg-gray-400 animate-pulse' : 'bg-white'}`} />
                    </button>
                  </div>

                  {/* Status Overlay */}
                  <div className="absolute top-10 left-0 right-0 flex justify-center z-20">
                    <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                      <p className="text-white text-[10px] font-bold uppercase tracking-widest">
                        {isAnalyzing ? "Analyzing Food..." : "Point at your meal"}
                      </p>
                    </div>
                  </div>

                  {/* Viewfinder Corners */}
                  <div className="absolute inset-12 pointer-events-none border border-white/10 rounded-3xl">
                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl"></div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl"></div>
                    <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl"></div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl"></div>
                  </div>

                  <button 
                    onClick={onScannerToggle}
                    className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/10"
                  >
                    <X size={20} />
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

const Analysis = ({ analysis, image, user, onSave, onBack }: { analysis: FoodAnalysis, image: string, user: User, onSave: () => void, onBack: () => void }) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          food_name: analysis.foodName,
          calories: analysis.calories,
          carbs: 0, // Simplified for prototype
          protein: 0,
          fat: 0,
          fiber: 0,
          health_score: analysis.healthScore,
          image_url: image
        })
      });
      onSave();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 max-w-md mx-auto">
      <div className="relative h-72">
        <img src={image} alt="Food" className="w-full h-full object-cover" />
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
      </div>

      <div className="px-6 -mt-12 relative z-10 space-y-6">
        <Card className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{analysis.foodName}</h1>
              <p className="text-primary font-bold">{analysis.calories} kcal</p>
            </div>
            <HealthScore score={analysis.healthScore} />
          </div>

          {analysis.isStreetFood && (
            <div className="bg-orange-50 p-3 rounded-2xl flex items-center space-x-3 text-orange-700 text-sm">
              <AlertCircle size={20} />
              <p>Street food detected. High oil/sodium content likely.</p>
            </div>
          )}

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Carbs", value: analysis.carbohydrates },
              { label: "Protein", value: analysis.protein },
              { label: "Fat", value: analysis.fat },
              { label: "Fiber", value: analysis.fiber }
            ].map(item => (
              <div key={item.label} className="bg-gray-50 p-2 rounded-xl text-center">
                <p className="text-[10px] text-gray-400 uppercase font-bold">{item.label}</p>
                <p className={`text-xs font-bold ${item.value === 'High' ? 'text-orange-500' : item.value === 'Medium' ? 'text-yellow-600' : 'text-primary'}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center space-x-2">
            <Utensils size={20} className="text-primary" />
            <h3 className="font-bold text-gray-800">Meal Balance Checker</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Balance Score</span>
              <span className="font-bold text-primary">{analysis.balanceScore}/10</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full" style={{ width: `${analysis.balanceScore * 10}%` }}></div>
            </div>
            <p className="text-sm text-gray-600 italic">"{analysis.balanceFeedback}"</p>
          </div>
        </Card>

        <Card className="space-y-4">
          <h3 className="font-bold text-gray-800">Healthier Alternatives</h3>
          <div className="space-y-2">
            {analysis.suggestions.map(s => (
              <div key={s} className="flex items-center space-x-3 p-3 bg-primary/5 rounded-2xl text-primary text-sm font-medium">
                <CheckCircle2 size={18} />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </Card>

        <Button onClick={handleSave} className="w-full" disabled={isSaving}>
          {isSaving ? "Saving..." : "Log Meal"}
        </Button>
      </div>
    </div>
  );
};

const Chatbot = ({ user }: { user: User }) => {
  const [messages, setMessages] = useState<{ role: "user" | "bot", text: string }[]>([
    { role: "bot", text: "HELLO! I'm your NutriAI Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);
    
    try {
      const context = `User: ${user.name}, Lifestyle: ${user.lifestyle}, Goal: ${user.goal}`;
      const response = await getChatbotResponse(userMsg, context);
      setMessages(prev => [...prev, { role: "bot", text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "bot", text: "Sorry, I'm having trouble connecting. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-background max-w-md mx-auto">
      <header className="p-6 bg-white card-shadow flex items-center space-x-4">
        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white">
          <MessageSquare size={20} />
        </div>
        <div>
          <h1 className="font-bold text-gray-800">NutriAI</h1>
          <p className="text-xs text-primary font-medium">Online • Indian Food Expert</p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-4 rounded-3xl ${m.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-gray-800 card-shadow rounded-tl-none'}`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-3xl card-shadow rounded-tl-none flex space-x-1">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-gray-100 flex items-center space-x-3 pb-36">
        <input 
          type="text" 
          placeholder="Ask about Indian food..."
          className="flex-1 p-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-primary text-sm"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button 
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center active:scale-90 transition-all disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

const DietPlan = ({ user }: { user: User }) => {
  const [plan, setPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await generateDietPlan(user);
      setPlan(result);
    } catch (err) {
      alert("Failed to generate plan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8 pb-36 max-w-md mx-auto min-h-screen">
      <header>
        <h1 className="text-2xl font-bold text-primary">Weekly Diet Plan</h1>
        <p className="text-gray-500">Personalized Indian meals for {user.goal}</p>
      </header>

      {!plan ? (
        <Card className="p-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mx-auto">
            <Calendar size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-800">Ready for your plan?</h3>
            <p className="text-sm text-gray-500">We'll generate a 7-day Indian meal plan based on your profile and goals.</p>
          </div>
          <Button onClick={handleGenerate} className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : "Generate 7-Day Plan"}
          </Button>
        </Card>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="bg-white rounded-3xl p-6 card-shadow prose prose-sm max-w-none"
        >
          <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
            {plan}
          </div>
          <Button onClick={() => setPlan(null)} variant="outline" className="w-full mt-6">Regenerate Plan</Button>
        </motion.div>
      )}
    </div>
  );
};

const HistoryScreen = ({ user, onBack, meals }: { user: User, onBack: () => void, meals: MealLog[] }) => {
  return (
    <div className="p-6 space-y-8 pb-36 max-w-md mx-auto min-h-screen">
      <header className="flex items-center space-x-4">
        <button onClick={onBack} className="text-gray-400"><ArrowLeft size={24} /></button>
        <h1 className="text-2xl font-bold text-primary">Meal History</h1>
      </header>

      <div className="space-y-4">
        {meals.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No meals logged yet.</div>
        ) : (
          meals.map(meal => (
            <Card key={meal.id} className="p-4 flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden">
                <img src={meal.image_url} alt={meal.food_name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800">{meal.food_name}</h4>
                <p className="text-xs text-gray-400">{new Date(meal.created_at).toLocaleDateString()} • {meal.calories} kcal</p>
              </div>
              <div className={`font-bold ${meal.health_score >= 8 ? 'text-primary' : meal.health_score >= 5 ? 'text-yellow-500' : 'text-red-500'}`}>
                {meal.health_score}/10
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<"home" | "chat" | "plan" | "history">("home");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<{ analysis: FoodAnalysis, image: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showReminder, setShowReminder] = useState(false);

  const fetchData = async (userId: number) => {
    try {
      const [mealsRes, habitsRes] = await Promise.all([
        fetch(`/api/meals/${userId}`),
        fetch(`/api/habits/${userId}`)
      ]);
      const [mealsData, habitsData] = await Promise.all([
        mealsRes.json(),
        habitsRes.json()
      ]);
      setMeals(mealsData);
      setHabits(habitsData);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem("nutriai_email");
    if (savedEmail) {
      fetch(`/api/users/${savedEmail}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setUser(data);
            fetchData(data.id);
          }
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }

    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Set up a reminder every 30 minutes
    const interval = setInterval(() => {
      setShowReminder(true);
      if (Notification.permission === "granted") {
        new Notification("NutriAI: Time to drink water!", {
          body: "Stay hydrated to keep your energy levels up and metabolism active.",
          icon: "https://cdn-icons-png.flaticon.com/512/3105/3105807.png"
        });
      }
    }, 1800000); 

    return () => clearInterval(interval);
  }, [user]);

  const handleOnboard = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem("nutriai_email", newUser.email);
    fetchData(newUser.id);
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="animate-spin text-primary" size={48} />
    </div>
  );

  if (!user) return <Onboarding onComplete={handleOnboard} />;

  return (
    <div className="min-h-[100dvh] bg-background relative font-sans overflow-hidden">
      {/* Soft Blurred Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 h-full overflow-y-auto">
        <AnimatePresence mode="wait">
          {screen === "home" && !currentAnalysis && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Dashboard 
                user={user} 
                meals={meals}
                habits={habits}
                onRefresh={() => fetchData(user.id)}
                isScannerOpen={isScannerOpen}
                onScannerToggle={() => setIsScannerOpen(!isScannerOpen)}
                onResult={(analysis, image) => {
                  setCurrentAnalysis({ analysis, image });
                  setIsScannerOpen(false);
                }} 
              />
            </motion.div>
          )}
          {currentAnalysis && (
            <motion.div key="analysis" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
              <Analysis 
                analysis={currentAnalysis.analysis} 
                image={currentAnalysis.image} 
                user={user}
                onBack={() => setCurrentAnalysis(null)}
                onSave={() => {
                  setCurrentAnalysis(null);
                  fetchData(user.id);
                }}
              />
            </motion.div>
          )}
          {screen === "chat" && !currentAnalysis && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Chatbot user={user} />
            </motion.div>
          )}
          {screen === "plan" && !currentAnalysis && (
            <motion.div key="plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DietPlan user={user} />
            </motion.div>
          )}
          {screen === "history" && !currentAnalysis && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HistoryScreen user={user} meals={meals} onBack={() => setScreen("home")} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Water Reminder Popup */}
      <AnimatePresence>
        {showReminder && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-32 left-6 right-6 z-[100]"
          >
            <Card className="bg-primary text-white p-4 flex items-center justify-between shadow-2xl border-none">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Droplets size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Time to Hydrate!</h4>
                  <p className="text-[10px] opacity-80">Drink 250ml of water now.</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => {
                    fetch("/api/habits", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ user_id: user.id, type: "water", value: 0.25 })
                    }).then(() => {
                      setShowReminder(false);
                      fetchData(user.id);
                    });
                  }}
                  className="px-3 py-1 bg-white text-primary rounded-lg text-[10px] font-bold active:scale-95 transition-all"
                >
                  Drink
                </button>
                <button 
                  onClick={() => setShowReminder(false)}
                  className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Bar */}
      {!currentAnalysis && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-8 px-6">
          <nav className="w-full max-w-md bg-white/70 backdrop-blur-2xl border border-white/20 rounded-[40px] px-8 py-4 flex justify-between items-center shadow-2xl relative">
            <button 
              onClick={() => { setScreen("home"); setIsScannerOpen(false); }}
              className={`flex flex-col items-center space-y-1 transition-all ${screen === 'home' && !isScannerOpen ? 'text-primary scale-110' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Home size={22} strokeWidth={screen === 'home' ? 2.5 : 2} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
            </button>
            
            <button 
              onClick={() => { setScreen("plan"); setIsScannerOpen(false); }}
              className={`flex flex-col items-center space-y-1 transition-all ${screen === 'plan' ? 'text-primary scale-110' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Calendar size={22} strokeWidth={screen === 'plan' ? 2.5 : 2} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Plan</span>
            </button>

            {/* Elevated Camera Button */}
            <div className="relative -top-8 flex items-center justify-center">
              <button 
                onClick={() => {
                  if (screen !== 'home') setScreen('home');
                  setIsScannerOpen(!isScannerOpen);
                }}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,255,100,0.3)] transition-all active:scale-90 z-50 ${isScannerOpen ? 'bg-white text-primary rotate-45' : 'bg-[#00FF66] text-black'}`}
              >
                {isScannerOpen ? <X size={32} strokeWidth={2.5} /> : <Camera size={32} strokeWidth={2.5} />}
              </button>
            </div>

            <button 
              onClick={() => { setScreen("chat"); setIsScannerOpen(false); }}
              className={`flex flex-col items-center space-y-1 transition-all ${screen === 'chat' ? 'text-primary scale-110' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <MessageSquare size={22} strokeWidth={screen === 'chat' ? 2.5 : 2} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Chat</span>
            </button>

            <button 
              onClick={() => { setScreen("history"); setIsScannerOpen(false); }}
              className={`flex flex-col items-center space-y-1 transition-all ${screen === 'history' ? 'text-primary scale-110' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <History size={22} strokeWidth={screen === 'history' ? 2.5 : 2} />
              <span className="text-[9px] font-bold uppercase tracking-widest">History</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
