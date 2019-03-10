
import { executeQuery } from "./IrisCaller";

export function submit(program, component) {
    if (program.errors.length == 0 && program.isGuarded) {
      program.consistencyPromise().then(inconsistencies => {
        component.setState({ inconsistencies: inconsistencies ? inconsistencies : [] });

        if(!inconsistencies || !inconsistencies.some(i => i.result.some(r => r.Results.length>0))){
          executeQuery(program.toStringWithoutNcsAndEgds())
          .then(res => {
            component.setState({ results: res.data });
          });
        }
      });
    }
  }