/**
 * App Provider
 * Combines all context providers in the correct order
 */

import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { LearningProvider } from './LearningContext';
import { ToastProvider } from './ToastContext';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <ToastProvider>
      <AuthProvider>
        <LearningProvider>
          {children}
        </LearningProvider>
      </AuthProvider>
    </ToastProvider>
  );
};
