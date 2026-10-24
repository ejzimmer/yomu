import type { Resource, Subject } from '../api/types'
import { db } from '../data/db'
import { getSynonymsBySubject } from '../data/getSynonymsBySubject'
import type { StudyItem } from '../data/studyItem'
import { buildLessonQueue } from './buildLessonQueue'
import { countLessonsLeftToday, countLessonsStartedToday, getLessonBatch } from './getLessonBatch'

export interface LessonData {
  batch: StudyItem[]
  subjectsById: Map<number, Resource<Subject>>
  synonymsBySubject: Map<number, string[]>
  voiceActorId: number | null
}

export async function loadLessonData(): Promise<LessonData> {
  const [stored, assignments, subjects, studyMaterials] = await Promise.all([
    db.user.get('me'),
    db.assignments.toArray(),
    db.subjects.toArray(),
    db.studyMaterials.toArray(),
  ])
  const subjectsById = new Map(subjects.map((subject) => [subject.id, subject]))
  const synonymsBySubject = getSynonymsBySubject(studyMaterials)
  if (!stored) return { batch: [], subjectsById, synonymsBySubject, voiceActorId: null }

  const { user } = stored
  const queue = buildLessonQueue(assignments, subjectsById, user)
  const startedToday = countLessonsStartedToday(assignments, Temporal.Now.zonedDateTimeISO())

  return {
    batch: getLessonBatch(queue, user.preferences.lessons_batch_size, startedToday),
    subjectsById,
    synonymsBySubject,
    voiceActorId: user.preferences.default_voice_actor_id,
  }
}

export async function countAvailableLessons() {
  const [stored, assignments, subjects] = await Promise.all([db.user.get('me'), db.assignments.toArray(), db.subjects.toArray()])
  if (!stored) return 0

  const subjectsById = new Map(subjects.map((subject) => [subject.id, subject]))
  const queue = buildLessonQueue(assignments, subjectsById, stored.user)
  return countLessonsLeftToday(queue, countLessonsStartedToday(assignments, Temporal.Now.zonedDateTimeISO()))
}
