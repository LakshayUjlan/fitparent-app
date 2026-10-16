import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { login, setRefreshToken, setToken } from '../api';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Please enter username and password');
      return;
    }
    setLoading(true);
    try {
      const res = await login(username, password);
      setToken(res.data.access);
      setRefreshToken(res.data.refresh);
      router.replace('/');
    } catch (e) {
      Alert.alert('Login failed', 'Wrong username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.outer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <View style={styles.logoWrap}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>🌿</Text>
          </View>
          <Text style={styles.appName}>FitParent</Text>
          <Text style={styles.appSub}>Your family's fitness companion</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSub}>Sign in to continue</Text>

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            placeholderTextColor="#475569"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#475569"
            secureTextEntry
          />

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#0B0F1A" /> : <Text style={styles.btnText}>Sign in</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/register' as any)}>
            <Text style={styles.link}>Don't have an account? <Text style={styles.linkAccent}>Register</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: '#0B0F1A' },
  container: { flex: 1, justifyContent: 'center', padding: 24, maxWidth: 440, width: '100%', alignSelf: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logoBadge: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#0d2a1a', borderWidth: 1, borderColor: '#166534', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoEmoji: { fontSize: 28 },
  appName: { fontSize: 24, fontWeight: '800', color: '#f1f5f9', marginBottom: 4 },
  appSub: { fontSize: 13, color: '#64748b' },
  card: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1e2d40', borderRadius: 20, padding: 24 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#f1f5f9', marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#64748b', marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '600', color: '#94a3b8', marginBottom: 6, letterSpacing: 0.3 },
  input: { backgroundColor: '#0B0F1A', borderWidth: 1, borderColor: '#1e2d40', borderRadius: 10, padding: 14, fontSize: 15, color: '#f1f5f9', marginBottom: 16 },
  btn: { backgroundColor: '#4ADE80', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4, marginBottom: 16 },
  btnText: { color: '#0B0F1A', fontSize: 15, fontWeight: '800' },
  link: { textAlign: 'center', color: '#64748b', fontSize: 13 },
  linkAccent: { color: '#4ADE80', fontWeight: '600' },
});