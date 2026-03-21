import { useRef } from "react";

// Generates and persists a session ID for the current demo session
let _sessionId = null;

export function getDemoSessionId() {
  if (!_sessionId) {
    _sessionId = `demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
  return _sessionId;
}

export function resetDemoSessionId() {
  _sessionId = `demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return _sessionId;
}