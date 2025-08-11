import { FC, useCallback, useEffect, useState } from "react";
import { Header } from "./HomePage.tsx";
import { useOktaAuth } from "@okta/okta-react";
import { Alert, Box, CircularProgress, Collapse, Drawer, Fade, IconButton, ListItem, ListItemIcon, Paper, Tooltip, Typography } from "@mui/material";

import GroupIcon from '@mui/icons-material/Group';
import ListItemButton from "@mui/material/ListItemButton";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import ConstructionIcon from '@mui/icons-material/Construction';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import CheckIcon from '@mui/icons-material/Check';
import handWaveImg from '../assets/images/hand_wave.png';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { angular } from "../modules/items.ts";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import Ansi from "ansi-to-react";
import TerminalIcon from "@mui/icons-material/Terminal";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import { useActionState, useOnConnection } from "@echobridge/react";
import { $getClientInfo } from "@echobridge/core";
import { awsCliInstallLogs, gitInstallLogs, nodePythonInstallLogs, terraformInstallLogs } from "../modules/logs.ts";


const groups = [
    'GROUP_1',
    'GROUP_2',
    'GROUP_3',
    'GROUP_4'
];

const setups = [
    { logs: nodePythonInstallLogs, title: 'General Setup', subtitle: 'Node.js and Python dependencies' },
    { logs: terraformInstallLogs, title: 'Setup 2', subtitle: 'Terraform and Terragrunt install scripts' },
    { logs: awsCliInstallLogs, title: 'AWS Local Setup', subtitle: 'AWS CLI and Auth tools' },
    { logs: gitInstallLogs, title: 'GitHub Developer Setup', subtitle: 'Git and GitHub Desktop' }
]

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const Status: FC<{ logs: string[], onOutput: (o: string) => void, onLogsStart: () => void }> = ({ logs, onOutput, onLogsStart }) => {

    const [state, setState] = useState(0);

    const onClick = () => {
        setState(1);

        onLogsStart();

        const run = async () => {
            for (const log of logs) {
                onOutput(log);
                await sleep(200);
            }

            onOutput('✅ Installation complete');

            setState(2);
        }

        run();

    }

    if (state === 0) return (
        <IconButton color={'success'} edge="end" onClick={onClick}>
            <PlayCircleFilledWhiteIcon fontSize={'medium'} />
        </IconButton>
    )

    if (state === 1) return (
        <IconButton disabled edge="end">
            <CircularProgress size={20} />
        </IconButton>
    )

    if (state === 2) return (
        <IconButton disabled edge="end">
            <CheckIcon fontSize={'medium'} color={'success'} />
        </IconButton>
    )
}

export const OnboardPage: FC = () => {

    const { oktaAuth } = useOktaAuth();

    const [name, setName] = useState();

    useEffect(() => {
        oktaAuth.getUser().then((user: any) => {
            setName(user.firstName || user.given_name);
        });
    }, []);

    const [logsOpen, setLogsOpen] = useState(false);

    const [getClientInfo, clientInfo] = useActionState($getClientInfo);

    useOnConnection(() => {
        getClientInfo();
    });

    const [logs, setLogs] = useState<string[]>([]);

    const onOutput = (output: string) => {
        setLogs(logs => [...logs, output]);
    }

    const onLogsStart = () => {
        setLogsOpen(true);
    }

    return (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#F5F5F6' }}>
            <div style={{ width: '100%' }} onClick={() => setLogsOpen(false)}>
                <Header />
            </div>

            <div style={{ paddingLeft: 50, paddingRight: 50, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Fade in={!!name}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                                <Typography variant="h3" style={{ color: '#4e4e4e' }}>Welcome, {name}!</Typography>
                                <img src={handWaveImg} alt={''} style={{ width: 60, height: 60, marginLeft: 12, objectFit: 'contain' }} />
                            </Box>
                        </Fade>
                        <Typography variant="h5" style={{ color: '#4e4e4e', marginTop: 10 }}>Let's setup your local machine.</Typography>
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', height: 600, marginTop: 40 }}>
                            <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
                                    <Typography style={{ fontSize: 18, color: '#4e4e4e' }}>We found these relevant groups</Typography>
                                    <AutoFixHighIcon style={{ fontSize: 18, marginLeft: 8 }} />
                                </div>
                                <List>
                                    {groups.map((name, i) => (
                                        <ListItemButton key={i} className={'bottom-shadow'} sx={{ m: 1, bgcolor: 'white', borderRadius: 1, overflow: 'hidden', border: '0px solid', borderColor: '#418dff' }}>
                                            <ListItemIcon>
                                                <GroupIcon />
                                            </ListItemIcon>
                                            <ListItemText>
                                                {name}
                                            </ListItemText>
                                        </ListItemButton>
                                    ))}
                                </List>
                            </div>
                            <div style={{ width: 18 }} />
                            <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
                                    <Typography style={{ fontSize: 18, color: '#4e4e4e' }}>Theres are the perfect setup for you</Typography>
                                    <Typography style={{ fontSize: 18, marginLeft: 8 }}>👍</Typography>
                                </div>
                                <List>
                                    {setups.map((setup, i) => (
                                        <ListItem key={i} secondaryAction={<Status logs={setup.logs} onOutput={onOutput} onLogsStart={onLogsStart} />} className={'bottom-shadow'} sx={{ cursor: 'default', m: 1, height: 90, bgcolor: 'white', borderRadius: 1, overflow: 'hidden', border: '0px solid', borderColor: '#418dff' }}>
                                            <ListItemIcon>
                                                <ConstructionIcon />
                                            </ListItemIcon>
                                            <ListItemText primary={setup.title} secondary={setup.subtitle} />
                                        </ListItem>
                                    ))}
                                </List>
                            </div>
                        </div>
                    </div>
                    <Collapse orientation={'horizontal'} in={logsOpen} collapsedSize={0}>
                        <div style={{ width: 350 }} />
                    </Collapse>
                </div>

            </div>
            <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0 }}>
                <Collapse orientation="horizontal" in={logsOpen} collapsedSize={0}>
                    <Paper sx={{ width: 550, height: '100vh', display: 'flex', flexDirection: 'column', padding: 4 }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>

                            {clientInfo && <>
                                {<Alert icon={<TerminalIcon fontSize="inherit" sx={{ color: 'black' }} />} severity="success">
                                    <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                        <Typography style={{ fontWeight: 500, minWidth: 100 }}>CLI Connected: {clientInfo?.userInfo?.username || 'unknown'}@{clientInfo?.hostname || 'unknown'}</Typography>
                                    </div>
                                </Alert>}
                            </>}

                            {!clientInfo && <>
                                <Alert icon={<HourglassBottomIcon fontSize="inherit" />} severity="info">
                                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                        <Typography style={{ fontWeight: 500, minWidth: 100 }}>Waiting for CLI Connection...</Typography>
                                    </div>
                                </Alert>
                            </>}

                        </div>
                        <Paper elevation={6} sx={{ flex: 1, mt: 2, display: 'flex', flexDirection: 'column', width: '100%', fontSize: 14, borderRadius: 1.5, p: 2, backgroundColor: 'black', overflow: 'hidden', color: 'white' }}>
                            <div style={{ flex: 1, overflow: 'scroll', whiteSpace: 'nowrap' }}>
                                {logs.map((l, i) => <div style={{ color: '#43ff4a', fontFamily: 'monospace' }} key={i}>{l}</div>)}
                                <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
                            </div>
                        </Paper>
                    </Paper>
                </Collapse>
            </div>
        </div>
    );
}