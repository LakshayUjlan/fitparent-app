import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { getProgressSummary } from '../api';

function PainChart({ trend }: { trend: any[] }) {
  if (!trend || trend.length < 2) return (
    <Text style={styles.noData}>Log pain after workouts to see your trend here.</Text>
  );
  const width = 320, height = 90, padding = 16;
  const max = 10;
  const kneePoints = trend.map((d, i) => {
    const x = padding + (i * (width - padding * 2)) / (trend.length - 1);
    const y = height - padding - (d.knee / max) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      {[0, 5, 10].map((g, i) => {
        const y = height - padding - (g / max) * (height - padding * 2);
        return <Line key={i} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#1e2d40" strokeWidth={1} />;
      })}
      <Polyline points={kneePoints} fill="none" stroke="#4ADE80" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {trend.map((d, i) => {
        const x = padding + (i * (width - padding * 2)) / (trend.length - 1);
        const y = height - padding - (d.knee / max) * (height - padding * 2);
        const color = d.knee <= 3 ? '#4ADE80' : d.knee <= 6 ? '#fbbf24' : '#f87171';
        return <Circle key={i} cx={x} cy={y} r={4} fill={color} />;
      })}
    </Svg>
  );
}

function PainBar({ label, value }: { label: string; value: number }) {
  const color = value <= 3 ? '#4ADE80' : value <= 6 ? '#fbbf24' : '#f87171';
  return (
    <View style={styles.painRow}>
      <Text style={styles.painLabel}>{label}</Text>
      <View style={styles.painTrack}>
        <View style={[styles.painFill, { width: `${(value / 10) * 100}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[styles.painVal, { color }]}>{value}/10</Text>
    </View>
  );
}

export default function ProgressScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setLoading(true);
        try {
          const res = await getProgressSummary();
          setData(res.data);
        } catch (e) {
          console.log('progress error', e);
        } finally {
          setLoading(false);
        }
      };
      load();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#4ADE80" />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  const pain = data?.avg_pain || { knee: 0, back: 0, shoulder: 0 };
  const recovery = data?.avg_recovery || { sleep: 0, water: 0, energy: 0 };
  const riskLabel = pain.knee <= 3 && pain.back <= 3 ? 'Low risk ✅' : pain.knee <= 6 ? 'Moderate ⚠️' : 'High — see doctor 🔴';
  const riskColor = pain.knee <= 3 && pain.back <= 3 ? '#4ADE80' : pain.knee <= 6 ? '#fbbf24' : '#f87171';

  return (
    <View style={styles.outer}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <View style={styles.heroSection}>
          <Text style={styles.heroEyebrow}>{data?.total_sessions || 0} WORKOUTS LOGGED</Text>
          <Text style={styles.heroTitle}>Your Progress</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{data?.streak || 0}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{data?.total_sessions || 0}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{recovery.energy || '—'}</Text>
            <Text style={styles.statLabel}>Avg energy</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Knee pain trend</Text>
          <PainChart trend={data?.pain_trend || []} />
          <View style={styles.legendRow}>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#4ADE80' }]} /><Text style={styles.legendText}>Low</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#fbbf24' }]} /><Text style={styles.legendText}>Med</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#f87171' }]} /><Text style={styles.legendText}>High</Text></View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Avg pain levels — lower is better</Text>
          <PainBar label="Knee" value={pain.knee} />
          <PainBar label="Back" value={pain.back} />
          <PainBar label="Shoulder" value={pain.shoulder} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Avg recovery</Text>
          <View style={styles.recoveryRow}>
            <View style={styles.recoveryBox}>
              <Text style={styles.recoveryVal}>{recovery.sleep}h</Text>
              <Text style={styles.recoveryLabel}>Sleep</Text>
            </View>
            <View style={styles.recoveryBox}>
              <Text style={styles.recoveryVal}>{recovery.water}</Text>
              <Text style={styles.recoveryLabel}>Water</Text>
            </View>
            <View style={styles.recoveryBox}>
              <Text style={styles.recoveryVal}>{recovery.energy}/10</Text>
              <Text style={styles.recoveryLabel}>Energy</Text>
            </View>
          </View>
        </View>

        <View style={styles.fallCard}>
          <Text style={styles.fallCardLabel}>Fall risk score</Text>
          <Text style={[styles.fallCardValue, { color: riskColor }]}>{riskLabel}</Text>
          <Text style={styles.fallCardSub}>Based on your average pain over the last 7 sessions.</Text>
        </View>

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
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#f1f5f9' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1e2d40', borderRadius: 14, padding: 14, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800', color: '#4ADE80', marginBottom: 2 },
  statLabel: { fontSize: 10, color: '#475569', fontWeight: '600' },

  card: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1e2d40', borderRadius: 16, padding: 18, marginBottom: 12 },
  cardTitle: { fontSize: 12, color: '#64748b', fontWeight: '600', letterSpacing: 0.5, marginBottom: 14, textTransform: 'uppercase' },
  noData: { fontSize: 13, color: '#475569', fontStyle: 'italic' },

  legendRow: { flexDirection: 'row', gap: 16, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: '#64748b' },

  painRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  painLabel: { fontSize: 13, color: '#94a3b8', width: 70, fontWeight: '500' },
  painTrack: { flex: 1, height: 6, backgroundColor: '#1e2d40', borderRadius: 99, overflow: 'hidden' },
  painFill: { height: 6, borderRadius: 99 },
  painVal: { fontSize: 12, width: 38, fontWeight: '700', textAlign: 'right' },

  recoveryRow: { flexDirection: 'row', gap: 10 },
  recoveryBox: { flex: 1, backgroundColor: '#0B0F1A', borderWidth: 1, borderColor: '#1e2d40', borderRadius: 12, padding: 12, alignItems: 'center' },
  recoveryVal: { fontSize: 18, fontWeight: '800', color: '#4ADE80', marginBottom: 2 },
  recoveryLabel: { fontSize: 10, color: '#475569', fontWeight: '600' },

  fallCard: { backgroundColor: '#0d2a1a', borderWidth: 1, borderColor: '#166534', borderRadius: 16, padding: 18, marginBottom: 32 },
  fallCardLabel: { fontSize: 11, color: '#4ADE80', fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  fallCardValue: { fontSize: 22, fontWeight: '800', marginBottom: 6 },
  fallCardSub: { fontSize: 12, color: '#64748b', lineHeight: 18 },
});