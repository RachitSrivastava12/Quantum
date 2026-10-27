#!/usr/bin/env python3
"""Render the Qubit Atlas launch film from its designed stills and narration."""

from __future__ import annotations

import array
import math
import re
import subprocess
import sys
import textwrap
import wave
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
VIDEO = ROOT / "video"
ASSETS = VIDEO / "assets"
VOICE = VIDEO / "voice"
WORK = VIDEO / "work"
OUTPUT = VIDEO / "qubit-atlas-launch-with-audio.mp4"
WIDTH, HEIGHT, FPS = 1920, 1080, 30

PAPER = "#F4F2EC"
SURFACE = "#FBFAF6"
INK = "#242521"
MUTED = "#5D6059"
RULE = "#D8D8D0"
ACCENT = "#8D4936"
WASH = "#EFE1DA"
SOFT = "#E9E8E0"
WHITE = "#FFFFFF"

FONT_REG = "/System/Library/Fonts/HelveticaNeue.ttc"
FONT_BOLD = "/System/Library/Fonts/HelveticaNeue.ttc"
FONT_ITALIC = "/System/Library/Fonts/HelveticaNeue.ttc"
FONT_SERIF = "/System/Library/Fonts/NewYork.ttf"
FONT_MONO = "/System/Library/Fonts/Menlo.ttc"

SCENES = [
    {
        "title": "A better place to begin",
        "label": "01 / THE QUESTION",
        "narration": [
            "Quantum computing attracts big promises.",
            "A better place to begin is smaller: with a state, a circuit, and a prediction you can check.",
            "Qubit Atlas is a guided field course for learning how quantum computation actually works, from your first qubit to experiments you can explain.",
            "Lessons pair clear explanations with worked examples and experiments you can repeat.",
        ],
        "kind": "opening",
    },
    {
        "title": "Understand the state",
        "label": "02 / AMPLITUDES",
        "narration": [
            "Start with the model.",
            "A qubit is described by complex amplitudes, not by a tiny classical coin hiding a definite answer.",
            "The squared magnitudes give measurement probabilities.",
            "Relative phase can change what a later gate does, even when the first measurement looks unchanged.",
            "Normalization keeps total probability at one; relative phase tells later gates how amplitudes relate.",
        ],
        "kind": "state",
    },
    {
        "title": "Measure what the circuit predicts",
        "label": "03 / MEASUREMENT",
        "narration": [
            "A circuit applies gates in an order, then measurement returns a classical sample.",
            "Run the same experiment again and the counts vary.",
            "As shots accumulate, the observed frequencies tend to approach the predicted distribution.",
            "One run never reveals every amplitude.",
            "At twenty shots, counts can wander; with a thousand, they tend to sit closer to the prediction. Both remain finite estimates.",
        ],
        "kind": "measurement",
    },
    {
        "title": "See phase become observable",
        "label": "04 / INTERFERENCE",
        "narration": [
            "Try Hadamard, Z, Hadamard on a qubit prepared in zero.",
            "The middle gate changes relative phase, not the immediate Z probabilities.",
            "The final Hadamard turns that phase difference into interference: the outcome switches from zero to one.",
            "This small experiment makes an abstract idea observable.",
        ],
        "kind": "interference",
    },
    {
        "title": "A complete learning path",
        "label": "05 / THE CURRICULUM",
        "narration": [
            "Then follow a complete path: ten connected modules and thirty worked lessons.",
            "Build foundations in states, amplitudes, measurement, and linear algebra.",
            "Progress through gates, circuits, entanglement, and algorithms.",
            "Continue into noise, error correction, hardware, and the methods for designing and reporting an experiment.",
            "Each lesson pairs a clear objective with a worked example, experiment, and checkpoint.",
        ],
        "kind": "curriculum",
    },
    {
        "title": "Your browser becomes a lab bench",
        "label": "06 / THE QUANTUM LAB",
        "narration": [
            "In the browser lab, compose gates yourself.",
            "Choose one to four qubits, prepare a circuit, select X, Y, or Z measurement, and decide how many shots to run.",
            "Inspect the state vector, the ideal prediction, and the finite sample side by side.",
            "Choose a gate and target, then inspect the model's predicted outcomes.",
        ],
        "kind": "lab",
    },
    {
        "title": "Build a Bell pair",
        "label": "07 / A GUIDED EXPERIMENT",
        "narration": [
            "Build a Bell pair with a Hadamard and a controlled NOT.",
            "In the ideal Z-basis model, only zero-zero and one-one appear, each with probability one half.",
            "Each qubit alone is balanced; together, their outcomes are correlated.",
            "A circuit simulator demonstrates this prediction. It is not a physical Bell test.",
            "The ideal joint state contains only zero-zero and one-one, though either qubit alone is random.",
        ],
        "kind": "bell",
    },
    {
        "title": "Go deeper, with the limits in view",
        "label": "08 / ADVANCED IDEAS",
        "narration": [
            "From there, study search, phase estimation, and the quantum Fourier transform with their assumptions in view.",
            "Learn density matrices, decoherence, and why error correction needs resources.",
            "Connect abstract circuits to hardware constraints, compilation, and hybrid workflows.",
            "Ask where a speedup comes from, what resources it costs, and what the ideal model leaves out.",
        ],
        "kind": "advanced",
    },
    {
        "title": "Make claims you can explain",
        "label": "09 / EXPERIMENTAL METHOD",
        "narration": [
            "Every experiment starts with a question, a prediction, a measurement choice, and a record of its limits.",
            "Guided examples and self-checks build the habit.",
            "Use the glossary when notation gets dense, track your local progress, and export circuits as OpenQASM 2 for use in other tools.",
            "Record the circuit, basis, shot count, and assumptions so another learner can interpret the result.",
        ],
        "kind": "method",
    },
    {
        "title": "Build the model before the headline",
        "label": "10 / QUBIT ATLAS",
        "narration": [
            "Qubit Atlas runs its ideal state-vector simulator locally in your browser, up to four qubits.",
            "It does not run on quantum hardware or model device noise.",
            "Start with lesson one.",
            "Build the model before believing the headline.",
        ],
        "kind": "closing",
    },
]


def rgb(hex_color: str) -> tuple[int, int, int]:
    color = hex_color.lstrip("#")
    return tuple(int(color[i : i + 2], 16) for i in (0, 2, 4))


