import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import sections from './sections';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    {children}
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
    },
    tabs: {
        minWidth: 90,
        width: 90,
        borderRight: `1px solid ${theme.palette.divider}`,
    },
    tab: {
        minWidth: 'unset',
    },
    tabPanel: {
        overflowY: 'scroll',
    },
}));

function DialogCentre() {
    const classes = useStyles();
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <div className={classes.root}>
            <Tabs
                orientation="vertical"
                variant="scrollable"
                value={value}
                onChange={handleChange}
                aria-label="Vertical tabs example"
                classes={{
                    root: classes.tabs,
                }}
            >
                <Tab className={classes.tab} label="Premise" />
                <Tab className={classes.tab} label="Roles" />
                <Tab className={classes.tab} label="Allied Traitor" />
                <Tab className={classes.tab} label="Tiles" />
                <Tab className={classes.tab} label="Turn" />
                <Tab className={classes.tab} label="Cards" />
                <Tab className={classes.tab} label="Special cases" />
            </Tabs>
            <TabPanel classes={classes.tabPanel} value={value} index={0}>
                <sections.Premise />
            </TabPanel>
            <TabPanel classes={classes.tabPanel} value={value} index={1}>
                <sections.Roles />
            </TabPanel>
            <TabPanel classes={classes.tabPanel} value={value} index={2}>
                <sections.Mode2 />
            </TabPanel>
            <TabPanel classes={classes.tabPanel} value={value} index={3}>
                <sections.Tiles />
            </TabPanel>
            <TabPanel classes={classes.tabPanel} value={value} index={4}>
                <sections.Turn />
            </TabPanel>
            <TabPanel classes={classes.tabPanel} value={value} index={5}>
                <sections.Cards />
            </TabPanel>
            <TabPanel classes={classes.tabPanel} value={value} index={6}>
                <sections.SpecialCases />
            </TabPanel>
        </div>
    );
};

export default DialogCentre;