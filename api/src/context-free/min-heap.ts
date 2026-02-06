type FrequencyPair = [string, number];

class MinHeap {
  private heap: FrequencyPair[] = [];

  constructor(private maxSize: number) {}

  push(val: FrequencyPair): void {
    this.heap.push(val);
    this.bubbleUp();

    // If we exceed K elements, remove the smallest (the root)
    if (this.heap.length > this.maxSize) {
      this.pop();
    }
  }

  pop(): FrequencyPair | null {
    if (this.heap.length === 0) return null;
    const min = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.siftDown();
    }
    return min;
  }

  private bubbleUp(): void {
    let index = this.heap.length - 1;
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index][1] >= this.heap[parentIndex][1]) break;
      [this.heap[index], this.heap[parentIndex]] = [
        this.heap[parentIndex],
        this.heap[index],
      ];
      index = parentIndex;
    }
  }

  private siftDown(): void {
    let index = 0;
    const length = this.heap.length;
    
    while (true) {
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      let smallest = index;

      if (left < length && this.heap[left][1] < this.heap[smallest][1]) {
        smallest = left;
      }
      if (right < length && this.heap[right][1] < this.heap[smallest][1]) {
        smallest = right;
      }

      if (smallest === index) break;
      
      [this.heap[index], this.heap[smallest]] = [
        this.heap[smallest],
        this.heap[index],
      ];
      index = smallest;
    }
  }

  // Get all elements from heap (returns sorted array, smallest first)
  getAllElements(): {[key:string]:number} {

    const result : {[key:string] : number} = {};

    for(const word_freq of this.heap)
    {
        result[word_freq[0]] = word_freq[1];
    }

    return result;
  }

  // Get size of heap
  size(): number {
    return this.heap.length;
  }
}

// Standalone function (not a method of MinHeap)
function getTopKWords(wordMap: Map<string, number>, k: number): {[key:string] : number} {
  const heap = new MinHeap(k);
  
  // Push all words into heap (keeps only top K)
  for (const entry of wordMap.entries()) {
    heap.push(entry);
  }

  return heap.getAllElements();
}

export { MinHeap, getTopKWords, type FrequencyPair };