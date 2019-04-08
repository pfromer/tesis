
import axios from "axios";

export function executeQuery(programText, isGuarded){
    return(
        axios
        .get("http://localhost:8080/iris/query", {
        params: {
            test: JSON.stringify({
                program: programText,
                isGuarded: isGuarded
            })
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


    await fetch('http://localhost:8080/iris/iar', {
        method: 'post',
        body: JSON.stringify(params)
      }).then(function(response) {
            response.json().then(function(data) {
            result = data.map(r => r.Facts.map(r => r.Text));
        });
      });

    return result;
}