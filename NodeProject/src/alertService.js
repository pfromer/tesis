function getSettings(){

    return{
    datalogFragmentSettings:[
        { 
            condition: function(component){return component.state.program.errors.length > 0 },
            heading: '', 
            lines: ["Please correct the syntax errors in your program first."]
          },
          { 
            condition: function(component){return component.state.program.isLinear()},
            heading: '', 
            lines: ["Your program is in the Linear Fragment."]
          },
          { 
            condition: function(component){return component.state.program.isGuarded()}, 
            heading: '', 
            lines: ["Your program is in the Guarded Fragment."]
          },
          { 
            condition: function(component){return !component.state.program.isGuarded()},
            heading: "Out of the Guarded Fragment.", 
            lines: ["The lines marked in blue are ungarded TGDs"],
            callback: function(component){return component.markUngardedTgds },
          }
      ],
    checkConstraintsSettings:[
          { 
            condition: function(component){return component.state.program.errors.length > 0 },
            heading: '', 
            lines: ["Please correct the syntax errors in your program first."]
          },
          { 
            condition: function(component){return hasInconsistencies(component)},
            heading: "Not consistent.", 
            lines: ["The lines marked in green are not fulfilled by your program.", 
                    "You may execute a query under IAR semantics."],
          },
          { 
            condition: function(component){return !hasInconsistencies(component)},
            heading: "Your program is consistent.", 
            lines: []
          }
    ]
    }
}

function hasInconsistencies(component){
    return component.state.inconsistencies && component.state.inconsistencies.some(i => i.result.some(r => r.Results.length>0));
}

function setAlert(component, settingsType){
    var settings = getSettings();
    var setting = settings[settingsType].find(s => s.condition(component));

    if(setting){
        component.setState({alert: {
        lines: setting.lines,
        opened: true,
        onHandleClick : component.onHandleAlertClose,
        heading: setting.heading
      }})

      if(setting.callback) setting.callback(component)();
    }
}


export function setDatalogFragmentAlert(component){
    setAlert(component, 'datalogFragmentSettings');
}

export function setConstraintsAlert(component){
    debugger
    setAlert(component, 'checkConstraintsSettings');
}