def font(size: int, face: str = "reg") -> ImageFont.FreeTypeFont:
    path = {"reg": FONT_REG, "bold": FONT_BOLD, "italic": FONT_ITALIC, "serif": FONT_SERIF, "mono": FONT_MONO}[face]
    index = 0 if face in {"reg", "serif", "mono"} else (1 if face == "bold" else 2)
    try:
        return ImageFont.truetype(path, size, index=index)
    except OSError:
        return ImageFont.truetype(path, size)


def rounded(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], radius: int = 8, fill: str = SURFACE, outline: str = RULE, width: int = 1) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def fit_text(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = (current + " " + word).strip()
        if draw.textbbox((0, 0), candidate, font=fnt)[2] <= max_width or not current:
            current = candidate
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def text_block(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, fnt: ImageFont.FreeTypeFont, color: str = INK, max_width: int = 800, leading: int = 12) -> int:
    x, y = xy
    lines = fit_text(draw, text, fnt, max_width)
    for line in lines:
        draw.text((x, y), line, font=fnt, fill=color)
        y += fnt.size + leading
    return y


def baseline(draw: ImageDraw.ImageDraw, n: int, label: str | None = None, dark: bool = False) -> None:
    fg = PAPER if dark else INK
    secondary = "#C2C3BB" if dark else MUTED
    rule = "#4B4D47" if dark else RULE
    draw.line((112, 1000, 1808, 1000), fill=rule, width=2)
    draw.text((112, 1022), "QUBIT ATLAS", font=font(18, "bold"), fill=fg)
    draw.text((301, 1022), label or "QUANTUM COMPUTING, TAUGHT PROPERLY", font=font(17, "reg"), fill=secondary)
    draw.text((1758, 1022), f"{n:02d} / 10", font=font(17, "mono"), fill=secondary, anchor="ra")


def header(draw: ImageDraw.ImageDraw, index: int, label: str) -> None:
    draw.text((122, 84), label, font=font(18, "bold"), fill=ACCENT)
    draw.line((122, 122, 1798, 122), fill=RULE, width=2)
    draw.text((1798, 83), f"FIELD GUIDE     {index:02d}", font=font(16, "mono"), fill=MUTED, anchor="ra")


def wire(draw: ImageDraw.ImageDraw, x1: int, y: int, x2: int, color: str = "#A6A79E", width: int = 3) -> None:
    draw.line((x1, y, x2, y), fill=color, width=width)


def gate(draw: ImageDraw.ImageDraw, x: int, y: int, text: str, accent: bool = False, size: int = 68) -> None:
    c = ACCENT if accent else INK
    rounded(draw, (x - size // 2, y - size // 2, x + size // 2, y + size // 2), radius=7, fill=WASH if accent else SURFACE, outline=c, width=2)
    draw.text((x, y), text, font=font(27, "bold"), fill=c, anchor="mm")


def measurement(draw: ImageDraw.ImageDraw, x: int, y: int) -> None:
    rounded(draw, (x - 35, y - 35, x + 35, y + 35), 8, fill=SURFACE, outline=INK, width=2)
    draw.arc((x - 17, y - 18, x + 17, y + 17), 205, 338, fill=INK, width=3)
    draw.line((x, y, x + 14, y - 12), fill=ACCENT, width=3)
    draw.text((x, y + 21), "M", font=font(13, "mono"), fill=INK, anchor="mm")


def target_plus(draw: ImageDraw.ImageDraw, x: int, y: int, length: int = 11, color: str = ACCENT, width: int = 3) -> None:
    draw.line((x - length, y, x + length, y), fill=color, width=width)
    draw.line((x, y - length, x, y + length), fill=color, width=width)


def arrow(draw: ImageDraw.ImageDraw, x: int, y: int, color: str = PAPER) -> None:
    draw.line((x - 10, y, x + 10, y), fill=color, width=2)
    draw.line((x + 3, y - 7, x + 10, y), fill=color, width=2)
    draw.line((x + 3, y + 7, x + 10, y), fill=color, width=2)


def dropdown_mark(draw: ImageDraw.ImageDraw, x: int, y: int, color: str = MUTED) -> None:
    draw.line((x - 5, y - 2, x, y + 3), fill=color, width=2)
    draw.line((x, y + 3, x + 5, y - 2), fill=color, width=2)


def circuit_row(draw: ImageDraw.ImageDraw, y: int, gates: list[tuple[int, str, bool]], start: int = 275, end: int = 1420, bit: str = "|0⟩", input_x: int = 170) -> None:
    draw.text((input_x, y), bit, font=font(29, "mono"), fill=INK, anchor="lm")
    wire(draw, start, y, end)
    for x, label, accent in gates:
        if label == "M":
            measurement(draw, x, y)
        else:
            gate(draw, x, y, label, accent)


def frame_opening(draw: ImageDraw.ImageDraw) -> None:
    # Restrained editorial cover, with the product's circuit language as the image.
    draw.text((126, 84), "QUBIT ATLAS", font=font(23, "bold"), fill=INK)
    draw.text((126, 121), "A FIELD GUIDE TO QUANTUM COMPUTING", font=font(15, "mono"), fill=MUTED)
    draw.text((1788, 91), "LEARN  /  MODEL  /  EXPERIMENT", font=font(16, "mono"), fill=MUTED, anchor="ra")
    draw.text((130, 236), "Understand the", font=font(82, "reg"), fill=INK)
    draw.text((130, 331), "quantum circuit.", font=font(99, "serif"), fill=ACCENT)
    text_block(draw, (138, 494), "A careful path from your first qubit to experiments you can design and explain.", font(31, "reg"), MUTED, 735, 11)
    rounded(draw, (138, 651, 551, 719), radius=6, fill=INK, outline=INK, width=1)
    draw.text((176, 684), "START WITH THE FOUNDATIONS", font=font(17, "bold"), fill=PAPER, anchor="lm")
    arrow(draw, 509, 684)
    # Circuit plate.
    rounded(draw, (1000, 245, 1778, 785), radius=11, fill=SURFACE, outline=RULE, width=2)
    draw.text((1040, 282), "FIG. 01", font=font(16, "mono"), fill=ACCENT)
    draw.text((1735, 282), "THE CIRCUIT MODEL", font=font(16, "mono"), fill=MUTED, anchor="ra")
    draw.line((1040, 320, 1735, 320), fill=RULE, width=2)
    circuit_row(draw, 430, [(1160, "H", False), (1280, "Z", True), (1400, "H", False), (1520, "M", False)], start=1080, end=1560, bit="|0⟩", input_x=1035)
    draw.text((1590, 430), "1", font=font(35, "mono"), fill=ACCENT, anchor="lm")
    draw.text((1630, 430), "sample", font=font(16, "reg"), fill=MUTED, anchor="lm")
    draw.line((1082, 584, 1685, 584), fill=RULE, width=2)
    draw.text((1082, 622), "PREPARE", font=font(15, "mono"), fill=MUTED)
    draw.text((1281, 622), "EVOLVE", font=font(15, "mono"), fill=MUTED)
    draw.text((1494, 622), "MEASURE", font=font(15, "mono"), fill=MUTED)
    draw.text((1082, 697), "A circuit transforms amplitudes; measurement returns classical data.", font=font(19, "reg"), fill=INK)
    baseline(draw, 1)


def frame_state(draw: ImageDraw.ImageDraw) -> None:
    header(draw, 2, "THE STATE / AMPLITUDES AND PROBABILITY")
    draw.text((125, 188), "The state holds more", font=font(69, "reg"), fill=INK)
    draw.text((125, 269), "than a probability.", font=font(75, "serif"), fill=ACCENT)
    text_block(draw, (132, 390), "Amplitudes carry magnitude and phase. A measurement asks a basis-specific question.", font(26, "reg"), MUTED, 660, 10)
    # Equation card
    rounded(draw, (130, 565, 790, 842), 8, SURFACE, RULE, 2)
    draw.text((172, 604), "A PURE QUBIT STATE", font=font(16, "mono"), fill=ACCENT)
    draw.text((171, 675), "|ψ⟩ = α|0⟩ + β|1⟩", font=font(35, "mono"), fill=INK)
    draw.line((171, 733, 748, 733), fill=RULE, width=2)
    draw.text((171, 770), "|α|² + |β|² = 1", font=font(29, "mono"), fill=INK)
    draw.text((171, 811), "Born's rule turns magnitude into probability.", font=font(16, "reg"), fill=MUTED)
    # Two amplitudes and probabilities.
    rounded(draw, (875, 184, 1778, 842), 8, SURFACE, RULE, 2)
    draw.text((920, 224), "EXAMPLE  /  |+⟩ = (|0⟩ + |1⟩) / √2", font=font(17, "mono"), fill=MUTED)
    draw.text((920, 307), "AMPLITUDE MAGNITUDE", font=font(15, "mono"), fill=MUTED)
    for i, (ket, value) in enumerate((("|0⟩", "0.707"), ("|1⟩", "0.707"))):
        y = 371 + i * 86
        draw.text((927, y), ket, font=font(25, "mono"), fill=INK, anchor="lm")
        draw.line((1033, y, 1570, y), fill=SOFT, width=16)
        draw.line((1033, y, 1033 + int(0.707 * 537), y), fill=ACCENT, width=16)
        draw.text((1602, y), value, font=font(21, "mono"), fill=INK, anchor="lm")
    draw.line((919, 551, 1730, 551), fill=RULE, width=2)
    draw.text((920, 579), "Z-BASIS PROBABILITY", font=font(15, "mono"), fill=MUTED)
    for i, (ket, val) in enumerate((("0", "50%"), ("1", "50%"))):
        y = 642 + i * 72
        draw.text((927, y), ket, font=font(24, "mono"), fill=INK, anchor="lm")
        draw.line((1033, y, 1570, y), fill=SOFT, width=14)
        draw.line((1033, y, 1301, y), fill=INK, width=14)
        draw.text((1602, y), val, font=font(20, "mono"), fill=INK, anchor="lm")
    baseline(draw, 2)


def frame_measurement(draw: ImageDraw.ImageDraw) -> None:
    header(draw, 3, "THE CIRCUIT / ONE OUTCOME PER SHOT")
    draw.text((125, 180), "A measurement returns", font=font(69, "reg"), fill=INK)
    draw.text((125, 259), "one classical sample.", font=font(72, "serif"), fill=ACCENT)
    # Circuit plate
    rounded(draw, (128, 398, 1791, 690), 8, SURFACE, RULE, 2)
    draw.text((168, 435), "PREPARE  |+⟩", font=font(16, "mono"), fill=MUTED)
    circuit_row(draw, 556, [(670, "H", True), (1048, "M", False)], start=280, end=1485, bit="|0⟩")
    draw.text((1564, 556), "0 or 1", font=font(21, "mono"), fill=INK, anchor="lm")
    # Sampling series
    draw.text((137, 743), "REPEATED SHOTS  /  ONE POSSIBLE SAMPLE", font=font(15, "mono"), fill=ACCENT)
    draw.text((137, 783), "A balanced state predicts equal Z outcomes.", font=font(21, "reg"), fill=MUTED)
    for x, title, n, z0, z1 in [(620, "20 SHOTS", "n = 20", 12, 8), (1090, "1,000 SHOTS", "n = 1,000", 502, 498)]:
        rounded(draw, (x, 733, x + 306, 919), 7, SURFACE, RULE, 2)
        draw.text((x + 24, 755), title, font=font(15, "mono"), fill=MUTED)
        draw.text((x + 281, 755), n, font=font(14, "mono"), fill=MUTED, anchor="ra")
        draw.text((x + 26, 803), "0", font=font(17, "mono"), fill=INK)
        draw.line((x + 59, 815, x + 236, 815), fill=SOFT, width=12)
        draw.line((x + 59, 815, x + 59 + int(177 * z0 / (z0 + z1)), 815), fill=ACCENT, width=12)
        draw.text((x + 267, 803), f"{z0}", font=font(16, "mono"), fill=INK, anchor="ra")
        draw.text((x + 26, 855), "1", font=font(17, "mono"), fill=INK)
        draw.line((x + 59, 867, x + 236, 867), fill=SOFT, width=12)
        draw.line((x + 59, 867, x + 59 + int(177 * z1 / (z0 + z1)), 867), fill=INK, width=12)
        draw.text((x + 267, 855), f"{z1}", font=font(16, "mono"), fill=INK, anchor="ra")
    draw.text((1438, 786), "Counts vary.", font=font(23, "serif"), fill=ACCENT)
    draw.text((1438, 829), "Frequencies converge", font=font(18, "reg"), fill=MUTED)
    draw.text((1438, 858), "toward the prediction.", font=font(18, "reg"), fill=MUTED)
    baseline(draw, 3)


def frame_interference(draw: ImageDraw.ImageDraw) -> None:
    header(draw, 4, "THE EXPERIMENT / H — Z — H")
    draw.text((125, 178), "Watch phase", font=font(70, "reg"), fill=INK)
    draw.text((125, 255), "become observable.", font=font(75, "serif"), fill=ACCENT)
    draw.text((134, 368), "The first H creates equal amplitudes. Z flips the relative sign.", font=font(25, "reg"), fill=MUTED)
    # Large circuit
    rounded(draw, (132, 448, 1784, 668), 8, SURFACE, RULE, 2)
    circuit_row(draw, 556, [(634, "H", False), (925, "Z", True), (1216, "H", False), (1482, "M", False)], start=284, end=1540, bit="|0⟩")
    draw.text((1595, 555), "|1⟩", font=font(29, "mono"), fill=ACCENT, anchor="lm")
    # Amplitude phase strip
    draw.text((144, 727), "FOLLOW THE AMPLITUDES", font=font(15, "mono"), fill=MUTED)
    stages = [(142, "AFTER H", "+1/√2", "+1/√2", "balanced"), (725, "AFTER Z", "+1/√2", "−1/√2", "relative phase changes"), (1307, "AFTER FINAL H", "0", "1", "interference selects 1")]
    for x, title, a, b, note in stages:
        rounded(draw, (x, 766, x + 465, 922), 7, SURFACE, RULE, 2)
        draw.text((x + 24, 786), title, font=font(14, "mono"), fill=MUTED)
        draw.text((x + 27, 831), f"|0⟩  {a}", font=font(25, "mono"), fill=INK)
        draw.text((x + 250, 831), f"|1⟩  {b}", font=font(25, "mono"), fill=ACCENT if b.startswith("−") else INK)
        draw.text((x + 27, 883), note, font=font(16, "reg"), fill=MUTED)
    baseline(draw, 4)


MODULES = [
    "Start with the physics", "The mathematical language", "The single-qubit laboratory",
    "Circuits and algorithmic thinking", "Many qubits and quantum information", "Quantum algorithms",
    "Mixed states, noise, and open systems", "Quantum error correction", "Hardware, compilation, and hybrid computing",
    "Design and report quantum experiments",
]


def frame_curriculum(draw: ImageDraw.ImageDraw) -> None:
    header(draw, 5, "THE LEARNING PATH / 10 MODULES")
    draw.text((125, 170), "From first principles", font=font(67, "reg"), fill=INK)
    draw.text((125, 245), "to experimental method.", font=font(72, "serif"), fill=ACCENT)
    draw.text((133, 345), "Beginner → intermediate → advanced", font=font(21, "mono"), fill=MUTED)
    x0, y0, colw, rowh, gapx, gapy = 132, 418, 306, 206, 25, 22
    for idx, title in enumerate(MODULES):
        col, row = idx % 5, idx // 5
        x, y = x0 + col * (colw + gapx), y0 + row * (rowh + gapy)
        rounded(draw, (x, y, x + colw, y + rowh), 7, SURFACE, RULE, 2)
        draw.text((x + 22, y + 20), f"{idx + 1:02d}", font=font(17, "mono"), fill=ACCENT)
        title_lines = fit_text(draw, title, font(21, "bold"), colw - 44)
        ty = y + 68
        for line in title_lines[:3]:
            draw.text((x + 22, ty), line, font=font(21, "bold"), fill=INK)
            ty += 28
        category = "FOUNDATIONS" if idx < 3 else ("CIRCUITS & ALGORITHMS" if idx < 6 else "EXPERIMENTAL PRACTICE")
        draw.text((x + 22, y + rowh - 26), category, font=font(12, "mono"), fill=MUTED)
    draw.text((1768, 895), "30 WORKED LESSONS", font=font(16, "mono"), fill=ACCENT, anchor="ra")
    baseline(draw, 5)


def frame_lab(draw: ImageDraw.ImageDraw) -> None:
    header(draw, 6, "THE BROWSER LAB / LOCAL SIMULATOR")
    draw.text((125, 168), "A circuit you can", font=font(64, "reg"), fill=INK)
    draw.text((125, 239), "reason through.", font=font(72, "serif"), fill=ACCENT)
    draw.text((133, 328), "Compose gates. Predict. Run finite shots. Compare.", font=font(23, "reg"), fill=MUTED)
    # Product screen, carefully modeled on the real local lab layout.
    rounded(draw, (128, 395, 1790, 914), 9, SURFACE, RULE, 2)
    draw.rectangle((129, 396, 1789, 453), fill="#EEEDE6")
    draw.text((157, 425), "QUBIT ATLAS", font=font(16, "bold"), fill=INK, anchor="lm")
    draw.text((1675, 425), "OVERVIEW     CURRICULUM     QUANTUM LAB", font=font(12, "mono"), fill=MUTED, anchor="rm")
    # Left working panel.
    draw.text((159, 480), "01 / CIRCUIT", font=font(13, "mono"), fill=ACCENT)
    draw.text((159, 505), "Compose operations", font=font(24, "bold"), fill=INK)
    draw.text((162, 556), "QUBITS", font=font(11, "mono"), fill=MUTED)
    draw.text((322, 556), "GATE", font=font(11, "mono"), fill=MUTED)
    draw.text((468, 556), "TARGET", font=font(11, "mono"), fill=MUTED)
    for x, label in ((159, "2 qubits"), (319, "CNOT"), (466, "q1")):
        rounded(draw, (x, 574, x + 135, 612), 4, PAPER, RULE, 1)
        draw.text((x + 11, 593), label, font=font(13, "reg"), fill=INK, anchor="lm")
        dropdown_mark(draw, x + 121, 593)
    draw.text((159, 645), "CIRCUIT DIAGRAM", font=font(12, "mono"), fill=MUTED)
    # two wire rows; H and controlled X (CX/CNOT)
    for y, label in ((695, "q0"), (759, "q1")):
        draw.text((160, y), label, font=font(17, "mono"), fill=INK, anchor="lm")
        wire(draw, 220, y, 807, RULE, 2)
    gate(draw, 362, 695, "H", True, 50)
    draw.ellipse((517, 685, 537, 705), fill=ACCENT)
    draw.line((527, 695, 527, 759), fill=ACCENT, width=3)
    rounded(draw, (508, 740, 546, 778), 4, WASH, ACCENT, 2)
    target_plus(draw, 527, 759, 8, ACCENT, 2)
    draw.text((157, 815), "MEASURE IN", font=font(11, "mono"), fill=MUTED)
    for j, lab in enumerate(("Z", "X", "Y")):
        rounded(draw, (277 + j * 49, 800, 318 + j * 49, 837), 4, WASH if lab == "Z" else PAPER, ACCENT if lab == "Z" else RULE, 1)
        draw.text((297 + j * 49, 818), lab, font=font(15, "bold"), fill=ACCENT if lab == "Z" else MUTED, anchor="mm")
    draw.text((522, 818), "SHOTS  1,000", font=font(13, "mono"), fill=INK, anchor="lm")
    # Right results panel.
    draw.line((852, 472, 852, 889), fill=RULE, width=2)
    draw.text((891, 480), "02 / STATE & MEASUREMENT", font=font(13, "mono"), fill=ACCENT)
    draw.text((891, 505), "Read the result", font=font(24, "bold"), fill=INK)
    draw.text((893, 562), "STATE VECTOR / Z BASIS", font=font(12, "mono"), fill=MUTED)
    for j, (ket, amp, prob) in enumerate((("|00⟩", "0.707", "P 0.500"), ("|11⟩", "0.707", "P 0.500"))):
        y = 598 + j * 44
        draw.text((898, y), ket, font=font(16, "mono"), fill=INK, anchor="lm")
        draw.text((1000, y), amp, font=font(15, "mono"), fill=MUTED, anchor="lm")
        draw.text((1170, y), prob, font=font(14, "mono"), fill=INK, anchor="lm")
    draw.line((891, 692, 1737, 692), fill=RULE, width=2)
    draw.text((893, 714), "PREDICTED DISTRIBUTION", font=font(12, "mono"), fill=MUTED)
    for j, (ket, val) in enumerate((("|00⟩", "50.0%"), ("|01⟩", "0.0%"), ("|10⟩", "0.0%"), ("|11⟩", "50.0%"))):
        y = 754 + j * 33
        draw.text((898, y), ket, font=font(14, "mono"), fill=INK, anchor="lm")
        draw.line((1000, y, 1597, y), fill=SOFT, width=9)
        amount = int(597 * (0.5 if val == "50.0%" else 0.015))
        draw.line((1000, y, 1000 + amount, y), fill=ACCENT if val == "50.0%" else RULE, width=9)
        draw.text((1630, y), val, font=font(13, "mono"), fill=INK, anchor="lm")
    draw.text((128, 938), "IDEAL STATE-VECTOR MODEL  /  UP TO FOUR QUBITS", font=font(14, "mono"), fill=MUTED)
    baseline(draw, 6)


def frame_bell(draw: ImageDraw.ImageDraw) -> None:
    header(draw, 7, "THE EXPERIMENT / BELL-STATE PRESET")
    draw.text((125, 172), "Two qubits.", font=font(68, "reg"), fill=INK)
    draw.text((125, 246), "One shared state.", font=font(74, "serif"), fill=ACCENT)
    draw.text((133, 351), "Prepare with H, entangle with CNOT, measure both in Z.", font=font(23, "reg"), fill=MUTED)
    # Circuit
    rounded(draw, (131, 407, 1026, 718), 8, SURFACE, RULE, 2)
    draw.text((169, 441), "CIRCUIT", font=font(14, "mono"), fill=ACCENT)
    for y, q in ((532, "q0"), (625, "q1")):
        draw.text((169, y), q, font=font(20, "mono"), fill=INK, anchor="lm")
        wire(draw, 238, y, 876, RULE, 3)
        measurement(draw, 900, y)
    gate(draw, 377, 532, "H", True, 60)
    draw.ellipse((534, 522, 554, 542), fill=ACCENT)
    draw.line((544, 532, 544, 625), fill=ACCENT, width=3)
    rounded(draw, (526, 607, 562, 643), 4, WASH, ACCENT, 2)
    target_plus(draw, 544, 625, 8, ACCENT, 2)
    draw.text((189, 680), "H q0  →  CNOT(q0, q1)", font=font(16, "mono"), fill=MUTED)
    # Results ideal + finite illustration.
    rounded(draw, (1060, 407, 1785, 718), 8, SURFACE, RULE, 2)
    draw.text((1097, 441), "IDEAL Z-BASIS PREDICTION", font=font(14, "mono"), fill=ACCENT)
    for i, (ket, val) in enumerate((("|00⟩", "50%"), ("|01⟩", "0%"), ("|10⟩", "0%"), ("|11⟩", "50%"))):
        y = 503 + i * 43
        draw.text((1097, y), ket, font=font(20, "mono"), fill=INK, anchor="lm")
        draw.line((1200, y, 1620, y), fill=SOFT, width=12)
        amount = 210 if val == "50%" else 0
        if amount:
            draw.line((1200, y, 1200 + amount, y), fill=ACCENT, width=12)
        draw.text((1660, y), val, font=font(18, "mono"), fill=INK, anchor="lm")
    # A possible finite shot sample; clearly called an illustration.
    draw.text((137, 778), "ONE POSSIBLE 100-SHOT SAMPLE", font=font(15, "mono"), fill=MUTED)
    for x, label, count, fill in ((137, "00", "51", ACCENT), (515, "11", "49", INK)):
        rounded(draw, (x, 813, x + 345, 921), 7, SURFACE, RULE, 2)
        draw.text((x + 24, 854), f"|{label}⟩", font=font(27, "mono"), fill=INK, anchor="lm")
        draw.line((x + 133, 855, x + 268, 855), fill=SOFT, width=13)
        draw.line((x + 133, 855, x + 133 + int(135 * int(count) / 100), 855), fill=fill, width=13)
        draw.text((x + 312, 855), count, font=font(22, "mono"), fill=INK, anchor="rm")
    draw.text((1345, 852), "Correlation is not a physical Bell test.", font=font(22, "serif"), fill=ACCENT, anchor="mm")
    draw.text((1345, 887), "A simulator checks the ideal circuit prediction.", font=font(16, "reg"), fill=MUTED, anchor="mm")
    baseline(draw, 7)


def frame_advanced(draw: ImageDraw.ImageDraw) -> None:
    header(draw, 8, "BEYOND THE FIRST CIRCUIT / ADVANCED TRACK")
    draw.text((125, 170), "Go deeper, with", font=font(68, "reg"), fill=INK)
    draw.text((125, 246), "the limits in view.", font=font(74, "serif"), fill=ACCENT)
    draw.text((133, 351), "An algorithm is a method with assumptions, costs, and a model of the device.", font=font(23, "reg"), fill=MUTED)
    cards = [
        (135, "01", "ALGORITHMS", ["Search", "Phase estimation", "Quantum Fourier transform"], "Choose the problem structure."),
        (566, "02", "OPEN SYSTEMS", ["Density matrices", "Decoherence", "Noise channels"], "Separate ideal states from noise."),
        (997, "03", "ERROR CORRECTION", ["Encoding", "Syndromes", "Fault tolerance"], "Count the resource overhead."),
        (1428, "04", "HARDWARE & HYBRIDS", ["Compilation", "Mapping", "Hybrid workflows"], "Meet the physical constraints."),
    ]
    for x, number, label, items, closing in cards:
        rounded(draw, (x, 432, x + 358, 829), 8, SURFACE, RULE, 2)
        draw.text((x + 27, 465), number, font=font(15, "mono"), fill=ACCENT)
        draw.text((x + 27, 504), label, font=font(15, "mono"), fill=MUTED)
        draw.line((x + 27, 542, x + 331, 542), fill=RULE, width=2)
        yy = 584
        for item in items:
            draw.ellipse((x + 29, yy + 6, x + 39, yy + 16), fill=ACCENT)
            for line in fit_text(draw, item, font(21, "bold"), 263):
                draw.text((x + 56, yy), line, font=font(21, "bold"), fill=INK)
                yy += 27
            yy += 25
        draw.line((x + 27, 761, x + 331, 761), fill=RULE, width=2)
        text_block(draw, (x + 27, 781), closing, font(15, "reg"), MUTED, 290, 4)
    draw.text((141, 889), "ALGORITHMS", font=font(13, "mono"), fill=ACCENT)
    draw.line((263, 900, 1775, 900), fill=RULE, width=2)
    draw.text((1777, 889), "ASSUMPTIONS  →  CIRCUIT COST  →  DEVICE", font=font(13, "mono"), fill=MUTED, anchor="ra")
    baseline(draw, 8)


def frame_method(draw: ImageDraw.ImageDraw) -> None:
    header(draw, 9, "EXPERIMENTAL METHOD / REPRODUCIBLE REASONING")
    draw.text((125, 171), "Make claims you", font=font(69, "reg"), fill=INK)
    draw.text((125, 249), "can explain.", font=font(75, "serif"), fill=ACCENT)
    draw.text((133, 355), "A good experiment connects the model, prediction, and observation.", font=font(23, "reg"), fill=MUTED)
    # Method card with numbered steps.
    rounded(draw, (132, 415, 1164, 875), 8, SURFACE, RULE, 2)
    draw.text((171, 451), "A REPEATABLE EXPERIMENT", font=font(14, "mono"), fill=ACCENT)
    steps = [
        ("01", "Ask a question", "What does changing the basis reveal?"),
        ("02", "Write a prediction", "State the expected distribution."),
        ("03", "Run finite shots", "Record the measurement basis and count."),
        ("04", "Interpret with limits", "Separate the model from the observation."),
    ]
    for i, (num, title, body) in enumerate(steps):
        y = 513 + i * 82
        draw.text((174, y), num, font=font(16, "mono"), fill=ACCENT, anchor="lm")
        draw.text((247, y), title, font=font(23, "bold"), fill=INK, anchor="lm")
        draw.text((537, y), body, font=font(16, "reg"), fill=MUTED, anchor="lm")
        if i < 3:
            draw.line((173, y + 37, 1122, y + 37), fill=RULE, width=1)
    # Reference resources.
    rounded(draw, (1200, 415, 1784, 875), 8, WASH, "#D6B8AB", 2)
    draw.text((1241, 451), "TOOLS FOR THE NEXT STEP", font=font(14, "mono"), fill=ACCENT)
    resources = [
        ("A", "Worked lessons", "Examples and self-checks"),
        ("B", "Searchable glossary", "Notation, concepts, definitions"),
        ("C", "OpenQASM 2 export", "Take a circuit to other tools"),
    ]
    for i, (tag, title, desc) in enumerate(resources):
        y = 533 + i * 95
        draw.text((1241, y), tag, font=font(16, "mono"), fill=ACCENT, anchor="lm")
        draw.text((1290, y - 9), title, font=font(22, "bold"), fill=INK)
        draw.text((1290, y + 23), desc, font=font(15, "reg"), fill=MUTED)
        if i < 2:
            draw.line((1240, y + 51, 1741, y + 51), fill="#D6B8AB", width=1)
    draw.text((1242, 819), "LOCAL PROGRESS  /  YOUR EXPERIMENT RECORD", font=font(13, "mono"), fill=MUTED)
    baseline(draw, 9)


def frame_closing(draw: ImageDraw.ImageDraw) -> None:
    draw.rectangle((0, 0, WIDTH, HEIGHT), fill=INK)
    # Architectural, not sci-fi: a fine circuit trace and oversized ring.
    for r, color, width in ((345, "#44463F", 2), (244, "#3C3E38", 2), (134, "#4A4C44", 2)):
        draw.ellipse((1390 - r, 475 - r, 1390 + r, 475 + r), outline=color, width=width)
    draw.line((1100, 475, 1675, 475), fill="#4B4D47", width=2)
    for x, gate_label in ((1184, "H"), (1390, "Z"), (1596, "M")):
        gate(draw, x, 475, gate_label, gate_label == "Z", 62)
    draw.text((132, 105), "QUBIT ATLAS", font=font(22, "bold"), fill=PAPER)
    draw.text((132, 142), "QUANTUM COMPUTING, TAUGHT PROPERLY", font=font(14, "mono"), fill="#C2C3BB")
    draw.text((143, 322), "Build the model", font=font(70, "reg"), fill=PAPER)
    draw.text((143, 401), "before the headline.", font=font(76, "serif"), fill="#D19A83")
    draw.text((150, 529), "A rigorous path from the first qubit to experiments", font=font(25, "reg"), fill="#C2C3BB")
    draw.text((150, 564), "you can design, measure, and explain.", font=font(25, "reg"), fill="#C2C3BB")
    rounded(draw, (150, 686, 576, 763), 5, PAPER, PAPER, 1)
    draw.text((183, 724), "START WITH LESSON ONE", font=font(18, "bold"), fill=INK, anchor="lm")
    arrow(draw, 537, 724, ACCENT)
    draw.text((151, 825), "10 MODULES   ·   30 LESSONS   ·   A LOCAL CIRCUIT LAB", font=font(15, "mono"), fill="#B1B2AA")
    baseline(draw, 10, "START WITH THE FOUNDATIONS", dark=True)


DRAWERS = {
    "opening": frame_opening,
    "state": frame_state,
    "measurement": frame_measurement,
    "interference": frame_interference,
    "curriculum": frame_curriculum,
    "lab": frame_lab,
    "bell": frame_bell,
    "advanced": frame_advanced,
    "method": frame_method,
    "closing": frame_closing,
}


def save_frames() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    for index, scene in enumerate(SCENES, start=1):
        image = Image.new("RGB", (WIDTH, HEIGHT), PAPER)
        draw = ImageDraw.Draw(image)
        DRAWERS[scene["kind"]](draw)
        image.save(ASSETS / f"scene-{index:02d}.png", optimize=True)


def write_voice_scripts() -> None:
    VOICE.mkdir(parents=True, exist_ok=True)
    for index, scene in enumerate(SCENES, start=1):
        text = "\n\n".join(scene["narration"]) + "\n"
        (VOICE / f"scene-{index:02d}.txt").write_text(text, encoding="utf-8")


def run(cmd: list[str], *, capture: bool = False) -> str:
    completed = subprocess.run(cmd, check=True, text=True, stdout=subprocess.PIPE if capture else None, stderr=subprocess.PIPE if capture else None)
    return completed.stdout.strip() if capture else ""


def media_duration(path: Path) -> float:
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(path)], capture=True))


