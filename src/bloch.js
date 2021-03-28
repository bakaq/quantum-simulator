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

	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);

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
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	drawSphere(gl);
	//drawPointer(gl);
	//drawLabels(gl);
}

function calculateSphereVertices() {
	// Circle
	let r = 0.7;
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
	sphereVertices = vertices;
	
	// Icosphere
	const t = (1 + Math.sqrt(5))/2;
	let icoVerts = [];
	
	icoVerts.push([-1, t, 0]);
	icoVerts.push([1, t, 0]);
	icoVerts.push([-1, -t, 0]);
	icoVerts.push([1, -t, 0]);
	
	icoVerts.push([0, -1, t]);
	icoVerts.push([0, 1, t]);
	icoVerts.push([0, -1, -t]);
	icoVerts.push([0, 1, -t]);
	
	icoVerts.push([t, 0, -1]);
	icoVerts.push([t, 0, 1]);
	icoVerts.push([-t, 0, -1]);
	icoVerts.push([-t, 0, 1])

	let icoTrigs = [];

	function trig(a, b, c) {
		return [icoVerts[a], icoVerts[b], icoVerts[c]];
	}

	icoTrigs.push(trig(0, 11, 5));
	icoTrigs.push(trig(0, 5, 1));
	icoTrigs.push(trig(0, 1, 7));
	icoTrigs.push(trig(0, 7, 10));
	icoTrigs.push(trig(0, 10, 11));
	
	icoTrigs.push(trig(1, 5, 9));
	icoTrigs.push(trig(5, 11, 4));
	icoTrigs.push(trig(11, 10, 2));
	icoTrigs.push(trig(10, 7, 6));
	icoTrigs.push(trig(7, 1, 8));
	
	icoTrigs.push(trig(3, 9, 4));
	icoTrigs.push(trig(3, 4, 2));
	icoTrigs.push(trig(3, 2, 6));
	icoTrigs.push(trig(3, 6, 8));
	icoTrigs.push(trig(3, 8, 9));
	
	icoTrigs.push(trig(4, 9, 5));
	icoTrigs.push(trig(2, 4, 11));
	icoTrigs.push(trig(6, 2, 10));
	icoTrigs.push(trig(8, 6, 7));
	icoTrigs.push(trig(9, 8, 1));
	

	// Iterations
	function normVert(vert) {
		let norm = 0;
		for (let i = 0; i < vert.length; i++) {
			norm += vert[i]*vert[i];
		}
		norm = Math.sqrt(norm);

		let newVert = [];
		for (let i = 0; i < vert.length; i++) {
			newVert.push(vert[i]/norm);
		}
		return newVert;
	}
	
	function normAllVerts(trigList) {
		let newTrigList = [];
		for (let i = 0; i < trigList.length; i++) {
			let newVertList = [];
			for (let j = 0; j < trigList[i].length; j++) {
				newVertList.push(normVert(trigList[i][j]));
			}
			newTrigList.push(newVertList);
		}
		return newTrigList;
	}

	icoTrigs = normAllVerts(icoTrigs);

	const depth = 2;
	// TODO: Iteration
	
	// Flatten
	vertices = []
	for (let i = 0; i < icoTrigs.length; i++) {
		for (let j = 0; j < icoTrigs[i].length; j++) {
			for (let k = 0; k < icoTrigs[i][j].length; k++) {
				vertices.push(icoTrigs[i][j][k]);
			}
		}
	}

	//sphereVertices = vertices;
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
}
