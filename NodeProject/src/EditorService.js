export function markArityIssues(component){
    var notConsistentArityPredicates = component.program.arityDictionary.aritiesAreConsistent().predicatesNotArityConsistent;
    var markers = [];
    notConsistentArityPredicates.forEach(predicateName => {
    var lessCommonAritiesByLine = component.program.arityDictionary.getLessCommonArityLinesForPredicate(predicateName);
            
    lessCommonAritiesByLine.forEach(arityLine => {
        var lineText = component.programEditorInstance.getLine(arityLine.lineNumber);
        var regEx = regExModule.service.predicateRegExByNameAndArity(predicateName, arityLine.arity);
        var indexes = regExModule.service.arrayOfIndexes(regEx, lineText); 
        indexes.forEach(i => {
        markers.push(component.programEditorInstance.markText(
            {line :parseInt(arityLine.lineNumber), ch: i.start}, 
            {line :parseInt(arityLine.lineNumber), ch : i.end}, 
            {className : 'arity-error'}))
        })
    })
    })
    component.markers = markers;
}

export function markConflictingKeys(component){
    component.program.getConflictingKeys.forEach(key => {
      component.programEditorInstance.addLineClass(key.lineNumber, "text", "ungarded-tgd");
    })
  }

export function markInconsistencies(component){
    component.program.processedInconsistencies.forEach(inconsitency => {
      component.programEditorInstance.addLineClass(inconsitency.nc.lineNumber, "text", "inconsistent-constraint");
    });
}