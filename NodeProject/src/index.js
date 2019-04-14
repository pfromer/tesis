import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { parse } from "./parser/parser";
import { setDatalogFragmentAlert } from "./alertService";
import { MainComponent } from "./MainComponent";
import { nonValidatedStatus } from "./StatusObjects";
import { validatedStatus } from "./StatusObjects";
import { iarStatus } from "./StatusObjects";
import { repairsSetStatus } from "./StatusObjects";

class ContainerComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      programText: "",
      queriesText: "",
      results: [],
      alert: {
        opened: false
      }
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onFileLoaded = this.onFileLoaded.bind(this);
    this.setProgramEditorInstace = this.setProgramEditorInstace.bind(this);
    this.setQueriesEditorInstace = this.setQueriesEditorInstace.bind(this);
    this.checkDatalogFragment = this.checkDatalogFragment.bind(this);
    this.onHandleAlertClose = this.onHandleAlertClose.bind(this);
    this.checkConstraints = this.checkConstraints.bind(this);
    this.onQueryEditorChange = this.onQueryEditorChange.bind(this);
    this.onProgramEditorChange = this.onProgramEditorChange.bind(this);
    this.program = undefined;
    this.programEditorInstance = undefined;
    this.queriesEditorInstace = undefined;
    this.markers = [];
    this.intersectionRepairs = undefined;
    this.repairs = undefined;
    this.nonValidatedStatus = nonValidatedStatus;
    this.validatedStatus = validatedStatus;
    this.iarStatus = iarStatus;
    this.repairsSetStatus = repairsSetStatus;    
    this.statusObject = this.nonValidatedStatus;
  } 
  onQueryEditorChange(){
    this.onHandleAlertClose();
  }

  onProgramEditorChange(){
    this.onHandleAlertClose();
    this.markers.forEach(marker => marker.clear());
    this.markers = [];
    this.intersectionRepairs = undefined;
    this.repairs = undefined;
    this.setState({results : [], alert: {opened: false}})
    this.program = undefined;
    this.statusObject = this.nonValidatedStatus;
  }

  onHandleAlertClose() {
    this.setState({
      alert: {
        opened: false
      }
    })
  }

  setProgramEditorInstace(editor) {
    this.programEditorInstance = editor;    
  }

  setQueriesEditorInstace(editor) {
    this.queriesEditorInstace = editor;
  }

  checkConstraints() {
    if (!this.program)
    {
      this.program = parse(this.programEditorInstance.getValue());
    }
    this.statusObject.checkConstraints(this);
  }

  checkDatalogFragment() {
    if (!this.program)
    {
      this.program = parse(this.programEditorInstance.getValue());
    }
    this.statusObject.checkDatalogFragment(this);
  }

  onFileLoaded(content) {
    var program = parse(content);
    this.setState({
      programText: program.programToString(),
      queriesText: program.queriesToString()
    })
  }


  async handleSubmit(event) {
    event.preventDefault();
    this.program = parse(this.programEditorInstance.getValue() + "\n" + this.queriesEditorInstace.getValue());
    this.statusObject.submit(this);
  }

  render() {
    return (
    <MainComponent
      handleSubmit={this.handleSubmit}
      programText={this.state.programText} 
      setProgramEditorInstace={this.setProgramEditorInstace}
      onProgramEditorChange={this.onProgramEditorChange} 
      onQueryEditorChange={this.onQueryEditorChange} 
      onFileLoaded={this.onFileLoaded} 
      checkDatalogFragment={this.checkDatalogFragment} 
      queriesText={this.state.queriesText} 
      setQueriesEditorInstace={this.setQueriesEditorInstace} 
      program={this.program} 
      results={this.state.results}
      alert={this.state.alert}
      checkConstraints={this.checkConstraints}
      showIAR={this.program && this.program.getProcessedInconsistencies && this.program.getProcessedInconsistencies.length > 0}
    />
    );
  }
}

ReactDOM.render(<ContainerComponent />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
