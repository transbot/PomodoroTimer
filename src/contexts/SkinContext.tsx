import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Skin {
  id: string;
  name: {
    en: string;
    zh: string;
  };
  description: {
    en: string;
    zh: string;
  };
}

export const skins: Skin[] = [
  {
    id: 'notion',
    name: { en: 'Light', zh: '浅色' },
    description: {
      en: 'Warm minimalist theme',
      zh: '温暖简约主题'
    }
  },
  {
    id: 'lamborghini',
    name: { en: 'Dark', zh: '深色' },
    description: {
      en: 'Dark luxury theme',
      zh: '黑金奢华主题'
    }
  }
];

interface SkinContextType {
  currentSkin: Skin;
  setSkin: (skinId: string) => void;
}

const SkinContext = createContext<SkinContextType | undefined>(undefined);

export function SkinProvider({ children }: { children: React.ReactNode }) {
  const [currentSkin, setCurrentSkin] = useState<Skin>(() => {
    // Load saved skin from localStorage
    const savedSkinId = localStorage.getItem('tomatoclock-skin');
    const skin = skins.find(s => s.id === savedSkinId);
    return skin || skins[0]; // Default to Notion
  });

  useEffect(() => {
    // Apply skin class to document
    const root = document.documentElement;
    // Remove all skin classes
    skins.forEach(s => root.classList.remove(`skin-${s.id}`));
    // Add current skin class
    root.classList.add(`skin-${currentSkin.id}`);
    // Save to localStorage
    localStorage.setItem('tomatoclock-skin', currentSkin.id);
  }, [currentSkin]);

  const setSkin = (skinId: string) => {
    const skin = skins.find(s => s.id === skinId);
    if (skin) {
      setCurrentSkin(skin);
    }
  };

  return (
    <SkinContext.Provider value={{ currentSkin, setSkin }}>
      {children}
    </SkinContext.Provider>
  );
}

export function useSkin() {
  const context = useContext(SkinContext);
  if (context === undefined) {
    throw new Error('useSkin must be used within a SkinProvider');
  }
  return context;
}
