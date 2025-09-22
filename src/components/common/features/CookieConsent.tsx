import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/forms/button';
import { Card, CardContent } from '../../ui/layout/card';
import { Checkbox } from '../../ui/forms/checkbox';
import { Cookie, X, Settings, Shield, BarChart3, Target, Zap } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export const CookieConsent: React.FC = () => {
  const [showConsent, setShowConsent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const consentGiven = localStorage.getItem('cookie_consent');
    if (!consentGiven) {
      setShowConsent(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    
    localStorage.setItem('cookie_consent', JSON.stringify(allAccepted));
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setShowConsent(false);
    
    // Initialize analytics and other services
    initializeServices(allAccepted);
  };

  const handleAcceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    
    localStorage.setItem('cookie_consent', JSON.stringify(necessaryOnly));
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setShowConsent(false);
    
    // Initialize only necessary services
    initializeServices(necessaryOnly);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie_consent', JSON.stringify(preferences));
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setShowConsent(false);
    setShowSettings(false);
    
    // Initialize services based on preferences
    initializeServices(preferences);
  };

  const initializeServices = (consent: CookiePreferences) => {
    console.log('Initializing services with consent:', consent);
    
    // Initialize analytics if consented
    if (consent.analytics) {
      // TODO: Initialize Google Analytics or other analytics
      console.log('Analytics initialized');
    }
    
    // Initialize marketing tools if consented
    if (consent.marketing) {
      // TODO: Initialize marketing tools
      console.log('Marketing tools initialized');
    }
    
    // Initialize functional cookies if consented
    if (consent.functional) {
      // TODO: Initialize functional services
      console.log('Functional services initialized');
    }
  };

  const handlePreferenceChange = (key: keyof CookiePreferences, checked: boolean) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t-2 border-gray-200 shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-4xl mx-auto">
        <Card className="border-0 shadow-none bg-white">
          <CardContent className="p-0">
            {!showSettings ? (
              // Main consent banner
              <div className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                      <Cookie className="h-7 w-7 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      We Value Your Privacy
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-base">
                      We use cookies to enhance your browsing experience, serve personalized content, 
                      and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowSettings(true)}
                    className="flex items-center gap-2 flex-1 sm:flex-none border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800"
                  >
                    <Settings className="h-4 w-4" />
                    Customize Settings
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleAcceptNecessary}
                    className="flex-1 sm:flex-none border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800"
                  >
                    Necessary Only
                  </Button>
                  <Button
                    onClick={handleAcceptAll}
                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 animate-pulse"
                  >
                    Accept All Cookies
                  </Button>
                </div>
              </div>
            ) : (
              // Settings panel
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Cookie Preferences</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(false)}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="space-y-4 mb-6">
                  {/* Necessary Cookies */}
                  <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex-shrink-0 mt-1">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Necessary Cookies</h4>
                        <Checkbox checked={true} disabled />
                      </div>
                      <p className="text-sm text-gray-600">
                        Essential for the website to function properly. These cookies cannot be disabled.
                      </p>
                    </div>
                  </div>
                  
                  {/* Analytics Cookies */}
                  <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Analytics Cookies</h4>
                        <Checkbox
                          checked={preferences.analytics}
                          onCheckedChange={(checked) => handlePreferenceChange('analytics', checked as boolean)}
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        Help us understand how visitors interact with our website to improve performance.
                      </p>
                    </div>
                  </div>
                  
                  {/* Marketing Cookies */}
                  <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      <Target className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Marketing Cookies</h4>
                        <Checkbox
                          checked={preferences.marketing}
                          onCheckedChange={(checked) => handlePreferenceChange('marketing', checked as boolean)}
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        Used to track visitors across websites for personalized advertising.
                      </p>
                    </div>
                  </div>
                  
                  {/* Functional Cookies */}
                  <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      <Zap className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Functional Cookies</h4>
                        <Checkbox
                          checked={preferences.functional}
                          onCheckedChange={(checked) => handlePreferenceChange('functional', checked as boolean)}
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        Enable enhanced functionality and personalization features.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setShowSettings(false)}
                    className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800 py-3"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSavePreferences}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
