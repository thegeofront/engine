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
import { Vector2 } from "../math/vector";
import { loadImageFromFile, loadJSONFromFile, loadTextFromFile } from "../system/domwrappers";

export class BellusScanData {

    landmarkData: any; // json
    texture: ImageData; 
    mesh: Mesh;
    front: ImageData; 
    settings: any; // local settings file. We want this to extract the right regions.

    landmarks2: Vector2Array;
    landmarks3: Vector3Array;

    constructor(landmarkData: any, texture: ImageData, mesh: Mesh, front: ImageData, settings: any) {

        this.landmarkData = landmarkData;
        this.texture = texture;
        this.mesh = mesh;
        this.front = front;
        this.settings = settings;

        this.landmarks2 = this.getLandmarks2f();
        this.landmarks3 = this.getLandmarks3f();
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

    getEyeWindows() : [Domain2, Domain2] {

        // get a window around the left- and right-eye feature points, so they can be extracted
        let pr = this.settings.process.point_ranges;
        let bb_o = this.settings.process.bounding_box_offset;

        console.log(pr);
        console.log(bb_o);

        let rightWindow = new Domain2();
        let leftWindow = new Domain2();

        let eyeLandmarksLeft = this.landmarks2.takeRows(pr.left_eye_set) as Vector2Array;
        let eyeLandmarksRight = this.landmarks2.takeRows(pr.right_eye_set) as Vector2Array;

        return [rightWindow, leftWindow];

        // assign them to variables
        //points_left = np.take(self.points_2d, pr["left_eye_set"], axis=0)
        //points_right = np.take(self.points_2d, pr["right_eye_set"], axis=0)
        //bb_o_left = bb_o["ly"]
        //bb_o_right = bb_o["ry"]
        
        // return for image cutting
        //rectangle_left  = linalg.Rectangle.from_bb_points(points_left, bb_o_left, self.img.shape[0], self.img.shape[1])
        //rectangle_right = linalg.Rectangle.from_bb_points(points_right, bb_o_right, self.img.shape[0], self.img.shape[1])
        //return rectangle_left, rectangle_right
   
    }

    getLandmarksImageSize() : Vector2 {

        // image sizes as registered in the 'facelandmarks' json.
        let data = this.landmarkData.ImageSize;
        return new Vector2(data[0], data[1]);
    }

    private getLandmarks2f() : Vector2Array {

        // 2d landmarks as registered in the 'facelandmarks' json
        let data = this.landmarkData.Point2f;
        let size = data.cols;
        let arr = new Vector2Array(size);
        arr.fillWith(data.data);

        return arr;
    }

    private getLandmarks3f() : Vector3Array {

        // 2d landmarks as registered in the 'facelandmarks' json
        let data = this.landmarkData.Point3f;
        let size = data.cols;
        let arr = new Vector3Array(size);
        arr.fillWith(data.data);

        return arr;
    }  
}