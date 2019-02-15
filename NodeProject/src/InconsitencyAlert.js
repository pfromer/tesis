import React from "react";
import { Alert } from "react-bootstrap";
import { OverlayTrigger } from "react-bootstrap";
import { Popover } from "react-bootstrap";
import { Results } from "./QueryResult";

export function InconsistencyAlert(props) {
  if (props.inconsistencies.length == 0) return null;

  return (
    <Alert variant="danger">
      <Alert.Heading>
        The following negative constraints are not fulfilled by your program.
      </Alert.Heading>
      {props.inconsistencies.map(inconsistency => (
        <OverlayTrigger
          trigger="hover"
          placement="right"
          key={inconsistency.nc.toString()}
          overlay={
            <Popover>
              <Results visible={true} data={inconsistency.result} />
            </Popover>
          }
        >
          <div>{inconsistency.nc.toString()}</div>
        </OverlayTrigger>
      ))}
    </Alert>
  );
}
