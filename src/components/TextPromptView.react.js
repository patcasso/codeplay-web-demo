import React from 'react';
import { useState, useEffect } from "react";

import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';

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
  const [prompt, setPrompt] = useState("");
  const [showTextPrompt, setShowTextPrompt] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const sendLambdaRequest = () => {
    setIsGenerating(true);
    fetch(
      "https://zab3ww1o85.execute-api.ap-northeast-2.amazonaws.com/default/codeplayGenerateFromPrompt",
      {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Accept": "*/*"
        },
        body: JSON.stringify({
          "prompt": prompt,
        }),
      }
    )
      .then((response) => {
        const reader = response.body.getReader();
        let receivedData = ''; // Variable to store the received data

        // Define a function to recursively read the response body
        function readResponseBody(reader) {
          return reader.read().then(async ({ done, value }) => {
            if (done) {
              console.log('Response body fully received');
              // console.log('Received data:', receivedData); // Access the received data here
              try {
                console.log(value);
              } catch (error) {
                console.error('Error reading file as array buffer:', error);
              }
              return;
            }

            // Uint8Array 디코딩
            const string = new TextDecoder().decode(value);
            let modifiedStr = string.substring(1, string.length - 1);

            // Blob 생성
            const dataURI = `data:audio/midi;base64,${modifiedStr}`
            const dataURItoBlob = (dataURI) => {
              
              const byteString = atob(dataURI.split(',')[1]);
              const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
            
              let ab = new ArrayBuffer(byteString.length);
              let ia = new Uint8Array(ab);
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
            
              return new Blob([ab], {type: mimeString});
            };

            const arrayBuffer = await readFileAsArrayBuffer(dataURItoBlob(dataURI));
            props.setMidiBlob(arrayBuffer);

            receivedData += value;

            // Continue reading the next chunk of data
            return readResponseBody(reader);
          }).catch((error) => {
            console.error('Error reading response body:', error);
          });
        }

        // Start reading the response body
        readResponseBody(reader);

        // Set Generating to false when done generating
        setIsGenerating(false)
      })
      .catch((error) => {
        console.error(error);
        alert(`Something went wrong. Please try again! \n\n[Error Message]\n${error}`)
        setIsGenerating(false);
      });

  };

  const handleClickGenerate = () => {
    if (props.midiBlob) {
      if (window.confirm(`Delete current tracks and generate new tracks?`)) {
        // sendGenerateRequest();
        sendLambdaRequest();
      } else {
        return;
      }
    } else {
      // sendGenerateRequest();
      sendLambdaRequest();
    }
  }

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
                value={prompt}
                onChange={(event) => {
                  setPrompt(event.target.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleClickGenerate()
                  } else if (event.key === "Escape") {
                    setPrompt("")
                  }
                }}
                autoFocus="autofocus"
              />
            </InputGroup>
            <Button
              className="mt-3 float-end"
              variant="primary"
              onClick={handleClickGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating 🕐" : "Generate 🪄"}
            </Button>
          </Card.Body>
          : null}
      </Card>
    </Col>
  );
}
export default TextPromptView;