import React from 'react';
import { useState, useEffect } from "react";
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';

function TextPromptView(props) {
    return (
        <Col xs={12 - props.arrWidth}>
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
                        className="mt-3"
                        variant="secondary"
                        onClick={console.log("Button Pressed")}
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