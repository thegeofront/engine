// domwrappers.ts
// author : Jos Feenstra
// purpuse : wrap certain DOM functionalities 
// for easy readablility & reusability


function test() {
}

function setupDragEvent(env: any) 
{
    // setup file upload
    document.addEventListener('dragover', function(ev: DragEvent) {
        //add hover class when drag over
        ev.stopPropagation();
        ev.preventDefault();
        // console.log("entering drag....")
        return false;
    });
        
    document.addEventListener('dragleave', function(ev: DragEvent) {
        //remove hover class when drag out
        ev.stopPropagation();
        ev.preventDefault();
        // console.log("leaving drag....")
        return false;
    });

    document.ondrop = drop;
}


interface CallbackOneParam<T1, T2 = void> {
    (param1: T1): T2;
  }

function drop(ev: DragEvent)
{
    //prevent browser from open the file when drop off
    ev.stopPropagation();
    ev.preventDefault();

    //retrieve uploaded files data
    var files = ev.dataTransfer!.files;
    console.log("i am recieving files! using the first one...");
    
    loadImage(files.item(0)!, (image: ImageData) => {
        
    });
    return false;
}

function loadImage(file: File, callback: CallbackOneParam<ImageData>)
{
    let reader = new FileReader();
    reader.onload = () => loadImageHelper1(reader, callback);
    reader.readAsDataURL(file);
}

function loadImageHelper1(fileReader: FileReader, callback: CallbackOneParam<ImageData>) {
    let img = document.createElement('img') as HTMLImageElement
    img.onload = () => loadImageHelper2(img, callback);
    img.src = fileReader.result as string;
}

function loadImageHelper2(image: HTMLImageElement, callback: CallbackOneParam<ImageData>)
{
    // turn it into image data by building a complete canvas and sampling it
    let canvas = document.createElement('canvas')!;;
    canvas.width = image.width;
    canvas.height = image.height;
    let ctx = canvas.getContext('2d')!;
    ctx.drawImage(image, 0, 0);
    let data = ctx.getImageData(0, 0, image.width, image.height);
    canvas.parentNode?.removeChild(canvas);
    callback(data);
}