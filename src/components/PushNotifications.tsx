'use client';

import { useEffect, useState } from 'react';
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from '@/app/actions';

export function PushNotificationManager() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    // Check if browser supports service workers and push notifications
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkExistingSubscription();
    }
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setSubscription(existingSubscription as any);
      }
    } catch (error) {
      console.error('[PWA] Error checking subscription:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!isSupported) return;

    setIsSubscribing(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        throw new Error('VAPID public key not configured');
      }

      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      });

      // Save subscription to server
      const result = await subscribeToPushNotifications(newSubscription as any);

      if (result.success) {
        setSubscription(newSubscription as any);
        console.log('[PWA] Successfully subscribed to push notifications');
      }
    } catch (error) {
      console.error('[PWA] Failed to subscribe:', error);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!subscription) return;

    setIsSubscribing(true);
    try {
      await subscription.unsubscribe();

      // Remove subscription from server
      await unsubscribeFromPushNotifications(subscription.endpoint);

      setSubscription(null);
      console.log('[PWA] Successfully unsubscribed from push notifications');
    } catch (error) {
      console.error('[PWA] Failed to unsubscribe:', error);
    } finally {
      setIsSubscribing(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {subscription ? (
        <button
          onClick={handleUnsubscribe}
          disabled={isSubscribing}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          aria-label="Disable notifications"
        >
          {isSubscribing ? 'Disabling...' : 'Disable Notifications'}
        </button>
      ) : (
        <button
          onClick={handleSubscribe}
          disabled={isSubscribing}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          aria-label="Enable notifications"
        >
          {isSubscribing ? 'Enabling...' : 'Enable Notifications'}
        </button>
      )}
    </div>
  );
}

interface PushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    auth: string;
    p256dh: string;
  };
  unsubscribe: () => Promise<boolean>;
}

export function InstallPromptIOS() {
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  useEffect(() => {
    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if app is already installed (iOS only)
    if (isIOSDevice) {
      const isInStandaloneMode = (window.navigator as any).standalone === true;
      setIsInstalled(isInStandaloneMode);
    }
  }, []);

  if (!isIOS || isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="relative overflow-hidden bg-background/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl p-5 pb-6">
        
        <button
          onClick={() => setShowPrompt(false)}
          className="absolute top-3 right-3 p-1 rounded-full text-muted-foreground/70 hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        <div className="flex flex-col gap-4">
          <div className="flex gap-4 items-center">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
               {/* Share Icon */}
               <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" x2="12" y1="2" y2="15" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground leading-none mb-1">Install for iOS</h3>
              <p className="text-xs text-muted-foreground">Follow instructions to install</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-2 text-sm bg-secondary/50 rounded-lg p-3">
             <div className="flex items-center gap-2">
                <span className="text-muted-foreground">1. Tap</span>
                <span className="inline-flex items-center justify-center p-1 bg-background rounded border border-border">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-500"
                  >
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" x2="12" y1="2" y2="15" />
                  </svg>
                </span>
             </div>
             <span className="text-muted-foreground">→</span>
             <div className="flex items-center gap-2">
                <span className="text-muted-foreground">2. Select</span>
                <span className="font-medium text-foreground whitespace-nowrap">"Add to Home Screen"</span>
                <span className="inline-flex items-center justify-center p-1 bg-background rounded border border-border">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M12 8v8" />
                    <path d="M8 12h8" />
                  </svg>
                </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
