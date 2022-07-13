export class Queue<T> {
    tail = -1;
    _queue:any[]  = [];

    enqueue(node:T) {
        this.tail++;
        this._queue[this.tail] = node;
    }

    dequeue():T{
        const removed = this._queue.shift();
        this.tail--;
        return removed;
    }

    size() {
        return this.tail + 1;
    }

    isEmpty() {
        return (this.size() === 0);
    }

    toArray() {
        return this._queue;
    }

    purge() {
        this._queue = [];
        this.tail = -1;
    }

    has(matchingFun: (T) => boolean) {
        return this._queue.find(matchingFun) !== undefined;
    }

    find(matchingFun: (T) => boolean) {
        return this._queue.find(matchingFun);
    }

}