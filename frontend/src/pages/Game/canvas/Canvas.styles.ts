import styled from 'styled-components';

export const Canvas = styled.canvas<{ canvasWidth: number, canvasHeight: number }>`
  border: ${props => props.canvasWidth / 100}px solid black;
  width: ${props => props.canvasWidth}px;
  height: ${props => props.canvasHeight}px;
  box-sizing: border-box;
  border-image-slice: 1;
  border-image-source: linear-gradient(to left, #743ad5, #d53a9d);
`;
