// BellusData.ts 
// 
// author: Jos Feenstra
// purpose : 
// - wrapper around all data gathered from Bellus3D.
// - do all file -> object convertions here.         

import { Mesh } from "../geo/Mesh";
import { loadImageFromFile, loadJSONFromFile, loadTextFromFile } from "./domwrappers";

export class BellusScanData {

    landmarks: any; // json
    texture: ImageData; 
    mesh: Mesh;
    // front: ImageData; 
    settings: any; // local settings file. We want this to extract the right regions.

    constructor(landmarks: any, texture: ImageData, mesh: Mesh, settings: any) {
        this.landmarks = landmarks;
        this.texture = texture;
        this.mesh = mesh;
        // this.front = front;
        this.settings = settings;
    }

    static async fromFileList(files: FileList, settings: any) : Promise<BellusScanData> {
        
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
                // case 'image.jpg': 
                //     frontFile = file;
                //     break;
            } 
        }
    
        return new Promise(async function(resolve, reject) {

            if (jsonFile == undefined    || 
                textureFile == undefined || 
                objFile == undefined) {
                alert("give me exactly one .json, one .ojb, and one .jpg file please!");
                reject();
            }
            else 
            {
                console.log("converting files to usable objects...");
                
                let json = await loadJSONFromFile(jsonFile); 
                let texture = await loadImageFromFile(textureFile);
                let objtext = await loadTextFromFile(objFile);
                let mesh = new Mesh();
                // let mesh = await Mesh.loadFromObj(objtext);
                // let front = await loadImageFromFile(frontFile);

                return new BellusScanData(json, texture, mesh, settings);
            }
        });
    }
}