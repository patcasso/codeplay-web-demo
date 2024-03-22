import React from "react";
import { useState, useEffect } from "react";

import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col';
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

import MultiTrackView from './MultiTrackView.react.js'
import SampleMidiDropdown from "../utils/SampleMidiDropdown.js";
import InstListDropdown from "../utils/InstListDropdown.js";

import { Midi } from '@tonejs/midi'
import { ButtonGroup } from "react-bootstrap";


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
    // const [midiFileRaw, setMidiFileRaw] = useState();
    // const [fileName, setFileName] = useState("Drag and drop MIDI file here (4 Bars only!)")
    const [sampleTitle, setSampleTitle] = useState("Sample MIDI");
    const [regenTrackIdx, setRegenTrackIdx] = useState(null);
    const [regenInstNum, setRegenInstNum] = useState();
    const [addInstNum, setAddInstNum] = useState(999);
    // const [isGenerating, setIsGenerating] = useState(false);
    const [regenTrigger, setRegenTrigger] = useState(0);
    const [isAdding, setIsAdding] = useState(false);

    // 서버에서 생성해서 반환해준 미디 파일을 멀티트랙 뷰로 넘겨줌
    useEffect(() => {
        if (props.midiBlob) {
            try {
                const newMidiFile = new Midi(props.midiBlob);
                setMidiFile(newMidiFile);
            } catch (error) {
                console.error('Error parsing MIDI file:', error);
            }
        }
    }, [props.midiBlob])


    // 악기 재생성 trigger
    useEffect(() => {
        regenerateSingleInstrument();
    }, [regenTrigger])

    // 드래그 앤 드롭으로 올린 미디 파일을 멀티트랙 뷰로 보내고 서버에 전송 가능한 형태로 준비시킴
    // const handleFileDrop = async (event) => {
    //     event.preventDefault();

    //     const file = event.dataTransfer.files[0];

    //     if (file) {
    //         try {
    //             setMidiFileRaw(file);

    //             const arrayBuffer = await readFileAsArrayBuffer(file);
    //             const midi = new Midi(arrayBuffer)

    //             setMidiFile(midi);
    //             setFileName(file.name);
    //         } catch (error) {
    //             console.error('Error parsing MIDI file:', error);
    //         }
    //     }
    // };

    // 특정 악기를 Regenerate 하도록 하면, 해당 악기 번호와 해당 악기만 제외한 미디 파일을 서버로 전달
    const regenerateSingleInstrument = () => {
        if (midiFile) {
            try {
                // Index에 해당하는 악기만 빼서 다시 정의
                const newMidi = midiFile.clone();
                newMidi.tracks.splice(regenTrackIdx, 1);
                sendMidiToServerLambda(newMidi, regenInstNum);
            } catch (error) {
                console.error('Error Regenerating Single Instrument:', error)
            }
        }
    }

    // 현재 MIDI File을 서버에 보내고, 추가 혹은 수정된 미디 파일을 받는 함수
    const sendMidiToServerLambda = (midi, instNum) => {
        // props.setIsGenerating(true);
        setIsAdding(true);

        // Create FormData object
        const midiArray = midi.toArray()
        const base64Data = btoa(String.fromCharCode.apply(null, midiArray));

        // Make the POST request using fetch
        fetch("https://gtwdvfyoj9.execute-api.ap-northeast-2.amazonaws.com/default/codeplaySendMidiToServer", { // AWS API Gateway Endpoint
            method: 'POST',
            headers: { "Content-Type": 'application/json', "Accept": "*/*" },
            body: JSON.stringify({
                "midi": base64Data,
                "instnum": instNum,
                "emotion": props.generateConditions.emotion,
                "tempo": props.generateConditions.tempo,
                "genre": props.generateConditions.genre
            })
        })
            .then((response) => {
                const reader = response.body.getReader();
                let receivedData = ''; // Variable to store the received data

                // Define a function to recursively read the response body
                function readResponseBody(reader) {
                    return reader.read().then(async ({ done, value }) => {
                        if (done) {
                            // console.log('Response body fully received');
                            try {
                                // console.log(value)
                                console.log("Response body fully received");
                            } catch (error) {
                                console.error('Error reading file as array buffer:', error);
                            }
                            return;
                        }

                        // Process the received chunk of data (value) here
                        // console.log('Received chunk of data:', value);

                        // Uint8Array 디코딩
                        const string = new TextDecoder().decode(value);
                        let modifiedStr = string.substring(1, string.length - 1);

                        const dataURI = `data:audio/midi;base64,${modifiedStr}`
                        const dataURItoBlob = (dataURI) => {

                            const byteString = atob(dataURI.split(',')[1]);
                            const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

                            let ab = new ArrayBuffer(byteString.length);
                            let ia = new Uint8Array(ab);
                            for (let i = 0; i < byteString.length; i++) {
                                ia[i] = byteString.charCodeAt(i);
                            }

                            return new Blob([ab], { type: mimeString });
                        };

                        const arrayBuffer = await readFileAsArrayBuffer(dataURItoBlob(dataURI));
                        // props.setMidiBlob(arrayBuffer);

                        const midi = new Midi(arrayBuffer)
                        const lastTrack = midi.tracks[midi.tracks.length - 1]
                        const newMidi = midiFile.clone()

                        if (regenTrackIdx !== null) {
                            newMidi.tracks[regenTrackIdx] = lastTrack;
                            setMidiFile(newMidi);
                            setRegenTrackIdx(null);
                        } else {
                            newMidi.tracks.push(lastTrack);
                            setMidiFile(newMidi);
                        }
                        // props.setIsGenerating(false);
                        setIsAdding(false);

                        receivedData += value;

                        // Continue reading the next chunk of data
                        return readResponseBody(reader);
                    }).catch((error) => {
                        console.error('Error reading response body:', error);
                    });
                }
                // Start reading the response body
                readResponseBody(reader);
                // props.setIsGenerating(false)
                setIsAdding(false)

            })
            .catch(error => {
                props.setShowErrorModal(true);
                props.setErrorLog(error.message);
                // props.setIsGenerating(false);
                setIsAdding(false)
            });
    }

    const handleClickAddInst = () => {
        if (addInstNum >= -1 && addInstNum <= 127) {
            sendMidiToServerLambda(midiFile, addInstNum);
        } else {
            // 특정 악기 정하지 않고 그냥 Add Track하는 경우 예외 처리
            sendMidiToServerLambda(midiFile, 999);
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
                downloadLink.download = `generated_midi.mid`;

                // Append the link to the document body
                document.body.appendChild(downloadLink);

                // Trigger the click event on the link
                downloadLink.click();

                // Remove the link from the document body
                document.body.removeChild(downloadLink);

                // Revoke the Blob URL to free up resources
                URL.revokeObjectURL(blobUrl);
            } catch (error) {
                console.error('Error downloading MIDI file:', error)
            }
        }
    }

    const handleLoadSampleMidi = async (sampleMidiPath) => {
        const midiInstance = await Midi.fromUrl(sampleMidiPath);
        setMidiFile(midiInstance);
    }

    return (
        <Col xs={props.arrWidth}>
            <Card>
                <Card.Header as="h5">
                    Generated Music
                </Card.Header>
                <Card.Body>
                    {/* <div
                        onDrop={handleFileDrop}
                        onDragOver={handleDragOver}
                        style={{
                            width: '100%',
                            height: '6vh',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            border: '2px dashed #aaa',
                        }}
                    >
                        <p>{fileName}</p>
                    </div> */}
                    {/* <Row className="mt-2">
                        <Col>

                        </Col>
                    </Row> */}
                    <MultiTrackView
                        midiFile={midiFile}
                        isGenerating={props.isGenerating}
                        isAdding={isAdding}
                        setMidiFile={setMidiFile}
                        setRegenTrackIdx={setRegenTrackIdx}
                        setRegenInstNum={setRegenInstNum}
                        setRegenTrigger={setRegenTrigger}
                    // setIsGenerating={props.setIsGenerating}
                    />
                    {midiFile ?
                        <Row className="mt-3">
                            <Col xs={8}>
                                <Button
                                    className="float-start"
                                    variant="outline-dark"
                                    onClick={handleDownloadMidi}
                                    disabled={props.isGenerating || isAdding}
                                >
                                    Download Current MIDI
                                </Button>
                                <SampleMidiDropdown
                                    sampleTitle={sampleTitle}
                                    handleLoadSampleMidi={handleLoadSampleMidi}
                                    setSampleTitle={setSampleTitle}
                                    isGenerating={props.isGenerating}
                                    isAdding={isAdding}
                                />
                                {/* <Button
                                    className="float-start ms-2"
                                    variant="danger"
                                    onClick={() => { props.setShowErrorModal(true) }}
                                >
                                    Error!
                                </Button> */}
                            </Col>
                            <Col xs={4}>
                                <ButtonGroup className="float-end me-4">
                                    <InstListDropdown
                                        addInstNum={addInstNum}
                                        setAddInstNum={setAddInstNum}
                                    />
                                    <Button
                                        variant="outline-primary"
                                        onClick={handleClickAddInst}
                                        disabled={props.isGenerating || isAdding}
                                    >
                                        {isAdding ? "Adding..." : "Add Inst"}
                                    </Button>
                                </ButtonGroup>
                            </Col>
                        </Row> : null
                    }
                </Card.Body>
            </Card>
        </Col >
    )
}

export default MidiView;