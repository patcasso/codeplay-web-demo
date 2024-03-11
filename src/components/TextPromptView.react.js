import React from 'react';
import { useState, useEffect } from "react";

import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';

// import { Midi } from '@tonejs/midi'

// Server에서 받은 파일 ArrayBuffer로 저장
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


const TextPromptView = (props) => {
  const [showTextPrompt, setShowTextPrompt] = useState(true);

  const sendGenerateRequest = (text) => {
    fetch(
      // "http://0.0.0.0:8000/generate/",
      "http://223.130.130.56:8200/generate_midi/",
      {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "prompt": text,
        }),
      }
    )
      .then((response) => response.blob())
      .then((blob) => readFileAsArrayBuffer(blob))
      .then((arrayBuffer) => {
        console.log(`arrayBuffer: ${arrayBuffer}`);
        // console.log(newMidiData)
        props.setMidiBlob(arrayBuffer)
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <Col
      xs={12 - props.arrWidth}
      className='mb-2'
    >
      <Card>
        <Card.Header as="h5">
          <Row>
            <Col className="d-flex align-items-center">
              Text Prompt
            </Col>
            <Col>
              <Button
                className="float-end"
                variant="outline-secondary"
                size="sm"
                onClick={() => { setShowTextPrompt((prev) => !prev) }}
              >
                {showTextPrompt ? "Hide" : "Show"}
              </Button>
            </Col>
          </Row>
        </Card.Header>
        {showTextPrompt ?
          <Card.Body>
            <InputGroup>
              <Form.Control
                id="prompt-input-field"
                type="text"
                placeholder="Enter prompt"
                onChange={(event) => {
                  console.log(event)
                }}
                autoFocus="autofocus"
              />
            </InputGroup>
            <Button
              className="mt-3 float-end"
              variant="secondary"
              // onClick={console.log("Button Pressed")}
              onClick={() => { sendGenerateRequest("BOS_None") }}
            // onClick={sendGenerateRequest}
            // disabled={textInput === ""}
            >
              Generate 🪄
            </Button>
          </Card.Body>
          : null}
      </Card>
    </Col>
  );
}
export default TextPromptView;