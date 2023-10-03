import styled, { createGlobalStyle } from 'styled-components';

export const Sidebar = styled.aside`
  position: fixed;
  left: 0;
  top: 7%;
  bottom: 0;
  width: 250px;
  background-color: #f5f5f5;
  border-right: 1px solid #ccc;
  overflow-y: auto;
`;

export const GlobalStyles = styled.p`
`;


export const ButtonContainer = styled.div`
  padding: 15px;
  border-bottom: 1px solid #ccc;
`;

export const ChannelButton = styled.button`
  background: none;
  border: none;
  color: #007BFF;
  padding: 10px;
  width: 100%;
  text-align: left;
  &:hover {
    background-color: #e6e6e6;
  }
`;

export const ChannelList = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
`;

export const ActiveChannel = styled.div`
  padding: 15px;
  font-weight: bold;
  color: #007BFF;
`;
