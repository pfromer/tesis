import React from "react";
import { parse } from "./parser/parser";
import { Alert } from "react-bootstrap";

export function ErrorSyntaxAlert(props) {
  if (!props.visible) return null;

  var program =  parse(props.programText);
  debugger

  var thereAreSyntaxErrors = program.programStructure.some(l => l.type == "SYNTAX_ERROR");
  var thereAreUngardedTgds = program.programStructure.some(l => l.type == "UNAGARDED_TGD");
  var somethingIsWrong = thereAreSyntaxErrors || thereAreUngardedTgds;

  if(!somethingIsWrong) return null;


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
      { thereAreSyntaxErrors &&
          <Alert.Heading >
            Please correct the syntax errors marked in red:
          </Alert.Heading>
      }
      { thereAreUngardedTgds &&
          <Alert.Heading >
            Please correct the ungarded TGDS marked in blue:
          </Alert.Heading>
      }     
      {appendLines()}
    </Alert>
  );
  
}
