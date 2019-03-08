import React from "react";
import { Col } from "react-bootstrap";
import { Form } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { parse } from "./parser/parser";

export class LoadProgramButton extends React.Component {
  constructor(props) {
    super(props); 

    this.fileReader = new FileReader();

    this.handleLoadProgramClick = this.handleLoadProgramClick.bind(this);
    this.handleFileRead = this.handleFileRead.bind(this);
    this.handleFileChosen = this.handleFileChosen.bind(this);
  }


  handleLoadProgramClick(event) {
    document.getElementById("hiddenFileButton").click();
  }

  handleFileRead = function(e){
    const content = this.fileReader.result;
    console.log(content);
    this.props.onFileLoaded( content);
  }

  handleFileChosen = function(file){
    if(file){
      this.fileReader.onloadend = this.handleFileRead;
      this.fileReader.readAsText(file);
    }
  }

  render() {
    return (
    <div>
       <Col style={{display:"none"}}>
        <input type='file'
                id='hiddenFileButton'
                accept='.dtg,.txt'
                onChange={e => this.handleFileChosen(e.target.files[0])}>
        </input>
      </Col>
      <Form.Group>
        <Button type="button" 
                variant="info"
                style={{ width: "100%" }}
                onClick={this.handleLoadProgramClick}>
          Load Program
        </Button>                     
      </Form.Group>
    </div>
    );
  }
}
