import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const NEON = "#39FF14";

type Option = {
  label: string;
  value: string;
};

type ChoiceQuestionProps = {
  title: string;
  value: string;
  options: Option[];
  onSelect: (value: string) => void;
};

export default function ChoiceQuestion({
  title,
  value,
  options,
  onSelect,
}: ChoiceQuestionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.options}>
        {options.map((option) => {
          const selected = value === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                selected && styles.selectedOption,
              ]}
              onPress={() => onSelect(option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  selected && styles.selectedText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 28,
    lineHeight: 34,
  },

  options: {
    gap: 12,
  },

  option: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#0a0a0a",
  },

  selectedOption: {
    borderColor: NEON,
    backgroundColor: "#0d1a06",
  },

  optionText: {
    color: "#aaa",
    fontSize: 16,
    fontWeight: "500",
  },

  selectedText: {
    color: NEON,
  },
});