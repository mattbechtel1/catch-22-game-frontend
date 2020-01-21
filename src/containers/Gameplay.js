import React from 'react'
import StatusBar from '../components/StatusBar'
import PartnerList from './PartnerList'
import NewGameForm from '../components/NewGameForm'
import PartnerCard from '../components/PartnerCard'
import OptionList from '../components/OptionList'
import Message from '../components/Message'

export default class GamePlay extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            id: 0,
            name: '',
            dayCount: 0,
            passCount: 0,
            money: 0,
            sanity: 0, //scaled 0 to 100
            flown: 0, //increments by 1
            goal: 40, //increments by 5 or 10
            injury: '',
            leave: 0.0,
            characters: {
                living: [],
                specialActive: [],
                storage: []
            },
            soundOn: true,
            timings: 'slow',
            activeBtn: false,
            activePartner: null,
            message: '',
            options: []
        }
    }

    convertDataToState = ({id, name, dayCount, passCount, leave, money, sanity, flown, goal, soundOn, timings, characters}) => {
            this.setState({id, name, dayCount, passCount, leave, money, sanity, flown, goal, soundOn, timings, 
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
        const {name, id, dayCount, money, sanity, flown, leave, passCount, goal, injury, characters, soundOn, timings} = this.state
        
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
                duckett: duckettStatus,
                leave: leave,
                passCount: passCount
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

    displayMessages = async (...messages) => {
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
        await this.displayMessages("Welcome to Pianosa!", 
            "You are a bombardier in the 256th US Army Air Squadron.", 
            "Your only goal is to get home alive.", 
            "Per U.S. Army Air Force policy, you will be welcomed home after you complete 40 missions.", 
            "You have also been informed that people who have been declared insane are grounded in accordance with U.S. Army Air Force policy.",
            "It is up to you to determine how you will escape this war.")
            .then(this.playAirRound)
    }

    playAirRound = async () => {

        const passedMsg = "You have passed on too many consecutive missions and are required to participate in the next one."
        const random = Math.random()
        if (this.state.passCount < 2) {
            if ((this.state.flown < 50 && random < 0.4) || random < 0.2) {
                this.displayMessages("The upcoming mission is a milk run. Would you like to volunteer?")
                this.provideOptions({text: 'Volunteer', callResult: (() => this.providePartners('easy'))}, {text: 'Pass', callResult: this.pass})
            } else if ((this.state.flown < 50 && random < 0.8) || random < 0.6) {
                await this.displayMessages("Intelligence on the upcoming mission is unclear.", "It could be dangerous, but there's also a fair possibility you will receive no flak. Would you like to volunteer?")
                this.provideOptions({text: 'Volunteer', callResult: (() => this.providePartners('medium'))}, {text: 'Pass', callResult: this.pass})
            } else {
                this.displayMessages("The upcoming mission will fly into hostile territory and is likely to be dangerous. Would you like to volunteer?")
                this.provideOptions({text: 'Volunteer', callResult: (() => this.providePartners('hard'))}, {text: 'Pass', callResult: this.pass})
            }

        } else {
            if ((this.state.flown < 50 && random < 0.4) || random < 0.2) {
                await this.displayMessages(passedMsg, "The upcoming mission is a milk run.")
                this.providePartners('easy')
            } else if ((this.state.flown < 50 && random < 0.8) || random < 0.6) {
                await this.displayMessages(passedMsg,"Intelligence on the upcoming mission is unclear.", "It could be dangerous, but there's also a fair possibility you will receive no flak.")
                this.providePartners('medium')
            } else {
                await this.displayMessages(passedMsg, "The upcoming mission will fly into hostile territory and is likely to be dangerous.")
                this.providePartners('hard')
            }
        }
    }

    pass = async () => {
        this.setState((state) => ({
            dayCount: state.dayCount + 1,
            passCount: state.passCount + 1,
            sanity: state.sanity + 1,
            activeBtn: true
        }))
        this.clearOptions()
        await this.displayMessages("You decided to pass on this mission.")
        this.postTurnChecks()
    }

    providePartners = (runType) => {
        let volunteers = this.state.characters.living.sort(() => 0.5 - Math.random()).slice(0,5)
        this.displayMessages("The following men are assigned to this mission. Who would you like to fly with?")
        this.provideOptions(...volunteers.map(char => {
            return {text: char.name, callResult: (() => this.partnerUp(char.id, volunteers, runType))}
        }))
    }

    partnerUp = async (charId, volunteers, runType) => {
        this.clearOptions()
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
        
        if ((runType === 'easy' && enemyRandomizer < 0.05) || (runType === 'medium' && enemyRandomizer < 0.6) || (runType === 'hard' && enemyRandomizer < 0.95)) {
            messages.push("Your squadron has been fired upon by German anti-aircraft weapons.")
            while (yourHits > 0) {
                messages.push("You caught some flak during your mission!")
                let hitPunisher = Math.random()

                if (hitPunisher < 0.05) {
                    messages.push(`Your plane was shot down. You and ${todaysPartner.name} perished.`)
                    this.displayMessages(...messages)
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
            if (messages.length < 3) {
                messages.push("Fortunately, you escaped unharmed.")
            }

            while (pairingAHits > 0) {
                let hitPunisher = Math.random()

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
                sanity: state.sanity + 1,
            }))
        }

        await this.displayMessages(...messages)
        this.setState((state) => ({
            flown: state.flown + 1,
            dayCount: state.dayCount + 1,
            sanity: state.sanity + todaysPartner.sanityChange,
            activeBtn: true,
            passCount: 0
        }))

        alert("About to begin another round")
        this.postTurnChecks()
    }

    deathScreen = async () => {
        await this.displayMessages("Game Ended")
        this.setState({
            id: 0,
            activeBtn: false
        })
    }

    payday = async () => {
        this.setState({
            money: this.state.money + 15,
            sanity: this.state.sanity + 3,
            leave: this.state.leave + 0.6
            })
        await this.displayMessages('Payday! It will be much easier to enjoy that wartime Italian inflation!')
        return
    }
    
    postTurnChecks = async () => {
        let toGoal = this.state.goal - this.state.flown
        if (Math.random() < 1/(toGoal**1.5) - (0.1/toGoal)) {await this.cathcart()}
        if (this.state.dayCount % 7 === 0) {await this.payday()}
    
        let nextDayRandomizer = Math.random()
        
        if (nextDayRandomizer < 0.5) {
            this.playAirRound()
        } else if (nextDayRandomizer < 0.95) {
            this.offDayOptions()
        } else {
            this.bookEvent()
        }
    }
    
    offDayOptions = async () => {
        this.clearOptions()
        await this.displayMessages('There are no missions scheduled for today.', 'What would you like to do on your day off?')
        let options = [{text: 'Hang Out. Do Nothing', callResult: this.moveToNextDay}]
        
        if (this.state.money >= 10) {
            options.push({text: 'Ask Milo to prepare you a meal.', callResult: this.milo})
        }
    
        if (this.state.leave >= 3 && this.state.money >= 50) {
            options.push({text: 'Use 3 days of leave & $50 to visit Rome.', callResult: this.visitRome})
        }

        if (this.state.characters.specialActive.find(char => char.name === "Major Major Major Major")) {
            options.push({text: "Ask Major Major Major Major to find a loophole to get you out of combat.", callResult: this.mmmm})
        }
    
        if (this.state.sanity < 20) {
            options.push({text: 'Ask Doc Daneeka to declare you insane and unfit to fly', callResult: this.catch22})
        }
        
        this.provideOptions(...options)
    }

    mmmm = async () => {
        await this.displayMessages("You went to see Major Major Major Major. He's in his office.", "Major Major Major Major's secretary informs you that the Major only sees people when he is not in his office.", "Would you like to wait?")
        this.provideOptions(
            {text: "Yes, you will wait", callResult: this.mmmmParadox}, 
            {text: "No, that sounds paradoxical. I'll just take the day off.", callResult: this.moveToNextDay})
    }

    mmmmParadox = async () => {
        await this.displayMessages("You were unable to meet with Major Major Major Major when he was not in his office because he was not in his office.")
        this.setState({
            dayCount: this.state.dayCount + 1,
            sanity: this.state.sanity - 1,
            activeBtn: true
        }, this.postTurnChecks)
    }
    
    milo = async () => {
        this.clearOptions()
        const miloRando = Math.round((Math.random() - 0.5) * 20)
        if (miloRando === 0) {
            await this.displayMessages("Milo prepared you a meal for free.")
        } else if (miloRando > 0) {
            await this.displayMessages("You enjoyed a meal of imported pork chops from the highlands of Scotland.", "You're not sure how, but somehow you made money on the transaction.")
        } else {
            await this.displayMessages("You enjoyed a delicious Polish sausage that Milo somehow imported from behind enemy lines.")
        }
    
        this.setState({
            money: this.state.money + miloRando,
            dayCount: this.state.dayCount + 1,
            activeBtn: true,
            sanity: miloRando < 0 ? this.state.sanity - 1 : this.state.sanity
        }, this.postTurnChecks)
    }
    
    visitRome = () => { 
        alert("visiting Rome messages & options")
        this.setState({
            sanity: this.state.sanity + 4,
            money: this.state.money - 50,
            dayCount: this.state.dayCount + 3,
            leave: this.state.leave - 3,
            activeBtn: true
            }, () => { 
                if (this.state.dayCount % 7 === 1 || this.state.dayCount === 2) {
                    this.payday()
                }
                this.postTurnChecks()
            }
        )
    }
    
    catch22 = async () => {
        await this.displayMessages('You asked Doc Daneeka to ground you due to insanity.', "Since concern for one's safety in the face of dangers that are real and immediate is the process of a rational mind,", 'you have been declared sane.')
        this.setState((state) => ({
            sanity: 40,
            dayCount: state.dayCount + 1,
            activeBtn: true
        }), this.postTurnChecks)
    }
    
    moveToNextDay = async () => {
        await this.displayMessages('You enjoyed your day off immensely.')
        this.setState((state) => ({
            dayCount: state.dayCount + 1,
            sanity: state.sanity + 1,
            activeBtn: true
        }), this.postTurnChecks)
    }
    
    bookEvent = async () => {
        alert("A book event occurs")

        if (this.state.characters.living.find(char => char.name === "Major Major")) {
            this.setState({
                characters: {
                    living: this.state.characters.living.filter(char => char.name !== "Major Major"),
                    specialActive: [...this.state.characters, this.state.characters.storage.find(char => char.name === "Major Major Major Major")],
                    storage: this.state.characters.filter(char => char.name !== "Major Major Major Major")
                }
            })
           
            await (this.displayMessages("Due to a computer error, Major M. Major has been promoted to Major.", "You may now refer to him as Major Major Major Major."))
        }

        this.setState((state) => ({
            dayCount: state.dayCount + 1,
            activeBtn: true
        }), this.postTurnChecks)
    }
    
    cathcart = () => {
        let toGoal = this.state.goal - this.state.flown
        if (Math.random() < 0.2) {
            this.setState({
                goal: this.state.goal + 10,
                sanity: this.state.sanity - Math.max(10 - toGoal, 1)
            }, () => this.displayMessages('Colonel Cathcart raised the required number of missions by TEN to ' + this.state.goal + '.'))
        } else {
            this.setState({
                goal: this.state.goal + 5,
                sanity: this.state.sanity - Math.max(5 - toGoal, 0)
            }, () => this.displayMessage('Colonel Cathcart raised the required number of missions by five to ' + this.state.goal)
            )
        }
    }
    
    provideOptions = (...options) => {
        this.setState({options: options})
    }

    clearOptions = () => {
        this.setState({options: []})
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