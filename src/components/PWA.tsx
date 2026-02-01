"use client";

import { useEffect, useState, useRef } from "react";
import { X, Smartphone, Download, Share } from "lucide-react";

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const deferredPromptRef = useRef<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPromptRef.current) {
      deferredPromptRef.current.prompt();
      const { outcome } = await deferredPromptRef.current.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      setShowPrompt(false);
      deferredPromptRef.current = null;
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="relative overflow-hidden bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-5">
        
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full text-muted-foreground/70 hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex gap-4">
          <div className="shrink-0">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
              <Download className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex-1 pt-0.5">
            <h3 className="font-bold text-base text-foreground leading-none mb-1.5">Install App</h3>
            <p className="text-sm text-muted-foreground leading-snug">
              Add MohallaMart to your home screen for the best experience.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={handleDismiss}
            className="flex-1 h-10 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            Not now
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}

export function PWAServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // Check for updates periodically
        const updateInterval = setInterval(() => {
          registration.update().catch((err) => {
            console.warn("[PWA] Failed to check for updates:", err);
          });
        }, 60000); // Every minute

        // Listen for new service worker activation
        let isRefreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (!isRefreshing) {
            isRefreshing = true;
            window.location.reload();
          }
        });

        return () => clearInterval(updateInterval);
      } catch (error) {
        console.error("[PWA] Service worker registration failed:", error);
      }
    };

    registerSW();
  }, []);

  return null;
}

export function RequestNotificationPermission() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const requestPermission = () => {
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().catch(console.error);
      }
    };

    // Request permission after user interaction (5 seconds)
    const timeout = setTimeout(requestPermission, 5000);

    return () => clearTimeout(timeout);
  }, []);

  return null;
}
