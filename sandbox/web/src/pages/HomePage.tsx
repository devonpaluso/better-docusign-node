import { FC, SyntheticEvent, useEffect, useState } from "react";
import { useAction, useActionCallback, useActionState, useEchoBridge, useOnConnection } from "@echobridge/react";
import { Alert, Avatar, Box, CircularProgress, Divider, IconButton, ListItemIcon, Menu, MenuItem, Paper, Tab, Tabs, Typography } from "@mui/material";
import { Item, items, collections, workflows } from "../modules/items.ts";
import { $fsRead, $getClientInfo } from "@echobridge/core";
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import TerminalIcon from '@mui/icons-material/Terminal';
import LanguageIcon from '@mui/icons-material/Language';
import echobridgeLogo from '../assets/logo.png';
import { Logout, PersonAdd, Settings } from "@mui/icons-material";
import { useOktaAuth } from "@okta/okta-react";
import { SideDrawer } from "../components/SideDrawer.tsx";
import { CollectionItem, Tile, WorkflowItem } from "../components/items.tsx";
import { $expressApiWorkflow, $openVSCode } from "@sandbox/actions";
import { fileExplorer } from "@echobridge/react";
import { echoBridgeWidget } from "@echobridge/react";
import { ThemeToggleButton } from "../components/Theme.tsx";

