import { parse } from "./parser/parser";


export function checkConstraints(component) {
    var program = parse(component.state.programEditorInstance.getValue());

    return new Promise(resolve => {
        program.consistencyPromise().then(inconsistencies => {
            if (inconsistencies) {
              inconsistencies.forEach(inconsitency => {
                  component.state.programEditorInstance.addLineClass(inconsitency.nc.lineNumber, "text", "inconsistent-constraint");
              });
            }      
            resolve({program: program, inconsistencies: inconsistencies});
          })
    })
  }