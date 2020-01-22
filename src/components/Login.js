import React from 'react'
import {Link} from 'react-router-dom'
import {Button, Container, Input} from 'semantic-ui-react'

export const Login = ({formSubmit}) => {
    return (<div>
        <Container style={{backgroundColor: 'black'}} className='white-text'>
            <form onSubmit={formSubmit} action='/'>
                <div style={{padding: '3px'}}>
                    <label><em>Username</em></label> <Input name="playerName" />
                </div>
                <div style={{padding: '3px'}}>
                    <label><em>Password</em></label> <Input type='password' name='password' />
                </div>
                <div style={{padding: '3px'}}>
                    <Button inverted color='red' type='submit'>Submit</Button>
                    <Link to='/signup'><Button inverted color='red'>Register</Button></Link> 
                </div>
            </form>
            
        </Container>
    </div>)
}

export const Signup = ({formSubmit}) => {
    return (<div>
        <Container style={{backgroundColor: 'black'}} className='white-text'>
            <form onSubmit={formSubmit}>
                <div style={{padding: '3px'}}>
                    <label><em>Username</em></label>
                    <Input name="playerName" />
                </div>
                <div style={{padding: '3px'}}>
                    <label><em>Password</em></label>
                    <Input type='password' name='password' />
                </div>
                <div style={{padding: '3px'}}>
                    <Button inverted color='red' type='submit'>Submit</Button>
                    <Link to='/login'><Button inverted color='red'>Log In</Button></Link> 
                </div>
            </form>
            <div>
            
            </div>
        </Container>
    </div>) 
}

export const Logout = ({formSubmit}) => {
    return (<div>
        <Container style={{backgroundColor: 'black'}} className='white-text'>
            <div style={{padding: '3px'}}>
                <label>Are you Sure You Want to Log Out?</label>
            </div>

            <div style={{padding: '3px'}}>
                <Button inverted color='red' onClick={formSubmit}>Yes</Button> 
                <Link to='/play'>
                    <Button inverted color='red'>Not Yet</Button>
                </Link>
            </div>
        </Container>
    </div>) 
}