import React, { useState, useEffect, useRef } from 'react'
import proteinBg from './pdb_bg.png'
import { NGL } from 'react-ngl'
import './css/ProteinStructure.css'

export default function ProteinStructure(props) {
    
  const [ stage, setStage ] = useState(null)
  const [ pdb, setPDB ] = useState(null)
  const [ tmp, setTmp ] = useState(0)

  //const isInitialMount = useRef(true);

  // On update, show changes to pdb file?
  useEffect(() => {
    /*if (isInitialMount.current) {
      isInitialMount.current = false;*/
    pdbFunction()
  });

  // lifecycle mounts protein structure
  /*useEffect( () => {
    pdbFunction()
  })*/

  // sets state of stage and pdb for visualisation
  const pdbFunction = () => {
    var pdbTmp = props.pdbFile

    //console.log(props.selectedRows.length);

    if (!stage) {
      setStage(new NGL.Stage("viewport", {backgroundColor: "black"}))
    } /*else if (stage || props.selectedRows.length > 0) {
      //console.log("Removed");
      stage.removeAllComponents();
    }*/

    setPDB(pdbTmp)
    
    if (stage) {
        
        // loop through selectedRows and append to string residue ids

      setTimeout( () => {

        var schemeId = NGL.ColormakerRegistry.addScheme(function (params) {
          this.atomColor = function (atom) {
            if (atom.serial < 1000) {
              return 0x0000FF;  // blue
            } else if (atom.serial > 2000) {
              return 0xFF0000;  // red
            } else {
              return 0x00FF00;  // green
            }
          };
        });

          /*if (props.selectedRows[0]) {
            var schemeID = NGL.ColormakerRegistry.addSelectionScheme([
              ["red", (""+props.selectedRows[0].res_id)],
              ["white", "*"]
              ], "colorscheme pdb");
          
            stage.loadFile( pdbTmp, { ext: "pdb" } ).then( function(component){
              component.addRepresentation("ribbon", {color: schemeID}) ;
              component.autoView(2500);
            })
          } else */{
            stage.loadFile( pdbTmp, { ext: "pdb" } ).then( function(component){
              component.addRepresentation("ribbon", { color: schemeId });
              component.autoView(2500);
            })
          } 

        }
      )
      //console.log(stage.getParameters())
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