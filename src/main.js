"use strict";

import {
	Complex, cAdd, cMult, cDiv,
	cMatrix, cVector, smMult, mmMult,
	tensor
} from "./maths.js";

import * as q from "./quantum.js"

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
let bCtx = blochVisuDisplay.getContext("2d");

bCtx.fillStyle = "#5CE";
bCtx.fillRect(0, 0, 300, 300);
bCtx.fillStyle = "#00F";
bCtx.beginPath();
bCtx.arc(150, 150, 130, 0, 2* Math.PI);
bCtx.fill();

let prob0Display = document.getElementById("prob0");
let prob1Display = document.getElementById("prob1");

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
}

let hadamardBtn = document.getElementById("hadamard");
let XBtn = document.getElementById("X");
let YBtn = document.getElementById("Y");
let ZBtn = document.getElementById("Z");

hadamardBtn.onclick = () => {
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

updateDisplay();