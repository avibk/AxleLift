import { useEffect, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { EXERCISE_DATABASE, getExerciseName } from "@/src/utils/mockData";
import { colors } from "@/lib/colors";

interface ExerciseComboboxProps {
  value: string;
  onChange: (id: string) => void;
}

/** Typeable exercise picker: autocompletes known lifts, accepts custom entries. */
export function ExerciseCombobox({ value, onChange }: ExerciseComboboxProps) {
  const [text, setText] = useState(() => getExerciseName(value));
  const [open, setOpen] = useState(false);
  const skipBlurCommit = useRef(false);

  useEffect(() => {
    setText(getExerciseName(value));
  }, [value]);

  const query = text.trim().toLowerCase();
  const matches = EXERCISE_DATABASE.filter((e) => e.name.toLowerCase().includes(query)).slice(0, 6);

  const commit = (raw: string) => {
    const trimmed = raw.trim();
    const exact = EXERCISE_DATABASE.find((e) => e.name.toLowerCase() === trimmed.toLowerCase());
    if (exact) onChange(exact.id);
    else if (trimmed) onChange(`custom:${trimmed}`);
    setOpen(false);
  };

  const handleSelect = (id: string, name: string) => {
    skipBlurCommit.current = true;
    onChange(id);
    setText(name);
    setOpen(false);
  };

  return (
    <View className="relative">
      <TextInput
        value={text}
        onChangeText={(next) => {
          setText(next);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          if (skipBlurCommit.current) {
            skipBlurCommit.current = false;
            return;
          }
          commit(text);
        }}
        placeholder="Type an exercise (e.g. Barbell Squat)"
        placeholderTextColor={colors.textFaint}
        className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm font-semibold text-white"
      />
      {open && matches.length > 0 ? (
        <View className="absolute left-0 right-0 top-[52px] z-20 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
          {matches.map((ex) => (
            <Pressable
              key={ex.id}
              onPress={() => handleSelect(ex.id, ex.name)}
              className="border-b border-neutral-800/60 px-3 py-2.5 active:bg-brand-500/10"
            >
              <Text className="text-xs text-neutral-100">{ex.name}</Text>
              <Text className="text-[10px] text-neutral-500">{ex.primaryMuscles.join(", ")}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
