import * as alertService from "./AlertService2";
import * as editorService from "./EditorService";

export var datalogFragmentService = {
    checkDatalogFragment: async function (component) {
        var statusObject = await component.programWithNoQueries.getStatus();
        if (statusObject.status == "SYNTAX ERROR") {
            alertService.setErrorSyntaxAlert(component);
        } else if (statusObject.status == "ARITIES ISSUES") {
            alertService.setArityIssuesAlert(component);
            editorService.markArityIssues(component);
        } else if (component.programWithNoQueries.isLinear()) {
            alertService.setLinearFragmentAlert(component);
        } else if (component.programWithNoQueries.isGuarded()) {
            alertService.setGuardedFragmentAlert(component);
        } else if (!component.programWithNoQueries.isGuarded()) {
            alertService.setOutOfGuardedFragmentAlert(component);
        }
    }
}