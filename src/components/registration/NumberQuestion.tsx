import { StyleSheet, Text, TextInput, View } from "react-native";

type NumberQuestionProps = {
  title: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export default function NumberQuestion({
  title,
  placeholder,
  value,
  onChange,
}: NumberQuestionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#666"
        keyboardType="numeric"
        value={value}
        onChangeText={onChange}
      />
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

  input: {
    backgroundColor: "#0a0a0a",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 14,
    color: "#fff",
    padding: 16,
    fontSize: 18,
  },
});