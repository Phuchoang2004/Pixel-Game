import { Fighter, Sprite, gravity } from './js/classes.js';

// Get canvas reference at the top
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

ctx.fillRect(0, 0, canvas.width, canvas.height);

let samuraiCurrentHealth = 100
let knightCurrentHealth = 100

let timeLeft = 60;
let timerId;

const background = new Sprite({
    position: {x: 0, y: 0},
    imageSrc: './asset/background/background.png',
    framesMax: 1
})

const shop = new Sprite({
    position: {x: 600,y: 128},
    imageSrc: './asset/background/decorations/shop_anim.png',
    framesMax: 6,
    scale: 2.75,
})

const samurai = new Fighter({
    position: {x: 0, y: 0},
    velocity: {x: 0, y: 0},
    imageSrc: './asset/samurai2/Sprites/IDLE.png',
    framesMax: 5,
    scale: 2,
    offset: {
        x: 0,
        y: 0
    },
    groundOffset: 8,
    sprites:{
        idle:{
            imageSrc: './asset/samurai2/Sprites/IDLE.png',
            framesMax: 5
        },
        attack1:{
            imageSrc: './asset/samurai2/Sprites/ATTACK1.png',
            framesMax: 5
        },
        attack2:{
            imageSrc: './asset/samurai2/Sprites/ATTACK2.png',
            framesMax: 5
        },
        attack3:{
            imageSrc: './asset/samurai2/Sprites/ATTACK3.png',
            framesMax: 10
        },
        dash:{
            imageSrc: './asset/samurai2/Sprites/DASH.png',
            framesMax: 8
        },
        defend:{
            imageSrc: './asset/samurai2/Sprites/DEFEND.png',
            framesMax: 6
        },
        jump:{
            imageSrc: './asset/samurai2/Sprites/JUMP.png',
            framesMax: 3
        },
        stun:{
            imageSrc: './asset/samurai2/Sprites/HURT.png',
            framesMax: 3
        },
        run:{
            imageSrc: './asset/samurai2/Sprites/RUN.png',
            framesMax: 7
        },
        death:{
            imageSrc: './asset/samurai2/Sprites/DEATH.png',
            framesMax: 10
        },
        dust:{
            imageSrc: './asset/samurai2/Sprites/DUST.png',
            framesMax: 4
        }
    }
})
 
const knight = new Fighter({
    position: {x: 400, y: 200},
    velocity: {x: 0, y: 0},
    imageSrc: './asset/knight/Sprites/with_outline/IDLE.png',
    framesMax: 7,
    scale: 2,
    offset: {
        x: 0,
        y: 20
    },
    groundOffset: -20,
    sprites:{
        idle:{
            imageSrc: './asset/knight/Sprites/with_outline/IDLE.png',
            framesMax: 7
        },
        attack1:{
            imageSrc: './asset/knight/Sprites/with_outline/ATTACK1.png',
            framesMax: 6
        },
        attack2:{
            imageSrc: './asset/knight/Sprites/with_outline/ATTACK2.png',
            framesMax: 5
        },
        attack3:{
            imageSrc: './asset/knight/Sprites/with_outline/ATTACK3.png',
            framesMax: 6
        },
        defend:{
            imageSrc: './asset/knight/Sprites/with_outline/DEFEND.png',
            framesMax: 6
        },
        jump:{
            imageSrc: './asset/knight/Sprites/with_outline/JUMP.png',
            framesMax: 5
        },
        stun:{
            imageSrc: './asset/knight/Sprites/with_outline/HURT.png',
            framesMax: 4
        },
        run:{
            imageSrc: './asset/knight/Sprites/with_outline/RUN.png',
            framesMax: 8
        },
        death:{
            imageSrc: './asset/knight/Sprites/with_outline/DEATH.png',
            framesMax: 12
        },
    }
})
knight.canDeflect = true;  // Only knight has deflect ability

/*---------------------------------*/

const keys = {
    player1: {
        right: { pressed: false },
        left: { pressed: false },
        up: { pressed: false }
    },
    player2: {
        right: { pressed: false },
        left: { pressed: false },
        up: { pressed: false }
    }
}
let lastKey1
let lastKey2




