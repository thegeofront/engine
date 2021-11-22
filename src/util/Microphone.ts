import { Stat } from "../lib";

/**
 * Inspired by : https://www.youtube.com/watch?v=qNEb9of714U
 * 
 */
export class Microphone {

    

    constructor(
        private ac: AudioContext,
        private microphone: MediaStreamAudioSourceNode,
        private analyser: AnalyserNode,
        private array: Uint8Array,
        private normedArray: Float32Array,
        private delayedArray: Float32Array,
    ) {}

    static async new(fftSize = 512) {
        let stream = await navigator.mediaDevices.getUserMedia({audio: true});
        let audioContext = new AudioContext;
        let microphone = audioContext.createMediaStreamSource(stream);
        let analyser = audioContext.createAnalyser();
        analyser.fftSize = fftSize;
        const bufferLength = analyser.frequencyBinCount;
        let array = new Uint8Array(bufferLength);
        let delayedArray = new Float32Array(bufferLength);
        let normedArray = new Float32Array(bufferLength);
        microphone.connect(analyser);

        return new Microphone(audioContext, microphone, analyser, array, normedArray, delayedArray);
    } 

    getTimeDomain() {
        this.analyser.getByteTimeDomainData(this.array);
        return this.array;
    }

    getFrequency() {
        this.analyser.getByteFrequencyData(this.array);
        return this.array;
    }

    getTimeDomainNormalized() {
        this.getTimeDomain();
        for (let i = 0 ; i < this.array.length; i++) {
            this.normedArray[i] = (this.array[i] / 128) - 1;
        }
        return this.normedArray;
    }

    getFrequencyNormalized() {
        this.getFrequency();
        for (let i = 0 ; i < this.array.length; i++) {
            this.normedArray[i] = (this.array[i] / 128) - 1;
        }
        return this.normedArray;
    }

    getTimeDomainDelayed(falloff=0.97) {
        this.getTimeDomainNormalized();

        for (let i = 0 ; i < this.array.length; i++) {
            if (this.normedArray[i] > this.delayedArray[i]) {
                this.delayedArray[i] = this.normedArray[i]; 
            } else {
                this.delayedArray[i] *= falloff;
                // this.delayedArray[i] =  Math.max(0, this.delayedArray[i] - falloff);
            }
        }
        return this.delayedArray;
    }

    getFrequencyDelayed(falloff=0.97) {
        this.getTimeDomainNormalized();

        for (let i = 0 ; i < this.array.length; i++) {
            if (this.normedArray[i] > this.delayedArray[i]) {
                this.delayedArray[i] = this.normedArray[i]; 
            } else {
                this.delayedArray[i] *= falloff;
                // this.delayedArray[i] =  Math.max(0, this.delayedArray[i] - falloff);
            }
        }
        return this.delayedArray;
    }
}