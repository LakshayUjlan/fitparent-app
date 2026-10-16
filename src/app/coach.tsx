import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { smartCoach } from '../api'; // or wherever it's exported from

function GridBackground() {
  const lines = [];
  const spacing = 64;
  const size = 1200;
  for (let x = 0; x <= size; x += spacing) {
    lines.push(<Line key={`v-${x}`} x1={x} y1={0} x2={x} y2={size} stroke="#1a1a1a" strokeWidth={1} />);
  }
  for (let y = 0; y <= size; y += spacing) {
    lines.push(<Line key={`h-${y}`} x1={0} y1={y} x2={size} y2={y} stroke="#1a1a1a" strokeWidth={1} />);
  }
  return (
    <View style={styles.gridWrap} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>{lines}</Svg>
    </View>
  );
}

const SUGGESTIONS = [
  "Let's hit chest today",
  "Give me a full week plan",
  "What should I do today?",
  "I haven't worked out in a week",
  "I'm feeling tired today",
];

export default function CoachScreen() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [doneSets, setDoneSets] = useState<Record<string, boolean>>({});

  const sendMessage = async (msg?: string) => {
    const text = msg || message;
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    setDoneSets({});
    try {
      const res = await smartCoach(text);
      setResult(res.data);
    } catch (e) {
      console.log('coach error', e);
    } finally {
      setLoading(false);
      setMessage('');
    }
  };

  const toggleSet = (exIdx: number, setIdx: number) => {
    const key = `${exIdx}-${setIdx}`;
    setDoneSets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const workout = result?.workout || result?.today_workout;
  const schedule = result?.schedule;

  return (
    <View style={styles.outerWrap}>
      <GridBackground />
      <ScrollView style={styles.container} contentContainerStyle={styles.containerContent}>

        <View style={styles.heroSection}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusBadgeText}>SMART COACH</Text>
          </View>
          <Text style={styles.heroLine1}>WHAT'S</Text>
          <Text style={styles.heroLine2}>THE PLAN?</Text>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="e.g. lets hit chest today..."
            placeholderTextColor="#555"
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => sendMessage()} disabled={loading}>
            <Text style={styles.sendBtnText}>→</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>QUICK COMMANDS</Text>
        <View style={styles.suggestions}>
          {SUGGESTIONS.map((s, i) => (
            <TouchableOpacity key={i} style={styles.suggestionPill} onPress={() => sendMessage(s)}>
              <Text style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>COACH IS THINKING...</Text>
          </View>
        )}

        {result?.comeback_message && (
          <View style={styles.comebackCard}>
            <View style={styles.statusDot} />
            <Text style={styles.comebackText}>{result.comeback_message}</Text>
          </View>
        )}

        {result?.type === 'no_plan' && (
          <View style={styles.noPlanCard}>
            <Text style={styles.noPlanText}>{result.message}</Text>
          </View>
        )}

        {result?.type === 'full_week_plan' && result.split && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>YOUR WEEK</Text>
            {Object.entries(result.split).map(([day, muscle]: any) => (
              <View key={day} style={styles.splitRow}>
                <Text style={styles.splitDay}>{day.toUpperCase()}</Text>
                <View style={[styles.splitBadge, muscle === 'rest' && styles.splitBadgeRest]}>
                  <Text style={[styles.splitMuscle, muscle === 'rest' && styles.splitMuscleRest]}>
                    {muscle.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {schedule && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>THIS WEEK</Text>
            <Text style={styles.scheduleToday}>
              TODAY: {schedule.today?.muscle_group?.toUpperCase() || 'REST'} — {schedule.today?.status?.toUpperCase()}
            </Text>
            {schedule.missed_count > 0 && (
              <Text style={styles.missedText}>⚠ {schedule.missed_count} DAYS MISSED THIS WEEK</Text>
            )}
            {schedule.days.map((d: any, i: number) => (
              <View key={i} style={styles.scheduleRow}>
                <Text style={styles.scheduleDate}>{d.date}</Text>
                <Text style={styles.scheduleMuscle}>{d.muscle_group.toUpperCase()}</Text>
                <View style={[
                  styles.statusChip,
                  d.status === 'done' && styles.statusDone,
                  d.status === 'missed' && styles.statusMissed,
                  d.status === 'rest' && styles.statusRest,
                ]}>
                  <Text style={styles.statusChipText}>{d.status.toUpperCase()}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {workout && (
          <View>
            <View style={styles.workoutHeader}>
              <Text style={styles.workoutTitle}>{workout.session_title?.toUpperCase()}</Text>
              <Text style={styles.coachNote}>{workout.coach_note}</Text>
            </View>

            {workout.exercises?.map((ex: any, exIdx: number) => (
              <View key={exIdx} style={styles.exerciseCard}>
                <View style={styles.exHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exName}>{ex.name.toUpperCase()}</Text>
                    <Text style={styles.exInstruction}>{ex.instruction}</Text>
                  </View>
                  <View style={styles.exMeta}>
                    <Text style={styles.exMetaText}>{ex.sets}×{ex.reps}</Text>
                  </View>
                </View>
                <View style={styles.modCard}>
                  <Text style={styles.modLabel}>MODIFICATION</Text>
                  <Text style={styles.modText}>{ex.modification}</Text>
                </View>
                <View style={styles.setsStack}>
                  {Array.from({ length: ex.sets }).map((_, setIdx) => {
                    const key = `${exIdx}-${setIdx}`;
                    const done = doneSets[key];
                    return (
                      <TouchableOpacity
                        key={setIdx}
                        style={[styles.setRow, done && styles.setRowDone]}
                        onPress={() => toggleSet(exIdx, setIdx)}
                      >
                        <Text style={[styles.setRowTitle, done && styles.setRowTitleDone]}>SET {setIdx + 1}</Text>
                        <Text style={[styles.setRowSub, done && styles.setRowSubDone]}>{ex.reps} REPS</Text>
                        <View style={[styles.checkCircle, done && styles.checkCircleDone]}>
                          {done && <Text style={styles.checkMark}>✓</Text>}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={styles.restText}>REST {ex.rest_seconds}S</Text>
              </View>
            ))}

            <TouchableOpacity style={styles.bigBtn} onPress={() => router.push('/pain' as any)}>
              <Text style={styles.bigBtnText}>FINISH & LOG PAIN</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrap: { flex: 1, backgroundColor: '#000000' },
  gridWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.5 },
  container: { flex: 1, maxWidth: 420, width: '100%', alignSelf: 'center' },
  containerContent: { padding: 20, paddingBottom: 48 },

  heroSection: { marginBottom: 24, paddingTop: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#262626', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8, marginBottom: 16 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#39FF14' },
  statusBadgeText: { fontSize: 11, fontWeight: '700', color: '#aaa', letterSpacing: 1 },
  heroLine1: { fontSize: 44, fontWeight: '800', color: '#fff', letterSpacing: -1, lineHeight: 48 },
  heroLine2: { fontSize: 44, fontWeight: '800', color: 'rgba(255,255,255,0.18)', letterSpacing: -1, lineHeight: 48, marginBottom: 16 },

  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#0a0a0a', borderWidth: 1, borderColor: '#262626', borderRadius: 4, padding: 14, color: '#fff', fontSize: 14 },
  sendBtn: { backgroundColor: '#fff', borderRadius: 4, paddingHorizontal: 20, justifyContent: 'center' },
  sendBtnText: { color: '#000', fontSize: 20, fontWeight: '800' },

  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#666', letterSpacing: 1.5, marginBottom: 10 },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  suggestionPill: { borderWidth: 1, borderColor: '#333', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8 },
  suggestionText: { color: '#aaa', fontSize: 12, fontWeight: '600' },

  loadingCard: { alignItems: 'center', padding: 32 },
  loadingText: { marginTop: 16, color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 1 },

  comebackCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderColor: '#1a3a14', borderRadius: 4, padding: 16, marginBottom: 16, backgroundColor: '#0a0f0a' },
  comebackText: { flex: 1, color: '#aaa', fontSize: 14, lineHeight: 20 },

  noPlanCard: { borderWidth: 1, borderColor: '#262626', borderRadius: 4, padding: 16, marginBottom: 16 },
  noPlanText: { color: '#aaa', fontSize: 14, lineHeight: 20 },

  card: { borderWidth: 1, borderColor: '#262626', borderRadius: 4, padding: 18, marginBottom: 16, backgroundColor: '#0a0a0a' },
  cardTitle: { fontSize: 11, fontWeight: '700', color: '#666', letterSpacing: 1, marginBottom: 14 },

  splitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#111' },
  splitDay: { fontSize: 12, color: '#888', fontWeight: '700', width: 90 },
  splitBadge: { borderWidth: 1, borderColor: '#333', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4 },
  splitBadgeRest: { borderColor: '#222' },
  splitMuscle: { fontSize: 11, color: '#fff', fontWeight: '700', letterSpacing: 0.5 },
  splitMuscleRest: { color: '#444' },

  scheduleToday: { fontSize: 14, color: '#39FF14', fontWeight: '700', marginBottom: 8 },
  missedText: { fontSize: 12, color: '#cc8844', marginBottom: 12, fontWeight: '600' },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#111', gap: 10 },
  scheduleDate: { fontSize: 11, color: '#666', width: 80 },
  scheduleMuscle: { flex: 1, fontSize: 12, color: '#fff', fontWeight: '600' },
  statusChip: { borderWidth: 1, borderColor: '#333', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 },
  statusDone: { borderColor: '#1a3a14', backgroundColor: '#0a1a0a' },
  statusMissed: { borderColor: '#3a1414', backgroundColor: '#1a0a0a' },
  statusRest: { borderColor: '#222' },
  statusChipText: { fontSize: 10, color: '#888', fontWeight: '700' },

  workoutHeader: { marginBottom: 16 },
  workoutTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 6 },
  coachNote: { fontSize: 14, color: '#888', lineHeight: 20 },

  exerciseCard: { borderWidth: 1, borderColor: '#262626', borderRadius: 4, padding: 16, marginBottom: 12, backgroundColor: '#0a0a0a' },
  exHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  exName: { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 4 },
  exInstruction: { fontSize: 13, color: '#999', lineHeight: 18 },
  exMeta: { borderWidth: 1, borderColor: '#fff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4, marginLeft: 8 },
  exMetaText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  modCard: { borderLeftWidth: 2, borderLeftColor: '#39FF14', paddingLeft: 10, marginBottom: 12 },
  modLabel: { fontSize: 10, fontWeight: '700', color: '#39FF14', letterSpacing: 1, marginBottom: 3 },
  modText: { fontSize: 13, color: '#ccc', lineHeight: 18 },
  setsStack: { gap: 6, marginBottom: 8 },
  setRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#262626', borderRadius: 4, paddingVertical: 12, paddingHorizontal: 14, minHeight: 48 },
  setRowDone: { backgroundColor: '#fff', borderColor: '#fff' },
  setRowTitle: { fontSize: 13, fontWeight: '800', color: '#fff' },
  setRowTitleDone: { color: '#000' },
  setRowSub: { fontSize: 12, color: '#888', fontWeight: '600' },
  setRowSubDone: { color: '#555' },
  checkCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#444', alignItems: 'center', justifyContent: 'center' },
  checkCircleDone: { backgroundColor: '#000', borderColor: '#000' },
  checkMark: { color: '#fff', fontSize: 12, fontWeight: '800' },
  restText: { fontSize: 11, color: '#777', fontWeight: '600', letterSpacing: 0.5 },

  bigBtn: { backgroundColor: '#fff', borderRadius: 99, paddingVertical: 18, alignItems: 'center', marginBottom: 32, minHeight: 48 },
  bigBtnText: { color: '#000', fontSize: 15, fontWeight: '800', letterSpacing: 1 },
});