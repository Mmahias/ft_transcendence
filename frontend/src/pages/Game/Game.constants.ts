// game.constants.js

export function CANVAS_WIDTH() {
    if (typeof window !== 'undefined' && window.innerHeight > 150 && window.innerWidth > 300) {
        return 0.8 * window.innerWidth;
    } else {
        return 0;
    }
}

export function CANVAS_HEIGHT() {
    if (typeof window !== 'undefined' && window.innerHeight > 150 && window.innerWidth > 300) {
        return 0.6 * window.innerHeight;
    } else {
        return 0;
    }
}

export function PADDLE_SPEED() {
    return 18;
}

export function BALL_SPEED_X() {
    return 6;
}

export function BALL_SPEED_Y() {
    return 8;
}

export function BALL_ACC_X() {
    return 1.05;
}

export function VELOCITY_FACTOR() {
    return 3; // How much the velocity changes based on where the ball bounces off the paddle
}

export function TICKS_PER_SEC() {
    return 60;
}

export function MAX_SCORE() {
    return 10;
}
