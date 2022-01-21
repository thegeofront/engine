// domwrappers.ts
// author : Jos Feenstra
// purpuse : wrap certain DOM functionalities

import { meshFromObj } from "../geometry/mesh/ShaderMesh";
import { Bitmap } from "../image/Bitmap";
import { WebIO } from "./WebIO";

// set any to document to add drop functionality to the entire document, or use any other div.
type FuncGenericReturn = <T>() => T;

export class IO {

    /**
     * TODO catch
     * @deprecated
     */
    static async fetchJson(query: string): Promise<any> {
        return WebIO.getJson(query);

    }

    /**
     * TODO catch
     * @deprecated
     */
    static async fetchText(query: string): Promise<string> {
        return WebIO.getText(query);
    }

    /**
     * TODO catch
     * @deprecated
     */
    static async fetchBlob(query: string): Promise<Blob> {
        return WebIO.getBlob(query);
    }

    static findFile(files: FileList, fileName: string) {
        for (let i = 0; i < files.length; i++) {
            let file: File = files.item(i)!;
            let name = file.name;
            if (name == fileName) {
                return file;
            }
        }
        return undefined;
    }

    static find<T>(
        arr: Array<T>,
        predicate: (value: T, index: number, array: T[]) => boolean,
    ): T | undefined {
        for (let i = 0; i < arr.length; i++) {
            if (predicate(arr[i], i, arr)) {
                return arr[i];
            }
        }
        return undefined;
    }

    /**
     * A dumb hack to trigger a file download
     */
    static promptDownload(file: string, text: string) {
        var element = document.createElement("a");
        element.setAttribute("href", "data:text/plain;charset=utf-8, " + encodeURIComponent(text));
        element.setAttribute("download", file);
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    /**
     * A dumb hack to trigger a file download
     */
    static async promptDownloadImage(file: string, imageData: ImageData) {
        let element = document.createElement("a");
        let image = await imageDataToImage(imageData);
        element.setAttribute("href", image.src);
        element.setAttribute("download", file);
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    /**
     * A procedure specific to scans
     * TODO : fix this
     * @deprecated
     */
    static async meshFromWeb(obj: string, textureBlob: Blob) {
        console.log("reading json...");
        let texture = await loadImageFromBlob(textureBlob);
        let mesh = meshFromObj(obj);

        // flip texture horizontally -> this is needed for some inexplicable reason
        // and put the flipped version in the mesh
        let gi = Bitmap.fromImageData(texture);
        gi = gi.flipVer();
        mesh.setTexture(gi.toImageData());
        return mesh;
    }

    static addDropFileEventListeners(
        canvas: HTMLCanvasElement,
        filesCallback: CallbackOneParam<FileList>,
    ) {
        return addDropFileEventListeners(canvas, filesCallback);
    }


    static loadImageFromSrc(src: string): Promise<ImageData> {
        return new Promise(function (resolve, reject) {
            let img = document.createElement("img") as HTMLImageElement;
            img.src = src;
    
            img.onload = () => resolve(imageToImageData(img));
            img.onerror = () => reject(new Error(`Script load error for ${img}`));
        });
    }
}

//@depricated
export function addDropFileEventListeners(
    canvas: HTMLCanvasElement,
    filesCallback: CallbackOneParam<FileList>,
) {
    console.log("setting up drag events...");
    canvas.addEventListener(
        "dragenter",
        function (ev: DragEvent) {
            // ev.stopPropagation();
            ev.preventDefault();
            console.log("entering entering...");
            return true;
        },
        true,
    );

    // setup file upload
    canvas.addEventListener(
        "dragover",
        function (ev: DragEvent) {
            //add hover class when drag over
            // ev.stopPropagation();
            ev.preventDefault();
            console.log("over drag....");
            return true;
        },
        true,
    );

    canvas.addEventListener(
        "dragleave",
        function (ev: DragEvent) {
            //remove hover class when drag out
            // ev.stopPropagation();
            ev.preventDefault();
            console.log("leaving drag....");
            return true;
        },
        true,
    );

    canvas.addEventListener(
        "drop",
        function (ev: DragEvent) {
            //prevent browser from open the file when drop off
            ev.stopPropagation();
            ev.preventDefault();

            //retrieve uploaded files data
            var files: FileList = ev.dataTransfer!.files;

            filesCallback(files);
            return true;
        },
        true,
    );
}

interface CallbackOneParam<T1, T2 = void> {
    (param1: T1): T2;
}

//@depricated
export function loadTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
            // console.log(reader.result);
            resolve(reader.result as string);
        };
        reader.onerror = (error) => reject(error);
    });
}

//@depricated
export function loadJSONFromFile(file: File): Promise<JSON> {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
            // console.log(reader.result);
            resolve(JSON.parse(reader.result as string));
        };
        reader.onerror = (error) => reject(error);
    });
}

//@depricated
export function loadImageFromFile(file: File): Promise<ImageData> {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () =>
            loadImageHelper1(reader).then(
                (imageData) => resolve(imageData),
                (error) => reject(error),
            );
    });
}

//@depricated
export function loadImageFromBlob(blob: Blob): Promise<ImageData> {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () =>
            loadImageHelper1(reader).then(
                (imageData) => resolve(imageData),
                (error) => reject(error),
            );
    });
}

//@depricated
export function loadImageFromSrc(src: string): Promise<ImageData> {
    return new Promise(function (resolve, reject) {
        let img = document.createElement("img") as HTMLImageElement;
        img.crossOrigin = "Anonymous";
        img.src = src;

        img.onload = () => resolve(imageToImageData(img));
        img.onerror = () => reject(new Error(`Script load error for ${img}`));
    });
}

function loadImageHelper1(fileReader: FileReader): Promise<ImageData> {
    return new Promise(function (resolve, reject) {
        let img = document.createElement("img") as HTMLImageElement;
        img.src = fileReader.result as string;
        img.crossOrigin = "Anonymous";

        img.onload = () => resolve(imageToImageData(img));
        img.onerror = () => reject(new Error(`Script load error for ${img}`));
    });
}

function imageToImageData(image: HTMLImageElement): ImageData {
    // turn it into image data by building a complete canvas and sampling it
    let canvas = document.createElement("canvas")!;
    canvas.width = image.width;
    canvas.height = image.height;
    let ctx = canvas.getContext("2d")!;
    ctx.drawImage(image, 0, 0);
    let data = ctx.getImageData(0, 0, image.width, image.height);
    canvas.parentNode?.removeChild(canvas);
    return data;
}


async function imageDataToImage(imagedata: ImageData) : Promise<HTMLImageElement> {
    var canvas = document.createElement('canvas')!;
    var ctx = canvas.getContext('2d')!;
    canvas.width = imagedata.width;
    canvas.height = imagedata.height;
    ctx.putImageData(imagedata, 0, 0);

    var image = new Image();
    image.src = canvas.toDataURL("image/png");
   
    return new Promise(function (resolve, reject) {
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`could not convert image data to image`));
    });
}
