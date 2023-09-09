import styled from 'styled-components';

interface BallProps {
    x: number;
    y: number;
    size: number;
}

export const StyledBall = styled.div<BallProps>`
    position: absolute;
    left: ${props => props.x - props.size}px;
    top: ${props => props.y - props.size}px;
    width: ${props => 2 * props.size}px;
    height: ${props => 2 * props.size}px;
    background-color: black;
    border-radius: 50%;
`;
