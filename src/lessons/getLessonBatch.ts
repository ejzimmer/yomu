import type { Assignment, Resource } from '../api/types'
import type { StudyItem } from '../data/studyItem'

export const MAX_LESSONS_PER_DAY = 15

export function getLessonBatch(queue: readonly StudyItem[], batchSize: number, startedToday: number) {
  return queue.slice(0, Math.min(batchSize, countLessonsLeftToday(queue, startedToday)))
}

export function countLessonsLeftToday(queue: readonly StudyItem[], startedToday: number) {
  return Math.min(queue.length, Math.max(MAX_LESSONS_PER_DAY - startedToday, 0))
}

export function countLessonsStartedToday(assignments: readonly Resource<Assignment>[], now: Temporal.ZonedDateTime) {
  const today = now.toPlainDate()
  return assignments.filter(({ data }) => {
    if (data.started_at === null) return false
    return Temporal.Instant.from(data.started_at).toZonedDateTimeISO(now.timeZoneId).toPlainDate().equals(today)
  }).length
}
