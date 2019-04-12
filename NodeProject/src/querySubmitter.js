import { validateBeforeSubmit } from "./alertService";
import { parse } from "./parser/parser";
import { intersectionRepairs } from "./IARService";

export async function submit(component) {
  if(component.program && component.program.getProcessedInconsistencies && 
    component.program.getProcessedInconsistencies.length > 0){
      var program = parse(component.state.programEditorInstance.getValue() + "\n" + component.state.queriesEditorInstace.getValue())      
      var intersection;
      if(component.state.intersectionRepairs){
        intersection = component.state.intersectionRepairs
      }
      else{
        var iarResult = await intersectionRepairs(program);
        component.setState({ intersectionRepairs: iarResult.intersection, repairs : iarResult.repairs });
        intersection = iarResult.intersection;
      }
      program.facts = intersection;

      var executionCalls = program.queries.map(q => q.execute(program));
      var allResults = Promise.all(executionCalls);
      allResults.then(res =>
        {
          component.setState({ results: res.map(r => r.data[0]) });
        })
  }
  else{
    component.program = parse(component.state.programEditorInstance.getValue() + "\n" + component.state.queriesEditorInstace.getValue());
    component.setState({
      results: []
    },
    function () {
      component.program.getInconsistencies.then( res =>{
        if(validateBeforeSubmit(component)){
          var executionCalls = component.program.queries.map(q => q.execute(component.program));
          var allResults = Promise.all(executionCalls);
          allResults.then(res =>
            {
              component.setState({ results: res.map(r => r.data[0]) });
            }
            )
        }
      }
      )
    }
  );
  }
}