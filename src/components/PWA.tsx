"use client";

import { useEffect, useState, useRef } from "react";

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
    <div className="fixed bottom-4 left-4 right-4 bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-primary/20 p-5 z-50 md:bottom-6 md:left-6 md:right-auto md:max-w-md animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 text-primary-foreground"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-foreground leading-tight">Install MohallaMart</h3>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Add to home screen for faster access and a better shopping experience
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all flex items-center justify-center active:scale-95"
          aria-label="Dismiss install prompt"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex gap-3 mt-5">
        <button
          onClick={handleDismiss}
          className="flex-1 px-5 py-2.5 border-2 border-border/50 rounded-xl text-sm font-semibold text-foreground hover:bg-muted/70 hover:border-border transition-all active:scale-95"
        >
          Maybe Later
        </button>
        <button
          onClick={handleInstall}
          className="flex-1 px-5 py-2.5 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl hover:from-primary/90 hover:to-primary/80 transition-all active:scale-95"
        >
          Install Now
        </button>
      </div>
    </div>
  );
}

export function PWAServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      console.warn("[PWA] Service Worker not supported");
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        console.log("[PWA] Service worker registered successfully");

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
            console.log("[PWA] New service worker activated, reloading");
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
        Notification.requestPermission()
          .then((permission) => {
            console.log("[PWA] Notification permission:", permission);
          })
          .catch((err) => {
            console.error("[PWA] Notification request error:", err);
          });
      }
    };

    // Request permission after user interaction (5 seconds)
    const timeout = setTimeout(requestPermission, 5000);

    return () => clearTimeout(timeout);
  }, []);

  return null;
}

