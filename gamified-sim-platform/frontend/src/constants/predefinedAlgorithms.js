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
  },

  // DP: Fibonacci (Memoization)
  {
    id: 'fibonacciDP',
    name: 'Fibonacci (DP - Memoization)',
    code: `(n) => {
  const memo = {};
  const fib = (n) => {
    if (n <= 1) return n;
    if (memo[n] !== undefined) return memo[n];
    memo[n] = fib(n - 1) + fib(n - 2);
    return memo[n];
  };
  return fib(n);
}`,
    defaultInput: [10] // fib(10) = 55
  },

  // DP: 0/1 Knapsack
  {
    id: 'knapsackDP',
    name: 'Knapsack 0/1 (DP)',
    code: `({ weights, values, capacity }) => {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(
          values[i - 1] + dp[i - 1][w - weights[i - 1]],
          dp[i - 1][w]
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  return dp[n][capacity];
}`,
    defaultInput: {
      weights: [2, 3, 4, 5],
      values: [3, 4, 5, 6],
      capacity: 5
    }
  },

  // DP: Longest Common Subsequence
  {
    id: 'lcsDP',
    name: 'Longest Common Subsequence (DP)',
    code: `({ text1, text2 }) => {
  const m = text1.length;
  const n = text2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[m][n];
}`,
    defaultInput: {
      text1: "AGGTAB",
      text2: "GXTXAYB"
    }
  }
];