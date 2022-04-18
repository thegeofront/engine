// purpose: make sure the entire library is callable from one point.

// I dont know why, but I had to move these up, otherwise some weird dependency interlinking bug creeps up in the ts compiler
export * from "./math/Const";
export * from "./math/Util";
export * from "./image/Kernels";
export * from "./render/OldMultiShader";

export * from "./algorithms/Delaunay";
export * from "./algorithms/MarchingCubes";
export * from "./algorithms/Perlin";
export * from "./algorithms/Triangulator";

export * from "./app/App";
export * from "./app/Core";
export * from "./app/SwapApp";

export * from "./data/FloatMatrix";
export * from "./data/HashTable";
export * from "./data/IntCube";
export * from "./data/IntMatrix";
export * from "./data/LinkedList";
export * from "./data/MultiVector";
export * from "./data/MultiVector3";
export * from "./data/MultiVector2";
export * from "./data/Pool";

export * from "./dom/IO";
export * from "./dom/UI";
export * from "./dom/WebIO";

export * from "./geometry/Geometry";
export * from "./geometry/Intersect";

export * from "./geometry/primitives/Circle2";
export * from "./geometry/primitives/Circle3";
export * from "./geometry/primitives/Cube";
export * from "./geometry/primitives/Line2";
export * from "./geometry/primitives/Plane";
export * from "./geometry/primitives/Rectangle";
export * from "./geometry/primitives/Triangle2";
export * from "./geometry/primitives/Triangle3";
export * from "./geometry/primitives/Polygon2";

export * from "./geometry/curve/Curve";
export * from "./geometry/curve/Bezier";
export * from "./geometry/curve/Polyline";
export * from "./geometry/curve/Spline";

export * from "./geometry/surface/Surface";
export * from "./geometry/surface/BezierSquare";
export * from "./geometry/surface/BezierTriangle";
export * from "./geometry/surface/Loft";

export * from "./geometry/mesh/Graph";
export * from "./geometry/mesh/MultiLine";
export * from "./geometry/mesh/Mesh";
export * from "./geometry/mesh/ShaderMesh";
export * from "./geometry/mesh/TopoMesh";

export * from "./geometry/mesh/ObjProcessing";

// export * from "./geometry/solid";

export * from "./image/Color";
export * from "./image/Colors";
export * from "./image/Bitmap";
export * from "./image/Kernels";
export * from "./image/ImageProcessing";

export * from "./inputOld/InputState";

export * from "./input/InputHandler";
export * from "./input/KeyboardHandler";
export * from "./input/Keys";
export * from "./input/MouseHandler";
export * from "./input/TouchHandler";
export * from "./input/TimeHandler";
export * from "./input/TouchHandler";
export * from "./input/TouchFinger";

export * from "./math/Domain";
export * from "./math/Math";
export * from "./math/Matrix3";
export * from "./math/Matrix4";
export * from "./math/Polynomial";
export * from "./math/Quaternion";
export * from "./math/Random";
export * from "./math/Ray";
export * from "./math/Statistics";

export * from "./math/Vector2";
export * from "./math/Vector3";

export * from "./parametric/EnumParameter";
export * from "./parametric/Parameter";
export * from "./parametric/ParametricModel";

export * from "./render/bufferables/ImageMesh";
export * from "./render/bufferers/MeshBufferer";

export * from "./render/renderers/DebugRenderer";
export * from "./render/renderers/ImageRenderer";
export * from "./render/renderers/TextRenderer";

export * from "./render/shaders/AmbientMeshShader";
export * from "./render/shaders/TexturedMeshShader";
export * from "./render/shaders/BillboardShader";
export * from "./render/shaders/DepthMeshShader";
export * from "./render/shaders/DotShaderWithHeight";
export * from "./render/shaders/PhongShader";
export * from "./render/shaders/TemplateShader";
export * from "./render/shaders/ZebraShader";
export * from "./render/shaders/SkyBoxShader";

export * from "./render/webgl/DrawTarget";
export * from "./render/webgl/Attribute";
export * from "./render/webgl/Attributes";
export * from "./render/webgl/Constants";
export * from "./render/webgl/HelpGl";
export * from "./render/webgl/IndexAttribute";
export * from "./render/webgl/Uniform";
export * from "./render/webgl/Uniforms";

export * from "./render/shaders-old/_lib";

export * from "./render/OldShader";

export * from "./render/basics/Camera";
export * from "./render/basics/Entity";
export * from "./render/basics/Light";
export * from "./render/basics/Material";
export * from "./render/basics/Model";
export * from "./render/basics/Shadable";
export * from "./render/basics/Scene";

export * from "./render/renderers/DebugRenderer";
export * from "./render/renderers/ImageRenderer";

export * from "./util/FpsCounter";
export * from "./util/Microphone";
export * from "./util/Debug";
export * from "./util/Time";
