"use strict";

import {
	Complex, cAdd, cMult, cDiv,
	cMatrix, cVector, smMult, mmMult,
	tensor
} from "./maths.js";

import * as q from "./quantum.js";

import * as bloch from "./bloch.js";

// == Initialization ==

// State initialized to [1, 0]
let state = new cVector(2);

state.content[0] = new Complex(1, 0);
state.content[1] = new Complex(0, 0);

// == Connect DOM ==

let stateDisplay = document.getElementById("state");

let amp0Display = document.getElementById("amp0");
let amp1Display = document.getElementById("amp1");

let blochDisplay = document.getElementById("bloch");

let blochVisuDisplay = document.getElementById("bloch-visualization");
let bgl = blochVisuDisplay.getContext("webgl");

bloch.setup(bgl);

let prob0Display = document.getElementById("prob0");
let prob1Display = document.getElementById("prob1");
let probDisplay = document.getElementById("prob");

function updateDisplay() {
	stateDisplay.innerText = state.show();

	amp0Display.style.height = `${state.content[0].norm()*100}%`;
	amp1Display.style.height = `${state.content[1].norm()*100}%`;
	
	amp0Display.style.backgroundColor = `hsl(${state.content[0].arg()*180/Math.PI}, 100%, 50%)`;
	amp1Display.style.backgroundColor = `hsl(${state.content[1].arg()*180/Math.PI}, 100%, 50%)`;
	
	blochDisplay.innerText = q.blochCoords(state);
	
	const probs = q.probabilities(state);
	prob0Display.style.height = `${probs[0]*100}%`;
	prob1Display.style.height = `${probs[1]*100}%`;
	probDisplay.innerText = `[${(probs[0]*100).toFixed(2)}% ${(probs[1]*100).toFixed(2)}%]`;
}

let HBtn = document.getElementById("H");
let XBtn = document.getElementById("X");
let YBtn = document.getElementById("Y");
let ZBtn = document.getElementById("Z");
let RphiBtn = document.getElementById("Rphi");
let RphiArg = document.getElementById("RphiArg");

HBtn.onclick = () => {
	state = mmMult(q.h, state).normalized();
	updateDisplay();
};

XBtn.onclick = () => {
	state = mmMult(q.x, state).normalized();
	updateDisplay();
};

YBtn.onclick = () => {
	state = mmMult(q.y, state).normalized();
	updateDisplay();
};

ZBtn.onclick = () => {
	state = mmMult(q.z, state).normalized();
	updateDisplay();
};

RphiBtn.onclick = () => {
	state = mmMult(q.Rphi(parseFloat(RphiArg.value)*Math.PI), state).normalized();
	updateDisplay();
};

updateDisplay();
