import React from 'react'
import {Progress, Button} from 'semantic-ui-react'

const StatusBar = ({gameState: {money, goal, flown, sanity, name, activeBtn}, save, blurClass}) => {

    return (
        <div className={`grey-background + ${blurClass()}`}>
            <div className='flex-left-to-right'>
                <div><h3>{name}</h3></div>
                <div><span role='img' aria-label='hospital-icon'>🏥</span> Health <span aria-label='hospital-icon' role='img'>🏥</span></div>
                <div>${money}</div>
                <div>Settings Modal Link Icon</div>
            </div>
                <div>Sanity: <Progress value={sanity} total='100' color='yellow' /></div>
                <div className='flex-left-to-right'>
                    <div style={{width: '90%'}} >✈ Missions Complete: <Progress indicating value={flown} total={goal} progress='ratio' color='red' /></div>
                    {name && activeBtn ? <div><Button color='green' onClick={save}>Save</Button></div> : null}       
                </div>
        </div>
    )
}

export default StatusBar
