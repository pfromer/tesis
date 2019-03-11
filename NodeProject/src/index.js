import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { parse } from "./parser/parser";
import { setDatalogFragmentAlert } from "./alertService";
import { setConstraintsAlert } from "./alertService";
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
      alert: {
        opened: false
      }
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
    this.markUngardedTgds = this.markUngardedTgds.bind(this);
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
    var program = parse(this.state.programEditorInstance.getValue());
    program.consistencyPromise().then(inconsistencies => {
      var lines = program.programStructure.filter(textLine => textLine.type === "NC");
        
      if (inconsistencies) {
        inconsistencies.forEach(inconsitency => {
            lines.forEach(line => {
              if(ncModule.builder.build(line.text).equals(inconsitency.nc.toString())) {
                this.state.programEditorInstance.addLineClass(line.index, "text", "inconsistent-constraint");
              }
            });
        });
      }    

      this.setState({
          inconsistencies: inconsistencies,
          program: program
        },
        function () {
          setConstraintsAlert(this);
        }
      );  
    })
  }

  markUngardedTgds() {
    var lineNumber = 0;
    var lineInfo = this.state.programEditorInstance.lineInfo(lineNumber);
    while (lineInfo) {
      this.updateUngardedClass(lineInfo.text, lineNumber);
      lineNumber++;
      lineInfo = this.state.programEditorInstance.lineInfo(lineNumber);
    }
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

  updateUngardedClass(text, lineNumber) {
    if (regExModule.service.tgdRegEx.test(text)) {
      var tgd = tgdModule.builder.build(text);
      if (!tgd.isGuarded) {
        this.state.programEditorInstance.addLineClass(lineNumber, "text", "ungarded-tgd");
      } else {
        this.state.programEditorInstance.removeLineClass(lineNumber, "text", "ungarded-tgd");
      }
    }
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
