"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, Search } from "lucide-react";

const terms: [string, string, string][] = [
  ["Amplitude", "A complex coefficient of a basis state. Its squared magnitude gives the probability of that outcome when measuring in the corresponding basis.", "FOUNDATIONS"],
  ["Amplitude amplification", "A family of algorithms that increases the probability of marked outcomes by iteratively changing relative phases and reflecting amplitudes.", "ALGORITHMS"],
  ["Ancilla", "An auxiliary qubit used as workspace in a circuit. It may need to be returned to a known state so it does not remain entangled with the answer.", "CIRCUITS"],
  ["Basis", "A set of vectors used to represent states in a vector space. Measurement probabilities depend on the measurement basis.", "MATHEMATICS"],
  ["Bell inequality", "A bound obeyed by correlations in a class of local hidden-variable models under stated assumptions. Quantum predictions can violate suitable Bell inequalities.", "ENTANGLEMENT"],
  ["Bell state", "One of four maximally entangled two-qubit states. For example, |Φ⁺⟩ = (|00⟩ + |11⟩)/√2.", "ENTANGLEMENT"],
  ["Bloch sphere", "A geometric representation of pure single-qubit states up to global phase. The surface is pure states; mixed qubit states lie inside.", "GEOMETRY"],
  ["Born rule", "The rule that assigns a measurement probability equal to the squared magnitude of the associated amplitude, or Tr(ρΠ) for a density operator ρ and projector Π.", "FOUNDATIONS"],
  ["CNOT", "A two-qubit controlled-NOT gate: it applies X to the target if the control is |1⟩ and leaves the target unchanged if the control is |0⟩.", "CIRCUITS"],
  ["Code distance", "The minimum weight of a physical operator that acts nontrivially on encoded logical information in an error-correcting code.", "ERROR CORRECTION"],
  ["Coherence", "The phase relationships between components of a quantum state that allow interference. Noise or entanglement with an environment can reduce observable coherence.", "NOISE"],
  ["Computational basis", "The standard basis {|0⟩, |1⟩} for a qubit, extended to bit strings such as |00⟩ and |11⟩ for multiple qubits.", "FOUNDATIONS"],
  ["Controlled gate", "A gate whose operation on a target depends on the state of one or more control qubits.", "CIRCUITS"],
  ["Density matrix", "An operator ρ describing a pure state or statistical mixture. It is Hermitian, positive semidefinite, and has trace one.", "MATHEMATICS"],
  ["Deutsch–Jozsa algorithm", "A quantum algorithm that distinguishes constant from balanced Boolean functions with one oracle query, given the problem's promise.", "ALGORITHMS"],
  ["Decoherence", "The loss of locally observable phase coherence through interaction with degrees of freedom that are not tracked, often the environment.", "NOISE"],
  ["Entanglement", "A property of a joint state that prevents it from being written as a product of states for its subsystems.", "ENTANGLEMENT"],
  ["Error syndrome", "The outcomes of check measurements in a quantum error-correcting code. They provide information about errors without directly revealing the encoded logical state.", "ERROR CORRECTION"],
  ["Fault tolerance", "A method of carrying out computation while correcting errors as they occur, so logical errors remain controlled as a circuit grows.", "ERROR CORRECTION"],
  ["Gate", "A quantum operation represented by a unitary matrix for ideal closed-system evolution. Measurement and noise channels are different kinds of operations.", "CIRCUITS"],
  ["Global phase", "A common complex phase multiplying every component of a state vector. It has no observable effect on that isolated state.", "FOUNDATIONS"],
  ["Hadamard gate", "A single-qubit unitary that maps |0⟩ to |+⟩ and |1⟩ to |−⟩. It changes between the Z and X bases.", "CIRCUITS"],
  ["Inner product", "A complex-valued overlap between vectors. For normalized states, the squared magnitude of an overlap gives a projection probability.", "MATHEMATICS"],
  ["Logical qubit", "An encoded qubit represented across multiple physical qubits by a quantum error-correcting code.", "ERROR CORRECTION"],
  ["Measurement", "An interaction that produces a classical outcome according to a specified measurement and the system's state. The measurement basis is part of the question asked.", "FOUNDATIONS"],
  ["Mixed state", "A state described by a density matrix that represents statistical uncertainty or a subsystem of a larger entangled state.", "MATHEMATICS"],
  ["Noise channel", "A mathematical map describing how a quantum state changes because of interactions, imperfect control, or an unobserved environment.", "NOISE"],
  ["Oracle", "A defined black-box operation used in an algorithm model to answer a specific query. Its construction and implementation costs still matter.", "ALGORITHMS"],
  ["Pauli gates", "The X, Y, and Z matrices. They are useful as single-qubit operations, rotation axes, and a basis for describing common error models.", "CIRCUITS"],
  ["Partial trace", "The operation TrB(ρAB) that obtains the reduced state of subsystem A when subsystem B is not observed.", "MATHEMATICS"],
  ["Phase", "The argument of a complex amplitude. Relative phase can affect interference; a phase shared by every amplitude is global and unobservable.", "FOUNDATIONS"],
  ["Phase kickback", "A technique in which a function value applied to a target prepared in a phase-sensitive state appears as a phase on the input register.", "ALGORITHMS"],
  ["Phase estimation", "An algorithmic procedure that estimates an eigenphase of a unitary using controlled powers and a Fourier-transform step.", "ALGORITHMS"],
  ["Physical qubit", "A hardware degree of freedom engineered to behave approximately as a two-level quantum system.", "HARDWARE"],
  ["Probability amplitude", "A complex value associated with a basis outcome. The Born rule converts its squared magnitude into a probability.", "FOUNDATIONS"],
  ["Quantum Fourier transform", "A unitary discrete Fourier transform over a register. It is used in phase estimation and in period-finding algorithms.", "ALGORITHMS"],
  ["Quantum teleportation", "A protocol that transfers an unknown quantum state using shared entanglement, a joint measurement, and classical communication. It does not enable faster-than-light messaging.", "ENTANGLEMENT"],
  ["Relative phase", "The phase difference between components of a superposition. Unlike global phase, it can change later measurement statistics through interference.", "FOUNDATIONS"],
  ["Shot", "One circuit execution followed by measurement. Repeated shots produce a sample used to estimate an outcome distribution.", "EXPERIMENTS"],
  ["Shor's algorithm", "A quantum algorithm for factoring integers that reduces the problem to period finding. Its cryptographic implications require a sufficiently large fault-tolerant machine.", "ALGORITHMS"],
  ["Stabilizer", "A commuting observable whose specified eigenvalue defines part of a quantum error-correcting code space.", "ERROR CORRECTION"],
  ["State vector", "A normalized vector of complex amplitudes representing a pure quantum state in a chosen basis.", "MATHEMATICS"],
  ["Superposition", "A coherent linear combination of basis states. It does not mean measurement returns every component or answer at once.", "FOUNDATIONS"],
  ["Tensor product", "The operation that combines state spaces. n qubits have a 2ⁿ-dimensional joint state space.", "MATHEMATICS"],
  ["Transpilation", "The compilation of an abstract circuit into gates and connections supported by a particular device architecture.", "HARDWARE"],
  ["Unitary", "A matrix U satisfying U†U = I. Unitary operations preserve inner products and normalization.", "MATHEMATICS"],
];

