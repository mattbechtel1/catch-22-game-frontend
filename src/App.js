import React from 'react';
import Header from './components/Header.js'
import './App.css';
import {BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom'
import {Login, Signup, Logout} from './components/Login'
import GamePlay from './containers/Gameplay.js';

class App extends React.Component {
  constructor() {
    super()
    this.state = {player: null}
  }

  submitLogin = (e) => {
    e.preventDefault()
    this.setState({player: 'old playa'})
    // fetch user for serialized json
  }

  register = (e) => {
    e.preventDefault()
    this.setState({player: 'new playa'})
  }

  logout = () => {
    this.setState({player: null})
  }

  render() {
    const {player} = this.state
    return (
      <Router>
        <div className="App">
          <Header player={player}/>
          <Switch>
            <Route exact path='/login'>
              {player ? <Redirect to='/' /> : <Login formSubmit={this.submitLogin} />}
            </Route>
            <Route exact path='/signup'>
              {player ? <Redirect to='/' /> : <Signup formSubmit={this.register} />}
            </Route>
            <Route path='/logout'>
              {player ? <Logout formSubmit={this.logout} /> : <Redirect to='/login' />}
            </Route>
            <Route exact path ='/'>It's the best catch there is.</Route>
            <Route path='/play'>
              <GamePlay />
            </Route>
          </Switch>
        </div>
      </Router>
    )
  }
}

export default App;

