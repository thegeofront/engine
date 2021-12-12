import { IO } from "./IO";

export namespace WebIO {

    export async function postJson(url: string, json: any): Promise<Response> {
        let res = await fetch(url, {method: "POST", headers: {'Content-Type': 'application/json'}, body: JSON.stringify(json)});
        return res;
    }

    /**
     * Shorthand
     * Fetch a url, and parse the response as json. will return empty object on encountering negative network responses 
     */
    export async function getJson(url: string, headers={}): Promise<any> {
        let res = await fetch(url, {headers});
        if (!res.ok) {
            return {};
        }
        let data = await res.json();
        return data;
    }

    /**
     * Shorthand
     * Fetch a url, and parse the response as text. will return empty string on encountering negative network responses 
     */
    export async function getText(url: string): Promise<string> {
        let res = await fetch(url);
        if (!res.ok) {
            return "";
        }
        let data = await res.text();
        return data;
    }

    /**
     * Shorthand
     * Fetch a url, and parse the response as blobl. will return empty blob on encountering negative network responses 
     */
    export async function getBlob(url: string): Promise<Blob> {
        let res = await fetch(url);
        if (!res.ok) {
            return new Blob();
        }
        let data = await res.blob();
        return data;
    }

    /**
     * Fetch a url as a blob, then process it to ImageData
     * DOES NOT HANDLE ERRORS
     * 
     * @param url 
     * @returns 
     */
    export async function getImage(url: string) : Promise<ImageData> {
        let blob = await getBlob(url);
        let res = loadImageFromBlob(blob).catch((e) => {
            return new ImageData(0,0);
        });
        return res;
    }

    /////////////////////////////////////////////////////////////////////////// Private

    function loadImageFromBlob(blob: Blob): Promise<ImageData> {
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

    function loadImageHelper1(fileReader: FileReader): Promise<ImageData> {
        return new Promise(function (resolve, reject) {
            let img = document.createElement("img") as HTMLImageElement;
            img.src = fileReader.result as string;
            img.crossOrigin = "Anonymous";
    
            img.onload = () => resolve(loadImageHelper2(img));
            img.onerror = () => reject(new Error(`Script load error for ${img}`));
        });
    }
    
    function loadImageHelper2(image: HTMLImageElement): ImageData {
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
}