const categories = ["ALL", "FOUNDATIONS", "MATHEMATICS", "GEOMETRY", "CIRCUITS", "ENTANGLEMENT", "ALGORITHMS", "NOISE", "ERROR CORRECTION", "HARDWARE", "EXPERIMENTS"];

export default function GlossaryPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const filtered = useMemo(() => terms.filter((term) => (category === "ALL" || term[2] === category) && `${term[0]} ${term[1]}`.toLowerCase().includes(query.trim().toLowerCase())), [query, category]);

  function resetFilters() {
    setQuery("");
    setCategory("ALL");
  }

  return <div className="page-wrap inner-page glossary-page">
    <div className="breadcrumb"><Link href="/"><ArrowLeft size={14} aria-hidden="true" /> Overview</Link><span>/</span><span>Glossary</span></div>
    <section className="page-intro glossary-intro"><div><div className="eyebrow"><span className="eyebrow-line" /> THE REFERENCE DESK</div><h1>Quantum, <em>defined.</em></h1><p>Concise definitions for the mathematics, circuits, algorithms, and experimental methods used throughout the course.</p></div><div className="glossary-count"><strong>{String(filtered.length).padStart(2, "0")}</strong><span>OF {terms.length} CONCEPTS</span></div></section>
    <div className="glossary-tools"><label className="search-field"><Search size={16} aria-hidden="true" /><span className="sr-only">Search concepts</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a term or definition…" /></label><div className="category-filter" aria-label="Filter by category">{categories.map((item) => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)} className={category === item ? "filter-active" : ""}>{item === "ALL" ? "All" : item.toLowerCase()}</button>)}</div></div>
    <div className="glossary-list" aria-live="polite">{filtered.map((term, index) => <article className="glossary-item" key={term[0]}><span className="glossary-index">{String(index + 1).padStart(2, "0")}</span><div><span className="track-level">{term[2]}</span><h2>{term[0]}</h2><p>{term[1]}</p></div><ArrowUpRight className="glossary-arrow" size={16} aria-hidden="true" /></article>)}
      {filtered.length === 0 && <div className="empty-state"><h2>No concepts match that search.</h2><p>Try another term or clear the category filter.</p><button type="button" className="button-secondary" onClick={resetFilters}>Reset search and filters</button></div>}
    </div>
    <div className="glossary-bottom"><p>Definitions are kept short here; the curriculum develops each idea with examples and experiments.</p><Link href="/curriculum">Explore the lessons <ArrowRightIcon /></Link></div>
  </div>;
}

function ArrowRightIcon() {
  return <ArrowUpRight size={14} aria-hidden="true" />;
}
