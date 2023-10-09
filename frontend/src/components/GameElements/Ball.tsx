import React  from 'react';
import { StyledBall } from './Game.styles';

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
