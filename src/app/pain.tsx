import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { logPain, logRecovery } from '../api';

export default function PainScreen() {
  const [knee, setKnee] = useState(0);
  const [back, setBack] = useState(0);
  const [shoulder, setShoulder] = useState(0);
  const [sleep, setSleep] = useState(7);
  const [water, setWater] = useState(6);
  const [energy, setEnergy] = useState(7);
  const [loading, setLoading] = useState(false);

  const highPain = knee >= 5 || back >= 5 || shoulder >= 5;

  const handleSave = async () => {
    setLoading(true);
    try {
      await logPain({ knee_pain: knee, back_pain: back, shoulder_pain: shoulder });
      await logRecovery({ sleep_hours: sleep, water_glasses: water, energy_score: energy, steps: 0 });
      Alert.alert('Saved! 💚', 'Great work today. Rest well!', [
        { text: 'OK', onPress: () => router.replace('/') }
      ]);
    } catch (e) {
      Alert.alert('Error', 'Could not save. Make sure Django is running.');
    } finally {
      setLoading(false);
    }
  };

  const painColor = (val: number) => val <= 3 ? '#4ADE80' : val <= 6 ? '#fbbf24' : '#f87171';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <View style={styles.coachCard}>
        <View style={styles.coachHeader}>
          <View style={styles.dot} />
          <Text style={styles.coachLabel}>FitCoach</Text>
        </View>
        <Text style={styles.coachMsg}>
          Tell me honestly how you feel. If pain is above 5, I'll make next week's workout gentler. Your health comes first.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Pain check</Text>

      {[
        { label: '🦵 Knee', val: knee, set: setKnee },
        { label: '🔙 Back', val: back, set: setBack },
        { label: '💪 Shoulder', val: shoulder, set: setShoulder },
      ].map(({ label, val, set }) => (
        <View key={label} style={styles.painCard}>
          <View style={styles.painRow}>
            <Text style={styles.painLabel}>{label}</Text>
            <Text style={[styles.painVal, { color: painColor(val) }]}>{val} / 10</Text>
          </View>
          <Slider
            minimumValue={0} maximumValue={10} step={1}
            value={val} onValueChange={set}
            minimumTrackTintColor={painColor(val)}
            maximumTrackTintColor="#1e2d40"
            thumbTintColor={painColor(val)}
          />
        </View>
      ))}

      {highPain && (
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ Pain is high</Text>
          <Text style={styles.warningBody}>I'll lighten next week's sessions. If pain is sudden or severe, please see a doctor.</Text>
        </View>
      )}

      <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Recovery check</Text>

      {[
        { icon: '🌙', label: 'Sleep', val: sleep, set: setSleep, min: 4, max: 12, step: 0.5, display: `${sleep}h` },
        { icon: '💧', label: 'Water glasses', val: water, set: setWater, min: 0, max: 12, step: 1, display: `${water}` },
        { icon: '⚡', label: 'Energy', val: energy, set: setEnergy, min: 1, max: 10, step: 1, display: `${energy}/10` },
      ].map(({ icon, label, val, set, min, max, step, display }) => (
        <View key={label} style={styles.recCard}>
          <View style={styles.recRow}>
            <Text style={styles.recIcon}>{icon}</Text>
            <Text style={styles.recLabel}>{label}</Text>
            <Text style={styles.recVal}>{display}</Text>
          </View>
          <Slider
            minimumValue={min} maximumValue={max} step={step}
            value={val} onValueChange={set}
            minimumTrackTintColor="#4ADE80"
            maximumTrackTintColor="#1e2d40"
            thumbTintColor="#4ADE80"
          />
        </View>
      ))}

      <TouchableOpacity style={styles.btn} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#0B0F1A" /> : <Text style={styles.btnText}>Save & finish ✓</Text>}
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F1A' },
  content: { padding: 20, paddingBottom: 48, maxWidth: 440, width: '100%', alignSelf: 'center' },

  coachCard: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1e2d40', borderRadius: 16, padding: 16, marginBottom: 24 },
  coachHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#4ADE80' },
  coachLabel: { fontSize: 11, color: '#4ADE80', fontWeight: '700', letterSpacing: 1 },
  coachMsg: { fontSize: 14, color: '#94a3b8', lineHeight: 22 },

  sectionTitle: { fontSize: 11, color: '#475569', fontWeight: '600', letterSpacing: 1.2, marginBottom: 10, textTransform: 'uppercase' },

  painCard: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1e2d40', borderRadius: 14, padding: 16, marginBottom: 10 },
  painRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  painLabel: { fontSize: 15, color: '#e2e8f0', fontWeight: '600' },
  painVal: { fontSize: 15, fontWeight: '700' },

  warningCard: { backgroundColor: '#1a0f0f', borderWidth: 1, borderColor: '#3f1515', borderRadius: 14, padding: 14, marginBottom: 16 },
  warningTitle: { fontSize: 13, fontWeight: '700', color: '#f87171', marginBottom: 4 },
  warningBody: { fontSize: 12, color: '#94a3b8', lineHeight: 18 },

  recCard: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1e2d40', borderRadius: 14, padding: 16, marginBottom: 10 },
  recRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  recIcon: { fontSize: 20 },
  recLabel: { flex: 1, fontSize: 14, color: '#e2e8f0', fontWeight: '600' },
  recVal: { fontSize: 15, fontWeight: '700', color: '#4ADE80' },

  btn: { backgroundColor: '#4ADE80', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#0B0F1A', fontSize: 15, fontWeight: '800' },
});