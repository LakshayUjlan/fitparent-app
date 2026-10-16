export interface RegistrationData {
  primary_goal: string;
  fitness_level: string;
  workout_location: string;
  biological_sex: string;

  age: string;
  height_cm: string;
  weight_kg: string;
  target_weight_kg: string;

  activity_level: string;

  has_knee_injury: boolean;
  has_back_injury: boolean;
  has_shoulder_injury: boolean;

  first_name: string;
  last_name: string;
  username: string;
  password: string;

  role: "parent" | "family"; // Changed from "parent" to match a standard user profile
}

export interface Option {
  label: string;
  value: string;
}

export type ChoiceStep = {
  key:
    | "primary_goal"
    | "fitness_level"
    | "workout_location"
    | "biological_sex"
    | "activity_level";
  type: "choice";
  title: string;
  options: Option[];
};

export type NumberStep = {
  key:
    | "age"
    | "height_cm"
    | "weight_kg"
    | "target_weight_kg";
  type: "number";
  title: string;
  placeholder: string;
};

export type InjuryStep = {
  key: "injuries";
  type: "injuries";
  title: string;
};

export type AccountStep = {
  key: "account";
  type: "account";
  title: string;
};

export type RegistrationStep =
  | ChoiceStep
  | NumberStep
  | InjuryStep
  | AccountStep;