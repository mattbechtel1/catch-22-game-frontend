import React from 'react'
import StatusBar from '../components/StatusBar'
import PartnerList from './PartnerList'
import NewGameForm from '../components/NewGameForm'
import PartnerCard from '../components/PartnerCard'

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
        if (characters.storage.find(character => character.name === 'Nurse Duckett')) {
            duckettStatus = 'available'
        } else if (characters.specialActive.find(character => character.name === 'Nurse Duckett')) {
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

    componentDidMount() {
        console.log('component mounted')
    }

    showCharacterCard = (character) => {
        this.setState({activePartner: character})
    }

    render() {
        return (
            <div>
                <StatusBar gameState={this.state} save={this.saveGame} />
                <div className='extend-to-fill-height gridlines' style={{display: 'flex'}}>
                    <div style={{width: '20%', flexDirection: 'column', flex: 1}}>
                        <div><PartnerList clickHandler={this.showCharacterCard} people={this.state.characters.living}/></div>
                        <div style={{position: 'relative', bottom: '5px', paddingTop: '25px'}}><PartnerList clickHandler={this.showCharacterCard} people={this.state.characters.specialActive} /></div>
                    </div>
                    <div className='gridlines full-center' style={{width: '80%'}}>
                        {this.state.activePartner ? 
                            <PartnerCard character={this.state.activePartner} /> 
                            :
                            this.state.id ? 
                                <p>You are Playing!</p> : 
                                <NewGameForm start={this.newGame}/>
                        }
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
