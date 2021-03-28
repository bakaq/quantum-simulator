"use strict";

import * as webgl from "./webgl.js";

export {setup, render};

// "Global" variables

let vertexShader = `
attribute vec2 a_position;

void main() {
	gl_Position = vec4(a_position, 0, 1);
}
`;
let fragmentShader = `
precision mediump float;

void main() {
	gl_FragColor = vec4(0, 0, 0, 1);
}
`;

let program;

let positionBuffer;

let sphereVertices;

function setup(gl) {
	calculateSphereVertices();

	// Create program
	program = webgl.createProgram(gl, vertexShader, fragmentShader);
	
	// Attributes and uniforms
	program.a_position = gl.getAttribLocation(program, "a_position");

	// Buffer
	positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereVertices), gl.STATIC_DRAW);
	
	render(gl);
}

function render(gl) {
	// Set up viewport
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	// Clear canvas
	gl.clearColor(0x55/0xFF, 0xCC/0xFF, 0xEE/0xFF, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	drawSphere(gl);
	//drawPointer(gl);
	//drawLabels(gl);
}

function calculateSphereVertices() {
	// TODO: Icosphere
	let r = 0.7;
	let res = 40;
	let vertices = [];
	for (let i = 0; i < res; i++) {
		vertices.push(r*Math.cos(2*Math.PI*i/res));
		vertices.push(r*Math.sin(2*Math.PI*i/res));
		
		vertices.push(0);
		vertices.push(0);
		
		vertices.push(r*Math.cos(2*Math.PI*(i+1)/res));
		vertices.push(r*Math.sin(2*Math.PI*(i+1)/res));
	}
	sphereVertices = vertices;
	console.log(sphereVertices);
}

function drawSphere(gl) {
	// Set program
	gl.useProgram(program);

	// Set uniforms
	
	// Set attributes
	gl.enableVertexAttribArray(program.a_position);

	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	gl.vertexAttribPointer(program.a_position, 2, gl.FLOAT, false, 0, 0);

	// Execute program
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length/2);

	console.log(gl.isBuffer(positionBuffer));
}
