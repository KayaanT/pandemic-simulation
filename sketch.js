// Constants
const INITIAL_PREY_POPULATION = prompt("How many prey would you like to start with?", 200);
const INITIAL_PREDATOR_POPULATION = prompt("How many predators would you like to start with?", 50);
// const INITIAL_PREY_POPULATION = 400;
// const INITIAL_PREDATOR_POPULATION = 100;

const PREY_POPULATION_CAP = 1500;
const PREDATOR_POPULATION_CAP = 1500;

// Variables
let preyPopulation = [];
let predatorPopulation = [];
let newPreyAdd = [];
let isPaused = false; 
let debugMode = false;
let gridSizeChanged = false;
let simuationSpeed = 4;

let collided, rayX, rayY, rayDir;

let grid = [];
let gridBoxSize = 19;
let xGrids, yGrids;


// Prey class 
class Prey {
  constructor(x, y, vel, dir, maxSpeed, hearing, stamina, staminaRechargeTime) {
    this.startTime = null;
    this.x = x;
    this.y = y;
    this.gridX = floor(this.x / gridBoxSize) + 0;
    this.gridY = floor(this.y / gridBoxSize) + 0;    
    this.vel = vel;
    this.dir = dir;
    this.wantsSeggs = false;
    this.seggsTimer = random(30);
    this.staminaUse = 1;    
    this.alive = true;
    this.size = 6;

    this.maxSpeed = maxSpeed;
    this.hearing = hearing;
    this.stamina = random(stamina);
    this.staminaCapacity = stamina;
    this.staminaRechargeTime = staminaRechargeTime; 
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

    this.searchForMate();

  }

  display() {
    // fill(0, 255, 0); // Green for prey
    // circle(this.x, this.y, this.size);
    const shade = map(this.stamina, 0, this.staminaCapacity, 0, 225);
    fill(75, 255, shade); 

    rect(this.x, this.y, this.size,this.size);
    square
  }

  searchForMate() {
    if (this.wantsSeggs) {
      for (let otherPreyIndex of getCollidable(this.x, this.y, preyPopulation)) {
        let otherPrey = preyPopulation[otherPreyIndex];
        if (otherPrey !== this && otherPrey.wantsSeggs) {
          if (dist(this.x, this.y, otherPrey.x, otherPrey.y) < 150) {
            this.dir = Math.atan2(otherPrey.y - this.y, otherPrey.x - this.x) * (180/Math.PI);
            if (dist(this.x, this.y, otherPrey.x, otherPrey.y) < (this.size + otherPrey.size)/2) {
              this.wantsSeggs = false;
              otherPrey.wantsSeggs = false;
              //random(30, width-30), random(30, height - 30), 1, random(360), 1, 30, random(300,500), random(1000, 1200);

              if (preyPopulation.length < PREY_POPULATION_CAP) {
                gridSizeChanged = true;
                // x, y, vel, dir, maxSpeed, hearing, stamina, staminaRechargeTime
                newPreyAdd.push(new Prey(
                  (this.x + otherPrey.x)/2,
                  (this.y + otherPrey.y)/2,
                  1,
                  random(0,360),
                  (this.maxSpeed + otherPrey.maxSpeed)/2 + random(-150,151)/1000,
                  round((this.hearing + otherPrey.hearing)/2) + random(-100,101)/50,
                  round((this.staminaCapacity + otherPrey.staminaCapacity)/2) + random(-20,21),
                  round((this.staminaRechargeTime + otherPrey.staminaRechargeTime)/2) + random(-80,81),
                ));
              }


              
            }
          }
        }
      }
    }
    else {
      this.seggsTimer += 1
      if (this.seggsTimer >= 330) {
        this.seggsTimer = random(30);
        this.wantsSeggs = true;
      }
    }
  }

