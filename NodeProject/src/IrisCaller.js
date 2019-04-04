
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
        "facts": ["p(?x,?y)","p2('a',?y)"],
        "tgds": ["p(?x,?y)","p2('a',?y)"],
        "ncsAsQueries":  ["p(?x,?y)","p2('a',?y)"],
        "isGuarded":true }

    
   

    var result = [];

    /*var url = new URL("http://localhost:8080/iris/iar");

    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    
    await fetch(url).then(
        response => {
        }
    )*/

    /*var formData = new FormData();

    formData.append('facts', ["p(?x,?y)","p2('a',?y)"]);
    formData.append('tgds', 'sdaf');*/


    fetch('http://localhost:8080/iris/iar', {
        method: 'post',
        body: JSON.stringify(params)
      }).then(function(response) {
        return response.json();
      });

    return result;











    






/*

    const querystring = require('querystring');
    axios.interceptors.request.use(config => {
        config.paramsSerializer = params => {
          // Qs is already included in the Axios package
          return querystring.stringify(params, {
            arrayFormat: "brackets",
            encode: false
          });
        };
        return config;
      });



    return(
        axios
        .get("http://localhost:8080/iris/iar",  {
            params: JSON.stringify({
                objectParams: {
                    "facts": ["asdf"],
                    "tgds": "sdaf",
                    "ncsAsQueries":  "dsaf",
                    "isGuarded" : isGuarded
                }})
            
            }
    ))*/
}
/*
facts: facts,
                tgds: tgds,
                ncsAsQueries:  ncsAsQueries,
                isGuarded : isGuarded*/