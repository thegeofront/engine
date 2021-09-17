import { GeonImage, Vector3, ShaderMesh, Plane, Domain2, Rectangle3, Mesh } from "../lib";

/**
 * This describes an image in 3D space.
 * Can be regarded as a 3D sprite, build would be very inefficient to be used like that 
 * Mostly used for debugging textures
 */
export class ImageMesh {
	constructor(
		public image: GeonImage, 
		public pos: Vector3,
		public normal: Vector3,
        public scale: number,
        public centered: boolean,
        public doubleSided: boolean) {}

	static new(image: GeonImage, pos=Vector3.new(0,0,0), normal=Vector3.unitZ(), scale=1, centered=true, doubleSided=true) {
		return new ImageMesh(image, pos, normal, scale, centered, doubleSided);
	}

	buffer() : ShaderMesh {
        if (this.doubleSided) {
            return ShaderMesh.fromImage(this.image, this.pos, this.normal, this.centered, this.scale, this.doubleSided);
        } else {
            return ShaderMesh.fromImage(this.image, this.pos, this.normal, this.centered, this.scale, this.doubleSided);
        }
	}
}