function animate() {
    window.requestAnimationFrame(animate);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    
    background.update();
    shop.update();
    

    // Only reset velocity if not attacking in air
    if (!samurai.isJumping || !samurai.isAttacking) {
        samurai.velocity.x = 0;
    }
    if (!knight.isJumping || !knight.isAttacking) {
        knight.velocity.x = 0;
    }

    
    // Player 1 movement
    if (!samurai.isAttacking && !samurai.isStunned && !samurai.isDashing) {
        if (keys.player1.left.pressed && lastKey1 == 'a') {
            samurai.velocity.x = -3;
            samurai.facing = 'left';
            if (samurai.image !== samurai.sprites.run.image) {
                samurai.framesCurrent = 0;  
                samurai.image = samurai.sprites.run.image;
                samurai.framesMax = samurai.sprites.run.framesMax;
            }
        } else if (keys.player1.right.pressed && lastKey1 == 'd') {
            samurai.velocity.x = 3;
            samurai.facing = 'right';
            if (samurai.image !== samurai.sprites.run.image) {
                samurai.framesCurrent = 0;  
                samurai.image = samurai.sprites.run.image;
                samurai.framesMax = samurai.sprites.run.framesMax;
            }
        } else {
            if (samurai.image !== samurai.sprites.idle.image) {
                samurai.framesCurrent = 0;  
                samurai.image = samurai.sprites.idle.image;
                samurai.framesMax = samurai.sprites.idle.framesMax;
            }
        }
    }

    // Player 2 movement
    if (!knight.isAttacking && !knight.isStunned) {
        if (keys.player2.left.pressed && lastKey2 == 'ArrowLeft') {
            knight.velocity.x = -2;
            knight.facing = 'left';
            if (knight.image !== knight.sprites.run.image) {
                knight.framesCurrent = 0;
                knight.image = knight.sprites.run.image;
                knight.framesMax = knight.sprites.run.framesMax;
            }
        } else if (keys.player2.right.pressed && lastKey2 == 'ArrowRight') {
            knight.velocity.x = 2;
            knight.facing = 'right';
            if (knight.image !== knight.sprites.run.image) {
                knight.framesCurrent = 0;
                knight.image = knight.sprites.run.image;
                knight.framesMax = knight.sprites.run.framesMax;
            }
        } else {
            if (knight.image !== knight.sprites.idle.image) {
                knight.framesCurrent = 0;
                knight.image = knight.sprites.idle.image;
                knight.framesMax = knight.sprites.idle.framesMax;
            }
        }
    }


    // For samurai's attack on knight
    if(samurai.attackBox.position.x + samurai.attackBox.width >= knight.position.x
        && samurai.attackBox.position.x <= knight.position.x + knight.width
        && samurai.attackBox.position.y + samurai.attackBox.height >= knight.position.y
        && samurai.attackBox.position.y <= knight.position.y + knight.height
        && samurai.isAttacking
        && !samurai.hasHit    
    ) {
        if (knight.isDefending && 
            ((knight.facing === 'left' && samurai.position.x > knight.position.x) ||
            (knight.facing === 'right' && samurai.position.x < knight.position.x))) {
            if (knight.isDeflecting) {
                samurai.stun();
            }
            samurai.hasHit = true;
        } else {
            knight.stun();
            samurai.hasHit = true;
            let damage = 0;
            switch(samurai.currentAttack) {
                case 1: damage = 5; break;
                case 2: damage = 7; break;
                case 3: damage = 10; break;
            }
            knightCurrentHealth = Math.max(0, knightCurrentHealth - damage);
            const knightHealthBar = document.querySelector('#knightHealth');
            knightHealthBar.style.width = `${knightCurrentHealth}%`;
        }
    }

    // For knight's attack on samurai
    if(knight.attackBox.position.x + knight.attackBox.width >= samurai.position.x
        && knight.attackBox.position.x <= samurai.position.x + samurai.width
        && knight.attackBox.position.y + knight.attackBox.height >= samurai.position.y
        && knight.attackBox.position.y <= samurai.position.y + samurai.height
        && knight.isAttacking
        && !knight.hasHit   
    ){  
        if (samurai.isDefending && 
            ((samurai.facing === 'left' && knight.position.x > samurai.position.x) ||
            (samurai.facing === 'right' && knight.position.x < samurai.position.x))) {
            knight.hasHit = true;
        } else {
            knight.hasHit = true;
            samurai.stun();
            let damage = 0;
            switch(knight.currentAttack) {
                case 1: damage = 5; break;
                case 2: damage = 7; break;
                case 3: damage = 10; break;
            }
            samuraiCurrentHealth = Math.max(0, samuraiCurrentHealth - damage);
            const samuraiHealthBar = document.querySelector('#samuraiHealth');
            samuraiHealthBar.style.width = `${samuraiCurrentHealth}%`;
        }
    }
    samurai.update();
    knight.update();
}

