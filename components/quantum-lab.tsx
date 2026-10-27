"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, CircleHelp, Download, Play, Plus, RotateCcw, Trash2 } from "lucide-react";
import {
  blochCoordinates, circuitPresets, evolve, formatComplex, gateLabel, gateNames,
  gateSummary, measurementProbabilities, runShots, toOpenQasm,
  type GateName, type GateOperation, type MeasurementBasis,
} from "@/lib/quantum";

const shotOptions = [20, 100, 1000, 5000];
const outcomeLabel = (outcome: string) => outcome.length === 1 ? `|${outcome}⟩` : `|${outcome}⟩`;

function BlochSphere({ x, y, z }: { x: number; y: number; z: number }) {
  const projectedX = x * 0.83 + y * 0.35;
  const projectedY = -z * 0.83 + y * 0.22;
  const endX = 100 + projectedX * 62;
  const endY = 100 + projectedY * 62;
  return <svg className="bloch-svg" viewBox="0 0 200 200" role="img" aria-label={`Bloch sphere state vector: x ${x.toFixed(2)}, y ${y.toFixed(2)}, z ${z.toFixed(2)}`}>
    <circle cx="100" cy="100" r="66" className="bloch-outline" />
    <ellipse cx="100" cy="100" rx="66" ry="24" className="bloch-latitude" />
    <ellipse cx="100" cy="100" rx="27" ry="66" className="bloch-longitude" />
    <line x1="27" y1="100" x2="173" y2="100" className="bloch-axis-line" />
    <line x1="100" y1="27" x2="100" y2="173" className="bloch-axis-line" />
    <line x1="100" y1="100" x2={endX} y2={endY} className="bloch-state-vector" />
    <circle cx={endX} cy={endY} r="4" className="bloch-state-tip" />
    <text x="98" y="19" className="bloch-svg-label">|0⟩</text>
    <text x="98" y="192" className="bloch-svg-label">|1⟩</text>
    <text x="181" y="104" className="bloch-svg-label">X</text>
    <text x="104" y="101" className="bloch-center">·</text>
  </svg>;
}

