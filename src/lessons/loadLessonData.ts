import type { Resource, Subject } from '../api/types'
import { db } from '../data/db'
import { getSynonymsBySubject } from '../data/getSynonymsBySubject'
import type { StudyItem } from '../data/studyItem'
import { buildLessonQueue } from './buildLessonQueue'
import { countLessonsStartedToday } from './countLessonsStartedToday'
import { countLessonsLeftToday, getLessonBatch } from './getLessonBatch'

export interface LessonData {
  batch: StudyItem[]
  subjectsById: Map<number, Resource<Subject>>
  synonymsBySubject: Map<number, string[]>
  voiceActorId: number | null
}

export async function loadLessonData(): Promise<LessonData> {
  const [{ user, queue, startedToday, subjectsById }, studyMaterials] = await Promise.all([
    loadLessonQueue(),
    db.studyMaterials.toArray(),
  ])

  return {
    batch: user ? getLessonBatch(queue, user.preferences.lessons_batch_size, startedToday) : [],
    subjectsById,
    synonymsBySubject: getSynonymsBySubject(studyMaterials),
    voiceActorId: user?.preferences.default_voice_actor_id ?? null,
  }
}

export async function countAvailableLessons() {
  const { queue, startedToday } = await loadLessonQueue()
  return countLessonsLeftToday(queue, startedToday)
}

async function loadLessonQueue() {
  const [stored, assignments, subjects] = await Promise.all([db.user.get('me'), db.assignments.toArray(), db.subjects.toArray()])
  const subjectsById = new Map(subjects.map((subject) => [subject.id, subject]))
  const user = stored?.user ?? null

  return {
    user,
    queue: user ? buildLessonQueue(assignments, subjectsById, user) : [],
    startedToday: countLessonsStartedToday(assignments, Temporal.Now.zonedDateTimeISO()),
    subjectsById,
  }
}
