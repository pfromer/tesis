import React from "react";
import { Spinner } from "react-bootstrap";

export class LoadingSymbol  extends React.Component {
    constructor(props) {
      super(props);
    }
  
    render() {
      if(!this.props.show) return null;      
      return (
        <Spinner
            as="span"
            animation="grow"
            size="sm"
            role="status"
            aria-hidden="true"
        />
      );
    }
  }




