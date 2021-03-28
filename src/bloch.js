"use strict";

import * as webgl from "./webgl.js";

export {setup, render};

// "Global" variables

let vertexShader = `
attribute vec4 a_position;
attribute vec3 a_normal;

uniform mat4 u_translation;
uniform mat4 u_projection;

varying float v_intensity;

void main() {
	gl_Position = u_projection * u_translation * a_position;
	v_intensity = -dot(normalize(vec3(1,-1,-1)), a_normal);
}
`;
let fragmentShader = `
precision mediump float;

varying float v_intensity;

void main() {
	gl_FragColor = vec4(v_intensity*vec3(1, 1, 1), 1);
}
`;

let program;

let positionBuffer;
let normalBuffer;

let sphereVertices;

function setup(gl) {
	calculateSphereVertices();

	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);

	// Create program
	program = webgl.createProgram(gl, vertexShader, fragmentShader);
	
	// Attributes and uniforms
	program.a_position = gl.getAttribLocation(program, "a_position");
	program.a_normal = gl.getAttribLocation(program, "a_normal");
	program.u_translation = gl.getUniformLocation(program, "u_translation")
	program.u_projection = gl.getUniformLocation(program, "u_projection")
	
	// Buffer
	positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereVertices), gl.STATIC_DRAW);
	

	function cross(a, b) {
		let c = [0, 0, 0];
		c[0] = a[1]*b[2] - a[2]*b[1];
		c[1] = a[2]*b[0] - a[0]*b[2];
		c[2] = a[0]*b[1] - a[1]*b[0];
		return c;
	}

	function normal(trig) {
		let a = [];
		for (let i = 0; i < trig[0].length; i++) {
			a.push(trig[1][i] - trig[0][i]);
		}
		let b = [];
		for (let i = 0; i < trig.length; i++) {
			b.push(trig[2][i] - trig[0][i]);
		}
		let c = cross(a, b);
		let norm = 0;
		for (let i = 0; i < c.length; i++) {
			norm += c[i]*c[i];
		}
		norm = Math.sqrt(norm);
		for (let i = 0; i < c.length; i++) {
			c[i] = c[i]/norm;
		}
		return c;
	}
	
	let normals = []
	for (let i = 0; i < sphereVertices.length/9; i++) {
		let trig = [];
		for (let j = 0; j < 3; j++) {
			let vert = [];
			for (let k = 0; k < 3; k++) {
				vert.push(sphereVertices[9*i +3*j + k]);
			}
			trig.push(vert);
		}

		let n = normal(trig);
		normals.push(n[0]);
		normals.push(n[1]);
		normals.push(n[2]);
		normals.push(n[0]);
		normals.push(n[1]);
		normals.push(n[2]);
		normals.push(n[0]);
		normals.push(n[1]);
		normals.push(n[2]);
	}
	console.log(normals);

	normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

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

function drawSphere(gl) {
	// Set program
	gl.useProgram(program);

	// Set uniforms
	let translation = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	];
	gl.uniformMatrix4fv(program.u_translation, false, translation);	
	let projection = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1/5, 0,
		0, 0, 0, 1
	];
	gl.uniformMatrix4fv(program.u_projection, false, projection);	

	// Set attributes
	gl.enableVertexAttribArray(program.a_position);

	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	gl.vertexAttribPointer(program.a_position, 3, gl.FLOAT, false, 0, 0);

	gl.enableVertexAttribArray(program.a_normal);

	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

	gl.vertexAttribPointer(program.a_normal, 3, gl.FLOAT, false, 0, 0);

	// Execute program
	gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length/3);
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

	sphereVertices = vertices;
}
