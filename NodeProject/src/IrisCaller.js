
export async function executeProgram(programJson){
    const response = await fetch('http://localhost:8080/iris/query'	, {
        method: 'post',
        body: JSON.stringify(programJson)
        });

        const json = await response.json();
        debugger;
        return json;

}


export async function getIarRepairs(programJson){

    debugger

    const response = await fetch('http://localhost:8080/iris/iar', {
        method: 'post',
        body: JSON.stringify(programJson)
      })
    const json = await response.json();

    if(json.error) {
       return json; 
    }

    var result = json.map(r => r.Facts.map(r => r.Text));
    return result;
}