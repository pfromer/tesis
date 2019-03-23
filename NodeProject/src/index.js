import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { parse } from "./parser/parser";
import { setDatalogFragmentAlert } from "./alertService";
import { checkConstraints } from "./constraintsService";
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
      inconsistencies: [],
      programEditorInstance: undefined,
      queriesEditorInstace: undefined,
      alert: {
        opened: false
      },
      inconsitent: false,
      markers: []
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.onFileLoaded = this.onFileLoaded.bind(this);
    this.setProgramEditorInstace = this.setProgramEditorInstace.bind(this);
    this.setQueriesEditorInstace = this.setQueriesEditorInstace.bind(this);
    this.checkDatalogFragment = this.checkDatalogFragment.bind(this);
    this.onHandleAlertClose = this.onHandleAlertClose.bind(this);
    this.checkConstraints = this.checkConstraints.bind(this);
    this.setAsConsistent = this.setAsConsistent.bind(this);
    this.onQueryEditorChange = this.onQueryEditorChange.bind(this);
    this.onProgramEditorChange = this.onProgramEditorChange.bind(this);
  }

  setAsConsistent(){
    this.setState({
      inconsitent : false
    })
  }

  onQueryEditorChange(){
    this.onHandleAlertClose();
  }

  onProgramEditorChange(){
    this.setAsConsistent();
    this.onHandleAlertClose();
    this.state.markers.forEach(marker => marker.clear());
    this.setState({markers : []})

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
    checkConstraints(this).then(res =>{
      this.setState({
        inconsistencies: res.inconsistencies,
        program: res.program
      },
      function () {
        setConstraintsAlert(this);
      }
    );
    })
  }

  checkDatalogFragment() {
    var program = parse(this.state.programEditorInstance.getValue());
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

  handleChange(event) {
    this.setState({
      programText: event.target.value
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    var program = parse(this.state.programEditorInstance.getValue() + "\n" + this.state.queriesEditorInstace.getValue());
    this.setState({
        program: program
        }, 
        function(){      
          submit(this);
        }
      );
    }
  render() {
    return (
    <MainComponent
      handleSubmit={this.handleSubmit}
      inconsistencies={this.state.inconsistencies}
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
      showIAR={this.state.inconsitent}
    />
    );
  }
}

ReactDOM.render(<ContainerComponent />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
