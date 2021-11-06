// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants
// I will add everything eventually

export enum CubeMapTarget {
    PosX = 0x8515,
    NegX = 0x8516,
    PosY = 0x8517,
    NegY = 0x8518,
    PosZ = 0x8519,
    NegZ = 0x851A
}

export const CubeMapTargets = [
    CubeMapTarget.PosX, 
    CubeMapTarget.NegX, 
    CubeMapTarget.PosY, 
    CubeMapTarget.NegY, 
    CubeMapTarget.PosZ, 
    CubeMapTarget.NegZ
];

export enum ClearBufferBit {
    Depth = 0x00000100,
    Stencil = 0x00000400,
    Color = 0x00004000,
}

export enum DrawMode {
    Points = 0x0000,
    Lines = 0x0001,
    LineLoop = 0x0002,
    LineStrip = 0x0003,
    Triangles = 0x0004,
    TriangleStrip = 0x0005,
    TriangleFan = 0x0006,
}

export enum PixelFormat {
    DepthComponent = 0x1902,
    Alpha = 0x1906,
    RGB = 0x1907,
    RGBA = 0x1908,
    Luminance = 0x1909,
    LuminanceAlpha = 0x190A
}

export enum DrawMethod {
    Arrays,
    Elements,
}

export enum DrawElementsType {
    UnsignedByte = 0x1401,
    UnsignedShort = 0x1403,
    UnsignedInt = 0x1405,
}

export enum DataType {
    Byte = 0x1400,
    UnsignedByte = 0x1401,
    Short = 0x1402,
    UnsignedShort = 0x1403,
    Int = 0x1404,
    UnsignedInt = 0x1405,
    Float = 0x1406,
}

export const TEXTURE_2D = 0x0DE1;

export const INDEX_BUFFER_NAME = "__index__";
