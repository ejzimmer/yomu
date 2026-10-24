import type { Assignment, Resource, Subject, User } from '../api/types'
import { isSubjectAvailable } from '../data/availability'
import { shuffle } from '../data/shuffle'
import type { StudyItem } from '../data/studyItem'

export function buildReviewQueue(
  assignments: readonly Resource<Assignment>[],
  subjects: ReadonlyMap<number, Resource<Subject>>,
  user: User,
  now: Temporal.Instant,
): StudyItem[] {
  const items: StudyItem[] = []
  for (const assignment of assignments) {
    const subject = subjects.get(assignment.data.subject_id)
    if (subject && isDue(assignment.data, now) && isSubjectAvailable(subject, user)) items.push({ assignment, subject })
  }

  const shuffled = shuffle(items)
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
