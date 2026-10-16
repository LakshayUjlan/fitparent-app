import { StyleSheet, Text, TextInput, View } from "react-native";

type FormData = {
  first_name: string;
  last_name: string;
  username: string;
  password: string;
};

type AccountStepProps = {
  form: FormData;
  onChange: (field: keyof FormData, value: string) => void;
};

export default function AccountStep({
  form,
  onChange,
}: AccountStepProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Account</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={form.first_name}
        onChangeText={(text) => onChange("first_name", text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={form.last_name}
        onChangeText={(text) => onChange("last_name", text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={form.username}
        onChangeText={(text) => onChange("username", text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={form.password}
        onChangeText={(text) => onChange("password", text)}
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
  },

  input: {
    backgroundColor: "#0a0a0a",
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 14,
    color: "#fff",
    padding: 16,
    fontSize: 16,
    marginBottom: 14,
  },
});