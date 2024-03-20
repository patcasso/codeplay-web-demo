import React from 'react';
import { useState, useEffect } from 'react';

import NavigationBar from "./NavigationBar.react";
import MidiView from "./MidiView.react";
import TextPromptView from "./TextPromptView.react";
import ErrorModal from "./ErrorModal.react";
import TutorialModal from "./TutorialModal.react";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';


const MainView = () => {
    const [midiBlob, setMidiBlob] = useState();
    const [generateConditions, setGenerateConditions] = useState({});
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showTutorialModal, setShowTutorialModal] = useState(false);
    const [errorLog, setErrorLog] = useState("Error");

    const arrWidth = 12
    console.log(generateConditions);

    return (
        <>
            <NavigationBar
                setShowTutorialModal={setShowTutorialModal}
            />
            <Container fluid className="p-4">
                <Row>
                    <TextPromptView
                        arrWidth={arrWidth}
                        midiBlob={midiBlob}
                        setMidiBlob={setMidiBlob}
                        setGenerateConditions={setGenerateConditions}
                        setShowErrorModal={setShowErrorModal}
                        setErrorLog={setErrorLog}
                    />
                    <MidiView
                        arrWidth={arrWidth}
                        midiBlob={midiBlob}
                        generateConditions={generateConditions}
                        setMidiBlob={setMidiBlob}
                        setShowErrorModal={setShowErrorModal}
                        setErrorLog={setErrorLog}
                    />
                </Row>
            </Container>
            <ErrorModal
                errorLog={errorLog}
                showErrorModal={showErrorModal}
                setShowErrorModal={setShowErrorModal}
            />
            <TutorialModal
                showTutorialModal={showTutorialModal}
                setShowTutorialModal={setShowTutorialModal}
            />
        </>
    );
}

export default MainView;
