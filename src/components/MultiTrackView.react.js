import React from 'react';
import { useState, useEffect } from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';

import * as Tone from 'tone';

const BEATS_PER_BAR = 4
const NUM_BARS = 4

const MultiTrackView = (props) => {
    const [midiFile, setMidiFile] = useState();
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [msPerBeat, setMsPerBeat] = useState(0);
    const [totalMs, setTotalMs] = useState(0);
    const [synths, setSynths] = useState([]);
    const [soloTrack, setSoloTrack] = useState(-1);
    const [mutedTracks, setMutedTracks] = useState([]);

    // console.log(props.midiFile);

    useEffect(() => {
        let intervalId;
        if (playing) {
            intervalId = setInterval(() => {
                setCurrentTime((prev) => prev + 100);
            }, 100);
        }
        return () => { clearInterval(intervalId); };
    }, [playing]);

    useEffect(() => {
        if (props.midiFile) {
            setMidiFile(props.midiFile);
            setCurrentTime(0);
            setMsPerBeat(60 * 1000 / props.midiFile.header.tempos[0].bpm);
            setTotalMs(60 * 1000 / props.midiFile.header.tempos[0].bpm * BEATS_PER_BAR * NUM_BARS);
        }
    }, [props.midiFile])

    useEffect(() => {
        if (currentTime >= totalMs) {
            setPlaying(false);
            // setCurrentTime(0);
        }
    })


    // Button Click Handlers

    const handleClickPlay = () => {
        setPlaying(prev => !prev);
        playMidi();
        // setCurrentTime(0);
    }

    const handleClickRewind = () => {
        currentTime - msPerBeat > 0 &&
            setCurrentTime(prev => prev - msPerBeat);
    }

    const handleClickForward = () => {
        currentTime + msPerBeat < totalMs &&
            setCurrentTime(prev => prev + msPerBeat);
    }

    const handleClickBeginning = () => {
        setCurrentTime(0);
    }

    const handleClickEnd = () => {
        setCurrentTime(totalMs);
    }

    const handleClickRemove = (trackNum) => {
        removeTrack(trackNum);
    }

    const handleNoteStyle = (idx, time, duration, nextStartTime) => {
        let marginLeft;
        const currentTimeSec = currentTime / 1000;
        const widthPercent = (nextStartTime - time) * 1000 / totalMs * 100

        if (idx == 0 && time != 0) {
            marginLeft = time * 1000 / totalMs * 100;
        } else {
            marginLeft = 0;
        }

        if (time < currentTimeSec && currentTimeSec <= nextStartTime) {
            return { color: "red", padding: "0px", marginLeft: `${marginLeft}%`, width: `${widthPercent}%`, float: "left" }
        } else {
            return { color: "white", padding: "0px", marginLeft: `${marginLeft}%`, width: `${widthPercent}%`, float: "left" }
        }
    }

    const handleProgressBar = () => {
        return { color: "yellow", marginLeft: `${currentTime / totalMs * 100}%` }
    }

    const playMidi = () => {
        // const synths = [];
        if (!playing && midiFile) {
            const now = Tone.now();

            // console.log(now);

            midiFile.tracks.forEach((track) => {
                //create a synth for each track
                const synth = new Tone.PolySynth(Tone.Synth, {
                    envelope: {
                        attack: 0.02,
                        decay: 0.1,
                        sustain: 0.3,
                        release: 0.4,
                    },
                }).toDestination();
                synths.push(synth);
                //schedule all of the events
                track.notes.forEach((note) => {
                    note.time * 1000 >= currentTime &&
                        synth.triggerAttackRelease(
                            note.name,
                            note.duration,
                            note.time + now - currentTime / 1000, // 왜 되지...?
                            note.velocity
                        );
                });
            });
        } else {
            //dispose the synth and make a new one
            while (synths.length) {
                const synth = synths.shift();
                synth.disconnect();
            }
        }
    }

    const removeTrack = (trackNum) => {
        console.log(`Track ${trackNum} Removed`);
        const newMidi = midiFile;
        newMidi.tracks.splice(trackNum, 1);
        setMidiFile(newMidi);
        // midiFile.tracks = midiFile.tracks[0];
    }



    return (
        <>
            <Row>
                <Col>
                    <Button
                        className="mt-3"
                        variant="dark"
                        onClick={handleClickPlay}
                    >
                        {playing ? "PAUSE" : "PLAY"}
                    </Button>
                    <Button
                        className="mt-3 ms-2"
                        variant="dark"
                        onClick={handleClickBeginning}
                    >
                        ◀◀
                    </Button>
                    <Button
                        className="mt-3 ms-2"
                        variant="dark"
                        onClick={handleClickRewind}
                    >
                        ◀
                    </Button>
                    <Button
                        className="mt-3 ms-2"
                        variant="dark"
                        onClick={handleClickForward}
                    >
                        ▶
                    </Button>
                    <Button
                        className="mt-3 ms-2"
                        variant="dark"
                        onClick={handleClickEnd}
                    >
                        ▶▶
                    </Button>
                </Col>
            </Row>
            <Row className="mt-3" style={{ color: "gray" }}>
                <Col xs={2}>
                    Current Time: {(currentTime / 1000).toFixed(1)} (s)
                </Col>
                <Col xs={9} style={{ backgroundColor: "green" }} className="mb-2">
                    <div style={handleProgressBar()}>▼</div>
                </Col>
            </Row>
            {midiFile ? midiFile.tracks.map((track, idx) => (
                track.notes.length > 0 ? // note가 있는 트랙만 표시
                    <Row key={idx}>
                        <Col xs={2}>
                            {track.name}
                        </Col>
                        <Col xs={9}>
                            {/* Notes : {JSON.stringify(track.notes)} */}
                            <Row className="mb-2 p-2" style={{ backgroundColor: "lightblue" }}>
                                {track.notes.map((note, idx) => (
                                    <div key={idx} style={handleNoteStyle(idx, note.time, note.duration, idx < track.notes.length - 1 ? track.notes[idx + 1].time : totalMs / 1000)}>
                                        ♥
                                        {/* {note.pitch} */}
                                        {/* {note.time} */}
                                        {/* {note.duration} */}
                                    </div>
                                ))}
                            </Row>
                        </Col>
                        <Col xs={1}>
                            <Button
                                variant="outline-danger"
                                onClick={() => handleClickRemove(idx)}
                            >
                                X
                            </Button>
                        </Col>
                    </Row>
                    : null
            )) : null}
        </>
    );
}

export default MultiTrackView;