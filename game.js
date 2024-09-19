const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

const player = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    width: 50,
    height: 10,
    color: '#0095DD',
    speed: 7
};

const stars = [];
let score = 0;

function drawPlayer() {
    ctx.beginPath();
    ctx.rect(player.x - player.width / 2, player.y, player.width, player.height);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.closePath();
}

function drawStar(star) {
    ctx.beginPath();
    ctx.moveTo(star.x, star.y);
    for (let i = 0; i < 5; i++) {
        ctx.lineTo(star.x + star.size * Math.cos((18 + i * 72) * Math.PI / 180),
                   star.y + star.size * Math.sin((18 + i * 72) * Math.PI / 180));
        ctx.lineTo(star.x + star.size / 2 * Math.cos((54 + i * 72) * Math.PI / 180),
                   star.y + star.size / 2 * Math.sin((54 + i * 72) * Math.PI / 180));
    }
    ctx.closePath();
    ctx.fillStyle = star.color;
    ctx.fill();
}

function createStar() {
    stars.push({
        x: Math.random() * canvas.width,
        y: 0,
        size: 10 + Math.random() * 10,
        speed: 1 + Math.random() * 3,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`
    });
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawPlayer();
    
    for (let i = stars.length - 1; i >= 0; i--) {
        const star = stars[i];
        star.y += star.speed;
        drawStar(star);
        
        if (star.y + star.size > player.y &&
            star.x > player.x - player.width / 2 &&
            star.x < player.x + player.width / 2) {
            stars.splice(i, 1);
            score++;
            scoreElement.textContent = score;
        } else if (star.y > canvas.height) {
            stars.splice(i, 1);
        }
    }
    
    if (Math.random() < 0.02) {
        createStar();
    }
    
    requestAnimationFrame(updateGame);
}

document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    player.x = e.clientX - rect.left;
});

updateGame();
