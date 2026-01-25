/**
 * Learning Context
 * Manages learning-related state (roadmap, progress, etc.)
 */

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Roadmap, ProgressOverview } from '../types';
import { useAuth } from './AuthContext';

interface LearningContextType {
  currentRoadmap: Roadmap | null;
  setCurrentRoadmap: (roadmap: Roadmap | null) => void;
  progressOverview: ProgressOverview | null;
  setProgressOverview: (progress: ProgressOverview | null) => void;
  isLoadingRoadmap: boolean;
  setIsLoadingRoadmap: (loading: boolean) => void;
  isLoadingProgress: boolean;
  setIsLoadingProgress: (loading: boolean) => void;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

interface LearningProviderProps {
  children: ReactNode;
}

export const LearningProvider: React.FC<LearningProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [currentRoadmap, setCurrentRoadmap] = useState<Roadmap | null>(null);
  const [progressOverview, setProgressOverview] = useState<ProgressOverview | null>(null);
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  // Reset state when user changes
  useEffect(() => {
    setCurrentRoadmap(null);
    setProgressOverview(null);
  }, [user?.id]);

  const value: LearningContextType = {
    currentRoadmap,
    setCurrentRoadmap,
    progressOverview,
    setProgressOverview,
    isLoadingRoadmap,
    setIsLoadingRoadmap,
    isLoadingProgress,
    setIsLoadingProgress,
  };

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
};

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (context === undefined) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};
