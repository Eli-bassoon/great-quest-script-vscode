// Container to hold an array and advance through it
export class ConsumingArray<T> {
    arr: T[];
    idx: number = 0;

    constructor(arr: T[]) {
        this.arr = arr;
    }

    consume(): T {
        return this.arr[this.idx++];
    }

    rewind() {
        if (this.idx > 0) --this.idx;
    }

    peek(): T {
        return this.arr[this.idx];
    }

    at(offset: number): T {
        return this.arr[this.idx + offset];
    }

    done(): boolean {
        return this.idx >= this.arr.length;
    }
}