"use strict";

// == Relevant data structures ==

// Complex numbers
class Complex {
	constructor(real, imag) {
		this.real = real;
		this.imag = imag;
	}

	show() {
		const sign = this.imag >= 0 ? "+" : "-";
		return `${this.real}${sign}${Math.abs(this.imag)}i`;
	}

	conjugate() {
		return new Complex(this.real, -this.imag);
	}

	norm2() {
		return this.real*this.real + this.imag*this.imag;
	}

	norm() {
		return Math.sqrt(this.norm2());
	}
}

function cAdd(c1, c2) {
	return new Complex(
		c1.real + c2.real,
		c1.imag + c2.imag
	);
}

function cSub(c1, c2) {
	return new Complex(
		c1.real - c2.real,
		c1.imag - c2.imag
	);
}

function cMult(c1, c2) {
	return new Complex(
		c1.real*c2.real - c1.imag*c2.imag,
		c1.real*c2.imag + c1.imag*c2.real
	);
}

function cDiv(c1, c2) {
	return new Complex(
		(c1.real*c2.real + c1.imag*c2.imag)/(c2.real*c2.real + c2.imag*c2.imag),
		(c1.imag*c2.real - c1.real*c2.imag)/(c2.real*c2.real + c2.imag*c2.imag)
	);
}

// Matrices and vectors
class cMatrix {
	constructor(m, n) {
		this.m = m;
		this.n = n;
		
		this.content = [];
		for (let i = 0; i < m*n; i++) {
			this.content.push(new Complex(0, 0));
		}
	}

	show() {
		let matrix = "["
		for (let i = 0; i < this.m; i++) {
			matrix += "["
			for (let j = 0; j < this.n; j++) {
				matrix += this.content[i*this.n + j].show() + " "
			}
			matrix = matrix.trim() + "] "
		}
		matrix = matrix.trim() + "]"
		return matrix;
	}

	T() {
		let matrixT = new cMatrix(this.n, this.m);
		for (let i = 0; i < this.m; i++) {
			for (let j = 0; j < this.n; j++) {
				matrixT.content[j*this.m + i] = this.content[i*this.n + j];
			}
		}
		return matrixT;
	}
	
	dagger() {
		let md = this.T();
		for (let i = 0; i < md.m*md.n; i++) {
			md.content[i] = md.content[i].conjugate();
		}
		return md;
	}

	norm2() {
		let n = 0;
		for (let i = 0; i < this.m*this.n; i++) {
			n += this.content[i].norm2();
		}
		return n;	
	}

	norm() {
		return Math.sqrt(this.norm2());
	}
	
	normalized() {
		return smMult(new Complex(1/this.norm(), 0),this);
	}
}

class cVector extends cMatrix {
	constructor(m) {
		super(m, 1);
	}
}

function mAdd(m1, m2) {
	let m3 = new cMatrix(m1.m, m1.n);
	for (let i = 0; i < m1.m; i++) {
		for (let j = 0; j < m1.n; j++) {
			m3.content[i*m1.n + j] = m1[i*m1.n + j] + m2[i*m1.n + j];
		}
	}
	return m3;
}

function smMult(s, m) {
	let mr = new cMatrix(m.m, m.n);
	for (let i = 0; i < m.m; i++) {
		for (let j = 0; j < m.n; j++) {
			mr.content[i*m.n + j] = cMult(s, m.content[i*m.n + j])
		}
	}
	return mr;	
}

function mmMult(m1, m2) {
	if (m1.n != m2.m) {
		throw "Can't multiply matrices!"
	}

	let m3 = new cMatrix(m1.m, m2.n);
	for (let i = 0; i < m1.m; i++) {
		for (let j = 0; j < m2.n; j++) {
			for (let k = 0; k < m1.n; k++) {
				m3.content[i*m2.n + j] = cAdd(m3.content[i*m2.n + j], cMult(m1.content[i*m1.n + k], m2.content[k*m2.n + j]));
			}
		}
	}

	return m3;
}

function tensor(m1, m2) {
	let m3 = new cMatrix(m1.m*m2.m, m1.n*m2.n);

	for (let i = 0; i < m1.m; i++) {
		for (let j = 0; j < m1.n; j++) {
			for (let k = 0; k < m2.m; k++) {
				for (let l = 0; l < m2.n; l++) {
					m3.content[(i*m2.m + k)*m3.n + (j*m2.n + l)] =
						cMult(m1.content[i*m1.n + j], m2.content[k*m2.n + l]);
				}
			}
		}
	}

	return m3;
} 


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

	return `[${amplitudePhase} ${relativePhase}]`;
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

// == Initialization ==

// State initialized to [1, 0]
let state = new cVector(2);

state.content[0] = new Complex(1, 0);
state.content[1] = new Complex(0, 0);

// == Connect DOM ==

let stateDisplay = document.getElementById("state");
let prob0Display = document.getElementById("prob0");
let prob1Display = document.getElementById("prob1");
let blochDisplay = document.getElementById("bloch");

function updateDisplay() {
	stateDisplay.innerText = showState(state);
	
	const probs = probabilities(state);
	prob0Display.style.height = `${probs[0]*100}%`;
	prob1Display.style.height = `${probs[1]*100}%`;
	blochDisplay.innerText = blochCoords(state);
}

let hadamardBtn = document.getElementById("hadamard");
let XBtn = document.getElementById("X");
let YBtn = document.getElementById("Y");
let ZBtn = document.getElementById("Z");

hadamardBtn.onclick = () => {
	state = mmMult(h, state).normalized();
	updateDisplay();
};

XBtn.onclick = () => {
	state = mmMult(x, state).normalized();
	updateDisplay();
};

YBtn.onclick = () => {
	state = mmMult(y, state).normalized();
	updateDisplay();
};

ZBtn.onclick = () => {
	state = mmMult(z, state).normalized();
	updateDisplay();
};

updateDisplay();
