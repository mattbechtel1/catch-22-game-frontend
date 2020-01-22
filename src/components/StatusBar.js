import React from 'react'
import {Progress, Button, Modal, Icon} from 'semantic-ui-react'

export default class StatusBar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            settingsActive: false,
        }
    }

    activateSettings = () => {
        this.setState({settingsActive: true})
    }

    deactivateSettings = () => {
        this.setState({settingsActive: false})
    }

    determineColor = () => {
        return this.state.settingsActive ? 'teal' : 'grey'
    }

    
    render() {
        const {gameState: {money, goal, flown, sanity, name, leave, injury, activeBtn, timings, soundOn}, save, blurClass, changeTextSpeed, changeSound} = this.props
        return (
            <div className={`grey-background + ${blurClass()}`}>
            <div className='flex-left-to-right'>
                <div><h3>{name}</h3></div>
                <div><span role='img' aria-label='hospital-icon'>🏥</span> {injury ? injury.toUpperCase() : 'ACTIVE'} <span aria-label='hospital-icon' role='img'>🏥</span></div>
                <div>${money}</div>
                <div>Accumulated Leave: {Math.round(leave * 10)/10} Days</div>
                <div>
                    {name ? 
                    <Modal size='mini'
                        trigger={<Icon name='settings' size='large' color={this.determineColor()} onMouseOver={this.activateSettings}
                        onMouseOut={this.deactivateSettings}/>}>
                        <Modal.Header>Options</Modal.Header>
                        <Modal.Content>
                        <Modal.Description>
                            <form>
                                <div style={{padding: '5px'}}>
                                    <input type='checkbox' 
                                    name='soundOn'
                                    checked={soundOn} 
                                    onChange={changeSound} /> 
                                    <span> Play Sound</span>
                                </div>
                                <div style={{padding: '5px'}}>
                                    <span>Text Speed</span>
                                    <div className="form-check">
                                        <label>
                                            <input
                                            type="radio"
                                            name="timings"
                                            value={4500}
                                            onChange={changeTextSpeed}
                                            checked={timings === 4500} /> Slow
                                        </label>
                                    </div>

                                    <div className="form-check">
                                        <label>
                                            <input
                                            type="radio"
                                            name="timings"
                                            value={3000}
                                            onChange={changeTextSpeed}
                                            checked={timings === 3000} /> Medium
                                        </label>
                                    </div>

                                    <div className="form-check">
                                        <label>
                                            <input
                                            type="radio"
                                            name="timings"
                                            value={1500}
                                            onChange={changeTextSpeed}
                                            checked={timings === 1500} /> Fast
                                        </label>
                                    </div>
                                </div>
                            </form>
                        </Modal.Description>
                        </Modal.Content>
                        </Modal>
                        : null }
                </div>
            </div>
                <div>Sanity: <Progress value={sanity} total='100' color='yellow' /></div>
                <div className='flex-left-to-right'>
                    <div style={{width: '90%'}} >✈ Missions Complete: <Progress indicating value={flown} total={goal} progress='ratio' color='red' /></div>
                    {name ? <div><Button color='green' inverted={activeBtn} onClick={activeBtn ? save : null}>{activeBtn ? 'Save' : 'Saved'}</Button></div> : null}       
                </div>
        </div>
    )
    }
}