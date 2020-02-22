
export async function executeProgram(programJson){
    const response = await fetch('http://localhost:8080/iris/query'	, {
        method: 'post',
        body: JSON.stringify(programJson)
        });

        const json = await response.json();
        return json;

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