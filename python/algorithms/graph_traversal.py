# algorithms/graph_traversal.py
from collections import deque
import random

def generate_random_grid(rows, cols, obstacle_probability=0.2):
    """
    Generates a 2D grid with some cells as obstacles (1) and some as free (0).
    obstacle_probability is the chance any cell will be an obstacle.
    """
    grid = []
    for r in range(rows):
        row = []
        for c in range(cols):
            if random.random() < obstacle_probability:
                row.append(1)  # obstacle
            else:
                row.append(0)  # free
        grid.append(row)
    grid[0][0] = 0  # ensure start is free
    grid[rows-1][cols-1] = 0  # ensure goal is free
    return grid

def breadth_first_search(grid, start, goal):
    """
    Performs BFS on the grid from 'start' to 'goal'.
    Returns the path as a list of (row, col) tuples if found, else [].
    """
    rows = len(grid)
    cols = len(grid[0]) if rows > 0 else 0
    
    # Sanity check
    if not in_bounds(start, rows, cols) or not in_bounds(goal, rows, cols):
        return []
    
    visited = set()
    queue = deque()
    queue.append((start, [start]))  # (current_cell, path_so_far)
    
    while queue:
        (r, c), path = queue.popleft()
        
        if (r, c) == goal:
            return path
        
        for nr, nc in get_neighbors(r, c, rows, cols):
            if grid[nr][nc] == 0 and (nr, nc) not in visited:
                visited.add((nr, nc))
                queue.append(((nr, nc), path + [(nr, nc)]))
    
    # No path found
    return []

def get_neighbors(r, c, rows, cols):
    """
    Returns valid adjacent cells.
    """
    directions = [(0,1), (0,-1), (1,0), (-1,0)]
    for dr, dc in directions:
        nr, nc = r + dr, c + dc
        if in_bounds((nr, nc), rows, cols):
            yield nr, nc

def in_bounds(cell, rows, cols):
    r, c = cell
    return 0 <= r < rows and 0 <= c < cols
