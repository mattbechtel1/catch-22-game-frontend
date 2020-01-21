
// gameBegin = () => {
//     this.displayMessages(["Welcome to Pianosa!", 
//         "You are a bombardier in the 256th US Army Air Squadron.", 
//         "Your only goal is to get home alive.", 
//         "Per U.S. Army Air Force policy, you will be welcomed home after you complete 40 missions.", "You have also been informed that people who have been declared insane are grounded in accordance with U.S. Army Air Force policy."])
//     this.playAirRound()
// }

playAirRound = () => {
    const random = Math.random()
    if (this.state.flown < 50) {
        if (random < 0.4) {
            this.displayMessages(["The upcoming mission is a milk run. Would you like to volunteer?"])
            this.provideOptions([{text: 'Volunteer', callResult: this.providePartners}, {text: 'Pass', callResult: null}])
        } else if (random < 0.8) {
            this.displayMessage("Intelligence on the upcoming mission is unclear. It could be dangerous, but there's also a fair possibility you will receive no flak. Would you like to volunteer?")
            this.provideOptions([{text: 'Volunteer', callResult: this.providePartners}, {text: 'Pass', callResult: null}])
        } else {
            this.displayMessage("The upcoming mission will fly into hostile territory and is likely to be dangerous. Would you like to volunteer?")
            this.provideOptions([{text: 'Volunteer', callResult: this.providePartners}, {text: 'Pass', callResult: null}])
        }
    }
}

provideOptions = (options) => {
    this.setState({options: options})
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

