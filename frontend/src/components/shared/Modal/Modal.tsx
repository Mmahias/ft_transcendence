import React from 'react';
import { ModalOverlay, ModalCloseBtn, ModalContent } from './Modal.styles';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<Props> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <h2>{title}</h2>
        {children}
        <ModalCloseBtn onClick={onClose}>Close</ModalCloseBtn>
      </ModalContent>
    </ModalOverlay>
  );
}


export default Modal;
