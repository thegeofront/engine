export namespace Util {

    export function range(count: number) {
        let i = 0;
        let numbers = Array<number>(count);
        for (let i = 0; i < count; i++) {
            numbers[i] = i;
        }
        return numbers;
    }

}