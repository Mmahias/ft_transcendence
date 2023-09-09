import styled from 'styled-components';

export const GameWrapper = styled.div`
  width: 100%;
  max-width: 800px;  /* This is just an example. Adjust to fit your design. */
  height: auto;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  outline: none;
`;

export const Score = styled.h1`
  background: linear-gradient(to left, #753ad5, #d53a9d);
  --webkit-background-clip: text;
  --webkit-text-fill-color: transparent;
`;