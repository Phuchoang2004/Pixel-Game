// Get canvas reference 
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const gravity = 0.2;

class Sprite {
    constructor({position, imageSrc, scale = 1, framesMax = 1,offset = { x: 0, y: 0 }}) {
        this.position = position;
        this.width = 50;
        this.height = 100;
        this.image = new Image();
        this.image.src = imageSrc;
        this.scale = scale;
        this.framesMax = framesMax;
        this.framesCurrent = 0;
        this.framesElapsed = 0;
        this.framesHold = 5;
        this.facing = 'right';
    }
    draw() {
        if (!this.image.complete) return; // Add this check
    
        ctx.save();
        
        const frameWidth = this.image.width / this.framesMax;
        const frameHeight = this.image.height;
        const scaledWidth = frameWidth * this.scale;
        const scaledHeight = frameHeight * this.scale;
        
        if (this.facing === 'left') {
            ctx.translate(this.position.x + scaledWidth, this.position.y);
            ctx.scale(-1, 1);
        } else {
            ctx.translate(this.position.x, this.position.y);
        }

        ctx.drawImage(
            this.image,
            this.framesCurrent * frameWidth,
            0,
            frameWidth,
            frameHeight,
            0,
            0,
            scaledWidth,
            scaledHeight
        );
        
        ctx.restore();
    }
    animateFrames() {
        this.framesElapsed++

        if (this.framesElapsed % this.framesHold === 0) {
            if (this.framesCurrent < this.framesMax - 1) {
            this.framesCurrent++
            } else {
            this.framesCurrent = 0
            }
        }
    }

    update() {
        this.draw()
        this.animateFrames()
    }
}

class Fighter extends Sprite {
    constructor({
        position,
        velocity,
        color = 'red',
        imageSrc,
        scale = 1,
        framesMax = 1,
        offset = { x: 0, y: 0 },
        groundOffset = 0,
        sprites
      }) {
        super({
          position,
          imageSrc,
          scale,
          framesMax,
          offset
        })  
        this.sprites = sprites;
        for (const sprite in sprites) {
            sprites[sprite].image = new Image();
            sprites[sprite].image.src = sprites[sprite].imageSrc;
        }
        
        this.currentAttack = 1;
        this.attackCount = 0;
        this.comboResetTimeout = null;

        this.tempColor = color;  // skill test
        this.canAttack = true;
        this.isStunned = false;
        this.canMove = true;

        this.position = position;
        this.velocity = velocity;
        this.hasHit = false;

        this.isDashing = false;
        this.canDash = true;
        this.dashSpeed = 15;
        this.dashFrames = 8;
        this.currentDashFrame = 0; 
        
        this.isDefending = false;
        this.canDeflect = false;  
        this.isDeflecting = false;

        this.width = 50;
        this.height = 100;

        this.isJumping = false;
        this.isAttacking = false;
        this.attackBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            offset: {
                x: 0,  
                y: 0
            },
            width: 100,
            height: 50
        }
        this.color =color;
        this.groundOffset = groundOffset;  // Store individual ground offset
    }
    
    stun() {
        this.isStunned = true;
        this.canMove = false;
        this.color = "grey"; //stun test
        setTimeout(() => {
            this.isStunned = false;
            this.canMove = true;
            this.color = this.tempColor; //stun test
        }, 350);
    }
    defend() {
        if (this.isStunned) return;
        
        this.color ="purple";
        this.isDefending = true;
        if (this.canDeflect) {
            this.isDeflecting = true;
            // Reset deflect state after short window
            setTimeout(() => {
                this.isDeflecting = false;
            }, 200);
        }
    }
    stopDefend() {
        this.color=this.tempColor;
        this.isDefending = false;
        this.isDeflecting = false;
    }
    update() {
        this.draw();
        this.animateFrames();
        
        if (this.facing === 'right') {
            this.attackBox.offset.x = 0; 
        } else {
            this.attackBox.offset.x = -this.attackBox.width + this.width; 
        }
        
        this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y;

        if (this.position.x + this.velocity.x + 50 > canvas.width || this.position.x + this.velocity.x < 0) {
            this.velocity.x = 0;
        }
        
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.velocity.y += gravity;

        if (this.position.y+this.height+this.velocity.y > canvas.height - 97 || this.position.y+this.velocity.y < 0) {
            this.velocity.y = 0;
        }

        if (this.velocity.y == 0) {
            this.isJumping = false;
        }
    }
    attack() {
        if (!this.canAttack) return;

        this.isAttacking = true;
        this.canAttack = false;
        this.hasHit = false;

        // Set current attack animation
        this.framesCurrent = 0;
        this.image = this.sprites[`attack${this.currentAttack}`].image;
        this.framesMax = this.sprites[`attack${this.currentAttack}`].framesMax;

        // Calculate duration based on frames
        const attackDuration = (this.framesMax / 5) * 300;  // Base duration scaled by frames

        // Keep attack state active during the entire animation
        setTimeout(() => {
            this.isAttacking = false;
            this.hasHit = false;
            // Reset to idle animation after attack
            if (!this.isDashing && !this.isStunned) {
                this.image = this.sprites.idle.image;
                this.framesMax = this.sprites.idle.framesMax;
            }
        }, attackDuration);
        
        setTimeout(() => {
            this.canAttack = true;
        }, attackDuration + 100);

        // Increment attack counter
        this.currentAttack++;
        if (this.currentAttack > 3) {
            this.currentAttack = 1;
        }

        // Reset combo if no attack within 1 second
        clearTimeout(this.comboResetTimeout);
        this.comboResetTimeout = setTimeout(() => {
            this.currentAttack = 1;
        }, 1000);
    }
    dash() {
        if (!this.canDash || this.isStunned) return;
        
        this.isDashing = true;
        this.canDash = false;
        this.currentDashFrame = 0;
        
        const dashInterval = setInterval(() => {
            if (this.currentDashFrame >= this.dashFrames) {
                clearInterval(dashInterval);
                this.isDashing = false;
                
                // Add 50ms delay after dash
                setTimeout(() => {
                    this.canDash = true;
                }, 50);
                return;
            }
            
            if (this.facing === 'right') {
                this.velocity.x = this.dashSpeed;
            } else {
                this.velocity.x = -this.dashSpeed;
            }
            
            this.currentDashFrame++;
        }, 16); // ~60fps
    }
}

export { Fighter, Sprite, gravity };