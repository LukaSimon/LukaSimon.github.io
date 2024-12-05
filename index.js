const { Engine, Render, Runner, World, Bodies, Body, Events, MouseConstraint, Mouse } = Matter;

const cellsHorizontal = 10;
const cellsVertical = 8;
const width = window.innerWidth - 4;
const height = window.innerHeight - 4;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

let engine = Engine.create();
engine.world.gravity.y = 0;
let { world } = engine;
let render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false, // to add colour
        width,
        height,
        background: 'pink'
    }
});

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

// Set a smaller time step for better collision detection
engine.timing.timeScale = 0.9;

World.add(world, MouseConstraint.create(engine, {
    mouse: Mouse.create(render.canvas)
}));

// Walls
function createOuterWalls() {
    let walls = [
        Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
        Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
        Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
        Bodies.rectangle(width, height / 2, 2, height, { isStatic: true })
    ];
    World.add(world, walls);
}
createOuterWalls();

// Maze Generation
const shuffle = (arr) => {
    let counter = arr.length;

    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);

        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
};

// Fill grid to be false
let grid = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal).fill(false));

let verticals = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal - 1).fill(false));

let horizontals = Array(cellsVertical - 1).fill(null).map(() => Array(cellsHorizontal).fill(false));

// Generate random starting cell
let startRow = Math.floor(Math.random() * cellsVertical);
let startColumn = Math.floor(Math.random() * cellsHorizontal);

const mazeAlgorithm = (row, column) => {
    // If I have visited the cell at [row, column], then return
    if (grid[row][column]) {
        return;
    }

    // Mark this cell as being visited
    grid[row][column] = true;

    // Assemble randomly-ordered list of neighbors
    const neighbors = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);

    // For each neighbor...
    for (let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor;

        // See if that neighbor is out of bounds
        if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
            continue;
        }

        // If we have visited that neighbor, continue to next neighbor
        if (grid[nextRow][nextColumn]) {
            continue;
        }

        // Remove a wall from either verticals or horizontals
        if (direction === 'left') {
            verticals[row][column - 1] = true;
        } else if (direction === 'right') {
            verticals[row][column] = true;
        } else if (direction === 'up') {
            horizontals[row - 1][column] = true;
        } else if (direction === 'down') {
            horizontals[row][column] = true;
        }

        // Visit that next cell
        mazeAlgorithm(nextRow, nextColumn);
    }
};

mazeAlgorithm(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }

        let wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            10, // Increased thickness
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'black'
                }
            }
        );
        World.add(world, wall);
    });
});

verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }

        let wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            10, // Increased thickness
            unitLengthY,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'black'
                }
            }
        );
        World.add(world, wall);
    });
});

// Goal
function createGoal() {
    const goal = Bodies.rectangle(
        width - unitLengthX / 2,
        height - unitLengthY / 2,
        unitLengthX * 0.7,
        unitLengthY * 0.7,
        {
            label: 'goal',
            isStatic: true,
            render: {
                fillStyle: 'green'
            }
        }
    );
    World.add(world, goal);
}

// Ball
let ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
let ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    ballRadius,
    { 
        label: 'ball',
        restitution: 0.5, // Makes the ball bounce a bit
        friction: 0.01,   // Reduces friction with surfaces
        frictionAir: 0.02, // Adds slight air resistance
        slop: 0.01,       // Improves collision detection accuracy
        render: {
            fillStyle: 'white'
        }
    }
);
World.add(world, ball);

// Limit ball velocity
Events.on(engine, 'beforeUpdate', () => {
    const maxVelocity = 10; // Set a maximum velocity
    if (Math.abs(ball.velocity.x) > maxVelocity) {
        Body.setVelocity(ball, { x: Math.sign(ball.velocity.x) * maxVelocity, y: ball.velocity.y });
    }
    if (Math.abs(ball.velocity.y) > maxVelocity) {
        Body.setVelocity(ball, { x: ball.velocity.x, y: Math.sign(ball.velocity.y) * maxVelocity });
    }
});

document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity;

    if (event.key === 'w') {
        Body.setVelocity(ball, { x, y: y - 5 });
    }
    if (event.key === 'd') {
        Body.setVelocity(ball, { x: x + 5, y });
    }
    if (event.key === 's') {
        Body.setVelocity(ball, { x, y: y + 5 });
    }
    if (event.key === 'a') {
        Body.setVelocity(ball, { x: x - 5, y });
    }
});

function win() {
    Events.on(engine, 'collisionStart', event => {
        event.pairs.forEach((collision) => {
            const labels = ['ball', 'goal'];

            if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
                document.querySelector('.winner').classList.remove('hidden');
                world.gravity.y = 1;
                world.bodies.forEach(body => {
                    if (body.label === 'wall') {
                        Body.setStatic(body, false);
                    }
                });
            }
        });
    });
}

// Goal
createGoal();

// Win condition
win();
