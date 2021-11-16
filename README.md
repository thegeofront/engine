# geon-engine
A no-dependency 3D engine for delivering interactive 3d experiences on the web. 
Think barebones three.js, but with a focus on parametric design / procedural generation.


## Demo
[online](http://josfeenstra.nl/project/geon/)

[repo](https://github.com/josfeenstra/geon-demo/)

## Install 
```
git clone https://github.com/josfeenstra/geon-engine
git clone https://github.com/josfeenstra/geon-demo
cd geon_engine
npm install
cd ..
cd geon-demo
npm install
```
The geon-engine can be compiled to `js` using the regular `tsc --build` command. 
However, this makes it hard to make changes on the fly. This is why this uncommon way of using direct `ts` dependencies is used. This essentially makes the engine a [header-only](https://en.wikipedia.org/wiki/Header-only) library.

--------------------------------------------------------------------

## TODO

- [✔️] Refactor entire codebase to make it look more like `three.js`
- [ ] Image Processing
- [ ] Build a blender-style glossy mesh shader with filleted edges
- [ ] Create a maze using marching cubes
- [ ] 
- [ ]


## Notes

- We need things like a `Entity`, which has a `Model`, which has a `Material` + `Mesh`, which should include all needed info for a `Shader`.
- `Shaders` know what data to feed them. how should the rest of the code know this? 
- Entity needs a Model and Shader. 
- We need a `Shader` interface which enables us to only update that which needs updating.
  - can be done by decoupled loaders, like: `shader.loadCamera` / `shader.loadModel` / `shader.loadMaterial`. 
- TODO: create an `InstanceRenderer()`, which accepts 1 model and a whole bunch of position matrices.
  - Try to render a whole forest with them

_____________________________________________________________
⚙️ = Busy | ✔️= DONE 

