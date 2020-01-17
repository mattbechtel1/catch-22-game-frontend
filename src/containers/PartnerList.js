import React from 'react'
import {List} from 'semantic-ui-react'
import Partner from '../components/Partner'

const PartnerList = ({people}) => {
    return <div>
        <List style={{textAlign: 'left', paddingTop: '10px', paddingLeft: '15px'}}>
            {people.map(character => <Partner character={character} />)}
        </List>
    </div>
}

export default PartnerList