// BellusData.ts 
// 
// author: Jos Feenstra
// purpose : 
// - wrapper around all data gathered from Bellus3D.
// - do all file -> object convertions here.         

import { Mesh, meshFromObj } from "../geo/mesh";
import { FloatArray, Vector2Array, Vector3Array } from "../math/array";
import { Vector2 } from "../math/vector";
import { loadImageFromFile, loadJSONFromFile, loadTextFromFile } from "./domwrappers";

export class BellusScanData {

    landmarks: any; // json
    texture: ImageData; 
    mesh: Mesh;
    front: ImageData; 
    settings: any; // local settings file. We want this to extract the right regions.

    constructor(landmarks: any, texture: ImageData, mesh: Mesh, front: ImageData, settings: any) {
        this.landmarks = landmarks;
        this.texture = texture;
        this.mesh = mesh;
        this.front = front;
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
                case 'image.jpg': 
                    frontFile = file;
                    break;
            } 
        }
    
        return await new Promise(async function(resolve, reject) {

            if (jsonFile == undefined    || 
                textureFile == undefined || 
                objFile == undefined || 
                frontFile == undefined) {
                alert("give me exactly one .json, one .ojb, and one .jpg file please!");
                reject();
            } else {
                console.log("converting files to usable objects...");
                
                let json = await loadJSONFromFile(jsonFile); 
                let texture = await loadImageFromFile(textureFile);
                let objtext = await loadTextFromFile(objFile);
                // let mesh = new Mesh();
                let mesh = meshFromObj(objtext);
                let front = await loadImageFromFile(frontFile);

                console.log("done! bellus scan loaded.");

                resolve(new BellusScanData(json, texture, mesh, front, settings));
            }
        });
    }

    getLandmarksImageSize() : Vector2 {

        // image sizes as registered in the 'facelandmarks' json.
        let data = this.landmarks.ImageSize;
        return new Vector2(data[0], data[1]);
    }

    getLandmarks2f() : Vector2Array {

        // 2d landmarks as registered in the 'facelandmarks' json
        let data = this.landmarks.Point2f;
        let size = data.cols;
        let dim = 2;

        let arr = new Vector2Array(size);
        arr.setAll(data.data);

        return arr;
    }

    getLandmarks3f() : Vector3Array {

        // 2d landmarks as registered in the 'facelandmarks' json
        let data = this.landmarks.Point3f;
        let size = data.cols;
        let dim = 3;

        let arr = new Vector3Array(size);
        arr.setAll(data.data);

        return arr;
    }  
}