import { Context, Domain2, DrawSpeed, GeonImage, Mesh, Plane, Rectangle3, ShaderMesh, TextureMeshShader, Vector3, WebGl } from "../lib";

export class ImageRenderer {

	private constructor(
		public gl: WebGl,
		public stdSize?: Vector3,
		public gap = 10,
		public scale = 2,
		public images: GeonImage[] = [],
		public shaders: TextureMeshShader[] = [],
	) {}

	static new(gl: WebGl, stdSize?: Vector3): ImageRenderer {
		return new ImageRenderer(gl, stdSize);
	}

	add(image: GeonImage) {
		this.images.push(image);
		this.shaders.push(new TextureMeshShader(this.gl));
	}

	buffer() {
		// i was having trouble rendering images... this is a workaround:
		// convert the this.images[] list into the this.imageMeshes[] list
		let accumulatedWidth = 0;
		this.images.forEach((image, i) => {

			let mesh = ShaderMesh.fromImage(image, Vector3.new(accumulatedWidth, 0, 0), Vector3.unitZ(), false, 100)
			this.shaders[i].set(mesh, DrawSpeed.StaticDraw);

			accumulatedWidth += image.width + this.gap;
		});
	}

	render(c: Context) {
		this.shaders.forEach((shader) => {
			shader.render(c);
		});
	}
}
