import { router } from 'expo-router';
import { Alert } from 'react-native';
import { login, logout, register, setRefreshToken, setToken } from '../api';
import RegistrationQuestionnaire from '../components/registration/RegistrationQuestionnaire';

export default function RegisterScreen() {
  const handleComplete = async (payload: Record<string, any>) => {
    try {
      await logout();
      await register(payload);
      const res = await login(payload.username, payload.password);
      setToken(res.data.access);
      setRefreshToken(res.data.refresh);
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Registration failed', JSON.stringify(e.response?.data));
    }
  };

  return <RegistrationQuestionnaire onComplete={handleComplete} />;
}