import React from "react";
import { useState } from "react";

import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col';
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

import { bodyAndSoulJSON } from "../midi/body_n_soul_sample.js";
import { twentiethJSON } from "../midi/twentieth_sample.js"

import MultiTrackView from './MultiTrackView.react.js'


import { Midi } from '@tonejs/midi'

// const sampleMidis = {"body_n_soul" : bodyAndSoulJSON, ""}

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
    const [midiFileRaw, setMidiFileRaw] = useState();
    const [fileName, setFileName] = useState("Drag and drop MIDI file here (4 Bars only!)")
    const [sampleTitle, setSampleTitle] = useState("Sample MIDI");

    const handleFileDrop = async (event) => {
        event.preventDefault();

        const file = event.dataTransfer.files[0];

        if (file) {
            try {
                setMidiFileRaw(file);
                console.log(midiFileRaw)

                const arrayBuffer = await readFileAsArrayBuffer(file);
                const midi = new Midi(arrayBuffer)
                // console.log(arrayBuffer);
                console.log(midi);
                setMidiFile(midi);
                setFileName(file.name);
            } catch (error) {
                console.error('Error parsing MIDI file:', error);
            }
        }
    };

    function sendMidiToServer(event) {

        console.log(midiFileRaw) // useState에 저장된 BLOB 형태로 존재

        // Create FormData object
        const formData = new FormData();
        formData.append('midi_file', midiFileRaw, fileName);

        // Make the POST request using fetch
        // fetch('http://0.0.0.0:8000/sendmidi/', {
        fetch('http://223.130.130.56:8200/upload_midi/', { // 승백님 서버 주소
            method: 'POST',
            body: formData,
        })
            .then(response => response.text())
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }


    // console.log(JSON.stringify(midiFile));

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
                    <Row className="mt-2">
                        <Col>
                            <DropdownButton
                                as={ButtonGroup}
                                className="float-end"
                                title={sampleTitle}
                                variant="outline-dark"
                            >
                                <Dropdown.Item
                                    as="button"
                                    key="0"
                                    onClick={() => {
                                        setMidiFile(bodyAndSoulJSON);
                                        setSampleTitle("Body N Soul");
                                    }}
                                >
                                    <span>Body And Soul</span>
                                </Dropdown.Item>
                                <Dropdown.Item
                                    as="button"
                                    key="1"
                                    onClick={() => {
                                        setMidiFile(twentiethJSON);
                                        setSampleTitle("20th Century Stomp");
                                    }}
                                >
                                    <span>20th Century Stomp</span>
                                </Dropdown.Item>
                            </DropdownButton>
                            <Button
                                className="float-end"
                                variant="outline-secondary"
                                onClick={sendMidiToServer}
                            >
                                Send MIDI to Server
                            </Button>
                        </Col>
                    </Row>
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