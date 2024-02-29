import React from 'react';
import ReactDOM from 'react-dom';

import NavigationBar from "./components/NavigationBar.react";
import MidiView from "./components/MidiView.react";
import TextPromptView from "./components/TextPromptView.react";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';





function App() {
  const arrWidth = 12
  return (
    <>
      <NavigationBar />
      <Container fluid className="p-5">
        <Row>
          <TextPromptView arrWidth={arrWidth} />
          <MidiView arrWidth={arrWidth} />
        </Row>
      </Container>

    </>
  );
}

export default App;
