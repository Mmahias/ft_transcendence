import styled from 'styled-components';
import { CANVAS_WIDTH, CANVAS_HEIGHT, BORDER_THICKNESS } from '../Game.constants';

export const Canvas = styled.canvas`
  border: ${BORDER_THICKNESS}px solid black;
  width: ${CANVAS_WIDTH}px;
  height: ${CANVAS_HEIGHT}px;
  box-sizing: border-box;
  border-image-slice: 1;
  border-image-source: linear-gradient(to left, #743ad5, #d53a9d);
`;