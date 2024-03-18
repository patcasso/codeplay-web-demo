import React from "react";
import { useState, useEffect } from "react";

import SingleTrackView from './SingleTrackView.react.js'

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

import Soundfont from "soundfont-player";
import * as Tone from "tone";

import { instrumentMap } from "../utils/InstrumentList";
import { trackColorsArray } from "../utils/trackColors.js";
import { notePositions } from "../utils/notePositions.js";

const BEATS_PER_BAR = 4;
const NUM_BARS = 4;

const progressBarStyle = {
  backgroundColor: "#35a64a",
  // border: "1.5px solid #529e67",
  borderRadius: "7px"
  // height: "3vh"
}

// 페이지를 로드할 때 하나의 AudioContext 만들어 시간을 추적하며 계속해서 사용
const audioContext = new AudioContext();

const MultiTrackView = (props) => {
  const [midiFile, setMidiFile] = useState();
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [msPerBeat, setMsPerBeat] = useState(0);
  const [totalMs, setTotalMs] = useState(0);
  const [synths, setSynths] = useState([]);
  const [soloTrack, setSoloTrack] = useState([]);
  const [mutedTracks, setMutedTracks] = useState([]);
  const [instrumentObject, setInstrumentObject] = useState({});

  // currentTime 업데이트
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

  // midiFile prop 내려오면 멀티트랙으로 적용시키기
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
      props.midiFile.tracks.forEach((track, idx) => {
        let inst = instrumentMap[track.instrument.number];

        if (!inst) {
          inst = "acoustic_grand_piano"; // TODO : 없는 악기 piano로 임시 대체했는데, 모든 미디 악기 분류해서 mapping 해주기
        } else if (track.instrument.percussion === true) {
          inst = "synth_drum" // Drum 일단 대체
        }
        Soundfont.instrument(audioContext, inst).then(function (play) {
          setInstrumentObject((prev) => {
            return { ...prev, [idx]: play };
          });
        });
      })
    }
  }, [props.midiFile]);

  // 총 duration 시간 넘어가면 자동으로 재생 멈추게 하기
  useEffect(() => {
    if (currentTime >= totalMs) {
      setPlaying(false);
      setCurrentTime(0);
    }
  });

  // Solo 및 Mute 트랙 볼륨 처리
  useEffect(() => {
    if (instrumentObject) {
      // 1. Solo가 켜 있을 때
      if (soloTrack.length > 0) {
        Object.entries(instrumentObject).forEach(([idx, inst]) => {
          if (soloTrack.includes(Number(idx))) {
            inst.out.gain.value = 1
          } else {
            inst.out.gain.value = 0
          }
        })
      } else if (soloTrack.length == 0) {
        // 2-1. Solo가 꺼 있고, Mute는 켜 있을 때
        if (mutedTracks.length > 0) {
          Object.entries(instrumentObject).forEach(([idx, inst]) => {
            if (mutedTracks.includes(Number(idx))) {
              inst.out.gain.value = 0
            } else {
              inst.out.gain.value = 1
            }
          })
        } else if (mutedTracks.length == 0) {
          // 2-2. Solo도 꺼 있고, Mute도 꺼 있을 때
          Object.entries(instrumentObject).forEach(([idx, inst]) => {
            inst.out.gain.value = 1
          })
        }
      }
    }
  }, [instrumentObject, soloTrack, mutedTracks])


  // ======== Midi Playing / Editing Functions


  // Play Midi in soundfont instruments
  const playInstrument = () => {
    const acTime = audioContext.currentTime;

    midiFile &&
      midiFile.tracks.forEach((track, idx) => {
        let inst = instrumentMap[track.instrument.number];
        if (!inst) {
          inst = "marimba";
        }
        const notes_arr = [];
        track.notes.forEach((note) => {
          note.time * 1000 >= currentTime &&
            notes_arr.push({
              time: note.time - currentTime / 1000,
              note: note.name,
              duration: note.duration,
            });
        });
        instrumentObject[idx].schedule(acTime, notes_arr);
      });
  };

  // Pause Instrument at current position
  const pauseInstrument = () => {
    Object.entries(instrumentObject).forEach(([idx, inst]) => {
      inst.stop()
    })
  }

  // Stop Button
  const stopInstrument = () => {
    Object.entries(instrumentObject).forEach(([idx, inst]) => {
      inst.stop()
    })
    setCurrentTime(0);
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
    const newMidi = midiFile.clone()
    newMidi.tracks.splice(trackNum, 1);
    props.setMidiFile(newMidi);
  };

  const assignTrackColor = (idx) => {
    return trackColorsArray[idx % trackColorsArray.length]
  }


  // ==== Event Handlers ======

  const handleClickPlay = () => {
    setPlaying((prev) => !prev);
    playMidi();
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
    if (playing) {
      pauseInstrument();
    } else {
      playInstrument();
    }
    setPlaying((prev) => !prev);
  };

  const handleClickStopInstrument = () => {
    if (playing) {
      setPlaying((prev) => !prev);
      stopInstrument();
    } else {
      setCurrentTime(0);
    }
  };

  const handleNoteStyle = (idx, time, duration, nextStartTime, pitch) => {
    // console.log(pitch)
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
        position: "relative",
        color: "#eb4b5d",
        padding: "0px",
        height:"15%",
        bottom: `${notePositions[pitch]}%`,
        marginLeft: `${marginLeft}%`,
        width: `${widthPercent}%`,
        float: "left",
      };
    } else {
      return {
        position: "relative",
        color: "white",
        padding: "0px",
        height:"15%",
        bottom: `${notePositions[pitch]}%`,
        marginLeft: `${marginLeft}%`,
        width: `${widthPercent}%`,
        float: "left",
      };
    }
  };

  const handleProgressBar = () => {
    return { color: "white", marginLeft: `${(currentTime / totalMs) * 100}%` };
  };

  const handleSoloButton = (idx) => {
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
          <Button
            variant="dark"
            onClick={handleClickPlayInstrument}>
            {playing ? "PAUSE" : "PLAY"}
          </Button>
          <Button
            className="ms-2"
            variant="dark"
            onClick={handleClickStopInstrument}>
            ■
            {/* STOP */}
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
            className="ms-2 float-middle"
            variant="dark"
            onClick={handleClickPlay}>
            {playing ? "PAUSE" : "PLAY 8bit"}
          </Button>
        </Col>
      </Row>
      <Row className="mt-3" style={{ color: "gray" }}>
        <Col xs={2}>Current Time: {(currentTime / 1000).toFixed(1)} (s)</Col>
        <Col xs={9} style={progressBarStyle} className="mb-2">
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
                color={assignTrackColor(idx)}
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
                setRegenTrigger={props.setRegenTrigger}
                isGenerating={props.isGenerating}
                instrumentTrack={instrumentObject[idx]}
              />
            ) : null
          )
          : null}
    </>
  );
};

export default MultiTrackView;