import React from 'react';
import { useState, useEffect } from "react";
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';

const sendGenerateRequest = (text) => {
  fetch(
    "http://0.0.0.0:8000/generate/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        //   "text": "BOS_None",
        "text": text,
      }),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error(error);
    });
};

function TextPromptView(props) {
  return (
    <Col
      xs={12 - props.arrWidth}
      className='mb-2'
    >
      <Card>
        <Card.Header as="h5">
          Text Prompt
        </Card.Header>
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
          // disabled={textInput === ""}
          >
            Generate 🪄
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );
}
export default TextPromptView;