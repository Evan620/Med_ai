import { Button } from "@/components/ui/button";
import { Stethoscope, BookOpen, Brain, FileText, Video, Users, Star, ArrowRight, Check, Zap, Shield, Cpu, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export const LandingPage = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "Neural AI Analysis",
      description: "Advanced quantum-enhanced AI provides instant medical insights with 99.7% accuracy from our digital Dr. Sarah Mitchell.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Cpu className="h-8 w-8" />,
      title: "Quantum Note Processing",
      description: "Next-gen note creation with real-time AI enhancement, predictive text, and intelligent medical formatting.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Instant PDF Synthesis",
      description: "Lightning-fast document analysis using advanced neural networks for immediate knowledge extraction.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Holographic Video Analysis",
      description: "Revolutionary video processing technology that transforms educational content into interactive knowledge.",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Medical Student, Johns Hopkins",
      content: "MedNote AI has revolutionized how I study. The AI insights help me understand complex concepts faster.",
      rating: 5
    },
    {
      name: "Dr. Michael Rodriguez",
      role: "Resident, Mayo Clinic",
      content: "The PDF analysis feature saves me hours of reading time. Perfect for staying updated with research.",
      rating: 5
    },
    {
      name: "Emily Watson",
      role: "Pre-Med Student, Harvard",
      content: "The note-taking interface is intuitive and the AI suggestions are incredibly helpful for exam prep.",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Student",
      price: "Free",
      description: "Perfect for medical students getting started",
      features: [
        "5 AI queries per day",
        "Basic note taking",
        "PDF upload (up to 10MB)",
        "YouTube video analysis (2 per day)"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$19/month",
      description: "For residents and practicing physicians",
      features: [
        "Unlimited AI queries",
        "Advanced note organization",
        "Unlimited PDF uploads",
        "Unlimited YouTube analysis",
        "Priority support",
        "Export to multiple formats"
      ],
      popular: true
    },
    {
      name: "Institution",
      price: "Contact us",
      description: "For medical schools and hospitals",
      features: [
        "Everything in Professional",
        "Team collaboration",
        "Admin dashboard",
        "Custom integrations",
        "Dedicated support",
        "Volume discounts"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(120,119,198,0.1)_60deg,transparent_120deg)]"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Mouse Follower Effect */}
      <div
        className="fixed w-96 h-96 pointer-events-none z-0 opacity-20"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          transition: 'all 0.1s ease-out'
        }}
      />

      {/* Header */}
      <header className="relative z-50 bg-black/50 backdrop-blur-xl border-b border-cyan-500/20 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Stethoscope className="h-8 w-8 text-cyan-400" />
                <div className="absolute inset-0 h-8 w-8 text-cyan-400 animate-pulse opacity-50">
                  <Stethoscope className="h-8 w-8" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                MedNote AI
              </span>
              <div className="hidden sm:block text-xs text-cyan-400/60 font-mono">v2.0</div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/auth')}
                className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300"
              >
                <Shield className="w-4 h-4 mr-2" />
                Access Portal
              </Button>
              <Button
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300"
              >
                <Zap className="w-4 h-4 mr-2" />
                Initialize System
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className={`max-w-7xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Glowing Orb */}
          <div className="relative mb-12">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            <div className="relative">
              <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                  NEURAL
                </span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                  MEDICINE
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  AI
                </span>
              </h1>
            </div>
          </div>

          <div className="relative mb-12">
            <p className="text-xl md:text-2xl text-cyan-100/80 mb-4 max-w-4xl mx-auto leading-relaxed">
              Experience the future of medical education with quantum-enhanced AI analysis,
              neural note processing, and holographic learning interfaces.
            </p>
            <p className="text-lg text-cyan-400/60 font-mono max-w-2xl mx-auto">
              &gt; Powered by Orion 2.0 Neural Architecture
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="group relative bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold text-lg px-12 py-4 rounded-full shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 transform hover:scale-105"
            >
              <Zap className="mr-3 h-6 w-6 group-hover:animate-spin" />
              INITIALIZE NEURAL LINK
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/auth')}
              className="group border-2 border-cyan-400/50 text-cyan-400 hover:text-black hover:bg-cyan-400 text-lg px-12 py-4 rounded-full backdrop-blur-sm transition-all duration-300 transform hover:scale-105"
            >
              <Sparkles className="mr-3 h-6 w-6 group-hover:animate-pulse" />
              PREVIEW SYSTEM
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 backdrop-blur-sm">
              <div className="text-3xl font-bold text-cyan-400 mb-2">99.7%</div>
              <div className="text-cyan-100/60">AI Accuracy Rate</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-sm">
              <div className="text-3xl font-bold text-purple-400 mb-2">10,000+</div>
              <div className="text-purple-100/60">Neural Connections</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 backdrop-blur-sm">
              <div className="text-3xl font-bold text-green-400 mb-2">0.3s</div>
              <div className="text-green-100/60">Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                QUANTUM CAPABILITIES
              </span>
            </h2>
            <p className="text-xl text-cyan-100/60 font-mono">
              &gt; Advanced neural systems for next-generation medical education
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-3xl bg-black/40 backdrop-blur-xl border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {/* Glow Effect */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl`}></div>

                {/* Icon Container */}
                <div className="relative mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} p-4 mx-auto group-hover:animate-pulse`}>
                    <div className="text-black">
                      {feature.icon}
                    </div>
                  </div>
                  <div className={`absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-20 blur-lg mx-auto group-hover:opacity-40 transition-opacity duration-500`}></div>
                </div>

                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-cyan-100/70 leading-relaxed group-hover:text-cyan-100/90 transition-colors duration-300">
                  {feature.description}
                </p>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-cyan-400/30 transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-blue-900/10"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                NEURAL TESTIMONIALS
              </span>
            </h2>
            <p className="text-xl text-purple-100/60 font-mono">
              &gt; Verified feedback from enhanced medical professionals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-3xl bg-black/40 backdrop-blur-xl border border-purple-500/20 hover:border-purple-400/40 transition-all duration-500 transform hover:scale-105"
              >
                {/* Holographic Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Rating Stars */}
                <div className="flex mb-6 justify-center">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>

                {/* Quote */}
                <div className="relative mb-6">
                  <div className="text-6xl text-purple-400/20 font-serif absolute -top-4 -left-2">"</div>
                  <p className="text-cyan-100/80 italic leading-relaxed relative z-10 font-light">
                    {testimonial.content}
                  </p>
                  <div className="text-6xl text-purple-400/20 font-serif absolute -bottom-8 -right-2">"</div>
                </div>

                {/* Profile */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-6 w-6 text-black" />
                  </div>
                  <p className="font-bold text-white text-center group-hover:text-purple-300 transition-colors duration-300">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-purple-200/60 text-center font-mono">
                    {testimonial.role}
                  </p>
                </div>

                {/* Scan Lines Effect */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none">
                  <div className="h-full w-full bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/5 via-cyan-900/10 to-blue-900/5"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                NEURAL PACKAGES
              </span>
            </h2>
            <p className="text-xl text-green-100/60 font-mono">
              &gt; Select your enhancement level
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`group relative p-8 rounded-3xl backdrop-blur-xl border-2 transition-all duration-500 transform hover:scale-105 ${
                  plan.popular
                    ? 'border-cyan-400/60 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 shadow-2xl shadow-cyan-500/20'
                    : 'border-cyan-500/20 bg-black/40 hover:border-cyan-400/40'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-black px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      <Zap className="inline w-4 h-4 mr-1" />
                      OPTIMAL CHOICE
                    </div>
                  </div>
                )}

                {/* Holographic Border */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${plan.popular ? 'from-cyan-500/20 to-blue-500/20' : 'from-cyan-500/5 to-blue-500/5'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                <div className="relative">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors duration-300">
                      {plan.name}
                    </h3>
                    <div className="text-5xl font-black text-cyan-400 mb-4 group-hover:animate-pulse">
                      {plan.price}
                    </div>
                    <p className="text-cyan-100/60 font-mono text-sm">
                      {plan.description}
                    </p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                          <Check className="h-3 w-3 text-black" />
                        </div>
                        <span className="text-cyan-100/80 group-hover:text-cyan-100 transition-colors duration-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40'
                        : 'border-2 border-cyan-400/50 text-cyan-400 hover:text-black hover:bg-cyan-400 bg-transparent'
                    }`}
                    onClick={() => navigate('/auth')}
                  >
                    {plan.price === "Contact us" ? (
                      <>
                        <Shield className="mr-2 h-5 w-5" />
                        CONTACT NEURAL COMMAND
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        ACTIVATE PROTOCOL
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-cyan-900/20 to-blue-900/20"></div>
        <div className="max-w-6xl mx-auto text-center relative">
          {/* Central Glow */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl"></div>

          <div className="relative">
            <h2 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                INITIATE
              </span>
              <br />
              <span className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                NEURAL EVOLUTION
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-cyan-100/70 mb-4 max-w-4xl mx-auto leading-relaxed">
              Join the next generation of enhanced medical professionals.
              Transcend traditional learning with quantum-powered AI assistance.
            </p>

            <p className="text-lg text-cyan-400/60 font-mono mb-12">
              &gt; 10,000+ neural connections established and growing
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                onClick={() => navigate('/auth')}
                className="group relative bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 text-black font-black text-xl px-16 py-6 rounded-full shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-500 transform hover:scale-110"
              >
                <div className="flex items-center">
                  <Zap className="mr-4 h-8 w-8 group-hover:animate-spin" />
                  ACTIVATE NEURAL LINK
                  <ArrowRight className="ml-4 h-8 w-8 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
                <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </div>

            {/* Pulse Animation */}
            <div className="mt-16 flex justify-center">
              <div className="relative">
                <div className="w-4 h-4 bg-cyan-400 rounded-full animate-ping"></div>
                <div className="absolute inset-0 w-4 h-4 bg-cyan-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-black/80 backdrop-blur-xl border-t border-cyan-500/20">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <Stethoscope className="h-8 w-8 text-cyan-400" />
                  <div className="absolute inset-0 h-8 w-8 text-cyan-400 animate-pulse opacity-50">
                    <Stethoscope className="h-8 w-8" />
                  </div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  MedNote AI
                </span>
                <div className="text-xs text-cyan-400/60 font-mono">v2.0</div>
              </div>
              <p className="text-cyan-100/60 mb-6 leading-relaxed">
                Quantum-enhanced medical education platform. Empowering the next generation
                of healthcare professionals with neural AI technology.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-black" />
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-black" />
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-black" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-cyan-400 mb-6 text-lg">NEURAL MODULES</h3>
              <ul className="space-y-3 text-cyan-100/60 font-mono text-sm">
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">&gt; Quantum Features</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">&gt; Neural Packages</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">&gt; System Demo</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-cyan-400 mb-6 text-lg">SUPPORT MATRIX</h3>
              <ul className="space-y-3 text-cyan-100/60 font-mono text-sm">
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">&gt; Neural Command</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">&gt; Contact Protocol</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">&gt; Privacy Matrix</a></li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-12 pt-8 border-t border-cyan-500/20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-6 text-xs text-cyan-400/60 font-mono">
                <span>© 2025 MedNote AI</span>
                <span className="hidden md:block">•</span>
                <span>by L&F Software LLC</span>
                <span className="hidden md:block">•</span>
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">
                  Powered by Orion 2.0
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-cyan-400/40 font-mono">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>NEURAL SYSTEMS ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
