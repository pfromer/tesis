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
      program: undefined,
      programEditorInstance: undefined,
      queriesEditorInstace: undefined,
      alert: {
        opened: false
      },
      markers: [],
      intersectionRepairs: undefined,
      repairs : undefined
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
  } 

  onQueryEditorChange(){
    this.onHandleAlertClose();
  }

  onProgramEditorChange(){
    this.onHandleAlertClose();
    this.state.markers.forEach(marker => marker.clear());
    this.setState({markers : [], results : [],  program : undefined, intersectionRepairs : undefined})

  }

  onHandleAlertClose() {
    this.setState({
      alert: {
        opened: false
      }
    })
  }

  setProgramEditorInstace(editor) {
    this.setState({
      programEditorInstance: editor
    })
  }

  setQueriesEditorInstace(editor) {
    this.setState({
      queriesEditorInstace: editor
    })
  }

  checkConstraints() {
    this.setState({
      program: parse(this.state.programEditorInstance.getValue())
    },
      function(){
        this.state.program.getInconsistencies.then(res => {
          setConstraintsAlert(this);
        })
      }
    )
  }

  checkDatalogFragment() {
    if (!this.state.program)
    {
      var program = parse(this.state.programEditorInstance.getValue());
    }
    else{
      var program = this.state.program;
    }
        
    this.setState({
        program: program
      },
      function () {
        setDatalogFragmentAlert(this);
      }
    );
  }

  onFileLoaded(content) {
    var program = parse(content);
    this.setState({
      programText: program.programToString(),
      queriesText: program.queriesToString()
    })
  }


  handleSubmit(event) {
    event.preventDefault();
    submit(this);
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
      program={this.state.program} 
      results={this.state.results}
      alert={this.state.alert}
      checkConstraints={this.checkConstraints}
      showIAR={this.state.program && this.state.program.getProcessedInconsistencies && this.state.program.getProcessedInconsistencies.length > 0}
    />
    );
  }
}

ReactDOM.render(<ContainerComponent />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
