import React, { useState, useEffect } from 'react'
import logo from './pdb_bg.png'
import { Stage } from 'ngl'
import './css/ProteinStructure.css'

export default function ProteinStructure(props) {
    
  const [ stage, setStage ] = useState(null)
  const [ pdb, setPDB ] = useState(null)

  /*useEffect( () => {
    if (stage) stage.dispose();
  })

  const resetStage = () => {
    if(stage) {
      stage.removeAllComponents();
      setStage(null)
      setPDB(false)
    }
  }*/

  const pdbFunction = (event) => {

    event.preventDefault()

    var pdb = props.pdbFile

    if (!stage) {
      setStage(new Stage("viewport", {backgroundColor: "black"}))
    } else stage.removeAllComponents();

    setPDB(pdb);
    
    if (stage) {
    setTimeout( () =>
      stage.loadFile( pdb, { ext: "pdb" } ).then( function( comp ){
        comp.addRepresentation( "ribbon" )})
     );
    }

  }

    return (
      <div className="protein-structure">
        <div id="viewport" className="viewport">
          <img 
          src={logo} 
          className="protein-image" 
          alt="logo" 
          style={{display: pdb ? "none" : "block"}}
          />
        </div>
        <form className='pdbform'>
          <button 
          className='show-protein-button' 
          onClick={(e) => pdbFunction(e)}>
            Show Protein Structure
          </button>
        </form>
      </div>
    );
}