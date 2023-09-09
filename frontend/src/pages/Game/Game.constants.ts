// game.constants.js

function canvasWidth() {
    return typeof window !== 'undefined' ? 0.8 * window.innerWidth : 800; // fallback to default value if window is not defined
}

function canvasHeight() {
    return typeof window !== 'undefined' ? 0.6 * window.innerHeight : 600; // fallback to default value if window is not defined
}

export function CANVAS_WIDTH() {
    return canvasWidth();
}

export function CANVAS_HEIGHT() {
    return canvasHeight();
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

export function VELOCITY_FACTOR() {
    return 3; // How much the velocity changes based on where the ball bounces off the paddle
}

export function TICKS_PER_SEC() {
    return 60;
}

export function MAX_SCORE() {
    return 10;
}
