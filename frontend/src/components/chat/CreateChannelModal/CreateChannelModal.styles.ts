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
