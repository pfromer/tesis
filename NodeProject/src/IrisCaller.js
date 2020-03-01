const axios = require("axios");


export async function executeProgram(programJson){
    var error;
    const response = await axios.post('http://localhost:8080/iris/query',JSON.stringify(programJson), {timeout: 99999999} )
    .catch(err=> {
        error = err;
    })

    if(!error) {
        const json = await response.data;
        return json;
    } else {
        return {error : "The server seems to be down."};
    }
}


export async function getIarRepairs(programJson){
    var error;
    const response = await axios.post('http://localhost:8080/iris/iar',JSON.stringify(programJson), {timeout: 99999999} )
    .catch(err=> {
        error = err;
    })

    if(!error) {
        const json = await response.data;
        return json.map(r => r.Facts.map(r => r.Text));
    } else {
        return {error : "The server seems to be down."};
    }
}