export class Queue {
    tail = -1;
    _queue   = [];

    enqueue(node) {
        this.tail++;
        this._queue[this.tail] = node;
    }

    dequeue(){
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

}