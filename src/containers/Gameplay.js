import React from 'react'
import StatusBar from '../components/StatusBar'
import PartnerList from './PartnerList'
import NewGameForm from '../components/NewGameForm'
import PartnerCard from '../components/PartnerCard'
import OptionList from './OptionList'
import Message from '../components/Message'

export default class GamePlay extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            id: 0,
            name: '',
            dayCount: 0,
            money: 0,
            sanity: 0, //scaled 0 to 100
            flown: 0, //increments by 1
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
            activePartner: null,
            message: '',
            options: []
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
            .then((data) => { 
                this.convertDataToState(data)
                this.gameBegin()
            })
        } else {
            alert('You must supply a name to begin a game.')
        }
    }

    saveGame = () => {
        const {name, id, dayCount, money, sanity, flown, goal, injury, characters, soundOn, timings} = this.state
        
        let livingCharacterIds = []
        for (const characterList in characters) {
            livingCharacterIds.push(...characters[characterList].map(character => character.id))
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
                money: money,
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
        .then(() => this.setState({activeBtn: false}))
    }

    showCharacterCard = (character) => {
        this.setState({activePartner: character})
    }

    deactivateCharacterCard = () => {
        this.setState({activePartner: null})
    }

    determineBlur = () => {
        return this.state.activePartner ? 'blur' : 'unblur'
    }

    displayMessages = async (messages) => {
        function delay() {
            return new Promise(resolve => setTimeout(() => resolve(), 1500)) //move back to 4500 after testing
        }
    
        for (let message of messages){
            this.setState({message: message})
            await delay()
        }
    }

    // Gameplay logic

    gameBegin = async () => {
        await this.displayMessages(["Welcome to Pianosa!", 
            "You are a bombardier in the 256th US Army Air Squadron.", 
            "Your only goal is to get home alive.", 
            "Per U.S. Army Air Force policy, you will be welcomed home after you complete 40 missions.", 
            "You have also been informed that people who have been declared insane are grounded in accordance with U.S. Army Air Force policy.",
            "It is up to you to determine how you will escape this war."])
            .then(this.playAirRound)
    }

    playAirRound = () => {
        const random = Math.random()
        if ((this.state.flown < 50 && random < 0.4) || random < 0.2) {
            this.displayMessages(["The upcoming mission is a milk run. Would you like to volunteer?"])
            this.provideOptions([{text: 'Volunteer', callResult: (() => this.providePartners('easy'))}, {text: 'Pass', callResult: null}])
        } else if ((this.state.flown < 50 && random < 0.8) || random < 0.6) {
            this.displayMessages(["Intelligence on the upcoming mission is unclear.", "It could be dangerous, but there's also a fair possibility you will receive no flak. Would you like to volunteer?"])
            this.provideOptions([{text: 'Volunteer', callResult: (() => this.providePartners('medium'))}, {text: 'Pass', callResult: null}])
        } else {
            this.displayMessages(["The upcoming mission will fly into hostile territory and is likely to be dangerous. Would you like to volunteer?"])
            this.provideOptions([{text: 'Volunteer', callResult: (() => this.providePartners('hard'))}, {text: 'Pass', callResult: null}])
        }
    }

    providePartners = (runType) => {
        let volunteers = this.state.characters.living.sort(() => 0.5 - Math.random()).slice(0,5)
        this.displayMessages(["The following men have volunteered for the mission. Who would you like to fly with?"])
        this.provideOptions(volunteers.map(char => {
            return {text: char.name, callResult: (() => this.partnerUp(char.id, volunteers, runType))}
        }))
    }

    partnerUp = async (charId, volunteers, runType) => {
        const todaysPartner = this.state.characters.living.find(char => char.id === charId)
        const adjustedVolunteers = volunteers.filter(volunteer => volunteer !== todaysPartner)
        adjustedVolunteers.sort(() => 0.5 - Math.random())

        let pairingA = [adjustedVolunteers[0], adjustedVolunteers[1]]
        let pairingB = [adjustedVolunteers[2], adjustedVolunteers[3]]

        const yourErraticness = ((this.state.sanity / 10) + todaysPartner.erraticness)
        const pairingAErraticness = pairingA[0].erraticness + pairingA[1].erraticness
        const pairingBErraticness = pairingB[0].erraticness + pairingB[1].erraticness
        const totalErraticness = yourErraticness + pairingAErraticness + pairingBErraticness

        let yourHits = Math.round(yourErraticness / totalErraticness * 4)
        let pairingAHits = Math.round(pairingAErraticness / totalErraticness * 4)
        let pairingBHits = Math.round(pairingBErraticness / totalErraticness * 4)

        let enemyRandomizer = Math.random()
        let messages = []
        debugger
        if ((runType === 'easy' && enemyRandomizer < 0.05) || (runType === 'medium' && enemyRandomizer < 0.6) || (runType === 'hard' && enemyRandomizer < 0.95)) {
            messages.push("Your squadron has been fired upon by German anti-aircraft weapons.")
            while (yourHits > 0) {
                messages.push("You caught some flak during your mission!")
                let hitPunisher = Math.random()
                console.log('My hit rando is', hitPunisher)
                if (hitPunisher < 0.05) {
                    messages.push(`Your plane was shot down. You and ${todaysPartner.name} perished.`)
                    this.displayMessages(messages)
                    this.deathScreen()
                    yourHits = 0
                } else if (hitPunisher < 0.15) {
                    messages.push("You were injured during the barrage.", "Upon returning to base, you went straight to the hospital.")
                    yourHits = 0
                } else if (hitPunisher < 0.25) {
                    messages.push(`${todaysPartner.name} was injured during the barrage of anti-aircraft fire.`)
                    yourHits = 0
                } else {
                    yourHits -= 1
                }
            }
            if (messages.length === 1) {
                messages.push("Fortunately, you escaped unharmed.")
            }

            while (pairingAHits > 0) {
                let hitPunisher = Math.random()
                console.log('Pairing A hit rando is', hitPunisher)

                if (hitPunisher < 0.05) {
                    messages.push(`${pairingA[0].name} and ${pairingA[1]} were shot down during the mission. They are believed to be dead.`)
                    this.setState({characters: {
                        ...this.state.characters,
                        living: this.state.characters.living.filter(char => char !== pairingA[0]).filter(char => char !== pairingA[1])
                    }})
                    pairingAHits = 0
                } else if (hitPunisher < 0.15) {
                    messages.push(pairingA[0].name + " was injured during the barrage.", "He has checked into the hospital.")
                    pairingAHits = 0
                } else if (hitPunisher < 0.25) {
                    messages.push(pairingA[1].name + " was injured during the barrage.", "He has checked into the hospital.")
                    pairingAHits = 0
                } else {
                    pairingAHits -= 1
                }
            }

            while (pairingBHits > 0) {
                let hitPunisher = Math.random()
                console.log('Pairing B hit rando is', hitPunisher)
                if (hitPunisher < 0.05) {
                    messages.push(`${pairingB[0].name} and ${pairingB[1]} were shot down during the mission. They are believed to be dead.`)
                    this.setState({characters: {
                        ...this.state.characters,
                        living: this.state.characters.living.filter(char => char !== pairingB[0]).filter(char => char !== pairingB[1])
                    }})
                    pairingBHits = 0
                } else if (hitPunisher < 0.15) {
                    messages.push(pairingB[0].name + " was injured during the barrage.", "He has checked into the hospital.")
                    pairingBHits = 0
                } else if (hitPunisher < 0.25) {
                    messages.push(pairingB[1].name + " was injured during the barrage.", "He has checked into the hospital.")
                    pairingBHits = 0
                } else {
                    pairingBHits -= 1
                }
            }
        } else {
            messages.push("There was no sign of Germans anywhere.")
            this.setState((state) => ({
                sanity: state.sanity + 1
            }))
        }

        await this.displayMessages(messages)
        this.setState((state) => ({
            flown: state.flown + 1,
            dayCount: state.dayCount + 1,
            sanity: state.sanity + todaysPartner.sanityChange
        }))

        alert("About to begin another round")
        this.playAirRound()
    }

    deathScreen = () => {
        console.log("game ended")
    }
    
    provideOptions = (options) => {
        this.setState({options: options})
    }

    render() {
        return (
            <div>
                <StatusBar gameState={this.state} save={this.saveGame} blurClass={this.determineBlur}/>
                <div className='extend-to-fill-height gridlines' style={{display: 'flex'}}>
                    <div className={this.determineBlur()} style={{width: '20%', flexDirection: 'column', flex: 1}}>
                        <div><PartnerList clickHandler={this.showCharacterCard} people={this.state.characters.living}/></div>
                        <div style={{position: 'relative', bottom: '5px', paddingTop: '25px'}}><PartnerList clickHandler={this.showCharacterCard} people={this.state.characters.specialActive} /></div>
                    </div>
                    <div className='gridlines full-center' style={{width: '80%'}}>
                        {this.state.activePartner ? 
                            <PartnerCard unmount={this.deactivateCharacterCard} character={this.state.activePartner} /> 
                            :
                            this.state.id ? 
                                <div><Message text={this.state.message} />< br/>
                                <OptionList options={this.state.options} /></div> : 
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