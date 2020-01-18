import React from 'react'
import {List} from 'semantic-ui-react'
import Partner from '../components/Partner'

const PartnerList = ({people, clickHandler}) => {
    return <div>
        <List style={{textAlign: 'left', paddingTop: '10px', paddingLeft: '15px'}}>
            {people.map(character => <Partner clickHandler={(character) => clickHandler(character)}character={character} key={character.id}/>)}
        </List>
    </div>
}

export default PartnerList