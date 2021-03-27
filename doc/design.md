# some rules
- orwellian principles (if you can leave it out, leave it out)
- when converting, eq. 'Circle to Mesh', use the 'fromCircle()' in mesh. If you want a 'toMesh()', cross-refer to fromCircle in mesh. 
- create a 'static new()' method to replace constructor, a la rust. this way, constructor overloading (in mesh, matrix) is clear, and 'new' does not have to be used