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
    pythonCode: `def run(input_data):
    arr = input_data["input"]
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
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
    pythonCode: `def run(input_data):
    arr = input_data["input"]

    def quick_sort(arr):
        if len(arr) <= 1:
            return arr
        pivot = arr[-1]
        left = [x for x in arr[:-1] if x < pivot]
        right = [x for x in arr[:-1] if x >= pivot]
        return quick_sort(left) + [pivot] + quick_sort(right)

    return quick_sort(arr)`,
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
    pythonCode: `def run(input_data):
    def merge_sort(arr):
        if len(arr) <= 1:
            return arr
        mid = len(arr) // 2
        left = merge_sort(arr[:mid])
        right = merge_sort(arr[mid:])
        return merge(left, right)

    def merge(left, right):
        result = []
        i = j = 0
        while i < len(left) and j < len(right):
            if left[i] < right[j]:
                result.append(left[i])
                i += 1
            else:
                result.append(right[j])
                j += 1
        result.extend(left[i:])
        result.extend(right[j:])
        return result

    return merge_sort(input_data["input"])`,
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
    pythonCode: `def run(input_data):
    graph = input_data["graph"]
    start_node = input_data["startNode"]
    visited = set()
    queue = [start_node]
    traversal_order = []

    while queue:
        node = queue.pop(0)
        if node not in visited:
            visited.add(node)
            traversal_order.append(node)
            queue.extend(graph.get(node, []))

    return traversal_order`,
    defaultGraph: {
      A: ['B', 'C'],
      B: ['D'],
      C: [],
      D: []
    },
    defaultStartNode: 'A'
  },
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
    pythonCode: `def run(input_data):
    n = input_data["input"] if isinstance(input_data["input"], int) else input_data["input"][0]
    memo = {}

    def fib(n):
        if n <= 1:
            return n
        if n in memo:
            return memo[n]
        memo[n] = fib(n - 1) + fib(n - 2)
        return memo[n]

    return fib(n)`,
    defaultInput: [10]
  },
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
    pythonCode: `def run(input_data):
    weights = input_data["weights"]
    values = input_data["values"]
    capacity = input_data["capacity"]

    n = len(weights)
    dp = [[0 for _ in range(capacity + 1)] for _ in range(n + 1)]

    for i in range(1, n + 1):
        for w in range(capacity + 1):
            if weights[i - 1] <= w:
                dp[i][w] = max(values[i - 1] + dp[i - 1][w - weights[i - 1]], dp[i - 1][w])
            else:
                dp[i][w] = dp[i - 1][w]

    return dp[n][capacity]`,
    defaultInput: {
      weights: [2, 3, 4, 5],
      values: [3, 4, 5, 6],
      capacity: 5
    }
  },
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
    pythonCode: `def run(input_data):
    text1 = input_data["text1"]
    text2 = input_data["text2"]
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    
    return dp[m][n]`,
    defaultInput: {
      text1: "AGGTAB",
      text2: "GXTXAYB"
    }
  },
  {
    id: 'knapsackProblem',
    name: 'Knapsack Problem',
    code: `({ weights, values, capacity }) => {
    // Your Knapsack code here
    return 0;
  }`,
    pythonCode: `def run(input_data):
    weights = input_data["weights"]
    values = input_data["values"]
    capacity = input_data["capacity"]
    n = len(weights)

    dp = [[0 for _ in range(capacity + 1)] for _ in range(n + 1)]

    for i in range(1, n + 1):
        for w in range(capacity + 1):
            if weights[i - 1] <= w:
                dp[i][w] = max(values[i - 1] + dp[i - 1][w - weights[i - 1]], dp[i - 1][w])
            else:
                dp[i][w] = dp[i - 1][w]

    return dp[n][capacity]`,
    defaultInput: { weights: [1, 3, 4, 5], values: [1, 4, 5, 7], capacity: 7 },
    smtType: 'knapsackOptimal',
    smtConstraints: {
      capacityNonNegative: true,
      weightsPositive: true,
      valuesPositive: true
    }
  },
  {
    id: 'isGraphBipartiteSMT',
    name: 'Graph Bipartite SMT Check',
    code: `({ graph }) => {
      // SMT will verify if the graph is bipartite
      return true;
    }`,
    pythonCode: `def run(input_data):
    graph = input_data["graph"]
    color = {}

    def dfs(node, c):
        if node in color:
            return color[node] == c
        color[node] = c
        return all(dfs(neigh, 1 - c) for neigh in graph.get(node, []))

    for node in graph:
        if node not in color:
            if not dfs(node, 0):
                return False
    return True`,
    defaultInput: {
      graph: {
        0: [1, 3],
        1: [0, 2],
        2: [1, 3],
        3: [0, 2]
      }
    },
    smtType: 'isGraphBipartite'
  }
];