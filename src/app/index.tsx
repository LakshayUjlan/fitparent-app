import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCoachMessage, getProfile, logout } from '../api';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  const [coach, setCoach] = useState('Loading your message...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProfile();
        setUser(res.data);
      } catch (e) {
        console.log('profile error', e);
      }
      try {
        const coachRes = await getCoachMessage('Give me motivation for today');
        setCoach(coachRes.data.message);
      } catch (e) {
        setCoach("You're doing amazing! Every workout brings you closer to a stronger, healthier life. Start today's session when you're ready.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#4ADE80" />
        <Text style={styles.loadingText}>Setting up your day...</Text>
      </View>
    );
  }

  const name = user?.first_name || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={styles.outerWrap}>
      <ScrollView style={styles.container} contentContainerStyle={styles.containerContent}>

        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.greetingLabel}>{greeting.toUpperCase()}</Text>
          <Text style={styles.heroName}>{name} 👋</Text>
          <Text style={styles.heroSub}>Let's keep your streak going</Text>
        </View>

        {/* Today's workout card */}
        <View style={styles.workoutCard}>
          <View style={styles.workoutCardTop}>
            <Text style={styles.workoutCardTitle}>Today's workout</Text>
            <View style={styles.aiBadge}>
              <View style={styles.aiDot} />
              <Text style={styles.aiBadgeText}>AI READY</Text>
            </View>
          </View>
          <Text style={styles.workoutCardSub}>Start a session from the Workout tab</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '0%' }]} />
          </View>
          <Text style={styles.progressLabel}>0 of 5 exercises done</Text>
        </View>

        {/* FitCoach card */}
        <View style={styles.coachCard}>
          <View style={styles.coachHeader}>
            <View style={styles.aiDot} />
            <Text style={styles.coachLabel}>FitCoach</Text>
          </View>
          <Text style={styles.coachMsg}>{coach}</Text>
        </View>

        {/* Week streak */}
        <Text style={styles.sectionTitle}>This week</Text>
        <View style={styles.streakRow}>
          {DAYS.map((day, i) => (
            <View key={i} style={[styles.dayBox, i < 1 && styles.dayBoxDone, i === 1 && styles.dayBoxToday]}>
              <Text style={[styles.dayText, i < 1 && styles.dayTextDone]}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>1</Text>
            <Text style={styles.statLabel}>Streak 🔥</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>0%</Text>
            <Text style={styles.statLabel}>Strength</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>—</Text>
            <Text style={styles.statLabel}>Pain avg</Text>
          </View>
        </View>

        {/* Emergency */}
        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>⚠️ Know when to stop</Text>
          <Text style={styles.emergencyBody}>
            Chest pain, severe dizziness, sudden swelling, or shortness of breath? Stop immediately and call a doctor or 112.
          </Text>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/workout' as any)}>
          <Text style={styles.primaryBtnText}>Start today's workout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/pain' as any)}>
          <Text style={styles.secondaryBtnText}>Log pain after workout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={async () => { await logout(); router.replace('/login' as any); }}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrap: { flex: 1, backgroundColor: '#0B0F1A' },
  container: { flex: 1, maxWidth: 440, width: '100%', alignSelf: 'center' },
  containerContent: { padding: 20, paddingBottom: 48 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0F1A', gap: 12 },
  loadingText: { color: '#94a3b8', fontSize: 14 },

  heroSection: { paddingTop: 8, marginBottom: 20 },
  greetingLabel: { fontSize: 11, color: '#475569', letterSpacing: 1.5, fontWeight: '600', marginBottom: 4 },
  heroName: { fontSize: 30, fontWeight: '800', color: '#f1f5f9', marginBottom: 4 },
  heroSub: { fontSize: 14, color: '#64748b' },

  workoutCard: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1e2d40', borderRadius: 16, padding: 18, marginBottom: 12 },
  workoutCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  workoutCardTitle: { fontSize: 15, fontWeight: '700', color: '#e2e8f0' },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#0d2a1a', borderWidth: 1, borderColor: '#166534', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  aiDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#4ADE80' },
  aiBadgeText: { fontSize: 10, color: '#4ADE80', fontWeight: '700', letterSpacing: 0.5 },
  workoutCardSub: { fontSize: 13, color: '#64748b', marginBottom: 12 },
  progressTrack: { height: 4, backgroundColor: '#1e2d40', borderRadius: 99, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: 4, borderRadius: 99, backgroundColor: '#4ADE80' },
  progressLabel: { fontSize: 11, color: '#475569', fontWeight: '500' },

  coachCard: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1e2d40', borderRadius: 16, padding: 16, marginBottom: 24 },
  coachHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  coachLabel: { fontSize: 11, color: '#4ADE80', fontWeight: '700', letterSpacing: 1 },
  coachMsg: { fontSize: 14, color: '#94a3b8', lineHeight: 22 },

  sectionTitle: { fontSize: 11, color: '#475569', fontWeight: '600', letterSpacing: 1.2, marginBottom: 10, textTransform: 'uppercase' },
  streakRow: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  dayBox: { flex: 1, height: 40, borderRadius: 8, borderWidth: 1, borderColor: '#1e2d40', backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
  dayBoxDone: { backgroundColor: '#4ADE80', borderColor: '#4ADE80' },
  dayBoxToday: { borderColor: '#4ADE80' },
  dayText: { fontSize: 11, color: '#64748b', fontWeight: '700' },
  dayTextDone: { color: '#0B0F1A' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1e2d40', borderRadius: 12, padding: 14, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '800', color: '#4ADE80', marginBottom: 2 },
  statLabel: { fontSize: 10, color: '#475569', fontWeight: '600' },

  emergencyCard: { backgroundColor: '#1a0f0f', borderWidth: 1, borderColor: '#3f1515', borderRadius: 14, padding: 14, marginBottom: 20 },
  emergencyTitle: { fontSize: 13, fontWeight: '700', color: '#f87171', marginBottom: 5 },
  emergencyBody: { fontSize: 12, color: '#94a3b8', lineHeight: 18 },

  primaryBtn: { backgroundColor: '#4ADE80', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 10 },
  primaryBtnText: { color: '#0B0F1A', fontSize: 15, fontWeight: '800' },
  secondaryBtn: { borderWidth: 1, borderColor: '#1e2d40', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 24 },
  secondaryBtnText: { color: '#94a3b8', fontSize: 15, fontWeight: '600' },
  logoutBtn: { alignItems: 'center', paddingVertical: 8 },
  logoutText: { color: '#334155', fontSize: 13, fontWeight: '500' },
});