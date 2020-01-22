import React from 'react';
import Header from './components/Header.js'
import './App.css';
import {BrowserRouter as Router, Switch, Route, Redirect, Link} from 'react-router-dom'
import {Login, Signup, Logout} from './components/Login'
import GamePlay from './containers/Gameplay.js'
import {Button, Container, Loader} from 'semantic-ui-react'

class App extends React.Component {
  constructor() {
    super()
    this.state = {
      player: null,
      userGames: [],
      activeGameId: 0,
      loading: true
    }
  }

  quotes = ["The Texan turned out to be good-natured, generous and likeable. In three days no one could stand him.",
    "Outside the hospital the war was still going on. Men went mad and were rewarded with medals.",
    `"That's some catch, that Catch-22," he observed.
      \n"It's the best there is," Doc Daneeka agreed.`,
    "Anything worth dying for... is certainly worth living for.",
    "He knew everything there was to know about literature, except how to enjoy it.",
    "Insanity is contagious.",
    "It was miraculous. It was almost no trick at all, he saw, to turn vice into virtue and slander into truth, impotence into abstinence, arrogance into humility, plunder into philanthropy, thievery into honor, blasphemy into wisdom, brutality into patriotism, and sadism into justice. Anybody could do it; it required no brains at all. It merely required no character.",
    `"Why are they going to disappear him?" \n"I don't know" \n"It doesn't make sense. It isn't even good grammar.`,
    "The Texan turned out to be good-natured, generous, and likable. In three days no could stand him",
    "Well, he died. You don't get any older than that.",
    "He was a self-made man who owed his lack of success to nobody.",
    `“You have deep-seated survival anxieties. And you don't like bigots, bullies, snobs or hypocrites. Subconsciously there are many people you hate."
      \n"Consciously, sir, consciously," Yossarian corrected in an effort to help. "I hate them consciously.”`,
    "He had decided to live forever or die in the attempt",
    "Prostitution gives her an opportunity to meet people. It provides fresh air and wholesome exercise, and it keeps her out of trouble.",
    `"Sure, that's what I mean," Doc Daneeka said. "A little grease is what makes this world go round. One hand washes the other. Know what I mean? You scratch my back, I'll scratch yours."
      \nYossarian knew what he meant.
      \n"That's not what I meant," Doc Daneeka said, as Yossarian began scratching his back.`,
    "She was the epitome of stately sorrow each time she smiled.",
    `You're American officers. The officers of no other army in the world can make that statement. Think about it.`,
    "Major Major never sees anyone in his office while he's in his office.",
    "That crazy bastard may be the only sane one left",
    "Nately had a bad start. He came from a good family.",
    `“Hasn't it ever occurred to you that in your promiscuous pursuit of women you are merely trying to assuage your subconscious fears of sexual impotence?"
      \n"Yes, sir, it has."
      \n"Then why do you do it?"
      \n"To assuage my fears of sexual impotence.”`,
      "You're an intelligent person of great moral character who has taken a very courageous stand. I'm an intelligent person with no moral character at all, so I'm in an ideal position to appreciate it.",
    "Major Major had lied, and it was good. He was not really surprised that it was good, for he had observed that people who did lie were, on the whole, more resourceful and ambitious and successful than people who did not lie.",
    `"All right, I'll dance with you," she said, before Yossarian could even speak. "But I won't let you sleep with me."
      \n"Who asked you?" Yossarian asked her.
      \n"You don't want to sleep with me?" she exclaimed with surprise.
      \n"I don't want to dance with you."`,
    "It made him proud that 29 months in the service had not blunted his genius for ineptitude.",
    "Under Colonel Korn's rule, the only people permitted to ask questions were those who never did.",
    "I see everything twice!",
    "What's good for Milo Minderbinder is good for the country.",
    "And it wasn't their fault that they were courageous, confident and carefree. He would just have to be patient with them until one or two were killed and the rest wounded, and then they would all turn out okay.",
    "Dear Mrs., Mr., Miss, or Mr. and Mrs. Daneeka: Words cannot express the deep personal grief I experienced when your husband, son, father, or brother was killed, wounded, or reported missing in action."]

  componentDidMount() {
    let token = localStorage.getItem('token')
    if (token) {
      fetch('http://localhost:3022/api/v1/profile', {
        method: 'GET',
        headers: { 'Authentication': token }
      })
      .then(response => response.json())
      .then(data => this.setState({
        player: data,
        userGames: data.games,
        loading: false
      })
      )
    } else {
      this.setState({loading: false})
    }
  }

  submitLogin = (e) => {
    e.preventDefault()
    fetch('http://localhost:3022/api/v1/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: {
          username: e.target.playerName.value,
          password: e.target.password.value
        }
      })
    })
    .then(response => response.json())
    .then(data => {
      if (!data.error) {
        localStorage.setItem('token', data.jwt)
        this.setState({
          player: data.user,
          userGames: data.user.games
        })
      } else {
        alert(data.message)
      }
    })

    
  }

  register = (e) => {
    e.preventDefault()
    fetch('http://localhost:3022/api/v1/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        user: {
          username: e.target.playerName.value,
          password: e.target.password.value
        }
      })
    })
    .then(response => response.json())
    .then(data => {
      this.setState({
        player: data.user
      })
    })
  }

  logout = () => {
    this.setState({player: null})
    localStorage.removeItem('token')
  }

  changeActiveGame = (e) => {
    this.setState({
      activeGameId: parseInt(e.currentTarget.id.split('-')[1])
    })
  }

  render() {
    const {player, loading, userGames, activeGameId} = this.state
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
            <Route exact path ='/'>
              { player ? 
                <div className='black-bg full-center extend-to-fill-height'>
                  <div className='inner-center'>
                    <div>{userGames.map(game => <Link key={'link-' + game.id}to='/play'><Button inverted style={{padding: '8px', margin: '3px'}} key={'game-' + game.id} onClick={this.changeActiveGame} id={'game-' + game.id} color='grey'><strong>{game.name}</strong><br /> <em>Missions Complete: {game.flown}</em></Button></Link>)}</div>
                    <div><Link to='/play'><Button inverted style={{padding: '8px', margin: '3px'}} color='red'>Start a New Game</Button></Link></div>
                  </div>
                </div>
                :
                  loading ?
                  <div style={{margin: '50px'}}><Loader active inline='centered' /></div> 
                  :
                  <Container className='black-bg white-text'>
                   <h4>{this.quotes[Math.floor(Math.random()*this.quotes.length)]}</h4>
                  </Container> }
            </Route>
            <Route path='/play'>
              {player ? <GamePlay activeGame={activeGameId} userId={player.id} /> : <Redirect to='/login'/> }
            </Route>
          </Switch>
        </div>
      </Router>
    )
  }
}

export default App;