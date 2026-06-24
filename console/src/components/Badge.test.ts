import { describe, it, expect } from 'vitest'
import { tierTone, runStatusTone, reviewStatusTone, scoreTone } from './Badge'

describe('tierTone', () => {
  it('maps tiers to tones', () => {
    expect(tierTone('hot')).toBe('success')
    expect(tierTone('warm')).toBe('warning')
    expect(tierTone('cold_fit')).toBe('accent')
    expect(tierTone('low')).toBe('neutral')
  })
})

describe('runStatusTone', () => {
  it('maps run statuses to tones', () => {
    expect(runStatusTone('success')).toBe('success')
    expect(runStatusTone('error')).toBe('danger')
    expect(runStatusTone('running')).toBe('accent')
    expect(runStatusTone('queued')).toBe('accent')
    expect(runStatusTone('dry-run')).toBe('warning')
  })
})

describe('reviewStatusTone', () => {
  it('maps review statuses to tones', () => {
    expect(reviewStatusTone('approved')).toBe('success')
    expect(reviewStatusTone('rejected')).toBe('danger')
    expect(reviewStatusTone('pending')).toBe('warning')
  })
})

describe('scoreTone', () => {
  it('uses 85/70 thresholds', () => {
    expect(scoreTone(90)).toBe('success')
    expect(scoreTone(85)).toBe('success')
    expect(scoreTone(84)).toBe('warning')
    expect(scoreTone(70)).toBe('warning')
    expect(scoreTone(69)).toBe('danger')
  })
})
