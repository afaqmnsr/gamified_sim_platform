import pygame
from visualization.game_loop import run_game

def main():
    pygame.init()
    screen = pygame.display.set_mode((800, 600))
    pygame.display.set_caption("Algorithm Visualization")
    run_game(screen)
    pygame.quit()

if __name__ == "__main__":
    main()
