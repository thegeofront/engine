// domwrappers.ts
// author : Jos Feenstra
// purpuse : wrap certain DOM functionalities 

// set any to document to add drop functionality to the entire document, or use any other div.
type FuncGenericReturn = <T>() => T;
export function addDropFileEventListeners(env: any, filesCallback: CallbackOneParam<FileList>) 
{
    // setup file upload
    env.addEventListener('dragover', function(ev: DragEvent) {

        //add hover class when drag over
        ev.stopPropagation();
        ev.preventDefault();
        // console.log("entering drag....")
        return false;
    });
        
    env.addEventListener('dragleave', function(ev: DragEvent) {

        //remove hover class when drag out
        ev.stopPropagation();
        ev.preventDefault();
        // console.log("leaving drag....")
        return false;
    });

    env.addEventListener('drop', function(ev: DragEvent) {

        //prevent browser from open the file when drop off
        ev.stopPropagation();
        ev.preventDefault();

        //retrieve uploaded files data
        var files: FileList = ev.dataTransfer!.files;

        filesCallback(files);
        return false;
    });
}


interface CallbackOneParam<T1, T2 = void> {
    (param1: T1): T2;
}


async function loadImageTest(files: FileList) {

    let image = await loadImageFromFile(files.item(0)!);
}

export function loadTextFromFile(file: File) : Promise<string> {

    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
            // console.log(reader.result);
            resolve(reader.result as string);
        }
        reader.onerror = (error) => reject(error);
    });
}

export function loadJSONFromFile(file: File) : Promise<JSON> {
    
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
            // console.log(reader.result);
            resolve(JSON.parse(reader.result as string));
        }
        reader.onerror = (error) => reject(error);
    });
}

export function loadImageFromFile(file: File) : Promise<ImageData> {

    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => loadImageHelper1(reader).then(
            imageData => resolve(imageData),
            error => reject(error),
        );
    });
}

export function AddSlider(context: HTMLDivElement, min = 0, max = 1, step = 0.01, start = 0.5, onchangeEvent: Function) {
    throw "TODO!";
}



function loadImageHelper1(fileReader: FileReader) : Promise<ImageData> {
    
    return new Promise(function(resolve, reject) {
        let img = document.createElement('img') as HTMLImageElement
        img.src = fileReader.result as string;
    
        img.onload = () => resolve(loadImageHelper2(img));
        img.onerror = () => reject(new Error(`Script load error for ${img}`));
    });
}

function loadImageHelper2(image: HTMLImageElement) : ImageData
{
    // turn it into image data by building a complete canvas and sampling it
    let canvas = document.createElement('canvas')!;;
    canvas.width = image.width;
    canvas.height = image.height;
    let ctx = canvas.getContext('2d')!;
    ctx.drawImage(image, 0, 0);
    let data = ctx.getImageData(0, 0, image.width, image.height);
    canvas.parentNode?.removeChild(canvas);
    return data;
}
