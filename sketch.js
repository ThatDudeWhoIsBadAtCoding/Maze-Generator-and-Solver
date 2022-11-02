let size = 50;
let maze;
let clr_r = 0;
let clr_g = 100;
let clr_b = 255;

function setup(){
    createCanvas(400, 400);
	
	const urlParams = new URLSearchParams(window.location.search)

	size = parseInt(urlParams.get('size')) || 20;
	clr_r = parseInt(urlParams.get('r')) || 0;
	clr_g = parseInt(urlParams.get('g')) || 100;
	clr_b = parseInt(urlParams.get('b')) || 255;

	
	document.getElementById("maze_s").value = size;
	document.getElementById("clr_r").value = clr_r;
	document.getElementById("clr_g").value = clr_g;
	document.getElementById("clr_b").value = clr_b;
	
	let rows = floor(width/size), cols = floor(height/size);
    maze = new Maze(size, rows, cols);
    //frameRate(30)
    maze.start = maze.current = maze.cells[0];
    maze.end = maze.cells[maze.cells.length-1];
    maze.openSet.push(maze.start);
	
	document.getElementById("show").disabled = true;
	document.getElementById("solve").disabled = true;
}

function hide()
{
    let settings = document.getElementById("settingsMenu")
	settings.style.width = "0%";
	settings.style.height = "0px";
	settings.style.borderRadius = "0px";
	settings.style.border = "0px solid black";
	document.getElementById("hide").disabled = true;
	document.getElementById("show").disabled = false;
}
function show()
{
    let settings = document.getElementById("settingsMenu")
	settings.style.width = "35%";
	settings.style.height = "300px";
	settings.style.borderRadius = "20px";
	settings.style.border = "1px solid black";
	document.getElementById("show").disabled = true;
	document.getElementById("hide").disabled = false;
}

function draw(){
    background(51)
    for(let i = 0; i < maze.cells.length; i++){
        maze.cells[i].show(color(clr_r,clr_g,clr_b,100));
    }
    maze.current.visited = true;
    // only highlights if the current cell is not the last one
    if(!(maze.current.x == maze.start.x + 1 || maze.current.y == maze.start.y + 1)){
        print(maze.current.x, maze.start.x)
        maze.current.highlight();
    }
    let next = maze.current.checkNeighbours();
    if(next){
        next.visited = true;
        maze.stack.push(maze.current);
        maze.removeWalls(maze.current, next);
        maze.current = next;
    }
    else if(maze.stack.length > 0){
        maze.current = maze.stack.pop();
    }
    if(maze.stack.length <= 0){
        if(!maze.current.neighbours[0].walls[3]){
            maze.current.neighbours[0].unhighlight(color(clr_r,clr_g,clr_b, 120));
        }
        else{
            maze.current.neighbours[1].unhighlight(color(clr_r,clr_g,clr_b, 120));
        }
        noLoop();
		document.getElementById("solve").disabled = false;
    }
}

function solve()
{
	maze.aStar();
	document.getElementById("solve").disabled = true;
}

function index(i, j){
    if(i < 0 || j < 0 || i > maze.cols-1 || j > maze.rows-1){
        return -1;
    }
    return i + j * maze.cols;
}

function settings()
{   
    let size = document.getElementById("maze_s").value;
    let r = document.getElementById("clr_r").value;
    let g = document.getElementById("clr_g").value;
    let b = document.getElementById("clr_b").value;
    size = constrain(size, 5, 50);
    r = constrain(r, 0, 255);
    g = constrain(g, 0, 255);
    b = constrain(b, 0, 255);
	window.location.replace(removeParams(window.location) + "?size="+size+"&r="+r+"&g="+g+"&b="+b);
}

function removeParams()
{
    return window.location.href.split('?')[0];
}

class Cell{
    constructor(x, y){
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.x = x;
        this.y = y;
        this.walls = [true, true, true, true]; // top, right, bottom, left
        this.visited = false;
        this.neighbours = [];
        this.previous;
    }
    unhighlight(clr){
        console.log(this.x, this.y);
        noStroke()
        fill(clr);
        rect(this.x * maze.size, this.y * maze.size, maze.size, maze.size);
    }

    highlight(){ // highlight the current cell
        noStroke();
        fill(255, 255, 255, 100);
        rect(this.x * maze.size, this.y * maze.size, maze.size, maze.size);
    }

