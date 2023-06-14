// TODO LIST
// Add raycasting to prey
// add raycasting to predators
// add reproduction system for both organisms
// add threat detection for prey - might be working already
// add movement smoothing
// add stamina regeneration for preadtor?
// improve predator eating prey

// Constants
const INITIAL_PREY_POPULATION = 300;
const INITIAL_PREDATOR_POPULATION = 30;



// Variables
let preyPopulation = [];
let predatorPopulation = [];
let isPaused = false; 
let debugMode = true;
let gridSizeChanged = false;

let collided, rayX, rayY, rayDir;

let grid = [];
let gridBoxSize = 30;
let xGrids, yGrids;


// Prey class 
class Prey {
  constructor(x, y, vel, dir, maxSpeed, hearing, stamina, staminaRechargeTime) {
    this.startTime = null;
    this.x = x;
    this.y = y;
    this.vel = vel;
    this.dir = dir;
    this.stamina = stamina;
    this.staminaCapacity = stamina;
    this.staminaRechargeTime = staminaRechargeTime; 
    this.size = 6;
    this.staminaUse = 1;
    this.gridX = floor(this.x / gridBoxSize) + 1;
    this.gridY = floor(this.y / gridBoxSize) + 1;
    this.alive = true;
    this.hearing = hearing;
    this.maxSpeed = maxSpeed;
  }

  resetStamina() {
    this.stamina = this.staminaCapacity;
    this.startTime = null;
  }

  update(index) {
    if (this.stamina > 0) {
      this.x += cos(this.dir) * this.vel;
      this.y += sin(this.dir) * this.vel;
      this.stamina -= this.staminaUse;
    }

    // else {
      else if (this.startTime === null) {
        this.startTime = new Date().getTime();
      } else if (new Date().getTime() - this.startTime >= this.staminaRechargeTime) {
        this.resetStamina();
    }
    this.distanceCheck();

    wrapAround(this);

    if (floor(this.x / gridBoxSize) !== this.gridX || floor(this.y / gridBoxSize) !== this.gridY) {
      let gridIndex = grid[this.gridY][this.gridX].indexOf(index);
      grid[this.gridY][this.gridX].splice(gridIndex, 1);
      
      this.gridX = floor(this.x / gridBoxSize);
      this.gridY = floor(this.y / gridBoxSize);
      try {
        grid[this.gridY][this.gridX].push(index);
      }
      catch(err) {
        console.log(grid[this.gridY][this.gridX], this.gridX, this.gridY);
      }
    }
  }

  display() {
    // fill(0, 255, 0); // Green for prey
    // circle(this.x, this.y, this.size);
    const shade = map(this.stamina, 0, this.staminaCapacity, 0, 225);
    fill(75, 255, shade); 
    circle(this.x, this.y, this.size);
  }

  distanceCheck() {
    for (let predator of predatorPopulation) {
      if (dist(this.x, this.y, predator.x, predator.y) < this.hearing) {
        this.dir = (Math.atan2(predator.y - this.y, predator.x - this.x) * 180/Math.PI) + 180;
        this.vel = 1;
      }
    }
  }

  castRay(dir) {
    let collided = false;
    // for (let theta = dir - 30; theta < dir + 30; theta += 5) {
    //   let rayx = this.x;
    //   let rayy = this.y;
    // }
  }
}

// Predator class
class Predator {

  constructor(x, y, vel, dir, maxSpeed, sight, fov, stamina) {
    this.x = x;
    this.y = y;
    this.vel = vel;
    this.dir = dir;
    this.stamina = stamina;
    this.staminaCapacity = stamina;
    this.size = 10;
    this.isEating = false;
    this.eatTimer = 0;
    this.staminaUse = 1;
    this.alive = true;
    this.maxSpeed = maxSpeed;
    this.sight = sight;
    this.fov = fov;

  }

  update() {
    if (this.stamina > 0) {    
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
      }

      if (this.vel <= 0.00000000001) {
        this.stamina -= this.staminaUse * 0.5;
      }
      else {
        this.stamina -= this.staminaUse;
      }
    }

    // good
    collided = false;
    for (let i = 0; i <= this.fov; i++) {
      let tempDir = this.dir + i * 5;
      if (this.castRay(tempDir, this.sight)) {
        this.dir = tempDir;
        collided = true;
        break;
      }
      tempDir = this.dir - i * 5;
      if (this.castRay(tempDir, this.sight)) {
        this.dir = tempDir;
        collided = true;
        break;
      }
    }
    if (collided) {
      this.vel = this.maxSpeed;
    }
    else {
      this.vel = 0;
    }
    this.eatPrey(preyPopulation);

