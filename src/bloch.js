"use strict";

import * as webgl from "./webgl.js";

export {setup, render};

// == Shaders ==

// Circle
let circleVertexShader = `
attribute vec2 a_position;

void main() {
	gl_Position = vec4(a_position, 0.0, 1.0);
}
`;
let circleFragmentShader = `
precision mediump float;

void main() {
	gl_FragColor = vec4(0.5, 0.5, 1.0, 1.0);
}
`;

// Marks
let marksVertexShader = `
attribute vec4 a_position;

uniform mat4 u_projection;
uniform mat4 u_rotationY;
uniform mat4 u_rotationX;

uniform mat4 u_translation;

void main() {
	gl_Position = u_projection * u_translation * u_rotationX * u_rotationY * a_position;
}
`;

let marksFragmentShader = `
precision mediump float;

uniform float u_back;

void main() {
	if (u_back > 0.0) {
		gl_FragColor = vec4(0.6*vec3(0.5, 0.5, 1.0), 1.0);
	} else {
		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
	}
}
`;

// Pointer
let pointerVertexShader = `
attribute vec4 a_position;

uniform mat4 u_projection;
uniform mat4 u_rotationY;
uniform mat4 u_rotationX;

uniform mat4 u_translation;

void main() {
	gl_Position = u_projection * u_translation * u_rotationX * u_rotationY * a_position;
}
`;

let pointerFragmentShader = `
precision mediump float;

void main() {
	gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
}
`;

// == "Global" Variables ==

// Programs
let circleProgram;
let marksProgram;
let pointerProgram

// Buffers
let circlePositionBuffer;
let circleVertices;

let marksPositionBuffer;
let marksVertices;

let pointerPositionBuffer;
let pointerVertices = [
	0, 0, 0,
	1, 0, 0
];

// == Main Functions ==

function setup(gl) {
	// Precalculate stuff
	calculateCircleVertices();
	calculateMarksVertices();

	// WebGL setup
	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable(gl.BLEND);

	// Create programs
	circleProgram = webgl.createProgram(gl, circleVertexShader, circleFragmentShader);
	marksProgram = webgl.createProgram(gl, marksVertexShader, marksFragmentShader);
	pointerProgram = webgl.createProgram(gl, pointerVertexShader, pointerFragmentShader);
	
	// Attributes and uniforms
	circleProgram.a_position = gl.getAttribLocation(circleProgram, "a_position");
	
	marksProgram.a_position = gl.getAttribLocation(marksProgram, "a_position");
	marksProgram.u_rotationY = gl.getUniformLocation(marksProgram, "u_rotationY");
	marksProgram.u_rotationX = gl.getUniformLocation(marksProgram, "u_rotationX");
	marksProgram.u_projection = gl.getUniformLocation(marksProgram, "u_projection");
	marksProgram.u_translation = gl.getUniformLocation(marksProgram, "u_translation");
	marksProgram.u_back = gl.getUniformLocation(marksProgram, "u_back");
	
	pointerProgram.a_position = gl.getAttribLocation(pointerProgram, "a_position");
	pointerProgram.u_rotationY = gl.getUniformLocation(pointerProgram, "u_rotationY");
	pointerProgram.u_rotationX = gl.getUniformLocation(pointerProgram, "u_rotationX");
	pointerProgram.u_projection = gl.getUniformLocation(pointerProgram, "u_projection");
	pointerProgram.u_translation = gl.getUniformLocation(pointerProgram, "u_translation");

	// Buffers
	circlePositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, circlePositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circleVertices), gl.STATIC_DRAW);

	marksPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, marksPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(marksVertices), gl.STATIC_DRAW);
	
	pointerPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, pointerPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointerVertices), gl.STATIC_DRAW);
	
	// Set up viewport
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	
	// Render
	render(gl, [0, 0]);
}

function render(gl, blochCoords) {
	// Clear canvas
	gl.clearColor(0x55/0xFF, 0xCC/0xFF, 0xEE/0xFF, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Bloch coordinates
	calculatePointerRotations(blochCoords);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, pointerPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointerVertices), gl.STATIC_DRAW);

	// Draw
	drawSphere(gl);
	drawPointer(gl);
	//drawLabels(gl);
}

// == Auxiliary Functions ==

function drawSphere(gl) {
	drawCircle(gl);
	drawMarks(gl);
}

function drawCircle(gl) {
	// Set program
	gl.useProgram(circleProgram);
	
	// Set attributes
	gl.enableVertexAttribArray(circleProgram.a_position);
	gl.bindBuffer(gl.ARRAY_BUFFER, circlePositionBuffer);
	gl.vertexAttribPointer(circleProgram.a_position, 2, gl.FLOAT, false, 0, 0);
	
	// Execute program
	gl.drawArrays(gl.TRIANGLES, 0, circleVertices.length/2);
}

