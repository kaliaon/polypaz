import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/contexts';
import { ToastContainer } from './src/components';
import AppNavigator from './src/navigation/AppNavigator';
import storageService from './src/services/storage.service';

export default function App() {
  useEffect(() => {
    // Expose clearStorage function globally for debugging
    // @ts-ignore
    global.clearStorage = async () => {
      await storageService.clear();
      console.log('Storage cleared! Please reload the app.');
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppNavigator />
        <ToastContainer />
        <StatusBar style="auto" />
      </AppProvider>
    </SafeAreaProvider>
  );
}
