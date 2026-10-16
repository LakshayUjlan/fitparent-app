import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text } from 'react-native';
import { getToken } from '../api';

export default function Layout() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login' as any);
    }
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#0B0F1A', borderBottomWidth: 0, shadowOpacity: 0 },
        headerTintColor: '#f1f5f9',
        headerTitleStyle: { fontWeight: '700', fontSize: 16, color: '#f1f5f9' },
        tabBarActiveTintColor: '#4ADE80',
        tabBarInactiveTintColor: '#475569',
        tabBarStyle: {
          backgroundColor: '#111827',
          borderTopColor: '#1e2d40',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 6,
          height: 64,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text> }} />
      <Tabs.Screen name="programs" options={{ title: 'Programs', tabBarIcon: () => <Text style={{ fontSize: 20 }}>💪</Text> }} />
      <Tabs.Screen name="workout" options={{ title: 'Workout', tabBarIcon: () => <Text style={{ fontSize: 20 }}>▶️</Text> }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarIcon: () => <Text style={{ fontSize: 20 }}>📈</Text> }} />
      <Tabs.Screen name="scan" options={{ title: 'Scan', tabBarIcon: () => <Text style={{ fontSize: 20 }}>📸</Text> }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="login" options={{ href: null, headerShown: false, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="register" options={{ href: null, headerShown: false, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="pain" options={{ href: null, headerShown: false }} />
    </Tabs>
  );
}