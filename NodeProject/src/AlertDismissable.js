import React from "react";
import { Alert } from "react-bootstrap";
import { Button } from "react-bootstrap";

export class AlertDismissable  extends React.Component {
    constructor(props) {
      super(props);
    }
  
    render() {
      if(!this.props.opened) return null;
      debugger
      const handleHide = () => this.props.onHandleClick();
      return (
        <>
        <div class="react-live">          
        <Alert show={this.props.opened} variant="danger"
        style={   {
          top: '0px', 
          left: '0px',
          width: '100%',
          'z-index':'9999',
          'border-radius':'0px'}}
        >
          <Alert.Heading>{this.props.heading}</Alert.Heading>
          {this.props.lines.map(line => (<p style={{margin:'0'}}>{line}</p>))}
          <hr />
          <div className="d-flex justify-content-end">
            <Button onClick={handleHide} variant="outline-success">
              Close
            </Button>
          </div>
        </Alert>
        </div>
        </>
      );
    }
  }




