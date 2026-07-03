import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import {
  Calendar,
  ChevronDown,
  Clock,
  Dumbbell,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Modal } from "@/components/ui/Modal";
import { ExerciseCombobox } from "@/components/features/ExerciseCombobox";
import { useWorkout } from "@/contexts/WorkoutContext";
import { getExerciseName } from "@/src/data/exercises";
import {
  calculateEffectiveReps,
  calculateEstimated1RM,
  calculateStimulusScore,
  getProgressionRecommendation,
} from "@/src/utils/workoutMetrics";
import { TrainingSet, WorkoutExercise, WorkoutSession } from "@/src/types";
import { colors } from "@/lib/colors";

const RIR_OPTIONS = [0, 1, 2, 3, 4, 5];

export default function LoggerScreen() {
  const { sessions, saveSession } = useWorkout();

  const [sessionName, setSessionName] = useState("Evidence-Based Session");
  const [sessionNotes, setSessionNotes] = useState("");
  const [draftNotes, setDraftNotes] = useState("");
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [archivesOpen, setArchivesOpen] = useState(false);
  const [duration, setDuration] = useState(45);
  const [logs, setLogs] = useState<WorkoutExercise[]>([
    {
      id: "we-active-1",
      exerciseId: "ex-bench-press",
      sets: [{ id: "set-active-1-1", weight: 0, reps: 0, rir: 2, restTime: 0 }],
    },
  ]);

  const handleExerciseChange = (workExId: string, value: string) =>
    setLogs((prev) => prev.map((log) => (log.id === workExId ? { ...log, exerciseId: value } : log)));

  const addNewExercise = () => {
    const nextId = `we-active-${logs.length + 1}-${Date.now()}`;
    setLogs((prev) => [
      ...prev,
      {
        id: nextId,
        exerciseId: "ex-bench-press",
        sets: [{ id: `set-${nextId}-1`, weight: 0, reps: 0, rir: 2, restTime: 0 }],
      },
    ]);
  };

  const removeExercise = (workExId: string) =>
    setLogs((prev) => prev.filter((log) => log.id !== workExId));

  const addSetToExercise = (workExId: string) =>
    setLogs((prev) =>
      prev.map((log) => {
        if (log.id !== workExId) return log;
        const last = log.sets[log.sets.length - 1];
        return {
          ...log,
          sets: [
            ...log.sets,
            {
              id: `set-${workExId}-${log.sets.length + 1}-${Date.now()}`,
              weight: last ? last.weight : 0,
              reps: last ? last.reps : 0,
              rir: last ? last.rir : 2,
              restTime: last ? last.restTime : 0,
            },
          ],
        };
      })
    );

  const removeSetFromExercise = (workExId: string, setId: string) =>
    setLogs((prev) =>
      prev.map((log) =>
        log.id === workExId ? { ...log, sets: log.sets.filter((s) => s.id !== setId) } : log
      )
    );

  const updateSetField = (
    workExId: string,
    setId: string,
    field: keyof TrainingSet,
    value: number
  ) =>
    setLogs((prev) =>
      prev.map((log) =>
        log.id === workExId
          ? { ...log, sets: log.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)) }
          : log
      )
    );

  const resetLogger = () => {
    setSessionName("Evidence-Based Session");
    setSessionNotes("");
    setNotesModalOpen(false);
    setDraftNotes("");
    setDuration(45);
    setLogs([
      {
        id: "we-active-1",
        exerciseId: "ex-bench-press",
        sets: [{ id: "set-active-1-1", weight: 0, reps: 0, rir: 2, restTime: 0 }],
      },
    ]);
  };

  const handleSave = async () => {
    if (logs.length === 0 || logs.every((log) => log.sets.every((s) => s.reps === 0))) {
      Alert.alert("Nothing to save", "Log at least one completed set first.");
      return;
    }

    const finalExercises = logs.map((log) => ({
      ...log,
      sets: log.sets.map((set) => ({
        ...set,
        stimulusScore: calculateStimulusScore(set.rir, set.reps),
        effectiveReps: calculateEffectiveReps(set.rir, set.reps),
        estimated1RM: calculateEstimated1RM(set.weight, set.reps),
      })),
    }));

    const newSession: WorkoutSession = {
      id: `session-log-${Date.now()}`,
      name: sessionName || "Evidence-Based Workout",
      timestamp: Date.now(),
      durationMinutes: duration,
      notes: sessionNotes,
      exercises: finalExercises,
    };

    await saveSession(newSession);
    resetLogger();
    Alert.alert("Session saved", "Weekly muscle volume and ELO updated.");
  };

  return (
    <Screen>
      {/* Header */}
      <View className="mb-5 flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <View className="flex-row items-center gap-2">
            <Dumbbell size={22} color={colors.brand400} />
            <Text className="text-2xl font-bold tracking-tight text-white">Gym Session</Text>
          </View>
          <Text className="mt-1 text-xs text-neutral-400">
            Log weight and reps. Adjust RIR to compute tension metrics.
          </Text>
        </View>
      </View>

      {/* Action row */}
      <View className="mb-4 flex-row gap-2">
        <Pressable
          onPress={resetLogger}
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border border-neutral-800 py-2.5 active:bg-neutral-800"
        >
          <RotateCcw size={14} color={colors.textMuted} />
          <Text className="text-xs font-semibold text-neutral-300">Reset</Text>
        </Pressable>
        <Pressable
          onPress={handleSave}
          className="flex-[2] flex-row items-center justify-center gap-1.5 rounded-xl bg-brand-600 py-2.5 active:bg-brand-500"
        >
          <Save size={14} color={colors.white} />
          <Text className="text-xs font-bold text-white">Submit Session</Text>
        </Pressable>
      </View>

      {/* Metadata */}
      <View className="mb-4 gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
        <View>
          <Text className="mb-1 text-[10px] uppercase text-neutral-500">Session name</Text>
          <TextInput
            value={sessionName}
            onChangeText={setSessionName}
            placeholder="e.g. Upper Chest Specialization"
            placeholderTextColor={colors.textFaint}
            className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm text-white"
          />
        </View>
        <View>
          <Text className="mb-1 text-[10px] uppercase text-neutral-500">Duration (minutes)</Text>
          <TextInput
            value={duration ? String(duration) : ""}
            onChangeText={(v) => setDuration(parseInt(v, 10) || 0)}
            keyboardType="number-pad"
            placeholder="45"
            placeholderTextColor={colors.textFaint}
            className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm text-white"
          />
        </View>
      </View>

      {/* Exercises */}
      <View className="gap-4">
        {logs.map((log) => {
          const rec = getProgressionRecommendation(log.exerciseId, sessions);
          return (
            <View key={log.id} className="gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
              <View className="flex-row items-center gap-2">
                <View className="flex-1">
                  <ExerciseCombobox value={log.exerciseId} onChange={(id) => handleExerciseChange(log.id, id)} />
                </View>
                <Pressable
                  onPress={() => removeExercise(log.id)}
                  className="rounded-md p-1.5 active:bg-brand-500/10"
                >
                  <Trash2 size={16} color={colors.textFaint} />
                </Pressable>
              </View>

              {rec && rec.originalWeight > 0 ? (
                <View className="flex-row gap-2 rounded-xl border border-brand-500/20 bg-brand-500/5 p-2.5">
                  <Sparkles size={16} color={colors.brand400} />
                  <Text className="flex-1 text-[11px] leading-relaxed text-neutral-300">
                    <Text className="font-bold text-brand-400">Target: </Text>
                    {rec.targetWeight}kg x {rec.targetRepsRange} (last {rec.originalWeight}kg x{" "}
                    {rec.originalReps}).
                  </Text>
                </View>
              ) : null}

              <View className="gap-3">
                {log.sets.map((set, setIdx) => (
                  <View key={set.id} className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                    <View className="mb-2.5 flex-row items-center justify-between">
                      <Text className="text-xs font-bold text-white">Set {setIdx + 1}</Text>
                      <Pressable
                        onPress={() => removeSetFromExercise(log.id, set.id)}
                        disabled={log.sets.length <= 1}
                        className={log.sets.length <= 1 ? "opacity-30" : ""}
                      >
                        <Trash2 size={15} color={colors.textFaint} />
                      </Pressable>
                    </View>

                    <View className="flex-row gap-2">
                      <View className="flex-1">
                        <Text className="mb-1 text-center text-[9px] uppercase text-neutral-500">KG</Text>
                        <TextInput
                          value={set.weight ? String(set.weight) : ""}
                          onChangeText={(v) => updateSetField(log.id, set.id, "weight", parseFloat(v) || 0)}
                          keyboardType="decimal-pad"
                          className="rounded-lg border border-neutral-800 bg-neutral-900 px-1 py-2 text-center text-sm text-white"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="mb-1 text-center text-[9px] uppercase text-neutral-500">Reps</Text>
                        <TextInput
                          value={set.reps ? String(set.reps) : ""}
                          onChangeText={(v) => updateSetField(log.id, set.id, "reps", parseInt(v, 10) || 0)}
                          keyboardType="number-pad"
                          className="rounded-lg border border-neutral-800 bg-neutral-900 px-1 py-2 text-center text-sm text-white"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="mb-1 text-center text-[9px] uppercase text-neutral-500">Rest</Text>
                        <TextInput
                          value={set.restTime ? String(set.restTime) : ""}
                          onChangeText={(v) => updateSetField(log.id, set.id, "restTime", parseInt(v, 10) || 0)}
                          keyboardType="number-pad"
                          placeholder="sec"
                          placeholderTextColor={colors.textDim}
                          className="rounded-lg border border-neutral-800 bg-neutral-900 px-1 py-2 text-center text-sm text-white"
                        />
                      </View>
                    </View>

                    <Text className="mb-1 mt-3 text-[9px] uppercase text-neutral-500">RIR</Text>
                    <View className="flex-row gap-1.5">
                      {RIR_OPTIONS.map((r) => {
                        const active = set.rir === r;
                        return (
                          <Pressable
                            key={r}
                            onPress={() => updateSetField(log.id, set.id, "rir", r)}
                            className={`h-8 flex-1 items-center justify-center rounded-lg border ${
                              active ? "border-brand-500/40 bg-brand-500/15" : "border-neutral-800 bg-neutral-900"
                            }`}
                          >
                            <Text className={`text-xs ${active ? "text-brand-400" : "text-neutral-400"}`}>
                              {r === 5 ? "5+" : r}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    {set.weight > 0 && set.reps > 0 ? (
                      <View className="mt-2.5 flex-row items-center gap-3">
                        <Text className="text-[10px] font-bold text-brand-400">
                          STIM {calculateStimulusScore(set.rir, set.reps)}
                        </Text>
                        <Text className="text-[10px] text-neutral-400">
                          1RM {calculateEstimated1RM(set.weight, set.reps)}kg
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>

              <Pressable
                onPress={() => addSetToExercise(log.id)}
                className="flex-row items-center justify-center gap-1.5 rounded-lg border border-neutral-800 py-1.5 active:bg-neutral-800"
              >
                <Plus size={14} color={colors.textMuted} />
                <Text className="text-[11px] text-neutral-300">Add Set</Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      <Pressable
        onPress={addNewExercise}
        className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-800 py-3 active:bg-neutral-900"
      >
        <Plus size={16} color={colors.textMuted} />
        <Text className="text-xs text-neutral-400">Add more</Text>
      </Pressable>

      {/* Notes */}
      <View className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <Text className="mb-3 text-center text-sm font-bold text-white">Notes</Text>
        {sessionNotes ? (
          <Pressable
            onPress={() => {
              setDraftNotes(sessionNotes);
              setNotesModalOpen(true);
            }}
            className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 active:border-neutral-700"
          >
            <Text className="text-sm leading-relaxed text-neutral-300">{sessionNotes}</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => {
              setDraftNotes("");
              setNotesModalOpen(true);
            }}
            className="flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-800 py-3 active:bg-neutral-950"
          >
            <Plus size={16} color={colors.textMuted} />
            <Text className="text-xs text-neutral-400">Add notes</Text>
          </Pressable>
        )}
      </View>

      {/* Session Archives (closed by default) */}
      <View className="mt-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <Pressable
          onPress={() => setArchivesOpen((v) => !v)}
          className="flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-2">
            <Clock size={15} color={colors.brand400} />
            <Text className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Session Archives
            </Text>
          </View>
          <View style={{ transform: [{ rotate: archivesOpen ? "0deg" : "-90deg" }] }}>
            <ChevronDown size={16} color={colors.textFaint} />
          </View>
        </Pressable>

        {archivesOpen ? (
          <View className="mt-4 gap-4">
            {sessions.length === 0 ? (
              <View className="items-center rounded-xl border border-neutral-800 bg-neutral-950 py-8">
                <Text className="text-xs text-neutral-500">No sessions logged yet.</Text>
              </View>
            ) : (
              sessions.map((session) => (
                <View
                  key={session.id}
                  className="gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-4"
                >
                  <View>
                    <Text className="text-xs font-bold text-white">{session.name}</Text>
                    <View className="mt-0.5 flex-row items-center gap-3">
                      <View className="flex-row items-center gap-1">
                        <Calendar size={11} color={colors.textFaint} />
                        <Text className="text-[10px] text-neutral-500">
                          {new Date(session.timestamp).toLocaleDateString()}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Clock size={11} color={colors.textFaint} />
                        <Text className="text-[10px] text-neutral-500">{session.durationMinutes} min</Text>
                      </View>
                    </View>
                  </View>

                  {session.notes ? (
                    <Text className="rounded border border-neutral-800/60 bg-neutral-900/60 p-2 text-[10px] italic text-neutral-400">
                      "{session.notes}"
                    </Text>
                  ) : null}

                  <View className="gap-1 border-t border-neutral-800/60 pt-2">
                    {session.exercises.map((we) => {
                      const repsLogged = we.sets.filter((s) => s.reps > 0);
                      const maxWeight = Math.max(0, ...repsLogged.map((s) => s.weight));
                      return (
                        <View key={we.id} className="flex-row justify-between">
                          <Text className="flex-1 text-[11px] text-neutral-200" numberOfLines={1}>
                            {getExerciseName(we.exerciseId)}
                          </Text>
                          <Text className="text-[11px] text-neutral-400">
                            {repsLogged.length} Sets x {maxWeight}kg
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))
            )}
          </View>
        ) : null}
      </View>

      {/* Notes popup */}
      <Modal
        visible={notesModalOpen}
        onClose={() => {
          setDraftNotes(sessionNotes);
          setNotesModalOpen(false);
        }}
        title="Session Notes"
      >
        <TextInput
          value={draftNotes}
          onChangeText={setDraftNotes}
          multiline
          autoFocus
          placeholder="Write your notes here"
          placeholderTextColor={colors.textFaint}
          className="mb-4 h-28 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm leading-relaxed text-white"
          style={{ textAlignVertical: "top" }}
        />
        <View className="flex-row justify-end gap-2">
          <Pressable
            onPress={() => {
              setDraftNotes(sessionNotes);
              setNotesModalOpen(false);
            }}
            className="rounded-xl border border-neutral-700 px-4 py-2 active:bg-neutral-800"
          >
            <Text className="text-xs font-semibold text-neutral-300">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setSessionNotes(draftNotes);
              setNotesModalOpen(false);
            }}
            className="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 active:bg-neutral-700"
          >
            <Text className="text-xs font-semibold text-neutral-100">Save</Text>
          </Pressable>
        </View>
      </Modal>
    </Screen>
  );
}
