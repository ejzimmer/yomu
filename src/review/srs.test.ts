import { describe, expect, it } from 'vitest'
import type { SpacedRepetitionSystem } from '../api/types'
import { getNextStage, getStageName } from './srs'

const system: SpacedRepetitionSystem = {
  name: 'Default',
  description: '',
  unlocking_stage_position: 0,
  starting_stage_position: 1,
  passing_stage_position: 5,
  burning_stage_position: 9,
  stages: [],
}

describe('getNextStage', () => {
  it('moves up one stage when nothing was wrong', () => {
    expect(getNextStage(4, 0, system)).toBe(5)
    expect(getNextStage(8, 0, system)).toBe(9)
  })

  it('drops by half the wrong answers, rounded up, below Guru', () => {
    expect(getNextStage(4, 1, system)).toBe(3)
    expect(getNextStage(4, 3, system)).toBe(2)
  })

  it('drops twice as far from Guru upwards', () => {
    expect(getNextStage(6, 1, system)).toBe(4)
    expect(getNextStage(8, 2, system)).toBe(6)
  })

  it('never drops below the starting stage', () => {
    expect(getNextStage(2, 4, system)).toBe(1)
  })
})

describe('getStageName', () => {
  it('names each stage', () => {
    expect(getStageName(5)).toBe('Guru 1')
    expect(getStageName(9)).toBe('Burned')
  })
})
