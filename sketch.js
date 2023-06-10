// TODO LIST
// Add raycasting to prey
// add raycasting to predators
// add reproduction system for both organisms
// add threat detection for prey
// add movement smoothing
// add stamina regeneration
// improve predator eating prey

// Constants
const INITIAL_PREY_POPULATION = 100;
const INITIAL_PREDATOR_POPULATION = 15;
const PREY_STANIMA_DECREASE_RATE = 1;

// Variables
let preyPopulation = [];
let predatorPopulation = [];
let isPaused = false;

// Prey class
class Prey {
  constructor(x, y, vel, dir, stamina, size) {
    this.x = x;
    this.y = y;
    this.vel = vel;
    this.dir = dir;
    this.stamina = stamina;
    this.size = size;
    this.staminaUse = 0.01; // normally 1
    this.threats = [];
  }

  update() {
    if (this.stamina > 0) {
      this.x += cos(this.dir) * this.vel;
      this.y += sin(this.dir) * this.vel;

      this.stamina -= this.staminaUse;
    }

    // else {
    //   this.stamina += this.staminaUse
    // }
    this.distanceCheck();
  }

  display() {
    fill(0, 255, 0); // Green for prey
    circle(this.x, this.y, this.size);
  }

  distanceCheck() {
    for (let predator of predatorPopulation) {
      if (dist(this.x, this.y, predator.x, predator.y) < 50) {
        this.dir = (Math.atan2(predator.y - this.y, predator.x - this.x) * 180/Math.PI) + 180;
        this.vel = 1;
      }
    }
    
    
  }

  castRay(dir) {
    let collided = false;
    for (let theta = dir - 30; theta < dir + 30; theta += 5) {
      let rayx = this.x;
      let rayy = this.y;

    }
  }
}

// Predator class
class Predator {
  constructor(x, y, vel, dir, stamina, size) {
    this.x = x;
    this.y = y;
    this.vel = vel;
    this.dir = dir;
    this.stamina = stamina;
    this.size = size;
    this.isEating = false;
    this.eatTimer = 0;
    this.staminaUse = 0.5;
  }

  update(preyPopulation) {
    if (this.stamina > 0) {
      if (this.isEating) {
        this.eatTimer++;
        if (this.eatTimer > 60)   { // Eating duration
          this.isEating = false;
          this.eatTimer = 0;
        }
      } else {
        this.x += cos(this.dir) * this.vel;
        this.y += sin(this.dir) * this.vel;

      
      }
      this.stamina -= this.staminaUse;
    }
    
    this.eatPrey(preyPopulation);
  }

  display() {
    fill(255, 0, 0); // Red for predators
    circle(this.x, this.y, this.size);
  }

  eatPrey() {
    for (let i = preyPopulation.length - 1; i >= 0; i--) {
      const prey = preyPopulation[i];
      const distance = dist(this.x, this.y, prey.x, prey.y);
      if (distance < this.size + prey.size) {
        preyPopulation.splice(i, 1);
        this.isEating = true;
        break;
      }
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  for (let i = 0; i < INITIAL_PREY_POPULATION; i++) {
    pushPrey();
  }

  for (let i = 0; i < INITIAL_PREDATOR_POPULATION; i++) {
    pushPredator();
  }
}

function draw() {
  background('grey');
  
  if (!isPaused) {
    updatePrey();
    updatePredators();

  }

  displayStats();
}

function displayStats() {
  fill(0);
  text("Prey Population: " + preyPopulation.length, 20, 20);
  text("Predator Population: " + predatorPopulation.length, 20, 40);
}

function pushPrey() {
  preyPopulation.push(new Prey(random(width), random(height), 2, random(360), 100, 5));
}

function pushPredator() {
  predatorPopulation.push(new Predator(random(width), random(height), 0, random(0, 360), 0, 10));
}

function updatePrey() {
  for (let prey of preyPopulation) {
    prey.update();
    prey.display();
    wrapAround(prey);
  }
}

function updatePredators() {
  for (let predator of predatorPopulation) {
    predator.update(preyPopulation);
    predator.display();
    wrapAround(predator);
  }
}

function keyPressed() {
  if (key === " ") {
    isPaused = !isPaused;
  }
}

function wrapAround(thing) {
  if (thing.x < 0) {
    thing.x = width;
  } else if (thing.x > width) {
    thing.x = 0;
  }

  if (thing.y < 0) {
    thing.y = height;
  } else if (thing.y > height) {
    thing.y = 0;
  }
}