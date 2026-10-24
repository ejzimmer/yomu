import type { Assignment, Resource, Subject, User } from '../api/types'
import { isSubjectAvailable } from '../data/availability'

export interface ReviewItem {
  assignment: Resource<Assignment>
  subject: Resource<Subject>
}

// Everything due now, in the order the user's WaniKani preferences ask for.
export function buildReviewQueue(
  assignments: readonly Resource<Assignment>[],
  subjects: ReadonlyMap<number, Resource<Subject>>,
  user: User,
  now: Temporal.Instant,
  random: () => number = Math.random,
): ReviewItem[] {
  const items: ReviewItem[] = []
  for (const assignment of assignments) {
    const subject = subjects.get(assignment.data.subject_id)
    if (subject && isDue(assignment.data, now) && isSubjectAvailable(subject, user)) items.push({ assignment, subject })
  }

  const shuffled = shuffle(items, random)
  if (user.preferences.reviews_presentation_order === 'lower_levels_first') {
    return shuffled.toSorted((a, b) => a.subject.data.level - b.subject.data.level)
  }
  return shuffled
}

function isDue(assignment: Assignment, now: Temporal.Instant) {
  return (
    !assignment.hidden &&
    assignment.burned_at === null &&
    assignment.srs_stage > 0 &&
    assignment.available_at !== null &&
    Temporal.Instant.compare(assignment.available_at, now) <= 0
  )
}

function shuffle<T>(items: readonly T[], random: () => number) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
