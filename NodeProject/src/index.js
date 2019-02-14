import React from "react";
import ReactDOM from "react-dom";
import { Container } from "react-bootstrap";
import { Row } from "react-bootstrap";
import { Col } from "react-bootstrap";
import { Form } from "react-bootstrap";
import { Button } from "react-bootstrap";
import * as serviceWorker from "./serviceWorker";
import axios from "axios";
import { parse } from "./parser/parser";
import { AlertDismissable } from "./AlertDissmisable";
import { Results } from "./QueryResult";

//Alert
//Query results
//Results
//Container

class ContainerComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      programText: "",
      results: [],
      program: undefined
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ programText: event.target.value });
  }

  renderResults() {
    return (
      <Results data={this.state.results} visible={this.state.program && this.state.program.errors == 0} />
    );
  }

  handleSubmit(event) {
    event.preventDefault();
    var program = parse(this.state.programText);
    console.log("Parsed Program:");
    console.log(program);

    this.setState({
      program: program
    });

    //todo sacar este if distribuyendo en coponentes y que se maneje todo por estado
    if (program.errors.length == 0) {
      program.consistencyPromise().then(res => {
        console.log("Parsed Program without ncs and egds:");
        console.log(program.toStringWithoutNcsAndEgds);

        axios
          .get("http://localhost:8080/iris/test", {
            params: {
              test: JSON.stringify({
                program: program.toStringWithoutNcsAndEgds()
              })
            }
          })
          .then(res => {
            console.log("Query results:");
            console.log(res.data);
            this.setState({ results: res.data });
          });
      });
    } else {
      this.setState({ results: [] });
    }
  }

  render() {
    var buttonStyle = { width: "100%" };
    var textAreaStyle = { resize: "vertical" };
    return (
      <>
        <AlertDismissable
          programText={this.state.programText}
          errors={this.program ? this.state.program.errors : []}
          visible={this.state.program && this.state.program.errors.length > 0}
        />
        <Container>
          <Row>
            <Col>
              <Form onSubmit={this.handleSubmit}>
                <Form.Group controlId="exampleForm.ControlTextarea">
                  <Form.Label>Datalog Program</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows="10"
                    onChange={this.handleChange}
                    style={textAreaStyle}
                  />
                </Form.Group>
                <Form.Group>
                  <Button type="submit" variant="info" style={buttonStyle}>
                    Execute
                  </Button>
                </Form.Group>
              </Form>
            </Col>
          </Row>
          <Row>
            <Col>{this.renderResults()}</Col>
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
