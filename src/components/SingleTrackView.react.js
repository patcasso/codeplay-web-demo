import React from "react";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

const SingleTrackView = (props) => {

    const handleClickRegenerate = () => {
        props.setRegenTrackIdx(props.idx);
        props.setRegenInstNum(props.track.instrument.number);
        props.setRegenTrigger((prev) => prev + 1);
    }

    return (
        <Row key={props.idx}>
            <Col xs={1} className="d-flex">
                <div className="me-2">
                    {props.idx}
                </div>
                <div>
                    {props.track.name}
                </div>
            </Col>
            <Col xs={1}>
                <Button
                    className="float-end"
                    disabled={props.playing}
                    variant="outline-danger"
                    onClick={() => props.handleClickRemove(props.idx)}
                    size="sm"
                >
                    X
                </Button>
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
            </Col>
            <Col xs={9}>
                {/* Notes : {JSON.stringify(track.notes)} */}
                <Row
                    className="mb-2 p-2"
                    style={{ backgroundColor: "lightblue" }}>
                    {props.track.notes.map((note, idx) => (
                        <div
                            key={idx}
                            style={props.handleNoteStyle(
                                idx,
                                note.time,
                                note.duration,
                                idx < props.track.notes.length - 1
                                    ? props.track.notes[idx + 1].time
                                    : props.totalMs / 1000
                            )}>
                            ♥{/* {note.pitch} */}
                            {/* {note.time} */}
                            {/* {note.duration} */}
                        </div>
                    ))}
                </Row>
            </Col>
            <Col xs={1}>
                <Button
                    size="sm"
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