import React from 'react'
import {Progress, Button} from 'semantic-ui-react'

const StatusBar = ({gameState: {money, goal, flown, sanity, name}, save}) => 
    <div className='grey-background'>
        <div className='flex-left-to-right'>
            <div><h3>{name}</h3></div>
            <div><span role='img' aria-label='hospital-icon'>🏥</span> Health <span aria-label='hospital-icon' role='img'>🏥</span></div>
            <div>${money}</div>
            <div>Settings Modal Link Icon</div>
        </div>
            <div>✈ Missions Complete: <Progress indicating value={flown} total={goal} progress='ratio' color='red' /></div>
            <div className='flex-left-to-right'>
                <div style={{width: '90%'}}>Sanity: <Progress value={sanity} total='100' color='yellow' /></div>
                <div><Button onClick={save}>Save</Button></div>        
            </div>
    </div>

export default StatusBar
