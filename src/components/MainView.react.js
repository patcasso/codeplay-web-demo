import React from 'react';
import { useState, useEffect } from 'react';

import NavigationBar from "./NavigationBar.react";
import MidiView from "./MidiView.react";
import TextPromptView from "./TextPromptView.react";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';


const MainView = () => {
    const [midiBlob, setMidiBlob] = useState();

    const arrWidth = 12
    
    return (
        <>
            <NavigationBar />
            <Container fluid className="p-5">
                <Row>
                    <TextPromptView
                        arrWidth={arrWidth}
                        setMidiBlob={setMidiBlob}
                    />
                    <MidiView
                        arrWidth={arrWidth}
                        midiBlob={midiBlob}
                    />
                </Row>
            </Container>
        </>
    );
}

export default MainView;
