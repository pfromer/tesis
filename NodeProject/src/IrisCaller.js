
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

export function getIarRepairs(facts, tgds, ncsAsQueries, isGuarded){

    var url = new URL("http://localhost:8080/iris/iar"),
    params = {
            "facts": ["asdf","chau"],
            "tgds": "sdaf",
            "ncsAsQueries":  "dsaf",
            "isGuarded":true }

    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    fetch(url).then(
        response => {
            debugger
        }
    )











    






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