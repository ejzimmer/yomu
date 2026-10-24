import type { Resource, StudyMaterial } from '../api/types'

export function getSynonymsBySubject(studyMaterials: readonly Resource<StudyMaterial>[]) {
  return new Map(
    studyMaterials
      .filter((material) => !material.data.hidden)
      .map((material) => [material.data.subject_id, material.data.meaning_synonyms]),
  )
}
