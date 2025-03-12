import pygame
import random

from metrics.performance_tracker import track_performance
from metrics.energy_estimator import measure_energy
from algorithms.sorting import bubble_sort
from algorithms.graph_traversal import breadth_first_search, generate_random_grid

# Constants for display
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GRAY = (200, 200, 200)
GREEN = (50, 200, 50)
RED = (200, 50, 50)

def run_game(screen):
    clock = pygame.time.Clock()
    running = True
    
    # Visualization data storage
    sort_result = None
    bfs_path = None
    grid = None
    cell_size = 20  # BFS grid cell size

    font = pygame.font.SysFont("Arial", 20)
    instructions_text = font.render("Press 'S' for Sorting, 'B' for BFS, 'ESC' to Quit", True, WHITE)

    while running:
        screen.fill(BLACK)
        screen.blit(instructions_text, (20, 20))
        
        # Draw the sorted array if it exists
        if sort_result is not None:
            draw_sorted_array(screen, sort_result, (screen.get_width() // 2, 300))
        
        # Draw the BFS grid & path if it exists
        if grid is not None:
            draw_grid(screen, grid, cell_size)
        if bfs_path is not None:
            draw_path(screen, bfs_path, cell_size)

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    running = False

                # Run Bubble Sort
                elif event.key == pygame.K_s:
                    data = [random.randint(10, 100) for _ in range(20)]
                    # Measure performance (time, memory) + approximate energy
                    with track_performance() as perf_data:
                        result, energy_used = measure_energy(bubble_sort, data)
                    
                    sort_result = result

                    # Print performance in console
                    print("=== Bubble Sort Results ===")
                    print("Sorted:", sort_result)
                    print(perf_data)
                    print(f"Approx Energy Used (Wh): {energy_used:.6f}\n")

                    # Clear BFS results
                    bfs_path = None
                    grid = None

                # Run BFS
                elif event.key == pygame.K_b:
                    grid = generate_random_grid(20, 15, obstacle_probability=0.2)
                    start, goal = (0, 0), (len(grid)-1, len(grid[0])-1)

                    with track_performance() as perf_data:
                        result, energy_used = measure_energy(
                            breadth_first_search, grid, start, goal
                        )
                    
                    bfs_path = result  # This is a list of (x, y) cells in the BFS path

                    # Print performance in console
                    print("=== BFS Results ===")
                    print("Path Found:", bfs_path)
                    print(perf_data)
                    print(f"Approx Energy Used (Wh): {energy_used:.6f}\n")

                    # Clear sorting results
                    sort_result = None
        
        pygame.display.flip()
        clock.tick(30)

def draw_sorted_array(screen, data, center_pos):
    """
    Draw the sorted array as a series of vertical bars.
    center_pos is a tuple (x, y) for where to center the array.
    """
    x_center, y_center = center_pos
    bar_width = 10
    spacing = 2
    total_width = len(data) * (bar_width + spacing)
    
    start_x = x_center - total_width // 2
    
    for i, val in enumerate(data):
        height = val * 2  # scale factor for visualization
        x = start_x + i * (bar_width + spacing)
        y = y_center - height // 2
        pygame.draw.rect(screen, GREEN, (x, y, bar_width, height))

def draw_grid(screen, grid, cell_size):
    """
    Draw the BFS grid. 0 = free cell, 1 = obstacle.
    """
    rows = len(grid)
    cols = len(grid[0])
    offset_x = 50
    offset_y = 80
    
    for r in range(rows):
        for c in range(cols):
            cell_color = WHITE if grid[r][c] == 0 else RED
            pygame.draw.rect(
                screen,
                cell_color,
                (offset_x + c*cell_size, offset_y + r*cell_size, cell_size, cell_size)
            )
            pygame.draw.rect(
                screen,
                GRAY,
                (offset_x + c*cell_size, offset_y + r*cell_size, cell_size, cell_size),
                1
            )

def draw_path(screen, path, cell_size):
    """
    Highlight the BFS path cells in green.
    """
    if not path:
        return
    offset_x = 50
    offset_y = 80
    for (r, c) in path:
        pygame.draw.rect(
            screen,
            GREEN,
            (offset_x + c*cell_size, offset_y + r*cell_size, cell_size, cell_size)
        )
