import pygame
import random

# Simulation parameters
WIDTH, HEIGHT = 800, 600
POPULATION_SIZE = 200
INFECTION_RADIUS = 10
INFECTION_PROBABILITY = 0.03
RECOVERY_TIME = 500
MAX_VELOCITY = 2

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GREEN = (0, 255, 0)
RED = (255, 0, 0)

class Individual:
    def __init__(self):
        self.x = random.randint(0, WIDTH)
        self.y = random.randint(0, HEIGHT)
        self.vel_x = random.uniform(-MAX_VELOCITY, MAX_VELOCITY)
        self.vel_y = random.uniform(-MAX_VELOCITY, MAX_VELOCITY)
        self.infected = False
        self.recovery_counter = 0

    def move(self):
        self.x += self.vel_x
        self.y += self.vel_y

        # Bounce off the walls
        if self.x < 0 or self.x > WIDTH:
            self.vel_x *= -1
        if self.y < 0 or self.y > HEIGHT:
            self.vel_y *= -1

    def infect(self):
        self.infected = True
        self.recovery_counter = 0

    def is_infected(self):
        return self.infected

    def is_recovered(self):
        return self.recovery_counter >= RECOVERY_TIME

    def update(self):
        if self.is_infected():
            if self.is_recovered():
                self.infected = False
            else:
                self.recovery_counter += 1

    def draw(self, surface):
        if self.is_infected():
            color = RED
        else:
            color = GREEN
        pygame.draw.circle(surface, color, (int(self.x), int(self.y)), 5)

# Initialize Pygame
pygame.init()
clock = pygame.time.Clock()
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Pandemic Simulation")

# Create population of individuals
population = [Individual() for _ in range(POPULATION_SIZE)]

# Infect a few individuals initially
for i in range(5):
    population[i].infect()

# Simulation loop
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # Clear screen
    screen.fill(BLACK)

    # Update and draw individuals
    for individual in population:
        individual.move()
        individual.update()
        individual.draw(screen)

    # Check for infections
    for individual in population:
        if individual.is_infected():
            for other_individual in population:
                if (other_individual != individual and not other_individual.is_infected()):
                    distance = ((individual.x - other_individual.x) ** 2  + (individual.y - other_individual.y) ** 2) ** 0.5
                    if (distance < INFECTION_RADIUS and random.random() < INFECTION_PROBABILITY):
                        other_individual.infect()

    # Update the display
    pygame.display.flip()
    clock.tick(60)

# Quit the simulation
pygame.quit()
