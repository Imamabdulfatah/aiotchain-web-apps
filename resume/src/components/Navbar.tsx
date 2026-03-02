"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Website Utama", href: "https://aiotchain.id" },
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
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center space-x-4">
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
          </div>
        </div>
      )}
    </nav>
  );
}
