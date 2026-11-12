import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, testConnection } from './firebase/config';
import { initMetaPixel, trackPageView } from './utils/metaPixel';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { Footer } from './components/Footer';
import { ThankYouPage } from './components/ThankYouPage';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { LegalModal } from './components/LegalModals';
import { CustomerReviews } from './components/CustomerReviews';
import { getCachedSettings, subscribeToSettings, AppSettings } from './services/settingsService';

type Route = 'home' | 'thank-you' | 'admin';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [appSettings, setAppSettings] = useState<AppSettings>(() => getCachedSettings());
  const [isPasscodeAuthenticated, setIsPasscodeAuthenticated] = useState<boolean>(() => {
    return typeof window !== 'undefined' && Boolean(sessionStorage.getItem('dfl_admin_auth_token'));
  });

  // Application Details state for Thank You page
  const [submittedDetails, setSubmittedDetails] = useState<{
    applicationId: string;
    fullName: string;
    mobile: string;
    email: string;
    state: string;
    loanPurpose: string;
    loanAmount: string;
  } | null>(null);

  // Legal modal state
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);

  // Sync route with URL / Hash
  const syncRouteFromLocation = () => {
    const path = window.location.pathname;
    const hash = window.location.hash;

    if (path.includes('/thank-you') || hash === '#thank-you') {
      setCurrentRoute('thank-you');
    } else if (path.includes('/admin') || hash === '#admin') {
      setCurrentRoute('admin');
    } else {
      setCurrentRoute('home');
    }
  };

  const navigateTo = (route: Route) => {
    setCurrentRoute(route);
    let targetPath = '/';
    let targetHash = '';

    if (route === 'thank-you') {
      targetPath = '/thank-you';
      targetHash = '#thank-you';
    } else if (route === 'admin') {
      targetPath = '/admin';
      targetHash = '#admin';
    }

    try {
      window.history.pushState({}, '', targetPath);
    } catch (e) {
      // Fallback for strict iframe sandbox
      window.location.hash = targetHash;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    // 1. Initialize Meta Pixel & track initial PageView
    initMetaPixel();
    trackPageView(window.location.pathname);

    // 2. Test Firestore connection per Firebase skill guidelines
    testConnection();

    // 3. Initial route evaluation
    syncRouteFromLocation();

    // 4. Popstate / hashchange listeners
    const handlePopState = () => syncRouteFromLocation();
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    // 5. Firebase Auth state listener
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setAdminUser(user);
      setAuthLoading(false);
    });

    // 6. Real-time settings listener (helpline number & visibility)
    const unsubscribeSettings = subscribeToSettings((settings) => {
      setAppSettings(settings);
    });

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
      unsubscribeAuth();
      unsubscribeSettings();
    };
  }, []);

  // Form Submission Success Callback
  const handleFormSuccess = (details: {
    applicationId: string;
    fullName: string;
    mobile: string;
    email: string;
    state: string;
    loanPurpose: string;
    loanAmount: string;
  }) => {
    setSubmittedDetails(details);
    navigateTo('thank-you');
  };

  // Scroll to application form helper
  const scrollToForm = () => {
    if (currentRoute !== 'home') {
      navigateTo('home');
    }
    setTimeout(() => {
      const formEl = document.getElementById('application-form');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Render Thank You View
  if (currentRoute === 'thank-you') {
    return (
      <div className="font-sans antialiased text-slate-800 bg-white min-h-screen">
        <Header
          onAdminClick={() => navigateTo('admin')}
          onApplyClick={() => navigateTo('home')}
          appSettings={appSettings}
        />
        <ThankYouPage
          details={submittedDetails}
          onReturnHome={() => navigateTo('home')}
          appSettings={appSettings}
        />
        <Footer
          onOpenPrivacy={() => setLegalModalType('privacy')}
          onOpenTerms={() => setLegalModalType('terms')}
          onAdminClick={() => navigateTo('admin')}
          appSettings={appSettings}
        />
        <LegalModal
          isOpen={legalModalType !== null}
          onClose={() => setLegalModalType(null)}
          type={legalModalType || 'privacy'}
        />
      </div>
    );
  }

  // Render Admin View
  if (currentRoute === 'admin') {
    if (!isPasscodeAuthenticated && !adminUser) {
      return (
        <AdminLogin
          onBackToHome={() => navigateTo('home')}
          onLoginSuccess={() => setIsPasscodeAuthenticated(true)}
        />
      );
    }

    return (
      <>
        <AdminDashboard
          onReturnHome={() => {
            setIsPasscodeAuthenticated(false);
            navigateTo('home');
          }}
        />
        <LegalModal
          isOpen={legalModalType !== null}
          onClose={() => setLegalModalType(null)}
          type={legalModalType || 'privacy'}
        />
      </>
    );
  }

  // Render Main Landing Page View
  return (
    <div className="font-sans antialiased text-slate-800 bg-white min-h-screen flex flex-col">
      <Header
        onAdminClick={() => navigateTo('admin')}
        onApplyClick={() => scrollToForm()}
        appSettings={appSettings}
      />

      <main className="flex-1">
        {/* Customer Application Form Prominently at Top */}
        <HeroSection
          onFormSuccess={handleFormSuccess}
          onOpenPrivacy={() => setLegalModalType('privacy')}
          onOpenTerms={() => setLegalModalType('terms')}
        />

        {/* 10 Verified Indian Customer Reviews & Testimonials */}
        <CustomerReviews />
      </main>

      <Footer
        onOpenPrivacy={() => setLegalModalType('privacy')}
        onOpenTerms={() => setLegalModalType('terms')}
        onAdminClick={() => navigateTo('admin')}
        appSettings={appSettings}
      />

      {/* Legal Modals */}
      <LegalModal
        isOpen={legalModalType !== null}
        onClose={() => setLegalModalType(null)}
        type={legalModalType || 'privacy'}
      />
    </div>
  );
}
