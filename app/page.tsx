import Link from "next/link";
import { ArrowRight, ArrowUpRight, Binary, BookOpen, Braces, Check, FlaskConical, MoveRight } from "lucide-react";
import { modules } from "@/content/curriculum";

const phases = [
  { title: "Build the foundations", label: "01—03 · BEGINNER", description: "Learn what a qubit is, how amplitudes work, and how to reason about single-qubit gates.", modules: modules.slice(0, 3) },
  { title: "Think in circuits", label: "04—06 · INTERMEDIATE", description: "Compose operations, understand entanglement, and study the structure of quantum algorithms.", modules: modules.slice(3, 6) },
  { title: "Work like an experimentalist", label: "07—10 · ADVANCED", description: "Model noise, understand error correction and hardware, then design and report a capstone experiment.", modules: modules.slice(6) },
];

export default function Home() {
  return <div className="page-wrap home-page">
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-line" /> QUANTUM COMPUTING, TAUGHT PROPERLY <span className="eyebrow-index">A FIELD GUIDE</span></div>
        <h1>Understand the<br /><em>quantum circuit.</em></h1>
        <p className="hero-lede">A rigorous path from your first qubit to experiments you can design and explain. Learn the model, work through the math, and test ideas in a local circuit simulator.</p>
        <div className="hero-actions"><Link className="button-primary" href="/curriculum">Start with the foundations <ArrowRight size={16} aria-hidden="true" /></Link><Link className="button-quiet" href="/playground"><FlaskConical size={15} aria-hidden="true" /> Open the quantum lab</Link></div>
        <div className="hero-proof"><div><strong>10</strong><span>connected modules</span></div><span className="proof-rule" /><div><strong>30</strong><span>worked lessons</span></div><span className="proof-rule" /><div><strong>4</strong><span>qubits in the lab</span></div></div>
      </div>
      <div className="hero-visual" role="img" aria-label="Diagram of a quantum circuit transforming an input state into measurement outcomes">
        <div className="visual-top"><span>FIG. 01</span><span>THE CIRCUIT MODEL</span></div>
        <div className="hero-circuit">
          <div className="hero-circuit-row"><span className="circuit-input">|0⟩</span><span className="hero-wire" /><span className="hero-gate">H</span><span className="hero-wire" /><span className="hero-gate hero-gate-phase">Z</span><span className="hero-wire" /><span className="hero-meter">M</span><span className="hero-wire" /><span className="hero-outcome">0 / 1</span></div>
          <div className="hero-circuit-row"><span className="circuit-input">q1</span><span className="hero-wire" /><span className="hero-gate hero-gate-empty" /><span className="hero-wire" /><span className="hero-gate hero-gate-empty" /><span className="hero-wire" /><span className="hero-meter">M</span><span className="hero-wire" /><span className="hero-outcome">classical</span></div>
          <div className="hero-readout"><span>PREPARE</span><MoveRight size={13} aria-hidden="true" /><span>EVOLVE</span><MoveRight size={13} aria-hidden="true" /><span>MEASURE</span></div>
        </div>
        <div className="visual-bottom"><span>IDEAL CIRCUIT / SAMPLE MODEL</span><span className="math-label">|ψ⟩ = U|0⟩</span></div>
        <div className="visual-caption">The circuit defines a probability distribution.<br />A measurement returns one classical sample.</div>
      </div>
    </section>

    <section className="principle-strip"><span className="strip-label">A USEFUL STARTING POINT</span><p>A quantum computer does not reveal every possible answer. It transforms <em>amplitudes</em> so useful outcomes become more likely.</p><Link href="/curriculum#orientation" aria-label="Read the first module"><ArrowUpRight size={19} aria-hidden="true" /></Link></section>

    <section className="section-block course-overview">
      <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> THE LEARNING PATH</div><h2>From first principles<br />to experimental method.</h2></div><Link className="text-link" href="/curriculum">Explore all 30 lessons <ArrowRight size={15} aria-hidden="true" /></Link></div>
      <div className="phase-list">{phases.map((phase, index) => <section className="phase-row" key={phase.label}><div className="phase-summary"><span className="phase-label">{phase.label}</span><h3>{phase.title}</h3><p>{phase.description}</p></div><div className="phase-modules">{phase.modules.map((module) => <Link href={`/curriculum#${module.id}`} className="phase-module" key={module.id}><span>{module.number}</span><strong>{module.title}</strong><ArrowUpRight size={15} aria-hidden="true" /></Link>)}</div><span className="phase-index">0{index + 1}</span></section>)}</div>
    </section>

    <section className="practice-section">
      <div className="practice-intro"><div className="eyebrow"><span className="eyebrow-line" /> LEARN BY TESTING YOUR MODEL</div><h2>Turn a prediction<br /><em>into an experiment.</em></h2><p>Assemble gates, choose a measurement basis, and draw finite samples from the ideal circuit you built.</p><Link className="text-link" href="/playground">Open the local simulator <ArrowRight size={15} aria-hidden="true" /></Link></div>
      <div className="practice-preview"><div className="preview-heading"><span className="panel-label">BELL STATE / Z-BASIS</span><span>IDEAL PREDICTION</span></div><div className="preview-equation">H<sub>q0</sub> → CX<sub>q0,q1</sub></div><div className="preview-outcome"><span>|00⟩</span><span className="preview-track"><i style={{ width: "50%" }} /></span><strong>50%</strong></div><div className="preview-outcome"><span>|11⟩</span><span className="preview-track"><i style={{ width: "50%" }} /></span><strong>50%</strong></div><div className="preview-note"><Check size={14} aria-hidden="true" /><span>Both qubits are individually random; their ideal Z outcomes match.</span></div></div>
    </section>

    <section className="feature-grid">
      <div className="feature-intro"><div className="eyebrow"><span className="eyebrow-line" /> A PRACTICAL REFERENCE</div><h2>Precise enough<br />to keep using.</h2><p>Learn a concept in context, check your understanding, then return to the reference when you need it.</p></div>
      <Link className="feature-cell" href="/curriculum"><span className="feature-icon"><BookOpen size={19} aria-hidden="true" /></span><span className="feature-kicker">LEARNING PATH / 01</span><h3>Thirty worked lessons</h3><p>Clear outcomes, equations, worked examples, experiments, and self-checks throughout.</p><span className="feature-link">Browse the curriculum <ArrowUpRight size={15} aria-hidden="true" /></span></Link>
      <Link className="feature-cell" href="/playground"><span className="feature-icon"><Binary size={20} aria-hidden="true" /></span><span className="feature-kicker">LOCAL SIMULATOR / 02</span><h3>Build and measure circuits</h3><p>Explore up to four qubits with a transparent ideal state-vector model.</p><span className="feature-link">Run an experiment <ArrowUpRight size={15} aria-hidden="true" /></span></Link>
      <Link className="feature-cell" href="/glossary"><span className="feature-icon"><Braces size={19} aria-hidden="true" /></span><span className="feature-kicker">REFERENCE / 03</span><h3>Definitions without shortcuts</h3><p>Find the notation and ideas that recur across the course, in one searchable place.</p><span className="feature-link">Browse concepts <ArrowUpRight size={15} aria-hidden="true" /></span></Link>
    </section>

    <section className="honesty-note"><span className="panel-label">WHAT THIS PRODUCT IS</span><p>Qubit Atlas is a frontend learning resource. The simulator runs in your browser using classical state-vector calculations; it does not connect to quantum hardware, create a backend account, or model device noise.</p><Link href="/curriculum#research-lab">Learn how to interpret an experiment <ArrowRight size={14} aria-hidden="true" /></Link></section>
    <section className="closing-cta"><div><span className="closing-index">START HERE / 001</span><h2>Build the model before<br />believing the headline.</h2><p>Begin with a state, make a prediction, and see what the measurement can tell you.</p></div><Link href="/curriculum" className="button-primary">Begin lesson one <ArrowRight size={16} aria-hidden="true" /></Link></section>
  </div>;
}
