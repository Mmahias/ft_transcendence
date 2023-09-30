import React, { useState } from 'react';
import Modal from '../../shared/Modal/Modal';
import { createChannel } from 'api/chat-api';
import { FormWrapper, InputWrapper, SubmitButton } from './CreateChannelModal.styles';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const CreateChannelModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [channelName, setChannelName] = useState<string>('');
  const [channelMode, setChannelMode] = useState<'public' | 'private' | 'protected'>('public');
  const [password, setPassword] = useState<string>('');

  const isPasswordVisible = channelMode === 'private';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createChannel(channelName, channelMode, isPasswordVisible ? password : undefined);
    onClose();
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
          <select value={channelMode} onChange={(e) => setChannelMode(e.target.value as 'public' | 'private' | 'protected')}>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="protected">Protected</option>
          </select>
        </InputWrapper>
        {isPasswordVisible && (
          <InputWrapper>
            <label>Password:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </InputWrapper>
        )}
        <SubmitButton type="submit">Create</SubmitButton>
      </FormWrapper>
    </Modal>
  );
}

export default CreateChannelModal;
