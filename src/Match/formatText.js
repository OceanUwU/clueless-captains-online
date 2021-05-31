import React from 'react';
import publicDir from '../public.json';
import { Tooltip, Link } from '@material-ui/core';

const typeNames = {
    'cards': 'Card',
    'roles': 'Role',
    'tiles': 'Tile',
};
const types = Object.keys(typeNames);

export default function formatText(text) {
    let words = text.split(' ');
    return (
        <span>{words.map((word, index) => {
            let space = index == 0 ? '' : ' ';
            //if (word.startsWith('#')) {
                let hashtag = word.replace(/\W/g,'').toLowerCase();

                let typeFound = false;
                for (let type of types) {
                    if (publicDir[type].hasOwnProperty(hashtag)) {
                        typeFound = type;
                    }
                }

                if (typeFound)
                    return (<Tooltip enterTouchDelay={0} title={<span>
                        <h4 style={{textAlign: 'center'}}>{typeNames[typeFound]}</h4>
                        <img src={`/${typeFound}/${hashtag}.${publicDir[typeFound][hashtag]}`} width={80} style={{borderRadius:4}} />
                    </span>} PopperProps={{style: {zIndex: 100000}}}>
                        <span>{space}<Link color="secondary">{word}</Link></span>
                    </Tooltip>);
            //}
            return `${space}${word}`;
        })}</span>
    );
}