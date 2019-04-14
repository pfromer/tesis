/*import { validateBeforeSubmit } from "./alertService";
import { parse } from "./parser/parser";
import { intersectionRepairs } from "./IARService";

export async function submit(component) {
  if(component.program && component.program.getProcessedInconsistencies && 
    component.program.getProcessedInconsistencies.length > 0){
      var program = parse(component.programEditorInstance.getValue() + "\n" + component.queriesEditorInstace.getValue())      
      var intersection;
      if(component.intersectionRepairs){
        intersection = component.intersectionRepairs
      }
      else{
        var iarResult = await intersectionRepairs(program);
        component.intersectionRepairs = iarResult.intersection;
        component.repairs = iarResult.repairs;
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
    component.program = parse(component.programEditorInstance.getValue() + "\n" + component.queriesEditorInstace.getValue());
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
}*/