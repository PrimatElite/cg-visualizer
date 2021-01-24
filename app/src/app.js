import React, { useState } from 'react';
import styled from 'styled-components';
import Canvas from './Components/Canvas';
import Menu from './Components/Menu';
import Info from './Components/Info';

const AppWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
`;

const PanelWrapper = styled.div`
  width: 25%;
  height: calc(100vh - 20px);
  border: 2px solid black;
  margin: 10px 5px 0 10px;
  display: flex;
  flex-direction: column;
`;

function App() {
  const [data, setData] = useState({ elements: {}, visualizations: [] });
  const [loading, setLoading] = useState(false);

  return (
    <AppWrapper>
      <PanelWrapper>
        <Menu handleData={(data) => setData(data)} handleLoad={setLoading} />
        <Info data={data} />
      </PanelWrapper>
      <Canvas data={data} loading={loading} />
    </AppWrapper>
  );
}

export default App;
