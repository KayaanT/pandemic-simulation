// Simulation parameters
const WIDTH = 800;
const HEIGHT = 600;
const POPULATION_SIZE = 5000;
const INFECTION_RADIUS = 15;
const INFECTION_PROBABILITY = 0.02;
const RECOVERY_TIME = 500;
const MAX_VELOCITY = 2;

// Colors
const BLACK = [0, 0, 0];
const WHITE = [255, 255, 255];
const GREEN = [50, 255, 50];
const RED = [155, 0, 0];

class Individual {
  constructor() {
    this.x = random(0, WIDTH);
    this.y = random(0, HEIGHT);
    this.vel_x = random(-MAX_VELOCITY, MAX_VELOCITY);
    this.vel_y = random(-MAX_VELOCITY, MAX_VELOCITY);
    this.infected = false;
    this.recovery_counter = 0;
  }

  move() {
    this.x += this.vel_x;
    this.y += this.vel_y;

    // Bounce off the walls
    if (this.x < 0 || this.x > WIDTH) {
      this.vel_x *= -1;
    }
    if (this.y < 0 || this.y > HEIGHT) {
      this.vel_y *= -1;
    }
  }

  infect() {
    this.infected = true;
    this.recovery_counter = 0;
  }

  is_infected() {
    return this.infected;
  }

  is_recovered() {
    return this.recovery_counter >= RECOVERY_TIME;
  }

  update() {
    if (this.is_infected()) {
      if (this.is_recovered()) {
        this.infected = false;
      } else {
        this.recovery_counter += 1;
      }
    }
  }

  draw() {
    if (this.is_infected()) {
      fill(RED);
    } else {
      fill(GREEN);
    }
    rect(this.x, this.y, 5, 5);
  }
}

// Create population of individuals
let population = [];

function setup() {
  createCanvas(WIDTH, HEIGHT);
  rectMode(CENTER);
  for (let i = 0; i < POPULATION_SIZE; i++) {
    population.push(new Individual());
  }

  // Infect a few individuals initially
  for (let i = 0; i < 5; i++) {
    population[i].infect();
  }
}

function draw() {
  background(BLACK);

  // Update and draw individuals
  for (let individual of population) {
    individual.move();
    individual.update();
    individual.draw();
  }

  // Check for infections
  // for (let individual of population) {
  //   if (individual.is_infected()) {
  //     for (let other_individual of population) {
  //       if (other_individual !== individual && !other_individual.is_infected()) {
  //         let distance = dist(individual.x, individual.y, other_individual.x, other_individual.y);
  //         if (distance < INFECTION_RADIUS && random() < INFECTION_PROBABILITY) {
  //           other_individual.infect();
  //         }
  //       }
  //     }
  //   }
  // }
}
