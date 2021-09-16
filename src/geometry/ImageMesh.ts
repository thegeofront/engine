import { GeonImage, Vector3, ShaderMesh, Plane, Domain2, Rectangle3, Mesh } from "../lib";

export class ImageMesh {
	constructor(
		public image: GeonImage, 
		public pos: Vector3,
		public normal: Vector3,
        public scale: number,
        public centered: boolean) {}

	static new(image: GeonImage, pos=Vector3.new(0,0,0), normal=Vector3.unitZ(), scale=1, centered=true) {
		return new ImageMesh(image, pos, normal, scale, centered);
	}

	buffer() : ShaderMesh {
		return meshFromImage(this.image, this.pos, this.normal, this.centered, this.scale, true);
	}
}

export function meshFromImage(image: GeonImage, pos: Vector3, normal: Vector3, centered: boolean, scale: number, fixWebglLimitation: boolean) : ShaderMesh {

    let plane = Plane.fromPN(pos, normal);
    let domain;
    if (centered) {
        domain = Domain2.fromWH(-image.width/2*scale, -image.height/2*scale, image.width*scale, image.height*scale);
    } else {
        domain = Domain2.fromWH(0, 0, image.width*scale, image.height*scale);
    }
    
    let rectangle = new Rectangle3(plane, domain);
    let mesh = Mesh.fromRect(rectangle);

    // note: webgl can only work with 2^x images
    if (fixWebglLimitation) {
        let goodWidth = fixSizeForWebGl(image.width);
        let goodHeight = fixSizeForWebGl(image.height);
        if (goodWidth !== image.width || goodHeight !== image.height) {
            // we need to perform resizing!
            console.log("resizing to ", goodWidth, goodHeight);
            let u = image.width / goodWidth;
            let v = image.height / goodHeight;
            
            image = image.buffer(goodWidth, goodHeight);
            mesh.setUvs(new Float32Array([
                0.0, 0.0, 
                0.0, v, 
                u, 0.0, 
                u, v
            ]));
        }
    }

    mesh.setTexture(image.toImageData()); 
    console.log(mesh);
    return mesh;
}

export function fixSizeForWebGl(size: number) {
    let base = Math.log2(size);
    return Math.pow(2, Math.ceil(base));
}