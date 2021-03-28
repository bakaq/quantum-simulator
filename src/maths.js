"use strict";

// Complex numbers
export class Complex {
  constructor(real, imag) {
    this.real = real;
    this.imag = imag;
  }

  show() {
    const sign = this.imag >= 0 ? "+" : "-";
    return `${this.real.toFixed(3)}${sign}${Math.abs(this.imag).toFixed(3)}i`;
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

  arg() {
    return Math.atan2(this.imag, this.real);
  }
}

export function cAdd(c1, c2) {
  return new Complex(
    c1.real + c2.real,
    c1.imag + c2.imag
  );
}

export function cSub(c1, c2) {
  return new Complex(
    c1.real - c2.real,
    c1.imag - c2.imag
  );
}

export function cMult(c1, c2) {
  return new Complex(
    c1.real*c2.real - c1.imag*c2.imag,
    c1.real*c2.imag + c1.imag*c2.real
  );
}

export function cDiv(c1, c2) {
  return new Complex(
    (c1.real*c2.real + c1.imag*c2.imag)/(c2.real*c2.real + c2.imag*c2.imag),
    (c1.imag*c2.real - c1.real*c2.imag)/(c2.real*c2.real + c2.imag*c2.imag)
  );
}

// Matrices and vectors
export class cMatrix {
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

export class cVector extends cMatrix {
  constructor(m) {
    super(m, 1);
  }
}

export function mAdd(m1, m2) {
  let m3 = new cMatrix(m1.m, m1.n);
  for (let i = 0; i < m1.m; i++) {
    for (let j = 0; j < m1.n; j++) {
      m3.content[i*m1.n + j] = m1[i*m1.n + j] + m2[i*m1.n + j];
    }
  }
  return m3;
}

export function smMult(s, m) {
  let mr = new cMatrix(m.m, m.n);
  for (let i = 0; i < m.m; i++) {
    for (let j = 0; j < m.n; j++) {
      mr.content[i*m.n + j] = cMult(s, m.content[i*m.n + j])
    }
  }
  return mr;
}

export function mmMult(m1, m2) {
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

export function tensor(m1, m2) {
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
