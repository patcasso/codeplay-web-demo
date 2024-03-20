import React from "react";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

import { getIconName } from "../utils/IconMapping";

const SingleTrackView = (props) => {

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
    
    // console.log(instNum);
    // console.log(getIconName(instNum));


    return (
        <Row key={props.idx}>
            {/* <Col xs={1} className="d-flex align-items-center"> */}
            <Col xs={1} className="d-flex align-items-center">
                <div className="me-2">
                    <img src={`./inst_icons/${getIconName(instNum)}.png`} width="25px" />
                </div>
                <div>
                    {props.track.name}
                </div>
            </Col>
            <Col xs={1} className="d-flex align-items-center">
                <Button
                    className="float-end"
                    variant="outline-primary"
                    onClick={() => props.handleSoloButton(props.idx)}
                    active={props.soloTrack.includes(props.idx)}
                    size="sm"
                >
                    S
                </Button>
                <Button
                    className="float-end"
                    variant="outline-secondary"
                    onClick={() => props.handleMuteButton(props.idx)}
                    active={props.mutedTracks.includes(props.idx)}
                    size="sm"
                >
                    M
                </Button>
                <Button
                    className="float-end"
                    disabled={props.playing}
                    variant="outline-danger"
                    onClick={() => props.handleClickRemove(props.idx)}
                    size="sm"
                >
                    X
                </Button>
            </Col>
            <Col xs={9}>
                <Row
                    // className="p-2 d-flex align-items-center"
                    className="p-1 d-flex"
                    style={trackAreaStyle}>
                    <div style={{ height: "100%", position: "relative", display: "flex", alignItems: "flex-end" }}>
                        {props.track.notes.map((note, idx) => (
                            <div
                                key={idx}
                                style={props.handleNoteStyle(
                                    idx,
                                    note.time,
                                    note.duration,
                                    idx < props.track.notes.length - 1
                                        ? props.track.notes[idx + 1].time
                                        : props.totalMs / 1000,
                                    note.pitch
                                )}>
                                ♥
                                {/* ● */}
                                {/* {note.pitch} */}
                                {/* {note.time} */}
                                {/* {note.duration} */}
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
                    disabled={props.isGenerating || props.playing}
                >
                    ↺
                </Button>
            </Col>
        </Row>
    )
}

export default SingleTrackView;