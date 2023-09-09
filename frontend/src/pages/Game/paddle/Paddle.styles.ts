// Paddle.styles.ts

import styled from 'styled-components';

export const StyledPaddle = styled.div<{ x: number; y: number; width: number; height: number }>`
    position: absolute;
    left: ${props => props.x}px;
    top: ${props => props.y}px;
    width: ${props => props.width}px;
    height: ${props => props.height}px;
    background-color: black;
`;
