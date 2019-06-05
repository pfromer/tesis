
import axios from "axios";

export function executeQuery(programText, isGuarded, variablesToShowByQuery){
    var internalParams = {
        program: programText,
        isGuarded: isGuarded
    };
    
    if(variablesToShowByQuery){
        internalParams.variablesToShowByQuery = variablesToShowByQuery.join(",")
    }

    return(
        axios
        .get("http://localhost:8080/iris/query", {
        params: {
            test: JSON.stringify(internalParams)
        }
        })
    )
}

export async function getIarRepairs(facts, tgds, ncsAsQueries, isGuarded){

    var params = {
        "facts": facts,
        "tgds": tgds,
        "ncsAsQueries":  ncsAsQueries,
        "isGuarded": isGuarded  
    }

    var result = []; 

    const response = await fetch('http://localhost:8080/iris/iar', {
        method: 'post',
        body: JSON.stringify(params)
      })
    const json = await response.json();
    result = json.map(r => r.Facts.map(r => r.Text));
    return result;
}