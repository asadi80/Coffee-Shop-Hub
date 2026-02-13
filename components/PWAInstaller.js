'use client';

import { useEffect, useState } from 'react';

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

useEffect(() => {
  // Clear old service workers in development
  if (process.env.NODE_ENV === 'development' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((reg) => reg.unregister());
      console.log('Old service workers unregistered');
    });
  }

  // Register service worker in production only
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  }

  // Listen for beforeinstallprompt event
  const handleBeforeInstallPrompt = (e) => {
    e.preventDefault();
    setDeferredPrompt(e);
    setShowInstallPrompt(true);
  };

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

  return () => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  };
}, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-slide-up">
      <div className="bg-white rounded-xl shadow-2xl p-6 border-2 border-coffee-dark">
        <div className="flex items-start gap-4">
          <div className="text-4xl">☕</div>
          <div className="flex-1">
            <h3 className="font-serif font-bold text-lg text-coffee-dark mb-1">
              Install Coffee Shop Hub
            </h3>
            <p className="text-sm text-coffee-medium mb-4">
              Install our app for quick access and offline support
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleInstallClick}
                className="btn-primary text-sm py-2 px-4"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="text-sm text-coffee-medium hover:text-coffee-dark font-medium"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-coffee-light hover:text-coffee-dark"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
