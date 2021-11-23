export class Queue<T> {
    
    constructor(
        public data: Array<T>,
    ) {}

    static new<T>(data: Array<T> = []) {
        return new Queue<T>(data);
    }

    add(item: T) {
        this.data.push(item);
    }

    dequeue() : T | undefined {
        return this.data.shift();
    }

    isEmpty() {
        return this.data.length == 0;
    }

    get length() {
        return this.data.length;
    }

    peek() : T | undefined {
        return !this.isEmpty() ? this.data[0] : undefined;
    }
}