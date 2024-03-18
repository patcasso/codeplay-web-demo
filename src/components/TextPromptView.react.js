import React from 'react';
import { useState, useEffect } from "react";

import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';

import { Midi } from '@tonejs/midi'

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

  const sendGenerateRequest = () => {
    setIsGenerating(true);
    fetch(
      // "http://0.0.0.0:8000/generate/",
      "https://223.130.162.67:8200/generate_midi/",
      {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "prompt": prompt,
        }),
      }
    )
      .then((response) => response.blob())
      .then((blob) => readFileAsArrayBuffer(blob))
      .then((arrayBuffer) => {
        console.log(arrayBuffer)
        props.setMidiBlob(arrayBuffer)
        setIsGenerating(false);
      })
      .catch((error) => {
        console.error(error);
        alert(`Something went wrong. Please try again! \n\n[Error Message]\n${error}`)
        setIsGenerating(false);
      });

  };

  const sendLambdaRequest = () => {
    setIsGenerating(true);
    fetch(
      // "http://0.0.0.0:8000/generate/",
      "https://zab3ww1o85.execute-api.ap-northeast-2.amazonaws.com/default/codeplayGenerateFromPrompt",
      {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Accept": "*/*"
          // "x-api-key": "srCLnpGgZW4bovH9rgvWs6NVJkGaxKhi1KkIRZOb"
        },
        body: JSON.stringify({
          "prompt": prompt,
        }),
      }
    )
      .then((response) => {
        console.log(response.body);
        
        const reader = response.body.getReader();
        let receivedData = ''; // Variable to store the received data

        // Define a function to recursively read the response body
        function readResponseBody(reader) {
          return reader.read().then(async ({ done, value }) => {
            if (done) {
              console.log('Response body fully received');
              console.log('Received data:', receivedData); // Access the received data here
              // console.log(receivedData.split(","))

              // const blob = new Blob([receivedData])
              // console.log(`blob: ${blob}`)
              try {
                // const arrayBuffer = await readFileAsArrayBuffer(blob);
                // console.log(`arrayBuffer: ${arrayBuffer}`);

                // props.setMidiBlob(arrayBuffer);
              } catch (error) {
                console.error('Error reading file as array buffer:', error);
              }
              return;
            }

            // Process the received chunk of data (value) here
            console.log('Received chunk of data:', value);

            // Uint8Array 디코딩
            const string = new TextDecoder().decode(value);
            let modifiedStr = string.substring(1, string.length - 1);
            console.log(modifiedStr)

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

            console.log(dataURItoBlob(dataURI));
            const arrayBuffer = await readFileAsArrayBuffer(dataURItoBlob(dataURI));
            console.log(arrayBuffer)
            props.setMidiBlob(arrayBuffer);
            
  

            // base64 디코딩
            console.log(atob(modifiedStr))
            const midi = new Midi(atob(modifiedStr))
            // console.log(midi)

            // props.setMidiBlob(atob(modifiedStr));

            receivedData += value;

            // Continue reading the next chunk of data
            return readResponseBody(reader);
          }).catch((error) => {
            console.error('Error reading response body:', error);
          });
        }

        // Start reading the response body
        readResponseBody(reader);
        // response.json()
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
        sendGenerateRequest();
      } else {
        return;
      }
    } else {
      sendGenerateRequest();
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
              variant="secondary"
              onClick={handleClickGenerate}
              // disabled={textInput === ""}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating 🕐" : "Generate 🪄"}
            </Button>
            <Button
              className="mt-3 me-2 float-end"
              variant="danger"
              onClick={sendLambdaRequest}
              // disabled={textInput === ""}
              disabled={isGenerating}
            >
              Lambda Request
            </Button>
          </Card.Body>
          : null}
      </Card>
    </Col>
  );
}
export default TextPromptView;