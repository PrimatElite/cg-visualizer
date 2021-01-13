import React from 'react';
import styled from 'styled-components';

const InfoWrapper = styled.div`
  border: 2px solid black;
  margin: 5px 10px 10px 10px;
  height: 75%;
`;

const Info = () => (
    <InfoWrapper>
        <h3>This is an info block</h3>
    </InfoWrapper>
)

export default Info;
