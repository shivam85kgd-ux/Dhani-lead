import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface AppSettings {
  helplineNumber: string;
  showHelpline: boolean;
  updatedAt?: any;
}

export const DEFAULT_SETTINGS: AppSettings = {
  helplineNumber: '1800-200-8888',
  showHelpline: true,
};

const LOCAL_STORAGE_KEY = 'dfl_app_settings';

/**
 * Get initial cached settings from localStorage for instant rendering
 */
export function getCachedSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    // fallback to defaults
  }
  return DEFAULT_SETTINGS;
}

/**
 * Subscribe to real-time settings from Firestore
 */
export function subscribeToSettings(onUpdate: (settings: AppSettings) => void): () => void {
  const docRef = doc(db, 'settings', 'general');

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const updated: AppSettings = {
          helplineNumber: data.helplineNumber !== undefined ? String(data.helplineNumber) : DEFAULT_SETTINGS.helplineNumber,
          showHelpline: data.showHelpline !== undefined ? Boolean(data.showHelpline) : DEFAULT_SETTINGS.showHelpline,
          updatedAt: data.updatedAt,
        };
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {}
        onUpdate(updated);
      } else {
        // If not created yet in Firestore, initialize with defaults
        onUpdate(getCachedSettings());
      }
    },
    (err) => {
      console.warn('Settings subscription fallback to cache:', err);
      onUpdate(getCachedSettings());
    }
  );

  return unsubscribe;
}

/**
 * Save settings to Cloud Firestore and update local cache
 */
export async function saveSettingsToFirebase(settings: Partial<AppSettings>): Promise<void> {
  const docRef = doc(db, 'settings', 'general');

  const current = getCachedSettings();
  const payload: AppSettings = {
    helplineNumber: settings.helplineNumber !== undefined ? settings.helplineNumber.trim() : current.helplineNumber,
    showHelpline: settings.showHelpline !== undefined ? settings.showHelpline : current.showHelpline,
    updatedAt: serverTimestamp(),
  };

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {}

  await setDoc(docRef, payload, { merge: true });
}