animate();
decreaseTimer();  

function decreaseTimer() {
    if (timeLeft > 0) {
        timerId = setTimeout(decreaseTimer, 1000);
        timeLeft--;
        document.querySelector('#timer').innerHTML = timeLeft;
    }

    if (samuraiCurrentHealth <= 0 || knightCurrentHealth <= 0) {
        determineWinner();
    }

    if (timeLeft === 0) {
        determineWinner();
    }
}

function determineWinner() {
    clearTimeout(timerId);
    const resultText = document.querySelector('#result');
    
    if (samuraiCurrentHealth === knightCurrentHealth) {
        resultText.innerHTML = 'Tie!';
    } else if (samuraiCurrentHealth > knightCurrentHealth) {
        resultText.innerHTML = 'Samurai Wins!';
    } else {
        resultText.innerHTML = 'Knight Wins!';
    }
    resultText.style.display = 'flex';
}

window.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'd':
            keys.player1.right.pressed = true;
            lastKey1 = 'd';
            break;
        case 'a':
            keys.player1.left.pressed = true;
            lastKey1 = 'a';
            break;
        case 'w':
            if (!samurai.isJumping && !samurai.isStunned) {  // Add stun check
                samurai.velocity.y = -10;
                samurai.isJumping = true;
            }
            break;
        case 'j':
            samurai.attack();
            break;
        case 'k':
            samurai.dash();
            break;
        case 's':
            samurai.defend();
            break;
        case 'ArrowRight':
            keys.player2.right.pressed = true;
            lastKey2 = 'ArrowRight';
            break;
        case 'ArrowLeft':
            keys.player2.left.pressed = true;
            lastKey2 = 'ArrowLeft';
            break;
        case 'ArrowUp':
            if (!knight.isJumping && !knight.isStunned) {    // Add stun check
                knight.velocity.y = -10;
                knight.isJumping = true;
            }
            break;
        case 'ArrowDown':
            knight.defend();
            break;
        case 'l':
            knight.attack();
            break;
    }
})

window.addEventListener('keyup', (event) => {
    switch(event.key) {
        case 'd':
            keys.player1.right.pressed = false;  
            break;
        case 'a':
            keys.player1.left.pressed = false;   
            break;
        case 's':
            samurai.stopDefend();
            break;
        case 'ArrowRight':
            keys.player2.right.pressed = false;  
            break;
        case 'ArrowLeft':
            keys.player2.left.pressed = false;   
            break;
        case 'ArrowDown':
            knight.stopDefend();
            break;
    }
})

Fighter.prototype.update = function() {
    this.draw();
    this.animateFrames();
    
    // Update position and check boundaries
    if (this.position.x + this.velocity.x + 50 > canvas.width || this.position.x + this.velocity.x < 0) {
        this.velocity.x = 0;
    }
    this.position.x += this.velocity.x;

    this.position.y += this.velocity.y;
    this.velocity.y += gravity;

    // Individual ground level check
    const groundLevel = canvas.height - 97 + this.groundOffset;
    if (this.position.y + this.height + this.velocity.y > groundLevel) {
        this.velocity.y = 0;
        this.position.y = groundLevel - this.height;
        this.isJumping = false;
    }
}