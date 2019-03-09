import React from "react";
import ReactDOM from "react-dom";
import { Container } from "react-bootstrap";
import { Row } from "react-bootstrap";
import { Col } from "react-bootstrap";
import { Form } from "react-bootstrap";
import { Button } from "react-bootstrap";
import * as serviceWorker from "./serviceWorker";
import { parse } from "./parser/parser";
import { Results } from "./QueryResult";
import { executeQuery } from "./IrisCaller";
import { InconsistencyAlert } from "./InconsitencyAlert";
import { LoadProgramButton } from "./LoadProgramButton";
import { Editor } from "./Editor";
import * as regExModule from "./parser/regExService";
import * as tgdModule from "./parser/tgdBuilder";

class ContainerComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      programText: "",
      results: [],
      program: undefined,
      inconsistencies: [],
      programEditorInstance: undefined
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.onFileLoaded = this.onFileLoaded.bind(this);
    this.setProgramEditorInstace = this.setProgramEditorInstace.bind(this);
    this.checkDatalogFragment = this.checkDatalogFragment.bind(this);
    this.updateUngardedClass = this.updateUngardedClass.bind(this);
  }

  setProgramEditorInstace(editor){
    this.setState({programEditorInstance: editor})
  }

  checkDatalogFragment(editor){
    var lineNumber = 0;
    var lineInfo = this.state.programEditorInstance.lineInfo(lineNumber);
    while(lineInfo){
        this.updateUngardedClass(lineInfo.text, lineNumber);
        lineNumber ++;
        lineInfo = this.state.programEditorInstance.lineInfo(lineNumber);
    }
  }

  updateUngardedClass(text, lineNumber){
    if(regExModule.service.tgdRegEx.test(text))
    {
      var tgd = tgdModule.builder.build(text);
      if(!tgd.isGuarded){
        this.state.programEditorInstance.addLineClass(lineNumber, "gutter", "ungarded-tgd");
      }
      else{
        this.state.programEditorInstance.removeLineClass(lineNumber, "gutter", "ungarded-tgd");
      }
    }
  }

  onFileLoaded(content){
    this.setState({program: parse(content), programText: content})
  }

  handleChange(event) {
    this.setState({ programText: event.target.value });
  } 

  handleSubmit(event) {
    event.preventDefault();
    var program = parse(this.state.programText);
    console.log("Parsed Program:");
    console.log(program);

    this.setState({
      program: program
    });


    if (program.errors.length == 0 && program.isGuarded) {
      program.consistencyPromise().then(inconsistencies => {

        console.log("inconsistency");
        console.log(inconsistencies);
        this.setState({ inconsistencies: inconsistencies ? inconsistencies : [] });

        console.log("Parsed Program without ncs and egds:");
        console.log(program.toStringWithoutNcsAndEgds);

        if(!inconsistencies || !inconsistencies.some(i => i.result.some(r => r.Results.length>0))){
          executeQuery(program.toStringWithoutNcsAndEgds())
          .then(res => {
            console.log("Query results:");
            console.log(res.data);
            this.setState({ results: res.data });
          });
        }
      });
    }
  }

  render() {
    var buttonStyle = { width: "100%" };
    var textAreaStyle = { resize: "vertical" };
    return (
      <>
        <InconsistencyAlert
          inconsistencies={this.state.inconsistencies.filter(i => i.result.some(r => r.Results.length>0))}
        />
        <Container>
        <Row>
          <Col>
          <Form onSubmit={this.handleSubmit}>
              <Form.Row>
                <Col>
                <Form.Group controlId="exampleForm.ControlTextarea">
                    <Form.Label>Datalog Program</Form.Label>
                      <Editor
                          text={this.state.programText}
                          setInstance={this.setProgramEditorInstace}
                        />             
                </Form.Group>                
                <Form.Row>
                    <Col>
                    <LoadProgramButton onFileLoaded={this.onFileLoaded}/>                      
                    </Col> 
                </Form.Row>
                <Form.Row>
                    <Col>
                    <Form.Group>
                      <Button  type="button" variant="info" style={buttonStyle}>
                      Check Constraints
                      </Button>
                    </Form.Group>
                    </Col>
                    <Col>
                    <Form.Group>
                      <Button onClick={this.checkDatalogFragment} type="button" variant="info" style={buttonStyle}>
                      Check Datalog fragment
                      </Button>
                    </Form.Group>
                    </Col>     
                </Form.Row>
                </Col>                
                <Col>
                <Form.Row>
                  <Col>
                    <Form.Group controlId="exampleForm.ControlTextarea2">
                        <Form.Label>Queries</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows="10"
                          style={textAreaStyle}
                          />
                    </Form.Group>
                  </Col>
                </Form.Row>
                <Form.Row>
                  <Col>
                  <Form.Group>
                    <Button type="submit" variant="info" style={buttonStyle}>
                    Execute Queries
                    </Button>
                  </Form.Group>
                  </Col>
                </Form.Row>                
                </Col>
              </Form.Row>             
          </Form>
          </Col>            
        </Row>
        <Row>
          <Col>
            <Results 
              data={this.state.program && this.state.program.errors.length == 0 && this.state.results} 
              visible={this.state.program && this.state.program.errors == 0 && (this.state.inconsistencies.length == 0 || !this.state.inconsistencies.some(i => i.result.some(r => r.Results.length>0)))} 
            />
          </Col>
        </Row>
        </Container>
      </>
    );
  }
}

ReactDOM.render(<ContainerComponent />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
