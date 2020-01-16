import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import {Button, Segment} from 'semantic-ui-react'

export const Login = ({formSubmit}) => {
    return (<div>
        <Segment inverted>
            <form onSubmit={formSubmit} action='/'>
                <div>
                    <label>Player Name</label>
                    <input type="text" name="playerName" />
                </div>
                <div>
                    <label>Password</label>
                    <input type='password' name='password' />
                </div>
                <div>
                    <Button inverted color='red' type='submit'>Submit</Button> 
                </div>
            </form>
            <Link to='/signup'>
                <Button inverted color='red'>Register</Button>
            </Link>
        </Segment>
    </div>)
}

export const Signup = ({formSubmit}) => {
    return (<div>
        <Segment inverted>
            <form onSubmit={formSubmit}>
                <div>
                    <label>Player Name</label>
                    <input type="text" name="playerName" />
                </div>
                <div>
                    <label>Password</label>
                    <input type='password' name='password' />
                </div>
                <div>
                    <Button inverted color='red' type='submit'>Submit</Button> 
                </div>
            </form>
            <Link to='/login'>
                <Button inverted color='red'>Log In</Button>
            </Link>
        </Segment>
    </div>) 
}