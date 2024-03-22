import React from "react";
import { useState, useEffect } from "react"

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

import { getIconName } from "../utils/IconMapping";

const relativeToAbsoluteTime = (relativeTime, bpm) => {
    // return relativeTime * 120 / bpm;
    return relativeTime;
}

const SingleTrackView = (props) => {
    const [startTimes, setStartTimes] = useState([]);

    useEffect(() => {
        let startTimeSet = new Set();
        props.track.notes.forEach((note) => {
            // startTimeSet.add(note.time);
            startTimeSet.add(relativeToAbsoluteTime(note.time, props.bpm));
        })
        const startTimeArray = Array.from(startTimeSet);
        setStartTimes(startTimeArray);
    }, [props.track])

    const trackAreaStyle = {
        backgroundColor: props.color,
        height: '7vh',
        borderRadius: '10px',
        marginBottom: '7px',
        alignItems: "flex-end"
    }
    const handleClickRegenerate = () => {
        if (props.track.instrument.percussion === true) {
            props.setRegenInstNum(-1);
        } else {
            props.setRegenInstNum(props.track.instrument.number);
        }
        props.setRegenTrackIdx(props.idx);
        props.setRegenTrigger((prev) => prev + 1);
    }
    let instNum;
    if (props.track.instrument.percussion === true) {
        instNum = -1;
    } else {
        instNum = props.track.instrument.number;
    }

    return (
        <Row key={props.idx}>
            <Col xs={1} className="d-flex align-items-center">
                <div className="me-2">
                    <img src={`./inst_icons/${getIconName(instNum)}.png`} width="25px" />
                </div>
                <div style={{ maxHeight: "7vh", overflowY: "hidden" }}>
                    {props.track.name}
                </div>
            </Col>
            <Col xs={1} className="d-flex align-items-center">
                <Button
                    className="float-end"
                    disabled={props.isGenerating || props.isAdding}
                    variant="outline-primary"
                    onClick={() => props.handleSoloButton(props.idx)}
                    active={props.soloTrack.includes(props.idx)}
                    size="sm"
                >
                    S
                </Button>
                <Button
                    className="float-end"
                    disabled={props.isGenerating || props.isAdding}
                    variant="outline-secondary"
                    onClick={() => props.handleMuteButton(props.idx)}
                    active={props.mutedTracks.includes(props.idx)}
                    size="sm"
                >
                    M
                </Button>
                <Button
                    className="float-end"
                    disabled={props.playing || props.isGenerating}
                    variant="outline-danger"
                    onClick={() => props.handleClickRemove(props.idx)}
                    size="sm"
                >
                    X
                </Button>
            </Col>
            <Col xs={9}>
                <Row
                    className="p-2 d-flex"
                    style={trackAreaStyle}>
                    <div style={{
                        height: "100%",
                        position: "relative",
                        display: "flex",
                        alignItems: "flex-end"
                    }}>
                        {props.track.notes.map((note, idx) => (
                            <div
                                key={idx}
                                style={props.handleNoteStyle(
                                    idx,
                                    relativeToAbsoluteTime(note.time, props.bpm),
                                    note.duration,
                                    relativeToAbsoluteTime(note.time, props.bpm) == startTimes[startTimes.length - 1]
                                        ? props.totalMs / 1000
                                        : startTimes[startTimes.indexOf(relativeToAbsoluteTime(note.time, props.bpm)) + 1],
                                    note.pitch
                                )}>
                            </div>
                        ))}
                    </div>
                </Row>
            </Col>
            <Col xs={1} className="d-flex align-items-center">
                <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={handleClickRegenerate}
                    disabled={props.isGenerating || props.isAdding || props.playing}
                >
                    ↺
                </Button>
            </Col>
        </Row>
    )
}

export default SingleTrackView;