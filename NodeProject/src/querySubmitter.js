
import { executeQuery } from "./IrisCaller";
import { validateBeforeSubmit } from "./alertService";
import { parse } from "./parser/parser";

export function submit(component) {
  component.state.program.getInconsistencies.then(res =>{
    component.setState({
      program: parse(component.state.programEditorInstance.getValue() + "\n" + component.state.queriesEditorInstace.getValue())
    },
    function () {
      component.state.program.getInconsistencies.then( res =>{
        if(validateBeforeSubmit(component)){
          executeQuery(component.state.program.toStringWithoutNcsAndEgds(), component.state.program.isGuarded())
          .then(res => {
            component.setState({ results: res.data });
          });
        }
      }
      )
    }
  );
  })
}

