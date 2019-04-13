import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { parse } from "./parser/parser";
import { setDatalogFragmentAlert } from "./alertService";
import { submit } from "./querySubmitter";
import { MainComponent } from "./MainComponent";
import { setConstraintsAlert } from "./alertService";

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
    //this.submit = this.nothingValidatedSubmit.bind(this); 

  } 


  /*async nothingValidatedSubmit(){

    var status = this.program.getStatus



    this.program.getInconsistencies.then(res =>{
      if(validateBeforeSubmit(this)){
        var executionCalls = this.program.queries.map(q => q.execute(this.program));
        var allResults = Promise.all(executionCalls);
        allResults.then(res =>
          {
            this.setState({ results: res.map(r => r.data[0]) });
            this.submit = this.validatedSubmitNotIar.bind(this); 
          })
      }
    })
  }

  validatedSubmitNotIar(){
    var executionCalls = this.program.queries.map(q => q.execute(this.program));
    var allResults = Promise.all(executionCalls);
    allResults.then(res =>
      {
        this.setState({ results: res.map(r => r.data[0]) });
        this.submit = this.validatedSubmitNotIar.bind(this); 
      })
  }*/



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
    //this.submit = this.nothingValidatedSubmit.bind(this); 
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
    this.program = parse(this.programEditorInstance.getValue());
    this.program.getInconsistencies.then(res => {
      setConstraintsAlert(this);
    })
  }

  checkDatalogFragment() {
    if (!this.program)
    {
      this.program = parse(this.programEditorInstance.getValue());
    }
    setDatalogFragmentAlert(this);
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
    var program = parse(this.programEditorInstance.getValue() + "\n" + this.queriesEditorInstace.getValue());
    var status = await program.getStatus();
    debugger
    //submit(this);
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
