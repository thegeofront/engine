// BellusData.ts 
// 
// author: Jos Feenstra
// purpose : 
// - wrapper around all data gathered from Bellus3D.
// - do all file -> object convertions here.         

import { Mesh } from "../geo/Mesh";
import { loadImageFromFile, loadJSONFromFile } from "./domwrappers";

export class BellusScanData {

    landmarks: JSON;
    texture: ImageData; 
    mesh: Mesh;
    front: ImageData; 

    constructor(landmarks: JSON, texture: ImageData, mesh: Mesh, front: ImageData) {
        this.landmarks = landmarks;
        this.texture = texture;
        this.mesh = mesh;
        this.front = front;
    }

    static async fromFileList(files: FileList) : Promise<BellusScanData> {
        
        // assign the correct files.
        let jsonFile: File | undefined;
        let textureFile: File | undefined;
        let objFile: File | undefined;
        let frontFile: File | undefined;

        for(let i = 0 ; i < files.length; i++) {
            let file: File = files.item(i)!;
            let name = file.name;
            console.log(`processing ${name}...`);
            switch(name)
            {
                case 'facelandmarks.json': 
                    jsonFile = file;
                    break;
                case 'head3d.jpg': 
                    textureFile = file;
                    break;
                case 'head3d.obj': 
                    objFile = file;
                    break; 
                case 'image.jpg': 
                    frontFile = file;
                    break;
            } 
        }
    
        return new Promise(async function(resolve, reject) {

            if (jsonFile == undefined    || 
                textureFile == undefined || 
                objFile == undefined     || 
                frontFile == undefined) {
                alert("give me exactly one .json, one .ojb, and one .jpg file please!");
                reject();
            }
            else 
            {
                console.log("converting files to usable objects...");
                
                let json = await loadJSONFromFile(jsonFile); 
                let texture = await loadImageFromFile(textureFile);
                let mesh = await Mesh.loadFromObj(objFile);
                let front = await loadImageFromFile(frontFile);

                return new BellusScanData(json, texture, mesh, front);
            }
        });

    }
}