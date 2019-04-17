import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { parse } from "./parser/parser";
import { MainComponent } from "./MainComponent";
import { nonValidatedStatus } from "./StatusObjects";
import { iarStatus } from "./StatusObjects";
import { repairsSetStatus } from "./StatusObjects";
import { datalogFragmentService } from "./DatalogFragmentService";
import { datalogFragmentConext } from "./ContextObjects";
import { querySubmitConext } from "./ContextObjects";
import { checkConstraintsConext } from "./ContextObjects";

class ContainerComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      programText: "",
      queriesText: "",
      results: [],
      alert: {
        opened: false
      },
      showIAR: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onFileLoaded = this.onFileLoaded.bind(this);
    this.setProgramEditorInstace = this.setProgramEditorInstace.bind(this);
    this.setQueriesEditorInstace = this.setQueriesEditorInstace.bind(this);
    this.checkDatalogFragment = this.checkDatalogFragment.bind(this);
    this.showRepairs = this.showRepairs.bind(this);
    this.onHandleAlertClose = this.onHandleAlertClose.bind(this);
    this.checkConstraints = this.checkConstraints.bind(this);
    this.onQueryEditorChange = this.onQueryEditorChange.bind(this);
    this.onProgramEditorChange = this.onProgramEditorChange.bind(this);
    this.getFullProgram = this.getFullProgram.bind(this);
    this.queriesProgram = undefined;
    this.programWithNoQueries = undefined;
    this.programEditorInstance = undefined;
    this.queriesEditorInstace = undefined;
    this.markers = [];
    this.intersectionRepairs = undefined;
    this.repairs = undefined;
    this.nonValidatedStatus = nonValidatedStatus;
    this.iarStatus = iarStatus;
    this.repairsSetStatus = repairsSetStatus;    
    this.statusObject = this.nonValidatedStatus;
    this.datalogFragmentService = datalogFragmentService;
    this.context = undefined;
  }
  
  
  getFullProgram(){
    var result = Object.assign({}, this.programWithNoQueries);
    result.queries = this.queriesProgram.queries;
    result.errors = result.errors.concat(this.queriesProgram.errors);
    return result;
  }


  onQueryEditorChange(){
    this.onHandleAlertClose();
    this.queriesProgram = undefined;
  }

  onProgramEditorChange(){
    this.onHandleAlertClose();
    this.markers.forEach(marker => marker.clear());
    this.markers = [];
    this.intersectionRepairs = undefined;
    this.repairs = undefined;
    this.setState({results : [], alert: {opened: false}, showIAR: false})
    this.programWithNoQueries = undefined;
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
    this.context = checkConstraintsConext;
    if (!this.programWithNoQueries)
    {
      this.programWithNoQueries = parse(this.programEditorInstance.getValue());
    }
    this.statusObject.checkConstraints(this);
  }

  checkDatalogFragment() {
    this.context = datalogFragmentConext;
    if (!this.programWithNoQueries)
    {
      this.programWithNoQueries = parse(this.programEditorInstance.getValue());
    }
    this.datalogFragmentService.checkDatalogFragment(this);
  }

  onFileLoaded(content) {
    var parsedContent = parse(content);
    this.setState({
      programText: parsedContent.programToString(),
      queriesText: parsedContent.queriesToString()
    })
  }

  showRepairs(){
    this.statusObject.showRepairs(this);
  }


  async handleSubmit(event) {
    event.preventDefault();
    this.context = querySubmitConext;
    if(!this.programWithNoQueries){
      this.programWithNoQueries = parse(this.programEditorInstance.getValue());
    }
    this.queriesProgram = parse(this.queriesEditorInstace.getValue());
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
      showRepairs={this.showRepairs} 
      queriesText={this.state.queriesText} 
      setQueriesEditorInstace={this.setQueriesEditorInstace}
      results={this.state.results}
      alert={this.state.alert}
      checkConstraints={this.checkConstraints}
      showIAR={this.state.showIAR}
    />
    );
  }
}

ReactDOM.render(<ContainerComponent />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
