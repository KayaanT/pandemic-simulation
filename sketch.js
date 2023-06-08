// Constants
const INITIAL_PREY_POPULATION = 100;
const INITIAL_PREDATOR_POPULATION = 5;
let PREY_GROWTH_RATE = 0.005;
const PREDATOR_DEATH_RATE = 0.005;
const PREDATOR_GROWTH_RATE = 0.000001;

// Prey class
class Prey {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.radius = 5;
  }

  update() {
    this.position.add(this.velocity);
    this.wrapAround();
  }

  display() {
    fill(0, 255, 0); // Green for prey
    ellipse(this.position.x, this.position.y, this.radius * 2, this.radius * 2);
  }

  wrapAround() {
    if (this.position.x < 0) {
      this.position.x = width;
    } else if (this.position.x > width) {
      this.position.x = 0;
    }

    if (this.position.y < 0) {
      this.position.y = height;
    } else if (this.position.y > height) {
      this.position.y = 0;
    }
  }
}

// Predator class
class Predator {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(random(-1, 1), random(-1, 1)); // Fix: Initialize random velocity
    this.radius = 10;
    this.isEating = false;
    this.eatTimer = 0;
  }

  update(preyPopulation) {
    if (this.isEating) {
      this.eatTimer++;
      if (this.eatTimer > 60) { // Eating duration
        this.isEating = false;
        this.eatTimer = 0;
      }
    } else {
      this.position.add(this.velocity);
      this.wrapAround();
    }
    
    this.eatPrey(preyPopulation);
  }

  display() {
    fill(255, 0, 0); // Red for predators
    ellipse(this.position.x, this.position.y, this.radius * 2, this.radius * 2);
  }

  wrapAround() {
    if (this.position.x < 0) {
      this.position.x = width;
    } else if (this.position.x > width) {
      this.position.x = 0;
    }

    if (this.position.y < 0) {
      this.position.y = height;
    } else if (this.position.y > height) {
      this.position.y = 0;
    }
  }
  
  eatPrey(preyPopulation) {
    for (let i = preyPopulation.length - 1; i >= 0; i--) {
      const prey = preyPopulation[i];
      const distance = dist(this.position.x, this.position.y, prey.position.x, prey.position.y);
      if (distance < this.radius + prey.radius) {
        preyPopulation.splice(i, 1);
        this.isEating = true;
        break;
      }
    }
  }
}


// Variables
let preyPopulation;
let predatorPopulation;
let isPaused = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  preyPopulation = [];
  for (let i = 0; i < INITIAL_PREY_POPULATION; i++) {
    preyPopulation.push(new Prey(random(width), random(height)));
  }

  predatorPopulation = [];
  for (let i = 0; i < INITIAL_PREDATOR_POPULATION; i++) {
    predatorPopulation.push(new Predator(random(width), random(height)));
  }
}

function draw() {
  background(220);
  
  if (!isPaused) {
    // Update and display prey population
    for (let prey of preyPopulation) {
      prey.update();
      prey.display();
    }

    // Update and display predator population
    for (let predator of predatorPopulation) {
      predator.update(preyPopulation);
      predator.display();
    }

    // Prey growth
    const preyGrowth = preyPopulation.length * PREY_GROWTH_RATE;
    for (let i = 0; i < preyGrowth; i++) {
      preyPopulation.push(new Prey(random(width), random(height)));
    }

    // Predator death
    const predatorDeath = predatorPopulation.length * PREDATOR_DEATH_RATE;
    predatorPopulation.splice(0, predatorDeath);

    // Predator growth based on prey availability
    const maxPredatorGrowth = preyPopulation.length * PREDATOR_GROWTH_RATE;
    const predatorGrowth = min(maxPredatorGrowth, preyPopulation.length);
    for (let i = 0; i < predatorGrowth; i++) {
      predatorPopulation.push(new Predator(random(width), random(height)));
    }
  }

  // Display population numbers
  fill(0);
  text("Prey Population: " + preyPopulation.length, 20, 20);
  text("Predator Population: " + predatorPopulation.length, 20, 40);
}

function keyPressed() {
  if (key === ' ') {
    isPaused = !isPaused;
  }
}
