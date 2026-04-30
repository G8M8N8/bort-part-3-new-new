// Image used for maze wall rows.
let wallImg;
// Background image.
let bgImg;
// Array that holds all maze wall rows.
let walls = [];
// How fast the maze walls move downward.
let wallSpeed = 7;
// Scale factor for the wall texture image.
let wallScale = 0.02;
// The height of each wall row after scaling.
let wallThickness = 36;
// Distance between consecutive wall rows.
let wallSpacing = 250;
// Minimum width of the gap in a wall row.
let gapMin = 90;
// Maximum width of the gap in a wall row.
let gapMax = 550;
// Player position and collision radius.
let player = { x: 0, y: 0, radius: 10 };
// Starting coordinates for the player after a reset.
let startX, startY;
// How many wall rows to create.
let totalWalls = 12;
let bort1, bort2, kiwi, spacewin, bortwin;
let gameFrames = 0;
let link;
let overlayTimer = 0;

function preload() {
  // Load the background gif.
  bgImg = loadImage('spacegif.gif', () => {}, () => {
    console.warn('Failed to load spacegif.gif');
    bgImg = null;
  });
  // Try the Adventure-relative path first, then the root-relative path.
  wallImg = loadImage('ph3.png', () => {}, () => {
    console.warn('Failed to load ph3.png, trying ph3.png');
    wallImg = loadImage('ph3.png', () => {}, () => {
      console.error('Failed to load ph3.png as well. Falling back to a simple wall color.');
      wallImg = null;
    });
  });

bort1 = loadImage("bortship.png");
bort2 = loadImage("bortship2.jpeg"); 
kiwi = loadImage("kiwi1.png");
spacewin = loadImage("spacewinpic.jpg");
bortwin = loadImage("bortwin.png");
}

function setup() {
  // Create a responsive sketch canvas using the browser window size.
  createCanvas(windowWidth, windowHeight);

  // Use the scaled image height for each wall row if available.
  if (wallImg && wallImg.height) {
    wallThickness = wallImg.height * wallScale;
  } else {
    wallThickness = 36;
  }
  // Set the player start position horizontally centered.
  startX = width / 2;
  // Set the player start position near the bottom.
  startY = height - 50;
  // Initialize the maze wall rows.
  initWalls();
  frameRate(60);

  link = createA('https://example.com', 'Go to the next adventure!');
  link.attribute('target', '_blank');
  link.position(width / 2 - 80, height * 0.3);
  link.style('display', 'none');
  link.style('background-color', '#c428a5');
  link.style('color', '#ffffff');
  link.style('padding', '10px 18px');
  link.style('border-radius', '8px');
  link.style('text-decoration', 'none');
  link.style('font-size', '16px');
  link.style('font-family', 'sans-serif');
  link.style('border', '2px solid #000');
}

function windowResized() {
  // Resize the canvas when the browser window changes size.
  resizeCanvas(windowWidth, windowHeight);
  // Re-center the player and recreate maze rows for the new dimensions.
  startX = width / 2;
  startY = height - 50;
  initWalls();
  if (link) {
    link.position(width / 2 - 80, height * 0.75);
  }
}

function initWalls() {
  // Reset the walls array.
  walls = [];
  // Start the first wall row above the screen.
  let y = -wallThickness;
  // Create the initial set of wall rows.
  for (let i = 0; i < totalWalls; i++) {
    // Pick a random gap width for this row.
    let gapWidth = random(gapMin, gapMax);
    // Pick a random horizontal position for the gap.
    let gapX = random(20, width - gapWidth - 20);
    // Add the wall row data to the array.
    walls.push({ y, gapX, gapWidth });
    // Move the next row further up.
    y -= wallSpacing;
  }
}


