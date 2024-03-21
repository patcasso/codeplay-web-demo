import React from "react";

import { Dropdown } from "react-bootstrap";
import { DropdownButton } from "react-bootstrap";
import { ButtonGroup } from "react-bootstrap";


const SampleMidiDropdown = (props) => {

    return (
        <DropdownButton
            as={ButtonGroup}
            className="float-end"
            title={props.sampleTitle}
            variant="outline-dark"
        >
            <Dropdown.Item
                as="button"
                key="0"
                onClick={() => {
                    props.handleLoadSampleMidi("./sample_midis/bodynsoul_sample.mid");
                    props.setSampleTitle("Body N Soul");
                }}
            >
                <span>Jazz - Body And Soul</span>
            </Dropdown.Item>
            <Dropdown.Item
                as="button"
                key="1"
                onClick={() => {
                    props.handleLoadSampleMidi("./sample_midis/twentieth_sample.mid");
                    props.setSampleTitle("20th Century Stomp");
                }}
            >
                <span>Jazz - 20th Century Stomp</span>
            </Dropdown.Item>
        </DropdownButton>
    )
}

export default SampleMidiDropdown;