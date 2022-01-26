import { Matrix4 } from "./Matrix4";
import { Quaternion } from "./Quaternion";
import { calcLength, Vector3 } from "./Vector3";

// this xform determines an object's position, rotation and scale in the world, or relative to another xform
// can be turned into a Matrix4, and created from a Matrix4
export class Transform {
    
    // lazely cached matrix version of this transform.
    // this prevents us from recreating matrix classes every update
    // _m: Matrix4 = undefined; 

    private constructor(
        public pos: Vector3,
        public rot: Quaternion,
        public scale: Vector3,
        public _m?: Matrix4,        
    ) {

    }

    static new(pos=Vector3.zero(), rot=Quaternion.new(), scale=Vector3.ones(), matrix?: Matrix4) {
        return new Transform(pos, rot, scale, matrix);
    }

    static fromMatrix(mat: Matrix4) : Transform {
        return Transform.fromDecompose(mat);
    }

    /**
     * decompose a Matrix4 into its position, rotation and scale components
     */
    private static fromDecompose(mat: Matrix4) : Transform {
        let tf = Transform.new(undefined, undefined, undefined, mat)
        tf.setWithMatrix(mat);   
        return tf;
    }

    buffer() {
        
    }

    setWithMatrix(mat: Matrix4) {
        this._m = mat;
        
        const m = this._m;
        const md = this._m.data;
        let d = mat.determinant();

        // deal with scale
        this.scale.x = calcLength(md[0], md[1], md[2]);
        this.scale.y = calcLength(md[4], md[5], md[6]);
        this.scale.z = calcLength(md[8], md[9], md[10]);

        if (d < 0) {
            this.scale.x = -this.scale.x;
        }

        // deal with translation
        this.pos.x = md[12];
        this.pos.y = md[13];
        this.pos.z = md[14];
      
        // deal with rotation
 
        // --- get rotation matrix pre-scaling
        const invSX = 1.0 / this.scale.x;
        const invSY = 1.0 / this.scale.y;
        const invSZ = 1.0 / this.scale.z;

        const r0 = md[0] *= invSX;
        const r1 = md[1] *= invSX;
        const r2 = md[2] *= invSX;
        const r3 = md[4] *= invSY;
        const r4 = md[5] *= invSY;
        const r5 = md[6] *= invSY;
        const r6 = md[8] *= invSZ;
        const r7 = md[9] *= invSZ;
        const r8 = md[10] *= invSZ;
      
        this.rot.setFromMatrix(r0,r1,r2,r3,r4,r5,r6,r7,r8);
    }

    toMatrix() : Matrix4 {
        return this.compose();
    }

    private compose() : Matrix4 {        
        return Matrix4.fromPosRotScale(this.pos, this.rot, this.scale, this._m);
    }
}