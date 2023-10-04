import React, { useState } from 'react';
import Modal from '../../src/components/shared/Modal/Modal';
import ChatService from '../../src/api/chat-api';
import { FormWrapper, InputWrapper, SubmitButton } from './CreateChannelModal.styles';
import { ChanMode } from '../../src/shared/types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onChannelCreated?: () => void;
}

const CreateChannelModal: React.FC<Props> = ({ isOpen, onClose, onChannelCreated }) => {
  const [channelName, setChannelName] = useState<string>('');
  const [channelMode, setChannelMode] = useState<ChanMode>(ChanMode.PUBLIC);
  const [password, setPassword] = useState<string>('');

  const isPasswordDisabled = channelMode !== ChanMode.PROTECTED;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const createAndClose = async () => {
        const success = await ChatService.createChannel(channelName, channelMode, !isPasswordDisabled ? password : undefined);

        if (success) {
            if (onChannelCreated) onChannelCreated(); // Notify the parent component of the change
        }

        onClose();
    }
    createAndClose();
}

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Channel">
      <FormWrapper onSubmit={handleSubmit}>
        <InputWrapper>
          <label>Channel Name:</label>
          <input 
            type="text" 
            value={channelName} 
            onChange={(e) => setChannelName(e.target.value)} 
            required 
          />
        </InputWrapper>
        <InputWrapper>
          <label>Mode:</label>
          <select 
            value={channelMode} 
            onChange={(e) => setChannelMode(e.target.value as ChanMode)}
          >
            <option value={ChanMode.PUBLIC}>Public</option>
            <option value={ChanMode.PRIVATE}>Private</option>
            <option value={ChanMode.PROTECTED}>Protected</option>
          </select>
        </InputWrapper>
        <InputWrapper>
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPasswordDisabled}
            required={isPasswordDisabled ? false : true} // Only require the password if it's not disabled.
            style={{ backgroundColor: isPasswordDisabled ? '#e0e0e0' : 'white' }} // Gray out if disabled.
          />
        </InputWrapper>
        <SubmitButton type="submit">Create</SubmitButton>
      </FormWrapper>
    </Modal>
  );
}

export default CreateChannelModal;