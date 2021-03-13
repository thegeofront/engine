// BellusData.ts 
// 
// author: Jos Feenstra
// purpose : 
// - wrapper around all data gathered from Bellus3D.
// - do all file -> object convertions here.         

import { RenderMesh, meshFromObj } from "../mesh/render-mesh";
import { Vector2Array, Vector3Array } from "../data/vector-array";
import { Domain, Domain2 } from "../math/domain";
import { Matrix4 } from "../math/matrix";
import { Vector2 } from "../math/vector";
import { loadImageFromFile, loadJSONFromFile, loadTextFromFile } from "../system/domwrappers";
import { GeonImage } from "../img/Image";

export class BellusScanData {

    landmarkData: any; // json
    texture: ImageData; 
    mesh: RenderMesh;
    front: ImageData; 
    settings: any; // local settings file. We want this to extract the right regions.

    landmarks: Vector3Array;


    constructor(landmarkData: any, texture: ImageData, mesh: RenderMesh, front: ImageData, settings: any) {

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

                // flip texture horizontally
                let gi = GeonImage.fromImageData(texture);
                gi = gi.flipVer();
                mesh.setTexture(gi.toImageData());

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
        let tf = tf1.multiply(tf2);
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

export class NextcloudScanData {

    landmarkData: any; // json
    texture: ImageData; 
    mesh: RenderMesh;
    settings: any; // local settings file. We want this to extract the right regions.
    json: any;
    eyePointsEdited!: Vector3Array;
    eyePoints!: Vector3Array;

    // data to be found in the json


    constructor(landmarkData: any, texture: ImageData, mesh: RenderMesh, settings: any, json: any) {

        this.landmarkData = landmarkData;
        this.texture = texture;
        this.mesh = mesh;
        this.settings = settings;
        this.json = json;

        this.readJson(json);
    }

    private readJson(json: any) {
        this.eyePoints = Vector3Array.fromNative(json.pupil_pts);
        this.eyePointsEdited = Vector3Array.fromNative(json.pupil_pts_edited);
    }


    static async fromFileList(files: FileList, settings: any) : Promise<NextcloudScanData> {
        1
        // assign the correct files.
        let textFile: File | undefined;
        let textureFile: File | undefined;
        let objFile: File | undefined;
        let materialFile: File | undefined;
      
        for(let i = 0 ; i < files.length; i++) {
            let file: File = files.item(i)!;
            let name = file.name;
            console.log(`processing ${name}...`);
            switch(name)
            {
                case 'scaninfo.txt': 
                    textFile = file;
                    break;
                case 'head3d.jpg': 
                    textureFile = file;
                    break;
                case 'head3d.obj': 
                    objFile = file;
                    break; 
                case 'head3d.obj.mtl': 
                    materialFile = file;
                    break; 
            } 
        }
    
        return await new Promise(async function(resolve, reject) {

            if (textFile == undefined    || 
                textureFile == undefined || 
                objFile == undefined || 
                materialFile == undefined) {
                alert("give me at least one .txt, one .obj, one .mtl and one .jpg file please!");
                reject();
            } else {
                console.log("converting files to usable objects...");
                
                // read json bit
                let jsonbit = "";
                let text = await loadTextFromFile(textFile); 
                let lines = text.split('\n');
                for(let i = 0 ; i < lines.length; i++) {
                    let parts = lines[i].split(';');
                    if (parts.length != 2) continue;
                    if (parts[0] == 'FACEPOINTJSON') {
                        jsonbit = parts[1];
                    }
                }
                if (jsonbit == "") {
                    alert("I found a text file, but it does not contain FACEPOINTJSON key, or a valid embedded json");
                    reject(); 
                } 
                let json: JSON = JSON.parse(jsonbit);

                console.log("found the following json:");
                console.log(json);

                // read the rest
                let texture = await loadImageFromFile(textureFile);
                let objtext = await loadTextFromFile(objFile);
                let mesh = meshFromObj(objtext);

                // flip texture horizontally -> this is needed for some inexplicable reason
                // and put the flipped version in the mesh
                let gi = GeonImage.fromImageData(texture);
                gi = gi.flipVer();
                mesh.setTexture(gi.toImageData());

                // feedback
                console.log("done! bellus scan loaded.");

                // return
                resolve(new NextcloudScanData(json, texture, mesh, settings, json));
            }
        });
    }

    getTextureToUVMatrix() : Matrix4 {
        let [scaleY, scaleX] = [this.texture.height, this.texture.width];
        let tf1 = Matrix4.newScaler(1/scaleX, -1/scaleY, 1)
        let tf2 = Matrix4.newTranslation(0,1,0)
        return  tf1.multiply(tf2);
    }


    fromTextureToUVSpace(vectors: Vector3Array) : Vector3Array {

        let [scaleY, scaleX] = this.getLandmarksImageSize();
        console.log("scaling landmarks down by " + scaleX + ", " + scaleY);

        let tf1 = Matrix4.newScaler(1/scaleX, -1/scaleY, 1)
        let tf2 = Matrix4.newTranslation(0,1,0)
        let tf = tf1.multiply(tf2);
        return vectors.clone().transform(tf);
    }


    private getLandmarksImageSize() : [number, number] {

        // image sizes as registered in the 'facelandmarks' json.
        let data = this.landmarkData.ImageSize;
        return [data[0], data[1]];
    }
}