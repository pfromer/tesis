
import axios from "axios";

export function executeQuery(programText){
    return(
        axios
        .get("http://localhost:8080/iris/test", {
        params: {
            test: JSON.stringify({
            program: programText
            })
        }
        })
    )
}