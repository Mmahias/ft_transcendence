// game.constants.js

const minCanvasWidth = 300;
const minCanvasHeight = 300;
export function CANVAS_WIDTH() {
  return 1000;
}

export function CANVAS_HEIGHT() {
  return CANVAS_WIDTH() * 7 / 11;
}

export function PADDLE_LENGTH() {
  return CANVAS_HEIGHT() / 4.3;
}

export function PADDLE_WIDTH() {
  return PADDLE_LENGTH() / 20;
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

export function MAX_BALL_SPEED() {
    return 18;
}

export function BALL_ACC_X() {
    return 1.02;
}

export function VELOCITY_FACTOR() {
    return 3; // How much the velocity changes based on where the ball bounces off the paddle
}

export function TICKS_PER_SEC() {
    return 60;
}

export function MAX_SCORE() {
    return 3;
}
