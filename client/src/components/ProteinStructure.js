import React, { useState, useEffect } from 'react'
import proteinBg from './pdb_bg.png'
import { NGL } from 'react-ngl'
import './css/ProteinStructure.css'

export default function ProteinStructure(props) {
    
  const [ stage, setStage ] = useState(null)
  const [ pdb, setPDB ] = useState(null)

  // On update, show changes to pdb model
  useEffect(() => {
    pdbFunction()
  });

  // sets state of stage and pdb for visualisation
  const pdbFunction = () => {
    var pdbTmp = props.pdbFile

    if (!stage) {
      setStage(new NGL.Stage("viewport", {backgroundColor: "black"}))
    } else if (stage || props.selectedRows.length) {
      stage.removeAllComponents();
    }

    setPDB(pdbTmp)
    
    if (stage) {
        
        // loop through selectedRows and append to string residue ids
      setTimeout( () => {

          if (props.selectedRows.length) {
            var selectedResidues = ["red"];
            var resString = "";
            for (var i = 0; i < props.selectedRows.length; i++) {
              if (i + 1 == props.selectedRows.length) resString += props.selectedRows[i].res_id.toString();
              else resString += props.selectedRows[i].res_id.toString() + " or ";
            }

            selectedResidues.push(resString);

            var schemeID = NGL.ColormakerRegistry.addSelectionScheme([
              selectedResidues,
              ["white", "*"]
              ], "colorscheme pdb");
          
            stage.loadFile( pdbTmp, { ext: "pdb" } ).then( function(component){
              component.addRepresentation("ribbon", {color: schemeID}) ;
              component.autoView(2500);
            })
          } else {
            stage.loadFile( pdbTmp, { ext: "pdb" } ).then( function(component){
              component.addRepresentation("ribbon", { color: "white" });
              component.autoView(2500);
            })
          } 

        }
      )
    }
  }

  return (
    <div className="protein-structure">
      <div id="viewport" className="viewport">
        <img 
        src={proteinBg} 
        className="protein-image" 
        alt="proteinBg" 
        style={{display: pdb ? "none" : "block"}}
        />
      </div>
    </div>
  )
}