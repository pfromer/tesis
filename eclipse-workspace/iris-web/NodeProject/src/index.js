import React from "react";
import ReactDOM from "react-dom";
import { Container } from "react-bootstrap";
import { Row } from "react-bootstrap";
import { Col } from "react-bootstrap";
import { Form } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { Table } from "react-bootstrap";
import { Collapse } from "react-bootstrap";
import * as serviceWorker from "./serviceWorker";
import axios from "axios";
import { parse } from "./parser/parser";

class QueryResult extends React.Component{

  constructor(props) {
    super(props);

    this.state = {
      open: props.open,
    };
  }

  render() {
    const { open } = this.state;
    return(
      <Container>
        <h4 onClick={() => this.setState({ open: !open })}>
          {this.props.value.Query}
        </h4>
        <Collapse in={this.state.open}>
          <div>
          <Table striped bordered hover>
            <thead>
              <tr>
                {this.props.value.VariableBindings.map(variable => (
                  <th key={variable}>{variable.substring(1)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {this.props.value.Results.map(result => (
                <tr>
                  {result.map(constant => (
                    <td>{constant.slice(0, -1).substring(1)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
          </div>
        </Collapse>
      </Container>
    )
  };
}

function Results(props) {
  return (
    <ul>
      {props.data.map((queryResult,index) => (
        <QueryResult key={queryResult.Query} value={queryResult} open={index==0} />
      ))}
    </ul>
  );
}

class ContainerComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { program: "", results: [], isGuarded : false, isLinear : false, errors: [] };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ programText: event.target.value });
  }

  renderResults() {
    return <Results data={this.state.results} />;
  }

  handleSubmit(event) {
    var program = parse(this.state.programText);
    console.log(program);

    this.setState({isGuarded : program.isGuarded(), isLinear : program.isLinear(), errors : program.errors });

    var consistencyPromise = program.consistencyPromise();

    consistencyPromise.then(res => {
      debugger							
    });
    
    if(program.errors.length == 0){
      axios
        .get("http://localhost:8080/iris/test", {
          params: {
            test: JSON.stringify({ program: this.state.program })
          }
        })
        .then(res => {
          console.log(res.data);
          this.setState({ results: res.data });
        });
    }
    else{
      this.setState({ results: [] });
    }


    event.preventDefault();
  }

  render() {
    var buttonStyle = { width: "100%" };
    return (
      <>
        <Container>
          <Row>
            <Col>
              <Form onSubmit={this.handleSubmit}>
                <Form.Group controlId="exampleForm.ControlTextarea">
                  <Form.Label>Datalog Program</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows="18"
                    onChange={this.handleChange}
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

//render(<AlertDismissable />);

ReactDOM.render(<ContainerComponent />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
