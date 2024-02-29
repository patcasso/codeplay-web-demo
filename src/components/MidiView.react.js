import React from "react";
import { useState } from "react";

import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col';


import MultiTrackView from './MultiTrackView.react.js'


import { Midi } from '@tonejs/midi'

// Drag & Drop event handler
const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
};

// Drag & Drop 한 파일 ArrayBuffer로 저장
const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            resolve(event.target.result);
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsArrayBuffer(file);
    });
};

// Main component
const MidiView = (props) => {
    const [midiFile, setMidiFile] = useState();
    const [fileName, setFileName] = useState("Drag and drop MIDI file here")

    const handleFileDrop = async (event) => {
        event.preventDefault();

        const file = event.dataTransfer.files[0];

        if (file) {
            try {
                const arrayBuffer = await readFileAsArrayBuffer(file);
                const midi = new Midi(arrayBuffer)
                console.log(midi);
                setMidiFile(midi);
                setFileName(file.name);

            } catch (error) {
                console.error('Error parsing MIDI file:', error);
            }
        }
    };




    return (
        <Col xs={props.arrWidth}>
            <Card>
                <Card.Header as="h5">
                    Generated Music
                </Card.Header>
                <Card.Body>
                    <div
                        onDrop={handleFileDrop}
                        onDragOver={handleDragOver}
                        style={{
                            width: '100%',
                            height: '10vh',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            border: '2px dashed #aaa',
                        }}
                    >
                        <p>{fileName}</p>
                    </div>
                    <MultiTrackView midiFile={midiFile} />
                    {/* <Row className="mt-2">
                        <h4>[MIDI json]</h4>
                        <Col>
                            {JSON.stringify(midiFile)}
                        </Col>
                    </Row> */}
                </Card.Body>
            </Card>
        </Col >
    )
}

export default MidiView;