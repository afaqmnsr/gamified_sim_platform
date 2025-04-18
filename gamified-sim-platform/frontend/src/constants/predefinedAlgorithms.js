export const algorithms = [
  {
    id: 'bubbleSort',
    name: 'Bubble Sort',
    code: `(arr) => {
      let steps = [];
      let len = arr.length;
      for (let i = 0; i < len; i++) {
        for (let j = 0; j < len - 1; j++) {
          steps.push({ type: 'compare', i: j, j: j + 1 });
          if (arr[j] > arr[j + 1]) {
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            steps.push({ type: 'swap', array: [...arr], indices: [j, j + 1] });
          }
        }
      }
      return { result: arr, steps };
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
    code: `(arr) => {
      let steps = [];
      const quickSort = (arr) => {
        if (arr.length <= 1) return arr;
        const pivot = arr[arr.length - 1];
        const left = [];
        const right = [];
        for (let i = 0; i < arr.length - 1; i++) {
          steps.push({ type: 'compare', i: i, j: arr.length - 1 });
          if (arr[i] < pivot) left.push(arr[i]);
          else right.push(arr[i]);
        }
        return [...quickSort(left), pivot, ...quickSort(right)];
      };
      const sorted = quickSort(arr);
      steps.push({ type: 'update', array: sorted });
      return { result: sorted, steps };
    }`,
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
    code: `(arr) => {
      let steps = [];
      const mergeSort = (arr) => {
        if (arr.length <= 1) return arr;
        const mid = Math.floor(arr.length / 2);
        const left = mergeSort(arr.slice(0, mid));
        const right = mergeSort(arr.slice(mid));
        return merge(left, right);
      };

      const merge = (left, right) => {
        const result = [];
        let i = 0, j = 0;
        while (i < left.length && j < right.length) {
          steps.push({ type: 'compare', i, j });
          if (left[i] < right[j]) result.push(left[i++]);
          else result.push(right[j++]);
          steps.push({ type: 'merge', array: [...result, ...left.slice(i), ...right.slice(j)] });
        }
        return result.concat(left.slice(i)).concat(right.slice(j));
      };

      const sorted = mergeSort(arr);
      steps.push({ type: 'update', array: sorted });
      return { result: sorted, steps };
    }`,
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
      let steps = [];

      while (queue.length > 0) {
        const node = queue.shift();
        if (!visited.has(node)) {
          visited.add(node);
          traversalOrder.push(node);
          steps.push({ type: 'visit', node });
          for (let neighbor of graph[node]) {
            queue.push(neighbor);
            steps.push({ type: 'enqueue', from: node, to: neighbor });
          }
        }
      }

      return { traversalOrder, steps };
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
      const steps = [];
      const fib = (n) => {
        steps.push({ type: 'call', n });
        if (n <= 1) return n;
        if (memo[n] !== undefined) return memo[n];
        memo[n] = fib(n - 1) + fib(n - 2);
        steps.push({ type: 'memoize', n, value: memo[n] });
        return memo[n];
      };
      const result = fib(n);
      return { result, steps };
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
      const steps = [];

      for (let i = 1; i <= n; i++) {
        for (let w = 0; w <= capacity; w++) {
          if (weights[i - 1] <= w) {
            const include = values[i - 1] + dp[i - 1][w - weights[i - 1]];
            const exclude = dp[i - 1][w];
            dp[i][w] = Math.max(include, exclude);
            steps.push({ type: 'choice', i, w, include, exclude, chosen: dp[i][w] });
          } else {
            dp[i][w] = dp[i - 1][w];
            steps.push({ type: 'skip', i, w, value: dp[i][w] });
          }
        }
      }

      return { result: dp[n][capacity], dpMatrix: dp, steps };
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

      return {"result": dp[n][capacity], "dpMatrix": dp}`,
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
      const steps = [];

      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          if (text1[i - 1] === text2[j - 1]) {
            dp[i][j] = dp[i - 1][j - 1] + 1;
            steps.push({ type: 'match', i, j, char: text1[i - 1], value: dp[i][j] });
          } else {
            dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            steps.push({ type: 'mismatch', i, j, value: dp[i][j] });
          }
        }
      }

      return { result: dp[m][n], dpMatrix: dp, steps };
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

      return {"result": dp[m][n], "dpMatrix": dp}`,
    defaultInput: {
      text1: "AGGTAB",
      text2: "GXTXAYB"
    }
  },
  {
    id: 'knapsackProblem',
    name: 'Knapsack Problem',
    code: `({ weights, values, capacity }) => {
      const steps = [];
      const n = weights.length;
      const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

      for (let i = 1; i <= n; i++) {
        for (let w = 0; w <= capacity; w++) {
          if (weights[i - 1] <= w) {
            const include = values[i - 1] + dp[i - 1][w - weights[i - 1]];
            const exclude = dp[i - 1][w];
            dp[i][w] = Math.max(include, exclude);
            steps.push({ type: 'choice', i, w, include, exclude, chosen: dp[i][w] });
          } else {
            dp[i][w] = dp[i - 1][w];
            steps.push({ type: 'skip', i, w, value: dp[i][w] });
          }
        }
      }

      return { result: dp[n][capacity], steps };
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
      let steps = [];
      // SMT will verify if the graph is bipartite
      const result = true;
      steps.push({ type: 'smt-check', description: 'SMT check initiated' });
      return { result, steps };
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
  },
  {
    id: 'petriNetSim',
    name: 'Petri Net Simulator',
    code: '// Petri Net logic is handled visually, no code required',
    pythonCode: '',
    defaultInput: null,
    type: 'petri' // add a custom type to handle it separately
  }
];