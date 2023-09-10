import React, { useState, useEffect } from 'react';
import { StyledPaddle } from './Paddle.styles';
import { CANVAS_HEIGHT } from '../Game.constants';

interface PaddleProps {
    initialX: number;
    initialY: number;
    width: number;
    height: number;
    speed: number;
    moveUpKey: string;
    moveDownKey: string;
    score: number;
    side: string;
}

const Paddle: React.FC<PaddleProps> = ({ initialX, initialY, width, height, speed, moveUpKey, moveDownKey, score, side }) => {
    const [position, setPosition] = useState({ x: initialX, y: initialY });

    const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
            case moveUpKey:
                setPosition(prevState => ({
                    ...prevState,
                    y: prevState.y - speed > 0 ? prevState.y - speed : prevState.y
                }));
                break;
            case moveDownKey:
                setPosition(prevState => ({
                    ...prevState,
                    y: prevState.y + height + speed < CANVAS_HEIGHT() ? prevState.y + speed : prevState.y
                }));
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return <StyledPaddle x={position.x} y={position.y} width={width} height={height} />;
}

export default Paddle;
