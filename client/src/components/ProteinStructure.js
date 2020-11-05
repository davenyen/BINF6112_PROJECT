import React, { useState, useEffect } from 'react'
import proteinBg from './pdb_bg.png'
import { Stage } from 'ngl'
import './css/ProteinStructure.css'

export default function ProteinStructure(props) {
    
  const [ stage, setStage ] = useState(null)
  const [ pdb, setPDB ] = useState(null)

  // lifecycle mounts protein structure
  useEffect( () => {
    pdbFunction()
  })

  // sets state of stage and pdb for visualisation
  const pdbFunction = () => {
    var pdb = props.pdbFile

    if (!stage) {
      setStage(new Stage("viewport", {backgroundColor: "black"}))
    } else stage.removeAllComponents();

    setPDB(pdb)
    
    if (stage) {
      setTimeout( () =>
        stage.loadFile( pdb, { ext: "pdb" } ).then( function(component){
          component.addRepresentation("ribbon");
          component.autoView(2500);
        })
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