import React from "react";
import {UnControlled as CodeMirror} from 'react-codemirror2'
import './App.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
require('codemirror/mode/xml/xml');
require('codemirror/mode/javascript/javascript');

export class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.instance = null;
        this.allRegex = props.allRegex;         
        this.updateClass = this.updateClass.bind(this);
      }

      updateClass(text, lineNumber){
        if(!this.allRegex.some(r => r.test(text)))
        {
            this.instance.addLineClass(lineNumber, "text", "syntax-error")
        }
        else{
            this.instance.removeLineClass(lineNumber, "text", "syntax-error")
        }
      }

      
      render() {
          return(
        <CodeMirror
            editorDidMount={editor => { this.instance = editor; this.props.setInstance(editor) }}
            value={this.props.text}
            options={{
                mode: 'xml',
                theme: 'material',
                lineNumbers: true
            }}
            onChange={(editor, data, value) => {

                if(!data.origin || ["undo", "redo"].some(o => o == data.origin))
                {
                    var lineNumber = 0;
                    var lineInfo = this.instance.lineInfo(lineNumber);
                    while(lineInfo){
                        this.updateClass(lineInfo.text, lineNumber);
                        lineNumber ++;
                        lineInfo = this.instance.lineInfo(lineNumber);
                    }
                }

                else if(data.origin === "paste"){
                    var lineNumber = data.from.line;
                    data.text.forEach( (text, i) => {
                        this.updateClass(text, lineNumber + i);
                    });
                }

                else{
                    var lineNumber = data.from.line;
                    var lineInfo = this.instance.lineInfo(lineNumber);
                    this.updateClass(lineInfo.text, lineNumber);
                }
            }}
          /> ) 
      }
}