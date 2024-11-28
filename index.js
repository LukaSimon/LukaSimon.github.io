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
        wireframes: false, //to add colour
        width,
        height,
        background: 'pink'
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

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

    while(counter > 0) {
        const index = Math.floor(Math.random() * counter);

        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
};

//fill grid to be false
let grid = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal).fill(false));

let verticals = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal - 1).fill(false));

let horizontals = Array(cellsVertical - 1).fill(null).map(() => Array(cellsHorizontal).fill(false));

//Generate random starting cell
let startRow = Math.floor(Math.random() * cellsVertical);
let startColumn = Math.floor(Math.random() * cellsHorizontal);


const mazeAlgorithm = (row, column) => {
    // If i have visited the cell at [row, column], then return
    if(grid[row][column]) {
        return;
    }

    // Mark this cell as being visited
    grid[row][column] = true;

    // Assemble randomly-ordered list of neighbors
    const neighbors = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1  , 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);

    // For each neighbor...
    for(let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor;

        // see if that neighbor is out of bounds
        if(nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
            continue;
        }

        // if we have visited that neighbor, continue to next neighbor
        if(grid[nextRow][nextColumn]) {
            continue;
        }

        // remove a wall from either verticals or horizontals
        if(direction === 'left') {
            verticals[row][column - 1] = true;
        } else if(direction === 'right') {
            verticals[row][column] = true;
        } else if(direction === 'up') {
            horizontals[row - 1][column] = true;
        } else if(direction === 'down') {
            horizontals[row][column] = true;
        }

        // visit that next cell
        mazeAlgorithm(nextRow, nextColumn);
    }   
}

mazeAlgorithm(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if(open) {
            return;
        }

        let wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX, 
            5,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'black'
                }
            }
        );
        World.add(world, wall);
    })
});

verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if(open) {
            return;
        }

        let wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            5,
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
    })
});

//Goal
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
        },
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
        render: {
            fillStyle: 'white'
        }
    }
);
World.add(world, ball);

document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity;

    if(event.key === 'w') {
        Body.setVelocity(ball, { x, y: y - 5 });
    }
    if(event.key === 'd') {
        Body.setVelocity(ball, { x: x + 5, y });
    } 
    if(event.key === 's') {
        Body.setVelocity(ball, { x, y: y + 5 });
    } 
    if(event.key === 'a') {
        Body.setVelocity(ball, { x: x - 5, y });
    }
})

function win() {
    Events.on(engine, 'collisionStart', event => {
        event.pairs.forEach((collision) => {
            const labels = ['ball', 'goal'];
    
            if(labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
                document.querySelector('.winner').classList.remove('hidden');
                world.gravity.y = 1;
                world.bodies.forEach(body => {
                    if(body.label === 'wall') {
                        Body.setStatic(body, false);
                    }
                })
            }
        });
    });
}

//Goal
createGoal();

// Win condition
win();

function createMaze() {
    World.clear(world);

    World.add(world, MouseConstraint.create(engine, {
        mouse: Mouse.create(render.canvas)
    }));

    createOuterWalls();

    //fill grid to be false
    grid = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal).fill(false));

    verticals = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal - 1).fill(false));

    horizontals = Array(cellsVertical - 1).fill(null).map(() => Array(cellsHorizontal).fill(false));

    //Generate random starting cell
    startRow = Math.floor(Math.random() * cellsVertical);
    startColumn = Math.floor(Math.random() * cellsHorizontal);

    mazeAlgorithm(startRow, startColumn);

    //Walls
    horizontals.forEach((row, rowIndex) => {
        row.forEach((open, columnIndex) => {
            if(open) {
                return;
            }
    
            let wall = Bodies.rectangle(
                columnIndex * unitLengthX + unitLengthX / 2,
                rowIndex * unitLengthY + unitLengthY,
                unitLengthX, 
                5,
                {
                    label: 'wall',
                    isStatic: true,
                    render: {
                        fillStyle: 'black'
                    }
                }
            );
            World.add(world, wall);
        })
    });
    
    verticals.forEach((row, rowIndex) => {
        row.forEach((open, columnIndex) => {
            if(open) {
                return;
            }
    
            let wall = Bodies.rectangle(
                columnIndex * unitLengthX + unitLengthX,
                rowIndex * unitLengthY + unitLengthY / 2,
                5,
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
        })
    });

    //Goal
    createGoal();

    // Ball
    ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
    ball = Bodies.circle(
        unitLengthX / 2,
        unitLengthY / 2,
        ballRadius,
        { 
            label: 'ball',
            render: {
                fillStyle: 'white'
            }
        }
    );
    World.add(world, ball);

    document.addEventListener('keydown', event => {
        const { x, y } = ball.velocity;
    
        if(event.key === 'w') {
            Body.setVelocity(ball, { x, y: y - 5 });
        }
        if(event.key === 'd') {
            Body.setVelocity(ball, { x: x + 5, y });
        } 
        if(event.key === 's') {
            Body.setVelocity(ball, { x, y: y + 5 });
        } 
        if(event.key === 'a') {
            Body.setVelocity(ball, { x: x - 5, y });
        }
    })

    // Win condition
    win();
}

const func = document.querySelector('.reset');

func.addEventListener('click', () => {
    document.querySelector('.winner').classList.add('hidden');
    world.gravity.y = 0;
    createMaze();
})
