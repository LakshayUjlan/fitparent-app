import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getToken } from '../api';

const BASE_URL = 'http://localhost:8000/api';

export default function ScanScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [doneSets, setDoneSets] = useState<Record<string, boolean>>({});

  const pickImage = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) { Alert.alert('Permission needed', 'Please allow camera access'); return; }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.3 });
    if (!res.canceled) { setImage(res.assets[0].uri); setResult(null); setDoneSets({}); }
  };

  const pickFromGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.3 });
    if (!res.canceled) { setImage(res.assets[0].uri); setResult(null); setDoneSets({}); }
  };

  const scanImage = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('image', { uri: image, type: 'image/jpeg', name: 'scan.jpg' } as any);
      const res = await axios.post(`${BASE_URL}/workouts/scan-equipment/`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });
      setResult(res.data);
    } catch (e) {
      Alert.alert('Error', 'Could not scan image. Make sure Django is running.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSet = (exIdx: number, setIdx: number) => {
    const key = `${exIdx}-${setIdx}`;
    setDoneSets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={styles.outer}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <View style={styles.heroSection}>
          <Text style={styles.heroEyebrow}>YOLO + AI DETECTION</Text>
          <Text style={styles.heroTitle}>Scan your home</Text>
          <Text style={styles.heroSub}>Point your camera at your room — AI detects equipment and builds a workout just for you.</Text>
        </View>

        {!image && !result && (
          <View>
            <View style={styles.placeholderBox}>
              <Text style={styles.placeholderIcon}>📷</Text>
              <Text style={styles.placeholderText}>Camera feed will appear here</Text>
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={pickImage}>
              <Text style={styles.primaryBtnText}>Take photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={pickFromGallery}>
              <Text style={styles.secondaryBtnText}>Choose from gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        {image && !result && (
          <View>
            <Image source={{ uri: image }} style={styles.previewImage} />
            <TouchableOpacity style={styles.retakeBtn} onPress={() => { setImage(null); setResult(null); }}>
              <Text style={styles.retakeBtnText}>Retake photo</Text>
            </TouchableOpacity>
            {!loading && (
              <TouchableOpacity style={styles.primaryBtn} onPress={scanImage}>
                <Text style={styles.primaryBtnText}>Scan for equipment</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {loading && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#4ADE80" />
            <Text style={styles.loadingText}>Scanning your room...</Text>
            <Text style={styles.loadingSub}>YOLO is detecting equipment, then AI builds your workout</Text>
          </View>
        )}

        {result && (
          <View>
            <View style={styles.equipmentCard}>
              <View style={styles.cardHeader}>
                <View style={styles.dot} />
                <Text style={styles.cardHeaderText}>Equipment detected</Text>
              </View>
              <View style={styles.tagRow}>
                {result.detected_equipment.map((eq: string, i: number) => (
                  <View key={i} style={styles.tag}><Text style={styles.tagText}>{eq}</Text></View>
                ))}
              </View>
            </View>

            <Text style={styles.workoutTitle}>{result.workout.workout_title}</Text>

            {result.workout.exercises.map((ex: any, exIdx: number) => (
              <View key={exIdx} style={styles.exerciseCard}>
                <View style={styles.exTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exName}>{ex.name}</Text>
                    <Text style={styles.exInstruction}>{ex.instruction}</Text>
                    <Text style={styles.exEquipment}>Uses: {ex.equipment_used}</Text>
                  </View>
                  <View style={styles.repsBadge}>
                    <Text style={styles.repsBadgeText}>{ex.sets}×{ex.reps}</Text>
                  </View>
                </View>
                <View style={styles.modCard}>
                  <Text style={styles.modLabel}>Modification</Text>
                  <Text style={styles.modText}>{ex.modification}</Text>
                </View>
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

            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/pain' as any)}>
              <Text style={styles.primaryBtnText}>Finish & log pain</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => { setImage(null); setResult(null); }}>
              <Text style={styles.secondaryBtnText}>Scan a different room</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: '#0B0F1A' },
  container: { flex: 1, maxWidth: 440, width: '100%', alignSelf: 'center' },
  content: { padding: 20, paddingBottom: 48, flexGrow: 1 },

  heroSection: { marginBottom: 24, paddingTop: 4 },
  heroEyebrow: { fontSize: 11, color: '#475569', letterSpacing: 1.5, fontWeight: '600', marginBottom: 4 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#f1f5f9', marginBottom: 6 },
  heroSub: { fontSize: 14, color: '#64748b', lineHeight: 20 },

  placeholderBox: { width: '100%', height: 200, borderWidth: 1, borderColor: '#1e2d40', borderStyle: 'dashed', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 20, backgroundColor: '#111827' },
  placeholderIcon: { fontSize: 36, marginBottom: 8 },
  placeholderText: { fontSize: 13, color: '#475569' },

  previewImage: { width: '100%', height: 220, borderRadius: 16, marginBottom: 12 },
  retakeBtn: { alignItems: 'center', padding: 12, marginBottom: 8 },
  retakeBtnText: { color: '#64748b', fontSize: 13, fontWeight: '500' },

  loadingCard: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1e2d40', borderRadius: 16, padding: 32, alignItems: 'center', gap: 12 },
  loadingText: { color: '#f1f5f9', fontSize: 15, fontWeight: '700' },
  loadingSub: { color: '#64748b', fontSize: 12, textAlign: 'center' },

  equipmentCard: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1e2d40', borderRadius: 16, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#4ADE80' },
  cardHeaderText: { fontSize: 12, color: '#4ADE80', fontWeight: '700', letterSpacing: 0.5 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#0d2a1a', borderWidth: 1, borderColor: '#166534', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5 },
  tagText: { color: '#4ADE80', fontSize: 12, fontWeight: '600' },

  workoutTitle: { fontSize: 18, fontWeight: '700', color: '#f1f5f9', marginBottom: 14 },

  exerciseCard: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1e2d40', borderRadius: 16, padding: 16, marginBottom: 12 },
  exTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  exName: { fontSize: 15, fontWeight: '700', color: '#e2e8f0', marginBottom: 3 },
  exInstruction: { fontSize: 13, color: '#94a3b8', lineHeight: 18 },
  exEquipment: { fontSize: 11, color: '#475569', marginTop: 4, fontWeight: '500' },
  repsBadge: { backgroundColor: '#1a1f35', borderWidth: 1, borderColor: '#2a3550', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginLeft: 8 },
  repsBadgeText: { fontSize: 13, fontWeight: '700', color: '#94a3b8' },
  modCard: { borderLeftWidth: 2, borderLeftColor: '#4ADE80', paddingLeft: 10, marginBottom: 14 },
  modLabel: { fontSize: 10, color: '#4ADE80', fontWeight: '700', letterSpacing: 0.5, marginBottom: 3 },
  modText: { fontSize: 13, color: '#94a3b8', lineHeight: 18 },
  setsStack: { gap: 6, marginBottom: 8 },
  setRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#1e2d40', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, minHeight: 48 },
  setRowDone: { backgroundColor: '#4ADE80', borderColor: '#4ADE80' },
  setTitle: { fontSize: 13, fontWeight: '700', color: '#e2e8f0' },
  setTitleDone: { color: '#0B0F1A' },
  setSub: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  setSubDone: { color: '#0B0F1A' },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#2a3550', alignItems: 'center', justifyContent: 'center' },
  checkDone: { backgroundColor: '#0B0F1A', borderColor: '#0B0F1A' },
  checkMark: { color: '#4ADE80', fontSize: 12, fontWeight: '800' },
  restText: { fontSize: 11, color: '#475569', fontWeight: '500' },

  primaryBtn: { backgroundColor: '#4ADE80', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 10 },
  primaryBtnText: { color: '#0B0F1A', fontSize: 15, fontWeight: '800' },
  secondaryBtn: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1e2d40', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  secondaryBtnText: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
});