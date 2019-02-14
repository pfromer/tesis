import React from "react";
import { parse } from "./parser/parser";
import { Alert } from "react-bootstrap";

export function ErrorSyntaxAlert(props) {
  if (!props.visible) return null;
  const lines = props.programText.split("\n");
  const errorLineNumbers = parse(props.programText).errors.map(
    a => a.lineNumber
  );
  var errorStyle = { color: "red" };

  var htmlLines = [];

  const appendLines = () => {
    for (var i = 0; i < lines.length; i++) {
      if (errorLineNumbers.includes(i)) {
        htmlLines.push(<div style={errorStyle}>{lines[i]}</div>);
      } else {
        htmlLines.push(<div>{lines[i]}</div>);
      }
      if (/^ *$/.test(lines[i])) {
        htmlLines.push(<br />);
      }
    }
    return htmlLines;
  };

  return (
    <Alert variant="danger">
      <Alert.Heading>Please correct the lines marked in red:</Alert.Heading>
      {appendLines()}
    </Alert>
  );
}
