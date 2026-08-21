import { createContext, useContext, useState, useCallback } from 'react';
import FullScreenLoader from '../components/FullScreenLoader';

const LoadingContext = createContext({
  isLoading: false,
  showLoading: () => {},
  hideLoading: () => {},
  withLoading: async () => {},
  setProgress: () => {}
});

export function LoadingProvider({ children }) {
  const [loadingState, setLoadingState] = useState({
    visible: false,
    title: 'Almost there!',
    subtitle: 'Setting everything up for you…',
    customProgress: null
  });

  const showLoading = useCallback((options = {}) => {
    setLoadingState({
      visible: true,
      title: options.title || 'Almost there!',
      subtitle: options.subtitle || 'Setting everything up for you…',
      customProgress: options.progress ?? null
    });
  }, []);

  const hideLoading = useCallback(() => {
    setLoadingState((prev) => ({
      ...prev,
      visible: false,
      customProgress: null
    }));
  }, []);

  const setProgress = useCallback((progress) => {
    setLoadingState((prev) => ({
      ...prev,
      customProgress: progress
    }));
  }, []);

  const withLoading = useCallback(async (asyncFn, options = {}) => {
    showLoading(options);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      // Short delay for visual smoothness before hiding
      setTimeout(() => {
        hideLoading();
      }, 350);
    }
  }, [showLoading, hideLoading]);

  return (
    <LoadingContext.Provider
      value={{
        isLoading: loadingState.visible,
        showLoading,
        hideLoading,
        withLoading,
        setProgress
      }}
    >
      {children}
      <FullScreenLoader
        visible={loadingState.visible}
        title={loadingState.title}
        subtitle={loadingState.subtitle}
        customProgress={loadingState.customProgress}
      />
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
