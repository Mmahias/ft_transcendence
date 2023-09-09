import React, { useState, useEffect } from 'react';
import { StyledBall } from './Ball.styles';
import { CANVAS_WIDTH, CANVAS_HEIGHT, BORDER_THICKNESS } from '../Game.constants'; // Adjust path as necessary

interface BallProps {
    x: number;
    y: number;
    vx: number,
    vy: number,
    size: number;
}

const Ball: React.FC<BallProps> = ({ x, y, size }) => {
    return <StyledBall x={x} y={y} size={size} />;
}

export default Ball;
