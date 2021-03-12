import React from 'react';
import { IconButton } from '@material-ui/core';
import BookIcon from '@material-ui/icons/Book';
import RulesDialog from './RulesDialog';

const ShowRulesIcon = BookIcon;

function showRules() {
    RulesDialog.openRules();
}

function ShowRulesButton() {
    return <IconButton onClick={showRules}><ShowRulesIcon /></IconButton>;
}

export default {
    ShowRulesIcon,
    ShowRulesButton,
    showRules
};