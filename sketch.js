// to do list
// ray casting
// stamina fix
// reproduction

// Constants
const INITIAL_PREY_POPULATION = 100;
const INITIAL_PREDATOR_POPULATION = 5;

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
  }

  update() {
    this.x += cos(this.dir) * this.vel;
    this.y += sin(this.dir) * this.vel;
    this.wrapAround();
  }

  display() {
    fill(0, 255, 0); // Green for prey
    circle(this.x, this.y, this.size);
  }

  wrapAround() {
    if (this.x < 0) {
      this.x = width;
    } else if (this.x > width) {
      this.x = 0;
    }

    if (this.y < 0) {
      this.y = height;
    } else if (this.y > height) {
      this.y = 0;
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
  }

  update(preyPopulation) {
    if (this.isEating) {
      this.eatTimer++;
      if (this.eatTimer > 60) { // Eating duration
        this.isEating = false;
        this.eatTimer = 0;
      }
    } 
    else {
      this.x += cos(this.dir) * this.vel;
      this.y += sin(this.dir) * this.vel;
      this.wrapAround();
    }

    this.x += cos(this.dir) * this.vel;
    this.y += sin(this.dir) * this.vel;
    
    this.eatPrey(preyPopulation);
  }

  display() {
    fill(255, 0, 0); // Red for predators
    circle(this.x, this.y, this.size);
  }

  wrapAround() {
    if (this.x < 0) {
      this.x = width;
    } else if (this.x > width) {
      this.x = 0;
    }

    if (this.y < 0) {
      this.y = height;
    } else if (this.y > height) {
      this.y = 0;
    }
  }
  
  eatPrey() {
    for (let i = preyPopulation.length - 1; i >= 0; i--) {
      const prey = preyPopulation[i];
      const distance = dist(this.x, this.y, prey.x, prey.y);
      if (distance < this.radius + prey.radius) {
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
    pushPrey()
  }

  for (let i = 0; i < INITIAL_PREDATOR_POPULATION; i++) {
    pushPredator();
  }
}

function draw() {
  background(220);
  // Update and display prey population
  if (!isPaused) {  
    updatePreys();
    updatePredators();
  }
  
  if (frameCount % 2 === 0) {
    pushPrey();
  } 
  if (frameCount % 4 === 0) {
    pushPredator();
  }
  
  displayStats()
}

function displayStats() {
  fill(0);
  text("Prey Population: " + preyPopulation.length, 20, 20);
  text("Predator Population: " + predatorPopulation.length, 20, 40);
}

function pushPrey(x, y, dir, vel, stamina, size) {
  preyPopulation.push(new Prey(random(width), random(height), random(1, 3), random(360), 100, 5));
}

function pushPredator() {
  predatorPopulation.push(new Predator(random(width), random(height), random(1,3), random(0, 360), 0, 10));
}

function updatePreys() {
  for (let prey of preyPopulation) {
    prey.update();
    prey.display();
  }
}


function updatePredators() {
  if (!isPaused) {
    for (let predator of predatorPopulation) {
        predator.update();
        predator.display();
    }
  }
}

function keyPressed() {
  if (key === ' ') {
    isPaused = !isPaused;
  }
}
