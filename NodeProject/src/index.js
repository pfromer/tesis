import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import {
  parse
} from "./parser/parser";
import {
  MainComponent
} from "./components/MainComponent";
import {
  nonValidatedStatus
} from "./services/StatusObjects";
import {
  iarStatus
} from "./services/StatusObjects";
import {
  arStatus
} from "./services/StatusObjects";
import {
  datalogFragmentService
} from "./services/DatalogFragmentService";
import {
  datalogFragmentConext
} from "./services/ContextObjects";
import {
  querySubmitConext
} from "./services/ContextObjects";
import {
  checkConstraintsConext
} from "./services/ContextObjects";

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
      showIAR: false,
      resultsLoading: false,
      repairsLoading: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.executeAR = this.executeAR.bind(this);
    this.executeIAR = this.executeIAR.bind(this);
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
    this.repairs = undefined;
    this.nonValidatedStatus = nonValidatedStatus;
    this.statusObject = this.nonValidatedStatus;
    this.datalogFragmentService = datalogFragmentService;
    this.context = undefined;
  }


  getFullProgram() {
    var result = Object.assign({}, this.programWithNoQueries);
    result.queries = this.queriesProgram.queries;
    result.errors = result.errors.concat(this.queriesProgram.errors);
    return result;
  }


  onQueryEditorChange() {
    this.onHandleAlertClose();
    this.queriesProgram = undefined;
  }

  onProgramEditorChange() {
    this.onHandleAlertClose();
    this.markers.forEach(marker => marker.clear());
    this.markers = [];
    this.repairs = undefined;
    this.setState({
      results: [],
      alert: {
        opened: false
      },
      showIAR: false
    })
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
    if (!this.programWithNoQueries) {
      this.programWithNoQueries = parse(this.programEditorInstance.getValue());
    }
    this.statusObject.checkConstraints(this);
  }

  checkDatalogFragment() {
    this.context = datalogFragmentConext;
    if (!this.programWithNoQueries) {
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

  showRepairs() {
    this.statusObject.showRepairs(this);
  }

  async executeIAR() {
    this.statusObject = iarStatus;
    this.handleSubmit();
  }

  async executeAR() {
    this.statusObject = arStatus;
    this.handleSubmit();
  }


  async handleSubmit(event) {
    if (event) {
      event.preventDefault();
    }

    this.context = querySubmitConext;
    if (!this.programWithNoQueries) {
      this.programWithNoQueries = parse(this.programEditorInstance.getValue());
    }
    this.queriesProgram = parse(this.queriesEditorInstace.getValue());
    this.statusObject.submit(this);
  }

  render() {
    return ( <
      MainComponent handleSubmit = {
        this.handleSubmit
      }
      programText = {
        this.state.programText
      }
      setProgramEditorInstace = {
        this.setProgramEditorInstace
      }
      onProgramEditorChange = {
        this.onProgramEditorChange
      }
      onQueryEditorChange = {
        this.onQueryEditorChange
      }
      onFileLoaded = {
        this.onFileLoaded
      }
      checkDatalogFragment = {
        this.checkDatalogFragment
      }
      executeAR = {
        this.executeAR
      }
      executeIAR = {
        this.executeIAR
      }
      showRepairs = {
        this.showRepairs
      }
      queriesText = {
        this.state.queriesText
      }
      setQueriesEditorInstace = {
        this.setQueriesEditorInstace
      }
      results = {
        this.state.results
      }
      alert = {
        this.state.alert
      }
      checkConstraints = {
        this.checkConstraints
      }
      showIAR = {
        this.state.showIAR
      }
      resultsLoading = {
        this.state.resultsLoading
      }
      repairsLoading = {
        this.state.repairsLoading
      }
      />
    );
  }
}

ReactDOM.render( < ContainerComponent / > , document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();