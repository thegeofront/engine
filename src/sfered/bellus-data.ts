// BellusData.ts 
// 
// author: Jos Feenstra
// purpose : 
// - wrapper around all data gathered from Bellus3D.
// - do all file -> object convertions here.         

import { RectangleApp } from "../app-demos/rectangle-app";
import { Mesh, meshFromObj } from "../geo/mesh";
import { Vector2Array, Vector3Array } from "../math/array";
import { Domain, Domain2 } from "../math/domain";
import { Matrix4 } from "../math/matrix";
import { Vector2 } from "../math/vector";
import { loadImageFromFile, loadJSONFromFile, loadTextFromFile } from "../system/domwrappers";

export class BellusScanData {

    landmarkData: any; // json
    texture: ImageData; 
    mesh: Mesh;
    front: ImageData; 
    settings: any; // local settings file. We want this to extract the right regions.

    landmarks: Vector3Array;

    constructor(landmarkData: any, texture: ImageData, mesh: Mesh, front: ImageData, settings: any) {

        this.landmarkData = landmarkData;
        this.texture = texture;
        this.mesh = mesh;
        this.front = front;
        this.settings = settings;

        this.landmarks = this.getLandmarks2f();
        // this.landmarks3 = this.getLandmarks3f(); // NOTE - we will not use the bellus 3d landmarks. 
        // they are located within a uncypherable space
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
                let mesh = meshFromObj(objtext);
                let front = await loadImageFromFile(frontFile);

                console.log("done! bellus scan loaded.");

                resolve(new BellusScanData(json, texture, mesh, front, settings));
            }
        });
    }

    fromTextureToUVSpace(vectors: Vector3Array) : Vector3Array {

        let [scaleY, scaleX] = this.getLandmarksImageSize();
        console.log("scaling landmarks down by " + scaleX + ", " + scaleY);
        
        let tf1 = Matrix4.newScaler(1/scaleX, -1/scaleY, 0)
        let tf2 = Matrix4.newTranslation(0,1,0)
        let tf = tf2.multiply(tf1);
        return vectors.clone().transform(tf);
    }

    private getLandmarksImageSize() : [number, number] {

        // image sizes as registered in the 'facelandmarks' json.
        let data = this.landmarkData.ImageSize;
        return [data[0], data[1]];
    }

    private getLandmarks2f() : Vector3Array {

        // 2d landmarks as registered in the 'facelandmarks' json
        let data = this.landmarkData.Point2f;
        let size = data.cols;
        let landmarks = new Vector3Array(data.data.length / 2);
        landmarks.fillWith(data.data, 2);
        return landmarks;
    }

    // private getLandmarks3f() : Vector3Array {

    //     // 2d landmarks as registered in the 'facelandmarks' json
    //     let data = this.landmarkData.Point3f;
    //     let size = data.cols;
    //     let arr = new Vector3Array(size);
    //     arr.fillWith(data.data);

    //     return arr;
    // }  
}