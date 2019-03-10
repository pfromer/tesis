import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { parse } from "./parser/parser";
import { executeQuery } from "./IrisCaller";
import * as regExModule from "./parser/regExService";
import * as tgdModule from "./parser/tgdBuilder";
import { MainComponent } from "./MainComponent";

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
      queriesEditorInstace: undefined
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.onFileLoaded = this.onFileLoaded.bind(this);
    this.setProgramEditorInstace = this.setProgramEditorInstace.bind(this);
    this.setQueriesEditorInstace = this.setQueriesEditorInstace.bind(this);    
    this.checkDatalogFragment = this.checkDatalogFragment.bind(this);
    this.updateUngardedClass = this.updateUngardedClass.bind(this);
  }

  setProgramEditorInstace(editor){
    this.setState({programEditorInstance: editor})
  }

  setQueriesEditorInstace(editor){
    this.setState({queriesEditorInstace: editor})
  }

  checkDatalogFragment(editor){
    var lineNumber = 0;
    var lineInfo = this.state.programEditorInstance.lineInfo(lineNumber);
    while(lineInfo){
        this.updateUngardedClass(lineInfo.text, lineNumber);
        lineNumber ++;
        lineInfo = this.state.programEditorInstance.lineInfo(lineNumber);
    }
  }

  updateUngardedClass(text, lineNumber){
    if(regExModule.service.tgdRegEx.test(text))
    {
      var tgd = tgdModule.builder.build(text);
      if(!tgd.isGuarded){
        this.state.programEditorInstance.addLineClass(lineNumber, "gutter", "ungarded-tgd");
      }
      else{
        this.state.programEditorInstance.removeLineClass(lineNumber, "gutter", "ungarded-tgd");
      }
    }
  }

  onFileLoaded(content){
    var program = parse(content);
    this.setState({programText: program.programToString(), queriesText: program.queriesToString()})
  }

  handleChange(event) {
    this.setState({ programText: event.target.value });
  } 

  handleSubmit(event) {
    event.preventDefault();
    var program = parse(this.state.programEditorInstance.getValue() + "\n" + this.state.queriesEditorInstace.getValue());
    debugger
    console.log("Parsed Program:");
    console.log(program);

    this.setState({
      program: program
    });


    if (program.errors.length == 0 && program.isGuarded) {
      program.consistencyPromise().then(inconsistencies => {

        console.log("inconsistency");
        console.log(inconsistencies);
        this.setState({ inconsistencies: inconsistencies ? inconsistencies : [] });

        console.log("Parsed Program without ncs and egds:");
        console.log(program.toStringWithoutNcsAndEgds);

        if(!inconsistencies || !inconsistencies.some(i => i.result.some(r => r.Results.length>0))){
          executeQuery(program.toStringWithoutNcsAndEgds())
          .then(res => {
            console.log("Query results:");
            console.log(res.data);
            this.setState({ results: res.data });
          });
        }
      });
    }
  }

  render() {
    return (
    <MainComponent
      handleSubmit={this.handleSubmit}
      inconsistencies={this.state.inconsistencies}
      programText={this.state.programText} 
      setProgramEditorInstace={this.setProgramEditorInstace} 
      onFileLoaded={this.onFileLoaded} 
      checkDatalogFragment={this.checkDatalogFragment} 
      queriesText={this.state.queriesText} 
      setQueriesEditorInstace={this.setQueriesEditorInstace} 
      program={this.state.program} 
      results={this.state.results} 
    />
    );
  }
}

ReactDOM.render(<ContainerComponent />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
