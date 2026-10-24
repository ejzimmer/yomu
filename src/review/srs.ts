import type { SpacedRepetitionSystem } from '../api/types'

const STAGE_NAMES = [
  'Lesson',
  'Apprentice 1',
  'Apprentice 2',
  'Apprentice 3',
  'Apprentice 4',
  'Guru 1',
  'Guru 2',
  'Master',
  'Enlightened',
  'Burned',
]

export function getStageName(stage: number) {
  return STAGE_NAMES[stage] ?? `Stage ${stage}`
}

// WaniKani's own rule: a fully correct item goes up one stage. Otherwise it drops by
// half its wrong answers (rounded up), doubled from Guru upwards, never below the starting stage.
export function getNextStage(currentStage: number, incorrectAnswers: number, system: SpacedRepetitionSystem) {
  if (incorrectAnswers === 0) return Math.min(currentStage + 1, system.burning_stage_position)
  const penalty = currentStage >= system.passing_stage_position ? 2 : 1
  const drop = Math.ceil(incorrectAnswers / 2) * penalty
  return Math.max(currentStage - drop, system.starting_stage_position)
}
