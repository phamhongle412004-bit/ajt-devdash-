import type { AppState } from './types';

let currentState: AppState = { status: 'idle' };

export function getState(): AppState {
  return currentState;
}

export function setState(newState: AppState, renderFn: () => void): void {
  currentState = newState;
  renderFn();
}