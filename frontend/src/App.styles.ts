import styled, { keyframes } from 'styled-components';

const AppLogoSpin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const AppLogo = styled.img`
  height: 10vmin;
  pointer-events: none;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${AppLogoSpin} infinite 25s linear;
  }
`;

export const AppHeader = styled.header`
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
`;

export const AppLink = styled.a`
  color: #61dafb;
`;

export const MainContentWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;