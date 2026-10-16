import {
    ACTIVITY_OPTIONS,
    FITNESS_OPTIONS,
    GOAL_OPTIONS,
    LOCATION_OPTIONS,
    SEX_OPTIONS,
} from "./constants";
import type { RegistrationStep } from "./types";

export const REGISTRATION_STEPS: RegistrationStep[] = [
  {
    key: "primary_goal",
    type: "choice",
    title: "What is your primary fitness goal?",
    options: GOAL_OPTIONS,
  },
  {
    key: "fitness_level",
    type: "choice",
    title: "How experienced are you with exercise?",
    options: FITNESS_OPTIONS,
  },
  {
    key: "workout_location",
    type: "choice",
    title: "Where will you usually work out?",
    options: LOCATION_OPTIONS,
  },
  {
    key: "biological_sex",
    type: "choice",
    title: "What is your biological sex?",
    options: SEX_OPTIONS,
  },
  {
    key: "age",
    type: "number",
    title: "How old are you?",
    placeholder: "e.g. 58",
  },
  {
    key: "height_cm",
    type: "number",
    title: "What is your height? (cm)",
    placeholder: "e.g. 170",
  },
  {
    key: "weight_kg",
    type: "number",
    title: "What is your current weight? (kg)",
    placeholder: "e.g. 78",
  },
  {
    key: "target_weight_kg",
    type: "number",
    title: "What is your target weight? (kg)",
    placeholder: "e.g. 70",
  },
  {
    key: "activity_level",
    type: "choice",
    title: "How active are you during a normal week?",
    options: ACTIVITY_OPTIONS,
  },
  {
    key: "injuries",
    type: "injuries",
    title: "Do you have any joint pain or injuries?",
  },
  {
    key: "account",
    type: "account",
    title: "Create your account",
  },
];