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

  if (!isIOS || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border/30 p-4 rounded-t-lg shadow-lg z-50">
      <p className="text-sm text-muted-foreground mb-3">
        To install MohallaMart on your home screen, tap the share button <span className="font-semibold">⎙</span> and then <span className="font-semibold">"Add to Home Screen"</span>
      </p>
      <div className="flex items-center gap-2 justify-center">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-4-4l-4-4m0 0l-4 4m4-4v12" />
        </svg>
        <span className="text-xs text-muted-foreground">Share</span>
        <span className="text-xs text-muted-foreground">→</span>
        <span className="text-xs text-muted-foreground">Add to Home Screen</span>
      </div>
    </div>
  );
}
