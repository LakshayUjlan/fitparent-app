import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const NEON = "#39FF14";

type InjuryQuestionProps = {
  title: string;
  hasKneeInjury: boolean;
  hasBackInjury: boolean;
  hasShoulderInjury: boolean;
  onToggle: (field: "has_knee_injury" | "has_back_injury" | "has_shoulder_injury") => void;
};

const INJURY_OPTIONS = [
  { label: "Knee Injury", key: "has_knee_injury" as const },
  { label: "Back Injury", key: "has_back_injury" as const },
  { label: "Shoulder Injury", key: "has_shoulder_injury" as const },
];

export default function InjuryQuestion({
  title,
  hasKneeInjury,
  hasBackInjury,
  hasShoulderInjury,
  onToggle,
}: InjuryQuestionProps) {
  const values: Record<string, boolean> = {
    has_knee_injury: hasKneeInjury,
    has_back_injury: hasBackInjury,
    has_shoulder_injury: hasShoulderInjury,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.options}>
        {INJURY_OPTIONS.map((item) => {
          const selected = values[item.key];
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.option, selected && styles.selectedOption]}
              onPress={() => onToggle(item.key)}
            >
              <Text style={[styles.optionText, selected && styles.selectedText]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.helper}>Leave everything unselected if none apply.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  title: { color: "#fff", fontSize: 28, fontWeight: "700", marginBottom: 28, lineHeight: 34 },
  options: { gap: 12 },
  option: {
    padding: 16, borderRadius: 14, borderWidth: 1,
    borderColor: "#333", backgroundColor: "#0a0a0a",
  },
  selectedOption: { borderColor: NEON, backgroundColor: "#0d1a06" },
  optionText: { color: "#aaa", fontSize: 16, fontWeight: "500" },
  selectedText: { color: NEON, fontWeight: "600" },
  helper: { color: "#666", marginTop: 12 },
});