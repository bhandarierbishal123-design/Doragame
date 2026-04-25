let game = document.getElementById("main");
let score = document.getElementById("score");
let bird = document.getElementById("bird");
let btn = document.getElementById("btn");
let start = document.getElementById("start");
let highscore = document.getElementById("highscore");

let scoresound = document.getElementById("scoresound");
let hitsound = document.getElementById("hitsound");
let bgsound = document.getElementById("bgsound");

let birdTop = 200;
let gravity = 0.5;
let velocity = 0;
let jump = -8;

let pipes = [];
let gap = 180 + Math.random()*80;
let scores = 0;
let gameOver = false;
let gameStarted = false;
let highScore = localStorage.highScore || 0;
// let highScore = 5000;

let obstacles = ["gian.png","mom.png","teacher.png","homework.png"];
let gadgets = ["gadget1.png","gadget2.png","gadget3.png"];

highscore.innerHTML = `High Score: ${highScore}`;

hitsound.volume = 0.5;
scoresound.volume = 0.5;
bgsound.volume = 0.2;

function plays(){
    if(!gameStarted){
        gameStarted = true;
        bgsound.currentTime = 0;
        bgsound.play();

        start.style.display = "none";
        bird.style.display = "block";
        score.style.display = "block";
        highscore.style.display = "block";

        game.style.animation = "bgMove 40s linear infinite";
    }

    velocity = jump;
}

document.addEventListener("click", plays);
document.addEventListener("keydown", function(e){
    if(e.code === "Space"){
        plays();
    }
});

function endGame(){
    gameOver = true;

    hitsound.play();
    bgsound.pause();

    if(scores > highScore){
        localStorage.highScore = scores;
        highScore = scores;
    }

    highscore.innerHTML = `High Score: ${highScore}`;

    start.innerHTML = `Game Over!<br> You scored ${scores} points.`;
    start.style.display = "block";

    bird.style.display = "none";
    score.style.display = "none";
    btn.style.display = "block";

    game.style.animation = "none";

    pipes.forEach((pipe)=> {
        pipe.topPipe.remove();
        pipe.bottomPipe.remove();
        if(pipe.gadget) pipe.gadget.remove();
    });

    pipes = [];
}

function createPipes(){

    let obs1 = obstacles[Math.floor(Math.random()*obstacles.length)];
    let obs2 = obstacles[Math.floor(Math.random()*obstacles.length)];
    let gad = gadgets[Math.floor(Math.random()*gadgets.length)];

    let topHeight = Math.random()*200 + 50;

    // TOP PIPE
    let topPipe = document.createElement("div");
    topPipe.classList.add("pipe", "toppipe");
    topPipe.style.height = topHeight + "px";
    topPipe.style.left = "400px";
    topPipe.style.backgroundImage = `url(${obs1})`;
    topPipe.style.backgroundSize = "cover";

    topPipe.style.backgroundRepeat = "no-repeat";
    topPipe.style.backgroundPosition = "center";

    // BOTTOM PIPE
    let bottomPipe = document.createElement("div");
    bottomPipe.classList.add("pipe", "bottompipe");
    bottomPipe.style.height = (500 - topHeight - gap) + "px";
    bottomPipe.style.left = "400px";
    bottomPipe.style.backgroundImage = `url(${obs2})`;
    bottomPipe.style.backgroundSize = "cover";
    bottomPipe.style.backgroundRepeat = "no-repeat";
    bottomPipe.style.backgroundPosition = "center";

    // GADGET (middle)
    let gadget = document.createElement("div");
    gadget.classList.add("pipe");
    gadget.style.height = "60px";
    gadget.style.width = "60px";
    gadget.style.left = "400px";
    gadget.style.top = (topHeight + gap/2 - 30) + "px";
    gadget.style.backgroundImage = `url(${gad})`;
    gadget.style.backgroundSize = "contain";
    gadget.style.backgroundRepeat = "no-repeat";
    gadget.style.backgroundPosition = "center";

    game.appendChild(topPipe);
    game.appendChild(bottomPipe);
    game.appendChild(gadget);

    pipes.push({topPipe, bottomPipe, gadget, x:400, passed:false});
}

function restartGame(){
    location.reload();
}

function updatePipes(){
    pipes.forEach((pipe, index) => {

        pipe.x -= 3;

        pipe.topPipe.style.left = pipe.x + "px";
        pipe.bottomPipe.style.left = pipe.x + "px";
        pipe.gadget.style.left = pipe.x + "px";

        let birdRect = bird.getBoundingClientRect();
        let topRect = pipe.topPipe.getBoundingClientRect();
        let bottomRect = pipe.bottomPipe.getBoundingClientRect();
        let gadgetRect = pipe.gadget.getBoundingClientRect();

        let padding = 18;

        // COLLISION WITH PIPES
        if (
            birdRect.right - padding > topRect.left &&
            birdRect.left + padding < topRect.right &&
            birdRect.top + padding < topRect.bottom
        ) {
            endGame();
        }

        if (
            birdRect.right - padding > bottomRect.left &&
            birdRect.left + padding < bottomRect.right &&
            birdRect.bottom - padding > bottomRect.top
        ) {
            endGame();
        }

        // GADGET COLLECTION
        if (
            birdRect.right > gadgetRect.left &&
            birdRect.left < gadgetRect.right &&
            birdRect.bottom > gadgetRect.top &&
            birdRect.top < gadgetRect.bottom
        ) {
            scores += 5;
            score.innerText = "Score: " + scores;

            scoresound.currentTime = 0;
            scoresound.play();

            pipe.gadget.remove();
        }

        // SCORE PASS
        if(!pipe.passed && pipe.x < 10){
            scores++;
            score.innerText = "Score: " + scores;

            scoresound.currentTime = 0;
            scoresound.play();

            pipe.passed = true;
        }

        // REMOVE OFFSCREEN
        if (pipe.x < -60){
            pipe.topPipe.remove();
            pipe.bottomPipe.remove();
            pipe.gadget.remove();
            pipes.splice(index, 1);
        }
    });
}

function gameLoop(){
    if(gameStarted && !gameOver){

        velocity += gravity;
        birdTop += velocity;

        bird.style.top = birdTop + "px";

        if(birdTop > 450 || birdTop < 0){
            endGame();
        }

        updatePipes();
    }

    requestAnimationFrame(gameLoop);
}

setInterval(()=>{
    if(gameStarted && !gameOver){
        createPipes();
    }
},2000);

gameLoop();