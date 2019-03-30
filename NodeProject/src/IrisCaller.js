
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

/*export function getIarRepairs(facts, tgds, ncs, isGuarded){
    return(
        axios
        .get("http://localhost:8080/iar/iar", {
        params: {
            test: JSON.stringify({
                facts
            })
        }
        })
    )
}*/