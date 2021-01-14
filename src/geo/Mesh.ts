
// Mesh.Ts
// Purpose: obj class for dealing with that specific filetype, and meshes in general
// Author: Jos Feenstra

import { browserLocalStorage } from "@tensorflow/tfjs-core/dist/io/local_storage";

export class Mesh {

    verts: number[][] = []; // 3 long float
    norms: number[][] = []; // 3 long float
    uvs:   number[][] = []; // 2 long float 
    faces: number[][] = []; // 3 long int

    lastTouched: number = 0; // int , needed for triangle walk
    texture?: ImageData;

    constructor() {}

    static async loadFromObj(text: string) : Promise<Mesh> {
    
        let mesh = new Mesh();
    
        // note : this is very inefficient, but it'll have to do for now...
        const keywordRE = /(\w*)(?: )*(.*)/;
        const lines = text.split('\n');
    
        for (let i = 0; i < lines.length; ++i) {
            const line = lines[i].trim();

            // filter out comments
            if (line === '' || line.startsWith('#')) {
                continue;
            }
            const m = keywordRE.exec(line);
            if (!m) {
                continue;
            }
            const [, keyword, unparsedArgs] = m;
            const parts = line.split(/\s+/).slice(1);
            
            switch(keyword) {
                case 'v':
                    
                    break;
                case 'vn':
                    
                    break;
                case 'vt':
                    
                    break;
                case 'f':
                    
                    break;
                default:
                    console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
                    continue;
            }
        }

        return mesh;
    }


    export_to_file(path: string) {
        
    }

    set_all_neighbours() {

    }
};

// simple wrapper
class Face {

    a: number;
    b: number;
    c: number;

    constructor(a: number, b: number, c: number)
    {
        this.a = a;
        this.b = b;
        this.c = c;
    }
};


