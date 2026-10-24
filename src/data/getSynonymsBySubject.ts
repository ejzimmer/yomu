import type { Resource, StudyMaterial } from '../api/types'

export function getSynonymsBySubject(studyMaterials: readonly Resource<StudyMaterial>[]) {
  return new Map(
    studyMaterials.filter((m) => !m.data.hidden).map((m) => [m.data.subject_id, m.data.meaning_synonyms]),
  )
}
