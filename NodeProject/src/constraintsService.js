import { parse } from "./parser/parser";
import { setConstraintsAlert } from "./alertService";

export function checkConstraints(component) {
    var program = parse(component.state.programEditorInstance.getValue());
    program.consistencyPromise().then(inconsistencies => {
      if (inconsistencies) {
        inconsistencies.forEach(inconsitency => {
            component.state.programEditorInstance.addLineClass(inconsitency.nc.lineNumber, "text", "inconsistent-constraint");
        });
      }    

      component.setState({
          inconsistencies: inconsistencies,
          program: program
        },
        function () {
          setConstraintsAlert(component);
        }
      );  
    })
  }