def write_srt(durations: list[float]) -> None:
    cues: list[tuple[float, float, str]] = []
    scene_start = 0.0
    for scene, duration in zip(SCENES, durations):
        phrases = scene["narration"]
        weights = [max(1, len(re.findall(r"\b[\w'-]+\b", phrase))) + 1.3 for phrase in phrases]
        scale = duration / sum(weights)
        local = 0.0
        for phrase, weight in zip(phrases, weights):
            span = weight * scale
            lines = textwrap.wrap(phrase, width=55, break_long_words=False, break_on_hyphens=False)
            cues.append((scene_start + local, scene_start + local + span, "\n".join(lines)))
            local += span
        scene_start += duration
    def timestamp(seconds: float) -> str:
        ms = round(seconds * 1000)
        hours, ms = divmod(ms, 3_600_000)
        minutes, ms = divmod(ms, 60_000)
        sec, ms = divmod(ms, 1_000)
        return f"{hours:02}:{minutes:02}:{sec:02},{ms:03}"
    lines = []
    for index, (start, end, caption) in enumerate(cues, start=1):
        lines.extend((str(index), f"{timestamp(start)} --> {timestamp(end)}", caption, ""))
    (VIDEO / "captions.srt").write_text("\n".join(lines), encoding="utf-8")


