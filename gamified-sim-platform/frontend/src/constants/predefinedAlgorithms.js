export const algorithms = [
    {
        id: 'bubbleSort',
        name: 'Bubble Sort',
        code: `(arr) => {
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`,
        defaultInput: [5, 3, 8, 4, 2]
    },
    {
        id: 'quickSort',
        name: 'Quick Sort',
      code: `(function quickSort(arr) {
    if (arr.length <= 1) return arr;
    const pivot = arr[arr.length - 1];
    const left = arr.filter(item => item < pivot);
    const right = arr.filter(item => item > pivot);
    return [...quickSort(left), pivot, ...quickSort(right)];
  })`,
        defaultInput: [9, 1, 5, 3, 7]
    },
    {
        id: 'mergeSort',
        name: 'Merge Sort',
      code: `(function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    return merge(left, right);

    function merge(left, right) {
      const result = [];
      let i = 0, j = 0;
      while (i < left.length && j < right.length) {
        if (left[i] < right[j]) result.push(left[i++]);
        else result.push(right[j++]);
      }
      return result.concat(left.slice(i)).concat(right.slice(j));
    }
  })`,
        defaultInput: [10, 7, 4, 3, 9]
    },
    {
        id: 'bfs',
        name: 'Breadth-First Search',
        code: `(graph, startNode) => {
  const visited = new Set();
  const queue = [startNode];
  const traversalOrder = [];

  while (queue.length > 0) {
    const node = queue.shift();
    if (!visited.has(node)) {
      visited.add(node);
      traversalOrder.push(node);
      queue.push(...graph[node]);
    }
  }

  return traversalOrder;
}`,
        defaultGraph: {
            A: ['B', 'C'],
            B: ['D'],
            C: [],
            D: []
        },
        defaultStartNode: 'A'
    }
];