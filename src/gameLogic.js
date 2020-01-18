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