def write_caption_track(durations: list[float]) -> Path:
    """Create one timed alpha-video track so captions can be burned in without libass."""
    caption_width, caption_height = 1600, 150
    caption_files: list[tuple[Path, float]] = []
    for scene_number, (scene, duration) in enumerate(zip(SCENES, durations), start=1):
        phrases = scene["narration"]
        weights = [max(1, len(re.findall(r"\b[\w'-]+\b", phrase))) + 1.3 for phrase in phrases]
        for sentence_number, (phrase, weight) in enumerate(zip(phrases, weights), start=1):
            span = duration * weight / sum(weights)
            caption = Image.new("RGBA", (caption_width, caption_height), (0, 0, 0, 0))
            draw = ImageDraw.Draw(caption)
            draw.rounded_rectangle((0, 0, caption_width - 1, caption_height - 1), radius=14, fill=(36, 37, 33, 226))
            wrapped = "\n".join(textwrap.wrap(phrase, width=55, break_long_words=False, break_on_hyphens=False))
            draw.multiline_text((caption_width // 2, caption_height // 2), wrapped, font=font(32, "bold"), fill=rgb(PAPER), anchor="mm", align="center", spacing=7)
            path = ASSETS / f"caption-{scene_number:02d}-{sentence_number:02d}.png"
            caption.save(path, optimize=True)
            caption_files.append((path, span))
    blank_path = ASSETS / "caption-blank.png"
    Image.new("RGBA", (caption_width, caption_height), (0, 0, 0, 0)).save(blank_path, optimize=True)

    list_path = WORK / "captions.ffconcat"
    with list_path.open("w", encoding="utf-8") as output:
        output.write("ffconcat version 1.0\n")
        for path, duration in caption_files:
            output.write(f"file '{path.as_posix()}'\n")
            output.write(f"duration {duration:.6f}\n")
        # The repeated final blank gives the preceding blank card its full hold.
        output.write(f"file '{blank_path.as_posix()}'\n")
        output.write("duration 4.800000\n")
        output.write(f"file '{blank_path.as_posix()}'\n")
        output.write("duration 0.100000\n")

    track_path = WORK / "captions.mov"
    run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(list_path),
        "-vf", f"fps={FPS},format=argb", "-an", "-t", f"{sum(durations) + 4.8:.4f}",
        "-c:v", "qtrle", "-pix_fmt", "argb", str(track_path),
    ])
    return track_path


