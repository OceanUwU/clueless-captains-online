import React from 'react';
import './centred.css';
import CircularProgress from '@material-ui/core/CircularProgress';

function Connecting() {
    return (
        <div className="centred">
            <CircularProgress />
            <h3>Attempting to connect to the Clueless Captains server...</h3>
        </div>
    );
}

export default Connecting;