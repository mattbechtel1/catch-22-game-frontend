import React, {Component} from 'react'
import { Button, Icon, Input } from 'semantic-ui-react'

export default class NewGameForm extends Component {
    constructor() {
        super()
        this.state = {
            playerName: ''
        }
    }

    handleChange = (e) => {
        this.setState({playerName: e.target.value})
    }

    render() {
        return <form onSubmit={this.props.start} className='inner-center'>
            <label><h2>Set Character Name:</h2></label><br />
            <Input focus placeholder='Yossarian' type='text' name='name' value={this.state.playerName} onChange={this.handleChange}/>
            <div>
                <Button type='submit' icon color='blue' labelPosition="right">Start Game<Icon name="right arrow" /></Button>
            </div>
        </form>
    }
}