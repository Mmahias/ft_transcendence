// styles.ts
import styled from 'styled-components';

export const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const ModalContent = styled.div`
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    width: 80%;
    max-width: 400px;
`;

export const ModalCloseBtn = styled.button`
    margin-top: 10px;
`;
