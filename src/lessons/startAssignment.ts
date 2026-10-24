import type { WaniKaniClient } from '../api/client'
import type { Assignment, Resource } from '../api/types'
import { db } from '../data/db'

export async function startAssignment(client: WaniKaniClient, assignmentId: number) {
  const assignment = await client.put<Resource<Assignment>>(`/assignments/${assignmentId}/start`, {})
  await db.assignments.put(assignment)
}
