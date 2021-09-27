# Mentions
I want to thank the following openly available resources: 
- https://webglfundamentals.org/ -> very good explanations on the basics of webgl.
- https://thebookofshaders.com/ -> amazing for learning complex shaders themselves



# NOTE: what? this is possible? 

Now, we need a buffer hold the matrices at will get applied to the attribute. Since a buffer is best updated in one chuck we'll put all of our matrices in the same Float32Array

We'll then make Float32Array views, one for each matrix.
```js

// setup matrices, one per instance
const numInstances = 5;
// make a typed array with one view per matrix
const matrixData = new Float32Array(numInstances * 16);

const matrices = [
    m4.identity(),
    m4.identity(),
    m4.identity(),
    m4.identity(),
    m4.identity(),
];
const matrices = [];
for (let i = 0; i < numInstances; ++i) {
    const byteOffsetToMatrix = i * 16 * 4;
    const numFloatsForView = 16;
    matrices.push(new Float32Array(
        matrixData.buffer,
        byteOffsetToMatrix,
        numFloatsForView));
}
```
This way when we want to reference the data for all the matrices we can use matrixData but when we want any individual matrix we can use matrices[ndx].