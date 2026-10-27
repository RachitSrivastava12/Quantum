# Qubit Atlas

A frontend-only quantum-computing course and local circuit laboratory built with Next.js App Router, React, TypeScript, and CSS.

## Learning path

Ten modules take a learner from the circuit model through advanced quantum information and experimental practice:

1. Start with the physics
2. The mathematical language
3. The single-qubit laboratory
4. Circuits and algorithmic thinking
5. Many qubits and quantum information
6. Quantum algorithms
7. Mixed states, noise, and open systems
8. Quantum error correction
9. Hardware, compilation, and hybrid computing
10. Design and report quantum experiments

Every lesson includes a learning objective, detailed explanations, a worked example, a guided experiment, and a self-check question. Completion progress is optional and stored in browser `localStorage`.

## Local circuit laboratory

The lab simulates ideal circuits of up to four qubits using a classical state vector. It supports X, Y, Z, H, S, S†, T, Rx, Ry, Rz, CNOT, CZ, and controlled-phase gates; Z, X, and Y measurement bases; finite-shot sampling; and OpenQASM 2 export for use outside this frontend.

The model is pedagogical: it is not a connection to quantum hardware and does not include device noise, mid-circuit measurement, classical feed-forward, or quantum error correction. Shot outcomes use the browser's `Math.random()` and are for learning, not cryptographic use.

## Run locally

Requirements: Node.js 20.9+ and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Routes

- `/` — overview and course map
- `/curriculum` — 30 detailed lessons and browser-local progress
- `/playground` — state-vector circuit composer and shot sampler
- `/glossary` — searchable reference with 46 concepts

## Frontend-only guarantee

The project contains no API routes, server actions, database calls, authentication, or external-service integrations. Lesson data is bundled with the frontend. Progress is only stored in local browser storage. Typography uses system font stacks, so no font service is needed at runtime.
