import * as LocalAuthentication from 'expo-local-authentication';

export function useBiometrics() {
  const requestAuthentication = async (promptMessage = 'Unlock Kaseri 🔒'): Promise<boolean> => {
    try {
      // 1. Έλεγχος αν η συσκευή υποστηρίζει βιομετρικά στοιχεία
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) return false;

      // 2. Έλεγχος αν ο χρήστης έχει αποθηκεύσει έστω ένα αποτύπωμα/πρόσωπο στις ρυθμίσεις του κινητού
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) return false;

      // 3. Εμφάνιση του Native prompt ελέγχου
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Cancel',
        disableDeviceFallback: false, // Επιτρέπει PIN/Pattern αν αποτύχει το δάχτυλο
      });

      return result.success;
    } catch (error) {
      console.error('Biometric auth failed:', error);
      return false;
    }
  };

  return { requestAuthentication };
}