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
import { LoadingSymbol  } from "./LoadingSymbol";
import * as regExModule from "../services/regExService";
import {UpdateArrayPrototype} from "../parser/ArrayUtils";

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
                          allRegex = {[regExModule.service.maxDepthRegex, regExModule.service.tgdRegEx, regExModule.service.ncRegEx, regExModule.service.factRegEx, regExModule.service.whiteSpacesRegEx, regExModule.service.keyRegEx]}
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
                
                  {!this.props.showIAR ?  (
                    <Form.Row>
                  <Col>
                  <Form.Group>
                    <Button type="submit" variant='info' style={ buttonStyle } >
                    Execute Queries {this.props.showIAR}
                    <LoadingSymbol
                      show={this.props.resultsLoading}
                    />
                    </Button>
                  </Form.Group>
                    </Col>
                    </Form.Row>
                  ) : (
                    <Form.Row>
                  <Col>
                  <Form.Group>
                    <Button onClick={this.props.executeIAR} type="button" variant='info' style={buttonIARStyle } >
                    Execute Queries - IAR SEMANTICS
                    <LoadingSymbol
                      show={this.props.resultsLoading}
                    />
                    </Button>
                  </Form.Group>
                    </Col>

                    <Col>
                    <Form.Group>
                      <Button onClick={this.props.executeAR} type="button" variant='info' style={buttonIARStyle } >
                      Execute Queries - AR SEMANTICS
                      <LoadingSymbol
                        show={this.props.resultsLoading}
                      />
                      </Button>
                    </Form.Group>
                      </Col>
                      </Form.Row>
                  )
                }

                <Form.Row>
                  <Col>
                  <Form.Group>
                    <Button onClick={this.props.showRepairs} type="button" variant='warning' style={{width: "100%", display: this.props.showIAR? 'block': 'none'  }}>
                     Show Repairs
                     <LoadingSymbol
                      show={this.props.repairsLoading}
                    />
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
              data={this.props.results} 
              visible={this.props.results != undefined} 
            />
          </Col>
        </Row>
        </Container>
      </>
    );
  }
}
