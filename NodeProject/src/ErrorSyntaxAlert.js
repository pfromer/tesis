import React from "react";
import { parse } from "./parser/parser";
import { Alert } from "react-bootstrap";

export function ErrorSyntaxAlert(props) {
  if (!props.visible) return null;


  var program =  parse(props.programText);

  const errorColors = { "SYNTAX_ERROR" : "red", "UNAGARDED_TGD" : "blue"};

  const getColorByLineType = function(lineType){
    var color = errorColors[lineType];
    return color ? color : "black";
  }

  const appendLines = () => {
    var htmlLines = [];
    for (var i = 0; i < program.programStructure.length; i++) {
        htmlLines.push(<div style={({color : getColorByLineType(program.programStructure[i].type)})}>{program.programStructure[i].text}</div>);
      } 
      return htmlLines;
    }

  return (
    <Alert variant="danger">
      <Alert.Heading>Please correct the lines marked in red:</Alert.Heading>
      {appendLines()}
    </Alert>
  );
  
}
