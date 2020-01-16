import React from 'react';
import Header from './components/Header.js'
import './App.css';
import {BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom'
import {Login, Signup} from './components/Login'

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

  render() {
    return (
      <Router>
        <div className="App">
          <Header player={this.state.player}/>
          <Switch>
            <Route exact path='/login'>
              {this.state.player ? <Redirect to='/' /> : <Login formSubmit={this.submitLogin} />}
            </Route>
            <Route exact path='/signup'>
              {this.state.player ? <Redirect to='/' /> : <Signup formSubmit={this.register} />}
            </Route>
            <Route exact path ='/'>Hello</Route>
          </Switch>
        </div>

      </Router>
    )
  }
}

export default App;

