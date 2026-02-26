"use client";

import { getToken, isLoggedIn, logout } from "@/lib/auth";
import { jwtDecode } from "jwt-decode";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";

interface UserToken {
  username: string;
  user_id: number;
  role: string;
  exp: number;
}

export default function Navbar() {
  const [isAuth, setIsAuth] = useState(false);
  const [username, setUsername] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      if (isLoggedIn()) {
        setIsAuth(true);
        const token = getToken();
        if (token) {
          try {
            const decoded = jwtDecode<UserToken>(token);
            setUsername(decoded.username);
          } catch (error) {
            console.error("Failed to decode token", error);
          }
        }
      } else {
        setIsAuth(false);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Artikel", href: "/blog" },
    { name: "Alur Belajar", href: "/quiz" },
    { name: "Asset 3D", href: "/assets" },
    { name: "Komunitas", href: "/community" },
    { name: "Berlangganan", href: "/pricing" },
  ];

  return (
    <nav className={`border-b border-border sticky top-0 ${isMenuOpen ? 'bg-background' : 'bg-background/80 backdrop-blur-md'} z-50`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
            A
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">
            AIOT<span className="text-blue-600 font-light italic">Chain</span>
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="hover:text-blue-600 transition">
              {link.name}
            </Link>
          ))}

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-xl bg-muted hover:bg-accent text-muted-foreground hover:text-foreground transition group"
            aria-label="Toggle theme"
          >
            {mounted && (theme === "dark" ? (
              <Sun className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            ) : (
              <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
            ))}
          </button>
          
          {isAuth ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 bg-muted hover:bg-accent px-4 py-2.5 rounded-full transition"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="text-foreground font-medium">{username}</span>
                <svg className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowDropdown(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-56 bg-card rounded-2xl shadow-xl border border-border py-2 z-20">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-3 hover:bg-accent transition text-foreground"
                      onClick={() => setShowDropdown(false)}
                    >
                      <svg className="w-5 h-5 mr-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile Saya
                    </Link>
                    <hr className="my-2 border-border" />
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        logout();
                      }}
                      className="w-full flex items-center px-4 py-3 hover:bg-red-500/10 transition text-red-600"
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link 
              href="/login" 
              className="bg-foreground text-background px-5 py-2.5 rounded-full hover:bg-foreground/90 transition shadow-md"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center space-x-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg bg-muted text-muted-foreground"
            aria-label="Toggle theme"
          >
            {mounted && (theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-20 bg-background z-40 transition-all duration-300">
          <div className="flex flex-col p-6 space-y-6">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-lg font-medium text-foreground hover:text-blue-600 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <hr className="border-border" />

            {isAuth ? (
              <div className="flex flex-col space-y-4">
                <Link
                  href="/profile"
                  className="flex items-center text-lg font-medium text-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  {username}
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center text-lg font-medium text-red-600"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="w-full bg-blue-600 text-white text-center py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