  distanceCheck() {
    for (let predator of predatorPopulation) {
      if (dist(this.x, this.y, predator.x, predator.y) < this.hearing) {
        this.dir = (Math.atan2(predator.y - this.y, predator.x - this.x) * 180/Math.PI) + 180;
        this.vel = 1;
      }
      else {
        this.vel = 0.5;
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
    this.isEating = false;
    this.eatTimer = 0;
    this.wantsSeggs = false;
    this.seggsCounter = 0; // will mr sandor notice this
    this.staminaUse = 1;
    this.alive = true;
    this.size = 8;
    
    this.maxSpeed = maxSpeed;
    this.rayStepCount = sight;

    while (sight / this.rayStepCount <= 6) {
      this.rayStepCount--;
    }
    this.rayStepCount++;

    this.rayStepSize = sight/this.rayStepCount;
    this.rayStepCount
    this.sight = sight;
    this.fov = fov;
    this.stamina = stamina;
    this.staminaCapacity = stamina;


    }

  update() {
    if (this.stamina > 0) {    
      if (this.isEating) {
        this.eatTimer++;
        if (this.eatTimer > 50) { // Eating duration
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


    

    collided = false;
    for (let i = 0; i <= this.fov; i++) {
      let tempDir = this.dir + i * 8;
      if (this.castRay(tempDir)) {
        this.dir = tempDir;
        collided = true;
        break;
      }
      tempDir = this.dir - i * 8;
      if (this.castRay(tempDir)) {
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

    this.searchForMate();


  }

  display() {

    const shade = map(this.stamina, 0, this.staminaCapacity, 0, 205);
    fill(0, 255, shade); 

    rect(this.x, this.y, this.size, this.size);
  }

  eatPrey() {

    for (let i of getCollidable(this.x, this.y, preyPopulation)) {
      let prey = preyPopulation[i];

      let distance = dist(this.x, this.y, prey.x, prey.y);
      if (distance < this.size/2 + prey.size/2) {
        preyPopulation[i].alive = false;
        this.isEating = true;
        this.seggsCounter++;
        this.stamina = this.staminaCapacity;
        break;
      }
    }
  }

  isDead() {
    return (this.stamina <= 0)
  }

  searchForMate() {
    if (this.wantsSeggs) {
      for (let otherPredator of predatorPopulation) {
        if (otherPredator !== this && otherPredator.wantsSeggs) {
          if (dist(this.x, this.y, otherPredator.x, otherPredator.y) < 200) {
            this.dir = Math.atan2(otherPredator.y - this.y, otherPredator.x - this.x) * (180/Math.PI);
            if (dist(this.x, this.y, otherPredator.x, otherPredator.y) < (this.size + otherPredator.size)/2) {
              this.wantsSeggs = false;
              otherPredator.wantsSeggs = false;
              //random(30, width- 30), random(30, height - 30), 0, random(0, 360), 1.5, 15, 3, random(500,700);

              // x, y, vel, dir, maxSpeed, sight,  fov, stamina
              if (predatorPopulation.length < PREDATOR_POPULATION_CAP) {
                gridSizeChanged = true;
                
                predatorPopulation.push(new Predator(
                  (this.x + otherPredator.x)/2,
                  (this.y + otherPredator.y)/2,
                  0,
                  random(0,360),
                  (this.maxSpeed + otherPredator.maxSpeed)/2 + random(-100,101)/500,
                  round((this.sight + otherPredator.sight)/2) + random(-100,101)/50,
                  round((this.fov + otherPredator.fov)/2),
                  round((this.staminaCapacity + otherPredator.staminaCapacity)/2) + random(-50,51),
                ));                
              }


              
            }
          }
        }
      }
      this.vel = this.maxSpeed;
    }
    else {
      if (this.seggsCounter >= 2) {
        this.seggsCounter = 0;
        this.wantsSeggs = true;
      }
     
    }
  }

  castRay(dir, range) {
    collided = false;
    rayX = this.x;
    rayY = this.y;
    rayDir = dir;

    if (debugMode) {
      line(rayX, rayY, rayX + cos(dir) * this.rayStepSize * this.rayStepCount, rayY + sin(dir) * this.rayStepSize * this.rayStepCount);
    }
    

    for (let i = 0; i < this.rayStepCount; i++) {
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

      rayX += cos(dir) * this.rayStepSize;
      rayY += sin(dir) * this.rayStepSize;
    }
    return (false);
  }

}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  colorMode(HSB, 255);
  rectMode(CENTER);

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

    for (let i = 0; i < simuationSpeed; i++) {
      updatePrey();
      updatePredators();      
    }

    for (let i = predatorPopulation.length - 1; i >= 0; i--) {
      predatorPopulation[i].display();
    }
    for (let i = 0; i < preyPopulation.length; i++) {
      preyPopulation[i].display();
    }

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
  fill('blue');
  textSize(18)
  text("Prey Population: " + preyPopulation.length, 20, 30);
  text("Predator Population: " + predatorPopulation.length, 20, 50);
}

function pushPrey() {

  // x, y, vel, dir, maxSpeed, hearing, stamina, staminaRechargeTime

  preyPopulation.push(new Prey(random(30, width-30), random(30, height - 30), 1, random(360), 1, 14, random(650,750), random(900, 1000)));
  
}

function pushPredator() {

  //                                          x,                      y,              vel,      dir, maxSpeed, sight, fov, stamina
  predatorPopulation.push(new Predator(random(30, width- 30), random(30, height - 30), 0, random(0, 360), 1.7, 50, 5, random(400,450)));
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

  for (let newPrey of newPreyAdd) {
    preyPopulation.push(newPrey);
  }

  newPreyAdd = [];

  if (gridSizeChanged) {
    resetGrid();
  }

  for (let i = 0; i < preyPopulation.length; i++) {
    preyPopulation[i].update(i);

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
    if (predatorPopulation[i].isDead()) {
      predatorPopulation.splice(i, 1);
    }
  }
}

function keyPressed() {
  if (key === " ") {
    isPaused = !isPaused;
  }
  if (key === "d") { // ty <3
    debugMode = !debugMode
  }
  if (keyCode === UP_ARROW) {
    simuationSpeed++;
  }
  else if (keyCode === DOWN_ARROW) {
    simuationSpeed--;
  }
}

function wrapAround(thing) {
  if (thing.x < 0) {
    thing.x = width - 0;
  } else if (thing.x > width - 0) {
    thing.x = 0;
  }

  if (thing.y < 0) {
    thing.y = height - 0;
  } else if (thing.y > height - 0) {
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

