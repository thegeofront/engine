# geon-engine
A no-dependency 3D engine for delivering interactive 3d experiences on the web. 
Think barebones three.js, but with a focus on parametric design / procedural generation.


## Demo
[repo](https://github.com/josfeenstra/geon-demo/)

[online](http://josfeenstra.nl/project/geon/)


## Install 
```
git clone https://github.com/josfeenstra/geon-engine
cd geon-engine 
npm install 
npm run build
```
This will produce ```index.js``` within the build folder. To use it, run a local web server like [live server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) or [web server for chrome](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb).

## TODO

- [✔️] Refactor entire codebase to make it look more like `three.js`
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
- TODO: create an InstanceRenderer(), which accepts 1 model and a whole bunch of position matrices.
  - Try to render a whole forest with them
_____________________________________________________________
⚙️ = Busy | ✔️= DONE 

