import { parse } from "./parser/parser";


export function checkConstraints(component) {
    var program = parse(component.state.programEditorInstance.getValue());
    
    debugger

    if (program.canBeSubmitted()){
      return new Promise(resolve => {
        program.consistencyPromise().then(inconsistencies => {
            if (inconsistencies && inconsistencies.length > 0) {
              inconsistencies.forEach(inconsitency => {
                  component.state.programEditorInstance.addLineClass(inconsitency.nc.lineNumber, "text", "inconsistent-constraint");
              });
              component.setState({inconsitent: true})              
            }      
            resolve({program: program, inconsistencies: inconsistencies});
          })
      })
    }
    else{
      return new Promise(resolve => {
        resolve({program: program, inconsistencies: []});
      })

    }
  }