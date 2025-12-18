// components/dashboard/Header.tsx
"use client";
import { TrendingUp, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

interface UserData {
  name: string;
  email: string;
}

export default function Header() {
  const [user, setUser] = useState<UserData>({ name: "", email: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
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

  return (
    <header className="bg-white border-b border-emerald-100 fixed top-0 left-0 right-0 z-50 shadow-sm md:static">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile: Spacer on left to balance with icons on right */}
          <div className="md:hidden w-20"></div>

          {/* Mobile: Logo centered */}
          <Link 
            href="/" 
            className="md:hidden flex items-center space-x-3 no-underline absolute left-1/2 transform -translate-x-1/2"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center shadow">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-emerald-900">FinTrack</h1>
          </Link>

          {/* Desktop: Logo on left */}
          <Link href="/" className="hidden md:flex items-center space-x-3 group cursor-pointer no-underline">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-emerald-900">FinTrack</h1>
          </Link>

          {/* Mobile & Desktop: User & Logout on right */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {!loading && user?.name && (
              <>
                {/* Mobile: Just icons */}
                <div className="md:hidden flex items-center space-x-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-emerald-800" />
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Desktop: Full user info */}
                <div className="hidden md:flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  
                  <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-emerald-800" />
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}