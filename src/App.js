import React from 'react';
import Header from './components/Header.js'
import './App.css';

class App extends React.Component {
  constructor() {
    super()
    this.state = {player: null}
  }

  render() {
    return <div className="App"> <Header player={this.state.player}/> </div>
  }
}

export default App;
