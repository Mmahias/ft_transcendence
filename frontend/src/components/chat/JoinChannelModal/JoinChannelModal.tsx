// components/chat/JoinChannelModal.tsx

import React from 'react';
import Modal from '../../shared/Modal/Modal';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const JoinChannelModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // API call to join channel
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Join Channel">
            <form onSubmit={handleSubmit}>
                {/* Add form fields as necessary */}
                <button type="submit">Join</button>
            </form>
        </Modal>
    );
}

export default JoinChannelModal;
