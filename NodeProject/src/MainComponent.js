import React from "react";
import { Col } from "react-bootstrap";
import { Form } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { Container } from "react-bootstrap";
import { Row } from "react-bootstrap";
import { Results } from "./QueryResult";
import { InconsistencyAlert } from "./InconsitencyAlert";
import { LoadProgramButton } from "./LoadProgramButton";
import { Editor } from "./Editor";
import * as regExModule from "./parser/regExService";

export class MainComponent extends React.Component {
  constructor(props) {
    super(props); 
  }

  render() {      
    var buttonStyle = { width: "100%" };
    return (
        <>
        <InconsistencyAlert
          inconsistencies={this.props.inconsistencies.filter(i => i.result.some(r => r.Results.length>0))}
        />
        <Container>
        <Row>
          <Col>
          <Form onSubmit={this.props.handleSubmit}>
              <Form.Row>
                <Col>
                <Form.Group>
                    <Form.Label>Datalog Program</Form.Label>
                      <Editor
                          text={this.props.programText}
                          setInstance={this.props.setProgramEditorInstace}
                          allRegex = {[regExModule.service.tgdRegEx, regExModule.service.ncRegEx, regExModule.service.factRegEx, regExModule.service.whiteSpacesRegEx]}
                        />             
                </Form.Group>                
                <Form.Row>
                    <Col>
                    <LoadProgramButton onFileLoaded={this.props.onFileLoaded}/>                      
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
                      <Button onClick={this.props.checkDatalogFragment} type="button" variant="info" style={buttonStyle}>
                      Check Datalog fragment
                      </Button>
                    </Form.Group>
                    </Col>     
                </Form.Row>
                </Col>                
                <Col>
                <Form.Row>
                  <Col>
                    <Form.Group>
                        <Form.Label>Queries</Form.Label>
                        <Editor
                          text={this.props.queriesText}
                          setInstance={this.props.setQueriesEditorInstace}
                          allRegex = {[regExModule.service.queryRegEx, regExModule.service.whiteSpacesRegEx]}
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
              data={this.props.program && this.props.program.errors.length == 0 && this.props.results} 
              visible={this.props.program && this.props.program.errors == 0 && (this.props.inconsistencies.length == 0 || !this.props.inconsistencies.some(i => i.result.some(r => r.Results.length>0)))} 
            />
          </Col>
        </Row>
        </Container>
      </>
    );
  }
}
