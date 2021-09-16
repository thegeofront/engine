import { Context, Domain2, DrawSpeed, GeonImage, Mesh, Plane, Rectangle3, ShaderMesh, TextureMeshShader, Vector3, WebGl } from "../lib";

export class ImageRenderer {

	private constructor(
		public gl: WebGl,
		public stdSize?: Vector3,
		public gap = 10,
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
		let accumulatedHeight = 0;
		this.images.forEach((image, i) => {

			let height = image.height;
			let width = image.width;

			let rectangle = new Rectangle3(
				Plane.WorldXY(),
				Domain2.fromBounds(this.gap, this.gap + width, accumulatedHeight, accumulatedHeight + height),
			);

			let mesh = Mesh.fromRect(rectangle);

			if (this.stdSize) {
				image = image.resize(this.stdSize.x, this.stdSize.y);
			}
			mesh.setTexture(image.toImageData()); // note: webgl can only work with 2^x * 512 images
			this.shaders[i].set(mesh, DrawSpeed.StaticDraw);

			accumulatedHeight += height + this.gap;
		});
	}

	draw(c: Context) {
		this.shaders.forEach((shader) => {
			shader.render(c);
		});
	}
}
