import type { StudyItem } from '../data/studyItem'

export const MAX_LESSONS_PER_DAY = 15

export function getLessonBatch(queue: readonly StudyItem[], batchSize: number, startedToday: number) {
  return queue.slice(0, Math.min(batchSize, countLessonsLeftToday(queue, startedToday)))
}

export function countLessonsLeftToday(queue: readonly StudyItem[], startedToday: number) {
  return Math.min(queue.length, Math.max(MAX_LESSONS_PER_DAY - startedToday, 0))
}
