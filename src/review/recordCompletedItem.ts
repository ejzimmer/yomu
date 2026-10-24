import type { WaniKaniClient } from '../api/client'
import type { SpacedRepetitionSystem } from '../api/types'
import { getStageName } from './getStageName'
import { predictNextStage } from './predictNextStage'
import { queueReview } from './sendReviews'
import type { SessionItem } from './session'

export interface FeedEntry {
  id: number
  characters: string
  isUp: boolean
  stageName: string
}

// Queues the finished item's review for WaniKani and returns its line for the SRS feed.
export function recordCompletedItem(
  client: WaniKaniClient,
  item: SessionItem,
  srsSystems: ReadonlyMap<number, SpacedRepetitionSystem>,
): FeedEntry | null {
  void queueReview(client, {
    assignmentId: item.assignment.id,
    incorrectMeaningAnswers: item.incorrectMeaningAnswers,
    incorrectReadingAnswers: item.incorrectReadingAnswers,
  })

  const system = srsSystems.get(item.subject.data.spaced_repetition_system_id)
  if (!system) return null
  const currentStage = item.assignment.data.srs_stage
  const nextStage = predictNextStage(currentStage, item.incorrectMeaningAnswers + item.incorrectReadingAnswers, system)
  return {
    id: item.assignment.id,
    characters: item.subject.data.characters ?? item.subject.data.slug,
    isUp: nextStage > currentStage,
    stageName: getStageName(nextStage),
  }
}
