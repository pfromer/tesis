import React from "react";
import ReactDOM from "react-dom";
import { Container } from "react-bootstrap";
import { Row } from "react-bootstrap";
import { Col } from "react-bootstrap";
import { Form } from "react-bootstrap";
import { Button } from "react-bootstrap";
import * as serviceWorker from "./serviceWorker";
import { parse } from "./parser/parser";
import { ErrorSyntaxAlert } from "./ErrorSyntaxAlert";
import { Results } from "./QueryResult";
import { executeQuery } from "./IrisCaller";
import { InconsistencyAlert } from "./InconsitencyAlert";
import { LoadProgramButton } from "./LoadProgramButton";
import {UnControlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
require('codemirror/mode/xml/xml');
require('codemirror/mode/javascript/javascript');


class ContainerComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      programText: "",
      results: [],
      program: undefined,
      inconsistencies: []
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.onFileLoaded = this.onFileLoaded.bind(this);
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

      <CodeMirror
        value='<h1>I ♥ react-codemirror2</h1>'
        options={{
          mode: 'xml',
          theme: 'material',
          lineNumbers: true
        }}
        onChange={(editor, data, value) => {
        }}
      />

        <InconsistencyAlert
          inconsistencies={this.state.inconsistencies.filter(i => i.result.some(r => r.Results.length>0))}
        />
        <ErrorSyntaxAlert
          programText={this.state.programText}
          errors={this.program ? this.state.program.errors : []}
          visible={this.state.program && (this.state.program.errors.length > 0 || this.state.program.ungardedTgds().length != 0)}
        />
        <Container>
        <Row>
          <Col>
          <Form onSubmit={this.handleSubmit}>
              <Form.Row>
                <Col>
                <Form.Group controlId="exampleForm.ControlTextarea">
                    <Form.Label>Datalog Program</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows="10"
                      onChange={this.handleChange}
                      style={textAreaStyle}
                      />
                </Form.Group>
                <Form.Row>
                    <Col>
                    <LoadProgramButton onFileLoaded={this.onFileLoaded}/>
                      <Form.Group>
                        <Button type="submit" variant="info" style={buttonStyle}>
                        Check Syntax
                        </Button>
                      </Form.Group>
                    </Col> 
                </Form.Row>
                <Form.Row>
                    <Col>
                    <Form.Group>
                      <Button type="submit" variant="info" style={buttonStyle}>
                      Check Constraints
                      </Button>
                    </Form.Group>
                    </Col>
                    <Col>
                    <Form.Group>
                      <Button type="submit" variant="info" style={buttonStyle}>
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
