import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api, { completeSession, logExercises, startSession } from '../api';

const QUICK_COMMANDS = ['Legs today', 'Hit chest', 'Back day', "I'm tired", 'Full body', 'Shoulders'];

export default function WorkoutScreen() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [doneSets, setDoneSets] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [coachLoading, setCoachLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [message, setMessage] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [coachNote, setCoachNote] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [missedCount, setMissedCount] = useState(0);
  const [comebackMessage, setComebackMessage] = useState('');

  const loadWorkout = async (msg: string) => {
    try {
      const res = await api.post('/coach/smart/', { message: msg });
      const data = res.data;
      const workout = data.workout || data.today_workout;
      setExercises(workout?.exercises || []);
      setSessionTitle(workout?.session_title || '');
      setCoachNote(workout?.coach_note || '');
      setMuscleGroup(workout?.muscle_group || '');
      setMissedCount(data.missed_count || 0);
      setComebackMessage(data.comeback_message || '');
      setDoneSets({});
      setSaveError('');
    } catch (e) {
      setExercises([
        { name: "Chair Squat", sets: 3, reps: 10, rest_seconds: 90, image_url: '', instruction: "Sit and stand from chair slowly", modification: "Hold chair arms for support" },
        { name: "Wall Push-up", sets: 3, reps: 10, rest_seconds: 60, image_url: '', instruction: "Stand facing wall, push slowly", modification: "Move feet closer to wall" },
        { name: "Single Leg Stand", sets: 3, reps: 30, rest_seconds: 45, image_url: '', instruction: "Stand on one leg near wall", modification: "Touch wall lightly for balance" },
      ]);
    }
  };

  useEffect(() => { setLoading(false); }, []);

  const handleSend = async (msg?: string) => {
    const text = msg || message;
    if (!text.trim()) return;
    setCoachLoading(true);
    setMessage('');
    await loadWorkout(text);
    setCoachLoading(false);
  };

  const toggleSet = (exIdx: number, setIdx: number) => {
    const key = `${exIdx}-${setIdx}`;
    setDoneSets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Builds one log row per completed set. Exercises without an id (fallback workout) are skipped.
  const buildLogs = (sessionId: number) => {
    const logs: any[] = [];
    Object.entries(doneSets).forEach(([key, done]) => {
      if (!done) return;
      const [exIdx, setIdx] = key.split('-').map(Number);
      const ex = exercises[exIdx];
      if (!ex || ex.id == null) return;
      logs.push({
        session: sessionId,
        exercise: ex.id,
        set_number: setIdx + 1,
        reps_done: ex.reps,
        weight_kg: 0,
      });
    });
    return logs;
  };

  const handleFinish = async () => {
    if (saving) return;

    // Nothing completed: skip saving and go straight to the pain screen
    if (doneSetsCount === 0) {
      router.push('/pain' as any);
      return;
    }

    setSaving(true);
    setSaveError('');
    try {
      const sessionRes = await startSession(null);
      const sessionId = sessionRes.data.id;
      const logs = buildLogs(sessionId);
      if (logs.length > 0) {
        await logExercises(logs);
      }
      await completeSession(sessionId);
      router.push('/pain' as any);
    } catch (e) {
      setSaveError("Couldn't save your workout. Tap again to retry.");
    } finally {
      setSaving(false);
    }
  };

  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const doneSetsCount = Object.values(doneSets).filter(Boolean).length;

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#4ADE80" />
        <Text style={styles.loadingText}>Building your workout...</Text>
      </View>
    );
  }

  return (
    <View style={styles.outer}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.heroEyebrow}>{muscleGroup ? muscleGroup.toUpperCase() : 'AI PERSONALIZED'}</Text>
          <Text style={styles.heroTitle}>Today's{'\n'}Workout</Text>
          {sessionTitle ? <Text style={styles.sessionTitle}>{sessionTitle}</Text> : null}
          {totalSets > 0 && (
            <View style={styles.progressWrap}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${(doneSetsCount / totalSets) * 100}%` as any }]} />
              </View>
              <Text style={styles.progressLabel}>{doneSetsCount} / {totalSets} sets complete</Text>
            </View>
          )}
        </View>

        {/* Coach input */}
        <View style={styles.coachSection}>
          <Text style={styles.coachSectionLabel}>Tell your coach</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="e.g. hit chest today, I'm tired..."
              placeholderTextColor="#334155"
              onSubmitEditing={() => handleSend()}
            />
            <TouchableOpacity
              style={[styles.sendBtn, coachLoading && styles.sendBtnDisabled]}
              onPress={() => handleSend()}
              disabled={coachLoading}
            >
              {coachLoading
                ? <ActivityIndicator size="small" color="#0B0F1A" />
                : <Text style={styles.sendBtnText}>→</Text>
              }
            </TouchableOpacity>
          </View>
          <View style={styles.quickRow}>
            {QUICK_COMMANDS.map((cmd, i) => (
              <TouchableOpacity key={i} style={styles.quickPill} onPress={() => handleSend(cmd)} disabled={coachLoading}>
                <Text style={styles.quickPillText}>{cmd}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Comeback */}
        {comebackMessage ? (
          <View style={styles.comebackCard}>
            <View style={styles.dot} />
            <Text style={styles.comebackText}>{comebackMessage}</Text>
          </View>
        ) : null}

        {/* Coach note */}
        {coachNote ? (
          <View style={styles.coachNoteCard}>
            <View style={styles.coachNoteHeader}>
              <View style={styles.dot} />
              <Text style={styles.coachNoteLabel}>FitCoach</Text>
            </View>
            <Text style={styles.coachNoteText}>{coachNote}</Text>
          </View>
        ) : null}

        {/* Loading */}
        {coachLoading && (
          <View style={styles.coachLoadingCard}>
            <ActivityIndicator size="large" color="#4ADE80" />
            <Text style={styles.coachLoadingText}>Coach is thinking...</Text>
          </View>
        )}

        {/* Exercises */}
        {!coachLoading && exercises.map((ex, exIdx) => (
          <View key={exIdx} style={styles.exerciseCard}>
            <View style={styles.exTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.exName}>{ex.name}</Text>
                <Text style={styles.exInstruction}>{ex.instruction}</Text>
              </View>
              <View style={styles.repsBadge}>
                <Text style={styles.repsBadgeText}>{ex.sets}×{ex.reps}</Text>
              </View>
            </View>

            {ex.image_url ? (
              <Image source={{ uri: ex.image_url }} style={styles.exerciseImage} resizeMode="cover" />
            ) : null}

            <View style={styles.modCard}>
              <Text style={styles.modLabel}>Modification</Text>
              <Text style={styles.modText}>{ex.modification}</Text>
            </View>

            <Text style={styles.tapHint}>Tap each set when done</Text>
            <View style={styles.setsStack}>
              {Array.from({ length: ex.sets }).map((_, setIdx) => {
                const key = `${exIdx}-${setIdx}`;
                const done = doneSets[key];
                return (
                  <TouchableOpacity key={setIdx} style={[styles.setRow, done && styles.setRowDone]} onPress={() => toggleSet(exIdx, setIdx)}>
                    <Text style={[styles.setTitle, done && styles.setTitleDone]}>Set {setIdx + 1}</Text>
                    <Text style={[styles.setSub, done && styles.setSubDone]}>{ex.reps} reps</Text>
                    <View style={[styles.check, done && styles.checkDone]}>
                      {done && <Text style={styles.checkMark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.restText}>Rest {ex.rest_seconds}s between sets</Text>
          </View>
        ))}

        {!coachLoading && exercises.length > 0 && (
          <>
            {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}
            <TouchableOpacity
              style={[styles.finishBtn, saving && styles.finishBtnDisabled]}
              onPress={handleFinish}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator size="small" color="#0B0F1A" />
                : <Text style={styles.finishBtnText}>Finish & log pain</Text>
              }
            </TouchableOpacity>
          </>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: '#0B0F1A' },
  container: { flex: 1, maxWidth: 440, width: '100%', alignSelf: 'center' },
  content: { padding: 20, paddingBottom: 48 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0F1A', gap: 12 },
  loadingText: { color: '#94a3b8', fontSize: 14 },

  heroSection: { marginBottom: 20, paddingTop: 4 },
  heroEyebrow: { fontSize: 11, color: '#475569', letterSpacing: 1.5, fontWeight: '600', marginBottom: 4 },
  heroTitle: { fontSize: 32, fontWeight: '800', color: '#f1f5f9', lineHeight: 38, marginBottom: 8 },
  sessionTitle: { fontSize: 14, color: '#64748b', marginBottom: 12 },
  progressWrap: { marginTop: 4 },
  progressTrack: { height: 4, backgroundColor: '#1e2d40', borderRadius: 99, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: 4, borderRadius: 99, backgroundColor: '#4ADE80' },
  progressLabel: { fontSize: 12, color: '#64748b', fontWeight: '500' },

  coachSection: { marginBottom: 20 },
  coachSectionLabel: { fontSize: 11, color: '#475569', fontWeight: '600', letterSpacing: 1.2, marginBottom: 8, textTransform: 'uppercase' },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  input: { flex: 1, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1e2d40', borderRadius: 12, padding: 14, color: '#f1f5f9', fontSize: 14 },
  sendBtn: { backgroundColor: '#4ADE80', borderRadius: 12, paddingHorizontal: 18, justifyContent: 'center', minWidth: 50 },
  sendBtnDisabled: { backgroundColor: '#1a2a1a' },
  sendBtnText: { color: '#0B0F1A', fontSize: 18, fontWeight: '800' },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  quickPill: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1e2d40', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 7 },
  quickPillText: { color: '#64748b', fontSize: 12, fontWeight: '500' },

  comebackCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#0d2a1a', borderWidth: 1, borderColor: '#166534', borderRadius: 14, padding: 14, marginBottom: 12 },
  comebackText: { flex: 1, color: '#94a3b8', fontSize: 13, lineHeight: 20 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#4ADE80', marginTop: 3 },

  coachNoteCard: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1e2d40', borderRadius: 14, padding: 14, marginBottom: 20 },
  coachNoteHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  coachNoteLabel: { fontSize: 11, color: '#4ADE80', fontWeight: '700', letterSpacing: 1 },
  coachNoteText: { fontSize: 14, color: '#94a3b8', lineHeight: 21 },

  coachLoadingCard: { alignItems: 'center', padding: 40, gap: 12 },
  coachLoadingText: { color: '#94a3b8', fontSize: 14 },

  exerciseCard: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1e2d40', borderRadius: 16, padding: 16, marginBottom: 12 },
  exTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  exName: { fontSize: 15, fontWeight: '700', color: '#e2e8f0', marginBottom: 4 },
  exInstruction: { fontSize: 13, color: '#94a3b8', lineHeight: 18 },
  repsBadge: { backgroundColor: '#1a1f35', borderWidth: 1, borderColor: '#2a3550', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginLeft: 8 },
  repsBadgeText: { fontSize: 13, fontWeight: '700', color: '#94a3b8' },
  exerciseImage: { width: '100%', height: 180, borderRadius: 12, marginBottom: 12, backgroundColor: '#111827' },
  modCard: { borderLeftWidth: 2, borderLeftColor: '#4ADE80', paddingLeft: 10, marginBottom: 14 },
  modLabel: { fontSize: 10, color: '#4ADE80', fontWeight: '700', letterSpacing: 0.5, marginBottom: 3 },
  modText: { fontSize: 13, color: '#94a3b8', lineHeight: 18 },
  tapHint: { fontSize: 11, color: '#475569', marginBottom: 8, fontWeight: '500' },
  setsStack: { gap: 6, marginBottom: 8 },
  setRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#1e2d40', borderRadius: 10, paddingVertical: 13, paddingHorizontal: 14, minHeight: 48, backgroundColor: '#0B0F1A' },
  setRowDone: { backgroundColor: '#4ADE80', borderColor: '#4ADE80' },
  setTitle: { fontSize: 13, fontWeight: '700', color: '#e2e8f0' },
  setTitleDone: { color: '#0B0F1A' },
  setSub: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  setSubDone: { color: '#0B0F1A' },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#2a3550', alignItems: 'center', justifyContent: 'center' },
  checkDone: { backgroundColor: '#0B0F1A', borderColor: '#0B0F1A' },
  checkMark: { color: '#4ADE80', fontSize: 12, fontWeight: '800' },
  restText: { fontSize: 11, color: '#475569', fontWeight: '500' },

  errorText: { color: '#f87171', fontSize: 13, textAlign: 'center', marginTop: 8 },
  finishBtn: { backgroundColor: '#4ADE80', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  finishBtnDisabled: { backgroundColor: '#1a2a1a' },
  finishBtnText: { color: '#0B0F1A', fontSize: 15, fontWeight: '800' },
});