    show(c){
        let colour = c || color(255, 0, 0, 100);
        let i = this.x * maze.size, j = this.y * maze.size;
        stroke(255);
        noFill();
        if(this.walls[0]){	
        line(i, j, i + maze.size, j);
        }
        if(this.walls[1]){
        line(i + maze.size, j, i + maze.size, j + maze.size);
        }
        if(this.walls[2]){
        line(i + maze.size, j + maze.size, i, j + maze.size);
        }
        if(this.walls[3]){
        line(i, j + maze.size, i, j);
        }
        if(this.visited){
            noStroke();
            if(this.x === 0 && this.y === 0){
                fill(255, 255, 0, 100);
            }
            else if(this.x === maze.cols-1 && this.y === maze.rows-1){
                fill(255, 255, 0, 50);
            }
            else{
            fill(colour);
            }
            rect(i, j, maze.size, maze.size);
        }

    }

    checkNeighbours(){
        let neighbors = [];
        const top = maze.cells[index(this.x, this.y - 1)];
        const right = maze.cells[index(this.x + 1, this.y)];
        const bottom = maze.cells[index(this.x, this.y + 1)];
        const left = maze.cells[index(this.x - 1, this.y)];

        if(top && !top.visited){
            if(this.neighbours.indexOf(top) === -1){
                this.neighbours.push(top);
            }
            neighbors.push(top);
        }
        if(right && !right.visited){
            if(this.neighbours.indexOf(right) === -1){
                this.neighbours.push(right);
            }
            neighbors.push(right);
        }
        if(bottom && !bottom.visited){
            if(this.neighbours.indexOf(bottom) === -1){
                this.neighbours.push(bottom);
            }
            neighbors.push(bottom);
        }
        if(left && !left.visited){
            if(this.neighbours.indexOf(left) === -1){
                this.neighbours.push(left);
            }
            neighbors.push(left);
        }

        if(neighbors.length > 0){
            let r = floor(random(0, neighbors.length));
            return neighbors[r];
        }
        else{
            return undefined;
        }
    }
}


class Maze{
    constructor(size, rows, cols){
        this.size = size
        this.openSet = [];
        this.closedSet = [];
        this.cells = [];
        this.stack = [];
        this.path = [];
        this.rows = rows;
        this.cols = cols;
        this.current;
        this.start;
        this.end;
        for(let j = 0; j < rows; j++){
        for(let i = 0; i < cols; i++){
            this.cells.push(new Cell(i, j))
        }
    }
    }
    removeWalls(a, b){
        let x = a.x - b.x;
        if(x === 1){
            a.walls[3] = false;
            b.walls[1] = false;
        }
        else if(x === -1){
            a.walls[1] = false;
            b.walls[3] = false;
        }
        let y = a.y - b.y;
        if(y === 1){
            a.walls[0] = false;
            b.walls[2] = false;
        }
        else if(y === -1){
            a.walls[2] = false;
            b.walls[0] = false;
        }
    }
    heuristic(a, b){
        let d = Math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2);
        return d;
    }

    aStar(){
        while(this.openSet.length > 0){
            let minimum = 0;
            let curr;
            for(let i = 0; i < this.openSet.length; i++){
                if(this.openSet[i].f < this.openSet[minimum].f){
                    minimum = i;
                }
            }
            curr = this.openSet[minimum];
            if(curr === this.end){
                let temp = curr;
                this.path.push(temp);
                while(temp.previous){
                    this.path.push(temp.previous);
                    temp = temp.previous;
                }
                break;
            }
            this.openSet.splice(minimum, 1);
            this.closedSet.push(curr);
            for(let i = 0; i < curr.neighbours.length; i++){
                let neighbour = curr.neighbours[i];
                if(!this.closedSet.includes(neighbour) && isValid(curr, neighbour)){
                    let tempG = curr.g + 1;
                    if(this.openSet.includes(neighbour)){
                        if(tempG < neighbour.g){
                            neighbour.g = tempG;
                        }
                    }
                    else{
                        neighbour.g = tempG;
                        this.openSet.push(neighbour);
                    }
                    neighbour.h = this.heuristic(neighbour, this.end);
                    neighbour.f = neighbour.g + neighbour.h;
                    neighbour.previous = curr;
                }
            }
        }
        for(let i=0; i<this.path.length; i++){
            this.path[i].show(color(0, 0, 0, 100));
        }
    }
}


function isValid(curr, neighbour){
    let x = curr.x - neighbour.x;
    let y = curr.y - neighbour.y;
    if((x === 1 && curr.walls[3]) || (x === -1 && curr.walls[1]) || (y === 1 && curr.walls[0]) || (y === -1 && curr.walls[2])){
        return false;
    }
    return true;
}
