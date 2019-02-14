import * as importedModule from "./prueba";

function builder(){

    var a = importedModule.myFunction();

    return {
        a : a
    }
}

export const _builder = builder();