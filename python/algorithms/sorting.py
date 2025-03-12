# algorithms/sorting.py
# import pygame
# import time

# def bubble_sort(data, screen):
#     n = len(data)
#     for i in range(n):
#         for j in range(0, n - i - 1):
#             if data[j] > data[j + 1]:
#                 data[j], data[j + 1] = data[j + 1], data[j]
#             visualize_sort_step(screen, data, j, j+1)
#     return data

# def visualize_sort_step(screen, data, idx1, idx2):
#     # Optional short delay so users can see the swaps
#     time.sleep(0.05)
    
#     screen.fill((30, 30, 30))
#     bar_width = screen.get_width() / len(data)
#     for i, val in enumerate(data):
#         color = (255, 200, 0)
#         if i == idx1 or i == idx2:
#             color = (255, 50, 50)  # highlight swapped bars
#         x_pos = i * bar_width
#         bar_height = val * 2
#         pygame.draw.rect(
#             screen,
#             color,
#             (x_pos, screen.get_height() - bar_height, bar_width - 2, bar_height)
#         )
#     pygame.display.flip()



# algorithms/sorting.py

def bubble_sort(data):
    """
    Sorts the list 'data' in place using Bubble Sort, then returns it.
    """
    arr = data[:]  # Make a copy so we don't mutate the original
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

