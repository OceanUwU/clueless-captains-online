import React from 'react';
import './centred.css';
import ClearIcon from '@material-ui/icons/Clear';
import Button from '@material-ui/core/Button';

function ConnectFailed(props) {
    return (
        <div className="centred">
            <ClearIcon />
            <h3>Failed to connect to the Clueless Captains server.</h3>
            {props.error ? <p>Error: "{props.error}"</p> : null}
            <h4>Are you offline? If not, the Clueless Captains server might be down.</h4>
            <Button size="large" color="primary" onClick={() => window.location.reload(false)}>Retry</Button>
        </div>
    );
}

export default ConnectFailed;