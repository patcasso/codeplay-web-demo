import React from "react";

import { Dropdown } from "react-bootstrap";
import { ButtonGroup } from "react-bootstrap";
import { instrumentMap } from "./InstrumentList";


const InstListDropdown = (props) => {

    const instNumToName = () => {
        if (props.addInstNum === 999) {
            return "Random";
        } else if (props.addInstNum === -1) {
            return "Drums";
        } else {
            return instrumentMap[props.addInstNum];
        }
    };

    return (
        <Dropdown
            as={ButtonGroup}
            className="float-end"
            variant="outline-dark"
            drop="up"
        >
            <Dropdown.Toggle
                variant="outline-dark"
                id="dropdown-basic"
            >
                {instNumToName()}
            </Dropdown.Toggle>
            <Dropdown.Menu
                style={{
                    maxHeight: "500px",
                    overflowY: "auto",
                }}>
                <Dropdown.Item
                    as="button"
                    onClick={() => {
                        props.setAddInstNum(999);
                    }}
                >
                    <span>Random</span>
                </Dropdown.Item>
                <Dropdown.Item
                    as="button"
                    onClick={() => {
                        props.setAddInstNum(-1);
                    }}
                >
                    <span>Drums</span>
                </Dropdown.Item>
                {Object.entries(instrumentMap).map(([key, value]) => (
                    <Dropdown.Item
                        as="button"
                        key={key}
                        onClick={() => {
                            props.setAddInstNum(parseInt(key));
                        }}
                    >
                        <span>{value}</span>
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    )
}

export default InstListDropdown;