"use client";
import {
  TrendingUp,
  Wallet,
  PieChart,
  Zap,
  
  ArrowRight,
  CheckCircle,
 
} from "lucide-react";
import { useState, useEffect } from "react";
import Header from "./components/dashboard/Header";

export default function HomePage() {
  const [, setScrollY] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [, setLoading] = useState(true);
  const [, setUser] = useState({ name: "", email: "" });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleGetStartedClick = (e:any) => {
    e.preventDefault();
    if (isLoggedIn) {
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/auth/register";
    }
  };

  return (
    <div className="min-h-screen bg-white">
    
      <Header/>

      {/* Hero Section */}
      <div className="bg-emerald-50 py-20 border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-5 py-2 rounded-full bg-emerald-100 text-emerald-700 font-medium text-sm mb-8 animate-fade-in-down border border-emerald-200">
              <Zap className="w-4 h-4 mr-2 text-amber-500" />
              Trusted by 10,000+ users worldwide
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight animate-fade-in-up">
              Smart Finance Tracking
              <span className="block text-emerald-600">Made Simple</span>
            </h1>
            <p
              className="text-xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              Take control of your finances with our intuitive platform. Track
              expenses, set budgets, save for goals, and gain valuable insights
              into your spending habits—all in one place.
            </p>
            <div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <a
                href="#"
                onClick={handleGetStartedClick}
                className="bg-emerald-800 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-900 transition-all duration-300 shadow-lg transform hover:-translate-y-1 hover:scale-105 flex items-center gap-2 group"
              >
                {isLoggedIn ? "Go to Dashboard" : "Start Tracking Now"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Key Features */}
        <div className="text-center mb-10 mt-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">
            Take Control of Your Finances
          </h2>
          <p
            className="text-xl text-gray-600 mb-6 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Simple tools to track, manage, and grow your money
          </p>
          <div className="inline-flex items-center px-5 py-2 rounded-full bg-emerald-100 text-emerald-700 font-medium text-sm mb-8 animate-fade-in-down border border-emerald-200">
            <TrendingUp className="w-5 h-5 mr-2" />
            <span>Powerful Features</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-32">
          {[
            {
              icon: TrendingUp,
              title: "Manual Tracking",
              desc: "Easily log and categorize your income and expenses manually.",
              delay: "0s",
              gradient: "from-teal-500 to-cyan-500",
              border: "border-teal-200",
              hover: "hover:border-teal-400",
            },
            {
              icon: PieChart,
              title: "Visual Reports",
              desc: "Beautiful charts and graphs to understand your spending patterns.",
              delay: "0.1s",
              gradient: "from-cyan-500 to-blue-500",
              border: "border-cyan-200",
              hover: "hover:border-cyan-400",
            },
            {
              icon: Wallet,
              title: "Budget Planning",
              desc: "Set monthly budgets and track your progress towards financial goals.",
              delay: "0.2s",
              gradient: "from-emerald-500 to-teal-500",
              border: "border-emerald-200",
              hover: "hover:border-emerald-400",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl p-8 border-2 ${feature.border} ${feature.hover} transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl animate-fade-in-up group`}
              style={{ animationDelay: feature.delay }}
            >
              <div
                className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}
              >
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* How It Works */}
       <div className="mb-32 mt-20">
  <div className="text-center mb-16">
    <h2 className="text-4xl font-bold text-gray-900 mb-4">
      How It Works
    </h2>
    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
      Manage and analyze your finances in a few simple steps
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {[
      {
        step: "1",
        title: "Create Accounts & Categories",
        description:
          "Set up your financial accounts like bank, cash, or wallet, and define custom categories for income and expenses.",
        gradient: "from-teal-600 to-cyan-600",
      },
      {
        step: "2",
        title: "Add Transactions",
        description:
          "Easily add income or expense transactions by selecting the account and category, along with amount and date.",
        gradient: "from-cyan-600 to-blue-600",
      },
      {
        step: "3",
        title: "Analyze Your Spending",
        description:
          "View all transactions on your dashboard and analyze your finances weekly, monthly, or yearly with clear insights.",
        gradient: "from-emerald-600 to-teal-600",
      },
    ].map((item, index) => (
      <div
        key={index}
        className="relative animate-fade-in-up"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-teal-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 hover:border-teal-300">
          <div
            className={`w-16 h-16 rounded-full bg-gradient-to-r ${item.gradient} flex items-center justify-center text-white text-2xl font-bold mb-6 transform hover:scale-125 hover:rotate-12 transition-all duration-300 shadow-lg`}
          >
            {item.step}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {item.title}
          </h3>
          <p className="text-gray-600">{item.description}</p>
        </div>

        {index < 2 && (
          <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-0.5 bg-gradient-to-r from-teal-300 to-cyan-400 animate-pulse"></div>
          </div>
        )}
      </div>
    ))}
  </div>
</div>


        {/* Testimonials - Keeping the original UI as requested */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Join thousands of satisfied users who transformed their finances
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Software Engineer",
                content:
                  "FinTrack helped me save 30% more in just three months. The budgeting tools are incredible!",
                rating: "★★★★★",
                gradient: "from-teal-500 to-cyan-500",
                borderColor: "border-teal-500",
              },
              {
                name: "Michael Rodriguez",
                role: "Small Business Owner",
                content:
                  "Finally found a finance tracker that actually understands small business needs. Game changer!",
                rating: "★★★★★",
                gradient: "from-cyan-500 to-blue-500",
                borderColor: "border-cyan-500",
              },
              {
                name: "Emily Thompson",
                role: "Graduate Student",
                content:
                  "As a student on a tight budget, this app has been a lifesaver. Simple and effective!",
                rating: "★★★★☆",
                gradient: "from-emerald-500 to-teal-500",
                borderColor: "border-emerald-500",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-8 shadow-xl border-l-8 ${testimonial.borderColor} hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 hover:scale-105 animate-fade-in-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center mb-6">
                  <div
                    className={`w-14 h-14 rounded-full bg-gradient-to-r ${testimonial.gradient} flex items-center justify-center text-white font-bold text-xl mr-4 transform hover:scale-110 hover:rotate-6 transition-transform duration-300 shadow-lg`}
                  >
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 italic text-base leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div
                  className={`bg-gradient-to-r ${testimonial.gradient} bg-clip-text text-transparent font-bold text-xl`}
                >
                  {testimonial.rating}
                </div>
              </div>
            ))}
          </div>
        </div>

        
      </main>

      {/* Final CTA */}
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-y border-emerald-200 py-16 mb-20">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to take control of your finances?
            </h2>

            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Join 10,000+ users who transformed their financial future with
              FinTrack
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGetStartedClick}
                className="bg-emerald-800 text-white px-12 py-4 rounded-xl font-bold text-lg hover:bg-emerald-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-3"
              >
                <span>
                  {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>

             
            </div>

            <div className="flex flex-wrap justify-center gap-8 mt-12">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-gray-700">Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-gray-700">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-gray-700">100% privacy focused</span>
              </div>
            </div>
          </div>
        </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-900 flex items-center justify-center transform hover:scale-110 transition-all duration-300">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">FinTrack</span>
              </div>
              <p className="text-gray-300 mb-6">
                Empowering individuals to achieve financial freedom through
                smart tracking and insights.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 cursor-pointer transform hover:scale-110 transition-all duration-300">
                  <span className="font-bold">f</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 cursor-pointer transform hover:scale-110 transition-all duration-300">
                  <span className="font-bold">X</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 cursor-pointer transform hover:scale-110 transition-all duration-300">
                  <span className="font-bold">in</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Product</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/features"
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="/pricing"
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="/updates"
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    Updates
                  </a>
                </li>
                <li>
                  <a
                    href="/api"
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Company</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/about"
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="/careers"
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="/press"
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    Press
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">
                Resources
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/blog"
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="/help"
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} FinTrack. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
          animation-fill-mode: both;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
}
