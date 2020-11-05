  
import React, { Component } from 'react'
import logo from './pdb_bg.png'
import { Stage } from 'ngl'
import './css/ProteinStructure.css'

export default class ProteinStructure extends Component {
    
  componentDidMount() {
    document.addEventListener('paste', this.paste);
  }
 componentWillUnount() {
    document.removeEventListener("paste", this.paste)
    this.state.stage.dispose();
  }

  constructor(props) {
    super(props);
    this.state = {stage: null, pdb: null}
  }

  resetStage () {
    if(this.state.stage) {
      this.state.stage.removeAllComponents();
      this.setState({stage: null, pdb: null});
    }
  }

  pdb (event) {
    event.preventDefault();
    var pdb = this.props.pdbFile

    this.setState({stage: new Stage("viewport")})
    this.setState({pdb});
    setTimeout( () =>
      this.state.stage.loadFile( pdb, { ext: "pdb", defaultRepresentation: true } )
     );
  }
  
  render() {
    return (
      <div className="protein-structure">
        <header className="App-header">
          <div id="viewport" className="viewport" style={{width: "100%", height: "100%"}}>
            <img 
            src={logo} 
            id="logo" className="protein-image" 
            alt="logo" 
            style = {{margin: "auto", display: this.state.pdb ? "none" : "block" }} />
          </div>
          <form className='pdbform'>
            <button className='show-protein' onClick={(e) => this.pdb(e)}>Show Protein Structure</button>
          </form>
        </header>
      </div>
    );
  }
}

// <button type="reset" onClick={ (e) => this.resetStage() }>Reset</button>