export const HomePage: FC = () => {

    const [tab, setTab] = useState(0);

    const handleTabChange = (event: SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

    const { bridge, identity, connected, cliConnected } = useEchoBridge();

    const [getClientInfo, clientInfo] = useActionState($getClientInfo);
    const test = useAction($getClientInfo);

    useOnConnection(() => {

        if (!clientInfo) getClientInfo();

    });

    const [drawerOpen, setDrawerOpen] = useState(false);

    const onItemClick = (item: Item) => {
        if (item.name === 'Angular') {
            test();
            // if (!connected || !cliConnected) {
            //     echoBridgeWidget.open();
            // }
            //setDrawerOpen(true);
        }
    }


    const fsRead = useAction($fsRead);

    const onHeaderClick = async () => {
        fileExplorer.launch();
        //echoBridgeWidget.open();

        //const res = await fsRead({ path: '/does-not-exist' });
        //console.log(res);
    }

    const expressApiWorkflow = useAction($expressApiWorkflow);
    const openVSCode = useAction($openVSCode);

    const onWorkflowClick = async (name: string) => {
        if (name === 'Express API') {
            const path = await fileExplorer.launch();
            await expressApiWorkflow({ path: path + '/express-api' });
            await openVSCode({ path: path + '/express-api' });
        }
    }

    return (
        <>
            <div style={{ width: '100%', minHeight: '100%', backgroundColor: '#F5F5F6', paddingBottom: 500 }}>

                <Header />


                <div style={{ paddingLeft: 50, paddingRight: 50, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', }}>
                    <div style={{ width: '100%', maxWidth: 1200, display: 'flex', flexDirection: 'column' }}>

                        <div style={{ height: 30 }} />

                        <div style={{ width: '100%', display: 'none', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Paper style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 250, padding: 16 }}>
                                {identity && <>
                                    {<Alert icon={<LanguageIcon fontSize="inherit" sx={{ mt: 0.2, color: 'black' }} />} severity="success">
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            <Typography style={{ fontWeight: 500, minWidth: 100 }}>Web Connected: {identity.userId}</Typography>
                                        </div>
                                    </Alert>}
                                    <div style={{ marginLeft: 4, marginTop: 4 }}>
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            <Typography style={{ fontWeight: 500, minWidth: 100 }}>Bridge: </Typography>
                                            <Typography style={{ fontFamily: 'monospace', fontSize: 14 }}>{identity?.bridgeId}</Typography>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            <Typography style={{ fontWeight: 500, minWidth: 100 }}>Server: </Typography>
                                            <Typography style={{ fontFamily: 'monospace', fontSize: 14 }}>{bridge?.io?.['uri']}</Typography>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            <Typography style={{ fontWeight: 500, minWidth: 100 }}>Identity: </Typography>
                                            <Typography style={{ fontFamily: 'monospace', fontSize: 14 }}>{identity.userId}</Typography>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            <Typography style={{ fontWeight: 500, minWidth: 100 }}>Status</Typography>
                                            <Typography style={{ fontFamily: 'monospace', fontSize: 14 }}>{connected ? 'connected' : 'disconnected'}</Typography>
                                        </div>
                                    </div>
                                </>}

                                {!identity && <>
                                    {<Alert icon={<HourglassBottomIcon fontSize="inherit" />} severity="info">
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            <Typography style={{ fontWeight: 500, minWidth: 100 }}>Connecting to EchoBridge Server...</Typography>
                                        </div>
                                    </Alert>}
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <CircularProgress size={40} />
                                    </div>
                                </>}
                            </Paper>

                            <div style={{ width: 30 }} />

                            <Paper style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 250, padding: 16 }}>

                                {clientInfo && <>
                                    {<Alert icon={<TerminalIcon fontSize="inherit" sx={{ mt: 0.2, color: 'black' }} />} severity="success">
                                        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            <Typography style={{ fontWeight: 500, minWidth: 100 }}>CLI Connected: {clientInfo?.userInfo?.username || 'unknown'}@{clientInfo?.hostname || 'unknown'}</Typography>
                                        </div>
                                    </Alert>}
                                    <div style={{ marginLeft: 4, marginTop: 4 }}>
                                        {clientInfo?.osName && <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            <Typography style={{ fontWeight: 500, minWidth: 100 }}>OS Name: </Typography>
                                            <Typography style={{ fontFamily: 'monospace', fontSize: 14 }}>{clientInfo?.osName}</Typography>
                                        </div>}
                                        {clientInfo?.type && <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            <Typography style={{ fontWeight: 500, minWidth: 100 }}>Platform: </Typography>
                                            <Typography style={{ fontFamily: 'monospace', fontSize: 14 }}>{clientInfo?.type}</Typography>
                                        </div>}
                                        {clientInfo?.hostname && <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            <Typography style={{ fontWeight: 500, minWidth: 100 }}>Host Name: </Typography>
                                            <Typography style={{ fontFamily: 'monospace', fontSize: 14 }}>{clientInfo?.hostname}</Typography>
                                        </div>}
                                        {clientInfo?.userInfo?.username && <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            <Typography style={{ fontWeight: 500, minWidth: 100 }}>Username: </Typography>
                                            <Typography style={{ fontFamily: 'monospace', fontSize: 14 }}>{clientInfo?.userInfo?.username}</Typography>
                                        </div>}
                                        {clientInfo?.userInfo?.homedir && <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            <Typography style={{ fontWeight: 500, minWidth: 100 }}>Home Dir: </Typography>
                                            <Typography style={{ fontFamily: 'monospace', fontSize: 14 }}>{clientInfo?.homedir}</Typography>
                                        </div>}
                                        {clientInfo?.userInfo?.shell && <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            <Typography style={{ fontWeight: 500, minWidth: 100 }}>Shell: </Typography>
                                            <Typography style={{ fontFamily: 'monospace', fontSize: 14 }}>{clientInfo?.userInfo?.shell}</Typography>
                                        </div>}
                                    </div>
                                </>}

                                {!clientInfo && <>
                                    {<Alert icon={<HourglassBottomIcon fontSize="inherit" />} severity="info">
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            <Typography style={{ fontWeight: 500, minWidth: 100 }}>Waiting for CLI Connection...</Typography>
                                        </div>
                                    </Alert>}
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <CircularProgress size={40} />
                                    </div>
                                </>}

                            </Paper>
                        </div>

                        <div style={{ height: 30 }} />

                        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
                            <Tabs value={tab} onChange={handleTabChange} aria-label=''>
                                <Tab sx={{ width: 150 }} label="Individual" />
                                <Tab sx={{ width: 150 }} label="Collections" />
                                <Tab sx={{ width: 150 }} label="Workflows" />
                                <Tab sx={{ width: 150 }} label="Diagnostics" />
                            </Tabs>
                        </Box>

                        <div style={{ height: 20 }} />

                        {tab === 0 && (
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                                {items.map((item, i) => (
                                    <div key={item.name} style={{ marginRight: 20, marginBottom: 20 }} onClick={() => onItemClick(item)}>
                                        <Tile text={item.name} image={item.image} imageSize={item.imageSize} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {tab === 1 && (
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                {collections.map(collection => (
                                    <CollectionItem key={collection.name} text={collection.name} items={collection.items} />
                                ))}

                            </div>
                        )}

                        {tab === 2 && (
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                                {workflows.map(workflow => (
                                    <div onClick={() => onWorkflowClick(workflow.name)} key={workflow.name} style={{ marginRight: 20, marginBottom: 20 }}>
                                        <WorkflowItem workflow={workflow} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <SideDrawer open={drawerOpen} setOpen={setDrawerOpen} />
        </>

    );
}

export const Header: FC = () => {

    const { identity } = useEchoBridge();

    const { oktaAuth } = useOktaAuth();


    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const logout = () => {
        oktaAuth.signOut();
        handleClose();
    }

    return (
        <div className={'bottom-shadow'} style={{ backgroundColor: '#fff', width: '100%', height: 60, paddingLeft: 12, paddingRight: 12, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <img style={{ width: 200 }} src={echobridgeLogo} alt={''} />
            <div style={{ flex: 1 }} />
            <Box sx={{ m: 1 }}>
                <ThemeToggleButton />
            </Box>
            <Typography sx={{ m: 1, fontSize: 15 }}>{identity?.userId}</Typography>
            <IconButton onClick={handleClick}>
                <Avatar />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&::before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleClose}>
                    <Avatar /> Profile
                </MenuItem>
                <MenuItem onClick={handleClose}>
                    <Avatar /> My account
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleClose}>
                    <ListItemIcon>
                        <PersonAdd fontSize="small" />
                    </ListItemIcon>
                    Add another account
                </MenuItem>
                <MenuItem onClick={handleClose}>
                    <ListItemIcon>
                        <Settings fontSize="small" />
                    </ListItemIcon>
                    Settings
                </MenuItem>
                <MenuItem onClick={logout}>
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>
        </div>
    );
}
