import React from "react";
import { Col } from "react-bootstrap";
import { Form } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { Container } from "react-bootstrap";
import { Row } from "react-bootstrap";
import { Results } from "./QueryResult";
import { LoadProgramButton } from "./LoadProgramButton";
import { Editor } from "./Editor";
import { AlertDismissable  } from "./AlertDismissable";
import * as regExModule from "./parser/regExService";
import {UpdateArrayPrototype} from "./parser/ArrayUtils";

export class MainComponent extends React.Component {
  constructor(props) {
    super(props); 
    UpdateArrayPrototype();
  }

  render() {      
    var buttonStyle = { width: "100%" };
    var buttonIARStyle = Object.assign({},buttonStyle, {'background-color': 'indigo', 'border-color': 'indigo' }); 
    return (
        <>
        <Container>
        <Row>
          <Col>
          <Form onSubmit={this.props.handleSubmit}>
              <Form.Row>
                <Col>
                <Form.Group>
                    <Form.Label>Datalog +/- program</Form.Label>
                      <Editor
                          text={this.props.programText}
                          setInstance={this.props.setProgramEditorInstace}
                          onEditorChange={this.props.onProgramEditorChange}
                          allRegex = {[regExModule.service.tgdRegEx, regExModule.service.ncRegEx, regExModule.service.factRegEx, regExModule.service.whiteSpacesRegEx, regExModule.service.keyRegEx]}
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
                      <Button  onClick={this.props.checkConstraints} type="button" variant="info" style={buttonStyle}>
                      Check Consistency
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
                          allRegex = {[regExModule.service.queryRegEx, regExModule.service.whiteSpacesRegEx, regExModule.service.existencialQueryRegEx ]}
                          onEditorChange={this.props.onQueryEditorChange}
                        />  
                    </Form.Group>
                  </Col>
                </Form.Row>
                <Form.Row>
                  <Col>
                  <Form.Group>
                    <Button type="submit" variant='info' style={this.props.showIAR? buttonIARStyle : buttonStyle } >
                    Execute Queries {this.props.showIAR ? '- IAR SEMANTICS' : ''}
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
          <AlertDismissable 
          opened={this.props.alert.opened}
          lines={this.props.alert.lines}
          heading={this.props.alert.heading}
          onHandleClick={this.props.alert.onHandleClick}
        />
            <Results 
              data={this.props.program && this.props.program.errors.length == 0 && this.props.results} 
              visible={this.props.program && this.props.program.errors == 0} 
            />
          </Col>
        </Row>
        </Container>
      </>
    );
  }
}
