export type Lesson = {
  id: string;
  title: string;
  duration: string;
  level: string;
  objective: string;
  sections: { heading: string; paragraphs: string[]; equation?: string; note?: string }[];
  example: { title: string; steps: string[]; result: string };
  experiment: { title: string; description: string; steps: string[]; preset?: string };
  checkpoint: { question: string; options: string[]; answer: number; explanation: string };
};

export type Module = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  audience: string;
  outcomes: string[];
  lessons: Lesson[];
  references: { label: string; href: string }[];
};

const basics = [
  { label: "IBM Quantum Learning · Basics of quantum information", href: "https://quantum.cloud.ibm.com/learning/en/courses/basics-of-quantum-information" },
];

export const modules: Module[] = [
  {
    id: "orientation", number: "01", title: "Start with the physics", subtitle: "A careful mental model before the mathematics.", audience: "No background assumed", outcomes: ["Distinguish quantum information from classical information", "Predict measurement outcomes from a state", "Explain what superposition does and does not mean"], references: basics,
    lessons: [
      {
        id: "quantum-computing", title: "What a quantum computer computes", duration: "12 min", level: "START HERE", objective: "Describe the circuit model and where a quantum advantage could come from.",
        sections: [
          { heading: "Information has a physical carrier", paragraphs: ["A classical computer stores information in physical systems that are engineered to behave like bits. A quantum computer stores and transforms quantum states. In the circuit model, a computation prepares qubits, applies gates, and measures selected outputs.", "A quantum processor is not a faster version of every laptop task. Its value depends on matching a problem to an algorithm whose structure can be exploited by quantum operations, while accounting for data loading, circuit depth, error rates, and the cost of reading results."] },
          { heading: "The computation is a sequence", paragraphs: ["A circuit is a mathematical recipe as well as a hardware instruction. Before measurement, an ideal closed-system circuit evolves linearly and reversibly. Measurement produces ordinary classical data, so the final result is usually a distribution of answers rather than a complete list of all amplitudes.", "This course keeps three layers separate: the mathematical model, the algorithm, and the physical device. A simulator can teach the first two without claiming to be quantum hardware."] },
        ],
        example: { title: "A one-qubit computation", steps: ["Prepare the qubit in |0⟩.", "Apply a Hadamard gate, H.", "Measure in the computational basis."], result: "An ideal measurement returns 0 or 1 with equal probability. Repeating the circuit estimates that distribution; one run does not reveal both possibilities." },
        experiment: { title: "Run your first circuit", description: "Use the local lab to prepare a balanced state and see the difference between probabilities and finite samples.", steps: ["Open the lab preset for a balanced superposition.", "Run 20 shots, then 1,000 shots.", "Compare the observed frequency with the 50% prediction."], preset: "superposition" },
        checkpoint: { question: "What does a quantum circuit return after measurement?", options: ["Every answer encoded in its superposition", "A classical outcome sampled according to the measurement probabilities", "A guaranteed correct answer"], answer: 1, explanation: "Measurement produces a classical outcome. Repeated shots estimate probabilities, and the algorithm must arrange those probabilities to make useful answers likely." },
      },
      {
        id: "qubit-state", title: "A qubit is a state, not a tiny coin", duration: "15 min", level: "CORE IDEA", objective: "Read a pure qubit state and distinguish amplitudes from probabilities.",
        sections: [
          { heading: "Two basis states, many possible states", paragraphs: ["Choose computational basis states |0⟩ and |1⟩. A pure qubit can be written as a normalized linear combination of them. The coefficients are complex amplitudes: they are not ordinary probabilities, even though they determine the probabilities of measurement outcomes.", "Normalization constrains the state so that the total probability of all outcomes is one. The relative phase between amplitudes is physically meaningful: later gates can turn that phase difference into a change in measurement statistics."] , equation: "|ψ⟩ = α|0⟩ + β|1⟩,   |α|² + |β|² = 1"},
          { heading: "The measurement rule", paragraphs: ["A computational-basis measurement returns 0 with probability |α|² and 1 with probability |β|². For example, if α = 1/√2 and β = 1/√2, both outcomes have probability 1/2. If β = i/√2 instead, those same Z-basis probabilities remain 1/2, but the state is different and can behave differently in another basis.", "A state vector is therefore more informative than a list of probabilities in one basis. The basis is part of the measurement question."] },
        ],
        example: { title: "From amplitudes to probabilities", steps: ["Take |ψ⟩ = (√3/2)|0⟩ + (1/2)|1⟩.", "Square the magnitude of each amplitude.", "Check that the two probabilities add to one."], result: "P(0) = 3/4, P(1) = 1/4. The amplitudes themselves are not 75% and 25%." },
        experiment: { title: "Change the state, predict the result", description: "Prepare different states with an Ry rotation and predict the Z-basis counts before running shots.", steps: ["Start from the empty |0⟩ circuit and add Ry(θ) to q0.", "Try θ = 0°, 60°, 90°, and 180°.", "For each angle use P(0) = cos²(θ/2), then compare shots with your prediction."] },
        checkpoint: { question: "A qubit has amplitudes α = 0.6 and β = 0.8. What is P(1) in the computational basis?", options: ["0.8", "0.64", "0.36"], answer: 1, explanation: "Born's rule squares the magnitude: |0.8|² = 0.64. The normalization check is 0.36 + 0.64 = 1." },
      },
      {
        id: "measurement-bases", title: "Measurement asks a basis-dependent question", duration: "14 min", level: "CORE IDEA", objective: "Predict how the same state looks under Z, X, and Y measurements.",
        sections: [
          { heading: "A measurement is defined by outcomes and basis states", paragraphs: ["Computational-basis measurement distinguishes |0⟩ from |1⟩; this is commonly called a Z measurement. The X basis is |+⟩ and |−⟩, equal superpositions with opposite relative phase. The Y basis uses the corresponding eigenstates of the Pauli Y operator.", "Changing the basis changes the question asked of the same state. For |+⟩, a Z measurement is random, while an X measurement returns + with certainty. This is a concrete way to see why listing only Z-basis probabilities does not fully specify a quantum state."] , equation: "|+⟩ = (|0⟩ + |1⟩)/√2,   |−⟩ = (|0⟩ − |1⟩)/√2"},
          { heading: "Measurement and state update", paragraphs: ["In the ideal projective model, after an outcome is observed, the state is updated to the corresponding measurement eigenstate. If the same basis is measured immediately again, that same outcome repeats. If an incompatible basis is measured next, the distribution can change.", "Real experiments have finite detector efficiency and noise. Those are separate physical effects added to the ideal measurement model; they should not be confused with the Born probabilities themselves."] },
        ],
        example: { title: "Measure |+⟩ two ways", steps: ["Prepare |+⟩ = H|0⟩.", "Measure Z: both computational outcomes are equally likely.", "Measure X: the state is the + eigenstate."], result: "Z is random; X returns + with probability one in the ideal model." },
        experiment: { title: "Rotate the measurement question", description: "The lab can apply basis rotations before its final Z measurement, which is equivalent to measuring another Pauli basis.", steps: ["Load the balanced-state preset.", "Run it in Z, then X, then Y basis.", "Explain why only the X measurement is deterministic."], preset: "superposition" },
        checkpoint: { question: "For |+⟩, which ideal measurement returns a deterministic result?", options: ["Z only", "X only", "Both X and Z"], answer: 1, explanation: "|+⟩ is an eigenstate of X, so X measurement is deterministic. In the computational Z basis its amplitudes have equal magnitude." },
      },
    ],
  },
  {
    id: "mathematics", number: "02", title: "The mathematical language", subtitle: "Build the small amount of linear algebra every circuit uses.", audience: "Foundations → intermediate", outcomes: ["Normalize a state vector", "Use bras, kets, and inner products", "Combine systems with tensor products"], references: basics,
    lessons: [
      {
        id: "complex-amplitudes", title: "Complex numbers and phase", duration: "18 min", level: "MATHEMATICS", objective: "Use magnitude and phase to interpret complex amplitudes.",
        sections: [
          { heading: "Magnitude sets a probability", paragraphs: ["A complex amplitude z = a + ib has magnitude |z| = √(a² + b²). Born's rule uses its squared magnitude, |z|² = a² + b². The argument of z is its phase. A complex phase does not make a probability negative; probabilities remain real and non-negative.", "A global phase multiplying every amplitude in a state has no observable effect on that state. A relative phase between components can affect interference, so it cannot generally be discarded."] , equation: "z = r e^{iφ},   |z|² = r²"},
          { heading: "Why phase matters", paragraphs: ["When alternatives can lead to the same observed outcome, quantum amplitudes add before probabilities are computed. If their phases align, the combined amplitude grows; if they oppose, it can shrink or cancel. This is the mechanism behind interference, not a hidden ability to read every branch.", "This addition rule is why quantum algorithms need carefully chosen gates. Randomly placing a superposition in a circuit does not by itself create a useful speedup."] },
        ],
        example: { title: "Two paths into one outcome", steps: ["Add amplitudes 1/√2 and −1/√2 for the same outcome.", "The total amplitude is zero.", "Square its magnitude to obtain the probability."], result: "The probability is zero: destructive interference removes that outcome." },
        experiment: { title: "Watch phase become observable", description: "Compare circuits that differ only by a phase gate between two Hadamards.", steps: ["Run H then H and note the result.", "Insert Z between the Hadamards.", "Compare the final Z-basis distribution."], preset: "phase-interference" },
        checkpoint: { question: "What determines the probability associated with a complex amplitude z?", options: ["Its real part", "Its phase", "Its squared magnitude |z|²"], answer: 2, explanation: "Born's rule assigns probability |z|². Phase can influence later interference, but is not itself a probability." },
      },
      {
        id: "vectors-dirac", title: "Vectors, bases, and Dirac notation", duration: "20 min", level: "MATHEMATICS", objective: "Translate between column vectors and Dirac notation.",
        sections: [
          { heading: "Kets are column vectors", paragraphs: ["In the computational basis, |0⟩ is the column (1, 0)ᵀ and |1⟩ is (0, 1)ᵀ. A state α|0⟩ + β|1⟩ is the column (α, β)ᵀ. A basis is a set of vectors used to express every vector in the space.", "A bra is the conjugate transpose of a ket. Conjugation matters: if |ψ⟩ = (α, β)ᵀ, then ⟨ψ| = (α*, β*). The inner product ⟨φ|ψ⟩ is a complex overlap, and its squared magnitude gives the probability of projecting one normalized state onto another."] , equation: "|ψ⟩ = (α, β)ᵀ,   ⟨ψ| = (α*, β*)"},
          { heading: "A basis changes coordinates, not the system", paragraphs: ["The same state can be described in the Z, X, or Y basis. A basis change is a coordinate transformation represented by a unitary matrix. When a circuit applies a basis-changing gate before a standard measurement, it implements the equivalent measurement in the original basis.", "The notation is compact but literal: kets represent vectors, bras represent conjugate-transposed vectors, and operators map vectors to vectors."] },
        ],
        example: { title: "An inner product", steps: ["Let |0⟩ = (1,0)ᵀ and |+⟩ = (1,1)ᵀ/√2.", "Compute ⟨0|+⟩ = 1/√2.", "Square the magnitude for the probability."], result: "A Z measurement of |+⟩ returns 0 with probability |1/√2|² = 1/2." },
        experiment: { title: "Connect basis rotations to coordinates", description: "Compare the visual state and measurement results after applying H twice; H is its own inverse.", steps: ["Run H on |0⟩ and inspect the output state.", "Apply H again.", "Check that the state returns to |0⟩, up to a physically irrelevant global phase."], preset: "phase-interference" },
        checkpoint: { question: "Why is a bra formed using a complex conjugate transpose?", options: ["To keep inner products consistent with complex vector geometry", "To make every state real", "To turn amplitudes directly into probabilities"], answer: 0, explanation: "The conjugate transpose defines the standard inner product on complex vector spaces. Probabilities still require squared magnitudes." },
      },
      {
        id: "tensor-products", title: "Tensor products and multi-qubit space", duration: "22 min", level: "MULTI-QUBIT MATH", objective: "Write basis states for two qubits and count the state-vector dimension.",
        sections: [
          { heading: "Combining two systems", paragraphs: ["The joint state space of two qubits is the tensor product of their individual state spaces. The computational basis is |00⟩, |01⟩, |10⟩, |11⟩, so a general pure state has four complex amplitudes. With n qubits, the state vector has 2ⁿ complex entries.", "The ordering convention must be stated when mapping bitstrings to vector indices. This course labels q0 as the leftmost displayed bit in its simulator. Other software can use a different indexing convention, so circuit diagrams and output strings should always be checked."] , equation: "|0⟩ ⊗ |1⟩ = |01⟩;   dim(ℋₙ) = 2ⁿ"},
          { heading: "Exponential description is not free computation", paragraphs: ["A generic n-qubit pure state needs exponentially many amplitudes to write down classically. This is one reason classical simulation becomes expensive. But a quantum computer does not let us read all 2ⁿ amplitudes in one shot; measurement yields limited classical information.", "Useful algorithms exploit structure in the state and in the task. Entanglement and interference are resources, but they do not automatically imply an advantage."] },
        ],
        example: { title: "Build |10⟩", steps: ["Take the first qubit in |1⟩ and the second in |0⟩.", "Form the tensor product |1⟩ ⊗ |0⟩.", "Use the stated bit ordering."], result: "The joint basis state is |10⟩, represented by the third basis vector under the order 00, 01, 10, 11." },
        experiment: { title: "Create a two-qubit state", description: "Use the Bell-state preset and inspect the four possible basis outcomes.", steps: ["Prepare H on q0 followed by CNOT(q0 → q1).", "Run repeated Z-basis shots.", "Notice that only 00 and 11 appear, although each individual qubit is balanced."], preset: "bell" },
        checkpoint: { question: "How many complex amplitudes describe a pure state of four qubits?", options: ["8", "16", "32"], answer: 1, explanation: "An n-qubit state has 2ⁿ computational-basis amplitudes. For n = 4, that is 16." },
      },
    ],
  },
  {
    id: "single-qubit", number: "03", title: "The single-qubit laboratory", subtitle: "Prepare, rotate, and measure states with real quantum gates.", audience: "Foundations → intermediate", outcomes: ["Interpret X, Y, Z, H, S, and T gates", "Track global and relative phase", "Read a qubit on the Bloch sphere"], references: basics,
    lessons: [
      {
        id: "pauli-gates", title: "X, Y, and Z: the Pauli gates", duration: "18 min", level: "GATES", objective: "Predict the action of each Pauli operator on |0⟩ and |1⟩.",
        sections: [
          { heading: "Three fundamental rotations", paragraphs: ["The Pauli X gate swaps |0⟩ and |1⟩. Pauli Z leaves |0⟩ unchanged and adds a minus sign to |1⟩. Pauli Y combines a bit flip and a phase change: Y|0⟩ = i|1⟩ and Y|1⟩ = −i|0⟩.", "Each Pauli gate is unitary and self-inverse. On the Bloch sphere, X, Y, and Z are π rotations about their respective axes. These gates provide a compact language for state preparation, basis changes, and error models."] , equation: "X = [[0,1],[1,0]],   Z = [[1,0],[0,−1]]"},
          { heading: "Relative phase changes later outcomes", paragraphs: ["A Z gate on |+⟩ produces |−⟩. Those states have identical Z-basis probabilities but opposite X-basis outcomes. A phase is therefore invisible to one measurement and visible to another.", "Do not treat a minus sign on one component as a small probability change. It is an amplitude relationship that can produce cancellation or reinforcement after a later gate."] },
        ],
        example: { title: "Follow a state through Z", steps: ["Prepare |+⟩ = (|0⟩ + |1⟩)/√2.", "Apply Z to get (|0⟩ − |1⟩)/√2 = |−⟩.", "Measure X."], result: "The X measurement returns − with certainty in the ideal model." },
        experiment: { title: "Measure phase with interference", description: "A Z gate does not change computational-basis probabilities, but it does change what happens after H.", steps: ["Run the loaded H–Z–H preset from |0⟩ in the Z basis.", "Reset, then add H twice and run again.", "Explain why H–H returns 0 while H–Z–H returns 1."], preset: "phase-interference" },
        checkpoint: { question: "What does Z do to |+⟩?", options: ["Leaves it unchanged", "Turns it into |−⟩", "Turns it into |1⟩"], answer: 1, explanation: "Z changes the sign of the |1⟩ component, mapping |+⟩ to |−⟩." },
      },
      {
        id: "hadamard", title: "Hadamard, superposition, and interference", duration: "20 min", level: "GATES", objective: "Use H to create a basis change and predict interference patterns.",
        sections: [
          { heading: "Hadamard changes basis", paragraphs: ["The Hadamard gate maps |0⟩ to |+⟩ and |1⟩ to |−⟩. It is its own inverse: H² = I. Applying it twice returns the original state because the two basis amplitudes recombine with the right relative signs.", "The phrase 'creates a superposition' describes a state relative to a chosen basis. |+⟩ is a superposition in the Z basis and a definite eigenstate in the X basis. Neither description is the unique classical picture of the qubit."] , equation: "H = (1/√2)[[1,1],[1,−1]]"},
          { heading: "Interference is an operation on amplitudes", paragraphs: ["After H, the two amplitudes contribute to the next transformation. H|+⟩ = |0⟩ because the |1⟩ contributions cancel. H|−⟩ = |1⟩ because they reinforce in the other output. The gate turns relative phase into a measurable probability difference.", "This is a useful miniature of quantum algorithms: they arrange phases so that desired outcomes receive larger amplitudes and undesired outcomes cancel. It is not simply parallel computation followed by reading every answer."] },
        ],
        example: { title: "Two Hadamards", steps: ["Start in |0⟩.", "The first H makes |+⟩.", "The second H recombines the amplitudes."], result: "H·H|0⟩ = |0⟩. The intermediate 50/50 distribution does not imply a random final result." },
        experiment: { title: "See cancellation in the lab", description: "Run H–H and H–Z–H and compare the two final distributions.", steps: ["Use the interference preset.", "Run the circuit and record the dominant outcome.", "Remove Z and run again to see the cancellation reverse."], preset: "phase-interference" },
        checkpoint: { question: "Why does H–H return |0⟩ when starting from |0⟩?", options: ["The first measurement resets the qubit", "The second H recombines amplitudes using their relative signs", "H destroys phase"], answer: 1, explanation: "No measurement occurs between the gates. The second Hadamard coherently recombines amplitudes, and H² = I." },
      },
      {
        id: "bloch-sphere", title: "The Bloch sphere and rotations", duration: "22 min", level: "VISUAL MODEL", objective: "Relate polar and azimuthal angles to a pure qubit state.",
        sections: [
          { heading: "A geometric map for pure single-qubit states", paragraphs: ["Ignoring a global phase, any pure qubit can be written cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩. The Bloch sphere maps this state to a point with polar angle θ and azimuth φ. The north and south poles are |0⟩ and |1⟩; the equator contains equal-magnitude superpositions.", "The sphere is a representation of state, not a physical tiny globe inside the processor. Opposite points correspond to orthogonal states. The surface represents pure states; points inside the sphere describe mixed states, introduced later."] , equation: "(x,y,z) = (sinθ cosφ, sinθ sinφ, cosθ)"},
          { heading: "Gates move the point", paragraphs: ["Single-qubit unitary gates act as rotations of the Bloch sphere, up to an irrelevant global phase. Rotations about X, Y, and Z are parameterized by angles. The order of rotations matters: rotating about X then Y generally differs from Y then X.", "A Z-basis measurement has outcome probabilities (1+z)/2 for 0 and (1−z)/2 for 1. The sphere makes this probability relation visible while phase is encoded in the x and y coordinates."] },
        ],
        example: { title: "Locate |+⟩", steps: ["For |+⟩, θ = 90° and φ = 0°.", "Substitute into the coordinate formula.", "Read the measurement probabilities from z = 0."], result: "The point is (1, 0, 0), on the +x equator. A Z measurement is balanced; an X measurement is deterministic." },
        experiment: { title: "Move around the sphere", description: "Prepare a state with Ry(θ) followed by Rz(φ), then compare its coordinates and measurement probabilities.", steps: ["Start with |0⟩ and add Ry(90°) followed by Rz(φ) to q0.", "Vary φ from 0° through 360° and watch the Bloch vector move around the equator.", "Watch Z probabilities stay balanced, then switch basis and observe the phase dependence."] },
        checkpoint: { question: "Where on the Bloch sphere is |1⟩?", options: ["North pole", "Equator at +x", "South pole"], answer: 2, explanation: "By convention |0⟩ is the north pole (z = +1) and |1⟩ the south pole (z = −1)." },
      },
    ],
  },
  {
    id: "circuits", number: "04", title: "Circuits and algorithmic thinking", subtitle: "Compose gates, reason about order, and design interference.", audience: "Intermediate", outcomes: ["Read and compose a circuit", "Explain why gates are reversible", "Understand the oracle model and phase kickback"], references: [
      { label: "IBM Quantum Learning · Bits, gates, and circuits", href: "https://quantum.cloud.ibm.com/learning/en/courses/utility-scale-quantum-computing/bits-gates-and-circuits" },
    ],
    lessons: [
      {
        id: "read-circuits", title: "Read a circuit as a program", duration: "18 min", level: "CIRCUITS", objective: "Trace a circuit from input state through gates to measurement.",
        sections: [
          { heading: "Wires are systems, boxes are operations", paragraphs: ["A circuit diagram draws each qubit as a horizontal wire. Gates are applied left to right in time. A meter marks where a quantum measurement converts a qubit outcome into a classical bit. Multi-qubit symbols such as CNOT connect wires to show a joint operation.", "Circuit order is operator order in reverse notation: if H is followed by X, the output is XH|ψ⟩. Reading left to right means operations act in the order drawn, while matrix products are applied right to left to column vectors."] },
          { heading: "Measurements divide coherent evolution", paragraphs: ["Before measurement, the ideal circuit evolves coherently. Once a measurement is made, the observed classical result can be used by later classical control; that is a different circuit structure from simply applying a unitary gate.", "The simulator in this course evaluates a small ideal state vector. It does not model hardware timing, connectivity restrictions, leakage, or calibrated gate errors unless a lesson explicitly adds a noise model."] },
        ],
        example: { title: "Trace X then H", steps: ["Start with |0⟩.", "Apply X to get |1⟩.", "Apply H to get |−⟩."], result: "A Z measurement is balanced. An X measurement returns − with certainty." },
        experiment: { title: "Compose a circuit", description: "Build a circuit in the lab and compare it with a hand prediction.", steps: ["Set q0 to |0⟩ and apply X, H, X.", "Write each intermediate state before running.", "Measure in Z, then repeat in X."], preset: "single-gate" },
        checkpoint: { question: "If a circuit shows H followed by X from left to right, what is the final state?", options: ["HX|ψ⟩", "XH|ψ⟩", "H + X applied together"], answer: 1, explanation: "The first operation is H, then X. Column-vector notation therefore gives XH|ψ⟩." },
      },
      {
        id: "unitary-reversibility", title: "Why ideal gates are reversible", duration: "18 min", level: "MATHEMATICAL STRUCTURE", objective: "Explain unitarity and identify the inverse of a gate.",
        sections: [
          { heading: "Unitary transformations preserve total probability", paragraphs: ["An ideal gate is represented by a unitary matrix U, satisfying U†U = I. This condition preserves inner products and vector length, so a normalized state remains normalized. The inverse operation is U†.", "Quantum gates are reversible because unitary evolution is reversible. Measurement is different: it maps quantum information to a classical outcome and is not a unitary operation. Classical logic can be irreversible too, but a quantum circuit must account for discarded information if it wants a reversible implementation."] , equation: "U†U = I;   U⁻¹ = U†"},
          { heading: "Reversibility has algorithmic consequences", paragraphs: ["A classical AND gate loses information about its inputs when only its output is kept. A reversible circuit stores enough information to undo the computation, often using extra workspace qubits called ancillas. Those ancillas must usually be uncomputed to avoid leaving unwanted correlations.", "The same idea appears in quantum oracles. Compute a function into a target register, use it to mark a phase or control an operation, then uncompute the workspace."] },
        ],
        example: { title: "Undo a rotation", steps: ["Apply Rz(θ) to a state.", "Apply Rz(−θ), its inverse.", "The combined operation is identity."], result: "The state returns to its starting point, up to numerical precision and a possible global phase." },
        experiment: { title: "Undo your circuit", description: "Choose a short unitary sequence and apply its inverse in reverse order.", steps: ["Apply H, then S, then X.", "Apply X, then S†, then H.", "Measure: the initial state should be recovered."], preset: "single-gate" },
        checkpoint: { question: "What condition makes a matrix a valid ideal quantum gate?", options: ["It has only real entries", "It is unitary: U†U = I", "Its entries sum to one"], answer: 1, explanation: "Unitarity preserves inner products and normalization in ideal closed-system evolution." },
      },
      {
        id: "oracles-phase-kickback", title: "Oracles and phase kickback", duration: "24 min", level: "ALGORITHM DESIGN", objective: "Explain how a reversible oracle can encode a property as a phase.",
        sections: [
          { heading: "An oracle is a specified subroutine", paragraphs: ["In query-complexity analysis, an oracle is a black-box operation that answers a defined question about an input. It does not mean the quantum computer magically knows the answer. The oracle must be implemented from the problem or supplied as part of the model.", "A reversible Boolean oracle commonly maps |x⟩|y⟩ to |x⟩|y ⊕ f(x)⟩. By preparing the target in |−⟩, the XOR changes only its sign when f(x)=1; the function value is transferred to a phase on |x⟩. This is phase kickback."] , equation: "U_f|x⟩|y⟩ = |x⟩|y ⊕ f(x)⟩"},
          { heading: "A speedup needs a full cost model", paragraphs: ["Query complexity counts oracle calls, not necessarily the cost of constructing the oracle, loading data, correcting errors, or reading the answer. A fair comparison states the computational model and includes relevant resource costs.", "Phase kickback is a technique, not an advantage by itself. It becomes useful when a circuit uses the phase information to create constructive and destructive interference among possible outputs."] },
        ],
        example: { title: "Mark one basis state", steps: ["Prepare a superposition over candidate inputs.", "Apply an oracle that flips the phase of the marked input.", "Use a diffusion step to amplify its amplitude."], result: "The phase marks the candidate without measuring it; the subsequent algorithm converts that mark into a larger output probability." },
        experiment: { title: "See phase marking in a tiny search", description: "Try the two-qubit Grover preset and inspect how the marked outcome changes after one iteration.", steps: ["Load the two-qubit Grover circuit.", "Run 1,000 shots.", "Change the marked state in the circuit and explain the new result."], preset: "grover-2" },
        checkpoint: { question: "What does an oracle provide in an algorithm model?", options: ["A free answer to the entire problem", "A defined operation that answers a particular query", "A physical quantum processor"], answer: 1, explanation: "An oracle is a specified subroutine. Its construction and implementation costs still matter in practical comparisons." },
      },
    ],
  },
  {
    id: "multi-qubit", number: "05", title: "Many qubits and quantum information", subtitle: "From tensor products to correlations that have no classical product-state model.", audience: "Intermediate → advanced", outcomes: ["Distinguish product and entangled states", "Predict CNOT and Bell-state outcomes", "Describe teleportation without faster-than-light claims"], references: basics,
    lessons: [
      {
        id: "controlled-gates", title: "CNOT and controlled operations", duration: "20 min", level: "MULTI-QUBIT", objective: "Apply a controlled gate to computational-basis inputs.",
        sections: [
          { heading: "A gate whose action depends on a control", paragraphs: ["CNOT has a control qubit and a target qubit. If the control is |0⟩, the target is unchanged; if the control is |1⟩, X is applied to the target. On basis states, CNOT maps |a,b⟩ to |a, b ⊕ a⟩.", "The operation is linear, so its effect on superpositions follows by applying it to each component and adding the resulting amplitudes. A superposed control can therefore become correlated with the target."] , equation: "CNOT|a,b⟩ = |a, b ⊕ a⟩"},
          { heading: "Control and target are not interchangeable", paragraphs: ["CNOT is generally asymmetric: swapping the control and target changes the operation. Gate diagrams show this with a filled control dot and a target symbol. Simulator labels should state the direction explicitly to avoid a common source of mistakes.", "Controlled operations are universal building blocks for multi-qubit computation when combined with suitable single-qubit gates."] },
        ],
        example: { title: "CNOT on a superposition", steps: ["Prepare H|0⟩ on q0 and |0⟩ on q1.", "Apply CNOT with q0 as control and q1 as target.", "Expand the result linearly."], result: "The output is (|00⟩ + |11⟩)/√2, a Bell state." },
        experiment: { title: "Change the control direction", description: "Compare CNOT(q0 → q1) with CNOT(q1 → q0) on a non-symmetric input.", steps: ["Start a two-qubit circuit and add X to q0 to prepare |10⟩.", "Add CNOT with q0 control and q1 target, then run.", "Reset, prepare |10⟩ again, reverse the control and target, and compare."], preset: "bell" },
        checkpoint: { question: "What does CNOT do to |10⟩ when the first qubit is the control?", options: ["|10⟩", "|11⟩", "|01⟩"], answer: 1, explanation: "The control is 1, so X flips the target from 0 to 1: |10⟩ becomes |11⟩." },
      },
      {
        id: "bell-entanglement", title: "Bell states and entanglement", duration: "22 min", level: "ENTANGLEMENT", objective: "Recognize a Bell state and explain why it is not a product of single-qubit states.",
        sections: [
          { heading: "Correlated outcomes from a joint state", paragraphs: ["The state (|00⟩ + |11⟩)/√2 is a Bell state. Measuring both qubits in Z gives 00 or 11, each with probability one half. Each individual result is random, while the pair is perfectly correlated.", "The state cannot be factored as |a⟩⊗|b⟩ for single-qubit pure states. It is entangled. In a different measurement basis, the joint correlations also depend on coherent phase relationships, which distinguish entanglement from a classical mixture that merely contains 00 and 11 half the time."] , equation: "|Φ⁺⟩ = (|00⟩ + |11⟩)/√2"},
          { heading: "Correlation does not send a message", paragraphs: ["Entangled outcomes are correlated, but one observer cannot choose their random local outcome to encode a message. The correlations appear when records are compared through an ordinary classical channel.", "Entanglement is a property of the joint state and its possible correlations. It does not mean particles transmit usable information faster than light."] },
        ],
        example: { title: "Product state or Bell state?", steps: ["Measure each qubit of |+⟩⊗|0⟩ in Z.", "Measure each qubit of |Φ⁺⟩ in Z.", "Compare single-qubit marginals and pair correlations."], result: "Both examples can have a random first-qubit result in a suitable preparation, but the Bell state's outcomes are correlated while the product state's are independent." },
        experiment: { title: "Measure Bell correlations", description: "Run the Bell preset and compare local randomness with the joint histogram.", steps: ["Prepare H on q0 and CNOT(q0 → q1).", "Collect 1,000 Z-basis shots.", "Check that each bit is near 50/50 while mismatched pairs are absent ideally."], preset: "bell" },
        checkpoint: { question: "In an ideal Z measurement of |Φ⁺⟩, which outcomes can occur?", options: ["00 and 11", "01 and 10", "All four equally"], answer: 0, explanation: "Only the two basis components present in the Bell state can appear in a Z-basis measurement." },
      },
      {
        id: "bell-tests-teleportation", title: "Bell tests and quantum teleportation", duration: "24 min", level: "QUANTUM INFORMATION", objective: "State what a Bell experiment tests and what teleportation actually transfers.",
        sections: [
          { heading: "Bell inequalities test correlation models", paragraphs: ["A Bell experiment chooses measurement settings on separated parts of an entangled system and compares the resulting correlations. Under assumptions including locality and measurement independence, local hidden-variable models obey Bell inequalities. Quantum mechanics predicts violations for suitable states and settings.", "A valid experiment must address loopholes such as detection losses and communication between measurement stations. A classroom state-vector simulation can illustrate ideal correlations, but it is not an experimental Bell test and cannot establish a physical violation."] },
          { heading: "Teleportation transfers a quantum state using classical communication", paragraphs: ["Quantum teleportation uses a shared entangled pair, a joint measurement, and two classical bits sent from the sender to the receiver. The receiver applies a correction conditioned on those bits. The original unknown state is not copied; the protocol consumes the shared entanglement and respects the no-cloning theorem.", "The protocol does not move matter or permit faster-than-light communication. Before the classical message arrives, the receiver's state is not the original state."] },
        ],
        example: { title: "Teleportation resources", steps: ["Share one Bell pair.", "Measure the input qubit together with the sender's half of the pair.", "Send two classical bits and apply the corresponding correction."], result: "One unknown qubit state is reconstructed at the receiver; the original is destroyed by the measurement." },
        experiment: { title: "Audit a Bell-state experiment", description: "Use the Bell circuit to separate simulator predictions from what a laboratory would need to establish.", steps: ["Record the ideal joint outcomes in the simulator.", "List the physical assumptions absent from this model: detector loss, setting choice, and space-like separation.", "Explain why matching a simulated histogram is not a loophole-free Bell test."], preset: "bell" },
        checkpoint: { question: "Which resource is required before teleportation can complete?", options: ["A faster-than-light signal", "Two classical bits from the sender", "A second copy of the unknown state"], answer: 1, explanation: "The protocol needs two classical bits so the receiver can apply the appropriate correction." },
      },
    ],
  },
  {
    id: "algorithms", number: "06", title: "Quantum algorithms", subtitle: "Study the ideas behind search, phase estimation, and factoring without the hype.", audience: "Intermediate → advanced", outcomes: ["Explain amplitude amplification", "Describe the role of the quantum Fourier transform", "Compare query speedups with practical costs"], references: [
      { label: "IBM Quantum Learning · Grover's algorithm", href: "https://quantum.cloud.ibm.com/learning/en/modules/computer-science/grovers" },
      { label: "IBM Quantum Learning · Modules and algorithms", href: "https://quantum.cloud.ibm.com/learning/en/modules" },
    ],
    lessons: [
      {
        id: "deutsch-jozsa", title: "Deutsch–Jozsa and promise problems", duration: "22 min", level: "ALGORITHM", objective: "Explain a simple oracle problem where interference reveals a global property.",
        sections: [
          { heading: "The promise is part of the problem", paragraphs: ["The Deutsch–Jozsa problem promises that a Boolean function is either constant or balanced. A classical deterministic algorithm may need exponentially many queries in the number of input bits in the worst case to be certain of the answer. The ideal quantum algorithm solves the promise problem with one oracle query.", "This result demonstrates a query-complexity separation, not a general speedup for arbitrary data processing. The oracle model and promise must be included in any precise statement of the result."] },
          { heading: "Interference extracts a global property", paragraphs: ["The circuit prepares a superposition, queries the oracle in a phase-sensitive way, and applies Hadamards again. Amplitudes associated with inputs combine so the all-zero outcome distinguishes the constant case from the balanced case in the ideal model.", "A one-query algorithm is only useful if the oracle is available at reasonable cost and the problem really satisfies the promise. For one input bit, the related Deutsch problem gives an especially small circuit to inspect by hand."] },
        ],
        example: { title: "One-bit Deutsch problem", steps: ["A function f maps one bit to one bit and is promised constant or balanced.", "Query the function in a superposition of inputs 0 and 1.", "Use a final Hadamard to make the alternatives interfere."], result: "An ideal measurement reveals whether f(0) and f(1) are equal, using one query." },
        experiment: { title: "Trace a one-query algorithm", description: "Use the one-qubit interference circuit to see how a relative sign changes a final measurement.", steps: ["Prepare |+⟩.", "Apply either I or Z to represent a phase response.", "Apply H and measure the result."], preset: "phase-interference" },
        checkpoint: { question: "What is the Deutsch–Jozsa speedup statement about?", options: ["All real-world computations", "A promised oracle problem and query complexity", "Quantum computers never need input data"], answer: 1, explanation: "The result is a query-complexity separation under a specific promise. It is not a blanket claim about practical runtime." },
      },
      {
        id: "grover", title: "Grover search and amplitude amplification", duration: "26 min", level: "ALGORITHM", objective: "Explain why Grover's algorithm gives a quadratic query improvement for unstructured search.",
        sections: [
          { heading: "Mark, then amplify", paragraphs: ["Grover's algorithm starts with a uniform superposition, uses an oracle to flip the phase of marked solutions, and applies a diffusion operation that reflects amplitudes about their mean. Repeating this pair of operations rotates the state toward the marked subspace.", "For one marked item among N unstructured possibilities, the query count is Θ(√N), compared with Θ(N) classical oracle queries. With multiple marked items, the number of iterations depends on their fraction of the search space; too many iterations can rotate past the best success probability."] , equation: "T_query = Θ(√(N/M)) for M marked items among N"},
          { heading: "A quadratic speedup is not an exponential one", paragraphs: ["Grover provides a quadratic improvement in the black-box search model. It does not make exponentially large searches easy by itself, and structured problems may admit better classical algorithms. Oracle construction, gate count, error correction, and repeated verification all affect practical cost.", "The two-qubit toy circuit in this lab uses an ideal oracle implemented as a controlled phase. It demonstrates amplitude amplification, not a scalable hardware result."] },
        ],
        example: { title: "Search four items", steps: ["Create equal amplitudes over 00, 01, 10, 11.", "Phase-mark one state with CZ or an equivalent oracle.", "Apply the two-qubit diffusion operator once."], result: "In the ideal two-qubit case, one iteration moves all amplitude to the marked state." },
        experiment: { title: "Find the marked two-bit string", description: "Run the provided Grover circuit and then change which basis state the oracle marks.", steps: ["Open the two-qubit Grover preset.", "Run 100 and then 1,000 shots.", "Edit the phase-marking portion and predict the new most common output."], preset: "grover-2" },
        checkpoint: { question: "What is Grover's query speedup for unstructured search?", options: ["Linear: Θ(N) to Θ(1)", "Quadratic: Θ(N) to Θ(√N)", "Exponential: Θ(N) to Θ(log N)"], answer: 1, explanation: "Grover reduces the number of oracle queries quadratically, from order N to order √N for a unique marked item." },
      },
      {
        id: "qft-phase-estimation-shor", title: "QFT, phase estimation, and Shor", duration: "28 min", level: "ADVANCED ALGORITHMS", objective: "Connect eigenphase estimation to period finding and state Shor's result carefully.",
        sections: [
          { heading: "The quantum Fourier transform changes the basis", paragraphs: ["The quantum Fourier transform (QFT) is the unitary discrete Fourier transform over a register of qubits. It maps periodic structure in amplitudes into concentrated frequency information. A circuit decomposes it into Hadamard and controlled-phase gates, plus swaps to restore output order.", "Quantum phase estimation uses controlled powers of a unitary and an inverse QFT to estimate an eigenphase. It is a central subroutine in quantum algorithms and quantum simulation. Its performance depends on state preparation, circuit depth, precision, and the ability to implement controlled operations accurately."] },
          { heading: "Shor reduces factoring to period finding", paragraphs: ["Shor's factoring algorithm uses quantum period finding as a key step, together with classical number theory. In the ideal circuit model it runs in polynomial time in the input bit length, unlike the best known classical factoring algorithms, which are subexponential but not known to be polynomial.", "The asymptotic result assumes a sufficiently large fault-tolerant quantum computer and a practical implementation of the required arithmetic. It does not imply that current small noisy devices can factor cryptographically relevant numbers. NIST has finalized initial post-quantum cryptography standards; migration takes time, not because a classroom simulator can break deployed encryption."] },
        ],
        example: { title: "From a unitary phase to a frequency", steps: ["Prepare an eigenstate |u⟩ of U with eigenvalue e^{2πiφ}.", "Apply controlled powers of U to encode multiples of φ in a register.", "Use the inverse QFT and measure the register."], result: "The measurement estimates φ to a precision set by the number of control qubits and circuit quality." },
        experiment: { title: "Map the algorithm's moving parts", description: "This small state-vector lab does not implement a useful Shor instance; use it to explore controlled phase and basis changes.", steps: ["Build a two-qubit circuit with H and a controlled-phase interaction.", "Compare the output with and without the interaction.", "Write down what a full phase-estimation circuit would need beyond this toy example."], preset: "bell" },
        checkpoint: { question: "What is the quantum Fourier transform's role in phase estimation?", options: ["It converts encoded phase information into a measurable register distribution", "It removes the need for controlled operations", "It factors an integer by itself"], answer: 0, explanation: "The inverse QFT maps the phase information encoded across controlled powers into a distribution from which the eigenphase can be estimated." },
      },
    ],
  },
  {
    id: "mixed-states", number: "07", title: "Mixed states, noise, and open systems", subtitle: "Describe uncertainty, decoherence, and realistic channels precisely.", audience: "Advanced", outcomes: ["Represent a mixed state with a density matrix", "Distinguish coherent phase from classical uncertainty", "Model common noise channels conceptually"], references: [
      { label: "IBM Quantum Learning · Basics of quantum information", href: "https://quantum.cloud.ibm.com/learning/en/courses/basics-of-quantum-information" },
      { label: "Preskill · Quantum Computing in the NISQ era and beyond", href: "https://arxiv.org/abs/1801.00862" },
    ],
    lessons: [
      {
        id: "density-matrices", title: "Density matrices and mixed states", duration: "26 min", level: "ADVANCED MATHEMATICS", objective: "Write a density operator for a pure state and a classical mixture.",
        sections: [
          { heading: "A state can represent an ensemble", paragraphs: ["A density operator ρ describes both pure states and statistical mixtures. For a pure state |ψ⟩, ρ = |ψ⟩⟨ψ|. For an ensemble containing states |ψᵢ⟩ with classical probabilities pᵢ, ρ = Σᵢ pᵢ|ψᵢ⟩⟨ψᵢ|.", "A valid density matrix is Hermitian, positive semidefinite, and has trace one. Measurement probabilities are given by the Born rule in density-matrix form, p(i) = Tr(ρΠᵢ), where Πᵢ is the measurement projector."] , equation: "ρ = Σᵢ pᵢ|ψᵢ⟩⟨ψᵢ|,   Tr(ρ) = 1"},
          { heading: "Same Z statistics, different states", paragraphs: ["The pure state |+⟩ and a 50/50 classical mixture of |0⟩ and |1⟩ both give balanced Z outcomes. Their density matrices differ in off-diagonal coherence terms. Measuring in X distinguishes them: |+⟩ is deterministic, while the mixture is balanced.", "This distinction is essential when describing noise and partial information. Probabilities in one basis alone do not tell whether a system is coherently superposed or classically uncertain."] },
        ],
        example: { title: "Compare two balanced states", steps: ["Write ρ₊ = |+⟩⟨+|.", "Write ρmix = (|0⟩⟨0| + |1⟩⟨1|)/2.", "Compare their diagonal and off-diagonal entries."], result: "ρ₊ has nonzero off-diagonal terms; ρmix does not. Z measurements match, but X measurements differ." },
        experiment: { title: "Design a coherence test", description: "The basic simulator has pure-state circuits only. Predict how dephasing would alter the H–H interference experiment.", steps: ["Run H–H and confirm the ideal output is |0⟩.", "Imagine phase information is fully randomized between the gates.", "Predict the final distribution and explain what evidence would distinguish the models."], preset: "phase-interference" },
        checkpoint: { question: "How can |+⟩ be distinguished from a 50/50 mixture of |0⟩ and |1⟩?", options: ["A Z measurement", "An X measurement", "A single global-phase change"], answer: 1, explanation: "Their Z statistics are identical, but |+⟩ is an X eigenstate while the incoherent mixture gives random X outcomes." },
      },
      {
        id: "decoherence-channels", title: "Decoherence and quantum channels", duration: "26 min", level: "OPEN SYSTEMS", objective: "Distinguish bit flips, phase flips, amplitude damping, and dephasing.",
        sections: [
          { heading: "A device is not an isolated mathematical state", paragraphs: ["A physical qubit interacts with control fields, neighboring systems, and its environment. A quantum channel describes the resulting transformation on a density matrix. Completely positive trace-preserving (CPTP) maps preserve valid probabilities even when the system becomes correlated with an unobserved environment.", "A bit-flip channel randomly applies X. A phase-flip channel randomly applies Z. Dephasing suppresses coherence in a chosen basis without necessarily changing the basis populations. Amplitude damping models energy relaxation toward a ground state. These are simplified models; real hardware errors can be correlated and time-dependent."] , equation: "𝓔(ρ) = Σₖ EₖρEₖ†,   Σₖ Eₖ†Eₖ = I"},
          { heading: "Noise is basis-dependent", paragraphs: ["A phase-flip error in the Z basis changes relative phase and can look like a bit flip after a basis rotation. The physical effect and the chosen representation must be kept distinct.", "Noise models help compare circuits and error-correction codes, but their parameters must be calibrated against experiments before they make reliable hardware predictions."] },
        ],
        example: { title: "Phase error as a bit error in another basis", steps: ["Start with |+⟩.", "A Z error maps it to |−⟩.", "Apply H and measure in Z."], result: "The phase error is converted into a definite bit difference at readout." },
        experiment: { title: "Build a noise-aware prediction", description: "Use ideal circuits to identify what phase coherence a noise channel would destroy.", steps: ["Run H–H with no interruption.", "Insert Z to model one phase error.", "Compare outputs and identify which measurement basis reveals the error."], preset: "phase-interference" },
        checkpoint: { question: "Which simplified channel models energy relaxation toward |0⟩?", options: ["Amplitude damping", "A global phase", "A basis relabeling"], answer: 0, explanation: "Amplitude damping models loss of excitation to an environment and relaxation toward the ground state." },
      },
      {
        id: "partial-trace", title: "Partial trace and reduced states", duration: "24 min", level: "ADVANCED MATHEMATICS", objective: "Explain how a subsystem can be mixed even when the joint state is pure.",
        sections: [
          { heading: "Describe only the subsystem you can access", paragraphs: ["For a composite system AB, the reduced state of A is ρA = TrB(ρAB), the partial trace over subsystem B. It predicts every measurement that can be made on A alone.", "In a Bell state, the joint state is pure, but either qubit alone has density matrix I/2. The local state is maximally mixed because its correlations with the other qubit are part of the full description. This is a precise way to discuss entanglement without assigning each part an independent pure state."] , equation: "ρA = TrB(ρAB)"},
          { heading: "Tomography reconstructs a model from data", paragraphs: ["Quantum state tomography estimates a density matrix by collecting measurements in a set of bases and fitting a physical model to the observed counts. For one qubit, measurements along X, Y, and Z estimate the Bloch-vector components.", "Tomography needs many shots and is sensitive to calibration errors. The reconstruction is an estimate with uncertainty, not direct access to an exact hidden state. For larger systems, the number of parameters grows quickly, motivating structured methods and reduced measurements."] },
        ],
        example: { title: "A Bell pair's reduced state", steps: ["Write ρAB = |Φ⁺⟩⟨Φ⁺|.", "Trace out qubit B.", "Inspect the remaining 2×2 matrix."], result: "ρA = I/2. Either local qubit is maximally mixed even though the two-qubit state is pure." },
        experiment: { title: "Plan single-qubit tomography", description: "Use the lab's basis selector to estimate all three Bloch coordinates from finite samples.", steps: ["Prepare the same state three times.", "Measure in X, Y, and Z with 1,000 shots each.", "Estimate x, y, and z from the signed outcome frequencies."], preset: "superposition" },
        checkpoint: { question: "Can a subsystem of a pure entangled state have a mixed reduced state?", options: ["Yes", "No, every subsystem of a pure state is pure", "Only if the simulator is noisy"], answer: 0, explanation: "A partial trace can yield a mixed reduced state. For either half of a Bell pair, the reduced state is I/2." },
      },
    ],
  },
  {
    id: "error-correction", number: "08", title: "Quantum error correction", subtitle: "Protect information by detecting errors without measuring the encoded state directly.", audience: "Advanced", outcomes: ["Encode a logical qubit across physical qubits", "Interpret a syndrome", "Explain why fault tolerance has overhead"], references: [
      { label: "Preskill · Fault-tolerant quantum computation", href: "https://arxiv.org/abs/quant-ph/9712048" },
      { label: "Preskill · Quantum Computing in the NISQ era and beyond", href: "https://arxiv.org/abs/1801.00862" },
    ],
    lessons: [
      {
        id: "bit-flip-code", title: "The three-qubit bit-flip code", duration: "25 min", level: "ERROR CORRECTION", objective: "Encode a logical bit and infer one bit-flip error from parity checks.",
        sections: [
          { heading: "Redundancy protects classical information", paragraphs: ["The three-qubit repetition code maps logical |0⟩ to |000⟩ and logical |1⟩ to |111⟩. If one physical qubit flips, pairwise parity checks reveal which qubit disagrees, allowing correction by majority vote.", "A quantum code must protect arbitrary superpositions of logical 0 and 1, not only those two basis states. Measuring each physical qubit would reveal information about the logical state and destroy its coherence. Quantum error correction instead measures stabilizers—operators whose outcomes reveal an error syndrome while preserving the encoded logical information."] , equation: "|0L⟩ = |000⟩,   |1L⟩ = |111⟩"},
          { heading: "Syndromes identify error classes", paragraphs: ["For a bit-flip code, checks such as Z₀Z₁ and Z₁Z₂ compare neighboring bits. The pattern of ±1 outcomes identifies which single X error occurred, under the assumption that at most one relevant error happened before correction.", "The repetition code corrects bit flips but not arbitrary phase flips by itself. Applying a Hadamard basis change gives a phase-flip code; practical codes combine checks that protect both error types."] },
        ],
        example: { title: "Decode a single X error", steps: ["Encode |0⟩ as |000⟩.", "Suppose X acts on the middle qubit, giving |010⟩.", "Measure parity checks: Z₀Z₁ = −1 and Z₁Z₂ = −1."], result: "The syndrome points to the middle qubit, so applying X there restores |000⟩." },
        experiment: { title: "Write the syndrome table", description: "This simulator is capped at four qubits and does not include mid-circuit syndrome extraction. Work through the code analytically.", steps: ["List the no-error case and X errors on qubits 0, 1, and 2.", "Compute the two parity outcomes for each case.", "Verify that every single error has a distinct syndrome."], preset: "bell" },
        checkpoint: { question: "What information should a quantum error-correction syndrome reveal?", options: ["The encoded logical state itself", "Which error class likely occurred", "The full amplitudes of the state"], answer: 1, explanation: "Syndrome measurements are designed to reveal error information without revealing the logical quantum state." },
      },
      {
        id: "stabilizers-surface-code", title: "Stabilizers and the surface-code idea", duration: "28 min", level: "FAULT TOLERANCE", objective: "Explain stabilizer checks and why local measurements can protect a logical degree of freedom.",
        sections: [
          { heading: "Checks define a protected subspace", paragraphs: ["A stabilizer code is specified by commuting operators whose common +1 eigenspace contains the code space. Measuring a stabilizer gives a syndrome that indicates whether the system has moved into an error subspace.", "Surface-code families arrange qubits and checks on a two-dimensional layout, enabling local interactions and repeated syndrome extraction. Logical information is encoded nonlocally across many physical qubits, so a local measurement does not directly reveal it."] },
          { heading: "The code distance controls logical protection", paragraphs: ["The code distance is the minimum weight of a physical operator that acts nontrivially on encoded logical information. Larger distance can suppress logical failure when physical error rates and circuit conditions are below the relevant threshold, but the cost grows in qubits, operations, time, and classical decoding.", "A threshold is not one universal hardware number. It depends on the code, noise model, gate set, connectivity, measurement quality, and decoder. Estimates must state those assumptions."] , equation: "Logical protection requires decoding error chains before they form an undetectable logical operator."},
        ],
        example: { title: "Local faults versus logical faults", steps: ["Imagine a lattice of data qubits with local parity checks.", "One physical fault flips a small set of check outcomes.", "A decoder infers a likely error chain from the syndrome."], result: "A logical failure occurs when the actual and inferred chains differ by a nontrivial logical operator." },
        experiment: { title: "Trace an error chain", description: "Use a paper lattice to understand why code distance is a geometric property in a surface-code layout.", steps: ["Draw a small square lattice and mark boundaries.", "Place a short chain of physical errors.", "Compare a chain that connects boundaries with one that forms a closed local loop."] },
        checkpoint: { question: "What does increasing code distance generally do, assuming operation below threshold?", options: ["Makes encoded information less protected", "Can reduce logical error at greater resource cost", "Eliminates the need to measure syndromes"], answer: 1, explanation: "Larger distance can improve logical protection under suitable noise assumptions, at a significant physical-resource and time cost." },
      },
      {
        id: "fault-tolerance-overhead", title: "Fault tolerance and resource estimates", duration: "26 min", level: "SYSTEM DESIGN", objective: "Separate physical qubits, logical qubits, circuit depth, and total runtime.",
        sections: [
          { heading: "Useful computation needs errors to stay controlled", paragraphs: ["Fault-tolerant computation combines error-correcting codes, repeated syndrome measurements, decoding, and a gate-implementation strategy that keeps logical error rates low as circuits grow. A physical qubit and a logical qubit are different resources; one logical qubit can require many physical qubits and repeated operations.", "Resource estimates depend on the algorithm, target failure probability, hardware error model, code, decoder, and allowed runtime. Reporting only a physical qubit count omits the depth and quality needed to finish the computation reliably."] },
          { heading: "Overhead is an engineering trade-off", paragraphs: ["A fault-tolerant design spends hardware and time to reduce errors. Magic-state distillation, routing, measurement cycles, and decoding can dominate a workload. These costs are not details that appear after the speedup; they are part of the algorithm's practical resource estimate.", "For a fair comparison, count logical operations, error budget, data movement, classical preprocessing, and output verification alongside the physical resources."] },
        ],
        example: { title: "Read a resource claim", steps: ["Ask whether the count refers to physical or logical qubits.", "Ask what error rates and code distance are assumed.", "Ask for the circuit depth and target success probability."], result: "Without these details, a headline qubit count cannot establish that the workload is feasible." },
        experiment: { title: "Make a resource checklist", description: "Choose a proposed circuit and record what a fault-tolerant estimate would need to specify.", steps: ["Count logical qubits and non-Clifford operations conceptually.", "List circuit depth and data movement requirements.", "State the acceptable output failure probability."] },
        checkpoint: { question: "Why is a logical-qubit count alone insufficient?", options: ["It does not include error rate, depth, or runtime requirements", "Logical qubits cannot perform gates", "Every algorithm uses the same number of logical qubits"], answer: 0, explanation: "Feasibility depends on operation counts, noise assumptions, error correction overhead, runtime, and target success probability." },
      },
    ],
  },
  {
    id: "hardware", number: "09", title: "Hardware, compilation, and hybrid computing", subtitle: "Translate abstract circuits into physical operations and honest experiments.", audience: "Advanced → practitioner", outcomes: ["Recognize major hardware modalities", "Understand mapping and routing", "Evaluate a hybrid workflow and its limitations"], references: [
      { label: "IBM Quantum Learning · Bits, gates, and circuits", href: "https://quantum.cloud.ibm.com/learning/en/courses/utility-scale-quantum-computing/bits-gates-and-circuits" },
      { label: "Preskill · Quantum Computing in the NISQ era and beyond", href: "https://arxiv.org/abs/1801.00862" },
    ],
    lessons: [
      {
        id: "hardware-platforms", title: "Qubit technologies and control", duration: "25 min", level: "HARDWARE", objective: "Compare how physical qubits are implemented and controlled.",
        sections: [
          { heading: "Qubits are engineered two-level systems", paragraphs: ["Superconducting circuits, trapped ions, neutral atoms, and photonic systems encode quantum information in different physical degrees of freedom. They differ in operating temperature, control method, connectivity, gate speed, measurement, and error sources.", "No platform is described well by one headline metric. A gate can be fast but noisy; a qubit can have long coherence yet slow operations; all-to-all connectivity can simplify routing but introduce other engineering costs. The suitable comparison depends on the target workload and system architecture."] },
          { heading: "Calibration turns a model into a device", paragraphs: ["A physical gate is implemented by control pulses or interactions and must be calibrated. Device properties drift; calibration and measurement assignment errors affect results. A transpiler maps an abstract circuit onto the native gate set and qubit connectivity available on a particular device.", "A small ideal simulator cannot predict performance on a specific processor. Hardware experiments need device calibration data, backend constraints, and repeated runs with reported conditions."] },
        ],
        example: { title: "Compare two devices for a circuit", steps: ["Count two-qubit interactions in the logical circuit.", "Check the device connectivity and available native gates.", "Estimate extra routing gates introduced by the mapping."], result: "A device with fewer qubits can outperform a larger one for a small circuit if its connectivity and gate quality better match the workload." },
        experiment: { title: "Annotate a hardware mapping", description: "Take a Bell circuit and list what a real backend must provide before it can run.", steps: ["Identify which two qubits must interact.", "Record native one- and two-qubit gates, readout, and connectivity.", "Separate ideal algorithmic gates from compilation overhead."], preset: "bell" },
        checkpoint: { question: "What does transpilation commonly do?", options: ["Map an abstract circuit to supported gates and hardware connectivity", "Remove all physical noise", "Guarantee the algorithm's output is correct"], answer: 0, explanation: "Compilation adapts a circuit to a device's native gate set and connectivity, often adding routing operations." },
      },
      {
        id: "compilation-noise", title: "Compilation, connectivity, and circuit depth", duration: "23 min", level: "COMPILATION", objective: "Explain why equivalent circuits can have different hardware costs.",
        sections: [
          { heading: "The abstract circuit is not the executed circuit", paragraphs: ["A device may support a limited set of native gates and only selected qubit pairs. Compilation decomposes gates, routes interactions, chooses qubit mappings, and may optimize the sequence. Different compilations of the same algorithm can have different depth and error exposure.", "Circuit depth counts layers of operations that can run in parallel under a chosen dependency and hardware model. Gate count and depth are related but not interchangeable: two circuits with the same count can have different depth, and a short-depth circuit may still use many noisy gates in a layer."] },
          { heading: "Noise compounds with operations", paragraphs: ["If every operation has some chance of error, longer and deeper circuits generally create more opportunities for failure. The exact relationship depends on correlated noise, gate type, crosstalk, measurement, and error mitigation or correction.", "When comparing results, report the transpiled circuit, backend, calibration snapshot, shots, mitigation method, and uncertainty. Comparing only the diagram before compilation can hide the dominant resource cost."] },
        ],
        example: { title: "Estimate a routing penalty", steps: ["Suppose two logical qubits must interact but are not directly connected.", "A compiler swaps states along a path to bring them together.", "Count the additional two-qubit gates and depth."], result: "The logical interaction may expand into several physical operations, raising both runtime and error probability." },
        experiment: { title: "Shorten a circuit without changing its action", description: "Use identities and commuting gates to reason about equivalent circuits before compilation.", steps: ["Write H–H–X and simplify the adjacent Hadamards.", "Compare the original and simplified gate counts.", "Explain why fewer gates can help without guaranteeing a specific hardware fidelity."], preset: "single-gate" },
        checkpoint: { question: "Why can two equivalent circuits have different success rates on hardware?", options: ["One may compile to more gates, greater depth, or less favorable qubits", "Unitary equivalence forces identical physical noise", "Measurement outcomes do not depend on compilation"], answer: 0, explanation: "Compilation changes the physical operations, qubit choices, routing, and depth, all of which affect exposure to device noise." },
      },
      {
        id: "hybrid-workflows", title: "Hybrid quantum-classical workflows", duration: "22 min", level: "APPLICATIONS", objective: "Describe a variational loop and identify what it does not prove.",
        sections: [
          { heading: "A classical optimizer can steer a quantum circuit", paragraphs: ["Variational algorithms use a parameterized circuit to prepare states or estimate quantities. The quantum processor measures observables; a classical optimizer updates parameters and repeats. VQE applies this pattern to approximate ground-state energies, while QAOA applies a related structure to optimization problems.", "A practical workflow must account for measurement shots, optimizer evaluations, noise, ansatz expressiveness, parameter concentration, and classical baselines. A hybrid circuit does not guarantee an advantage simply because one step runs on quantum hardware."] },
          { heading: "Evidence requires a fair baseline", paragraphs: ["To claim a useful advantage, define the task, quality target, total cost, and strongest relevant classical approach. Include data preparation, repeated circuit evaluations, error mitigation, and uncertainty. Small demonstrations can validate a workflow without establishing a speedup.", "For learning, the right question is often: what quantity is estimated, how is it encoded, what resources are spent, and what evidence would falsify the claimed improvement?"] },
        ],
        example: { title: "One variational iteration", steps: ["Choose circuit parameters θ.", "Measure an observable across repeated shots.", "Update θ classically to lower the estimated objective."], result: "The loop produces a noisy estimate; the optimizer must account for sampling and device uncertainty." },
        experiment: { title: "Design a small hybrid experiment", description: "Before coding an optimizer, define the quantity, state preparation, and measurement plan.", steps: ["Choose one measurable objective, such as ⟨Z⟩ for a rotated qubit.", "Select a parameterized rotation and a range of θ.", "Predict the measurement cost needed to distinguish two nearby values."], preset: "superposition" },
        checkpoint: { question: "What is essential when evaluating a claimed hybrid quantum advantage?", options: ["A quantum circuit appears in the method", "A fair classical baseline and full resource accounting", "A large number of physical qubits alone"], answer: 1, explanation: "A useful comparison needs the task, success target, full quantum and classical costs, and a strong baseline." },
      },
    ],
  },
  {
    id: "research-lab", number: "10", title: "Design and report quantum experiments", subtitle: "Turn a circuit into a reproducible claim, then complete a capstone.", audience: "All levels → research practice", outcomes: ["Separate prediction, observation, and interpretation", "Quantify finite-shot uncertainty", "Design a capstone and report its limitations"], references: [
      { label: "IBM Quantum Learning · Learning modules", href: "https://quantum.cloud.ibm.com/learning/en/modules" },
      { label: "NIST · Post-quantum cryptography", href: "https://www.nist.gov/cybersecurity-and-privacy/what-post-quantum-cryptography" },
    ],
    lessons: [
      {
        id: "shots-statistics", title: "Shots, sampling, and uncertainty", duration: "24 min", level: "EXPERIMENTAL METHOD", objective: "Estimate a probability from shots and describe its sampling uncertainty.",
        sections: [
          { heading: "A frequency is an estimate", paragraphs: ["A shot is one execution of a circuit followed by measurement. If an outcome occurs k times in N independent shots, the empirical frequency k/N estimates its probability p. The expected count is Np, but an experiment does not generally produce exactly that count.", "For a Bernoulli outcome, the standard error of the sample frequency is approximately √(p(1−p)/N). It is largest near p=1/2 and shrinks like 1/√N. More shots reduce sampling uncertainty but do not remove systematic calibration error or model mismatch."] , equation: "p̂ = k/N,   SE(p̂) ≈ √(p̂(1−p̂)/N)"},
          { heading: "State your uncertainty honestly", paragraphs: ["Report the number of shots, observed counts, and the uncertainty method. A zero count does not prove an outcome has exactly zero probability; the data only constrain it. If runs are correlated or hardware drifts, the independent-sample approximation may be inadequate.", "The lab uses fresh pseudorandom samples from ideal Born probabilities each time Run is pressed. Its histogram demonstrates finite-shot variation; it does not claim to reproduce a particular quantum processor or a cryptographically random source."] },
        ],
        example: { title: "Estimate a balanced result", steps: ["Run 100 shots with p = 1/2.", "If 54 results are 0, estimate p̂ = 0.54.", "Compute an approximate standard error √(0.54×0.46/100)."], result: "The estimate is about 0.54 with standard error about 0.05. The deviation from 0.5 is plausible sampling fluctuation." },
        experiment: { title: "Measure sampling variation", description: "Run the same ideal circuit repeatedly at different shot counts.", steps: ["Run 20 shots three times and note the counts.", "Repeat with 1,000 shots.", "Compare the spread in frequencies and discuss 1/√N scaling."], preset: "superposition" },
        checkpoint: { question: "What happens to the sampling standard error when the shot count grows by a factor of 100?", options: ["It shrinks by about 10×", "It shrinks by about 100×", "It is unchanged"], answer: 0, explanation: "Standard error scales as 1/√N, so multiplying N by 100 reduces it by approximately 10." },
      },
      {
        id: "controlled-experiments", title: "Hypotheses, controls, and reproducibility", duration: "22 min", level: "EXPERIMENTAL METHOD", objective: "Write a falsifiable prediction and identify controls for a circuit experiment.",
        sections: [
          { heading: "A good experiment can fail clearly", paragraphs: ["State a hypothesis before collecting data, define the circuit and measurement basis, and specify what result would support or weaken the claim. Change one factor at a time when possible. A circuit diagram alone is not enough: initial state, gate order, backend, shots, and analysis must be recorded.", "Use controls to detect ordinary explanations. For a phase-interference experiment, compare the intended H–Z–H circuit with H–H, keep the measurement basis fixed, and verify the gates were applied in the stated order."] },
          { heading: "Reproducibility needs the execution context", paragraphs: ["A useful record includes source code or a circuit description, software and device versions, transpiled operations, calibration information, run date, shot count, random seed when available, and analysis steps. Hardware calibration changes, so an exact repeat may not reproduce every count even when it reproduces the same protocol.", "A browser simulator is deterministic in its mathematical model but samples outcomes locally. Its results are useful for checking predictions and code logic, not for making claims about a physical device."] },
        ],
        example: { title: "A falsifiable phase hypothesis", steps: ["Hypothesis: inserting Z between two Hadamards changes output from 0 to 1.", "Control: remove Z while keeping preparation and measurement fixed.", "Repeat each condition and compare output counts."], result: "The ideal model predicts 0 for H–H and 1 for H–Z–H. Hardware deviations should be reported with uncertainty and calibration context." },
        experiment: { title: "Write a lab notebook entry", description: "Record a hypothesis and its protocol before running the phase experiment.", steps: ["Write the predicted output for H–H and H–Z–H.", "Set a fixed basis and shot count.", "Run both circuits, save counts, and state one limitation."], preset: "phase-interference" },
        checkpoint: { question: "What makes a control useful in a circuit experiment?", options: ["It changes every setting at once", "It isolates the effect of the variable under study", "It guarantees a preferred result"], answer: 1, explanation: "A control keeps other conditions fixed so that a difference can be attributed to the changed variable more credibly." },
      },
      {
        id: "capstone", title: "Capstone: build, test, and explain a circuit", duration: "45–90 min", level: "FINAL PROJECT", objective: "Produce a complete experimental report from a circuit question.",
        sections: [
          { heading: "Choose one question and make a prediction", paragraphs: ["Pick a capstone that matches your level: verify a Bell-state correlation, compare X/Y/Z measurements of one qubit, demonstrate Grover amplification on four items, or design a tiny tomography protocol. Define inputs, gates, measurement basis, expected distribution, and a falsifiable prediction.", "For an advanced project, compare two equivalent circuit implementations, analyze the transpilation cost on a chosen backend, or estimate how a named noise channel changes an observable. Keep ideal simulation, noisy simulation, and hardware data clearly labeled as different evidence."] },
          { heading: "Report results and limitations", paragraphs: ["A concise report contains the question, circuit, prediction, observed counts, shot count, uncertainty, interpretation, and limitations. Include enough detail for another learner to reproduce the circuit. If the results disagree with the model, first check bit ordering, control direction, basis choice, and gate sequence before inventing a new physical explanation.", "The goal is not to claim a quantum advantage. It is to show that you can reason from a state and circuit to a measurable prediction, execute a protocol, and say what the evidence can and cannot establish."] },
        ],
        example: { title: "A minimum complete report", steps: ["Question: does H–Z–H differ from H–H in Z measurement?", "Prediction: output 1 versus output 0 in the ideal model.", "Protocol: 1,000 shots per circuit; report both counts and conditions."], result: "The conclusion states whether observations match the prediction and distinguishes shot noise from systematic limitations." },
        experiment: { title: "Start your capstone in the lab", description: "Choose a preset, modify one feature, and turn the change into a prediction before running it.", steps: ["Select Bell, interference, Grover, or a single-qubit state experiment.", "Write down the expected distribution and why.", "Run, save the counts in your report, and explain one limitation."], preset: "bell" },
        checkpoint: { question: "Which statement is a strong capstone conclusion?", options: ["The simulation proves quantum computers are faster", "The observed counts are consistent with the ideal prediction within finite-shot variation; this simulator does not model hardware noise", "The circuit must be correct because the histogram looks clean"], answer: 1, explanation: "A sound conclusion ties the observation to the prediction and clearly states what the simulator does not establish." },
      },
    ],
  },
];

export const allLessons = modules.flatMap((module) => module.lessons);
