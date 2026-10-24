import type { SpacedRepetitionSystem } from '../api/types'
import { db } from '../data/db'
import { getSynonymsBySubject } from '../data/getSynonymsBySubject'
import type { StudyItem } from '../data/studyItem'
import { buildReviewQueue } from './buildReviewQueue'

export interface ReviewData {
  queue: StudyItem[]
  synonymsBySubject: Map<number, string[]>
  srsSystems: Map<number, SpacedRepetitionSystem>
}

export async function loadReviewData(): Promise<ReviewData> {
  const [stored, assignments, subjects, studyMaterials, srsSystems] = await Promise.all([
    db.user.get('me'),
    db.assignments.toArray(),
    db.subjects.toArray(),
    db.studyMaterials.toArray(),
    db.spacedRepetitionSystems.toArray(),
  ])
  if (!stored) return { queue: [], synonymsBySubject: new Map(), srsSystems: new Map() }

  const subjectsById = new Map(subjects.map((subject) => [subject.id, subject]))
  return {
    queue: buildReviewQueue(assignments, subjectsById, stored.user, Temporal.Now.instant()),
    synonymsBySubject: getSynonymsBySubject(studyMaterials),
    srsSystems: new Map(srsSystems.map((system) => [system.id, system.data])),
  }
}

export async function countDueReviews() {
  const { queue } = await loadReviewData()
  return queue.length
}
