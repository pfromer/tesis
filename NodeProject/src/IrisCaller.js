
export async function executeProgram(programJson){
    const response = await fetch('http://localhost:8080/iris/query'	, {
        method: 'post',
        body: JSON.stringify(programJson)
        });

        const json = await response.json();
        return json;

}


export async function getIarRepairs(programJson, max_depth){

    const response = await fetch('http://localhost:8080/iris/iar', {
        method: 'post',
        body: JSON.stringify(programJson)
      })
    const json = await response.json();
    var result = json.map(r => r.Facts.map(r => r.Text));
    return result;
}