function draw() {
  gameFrames++;

  if (gameFrames <= 100) {
    // Draw the background gif stretched to fill the canvas.
    image(bgImg, 0, 0, width, height);
    // Move the wall rows downward.
    moveWalls();
    // Draw the maze walls.
    drawMazeWalls();
    // Update the player position and collision state.
    updatePlayer();
    // Draw the player marker.
    drawPlayer();
    // Draw the HUD text.
    drawHUD();

    if (link) {
      link.hide();
    }
  }

  if (gameFrames > 100) {
    image(spacewin, 0, 0, width, height);
    fill(255);
    textSize(50);
    textAlign(CENTER, TOP);
    text("You escaped! Good job!", width / 2, 50);
    image(bortwin, 400, 250, 800, 800);
    if (link) {
      link.show();
    }
  }
}



function moveWalls() {
  // Find the highest wall row y position.
  let topY = min(walls.map((wall) => wall.y));
  // Move each wall row down.
  for (let wall of walls) {
    wall.y += wallSpeed;
    // If the row has moved past the bottom, recycle it to the top.
    if (wall.y > height) {
      wall.y = topY - wallSpacing;
      wall.gapWidth = random(gapMin, gapMax);
      wall.gapX = random(20, width - wall.gapWidth - 20);
      topY = wall.y;
    }
  }
}

function drawMazeWalls() {
  // Draw every wall row using the loaded image, tiled at the chosen scale.
  noStroke();
  let tileWidth = wallImg && wallImg.width ? wallImg.width * wallScale : 40;
  let tileHeight = wallImg && wallImg.height ? wallImg.height * wallScale : wallThickness;

  for (let wall of walls) {
    // Draw left wall segment tiled horizontally.
    if (wall.gapX > 0) {
      if (wallImg) {
        for (let x = 0; x < wall.gapX; x += tileWidth) {
          image(wallImg, x, wall.y, tileWidth, tileHeight);
        }
      } else {
        fill(45, 110, 180);
        rect(0, wall.y, wall.gapX, wallThickness);
      }
    }

    // Draw right wall segment tiled horizontally.
    let rightX = wall.gapX + wall.gapWidth;
    let rightWidth = width - rightX;
    if (rightWidth > 0) {
      if (wallImg) {
        for (let x = rightX; x < width; x += tileWidth) {
          image(wallImg, x, wall.y, tileWidth, tileHeight);
        }
      } else {
        fill(45, 110, 180);
        rect(rightX, wall.y, rightWidth, wallThickness);
      }
    }

    // The gap is left transparent so the background shows through.
  }
}

function updatePlayer() {
  // Move the player to the mouse position.
  player.x = constrain(mouseX, player.radius, width - player.radius);
  player.y = constrain(mouseY, player.radius, height - player.radius);

  // Check for collisions with the maze walls.
  if (playerHitsWall()) {
    overlayTimer = 30;
    startReset();
  }
}

function playerHitsWall() {
  // Check each wall row the player overlaps.
  let left = player.x - player.radius;
  let right = player.x + player.radius;
  for (let wall of walls) {
    if (player.y + player.radius > wall.y && player.y - player.radius < wall.y + wallThickness) {
      let gapLeft = wall.gapX;
      let gapRight = wall.gapX + wall.gapWidth;
      // If the player's full circle is not completely inside the opening, it's a hit.
      if (!(left >= gapLeft && right <= gapRight)) {
        return true;
      }
    }
  }
  return false;
}

function startReset() {
  // Reset the player position to start and reinitialize the maze.
  gameFrames = 0;
  player.x = startX;
  player.y = startY;
  initWalls();
}

function drawPlayer() {
  // Draw the player as a white circle.
  fill(255);
  stroke(0);
  strokeWeight(2);
  //ellipse(player.x, player.y, player.radius * 2);
 image(bort1, player.x, player.y, 75, 100);

 image(kiwi, player.x-10, player.y+150, 100, 100);
}

function drawHUD() {
  // Draw text instructions.
  noStroke();
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);

  // Draw a start zone bar at the bottom.
 // fill(120, 220, 220, 120);
 // rect(0, height - 44, width, 44);
  //fill(255);
  //textAlign(CENTER, CENTER);
  //textSize(18);
  //text('Start zone', width / 2, height - 22);
}

//function Win(){
//fill(255);
//ellipse(50, 50, 50, 50);


//}