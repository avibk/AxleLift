import React, { useState } from "react";
import { WorkoutSession, WorkoutExercise, TrainingSet } from "../types";
import { EXERCISE_DATABASE, getExerciseName } from "../utils/mockData";
import { calculateStimulusScore, calculateEffectiveReps, calculateEstimated1RM, getProgressionRecommendation } from "../utils/workoutMetrics";
import { Plus, Trash2, Save, Calendar, Clock, Dumbbell, Sparkles, CheckCircle2, History, RotateCcw, ChevronDown } from "lucide-react";

interface WorkoutLoggerProps {
  sessions: WorkoutSession[];
  onSaveSession: (session: WorkoutSession) => void;
}

// Typeable exercise picker: autocompletes known lifts and accepts custom free-text entries
function ExerciseCombobox({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [text, setText] = useState(getExerciseName(value));
  const [open, setOpen] = useState(false);

  React.useEffect(() => {
    setText(getExerciseName(value));
  }, [value]);

  const query = text.trim().toLowerCase();
  const matches = EXERCISE_DATABASE.filter((e) => e.name.toLowerCase().includes(query)).slice(0, 6);

  const commit = (raw: string) => {
    const t = raw.trim();
    const exact = EXERCISE_DATABASE.find((e) => e.name.toLowerCase() === t.toLowerCase());
    if (exact) onChange(exact.id);
    else if (t) onChange(`custom:${t}`);
    setOpen(false);
  };

  return (
    <div className="relative">
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => commit(text), 120)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        type="text"
        placeholder="Type an exercise (e.g. Barbell Squat)"
        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-violet-500"
      />
      {open && matches.length > 0 && (
        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl no-scrollbar">
          {matches.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(ex.id);
                setText(ex.name);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:bg-violet-500/10 hover:text-violet-300 transition-colors"
            >
              {ex.name}
              <span className="block text-[10px] text-neutral-500 font-mono">{ex.primaryMuscles.join(", ")}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WorkoutLoggerScreen({ sessions, onSaveSession }: WorkoutLoggerProps) {
  // Session form state
  const [sessionName, setSessionName] = useState<string>("Evidence-Based Session");
  const [sessionNotes, setSessionNotes] = useState<string>("");
  const [showNotesInput, setShowNotesInput] = useState<boolean>(false);
  const [draftNotes, setDraftNotes] = useState<string>("");
  const [archivesOpen, setArchivesOpen] = useState<boolean>(true);
  const [duration, setDuration] = useState<number>(45);
  const [logs, setLogs] = useState<WorkoutExercise[]>([
    {
      id: "we-active-1",
      exerciseId: "ex-bench-press",
      sets: [
        { id: "set-active-1-1", weight: 0, reps: 0, rir: 2, restTime: 0 }
      ]
    }
  ]);

  // Handle active exercise selection change
  const handleExerciseChange = (workExId: string, value: string) => {
    setLogs(logs.map(log => log.id === workExId ? { ...log, exerciseId: value } : log));
  };

  // Add a new exercise to logged workout
  const addNewExercise = () => {
    const nextId = `we-active-${logs.length + 1}`;
    setLogs([
      ...logs,
      {
        id: nextId,
        exerciseId: EXERCISE_DATABASE[0].id,
        sets: [{ id: `set-active-${nextId}-1`, weight: 0, reps: 0, rir: 2, restTime: 0 }]
      }
    ]);
  };

  // Remove exercise from logged workout
  const removeExercise = (workExId: string) => {
    setLogs(logs.filter(log => log.id !== workExId));
  };

  // Add set to a specific active exercise
  const addSetToExercise = (workExId: string) => {
    setLogs(logs.map(log => {
      if (log.id === workExId) {
        const lastSet = log.sets[log.sets.length - 1];
        const nextSetId = `set-active-${workExId}-${log.sets.length + 1}`;
        return {
          ...log,
          sets: [
            ...log.sets,
            {
              id: nextSetId,
              weight: lastSet ? lastSet.weight : 50,
              reps: lastSet ? lastSet.reps : 10,
              rir: lastSet ? lastSet.rir : 2,
              restTime: lastSet ? lastSet.restTime : 90
            }
          ]
        };
      }
      return log;
    }));
  };

  // Remove set from specific active exercise
  const removeSetFromExercise = (workExId: string, setId: string) => {
    setLogs(logs.map(log => {
      if (log.id === workExId) {
        return {
          ...log,
          sets: log.sets.filter(s => s.id !== setId)
        };
      }
      return log;
    }));
  };

  // Update a specific set parameter
  const updateSetField = (workExId: string, setId: string, field: keyof TrainingSet, value: number) => {
    setLogs(logs.map(log => {
      if (log.id === workExId) {
        return {
          ...log,
          sets: log.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
        };
      }
      return log;
    }));
  };

  // Reset logger interface
  const resetLogger = () => {
    setSessionName("Evidence-Based Session");
    setSessionNotes("");
    setShowNotesInput(false);
    setDraftNotes("");
    setDuration(45);
    setLogs([
      {
        id: "we-active-1",
        exerciseId: "ex-bench-press",
        sets: [{ id: "set-active-1-1", weight: 0, reps: 0, rir: 2, restTime: 0 }]
      }
    ]);
  };

  // Trigger save
  const handleSave = () => {
    if (logs.length === 0 || logs.every(log => log.sets.length === 0)) {
      alert("Please log at least one completed set!");
      return;
    }

    // Process set stimulus fields and estimated 1RM before saving
    const finalExercises = logs.map(log => ({
      ...log,
      sets: log.sets.map(set => ({
        ...set,
        stimulusScore: calculateStimulusScore(set.rir, set.reps),
        effectiveReps: calculateEffectiveReps(set.rir, set.reps),
        estimated1RM: calculateEstimated1RM(set.weight, set.reps)
      }))
    }));

    const newSession: WorkoutSession = {
      id: `session-log-${Date.now()}`,
      name: sessionName || "Evidence-Based Workout",
      timestamp: Date.now(),
      durationMinutes: duration,
      notes: sessionNotes,
      exercises: finalExercises
    };

    onSaveSession(newSession);
    resetLogger();
    alert("Workout successfully archived! Weekly muscle volume updated.");
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Active Workout Logger Column (Takes 2/3) */}
      <div className="space-y-5">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-violet-400" />
                Gym Session
              </h2>
              <p className="text-xs text-neutral-400">
                Log weight and reps. Adjust Reps In Reserve (RIR) to calculate dynamic tension metrics.
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={resetLogger}
                className="px-3.5 py-1.5 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-neutral-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
              >
                <Save className="w-3.5 h-3.5" />
                Submit Session
              </button>
            </div>
          </div>

          {/* Metadata Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pb-6 border-b border-neutral-800">
            <div>
              <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Session Protocol Name</label>
              <input 
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                type="text"
                placeholder="e.g. Upper Chest Specialization"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/70"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Duration minutes</label>
              <input 
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                type="number"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/70"
              />
            </div>
          </div>

          {/* Active Exercises List */}
          <div className="space-y-6">
            {logs.map((log, logIdx) => {
              const activeExerciseId = log.exerciseId;
              const exerciseDef = EXERCISE_DATABASE.find(e => e.id === activeExerciseId);
              // Get active progression recommendation for this exercise
              const progressionRec = getProgressionRecommendation(activeExerciseId, sessions);

              return (
                <div key={log.id} className="bg-neutral-950/70 border border-neutral-800 rounded-xl p-4 space-y-4">
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex-1 max-w-sm">
                      <ExerciseCombobox
                        value={log.exerciseId}
                        onChange={(id) => handleExerciseChange(log.id, id)}
                      />
                    </div>
                    <button 
                      onClick={() => removeExercise(log.id)}
                      className="p-1.5 hover:bg-rose-500/10 text-neutral-500 hover:text-rose-400 rounded-md transition-all"
                      title="Remove exercise"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Active Progression Overlay Hint */}
                  {progressionRec && progressionRec.originalWeight > 0 && (
                    <div className="p-2.5 bg-violet-950/20 border border-violet-500/20 rounded-lg text-xs flex gap-2 items-start">
                      <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] text-neutral-300">
                          <span className="font-bold text-violet-400">Overload Target: </span>
                          Aim for <span className="font-bold">{progressionRec.targetWeight}kg x {progressionRec.targetRepsRange}</span> based on your previous session performance of {progressionRec.originalWeight}kg x {progressionRec.originalReps}.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Sets (mobile stacked cards) */}
                  <div className="space-y-3">
                    {log.sets.map((set, setIdx) => {
                      const estimated1RMVal = calculateEstimated1RM(set.weight, set.reps);
                      const stimulusVal = calculateStimulusScore(set.rir, set.reps);

                      return (
                        <div key={set.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2.5">
                            <span className="text-xs font-bold text-white font-mono">Set {setIdx + 1}</span>
                            <button
                              onClick={() => removeSetFromExercise(log.id, set.id)}
                              className="text-neutral-500 hover:text-rose-400 disabled:opacity-30 p-1"
                              disabled={log.sets.length <= 1}
                              title="Delete set"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-4 gap-2">
                            <div>
                              <label className="block text-[9px] font-mono text-neutral-500 uppercase mb-1 text-center">KG</label>
                              <input
                                type="number"
                                inputMode="decimal"
                                value={set.weight || ""}
                                onChange={(e) => updateSetField(log.id, set.id, "weight", parseFloat(e.target.value) || 0)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-1 text-sm text-white text-center font-mono focus:outline-none focus:border-violet-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-mono text-neutral-500 uppercase mb-1 text-center">Reps</label>
                              <input
                                type="number"
                                inputMode="numeric"
                                value={set.reps || ""}
                                onChange={(e) => updateSetField(log.id, set.id, "reps", parseInt(e.target.value) || 0)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-1 text-sm text-white text-center font-mono focus:outline-none focus:border-violet-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-mono text-neutral-500 uppercase mb-1 text-center">RIR</label>
                              <select
                                value={set.rir}
                                onChange={(e) => updateSetField(log.id, set.id, "rir", parseInt(e.target.value))}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-1 text-sm text-white text-center font-mono focus:outline-none focus:border-violet-500"
                              >
                                <option value={0}>0</option>
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                                <option value={4}>4</option>
                                <option value={5}>5+</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[9px] font-mono text-neutral-500 uppercase mb-1 text-center">Rest</label>
                              <input
                                type="number"
                                inputMode="numeric"
                                value={set.restTime || ""}
                                placeholder="sec"
                                onChange={(e) => updateSetField(log.id, set.id, "restTime", parseInt(e.target.value) || 0)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-1 text-sm text-white text-center font-mono placeholder:text-neutral-600 focus:outline-none focus:border-violet-500"
                              />
                            </div>
                          </div>

                          {set.weight > 0 && set.reps > 0 && (
                            <div className="flex items-center gap-3 mt-2.5 text-[10px] font-mono">
                              <span className="text-violet-400 font-bold">STIM {stimulusVal}</span>
                              <span className="text-neutral-400">1RM {estimated1RMVal}kg</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button 
                    onClick={() => addSetToExercise(log.id)}
                    className="w-full py-1.5 bg-neutral-900 hover:bg-neutral-800 text-[11px] text-neutral-300 font-mono rounded-lg border border-neutral-800 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Set
                  </button>
                </div>
              );
            })}
          </div>

          <button 
            onClick={addNewExercise}
            className="w-full py-3 bg-neutral-950 hover:bg-neutral-900 border border-dashed border-neutral-800 hover:border-violet-500/40 text-xs text-neutral-400 hover:text-violet-400 font-sans rounded-xl mt-6 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add more
          </button>
        </div>

        {/* Notes */}
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
          <label className="block text-sm font-bold text-white mb-3 text-center">Notes</label>
          {showNotesInput ? (
            <div className="space-y-3">
              <textarea
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                rows={3}
                autoFocus
                placeholder="Write your notes here"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/70 font-sans leading-relaxed"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { setDraftNotes(sessionNotes); setShowNotesInput(false); }}
                  className="px-4 py-1.5 border border-neutral-700 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setSessionNotes(draftNotes); setShowNotesInput(false); }}
                  className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-100 rounded-xl text-xs font-semibold transition-all"
                >
                  Save
                </button>
              </div>
            </div>
          ) : sessionNotes ? (
            <button
              onClick={() => { setDraftNotes(sessionNotes); setShowNotesInput(true); }}
              className="w-full text-left bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-xl px-4 py-3 text-sm text-neutral-300 leading-relaxed transition-all"
            >
              {sessionNotes}
            </button>
          ) : (
            <button
              onClick={() => { setDraftNotes(""); setShowNotesInput(true); }}
              className="w-full py-3 bg-neutral-950 hover:bg-neutral-900 border border-dashed border-neutral-800 hover:border-violet-500/40 text-xs text-neutral-400 hover:text-violet-400 font-sans rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              title="Add notes"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Completed Session Archives (Takes 1/3) */}
      <div className="space-y-6">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
          <button
            onClick={() => setArchivesOpen((v) => !v)}
            className="w-full flex items-center justify-between mb-4 cursor-pointer"
          >
            <h3 className="text-sm font-semibold tracking-wider font-mono text-neutral-300 uppercase flex items-center gap-2">
              <History className="w-4 h-4 text-violet-400" />
              Session Archives
            </h3>
            <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${archivesOpen ? "" : "-rotate-90"}`} />
          </button>

          {archivesOpen && (
          <div className="space-y-4 max-h-[750px] overflow-y-auto pr-1">
            {sessions.length === 0 ? (
              <div className="text-center py-8 bg-neutral-950 rounded-xl border border-neutral-800">
                <p className="text-xs text-neutral-500">No sessions logged yet.</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500/2 rounded-full blur-xl" />
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-white leading-relaxed">{session.name}</h4>
                      <div className="flex items-center gap-3 text-[10px] text-neutral-500 font-mono mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(session.timestamp).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {session.durationMinutes} min
                        </span>
                      </div>
                    </div>
                  </div>

                  {session.notes && (
                    <p className="text-[10px] text-neutral-400 italic bg-neutral-900/60 p-2 rounded border border-neutral-800/60 leading-normal">
                      "{session.notes}"
                    </p>
                  )}

                  {/* Summary lists */}
                  <div className="space-y-1 pt-2 border-t border-neutral-800/60">
                    {session.exercises.map((we, idx) => {
                      const repsLogged = we.sets.filter(s => s.reps > 0);
                      const totalSets = repsLogged.length;
                      const maxWeight = Math.max(...repsLogged.map(s => s.weight), 0);
                      return (
                        <div key={we.id} className="flex justify-between text-[11px] font-mono text-neutral-400">
                          <span className="truncate max-w-[120px] text-neutral-200">
                            {getExerciseName(we.exerciseId)}
                          </span>
                          <span>
                            {totalSets} Sets x {maxWeight}kg Max
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
