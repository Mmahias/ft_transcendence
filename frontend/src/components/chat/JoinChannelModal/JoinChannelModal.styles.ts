import styled from 'styled-components';

export const FormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  label {
    font-weight: bold;
    margin-bottom: 5px;
  }
  input, select {
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
  }
`;

export const SubmitButton = styled.button`
  padding: 10px 20px;
  border: none;
  background-color: #007bff;
  color: #ffffff;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

export const ModalStyled = styled.div`
    width: 80%;
`;

// JoinChannelModal.styles.ts

export const ChannelBoxStyled = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    border: 1px solid #e0e0e0;
    border-radius: 5px;
    margin: 5px 0;
    background-color: #f9f9f9;
    transition: background-color 0.2s;

    &:hover {
        background-color: #e6e6e6;
    }
`;

export const ChannelHeader = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    font-size: 1.1em;

    span {
        margin-left: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        background-color: #dcdcdc;
        font-size: 0.9em;
    }
`;

export const ChannelDetails = styled.div`
    flex: 2;
    display: flex;
    justify-content: space-around;  // Distribute details horizontally
    align-items: center;
    margin-right: 20px;
`;

export const DetailItem = styled.p`
    margin: 0 10px;  // Adjust for spacing between detail items
`;

export const ChannelActions = styled.div`
    flex: 1;
`;

export const JoinButton = styled.button`
    padding: 8px 16px;
    border: none;
    background-color: #007bff;
    color: #ffffff;
    border-radius: 5px;
    cursor: pointer;
    &:hover {
        background-color: #0056b3;
    }
`;

export const ChannelsContainerStyled = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center; // Centers channel boxes horizontally in the modal
    width: 100%;
`;