export function QuantumLab() {
  const [qubitCount, setQubitCount] = useState(1);
  const [gates, setGates] = useState<GateOperation[]>([]);
  const [gateChoice, setGateChoice] = useState<GateName>("H");
  const [targetQubit, setTargetQubit] = useState(0);
  const [controlQubit, setControlQubit] = useState(0);
  const [angle, setAngle] = useState(90);
  const [basis, setBasis] = useState<MeasurementBasis>("Z");
  const [shots, setShots] = useState(100);
  const [runResult, setRunResult] = useState<{ counts: Record<string, number>; shots: number } | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("preset");
    if (!requested || !circuitPresets[requested]) return;
    const preset = circuitPresets[requested];
    setQubitCount(preset.qubits);
    setControlQubit(0);
    setTargetQubit(preset.qubits > 1 ? 1 : 0);
    setGates(preset.gates.map((gate, index) => ({ ...gate, id: `preset-${index}` })));
    setBasis(preset.basis ?? "Z");
    setMessage(`Loaded ${requested.replaceAll("-", " ")} preset.`);
  }, []);

  const state = useMemo(() => evolve(qubitCount, gates), [qubitCount, gates]);
  const probabilities = useMemo(() => measurementProbabilities(state, qubitCount, basis), [state, qubitCount, basis]);
  const totalProbability = probabilities.reduce((sum, value) => sum + value, 0);
  const singleQubitCoordinates = qubitCount === 1 ? blochCoordinates(state) : null;
  const controlledGate = gateChoice === "CNOT" || gateChoice === "CZ" || gateChoice === "CP";
  const hasValidPair = !controlledGate || (qubitCount > 1 && controlQubit !== targetQubit);
  const nonzeroAmplitudes = state.map((amplitude, index) => ({
    label: index.toString(2).padStart(qubitCount, "0"), amplitude, probability: amplitude.re ** 2 + amplitude.im ** 2,
  })).filter((item) => Math.abs(item.amplitude.re) + Math.abs(item.amplitude.im) > 0.0005);

  function addGate() {
    if (!hasValidPair) return;
    const qubits = controlledGate ? [controlQubit, targetQubit] : [targetQubit];
    const operation: GateOperation = { id: `${Date.now()}-${Math.random()}`, name: gateChoice, qubits, angle };
    setGates((current) => [...current, operation]);
    setRunResult(null);
    setMessage(`${gateSummary(operation)} added to the circuit.`);
  }

  function loadPreset(name: string) {
    const preset = circuitPresets[name];
    if (!preset) return;
    setQubitCount(preset.qubits);
    setControlQubit(0);
    setTargetQubit(preset.qubits > 1 ? 1 : 0);
    setGates(preset.gates.map((gate, index) => ({ ...gate, id: `${name}-${index}-${Date.now()}` })));
    setBasis(preset.basis ?? "Z");
    setRunResult(null);
    setMessage(`${name.replaceAll("-", " ")} circuit loaded.`);
  }

  function clearCircuit() {
    setGates([]);
    setQubitCount(1);
    setTargetQubit(0);
    setControlQubit(0);
    setBasis("Z");
    setRunResult(null);
    setMessage("Circuit reset to |0⟩.");
  }

  function changeQubitCount(nextCount: number) {
    setQubitCount(nextCount);
    setGates([]);
    setTargetQubit(nextCount > 1 ? 1 : 0);
    setControlQubit(0);
    setRunResult(null);
    setMessage(`Started a new ${nextCount}-qubit circuit in |0…0⟩.`);
  }

  function execute() {
    setRunResult({ counts: runShots(probabilities, qubitCount, shots), shots });
    setMessage(`Circuit measured in ${basis} basis for ${shots.toLocaleString()} shots.`);
  }

  function downloadOpenQasm() {
    const file = new Blob([toOpenQasm(qubitCount, gates, basis)], { type: "text/plain" });
    const url = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "qubit-atlas-experiment.qasm";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("OpenQASM 2 circuit downloaded. Check the target device's gate set and bit-order convention before running it.");
  }

  const resultRows = runResult
    ? Object.entries(runResult.counts).sort(([left], [right]) => left.localeCompare(right))
    : [];

  return <div className="page-wrap inner-page lab-page">
    <div className="breadcrumb"><Link href="/"><ArrowLeft size={14} aria-hidden="true" /> Overview</Link><span>/</span><span>Quantum lab</span></div>
    <section className="page-intro lab-intro">
      <div>
        <div className="eyebrow"><span className="eyebrow-line" /> LOCAL CIRCUIT SIMULATOR</div>
        <h1>Build a circuit.<br /><em>Test a prediction.</em></h1>
        <p>Prepare up to four qubits, apply gates, choose a measurement basis, and draw actual finite-shot samples from the ideal state-vector model.</p>
      </div>
      <div className="lab-stamp"><span className="stamp-mark">2ⁿ</span><span>STATE VECTOR<br />UP TO 4 QUBITS</span></div>
    </section>

    <section className="lab-disclosure" aria-label="Simulator limitations">
      <CircleHelp size={16} aria-hidden="true" />
      <p><strong>Model boundary.</strong> This is a classical, in-browser simulator of ideal unitary gates. It is not quantum hardware and does not include noise, mid-circuit measurement, or error correction. You can export OpenQASM 2 to run elsewhere; check the target device support and bit-order convention first.</p>
    </section>

    <div className="lab-workspace">
      <section className="lab-panel circuit-panel" aria-labelledby="circuit-heading">
        <div className="panel-heading">
          <div><span className="panel-label">01 / CIRCUIT</span><h2 id="circuit-heading">Compose operations</h2></div>
          <button className="text-action" type="button" onClick={clearCircuit}><RotateCcw size={14} aria-hidden="true" /> Reset</button>
        </div>
        <div className="control-grid">
          <label className="field-label">Qubits
            <span className="select-wrap"><select value={qubitCount} onChange={(event) => changeQubitCount(Number(event.target.value))}>{[1, 2, 3, 4].map((count) => <option key={count} value={count}>{count} {count === 1 ? "qubit" : "qubits"}</option>)}</select><ChevronDown size={14} aria-hidden="true" /></span>
          </label>
          <label className="field-label">Gate
            <span className="select-wrap"><select value={gateChoice} onChange={(event) => setGateChoice(event.target.value as GateName)}>{gateNames.map((name) => <option key={name} value={name}>{gateLabel[name]}{["CNOT", "CZ", "CP"].includes(name) ? " · controlled" : ""}</option>)}</select><ChevronDown size={14} aria-hidden="true" /></span>
          </label>
          {controlledGate ? <>
            <label className="field-label">Control
              <span className="select-wrap"><select value={controlQubit} onChange={(event) => setControlQubit(Number(event.target.value))}>{Array.from({ length: qubitCount }, (_, index) => <option key={index} value={index}>q{index}</option>)}</select><ChevronDown size={14} aria-hidden="true" /></span>
            </label>
            <label className="field-label">Target
              <span className="select-wrap"><select value={targetQubit} onChange={(event) => setTargetQubit(Number(event.target.value))}>{Array.from({ length: qubitCount }, (_, index) => <option key={index} value={index}>q{index}</option>)}</select><ChevronDown size={14} aria-hidden="true" /></span>
            </label>
          </> : <label className="field-label">Target qubit
            <span className="select-wrap"><select value={targetQubit} onChange={(event) => setTargetQubit(Number(event.target.value))}>{Array.from({ length: qubitCount }, (_, index) => <option key={index} value={index}>q{index}</option>)}</select><ChevronDown size={14} aria-hidden="true" /></span>
          </label>}
          {(["Rx", "Ry", "Rz", "CP"].includes(gateChoice)) && <label className="field-label angle-field">Rotation angle <output>{angle}°</output><input type="range" min="0" max="360" step="15" value={angle} onChange={(event) => setAngle(Number(event.target.value))} aria-label="Rotation angle in degrees" /></label>}
          <button className="button-secondary add-gate" type="button" onClick={addGate} disabled={!hasValidPair}><Plus size={15} aria-hidden="true" /> Add gate</button>
          {!hasValidPair && <p className="field-error" role="status">Choose different control and target qubits.</p>}
        </div>

        <div className="preset-row"><span className="panel-label">START WITH A CIRCUIT</span><div>{[
          ["superposition", "Superposition"], ["phase-interference", "Interference"], ["bell", "Bell pair"], ["ghz", "GHZ state"], ["grover-2", "Grover search"],
        ].map(([name, label]) => <button type="button" key={name} onClick={() => loadPreset(name)}>{label}</button>)}</div></div>

        <div className="circuit-register">
          <div className="circuit-register-heading"><span className="panel-label">CIRCUIT DIAGRAM</span><div className="register-tools"><span className="register-note">q0 is the leftmost bit</span><button className="text-action export-action" type="button" onClick={downloadOpenQasm}><Download size={13} aria-hidden="true" /> Download OpenQASM 2</button></div></div>
          {Array.from({ length: qubitCount }, (_, qubit) => <div className="circuit-wire" key={qubit}>
            <span className="wire-label">q{qubit}</span><span className="wire-line" aria-hidden="true" />
            {gates.map((operation, index) => {
              const isOnQubit = operation.qubits.includes(qubit);
              if (!isOnQubit) return <span className="wire-spacer" key={operation.id} aria-hidden="true" />;
              const label = operation.name === "CNOT" && operation.qubits[0] === qubit ? "●" : operation.name === "CNOT" ? "⊕" : gateLabel[operation.name];
              return <span className={`gate-chip ${operation.name === "CNOT" ? "gate-controlled" : ""}`} key={operation.id} title={gateSummary(operation)}>{label}<small>{index + 1}</small></span>;
            })}
          </div>)}
          {gates.length === 0 && <p className="circuit-empty">No gates yet. Add an operation or load a prepared circuit.</p>}
        </div>

        {gates.length > 0 && <div className="operation-list"><div className="circuit-register-heading"><span className="panel-label">OPERATION ORDER</span><span className="register-note">Applied left to right</span></div>{gates.map((operation, index) => <div className="operation-row" key={operation.id}><span className="operation-index">{String(index + 1).padStart(2, "0")}</span><span>{gateSummary(operation)}</span><button type="button" onClick={() => { setGates((current) => current.filter((gate) => gate.id !== operation.id)); setRunResult(null); setMessage(`${gateSummary(operation)} removed from the circuit.`); }} aria-label={`Remove ${gateSummary(operation)}`}><Trash2 size={14} aria-hidden="true" /></button></div>)}</div>}
        <p className="basis-caption">The selected Pauli basis is applied to every qubit.</p>
        <div className="measure-controls">
          <fieldset className="basis-control"><legend>Measurement basis</legend>{(["Z", "X", "Y"] as const).map((item) => <label key={item} className={basis === item ? "basis-option basis-selected" : "basis-option"}><input type="radio" name="measurement-basis" value={item} checked={basis === item} onChange={() => { setBasis(item); setRunResult(null); }} /><span>{item}</span></label>)}</fieldset>
          <label className="shots-control">Shots <span className="select-wrap"><select value={shots} onChange={(event) => setShots(Number(event.target.value))}>{shotOptions.map((count) => <option key={count} value={count}>{count.toLocaleString()}</option>)}</select><ChevronDown size={14} aria-hidden="true" /></span></label>
          <button type="button" className="button-primary run-button" onClick={execute}><Play size={14} fill="currentColor" aria-hidden="true" /> Run circuit <ArrowRight size={14} aria-hidden="true" /></button>
        </div>
      </section>

      <section className="lab-panel results-panel" aria-labelledby="results-heading">
        <div className="panel-heading"><div><span className="panel-label">02 / STATE & MEASUREMENT</span><h2 id="results-heading">Read the result</h2></div></div>
        {singleQubitCoordinates && <div className="bloch-summary"><BlochSphere {...singleQubitCoordinates} /><div><span className="panel-label">BLOCH COORDINATES</span><div className="coordinate-readout"><span>x <strong>{singleQubitCoordinates.x.toFixed(3)}</strong></span><span>y <strong>{singleQubitCoordinates.y.toFixed(3)}</strong></span><span>z <strong>{singleQubitCoordinates.z.toFixed(3)}</strong></span></div><p>One point describes the pure state up to a global phase. Z-basis probabilities depend on its vertical coordinate.</p></div></div>}

        <div className="state-vector-block"><div className="circuit-register-heading"><span className="panel-label">STATE VECTOR / Z BASIS</span><span className="register-note">Σ |amplitude|² = {totalProbability.toFixed(3)}</span></div><div className="amplitude-list">{nonzeroAmplitudes.map((item) => <div className="amplitude-row" key={item.label}><span className="basis-ket">|{item.label}⟩</span><code>{formatComplex(item.amplitude)}</code><span className="amplitude-probability">P {item.probability.toFixed(3)}</span></div>)}</div></div>

        <div className="probability-block"><div className="circuit-register-heading"><span className="panel-label">PREDICTED DISTRIBUTION</span><span className="register-note">{basis}-basis, ideal model</span></div><div className="probability-list">{probabilities.map((probability, index) => {
          const bitstring = index.toString(2).padStart(qubitCount, "0");
          return <div className="distribution-row" key={bitstring}><span className="basis-ket">{outcomeLabel(bitstring)}</span><span className="distribution-track"><span style={{ width: `${probability * 100}%` }} /></span><span className="distribution-value">{(probability * 100).toFixed(1)}%</span></div>;
        })}</div></div>

        <div className="sample-block" aria-live="polite">
          <div className="circuit-register-heading"><span className="panel-label">OBSERVED SHOTS</span><span className="register-note">{runResult ? `${runResult.shots.toLocaleString()} samples` : "Run the circuit to sample"}</span></div>
          {!runResult ? <div className="sample-empty"><span>—</span><p>Counts will appear here after a run. Repeating the same circuit can produce different samples.</p></div> : <div className="sample-list">{resultRows.map(([bitstring, count]) => <div className="distribution-row sample-row" key={bitstring}><span className="basis-ket">{outcomeLabel(bitstring)}</span><span className="distribution-track"><span className="sample-fill" style={{ width: `${(count / runResult.shots) * 100}%` }} /></span><span className="distribution-value">{count.toLocaleString()} <small>({((count / runResult.shots) * 100).toFixed(1)}%)</small></span></div>)}</div>}
        </div>
      </section>
    </div>

    <p className="lab-live-message" role="status" aria-live="polite">{message}</p>

    <section className="lab-method-note"><div><span className="panel-label">HOW TO USE THE LAB</span><h2>Predict first. Run second.</h2></div><ol><li>Write the state you expect after each gate.</li><li>Predict a measurement distribution in the selected basis.</li><li>Run shots and compare the finite sample to your prediction.</li></ol><Link href="/curriculum#research-lab">Learn how to report an experiment <ArrowRight size={14} aria-hidden="true" /></Link></section>
    <div className="concept-footnote"><span className="panel-label">NEXT STEP</span><div><h3>Make a claim you can test.</h3><p>The advanced track covers uncertainty, controls, and a complete circuit capstone.</p></div><Link href="/curriculum#research-lab">Go to the capstone <ArrowRight size={14} aria-hidden="true" /></Link></div>
  </div>;
}
