import styled from 'styled-components';
import { borderColor, canvasBackgroundColor } from '../Game.styles';

export const Canvas = styled.canvas<{ canvasWidth: number, canvasHeight: number }>`
  border: ${props => props.canvasWidth / 100}px solid black;
  width: ${({ canvasWidth }) => canvasWidth}px;
  height: ${({ canvasHeight }) => canvasHeight}px;
  box-sizing: border-box;
  border-image-slice: 1;
  background-color: ${canvasBackgroundColor};
  border-color: ${borderColor};
`;
