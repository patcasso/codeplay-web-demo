import React from "react";
import { useState, useEffect } from "react";

import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col';
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

import { bodyAndSoulJSON } from "../midi/body_n_soul_sample.js";
import { twentiethJSON } from "../midi/twentieth_sample.js"

import MultiTrackView from './MultiTrackView.react.js'


import { Midi, Buffer } from '@tonejs/midi'


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
    const [regenTrackIdx, setRegenTrackIdx] = useState();
    const [regenInstNum, setRegenInstNum] = useState();
    const [addInstNum, setAddInstNum] = useState();


    // 서버에서 생성해서 반환해준 미디 파일을 멀티트랙 뷰로 넘겨줌
    useEffect(() => {
        if (props.midiBlob) {
            try {
                const newMidiFile = new Midi(props.midiBlob)
                setMidiFile(newMidiFile)
            } catch (error) {
                console.error('Error parsing MIDI file:', error);
            }
        }
    }, [props.midiBlob])

    useEffect(() => {
        regenerateSingleInstrument()
    }, [regenTrackIdx])

    // 드래그 앤 드롭으로 올린 미디 파일을 멀티트랙 뷰로 보내고 서버에 전송 가능한 형태로 준비시킴
    const handleFileDrop = async (event) => {
        event.preventDefault();

        const file = event.dataTransfer.files[0];

        if (file) {
            try {
                setMidiFileRaw(file);
                console.log(midiFileRaw)

                const arrayBuffer = await readFileAsArrayBuffer(file);
                const midi = new Midi(arrayBuffer)
                
                setMidiFile(midi);
                setFileName(file.name);
            } catch (error) {
                console.error('Error parsing MIDI file:', error);
            }
        }
    };

    // 특정 악기를 Regenerate 하도록 하면, 해당 악기 번호와 해당 악기만 제외한 미디 파일을 서버로 전달
    const regenerateSingleInstrument = () => {
        if (midiFile) {
            try {
                // Index에 해당하는 악기만 빼서 다시 정의
                // console.log(midiFile)
                const newMidi = midiFile.clone()
                newMidi.tracks.splice(regenTrackIdx, 1);
                // console.log(newMidi)
                sendMidiToServer(newMidi, regenInstNum)
            } catch (error) {
                console.error('Error Regenerating Single Instrument:', error)
            }
        }
    }


    // 미디 파일을 서버로 보낼 수 있는 함수
    const sendMidiToServer = (midi, instNum) => {

        // Create FormData object
        const formData = new FormData();
        const midiArray = midi.toArray()
        const midiBlob = new Blob([midiArray])

        formData.append('midi_file', midiBlob, fileName);

        // 서버에서 실행할 Task 종류와, 생성할 악기 번호를 제공
        formData.append('instnum', instNum)

        // Make the POST request using fetch
        // fetch('http://0.0.0.0:8000/upload_midi/', {
            fetch('http://223.130.130.56:8200/upload_midi/', { // 승백님 서버 주소
            method: 'POST',
            body: formData,
        })
            .then(response => response.text()) // .blob() 으로 response 받기 (TextPromptView 참조)
            .then(data => {
                console.log(data);
                // TODO : 리턴 받은 blob
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    const handleClickAddInst = () => {
        if (addInstNum) {
            sendMidiToServer(midiFile, addInstNum)
        } else { 
            // 특정 악기 정하지 않고 그냥 Add Track하는 경우 예외 처리하기
            sendMidiToServer(midiFile, 999) 
        }
    }

    const handleDownloadMidi = () => {
        if (midiFile) {
            try {
                const midiArray = midiFile.toArray()
                const midiBlob = new Blob([midiArray])
                // Create a Blob URL for the data
                const blobUrl = URL.createObjectURL(midiBlob);

                // Create a download link
                const downloadLink = document.createElement('a');
                downloadLink.href = blobUrl;
                downloadLink.download = `generated_midi.mid`; // Set the desired file name

                // Append the link to the document body
                document.body.appendChild(downloadLink);

                // Trigger the click event on the link
                downloadLink.click();

                // Remove the link from the document body
                document.body.removeChild(downloadLink);

                // Don't forget to revoke the Blob URL to free up resources
                URL.revokeObjectURL(blobUrl);
            } catch (error) {
                console.error('Error downloading MIDI file:', error)
            }
        }
    }

    const handleLoadSampleMidi = async (sampleMidiPath) => {
        const midiInstance = await Midi.fromUrl(sampleMidiPath);
        setMidiFile(midiInstance)
    }



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
                                        handleLoadSampleMidi("./bodynsoul_sample.mid");
                                        setSampleTitle("Body N Soul");
                                    }}
                                >
                                    <span>Body And Soul</span>
                                </Dropdown.Item>
                                <Dropdown.Item
                                    as="button"
                                    key="1"
                                    onClick={() => {
                                        handleLoadSampleMidi("./twentieth_sample.mid");
                                        setSampleTitle("20th Century Stomp");
                                    }}
                                >
                                    <span>20th Century Stomp</span>
                                </Dropdown.Item>
                            </DropdownButton>
                            <Button
                                className="float-start"
                                variant="outline-secondary"
                                onClick={sendMidiToServer}
                            >
                                Send MIDI to Server
                            </Button>
                            <Button
                                className="float-start"
                                variant="outline-dark"
                                onClick={handleDownloadMidi}
                            >
                                Download Current MIDI
                            </Button>
                        </Col>
                    </Row>
                    <MultiTrackView
                        midiFile={midiFile}
                        setRegenTrackIdx={setRegenTrackIdx}
                        setRegenInstNum={setRegenInstNum}
                    />
                    {midiFile ?
                        <Row className="mt-3">
                            <Col xs={10}></Col>
                            <Col xs={2}>
                                <InputGroup>
                                    <Form.Control
                                        type="number"
                                        placeholder="Inst No."
                                        min="0"
                                        max="127"
                                        onChange={(event) => {
                                            setAddInstNum(event.target.valueAsNumber);
                                        }}
                                    />
                                    <Button
                                        className="float-"
                                        variant="outline-success"
                                        onClick={handleClickAddInst}
                                    >
                                        Add Inst
                                    </Button>
                                </InputGroup>

                            </Col>
                        </Row> : null
                    }
                </Card.Body>
            </Card>
        </Col >
    )
}

export default MidiView;