import { useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

import AccountStep from "./AccountStep";
import ChoiceQuestion from "./ChoiceQuestion";
import InjuryQuestion from "./InjuryQuestion";
import NumberQuestion from "./NumberQuestion";
import ProgressBar from "./ProgressBar";

import { REGISTRATION_STEPS } from "./questions";
import type { RegistrationData } from "./types";

const NEON = "#39FF14";

const INITIAL_DATA: RegistrationData = {
  primary_goal: "",
  fitness_level: "",
  workout_location: "",
  biological_sex: "",

  age: "",
  height_cm: "",
  weight_kg: "",
  target_weight_kg: "",

  activity_level: "",

  has_knee_injury: false,
  has_back_injury: false,
  has_shoulder_injury: false,

  first_name: "",
  last_name: "",
  username: "",
  password: "",

  role: "parent",
};

// Convert TextInput strings into the types expected by Django
const buildRegistrationPayload = (form: RegistrationData) => ({
  ...form,
  age: form.age ? parseInt(form.age, 10) : null,
  height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
  weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
  target_weight_kg: form.target_weight_kg ? parseFloat(form.target_weight_kg) : null,
});

type RegistrationQuestionnaireProps = {
  onComplete: (payload: ReturnType<typeof buildRegistrationPayload>) => Promise<void>;
};

export default function RegistrationQuestionnaire({ onComplete }: RegistrationQuestionnaireProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<RegistrationData>(INITIAL_DATA);

  const currentStep = REGISTRATION_STEPS[step];
  const isLastStep = step === REGISTRATION_STEPS.length - 1;

  const updateField = <K extends keyof RegistrationData>(
    field: K,
    value: RegistrationData[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleInjury = (field: "has_knee_injury" | "has_back_injury" | "has_shoulder_injury") => {
    updateField(field, !form[field]);
  };

  const canContinue = () => {
    switch (currentStep.type) {
      case "choice":
        return form[currentStep.key] !== "";
      case "number":
        return form[currentStep.key] !== "";
      case "injuries":
        return true;
      case "account":
        return (
          form.first_name.trim() !== "" &&
          form.username.trim() !== "" &&
          form.password.trim() !== ""
        );
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (!isLastStep) {
      setStep((s) => s + 1);
      return;
    }
    setLoading(true);
    try {
      await onComplete(buildRegistrationPayload(form));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ProgressBar currentStep={step} totalSteps={REGISTRATION_STEPS.length} />

      <View style={styles.content}>
        {currentStep.type === "choice" && (
          <ChoiceQuestion
            title={currentStep.title}
            value={form[currentStep.key]}
            options={currentStep.options}
            onSelect={(value) => updateField(currentStep.key, value)}
          />
        )}

        {currentStep.type === "number" && (
          <NumberQuestion
            title={currentStep.title}
            placeholder={currentStep.placeholder}
            value={form[currentStep.key]}
            onChange={(value) => updateField(currentStep.key, value)}
          />
        )}

        {currentStep.type === "account" && (
          <AccountStep
            form={{
              first_name: form.first_name,
              last_name: form.last_name,
              username: form.username,
              password: form.password,
            }}
            onChange={updateField}
          />
        )}

        {currentStep.type === "injuries" && (
          <InjuryQuestion
            title={currentStep.title}
            hasKneeInjury={form.has_knee_injury}
            hasBackInjury={form.has_back_injury}
            hasShoulderInjury={form.has_shoulder_injury}
            onToggle={toggleInjury}
          />
        )}
      </View>

      <View style={styles.footer}>
        {step > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={() => setStep(step - 1)}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.nextButton, !canContinue() && styles.disabledButton]}
          disabled={!canContinue() || loading}
          onPress={handleNext}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.nextText}>{isLastStep ? "Finish" : "Next"}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 24 },
  content: { flex: 1, justifyContent: "center" },
  footer: { flexDirection: "row", gap: 12, marginBottom: 16 },
  backButton: {
    flex: 1, borderWidth: 1, borderColor: "#333",
    borderRadius: 14, padding: 16, alignItems: "center",
  },
  backText: { color: "#aaa", fontWeight: "600" },
  nextButton: { flex: 2, backgroundColor: NEON, borderRadius: 14, padding: 16, alignItems: "center" },
  disabledButton: { backgroundColor: "#1b3f12" },
  nextText: { color: "#000", fontWeight: "700", fontSize: 16 },
});