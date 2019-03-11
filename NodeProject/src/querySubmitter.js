
import { executeQuery } from "./IrisCaller";
import { validateBeforeSubmit } from "./alertService";
import { parse } from "./parser/parser";
import { checkConstraints } from "./constraintsService";

export function submit(component) {
  checkConstraints(component).then(res =>{
    component.setState({
      inconsistencies: res.inconsistencies,
      program: parse(component.state.programEditorInstance.getValue() + "\n" + component.state.queriesEditorInstace.getValue())
    },
    function () {
      if(validateBeforeSubmit(component)){
        executeQuery(component.state.program.toStringWithoutNcsAndEgds(), component.state.program.isGuarded())
        .then(res => {
          component.setState({ results: res.data });
        });
      }
    }
  );
  })
}

