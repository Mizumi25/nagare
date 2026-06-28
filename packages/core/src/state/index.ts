// =========================================================
// NAGARE STATE MANAGER
// =========================================================

import type { State, StateValue } from '../types.js'
import { getSoul } from '../runtime/registry.js'

export function getState(soulName: string): State | undefined {
  return getSoul(soulName)?.state
}

export function setState(
  soulName: string,
  key: string,
  value: StateValue
): void {
  const soul = getSoul(soulName)
  if (!soul) {
    console.warn(`Nagare: soul "${soulName}" not found`)
    return
  }
  soul.state[key] = value
}

export function resetState(soulName: string): void {
  const soul = getSoul(soulName)
  if (!soul) return
  const defaultState = soul.default?.state ?? {}
  soul.state = { ...defaultState }
}

export function createState(initial: State): State {
  return { ...initial }
}
