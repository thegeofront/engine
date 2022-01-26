// author: Jos Feenstra
// purpose: Quaternion to be used for rotation
// https://api.flutter.dev/flutter/vector_math/Quaternion-class.html

export class Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;

    constructor(x: number, y: number, z: number, w: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    static new() {
        return new Quaternion(0, 0, 0, 1);
    }

    setWithIndex(i: number, value: number) {
        switch(i) {
            case 0:
                this.x = value;
                return;
            case 1:
                this.y = value;
                return;
            case 2:
                this.z = value;
                return;
            case 3:
                this.w = value;
                return;
            default: 
                return;
        } 
    }

    /**
     * Set from rotation matrix
     * PS: I'm trying to do this without constructing a M3 for efficiencies sake
     */
    setFromMatrix(
        r0=1, r1=0, r2=0, 
        r3=0, r4=1, r5=0, 
        r6=0, r7=0, r8=1) {
        
        // NOTE: this is unavoidable... unless we rewrite a whole bunch
        let r = [r0,r1,r2,r3,r4,r5,r6,r7,r8];
        let index = (row=0, col=0) => (col * 3) + row;

        // the trace of a matrix is the sum of diagonal entries 
        let trace = r0 + r4 + r8;

        if (trace > 0.0) {
            let s = Math.sqrt(trace + 1.0);
            this.w = s * 0.5;
            s = 0.5 / s;
            this.x = (r5 - r7) * s;
            this.y = (r6 - r2) * s;
            this.z = (r1 - r3) * s;
        } else {
            // i is largest out of r0, r4, r8
            const i = r0 < r4 ? (r4 < r8 ? 2 : 1) : (r0 < r8 ? 2 : 0);

            // TODO rewrite it verbose-style, it will be quicker, a la:
            // if (i == 0) {
            //     const j = 1;
            //     const k = 2;

            // } else if (i == 1) {
            //     const j = 2;
            //     const k = 0;

            // } else /* (i == 2) */ {
            //     const j = 0;
            //     const k = 1;
            // }

            const j = (i + 1) % 3;
            const k = (i + 2) % 3;
            
            let s = Math.sqrt(r[index(i, i)] - r[index(j, j)] - r[index(k, k)] + 1.0);
            this.setWithIndex(i, s * 0.5);
            s = 0.5 / s;
            this.setWithIndex(j, (r[index(j, i)] + r[index(i, j)]) * s);
            this.setWithIndex(k, (r[index(k, i)] + r[index(i, k)]) * s);
            this.w = (r[index(k, j)] - r[index(j, k)]) * s;
        }
    }
}
