import styled from 'styled-components';

// Paddles and ball colors
export const ballColor = 'rgb(0, 0, 0)';
export const rightPaddleColor = 'rgb(220, 220, 40)';
export const leftPaddleColor = 'rgb(220, 220, 40)';

// Game environment colors
export const scoreCardColor = 'rgb(195, 195, 80)';
export const borderColor = 'rgb(195, 195, 80)';
export const canvasBackgroundColor = 'rgb(160, 160, 160)';
export const gameBackgroundColor = 'rgb(60, 60, 60)';

// Button colors
export const buttonBackgroundColor = 'rgb(195, 195, 80)';
export const buttonFontColor = 'rgb(0, 0, 0)';
export const buttonHoverColor = 'rgb(215, 215, 180)';
export const buttonDisabledColor = 'rgb(217, 217, 217)';

export const GameWrapper = styled.div`
    width: 100vw;
    height: 100vh;
    margin: 0em auto;
    padding: 1em;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 0.8em;
    outline: none;
    background-color: ${gameBackgroundColor};
`;


export const Score = styled.h1`
    background: linear-gradient(45deg, ${scoreCardColor}, rgba(255,255,255,0.8)); // subtle gradient
    --webkit-background-clip: text;
    --webkit-text-fill-color: transparent;
    font-family: 'Lobster', cursive; 
    font-size: 2em;
    font-weight: bold;
    text-align: center;
    width: fit-content;
    padding: 10px 20px;  // Space inside the card
    border-radius: 10px;  // Rounded corners
    box-shadow: 0px 4px 6px rgba(0,0,0,0.1);  // Drop shadow
    margin: 0em;
    transition: all 0.3s ease;  // Smooth transition effect

    &:hover {  // Optional: scale up slightly when hovered
        transform: scale(1.05);
    }
`;


export const StyledButton = styled.button`
  background: ${buttonBackgroundColor};
  color: ${buttonFontColor};
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-family: 'Pacifico', cursive; // Custom font if available (declared in the ../index.css file)
  font-size: 1em;
  letter-spacing: 1px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: ${buttonHoverColor};  // Darken the color a bit on hover.
  }

  &:disabled {
    background: ${buttonDisabledColor} // Gray out if the button is disabled.
    cursor: not-allowed;
  }

  &:not(:last-child) {
    margin-right: 10px;  // Adds some space between buttons if there are multiple.
  }
`;