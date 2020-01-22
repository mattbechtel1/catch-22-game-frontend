import React from 'react'
import StatusBar from '../components/StatusBar'
import PartnerList from './PartnerList'
import NewGameForm from '../components/NewGameForm'
import PartnerCard from '../components/PartnerCard'
import OptionList from '../components/OptionList'
import Message from '../components/Message'
import swal from 'sweetalert';
import {Loader} from 'semantic-ui-react'

export default class GamePlay extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            gameId: 0,
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
            daysWithoutGift: 0,
            soundOn: true,
            timings: 4500,
            activeBtn: false,
            activePartner: null,
            message: '',
            options: [],
            loading: true
        }
    }

    convertDataToState = ({id: gameId, name, dayCount, passCount, leave, money, sanity, flown, goal, soundOn, timings, characters}) => {
            this.setState({gameId, name, dayCount, passCount, leave, money, sanity, flown, goal, soundOn, timings, 
                characters: {
                    living: characters.filter(character => character.sublist === 'airman'),
                    specialActive: characters.filter(character => character.sublist === 'special'),
                    storage: characters.filter(character => character.sublist === 'storage')
                }
             })   
    }

    componentDidMount() {
        let gameId = this.props.activeGame
        // opens saved game on load
        if (gameId) {
            fetch(`http://localhost:3022/games/${gameId}`)
            .then(response => response.json())
            .then(data => this.convertDataToState(data))
            .then(() => {
                this.setState({loading: false})
                this.nextDayRandomizer()
            })
        } else {
            this.setState({loading: false})
        }
    }

    injuryOptions = ["liver disease", "food poisoning", "a broken finger", "a leg wound", "a scrotal injury", "torn pants", "bruised ego", "athlete's foot", "mistaken identity"]

    newGame = (e) => {
        e.preventDefault()
        if (!!e.target.name.value) {
            this.setState({loading: true})
            fetch('http://localhost:3022/games', {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: e.target.name.value,
                    user_id: this.props.userId
                })
            })
            .then(response => response.json())
            .then((data) => { 
                this.convertDataToState(data)
                this.setState({loading: false})
                this.gameBegin()
            })
        } else {
            swal('You must supply a name to begin a game.')
        }
    }

    saveGame = () => {
        const {name, gameId, dayCount, money, sanity, flown, leave, passCount, goal, injury, characters, soundOn, timings} = this.state
        
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

        fetch('http://localhost:3022/games/' + gameId, {
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

    changeSound = () => {
        this.setState({
            soundOn: !this.state.soundOn,
            activeBtn: true
        })
    }

    changeTimings = (e) => {
        this.setState({
            timings: parseInt(e.target.value, 10),
            activeBtn: true
        })
    }

    displayMessages = async (...messages) => {
        let delay = () => {
            return new Promise(resolve => setTimeout(() => resolve(), this.state.timings))
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
            "Per U.S. Army Air Force policy, you can go home after you complete 40 missions.", 
            "You also know that people who have been medically determined to be insane are grounded.",
            "It is up to you to determine which route will allow you to escape this war.")
            .then(this.playAirRound)
    }

    playAirRound = async () => {

        const passedMsg = "You have passed on too many consecutive missions and are required to participate in this one."
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
        // clones living characters array to preserve alphabetical order of list held in state
        let characters = [...this.state.characters.living]

        let volunteers = characters.sort(() => 0.5 - Math.random()).slice(0,5)
        this.displayMessages("The following men are assigned to this mission. Whom would you like to fly with?")
        this.provideOptions(...volunteers.map(char => {
            return {text: char.name, callResult: (() => this.partnerUp(char.id, volunteers, runType))}
        }))
    }

    partnerUp = async (charId, volunteers, runType) => {
        this.clearOptions()
        const todaysPartner = this.state.characters.living.find(char => char.id === charId)
        let adjustedVolunteers
        if (todaysPartner.name !== 'Recruit') { 
            adjustedVolunteers = volunteers.filter(volunteer => volunteer !== todaysPartner)
        } else {
            volunteers.splice(volunteers.findIndex(char => char.name === 'Recruit'), 1)
            adjustedVolunteers = volunteers
        }
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
        let injured = false
        let dead = false
        
        if ((runType === 'easy' && enemyRandomizer < 0.05) || (runType === 'medium' && enemyRandomizer < 0.6) || (runType === 'hard' && enemyRandomizer < 0.95)) {
            messages.push("Your squadron has been fired upon by German anti-aircraft weapons.")
            if (yourHits > 0) { messages.push("You caught some flak during your mission!") }
            while (yourHits > 0) {
                
                let hitPunisher = Math.random()

                if (hitPunisher < 0.05) {
                    messages.push(`Your plane was shot down. You and ${todaysPartner.name} perished.`)
                    await this.displayMessages(...messages)
                    dead = true
                    yourHits = 0
                } else if (hitPunisher < 0.15) {
                    messages.push("You were injured during the barrage.", "Upon returning to base, you went straight to the hospital.")
                    injured = true
                    yourHits = 0
                } else if (hitPunisher < 0.25) {
                    messages.push(`${todaysPartner.name} was mortally injured during the barrage of anti-aircraft fire.`)
                    this.setState({
                        sanity: this.state.sanity - 10,
                        characters: {
                            ...this.state.characters,
                            living: this.state.characters.living.filter(char => char !== todaysPartner)
                        }
                    })
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
                    messages.push(`${pairingA[0].name} and ${pairingA[1].name} were shot down during the mission. They are presumed dead.`)
                    
                    if (pairingA[0].name === 'Orr' || pairingA[1].name === 'Orr') {
                        this.setState({characters: {
                            ...this.state.characters,
                            storage: [...this.state.characters, pairingA[0], pairingA[0]]
                        }})
                    }
                    
                    this.setState({characters: {
                        ...this.state.characters,
                        living: this.state.characters.living.filter(char => char !== pairingA[0] && char !== pairingA[1])
                    }})
                    
                    pairingAHits = 0
                } else if (hitPunisher < 0.15) {
                    messages.push(pairingA[0].name + " was mortally injured during the barrage.")
                    this.setState({characters: {
                        ...this.state.characters,
                        living: this.state.characters.living.filter(char => char !== pairingA[0])
                        // add logic for return of character
                    }})
                    pairingAHits = 0
                } else if (hitPunisher < 0.25) {
                    messages.push(pairingA[1].name + " was mortally injured during the barrage.")
                    this.setState({characters: {
                        ...this.state.characters,
                        living: this.state.characters.living.filter(char => char !== pairingA[1])
                        // add logic for return of character
                    }})
                    pairingAHits = 0
                } else {
                    pairingAHits -= 1
                }
            }

            while (pairingBHits > 0) {
                let hitPunisher = Math.random()

                if (hitPunisher < 0.05) {
                    messages.push(`${pairingB[0].name} and ${pairingB[1].name} were shot down during the mission. They are believed to be dead.`)

                    if (pairingB[0].name === 'Orr' || pairingB[1].name === 'Orr') {
                        this.setState({characters: {
                            ...this.state.characters,
                            storage: [...this.state.characters, pairingA[0], pairingA[0]]
                        }})
                    }

                    this.setState({characters: {
                        ...this.state.characters,
                        living: this.state.characters.living.filter(char => char !== pairingB[0] && char !== pairingB[1])
                    }})
                    
                    pairingBHits = 0
                } else if (hitPunisher < 0.15) {
                    messages.push(pairingB[0].name + " was a casualty of the attack.")
                    this.setState({characters: {
                        ...this.state.characters,
                        living: this.state.characters.living.filter(char => char !== pairingB[0])
                        // add logic for return of character
                    }})
                    pairingBHits = 0
                } else if (hitPunisher < 0.25) {
                    messages.push(pairingB[1].name + " was a casualty of the attack.")
                    this.setState({characters: {
                        ...this.state.characters,
                        living: this.state.characters.living.filter(char => char !== pairingB[1])
                        // add logic for return of character
                    }})
                    pairingBHits = 0
                } else {
                    pairingBHits -= 1
                }
            }
        } else {
            messages.push("It was an uneventful mission.")
            
            this.setState((state) => ({
                sanity: state.sanity + 1,
            }))
        }

        
        if (dead) {
            this.deathScreen()
            
        } else {
            
            await this.displayMessages(...messages)
            if (injured) {
                this.setState({
                    flown: this.state.flown + 1,
                    dayCount: this.state.dayCount + 1,
                    sanity: this.state.sanity - 5,
                    activeBtn: true,
                    passCount: 0
                }, () => {if (this.dayCount % 7 === 0) {this.setState({money: this.state.money + 15})}})
                this.injury()

            } else {        
                this.setState((state) => ({
                    flown: state.flown + 1,
                    dayCount: state.dayCount + 1,
                    sanity: state.sanity + todaysPartner.sanityChange,
                    activeBtn: true,
                    passCount: 0
                }))
                this.postTurnChecks()
            }
        }
    }

    deathScreen = async () => {
        await this.displayMessages("Game Over!")
        this.setState({
            gameId: 0,
            activeBtn: false
        })
    }

    payday = async () => {
        this.setState({
            money: this.state.money + 15,
            leave: this.state.leave + 0.6,
            activeBtn: true
            })
        await this.displayMessages('Payday! It should be easier to take advantage of that wartime Italian inflation!')
        return
    }

    injury = async (injury) => {
        let randoInj
        if (!injury) {randoInj = this.injuryOptions[Math.floor(Math.random() * 8)]} 
        else {randoInj = injury}

        const daysInHospital = Math.floor(Math.random() * 20) + 1
        const weeksInHospital = daysInHospital > 14 ? 2 : (daysInHospital > 7 ? 2 : 0)
        const sanityChange = this.state.sanity > 50 ? -daysInHospital : daysInHospital
        
        this.setState({
            injury: randoInj,
            money: this.state.money + (15 * weeksInHospital),
            leave: this.state.leave + (0.6 * weeksInHospital),
            sanity: this.state.sanity + sanityChange,
            activeBtn: true
        })
        
        
        await this.displayMessages(`You have been diagnosed with ${randoInj}`, `You spent ${daysInHospital} days in the army hospital.`)

        let duckett = Math.random() < daysInHospital * 0.01 
        if (duckett && this.state.characters.storage.find(char => char.name === "Nurse Duckett")) {
            this.setState({
                characters: {
                    ...this.state.characters,
                    specialActive: [...this.state.characters.specialActive, this.state.characters.storage.find(char => char.name === 'Nurse Duckett')],
                    storage: this.state.characters.storage.filter(char => char.name !== 'Nurse Duckett')
                }
            })
            await this.displayMessages(`You started dating a nurse you met in the hospital.`)
        }

        await this.displayMessages(`After ${daysInHospital} days, you are fully recovered and are back on active duty.`)
        this.setState({injury: '', dayCount: this.state.dayCount + daysInHospital, activeBtn: true})

        this.postTurnChecks()
    }

    datingDuckett = () => {
        return !!this.state.characters.specialActive.find(char => char.name === 'Nurse Duckett')
    }
    
    postTurnChecks = async () => {
        let toGoal = this.state.goal - this.state.flown
        // checks whether the missions goal should be raised
        if (Math.random() < 1/(toGoal**1.5) - (0.1/(toGoal + 0.0000001))) {await this.cathcart(toGoal)}

        // checks whether it is payday
        if (this.state.dayCount % 7 === 0) {await this.payday()}

        // checks whether there are enough co-pilots available
        if (this.state.characters.living.length <= 6) {
            let newRecruits = []
            let total = this.state.characters.living.length
            
            while (total <= 6) {
                newRecruits.push(this.state.characters.storage.find(char => char.name === "Recruit"))
                total++
            }

            this.setState({characters: {
                ...this.state.characters,
                living: [...this.state.characters.living, ...newRecruits]
                }
            })
        }

        // checks whether you are dating Duckett
        if (this.datingDuckett() && this.state.daysWithoutGift <= 20) {
            this.setState({daysWithoutGift: this.state.daysWithoutGift + 1})
        } else if (this.datingDuckett() && this.state.daysWithoutGift > 20) {
            await this.loseGirlfriend()
        }

        // checks whether Nately's Whore is after you
        if (this.state.characters.specialActive.find(char => char.name === `Nately's Whore`)) {
            let attack = Math.random()
            if (attack < 0.02) {
                await this.displayMessages("Out of nowhere, Nately's girlfriend attacked you.", "You managed to dodge her attack.")
            } else if (attack < 0.04) {
                await this.displayMessages("Out or nowhere, Nately's girlfriend attacked you.", "She caught you with her knife.")
                this.injury('a knife wound')
            }
        }

        // checks for min and max sanity
        if (this.state.sanity < 0) {this.setState({sanity: 0})
        } else if (this.state.sanity > 100) {this.setState({sanity: 100})}
        
        this.nextDayRandomizer()
    }
    
    nextDayRandomizer = async () => {
        let nextDayRandomizer = Math.random()
        
        if (nextDayRandomizer < 0.5) {
            await this.displayMessages('There is a mission scheduled for today.')
            this.playAirRound()
        } else if (nextDayRandomizer < 0.95) {
            this.offDayOptions()
        } else {
            this.bookEvent()
        }
    }

    loseGirlfriend = async () => {
        await this.displayMessages('Nurse Duckett decided she wanted to marry a doctor and being seen with you would jeopardize her chances at finding a husband.')
        this.setState({
            characters: {
                    ...this.state.characters,
                    specialActive: this.state.characters.specialActive.filter(char => char.name !== 'Nurse Duckett')
            },
            activeBtn: true
        })
    }
    
    offDayOptions = async () => {
        this.clearOptions()
        await this.displayMessages('There are no missions scheduled for today.', 'What would you like to do on your day off?')
        let options = [{text: 'Hang Out. Do Nothing', callResult: this.moveToNextDay}]
        
        if (this.state.money >= 10) {
            options.push({text: 'Ask Milo to prepare you a meal. ~$10', callResult: this.milo})
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

        if (this.datingDuckett()) {
            options.push({text: 'Spend quality time with Nurse Duckett.', callResult: this.getItOn})
        }
        
        this.provideOptions(...options)
    }

    getItOn = async () => { 
        this.clearOptions()
        await this.displayMessages("You had a wonderful day with Nurse Duckett.", "But we're not going to go into any detail.")
        this.setState({
            sanity: this.state.sanity + 3,
            daysWithoutGift: this.state.daysWithoutGift - 1 < 0 ? 0 : this.state.daysWithoutGift - 1,
            activeBtn: true
        }, this.postTurnChecks)
    }

    mmmm = async () => {
        this.clearOptions()
        await this.displayMessages("You went to see Major Major Major Major. He's in his office.", "Major Major Major Major's secretary informs you that the Major only sees people when he is not in his office.", "Would you like to wait?")
        this.provideOptions(
            {text: "Yes, I'll wait", callResult: this.mmmmParadox}, 
            {text: "No, that sounds paradoxical. I'll just take the day off.", callResult: this.moveToNextDay})
    }

    mmmmParadox = async () => {
        this.clearOptions()
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
            await this.displayMessages("You enjoyed a meal of imported pork chops from the highlands of Scotland.", "You're not sure how, but you made money on the transaction.")
        } else {
            await this.displayMessages("You enjoyed a delicious Polish sausage that Milo somehow procured from behind enemy lines.")
        }
    
        this.setState({
            money: this.state.money + miloRando,
            dayCount: this.state.dayCount + 1,
            activeBtn: true,
            sanity: miloRando < 0 ? this.state.sanity - 1 : this.state.sanity
        }, this.postTurnChecks)
    }
    
    visitRome = async () => { 
        this.clearOptions()
        this.setState({money: this.state.money -50})
        if (this.datingDuckett() && this.state.money >= 12) {
            await this.displayMessages("Would you like to buy Nurse Duckett a gift while in Rome?")
            this.provideOptions({text: 'Yes $12', callResult: this.buyGift}, {text: "No, I'll pass.", callResult: this.noGift})
        } else if (!this.state.characters.living.find(char => char.name === 'Nately') && !this.state.characters.specialActive.find(char => char.name === `Nately's Whore`)) {
            await this.displayMessages("You took the time to tell Nately's prostitute girlfriend that he was killed on mission.", "She took the news very hard and is distraught.", "She wants to kill you, now.", "You escaped her wrath... for now.")
            this.setState({
                characters: {
                    ...this.state.characters,
                    specialActive: [...this.state.characters.specialActive, this.state.characters.storage.find(char => char.name === `Nately's Whore`)]
                }
            })
            this.romeBenefits()
        } else {
            await this.displayMessages('Your time in Rome was a refreshing experience.')
            this.romeBenefits()
        }
    }

    romeBenefits = () => {
        this.setState({
            sanity: this.state.sanity + 4,
            dayCount: this.state.dayCount + 3,
            leave: this.state.leave - 3,
            activeBtn: true
        }, () => { 
            if (this.state.dayCount % 7 === 1 || this.state.dayCount % 7 === 2) {
                this.payday()
            }
            this.postTurnChecks()
        })
    }
        
    buyGift = () => {
        this.setState({
            daysWithoutGift: 0,
            money: this.state.money - 12
        }, this.romeBenefits())
    }

    noGift = () => {
        this.setState({
            daysWithoutGift: this.state.daysWithoutGift + 2
        }, this.romeBenefits())
    }
    
    catch22 = async () => {
        this.clearOptions()
        await this.displayMessages('You asked Doc Daneeka to ground you due to insanity.', "Since concern for one's safety in the face of dangers that are real and immediate is the process of a rational mind,", 'you have been declared sane.')
        this.setState((state) => ({
            sanity: 40,
            dayCount: state.dayCount + 1,
            activeBtn: true
        }), this.postTurnChecks)
    }
    
    moveToNextDay = async () => {
        this.clearOptions()
        await this.displayMessages('You enjoyed your day off immensely.')
        this.setState((state) => ({
            dayCount: state.dayCount + 1,
            sanity: state.sanity + 1,
            activeBtn: true
        }), this.postTurnChecks)
    }
    
    bookEvent = async () => {

        if (this.state.characters.living.find(char => char.name === "Major Major")) {
            this.setState({
                characters: {
                    living: this.state.characters.living.filter(char => char.name !== "Major Major"),
                    specialActive: [...this.state.characters.specialActive, this.state.characters.storage.find(char => char.name === "Major Major Major Major")],
                    storage: this.state.characters.storage.filter(char => char.name !== "Major Major Major Major")
                }
            })
           
            await (this.displayMessages("Due to a computer error, Major M. Major has been promoted to Major.", "You may now refer to him as Major Major Major Major."))
        } else if (!this.state.miloTrip && this.state.leave >= 7) {
            await this.displayMessages(`Milo invited you ${this.state.characters.living.find(char => char.name === 'Orr' ? 'and Orr ' : '')}on a trip to Sicily to help him procure foodstuffs`, 'First, you made a pitstop in Palmero', 'It turns out Milo is the mayor of Palmero.', "You then travelled all over the Mediterranean, trading commodities in search of profit.", `You ${this.state.characters.living.find(char => char.name === 'Orr' ? 'and Orr ' : '')}got no sleep.`, "It was not a very relaxing time off.") //add more
            this.setState({
                miloTrip: true,
                dayCount: this.state.dayCount + 7,
                money: this.state.money + 15,
                daysWithoutGift: this.state.daysWithoutGift + 7, 
                sanity: this.state.sanity - 15,
                leave: this.state.leave - 7
            })
        } else if (this.state.characters.living.find(char => char.name === 'McWatt')) {
            await this.displayMessages('During a day off, McWatt playfully buzzes the beach while pilots and soliders enjoy a warm summer day.', "Flying too close the surface, McWatt's propellor slices a young pilot in half.", 'Immediately realizing the result of his action, McWatt flies his plane into the side of a mountain.', `Colonel Cathcart is so upset, he has raised the number of missions to ${this.state.goal + 5}.`)
            this.setState({
                sanity: this.state.sanity - 7,
                goal: this.state.goal + 5,
                characters: {
                    ...this.state.characters,
                    living: this.state.characters.living.filter(char => char.name !== 'McWatt'),
                }
            })
        } else if (this.state.characters.storage.find(char => char.name === "Orr")) {
            await this.displayMessages('You heard a rumor that Orr survived his crash landing and sailed to freedom in Sweden.', 'You pondered whether you should go AWOL.')
            this.setState({
                sanity: this.state.sanity + 3,
                characters: {
                    ...this.state.characters,
                    living: this.state.characters.storage.filter(char => char.name !== 'Orr')
                }
            })
        } else {
            await this.displayMessages('You had a quiet day.')
        }

        this.setState((state) => ({
            dayCount: state.dayCount + 1,
            activeBtn: true
        }), this.postTurnChecks)
    }
    
    cathcart = async (toGoal) => {
        let messages = []
        if (!toGoal) {messages.push("Just as your paperwork was being filed, Colonel Cathcart raised the number of missions.")}

        if (Math.random() < 0.2) {
            let newGoal = this.state.goal + 10
            messages.push('Just as you approached your goal, Colonel Cathcart raised the required number of missions by TEN to ' + newGoal + '!')
            this.setState({
                goal: newGoal,
                sanity: this.state.sanity - Math.max(10 - toGoal, 1)
            })
            await this.displayMessages(...messages)
        } else {
            let newGoal = this.state.goal + 5
            this.setState({
                goal: newGoal,
                sanity: this.state.sanity - Math.max(5 - toGoal, 0)
            })
            await this.displayMessages(...messages, 'Just as you approached your goal, Colonel Cathcart raised the required number of missions by five to ' + newGoal + '.')
        }
    }
    
    provideOptions = (...options) => {
        this.setState({options: options})
    }

    clearOptions = () => {
        this.setState({options: []})
    }

    debug = () => {
        var debugOpt = prompt('Debug Menu')
        if (!!debugOpt) {
            this.setState({
                [debugOpt.split(' ')[0]]: parseInt(debugOpt.split(' ')[1], 10)
            })
        }
    }

    render() {
        return (
            <div>
                <StatusBar gameState={this.state} save={this.saveGame} blurClass={this.determineBlur} changeSound={this.changeSound} changeTextSpeed={this.changeTimings} />
                { this.state.loading ?
                <div style={{margin: '50px'}}><Loader active inline='centered' /></div> 
                :
                <div className='extend-to-fill-height gridlines' style={{display: 'flex'}}>
                    <div className={this.determineBlur()} style={{width: '20%', flexDirection: 'column', flex: 1}}>
                        <div><PartnerList clickHandler={this.showCharacterCard} people={this.state.characters.living}/></div>
                        <div style={{position: 'relative', bottom: '5px', paddingTop: '25px'}}><PartnerList clickHandler={this.showCharacterCard} people={this.state.characters.specialActive} /></div>
                    </div>
                    <div className='gridlines full-center black-bg' style={{width: '80%'}}>
                        {this.state.activePartner ? 
                            <PartnerCard unmount={this.deactivateCharacterCard} character={this.state.activePartner} /> 
                            :
                            this.state.gameId ? 
                                <div className='inner-center-tall'>
                                    <Message text={this.state.message} />< br/>
                                    <OptionList options={this.state.options} />
                                </div> : 
                                <NewGameForm start={this.newGame}/>
                        }
                        <div className='corner' onClick={this.debug}></div>
                    </div>
                </div>
                }
            </div>
        )           
    }
}