import React from 'react'
import StatusBar from '../components/StatusBar'
import PartnerList from './PartnerList'
import NewGameForm from '../components/NewGameForm'
import {BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom'

export default class GamePlay extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            id: 0,
            name: '',
            dayCount: 0,
            money: 0,
            sanity: 50, //scaled 0 to 100
            flown: 10, //increments by 1
            goal: 40, //increments by 5 or 10
            injury: '',
            characters: {
                living: [],
                specialActive: [],
                storage: []
            },
            soundOn: true,
            timings: 'slow',
            defaultColleagues: [],
            activePartner: null
        }
    }

    convertDataToState = ({id, name, dayCount, money, sanity, flown, goal, soundOn, timings, characters}) => {
            // debugger
            this.setState({id, name, dayCount, money, sanity, flown, goal, soundOn, timings, 
                characters: {
                    living: characters.filter(character => character.sublist === 'airman'),
                    specialActive: characters.filter(character => character.sublist === 'special'),
                    storage: characters.filter(character => character.sublist === 'storage')
                }
             },
            () => console.log('update complete'))   
    }

    newGame = (e) => {
        e.preventDefault()
        if (!!e.target.name.value) {
            fetch('http://localhost:3022/games', {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: e.target.name.value
                })
            })
            .then(response => response.json())
            .then(this.convertDataToState)
        } else {
            alert('You must supply a name to begin a game.')
        }
    }

    saveGame = () => {
        const {name, id, dayCount, money, sanity, flown, goal, injury, characters, soundOn, timings} = this.state
        
        let livingCharacterIds = []
        for (const characterList in characters) {
            livingCharacterIds.concat(characters[characterList].map(character => character.id))
        }

        let duckettStatus;
        if (characters.storage.map(character => character.name).includes('Nurse Duckett')) {
            duckettStatus = 'available'
        } else if (characters.specialActive.map(character => character.name).includes('Nurse Duckett')) {
            duckettStatus = 'live'
        } else {
            duckettStatus = 'unavailable'
        }

        fetch('http://localhost:3022/games/' + id, {
            method: 'PUT',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                dayCount: dayCount,
                money: money + 20,
                sanity: sanity,
                flown: flown,
                goal: goal,
                soundOn: soundOn,
                timings: timings,
                injury: injury,
                partner_ids: livingCharacterIds,
                duckett: duckettStatus
            })
        })
        .then(response => response.json())
        .then(json => console.log(json))
    }

    payday = () => {
        this.setState({
            money: this.state.money + 15,
            sanity: this.state.sanity + 3
            })
        this.displayMessage('Payday! Go out and enjoy that wartime Italian inflation!')
    }

    postTurnChecks = () => {
        let toGoal = this.state.goal - this.state.flown
        if (this.state.dayCount % 7 === 0) {this.payday()}
        if (Math.random() < 1/(toGoal**1.5)) {this.cathcart()}
    }

    cathcart = () => {
        let toGoal = this.state.goal - this.state.flown
        if (Math.random() < 0.2) {
            this.setState({
                goal: this.state.goal + 10,
                sanity: this.state.sanity - Math.max(10 - toGoal, 1)
            }, () => this.displayMessage('Colonel Cathcart raised the required number of missions by TEN to ' + this.state.goal + '.'))
        } else {
            this.setState({
                goal: this.state.goal + 5,
                sanity: this.state.sanity - Math.max(5 - toGoal, 0)
            }, () => this.displayMessage('Colonel Cathcart raised the required number of missions by five to ' + this.state.goal)
            )
        }
    }

    displayMessage = (message) => {
        console.log(message)
    }

    componentDidMount() {
        console.log('component mounted')
        fetch('http://localhost:3022/games/1')
        .then(response => response.json())
        .then(this.convertDataToState)
    }

    render() {
        return (
            <div>
                <StatusBar gameState={this.state} save={this.saveGame} />
                <div className='extend-to-fill-height gridlines' style={{display: 'flex'}}>
                    <div style={{width: '20%', flexDirection: 'column', flex: 1}}>
                        <div><PartnerList people={this.state.characters.living}/></div>
                        <div style={{position: 'absolute', bottom: '5px'}}><PartnerList people={this.state.characters.specialActive} /></div>
                    </div>
                    <div className='gridlines full-center' style={{width: '80%'}}>
                        {this.state.gameId ? null : <NewGameForm start={this.newGame}/>}
                    </div>
                </div>
            </div>
        )
        
        
    }

}




// ideas

// If Orr 'dies', he is replaced by 4 non-descript pilots
// Other novel characters
// If sanity falls below 10, option to ask Doc to declare you clinically insane is offered

// event types, all increment day count by 1, except holidays
// MISSION VOLUNTEERED
// MISSION DRAFTED
// MISSION DECLINED
// HOLIDAY BREAK
// HOSPITAL DAY
// MILO MISSION
