export type GateName = "H" | "X" | "Y" | "Z" | "S" | "Sdg" | "T" | "Rx" | "Ry" | "Rz" | "CNOT" | "CZ" | "CP";
export type MeasurementBasis = "Z" | "X" | "Y";
export type GateOperation = { id: string; name: GateName; qubits: number[]; angle?: number };
export type CircuitPreset = { qubits: number; gates: Omit<GateOperation, "id">[]; basis?: MeasurementBasis };

type Complex = { re: number; im: number };
const c = (re: number, im = 0): Complex => ({ re, im });
const add = (a: Complex, b: Complex): Complex => c(a.re + b.re, a.im + b.im);
const multiply = (a: Complex, b: Complex): Complex => c(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const magnitudeSquared = (a: Complex) => a.re * a.re + a.im * a.im;

export const gateNames: GateName[] = ["H", "X", "Y", "Z", "S", "Sdg", "T", "Rx", "Ry", "Rz", "CNOT", "CZ", "CP"];
export const gateLabel: Record<GateName, string> = {
  H: "H", X: "X", Y: "Y", Z: "Z", S: "S", Sdg: "S†", T: "T", Rx: "Rx", Ry: "Ry", Rz: "Rz", CNOT: "CX", CZ: "CZ", CP: "CP",
};

export const circuitPresets: Record<string, CircuitPreset> = {
  superposition: { qubits: 1, gates: [{ name: "H", qubits: [0] }] },
  "phase-interference": { qubits: 1, gates: [{ name: "H", qubits: [0] }, { name: "Z", qubits: [0] }, { name: "H", qubits: [0] }] },
  "single-gate": { qubits: 1, gates: [{ name: "X", qubits: [0] }, { name: "H", qubits: [0] }, { name: "S", qubits: [0] }] },
  bell: { qubits: 2, gates: [{ name: "H", qubits: [0] }, { name: "CNOT", qubits: [0, 1] }] },
  ghz: { qubits: 3, gates: [{ name: "H", qubits: [0] }, { name: "CNOT", qubits: [0, 1] }, { name: "CNOT", qubits: [1, 2] }] },
  "grover-2": {
    qubits: 2,
    gates: [
      { name: "H", qubits: [0] }, { name: "H", qubits: [1] },
      { name: "CZ", qubits: [0, 1] },
      { name: "H", qubits: [0] }, { name: "H", qubits: [1] },
      { name: "X", qubits: [0] }, { name: "X", qubits: [1] },
      { name: "CZ", qubits: [0, 1] },
      { name: "X", qubits: [0] }, { name: "X", qubits: [1] },
      { name: "H", qubits: [0] }, { name: "H", qubits: [1] },
    ],
  },
};

function singleQubitMatrix(name: GateName, angleDegrees = 90): [Complex, Complex, Complex, Complex] {
  const i = c(0, 1);
  const theta = (angleDegrees * Math.PI) / 180;
  const cos = Math.cos(theta / 2);
  const sin = Math.sin(theta / 2);
  switch (name) {
    case "H": { const s = 1 / Math.sqrt(2); return [c(s), c(s), c(s), c(-s)]; }
    case "X": return [c(0), c(1), c(1), c(0)];
    case "Y": return [c(0), multiply(c(0, -1), c(1)), multiply(i, c(1)), c(0)];
    case "Z": return [c(1), c(0), c(0), c(-1)];
    case "S": return [c(1), c(0), c(0), i];
    case "Sdg": return [c(1), c(0), c(0), c(0, -1)];
    case "T": return [c(1), c(0), c(0), c(Math.SQRT1_2, Math.SQRT1_2)];
    case "Rx": return [c(cos), multiply(c(0, -sin), c(1)), multiply(c(0, -sin), c(1)), c(cos)];
    case "Ry": return [c(cos), c(-sin), c(sin), c(cos)];
    case "Rz": return [c(cos, -sin), c(0), c(0), c(cos, sin)];
    default: return [c(1), c(0), c(0), c(1)];
  }
}

function applySingle(state: Complex[], qubitCount: number, target: number, gate: GateName, angle?: number) {
  const mask = 1 << (qubitCount - target - 1);
  const [m00, m01, m10, m11] = singleQubitMatrix(gate, angle);
  for (let index = 0; index < state.length; index += 1) {
    if (index & mask) continue;
    const paired = index | mask;
    const a = state[index];
    const b = state[paired];
    state[index] = add(multiply(m00, a), multiply(m01, b));
    state[paired] = add(multiply(m10, a), multiply(m11, b));
  }
}

function applyControlled(state: Complex[], qubitCount: number, operation: GateOperation) {
  const [control, target] = operation.qubits;
  if (control === undefined || target === undefined || control === target) return;
  const controlMask = 1 << (qubitCount - control - 1);
  const targetMask = 1 << (qubitCount - target - 1);
  if (operation.name === "CNOT") {
    for (let index = 0; index < state.length; index += 1) {
      if ((index & controlMask) !== 0 && (index & targetMask) === 0) {
        const paired = index | targetMask;
        [state[index], state[paired]] = [state[paired], state[index]];
      }
    }
    return;
  }
  const phase = operation.name === "CZ" ? c(-1) : c(Math.cos((operation.angle ?? 90) * Math.PI / 180), Math.sin((operation.angle ?? 90) * Math.PI / 180));
  for (let index = 0; index < state.length; index += 1) {
    if ((index & controlMask) !== 0 && (index & targetMask) !== 0) state[index] = multiply(phase, state[index]);
  }
}

export function evolve(qubitCount: number, gates: GateOperation[]): Complex[] {
  const state = Array.from({ length: 1 << qubitCount }, (_, index) => index === 0 ? c(1) : c(0));
  for (const operation of gates) {
    if (operation.name === "CNOT" || operation.name === "CZ" || operation.name === "CP") applyControlled(state, qubitCount, operation);
    else if (operation.qubits[0] !== undefined) applySingle(state, qubitCount, operation.qubits[0], operation.name, operation.angle);
  }
  return state;
}

export function measurementProbabilities(state: Complex[], qubitCount: number, basis: MeasurementBasis): number[] {
  const measured = state.map((value) => c(value.re, value.im));
  if (basis !== "Z") {
    for (let target = 0; target < qubitCount; target += 1) {
      if (basis === "Y") applySingle(measured, qubitCount, target, "Sdg");
      applySingle(measured, qubitCount, target, "H");
    }
  }
  return measured.map(magnitudeSquared);
}

export function runShots(probabilities: number[], qubitCount: number, shots: number): Record<string, number> {
  const cumulative: number[] = [];
  probabilities.reduce((sum, probability, index) => {
    cumulative[index] = sum + probability;
    return cumulative[index];
  }, 0);
  const counts: Record<string, number> = {};
  for (let shot = 0; shot < shots; shot += 1) {
    const draw = Math.random();
    let outcome = cumulative.findIndex((upperBound) => draw < upperBound);
    if (outcome < 0) outcome = cumulative.length - 1;
    const bitstring = outcome.toString(2).padStart(qubitCount, "0");
    counts[bitstring] = (counts[bitstring] ?? 0) + 1;
  }
  return counts;
}

export function formatComplex(value: Complex, digits = 3): string {
  const clean = (number: number) => Math.abs(number) < 0.5 * 10 ** -digits ? 0 : Number(number.toFixed(digits));
  const re = clean(value.re);
  const im = clean(value.im);
  if (!im) return String(re);
  if (!re) return `${im < 0 ? "−" : ""}${Math.abs(im)}i`;
  return `${re} ${im < 0 ? "−" : "+"} ${Math.abs(im)}i`;
}

export function blochCoordinates(state: Complex[]) {
  const alpha = state[0];
  const beta = state[1];
  const cross = multiply({ re: alpha.re, im: -alpha.im }, beta);
  return {
    x: 2 * cross.re,
    y: 2 * cross.im,
    z: magnitudeSquared(alpha) - magnitudeSquared(beta),
  };
}

export function gateSummary(operation: GateOperation) {
  if (operation.name === "CNOT") return `${gateLabel[operation.name]} q${operation.qubits[0]} → q${operation.qubits[1]}`;
  if (operation.name === "CZ" || operation.name === "CP") return `${gateLabel[operation.name]} q${operation.qubits[0]}, q${operation.qubits[1]}`;
  if (operation.name === "Rx" || operation.name === "Ry" || operation.name === "Rz") return `${gateLabel[operation.name]}(${operation.angle ?? 90}°) q${operation.qubits[0]}`;
  return `${gateLabel[operation.name]} q${operation.qubits[0]}`;
}

export function toOpenQasm(qubitCount: number, gates: GateOperation[], basis: MeasurementBasis): string {
  const lines = ["OPENQASM 2.0;", 'include "qelib1.inc";', `qreg q[${qubitCount}];`, `creg c[${qubitCount}];`, "", "// Gates are listed in circuit order; q0 is the leftmost displayed qubit."];
  for (const operation of gates) {
    const [first, second] = operation.qubits;
    if (operation.name === "CNOT") lines.push(`cx q[${first}], q[${second}];`);
    else if (operation.name === "CZ") lines.push(`cz q[${first}], q[${second}];`);
    else if (operation.name === "CP") lines.push(`cu1(${(((operation.angle ?? 90) * Math.PI) / 180).toFixed(6)}) q[${first}], q[${second}];`);
    else if (operation.name === "Rx" || operation.name === "Ry" || operation.name === "Rz") {
      const radians = (((operation.angle ?? 90) * Math.PI) / 180).toFixed(6);
      const gate = operation.name.toLowerCase();
      lines.push(`${gate}(${radians}) q[${first}];`);
    } else if (operation.name === "Sdg") lines.push(`sdg q[${first}];`);
    else lines.push(`${operation.name.toLowerCase()} q[${first}];`);
  }
  if (basis === "X" || basis === "Y") {
    lines.push("", `// Rotate every qubit into the ${basis}-measurement basis.`);
    for (let qubit = 0; qubit < qubitCount; qubit += 1) {
      if (basis === "Y") lines.push(`sdg q[${qubit}];`);
      lines.push(`h q[${qubit}];`);
    }
  }
  lines.push("", "// Reverse classical indices so printed bitstrings follow q0, q1, ... from left to right.");
  for (let qubit = 0; qubit < qubitCount; qubit += 1) lines.push(`measure q[${qubit}] -> c[${qubitCount - qubit - 1}];`);
  return `${lines.join("\n")}\n`;
}