    wrapAround(this);

  }

  display() {

    const shade = map(this.stamina, 0, this.staminaCapacity, 0, 205);
    fill(0, 255, shade); 
    circle(this.x, this.y, this.size);
  }

  eatPrey() {

    for (let i of getCollidable(this.x, this.y, preyPopulation)) {
      let prey = preyPopulation[i];

      let distance = dist(this.x, this.y, prey.x, prey.y);
      if (distance < this.size/2 + prey.size/2) {
        preyPopulation[i].alive = false;
        this.isEating = true;
        this.stamina = this.staminaCapacity;
        break;
      }
    }
  }

  isDead() {
    return (this.stamina <= 0)
  }

  castRay(dir, range) {
    collided = false;
    rayX = this.x;
    rayY = this.y;
    rayDir = dir;
    

    for (let i = 0; i < range; i++) {
      rayX = wrapAround({x:rayX, y:rayY}).x;
      rayY = wrapAround({x:rayX, y:rayY}).y;
      for (let i of getCollidable(rayX, rayY, preyPopulation)) {
      // for (let i = 0; i < preyPopulation.length; i++) {
        let prey = preyPopulation[i] 
        try {
          if (dist(rayX, rayY, prey.x, prey.y) <= prey.size) {
            collided = true;  
            return (rayX, rayY, preyPopulation);
          }          
        }
        catch(error) {
          console.log(error)
          console.log(getCollidable(rayX, rayY, preyPopulation), preyPopulation.length)
        }

      }
      if (debugMode) {
        line(rayX, rayY, rayX + cos(dir) * 5, rayY + sin(dir) * 5);
      }
      rayX += cos(dir) * 6;
      rayY += sin(dir) * 6;
    }
    return (false);
  }

}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  colorMode(HSB, 255);

  for (let i = 0; i < INITIAL_PREY_POPULATION; i++) {
    pushPrey();
  }

  for (let i = 0; i < INITIAL_PREDATOR_POPULATION; i++) {
    pushPredator();
  }

  xGrids = ceil(width/gridBoxSize);
  yGrids = ceil(height/gridBoxSize);

  for (let y = 0; y < yGrids; y++) {
    grid.push([]);
    for (let x = 0; x < xGrids; x++) {
      grid[y].push([]);
    }
  }
}

function draw() {

  background('#4e6669');

  gridSizeChanged = false;

  if (debugMode) {
    push();
    stroke("white");
    noFill();
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        push();
        if (x === floor(grid[y].length - 1)) {
          stroke("orange");
        }
        rect(x * gridBoxSize, y * gridBoxSize, gridBoxSize, gridBoxSize);
        pop();
      }
    }
    pop();
  }
  
  if (!isPaused) {
    updatePrey();
    updatePredators();

  }

  displayStats();
}

function getCollidable(x, y, group) {

  gridX = floor(x / gridBoxSize);
  gridY = floor(y / gridBoxSize);
  let collidables = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let groupIndex of grid[constrain(gridY + dy, 0, yGrids - 1)][constrain(gridX + dx, 0, xGrids - 1)]) {
        collidables.push(groupIndex);
      }
    }
  }
  return collidables;



}

function displayStats() {
  fill(0);
  text("Prey Population: " + preyPopulation.length, 20, 20);
  text("Predator Population: " + predatorPopulation.length, 20, 40);
}

function pushPrey() {

  // x, y, vel, dir, maxSpeed, hearing, stamina, staminaRechargeTime

  preyPopulation.push(new Prey(random(30, width-30), random(30, height - 30), 0, random(360), 1, 30, random(300,500), random(1000, 1200)));
  
}

function pushPredator() {

  // x, y, vel, dir, maxSpeed, sight, fov, stamina
  predatorPopulation.push(new Predator(random(30, width- 30), random(30, height - 30), 0, random(0, 360), 1.5, 15, 3, random(500,700)));
}

function updatePrey() {

  
  // for (let i = 0; i < preyPopulation.length; i++) {
  //   if (!preyPopulation[i].alive) {
  //     preyPopulation.splice(i,1)
  //   }
  // }
  for (let i = 0; i < preyPopulation.length; i++) {
    if (! preyPopulation[i].alive) {
      gridSizeChanged = true;
      preyPopulation.splice(i, 1);      
    }
  }

  if (gridSizeChanged) {
    resetGrid();
  }

  for (let i = 0; i < preyPopulation.length; i++) {
    preyPopulation[i].update(i);
    preyPopulation[i].display();
    // wrapAround(preyPopulation[i]);  
  }



}

function updatePredators() {
  // for (let predator of predatorPopulation) {
  //   predator.update(preyPopulation);
  //   predator.display();      
  // }
  for (let i = predatorPopulation.length - 1; i >= 0; i--) {
    predatorPopulation[i].update(preyPopulation);
    predatorPopulation[i].display();
    if (predatorPopulation[i].isDead()) {
      predatorPopulation.splice(i, 1);
    }
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
  return thing;
}

function resetGrid() {
  grid = [];
  for (let y = 0; y < yGrids; y++) {
    grid.push([]);
    for (let x = 0; x < xGrids; x++) {
      grid[y].push([]);
    }
  }

  for (let i = 0; i < preyPopulation.length; i++) {
    let prey = preyPopulation[i];
    preyPopulation[i].gridX = floor(prey.x / gridBoxSize);
    preyPopulation[i].gridY = floor(prey.y / gridBoxSize);

    grid[prey.gridY][prey.gridX].push(i);

  }
}