function drawMarks(gl) {
	// Set program
	gl.useProgram(marksProgram);
	
	// Set uniforms
	let angY = Math.PI/4;
	let angX = -Math.PI/6; 
	let rotationY = [
		Math.cos(angY), 0, Math.sin(angY), 0,
		0, 1, 0, 0,
		-Math.sin(angY), 0, Math.cos(angY), 0,
		0, 0, 0, 1
	];
	let rotationX = [
		1, 0, 0, 0,
		0, Math.cos(angX), -Math.sin(angX), 0,
		0, Math.sin(angX), Math.cos(angX), 0,
		0, 0, 0, 1
	];

	let projection = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, -1, 0,
		0, 0, 0, 1
	];
	
	let translation = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	];
	
	gl.uniformMatrix4fv(marksProgram.u_rotationY, false, rotationY);	
	gl.uniformMatrix4fv(marksProgram.u_rotationX, false, rotationX);	
	gl.uniformMatrix4fv(marksProgram.u_projection, false, projection);	
	gl.uniformMatrix4fv(marksProgram.u_translation, false, translation);	
	gl.uniform1f(marksProgram.u_back, 0.0);	

	// Set attributes
	gl.enableVertexAttribArray(marksProgram.a_position);
	gl.bindBuffer(gl.ARRAY_BUFFER, marksPositionBuffer);
	gl.vertexAttribPointer(marksProgram.a_position, 3, gl.FLOAT, false, 0, 0);

	// Execute program
	gl.drawArrays(gl.LINES, 0, marksVertices.length/3);

	// Backmarkings
	translation = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 1, 1
	];
	gl.uniformMatrix4fv(marksProgram.u_translation, false, translation);	
	gl.uniform1f(marksProgram.u_back, 1.0);	
	
	gl.drawArrays(gl.LINES, 0, marksVertices.length/3);
}

function drawPointer(gl) {	
	// Set program
	gl.useProgram(pointerProgram);

	gl.clear(gl.DEPTH_BUFFER_BIT);

	// Set uniforms
	let angY = Math.PI/4;
	let angX = -Math.PI/6; 
	let rotationY = [
		Math.cos(angY), 0, Math.sin(angY), 0,
		0, 1, 0, 0,
		-Math.sin(angY), 0, Math.cos(angY), 0,
		0, 0, 0, 1
	];
	let rotationX = [
		1, 0, 0, 0,
		0, Math.cos(angX), -Math.sin(angX), 0,
		0, Math.sin(angX), Math.cos(angX), 0,
		0, 0, 0, 1
	];

	let projection = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, -1, 0,
		0, 0, 0, 1
	];
	
	let translation = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	];
	
	gl.uniformMatrix4fv(pointerProgram.u_rotationY, false, rotationY);	
	gl.uniformMatrix4fv(pointerProgram.u_rotationX, false, rotationX);	
	gl.uniformMatrix4fv(pointerProgram.u_projection, false, projection);	
	gl.uniformMatrix4fv(pointerProgram.u_translation, false, translation);	

	// Set attributes
	gl.enableVertexAttribArray(pointerProgram.a_position);
	gl.bindBuffer(gl.ARRAY_BUFFER, pointerPositionBuffer);
	gl.vertexAttribPointer(pointerProgram.a_position, 3, gl.FLOAT, false, 0, 0);
	
	console.log(pointerVertices);

	// Execute program
	gl.drawArrays(gl.LINES, 0, pointerVertices.length/3);
}

function calculateCircleVertices() {
	let r = 1.0;
	let res = 40;
	let vertices = [];
	for (let i = 0; i < res; i++) {
		vertices.push(r*Math.cos(2*Math.PI*i/res));
		vertices.push(r*Math.sin(2*Math.PI*i/res));
		
		vertices.push(r*Math.cos(2*Math.PI*(i+1)/res));
		vertices.push(r*Math.sin(2*Math.PI*(i+1)/res));
		
		vertices.push(0);
		vertices.push(0);
	}
	circleVertices = vertices;
}

function calculateMarksVertices() {
	let marksLines = [];
	// Axes
	marksLines.push([[0, 0, 0], [1, 0, 0]]);
	marksLines.push([[0, 0, 0], [0, 1, 0]]);
	marksLines.push([[0, 0, 0], [0, 0, 1]]);
	
	// Great Circles
	let res = 40;
	
	// xy
	for (let i = 0; i < res; i++) {
		marksLines.push([
			[Math.cos(2*Math.PI*i/res), Math.sin(2*Math.PI*i/res), 0],
			[Math.cos(2*Math.PI*(i+1)/res), Math.sin(2*Math.PI*(i+1)/res), 0]
		]);
	}

	// yz
	for (let i = 0; i < res; i++) {
		marksLines.push([
			[0, Math.cos(2*Math.PI*i/res), Math.sin(2*Math.PI*i/res)],
			[0, Math.cos(2*Math.PI*(i+1)/res), Math.sin(2*Math.PI*(i+1)/res)]
		]);
	}

	// zx
	for (let i = 0; i < res; i++) {
		marksLines.push([
			[Math.cos(2*Math.PI*i/res), 0, Math.sin(2*Math.PI*i/res)],
			[Math.cos(2*Math.PI*(i+1)/res), 0, Math.sin(2*Math.PI*(i+1)/res)]
		]);
	}

	// Flatten
	let vertices = []
	for (let i = 0; i < marksLines.length; i++) {
		for (let j = 0; j < marksLines[i].length; j++) {
			for (let k = 0; k < marksLines[i][j].length; k++) {
				vertices.push(marksLines[i][j][k]);
			}
		}
	}

	marksVertices = vertices;
}

function calculatePointerRotations(blochCoords) {
	let vertices = [0, 0, 0];

	vertices.push(Math.sin(blochCoords[1])*Math.sin(blochCoords[0]));
	vertices.push(Math.cos(blochCoords[0]));
	vertices.push(Math.cos(blochCoords[1])*Math.sin(blochCoords[0]));

	console.log(vertices);

	pointerVertices = vertices;
	
}
