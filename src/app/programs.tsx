import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const programs = [
  { icon: '🏆', title: 'Knee-Friendly Strength', sub: 'Builds legs & core without knee stress', badge: 'ACTIVE', meta: '35 MIN' },
  { icon: '⚖️', title: 'Balance & Fall Prevention', sub: 'Stability, coordination, confidence', badge: 'RECOMMENDED', meta: '25 MIN' },
  { icon: '🔥', title: 'Weight Loss + Strength', sub: 'Low impact, sustainable fat loss', badge: '4 WEEKS', meta: '40 MIN' },
  { icon: '🪑', title: 'Chair Workouts', sub: 'Full workout — seated, safe, effective', badge: 'BEGINNER', meta: '20 MIN' },
  { icon: '❤️', title: 'Arthritis-Friendly', sub: 'Gentle motion, joint health, pain relief', badge: 'MEDICAL-SAFE', meta: '30 MIN' },
];

const mobility = [
  { icon: '🔄', title: 'Hip Mobility', dur: '7 min', moves: '5 movements', sub: 'Opens hips, reduces stiffness' },
  { icon: '↕️', title: 'Spine Mobility', dur: '10 min', moves: '6 movements', sub: 'Reduces morning stiffness' },
  { icon: '🦶', title: 'Ankle Mobility', dur: '5 min', moves: '4 movements', sub: 'Improves balance and walking' },
  { icon: '💪', title: 'Shoulder Mobility', dur: '8 min', moves: '5 movements', sub: 'Reduces shoulder stiffness' },
];

export default function ProgramsScreen() {
  return (
    <View style={styles.outer}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <View style={styles.heroSection}>
          <Text style={styles.heroEyebrow}>{programs.length} PROGRAMS AVAILABLE</Text>
          <Text style={styles.heroTitle}>Your Programs</Text>
        </View>

        <Text style={styles.sectionTitle}>Workout programs</Text>
        {programs.map((p, i) => (
          <TouchableOpacity key={i} style={styles.programCard} activeOpacity={0.8}>
            <View style={styles.programIconWrap}>
              <Text style={styles.programIcon}>{p.icon}</Text>
            </View>
            <View style={styles.programBody}>
              <View style={styles.programTopRow}>
                <Text style={styles.programTitle}>{p.title}</Text>
                <Text style={styles.programMeta}>{p.meta}</Text>
              </View>
              <Text style={styles.programSub}>{p.sub}</Text>
              <View style={styles.badgeWrap}>
                <Text style={styles.badgeText}>{p.badge}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Mobility routines</Text>
        {mobility.map((m, i) => (
          <TouchableOpacity key={i} style={styles.mobilityCard} activeOpacity={0.8}>
            <View style={styles.mobilityIconWrap}>
              <Text style={styles.programIcon}>{m.icon}</Text>
            </View>
            <View style={styles.programBody}>
              <Text style={styles.programTitle}>{m.title}</Text>
              <Text style={styles.programSub}>{m.sub}</Text>
              <View style={styles.pillRow}>
                <View style={styles.pill}><Text style={styles.pillText}>{m.dur}</Text></View>
                <View style={styles.pill}><Text style={styles.pillText}>{m.moves}</Text></View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: '#0B0F1A' },
  container: { flex: 1, maxWidth: 440, width: '100%', alignSelf: 'center' },
  content: { padding: 20, paddingBottom: 48 },

  heroSection: { marginBottom: 24, paddingTop: 4 },
  heroEyebrow: { fontSize: 11, color: '#475569', letterSpacing: 1.5, fontWeight: '600', marginBottom: 4 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#f1f5f9' },

  sectionTitle: { fontSize: 11, color: '#475569', fontWeight: '600', letterSpacing: 1.2, marginBottom: 12, textTransform: 'uppercase' },

  programCard: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1e2d40', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', gap: 12 },
  programIconWrap: { width: 46, height: 46, borderRadius: 12, backgroundColor: '#0d2a1a', alignItems: 'center', justifyContent: 'center' },
  mobilityCard: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1e2d40', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', gap: 12 },
  mobilityIconWrap: { width: 46, height: 46, borderRadius: 12, backgroundColor: '#1a1f35', alignItems: 'center', justifyContent: 'center' },
  programIcon: { fontSize: 22 },
  programBody: { flex: 1 },
  programTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 },
  programTitle: { fontSize: 14, fontWeight: '700', color: '#e2e8f0', flex: 1, marginRight: 8 },
  programMeta: { fontSize: 11, color: '#475569', fontWeight: '600' },
  programSub: { fontSize: 12, color: '#64748b', lineHeight: 17, marginBottom: 8 },
  badgeWrap: { backgroundColor: '#0d2a1a', borderWidth: 1, borderColor: '#166534', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, color: '#4ADE80', fontWeight: '700', letterSpacing: 0.5 },
  pillRow: { flexDirection: 'row', gap: 6 },
  pill: { backgroundColor: '#1a1f35', borderWidth: 1, borderColor: '#2a3550', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 },
  pillText: { fontSize: 10, color: '#94a3b8', fontWeight: '600' },
});