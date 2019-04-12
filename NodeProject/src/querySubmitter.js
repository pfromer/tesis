import { validateBeforeSubmit } from "./alertService";
import { parse } from "./parser/parser";
import { intersectionRepairs } from "./IARService";

export async function submit(component) {
  if(component.state.program && component.state.program.getProcessedInconsistencies && 
    component.state.program.getProcessedInconsistencies.length > 0){
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
    component.setState({
      program: parse(component.state.programEditorInstance.getValue() + "\n" + component.state.queriesEditorInstace.getValue()),
      results: []
    },
    function () {
      component.state.program.getInconsistencies.then( res =>{
        if(validateBeforeSubmit(component)){
          var executionCalls = component.state.program.queries.map(q => q.execute(component.state.program));
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