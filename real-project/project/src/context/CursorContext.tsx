import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CursorContextType {
  cursorSize: number;
  cursorColor: string;
  cursorOpacity: number;
  cursorBlur: string;
  cursorDisabled: boolean;
  setCursorSize: (size: number) => void;
  setCursorColor: (color: string) => void;
  setCursorOpacity: (opacity: number) => void;
  setCursorBlur: (blur: string) => void;
  setCursorDisabled: (disabled: boolean) => void;
  resetCursor: () => void;
}

const defaultCursorSettings = {
  cursorSize: 80,
  cursorColor: 'rgba(139, 92, 246, 0.1)', // Default purple color
  cursorOpacity: 0.5,
  cursorBlur: 'xl',
  cursorDisabled: false,
};

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export const useCursor = (): CursorContextType => {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error('useCursor must be used within a CursorProvider');
  }
  return context;
};

interface CursorProviderProps {
  children: ReactNode;
}

export const CursorProvider: React.FC<CursorProviderProps> = ({ children }) => {
  const [cursorSize, setCursorSize] = useState(defaultCursorSettings.cursorSize);
  const [cursorColor, setCursorColor] = useState(defaultCursorSettings.cursorColor);
  const [cursorOpacity, setCursorOpacity] = useState(defaultCursorSettings.cursorOpacity);
  const [cursorBlur, setCursorBlur] = useState(defaultCursorSettings.cursorBlur);
  const [cursorDisabled, setCursorDisabled] = useState(defaultCursorSettings.cursorDisabled);

  const resetCursor = () => {
    setCursorSize(defaultCursorSettings.cursorSize);
    setCursorColor(defaultCursorSettings.cursorColor);
    setCursorOpacity(defaultCursorSettings.cursorOpacity);
    setCursorBlur(defaultCursorSettings.cursorBlur);
    setCursorDisabled(defaultCursorSettings.cursorDisabled);
  };

  const value = {
    cursorSize,
    cursorColor,
    cursorOpacity,
    cursorBlur,
    cursorDisabled,
    setCursorSize,
    setCursorColor,
    setCursorOpacity,
    setCursorBlur,
    setCursorDisabled,
    resetCursor,
  };

  return <CursorContext.Provider value={value}>{children}</CursorContext.Provider>;
};
