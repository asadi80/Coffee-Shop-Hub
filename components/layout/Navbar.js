"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { performLogout } from '@/lib/logout';


export default function Navbar({ session }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

const handleSignOut = async () => {
  setIsSigningOut(true);
  await performLogout();
  setIsSigningOut(false);
};

  return (
    <nav className="bg-white border-b border-cream-dark sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-serif text-2xl font-bold text-coffee-dark hover:scale-105 transition-transform"
          >
            <span className="text-3xl">☕</span>
            <span className="hidden sm:inline">Coffee Shop Hub</span>
            <span className="sm:hidden">CSH</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg text-coffee-medium font-medium hover:bg-cream hover:text-accent-orange transition-all"
            >
              Discover
            </Link>
            {session ? (
              <>
                {/* Show Dashboard only if user is NOT admin */}
                {session.user.role !== "admin" && (
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 rounded-lg text-coffee-medium font-medium hover:bg-cream hover:text-accent-orange transition-all"
                  >
                    Dashboard
                  </Link>
                )}

                <button
                  onClick={handleSignOut}
                  className={`px-4 py-2 rounded-lg text-coffee-medium font-medium hover:bg-cream hover:text-accent-orange transition-all ${
                    isSigningOut ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSigningOut ? "Signing out..." : "Sign Out"}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-coffee-medium font-medium hover:bg-cream hover:text-accent-orange transition-all"
                >
                  Login
                </Link>
                <Link href="/signup" className="btn-primary text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-coffee-dark hover:bg-cream transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-cream-dark space-y-2">
            <Link
              href="/"
              className="block px-4 py-3 rounded-lg text-coffee-medium font-medium hover:bg-cream hover:text-accent-orange transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              Discover
            </Link>

            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-4 py-3 rounded-lg text-coffee-medium font-medium hover:bg-cream hover:text-accent-orange transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg text-coffee-medium font-medium hover:bg-cream hover:text-accent-orange transition-all"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-3 rounded-lg text-coffee-medium font-medium hover:bg-cream hover:text-accent-orange transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block px-4 py-3 rounded-lg bg-coffee-dark text-white font-semibold text-center hover:bg-coffee-medium transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
