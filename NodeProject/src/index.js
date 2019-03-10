import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { parse } from "./parser/parser";
import { submit } from "./querySubmitter";
import * as regExModule from "./parser/regExService";
import * as tgdModule from "./parser/tgdBuilder";
import * as ncModule from "./parser/ncBuilder";
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
      queriesEditorInstace: undefined,
      alert: {opened: false}
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.onFileLoaded = this.onFileLoaded.bind(this);
    this.setProgramEditorInstace = this.setProgramEditorInstace.bind(this);
    this.setQueriesEditorInstace = this.setQueriesEditorInstace.bind(this);    
    this.checkDatalogFragment = this.checkDatalogFragment.bind(this);
    this.updateUngardedClass = this.updateUngardedClass.bind(this);
    this.onHandleAlertClose = this.onHandleAlertClose.bind(this);
    this.checkConstraints = this.checkConstraints.bind(this); 
  }

  onHandleAlertClose(){
    this.setState({alert: {opened: false}})
  } 

  setProgramEditorInstace(editor){
    this.setState({programEditorInstance: editor})
  }

  setQueriesEditorInstace(editor){
    this.setState({queriesEditorInstace: editor})
  }

  checkConstraints(){
    var currentState = this.state;
    var program = parse(this.state.programEditorInstance.getValue());
    var showInconsitencyAlert;
    program.consistencyPromise().then(inconsistencies => {
      var lines = program.programStructure.filter(textLine => textLine.type === "NC");
      if(inconsistencies){
      inconsistencies.forEach(inconsitency => {
          if(inconsitency.result.some(r => r.Results.length>0))
          {
            lines.forEach(line => {            
              if(ncModule.builder.build(line.text).toString() === inconsitency.nc.toString())
              {
                showInconsitencyAlert = true;
                currentState.programEditorInstance.addLineClass(line.index, "text", "inconsistent-constraint");
              }
            }  
            );
          }    
        });
      } 
      if(showInconsitencyAlert){
        this.setState({alert: {
          heading: "Not consistent.", 
          lines: ["The lines marked in green are not fulfilled by your program.", 
          "You may execute a query under IAR semantics."],
          opened: true,
          onHandleClick : this.onHandleAlertClose      
        }})
      }
      else{
        this.setState({alert: {
          heading: "Your program is consistent.", 
          opened: true,
          onHandleClick : this.onHandleAlertClose,
          lines: []      
        }})
      }

    }) 
  }

  checkDatalogFragment(editor){
    var program = parse(this.state.programEditorInstance.getValue());
    this.setState({program: program});
    if(program.errors.length > 0){
      this.setState({alert: {
        lines: ["Please correct the syntax errors in your program first."],
        opened: true,
        onHandleClick : this.onHandleAlertClose      
      }})
      return
    }

    if(program.isLinear()){
      this.setState({alert: {
        lines: ["Your program is in the Linear Fragment."],
        opened: true,
        onHandleClick : this.onHandleAlertClose      
      }})
      return
    } 

    if(program.isGuarded()){
      this.setState({alert: {
        lines: ["Your program is in the Guarded Fragment."],
        opened: true,
        onHandleClick : this.onHandleAlertClose      
      }})
      return
    }

    if(!program.isGuarded()){
      this.setState({alert: {
        heading: "Out of the Guarded Fragment.", 
        lines: ["The lines marked in blue are ungarded TGDs"],
        opened: true,
        onHandleClick : this.onHandleAlertClose      
      }})
    }


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
        this.state.programEditorInstance.addLineClass(lineNumber, "text", "ungarded-tgd");
      }
      else{
        this.state.programEditorInstance.removeLineClass(lineNumber, "text", "ungarded-tgd");
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
    console.log("Parsed Program:");
    console.log(program);
    this.setState({
      program: program
    });
    submit(program, this);
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
      alert={this.state.alert}
      checkConstraints={this.checkConstraints}
    />
    );
  }
}

ReactDOM.render(<ContainerComponent />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
