"use strict";

import {
	Complex, cAdd, cMult, cDiv,
	cMatrix, cVector, smMult, mmMult,
	tensor
} from "./maths.js";


export {showState, probabilities, blochCoords, I2, h, x, y, z, cnot};

// == Quantum vizualization ==

function showState(state) {
	return `[${state.content[0].show()} ${state.content[1].show()}]`;
}

function probabilities(state) {
	return [state.content[0].norm2(), state.content[1].norm2()];
}

function blochCoords(state) {
	const phase1 = Math.atan2(state.content[0].imag, state.content[0].real);
	const phase2 = Math.atan2(state.content[1].imag, state.content[1].real);
	const relativePhase = phase2 - phase1;

	const amplitudePhase = Math.atan2(state.content[1].norm(), (state.content[0].norm()))*2;

	return `[${amplitudePhase.toFixed(3)} ${relativePhase.toFixed(3)}]`;
}

// == Quantum Gates ==

const invsqrt2 = 1/Math.sqrt(2);

let I2 = new cMatrix(2, 2);

I2.content[0] = new Complex(1, 0);
I2.content[3] = new Complex(1, 0);

// Single Qubit

let h = new cMatrix(2, 2);

h.content[0] = new Complex(invsqrt2,0)
h.content[1] = new Complex(invsqrt2,0)
h.content[2] = new Complex(invsqrt2,0)
h.content[3] = new Complex(-invsqrt2,0)

let x = new cMatrix(2, 2);

x.content[1] = new Complex(1, 0);
x.content[2] = new Complex(1, 0);

let y = new cMatrix(2, 2);

y.content[1] = new Complex(0, -1);
y.content[2] = new Complex(0, 1);

let z = new cMatrix(2, 2);

z.content[0] = new Complex(1, 0);
z.content[3] = new Complex(-1, 0);

// Multiple qubit

let cnot = new cMatrix(4, 4);

cnot.content[0] = new Complex(1, 0);
cnot.content[5] = new Complex(1, 0);
cnot.content[11] = new Complex(1, 0);
cnot.content[14] = new Complex(1, 0);