def write_score(total_duration: float) -> Path:
    """A quiet original analog-style pad, rendered locally with no music assets."""
    sample_rate = 24000
    path = WORK / "score.wav"
    chord_progression = [
        (55.00, 82.41, 110.00, 130.81, 164.81),      # A minor, warm and open
        (43.65, 87.31, 110.00, 130.81, 174.61),      # F major seven
        (49.00, 73.42, 110.00, 146.83, 196.00),      # G sus
        (65.41, 98.00, 130.81, 164.81, 196.00),      # C major seven
    ]
    frames = int(total_duration * sample_rate)
    with wave.open(str(path), "wb") as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(sample_rate)
        chunk = sample_rate
        for offset in range(0, frames, chunk):
            count = min(chunk, frames - offset)
            values = array.array("h")
            for k in range(count):
                sample = offset + k
                t = sample / sample_rate
                chord_number = int(t // 16) % len(chord_progression)
                phase = (t % 16) / 16
                # Crossfade neighboring chords over a slow 1.3 s window.
                edge = t % 16
                blend = min(1.0, max(0.0, edge / 1.3))
                prior = chord_progression[(chord_number - 1) % len(chord_progression)]
                current = chord_progression[chord_number]
                fade = 0.78 + 0.22 * (0.5 + 0.5 * math.sin((2 * math.pi * t) / 9.5))
                value = 0.0
                for j, (f0, f1) in enumerate(zip(prior, current)):
                    frequency = f0 * (1 - blend) + f1 * blend
                    partial_weight = (0.42, 0.28, 0.18, 0.12, 0.09)[j]
                    value += partial_weight * math.sin(2 * math.pi * frequency * t)
                    value += partial_weight * 0.16 * math.sin(2 * math.pi * frequency * 2.003 * t)
                # Tiny, rounded high-note accents every eight seconds.
                accent_phase = t % 8.0
                if accent_phase < 1.6:
                    note = (523.25, 392.00, 440.00, 587.33)[int(t // 8) % 4]
                    accent_env = min(1.0, accent_phase / 0.18) * math.exp(-accent_phase * 1.45)
                    value += 0.18 * accent_env * math.sin(2 * math.pi * note * t)
                # A soft pulse gives the sustained chord bed a clear musical rhythm.
                pulse_phase = t % 2.0
                if pulse_phase < 0.85:
                    pulse_note = (261.63, 329.63, 392.00, 329.63)[int(t // 2) % 4]
                    pulse_env = min(1.0, pulse_phase / 0.025) * math.exp(-pulse_phase * 2.8)
                    value += 0.27 * pulse_env * (0.74 * math.sin(2 * math.pi * pulse_note * t) + 0.26 * math.sin(2 * math.pi * pulse_note * 2.0 * t))
                # Gentle head and tail fades.
                env = min(1.0, t / 1.5, max(0.0, (total_duration - t) / 2.0))
                value *= 0.055 * fade * env
                values.append(max(-32767, min(32767, int(value * 32767))))
            output.writeframesraw(values.tobytes())
    return path


def make_thumbnail() -> None:
    image = Image.open(ASSETS / "scene-01.png").convert("RGB")
    image.thumbnail((1280, 720), Image.Resampling.LANCZOS)
    image.save(VIDEO / "thumbnail.png", optimize=True)


def render() -> None:
    WORK.mkdir(parents=True, exist_ok=True)
    tempo = 1.20
    durations = [media_duration(VOICE / f"scene-{i:02d}.aiff") / tempo for i in range(1, len(SCENES) + 1)]
    scene_lengths = [d + (4.8 if i == len(SCENES) else 0.8) for i, d in enumerate(durations, start=1)]
    final_duration = sum(durations) + 4.8
    write_srt(durations)
    score_path = write_score(final_duration)
    caption_path = write_caption_track(durations)

    args = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y"]
    for index, scene_length in enumerate(scene_lengths, start=1):
        args += ["-loop", "1", "-framerate", str(FPS), "-t", f"{scene_length:.4f}", "-i", str(ASSETS / f"scene-{index:02d}.png")]
        args += ["-i", str(VOICE / f"scene-{index:02d}.aiff")]
    music_index = len(SCENES) * 2
    args += ["-i", str(score_path)]
    caption_index = music_index + 1
    args += ["-i", str(caption_path)]

    filters: list[str] = []
    for index, (scene, speech_length, scene_length) in enumerate(zip(SCENES, durations, scene_lengths)):
        image_index = 2 * index
        audio_index = image_index + 1
        filters.append(
            f"[{image_index}:v]zoompan=z='min(zoom+0.000055,1.045)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s={WIDTH}x{HEIGHT}:fps={FPS},"
            f"trim=duration={scene_length:.4f},setpts=PTS-STARTPTS,format=yuv420p[v{index}]"
        )
        tail = scene_length - speech_length
        filters.append(f"[{audio_index}:a]atempo={tempo:.2f},aresample=48000,asetpts=PTS-STARTPTS,apad=pad_dur={tail:.4f},atrim=duration={scene_length:.4f},aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[a{index}]")

    overlap = 0.8
    video_label = "v0"
    video_offset = 0.0
    for index in range(1, len(SCENES)):
        video_offset += scene_lengths[index - 1] - overlap
        out_label = f"vx{index}"
        filters.append(f"[{video_label}][v{index}]xfade=transition=fade:duration={overlap:.3f}:offset={video_offset:.4f}[{out_label}]")
        video_label = out_label

    audio_label = "a0"
    for index in range(1, len(SCENES)):
        out_label = f"ax{index}"
        filters.append(f"[{audio_label}][a{index}]acrossfade=d={overlap:.3f}:c1=tri:c2=tri[{out_label}]")
        audio_label = out_label
    music_duration = final_duration
    filters.append(f"[{music_index}:a]aresample=48000,atrim=duration={music_duration:.4f},volume=1.25,afade=t=in:st=0:d=2.0,afade=t=out:st={max(0.0,music_duration-2.5):.4f}:d=2.5[music]")
    filters.append(f"[{audio_label}]loudnorm=I=-14:LRA=8:TP=-1.5[voice]")
    filters.append("[voice][music]amix=inputs=2:duration=longest:weights='1 1':normalize=0,alimiter=limit=0.95[aout]")

    filters.append(f"[{caption_index}:v]setpts=PTS-STARTPTS,format=rgba[caption_track]")
    filters.append(f"[{video_label}][caption_track]overlay=x=160:y=840:format=auto:eof_action=pass[vout]")

    filter_graph = ";".join(filters)
    args += [
        "-filter_complex", filter_graph,
        "-map", "[vout]", "-map", "[aout]",
        "-t", f"{final_duration:.4f}",
        "-r", str(FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-ac", "2", "-movflags", "+faststart", str(OUTPUT),
    ]
    print("Rendering", OUTPUT)
    print(f"Speech: {sum(durations):.1f}s | Master: {final_duration:.1f}s | {len(SCENES)} scenes")
    run(args)
    make_thumbnail()
    print(f"Finished: {media_duration(OUTPUT):.2f}s")


if __name__ == "__main__":
    if sys.argv[1:] == ["--prepare"]:
        save_frames()
        write_voice_scripts()
        print("Prepared 10 scene frames and narration scripts in video/.")
        raise SystemExit(0)
    if not all((VOICE / f"scene-{i:02d}.aiff").exists() for i in range(1, len(SCENES) + 1)):
        raise SystemExit("Narration files are missing. See video/README.md for the build steps.")
    save_frames()
    render()
