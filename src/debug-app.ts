// author: Jos Feenstra
// purpose: environment to test eyefinder functionalities

import { addDropFileEventListeners } from "./input/domwrappers";
import { EyeFinder } from "./process/EyeFinder";
import { BellusScanData } from "./input/BellusData";

export function RunEyeFinderDemo(canvas: HTMLCanvasElement, context: HTMLDivElement) {

    // start as soon as we recieved files by means of drag and drop
    addDropFileEventListeners(document, processFiles);
}

function processFiles(files: FileList) {
    
    var bellusdata = BellusScanData.fromFileList(files);

    // 

}

// async function getData(input: HTMLInputElement, ev: Event) {
//     files: FileList = await 
// }

// function loadFile(input: HTMLInputElement, ev: Event) {

//     for (File file in input.files!) {
//         console.log(`File name: ${file.}`);
//         alert(`Last modified: ${file.lastModified}`);
//     }
// }

// function demo() {
//     let file = document.getElementById("fileForUpload").files[0];
//     if (file) {
//         var reader = new FileReader();
//         reader.


//         reader.readAsText(file, "UTF-8");
//         reader.onload = function (evt) {
//             console.log(evt.target!.result);
//         }
//         reader.onerror = function (evt) {
//             console.log("error reading file");
//         }
//     }
// }