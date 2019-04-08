import { executeQuery } from "./IrisCaller";
import { validateBeforeSubmit } from "./alertService";
import { parse } from "./parser/parser";
import { intersectionRepairs } from "./IARService";

export async function submit(component) {
  if(component.state.program && component.state.program.getProcessedInconsistencies && 
    component.state.program.getProcessedInconsistencies.length > 0){
      var program = parse(component.state.programEditorInstance.getValue() + "\n" + component.state.queriesEditorInstace.getValue())      
      var intersection;
      debugger
      if(component.state.intersectionRepairs){
        intersection = component.state.intersectionRepairs
      }
      else{
        debugger
        var iarResult = await intersectionRepairs(program);
        component.setState({ intersectionRepairs: iarResult.intersection, repairs : iarResult.repairs });
        intersection = iarResult.intersection;
      }
      program.facts = intersection;
      executeQuery(program.toStringWithoutNcsAndEgds(), program.isGuarded())
      .then(res => {
        component.setState({ results: res.data });
      });
  }
  else{
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
  }
}

