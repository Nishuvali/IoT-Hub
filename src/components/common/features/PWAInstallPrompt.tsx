import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { Button } from '../../ui/forms/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/layout/card';
import { Badge } from '../../ui/feedback/badge';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                     (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Check if already installed
    setIsInstalled(standalone);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt after a delay
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installation accepted');
        // Track installation
        trackInstallation('accepted');
      } else {
        console.log('PWA installation dismissed');
        trackInstallation('dismissed');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Error during PWA installation:', error);
    }
  };

  const trackInstallation = (outcome: 'accepted' | 'dismissed') => {
    // Track installation analytics
    const installData = {
      outcome,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: navigator.platform
    };

    const installs = JSON.parse(localStorage.getItem('pwa_installs') || '[]');
    installs.push(installData);
    localStorage.setItem('pwa_installs', JSON.stringify(installs.slice(-50))); // Keep last 50
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  // Don't show if already installed or dismissed this session
  if (isInstalled || sessionStorage.getItem('pwa_prompt_dismissed') || !showInstallPrompt) {
    return null;
  }

  // iOS-specific installation instructions
  if (isIOS && !isStandalone) {
    return (
      <Card className="fixed bottom-4 right-4 z-50 max-w-sm shadow-lg border-2 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-600" />
              Install IoT Hub
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Install IoT Hub on your iPhone for a better experience:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">1</Badge>
                <span>Tap the Share button</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">2</Badge>
                <span>Scroll down and tap "Add to Home Screen"</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">3</Badge>
                <span>Tap "Add" to install</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Standard PWA install prompt
  return (
    <Card className="fixed bottom-4 right-4 z-50 max-w-sm shadow-lg border-2 border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            Install IoT Hub
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Install IoT Hub as an app for quick access and offline browsing:
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Monitor className="h-4 w-4 text-green-600" />
              <span>Faster loading</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Smartphone className="h-4 w-4 text-green-600" />
              <span>Offline access</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Download className="h-4 w-4 text-green-600" />
              <span>Push notifications</span>
            </div>
          </div>
          <Button
            onClick={handleInstallClick}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Install App
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
