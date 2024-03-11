import React from "react";
import { useState, useEffect } from "react";

import SingleTrackView from './SingleTrackView.react.js'

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

import Soundfont from "soundfont-player";
import * as Tone from "tone";

import { instrumentObj } from "../utils/InstrumentList";

const BEATS_PER_BAR = 4;
const NUM_BARS = 4;

// console.log(instrumentList);
const ac = new AudioContext();

const MultiTrackView = (props) => {
  const [midiFile, setMidiFile] = useState();
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [msPerBeat, setMsPerBeat] = useState(0);
  const [totalMs, setTotalMs] = useState(0);
  const [synths, setSynths] = useState([]);
  const [soloTrack, setSoloTrack] = useState([]);
  const [mutedTracks, setMutedTracks] = useState([]);
  const [instrumentArray, setInstrumentArray] = useState([]);

  // console.log(props.midiFile);


  useEffect(() => {
    let intervalId;
    if (playing) {
      intervalId = setInterval(() => {
        setCurrentTime((prev) => prev + 100);
      }, 100);
    }
    return () => {
      clearInterval(intervalId);
    };
  }, [playing]);

  useEffect(() => {
    if (props.midiFile) {
      setMidiFile(props.midiFile);
      setCurrentTime(0);
      setMsPerBeat((60 * 1000) / props.midiFile.header.tempos[0].bpm);
      setTotalMs(
        ((60 * 1000) / props.midiFile.header.tempos[0].bpm) *
        BEATS_PER_BAR *
        NUM_BARS
      );
    }
  }, [props.midiFile]);

  useEffect(() => {
    if (currentTime >= totalMs) {
      setPlaying(false);
      // setCurrentTime(0);
    }
  });

  // Midi Playing / Editing Functions

  const playInstrument = () => {
    const acTime = ac.currentTime;
    // console.log(acTime); // 현재 AudioContext가 시작되고 난 후의 시간
    setCurrentTime((prev) => prev - 500);

    midiFile &&
      midiFile.tracks.forEach((track) => {
        // const track = midiFile.tracks[2];
        // console.log(instrumentObj[track.instrument.number]);
        let inst = instrumentObj[track.instrument.number];
        if (!inst) {
          inst = "marimba";
        }
        const notes_arr = [];
        track.notes.forEach((note) => {
          notes_arr.push({
            time: note.time,
            note: note.name,
            duration: note.duration,
          });
        });
        const audioContext = Soundfont.instrument(ac, inst).then(function (play) {
          instrumentArray.push(play)
          play.schedule(acTime + 0.5, notes_arr);
        });
      });
  };

  // TODO : 정지 버튼 개발
  const stopInstrument = () => {
    console.log("Stop audio context");
    ac.close();
  };

  const playMidi = () => {
    // const synths = [];
    if (!playing && midiFile) {
      const now = Tone.now();

      midiFile.tracks.forEach((track, idx) => {
        if (soloTrack.length > 0 && !soloTrack.includes(idx)) {
          return;
        }

        if (mutedTracks.includes(idx)) {
          return;
        }

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
  };

  const removeTrack = (trackNum) => {
    console.log(`Track ${trackNum} Removed`);
    const newMidi = { ...midiFile };
    newMidi.tracks.splice(trackNum, 1);
    setMidiFile(newMidi);
  };

  // Button Click Handlers

  const handleClickPlay = () => {
    setPlaying((prev) => !prev);
    playMidi();
    // setCurrentTime(0);
  };
  const handleClickRewind = () => {
    currentTime - msPerBeat > 0 && setCurrentTime((prev) => prev - msPerBeat);
  };

  const handleClickForward = () => {
    currentTime + msPerBeat < totalMs &&
      setCurrentTime((prev) => prev + msPerBeat);
  };

  const handleClickBeginning = () => {
    setCurrentTime(0);
  };

  const handleClickEnd = () => {
    setCurrentTime(totalMs);
  };

  const handleClickRemove = (trackNum) => {
    if (window.confirm(`Are you sure to delete the track?`)) {
      removeTrack(trackNum);
    } else {
      return;
    }
  };

  const handleClickPlayInstrument = () => {
    setPlaying((prev) => !prev);
    playInstrument();
  };

  const handleClickStopInstrument = () => {
    setPlaying((prev) => !prev);
    stopInstrument();
  };

  const handleClickACPause = () => {
    // console.log("paused")
    console.log(instrumentArray)
    instrumentArray.forEach((inst) => {
      inst.stop()
    })
    setInstrumentArray([]);
    setPlaying((prev) => !prev)
    // setCurrentTime(0)
  }

  const handleNoteStyle = (idx, time, duration, nextStartTime) => {
    let marginLeft;
    const currentTimeSec = currentTime / 1000;
    const widthPercent = (((nextStartTime - time) * 1000) / totalMs) * 100;

    if (idx == 0 && time != 0) {
      marginLeft = ((time * 1000) / totalMs) * 100;
    } else {
      marginLeft = 0;
    }

    if (time < currentTimeSec && currentTimeSec <= nextStartTime) {
      return {
        color: "red",
        padding: "0px",
        marginLeft: `${marginLeft}%`,
        width: `${widthPercent}%`,
        float: "left",
      };
    } else {
      return {
        color: "white",
        padding: "0px",
        marginLeft: `${marginLeft}%`,
        width: `${widthPercent}%`,
        float: "left",
      };
    }
  };

  const handleProgressBar = () => {
    return { color: "yellow", marginLeft: `${(currentTime / totalMs) * 100}%` };
  };

  const handleSoloButton = (idx) => {
    // console.log(idx);
    if (soloTrack.includes(idx)) {
      const newSoloTrack = [...soloTrack].filter((track) => track !== idx);
      setSoloTrack(newSoloTrack);
    } else if (mutedTracks.includes(idx)) {
      const newMutedTrack = [...mutedTracks].filter((track) => track !== idx);
      setMutedTracks(newMutedTrack);
      const newSoloTrack = [...soloTrack].concat(idx);
      setSoloTrack(newSoloTrack);
    } else {
      const newSoloTrack = [...soloTrack].concat(idx);
      setSoloTrack(newSoloTrack);
    }
  };

  const handleMuteButton = (idx) => {
    // console.log(idx);
    if (mutedTracks.includes(idx)) {
      const newMutedTrack = [...mutedTracks].filter((track) => track !== idx);
      setMutedTracks(newMutedTrack);
    } else if (soloTrack.includes(idx)) {
      const newSoloTrack = [...soloTrack].filter((track) => track !== idx);
      setSoloTrack(newSoloTrack);
      const newMutedTrack = [...mutedTracks].concat(idx);
      setMutedTracks(newMutedTrack);
    } else {
      const newMutedTrack = [...mutedTracks].concat(idx);
      setMutedTracks(newMutedTrack);
    }
  };

  return (
    <>
      <Row>
        <Col className="mt-3">
          <Button variant="dark" onClick={handleClickPlay}>
            {playing ? "PAUSE" : "PLAY"}
          </Button>
          <Button
            className="ms-2"
            variant="dark"
            onClick={handleClickBeginning}>
            ◀◀
          </Button>
          <Button
            className="ms-2"
            variant="dark"
            onClick={handleClickRewind}>
            ◀
          </Button>
          <Button
            className="ms-2"
            variant="dark"
            onClick={handleClickForward}>
            ▶
          </Button>
          <Button className="ms-2" variant="dark" onClick={handleClickEnd}>
            ▶▶
          </Button>
          <Button
            className="ms-2"
            disabled={playing}
            variant="dark"
            onClick={handleClickPlayInstrument}>
            Play INST
          </Button>
          <Button
            disabled={!playing}
            className="ms-2"
            variant="dark"
            onClick={handleClickStopInstrument}>
            Kill INST
          </Button>
          <Button
            onClick={handleClickACPause}
            className="ms-2"
            variant="outline-dark"
          >
            Pause Test
          </Button>
        </Col>
      </Row>
      <Row className="mt-3" style={{ color: "gray" }}>
        <Col xs={2}>Current Time: {(currentTime / 1000).toFixed(1)} (s)</Col>
        <Col xs={9} style={{ backgroundColor: "green" }} className="mb-2">
          <div style={handleProgressBar()}>▼</div>
        </Col>
        <Col xs={1}>
        </Col>
      </Row>
      {midiFile
        ? midiFile.tracks.map((track, idx) =>
          track.notes.length > 0 ? ( // note가 있는 트랙만 표시
            <SingleTrackView
              key={idx}
              idx={idx}
              track={track}
              playing={playing}
              totalMs={totalMs}
              soloTrack={soloTrack}
              mutedTracks={mutedTracks}
              handleClickRemove={handleClickRemove}
              handleSoloButton={handleSoloButton}
              handleMuteButton={handleMuteButton}
              handleNoteStyle={handleNoteStyle}
              setRegenTrackIdx={props.setRegenTrackIdx}
              setRegenInstNum={props.setRegenInstNum}
            />
          ) : null
        )
        : null}
    </>
  );
};

export default MultiTrackView;
