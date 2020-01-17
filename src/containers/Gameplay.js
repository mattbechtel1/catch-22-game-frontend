import React from 'react'
import StatusBar from '../components/StatusBar'
import PartnerList from './PartnerList'

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
            partners: [],
            soundOn: true,
            timings: 'slow',
            defaultColleagues: [],
            activePartner: null
        }
    }

    saveGame = () => {
        const {name, id, dayCount, money, sanity, flown, goal, injury, partners, soundOn, timings} = this.state
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
                partner_ids: partners.map(partner => partner.id).filter(Pid => Pid !== 2)  //filter for testing
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
        .then(({id, name, dayCount, money, sanity, flown, goal, soundOn, timings, partners}) => 
            this.setState({id, name, dayCount, money, sanity, flown, goal, soundOn, timings, partners}, () => console.log('fetch complete')))
    }

    render() {
        return (
            <div>
                <StatusBar gameState={this.state} save={this.saveGame} />
                <div style={{display: 'flex'}}>
                    <div style={{width: '20%', flexDirection: 'column', flex: 1}}>
                        <div style={{flexGrow: 1}}><PartnerList /></div>
                        <div style={{position: 'absolute', bottom: '5px'}}><PartnerList /></div>
                    </div>
                    <div style={{width: '80%'}}>
                        80% width
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
