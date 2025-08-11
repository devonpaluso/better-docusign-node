import { angular } from "../modules/items.ts";
import { FC, useState } from "react";
import { Box, CircularProgress, Drawer, IconButton, Paper, TextField, Tooltip, Typography } from "@mui/material";
import Ansi from "ansi-to-react";
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { useActionCallback } from "@echobridge/react";
import { $installAngular } from "@sandbox/actions";

export const SideDrawer: FC<{ open: boolean, setOpen: (state: boolean) => void }> = ({ open, setOpen }) => {

    const [running, setRunning] = useState(false);
    const [output, setOutput] = useState('');
    const [installAngular] = useActionCallback($installAngular, (response) => {
        setOutput(response);
        setRunning(false);
    });

    const run = () => {
        if (running) return;
        setOutput('');
        setRunning(true);
        installAngular();
    }

    return (
        <Drawer open={open} anchor={'right'} onClose={() => setOpen(false)}>
            <Box sx={{ width: 900, display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '90vw', padding: 4 }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <Paper style={{ cursor: 'default', width: 160, height: 160, paddingBottom: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img style={{ position: 'absolute', width: angular.imageSize || 80, height: angular.imageSize || 80, objectFit: 'contain' }} src={angular.image} alt={''} />
                        </div>
                        <Typography sx={{ fontWeight: 500, textAlign: 'center' }}>{angular.name}</Typography>
                    </Paper>
                    <Typography style={{ marginLeft: 20, width: 250 }}>
                        {angular.description}
                    </Typography>
                    <Tooltip title={'Execute'}>
                        <IconButton disabled={running} sx={{ color: 'green' }} size={'small'} onClick={() => run()}>
                            <PlayCircleOutlineIcon style={{ fontSize: 40, color: 'inherit' }} />
                        </IconButton>
                    </Tooltip>

                </div>
                <Paper elevation={6} sx={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', height: '100%', fontSize: 14, borderRadius: 2, p: 2, backgroundColor: 'black', color: 'white' }}>
                    <div style={{ flex: 1, overflow: 'scroll' }}>
                        {running && <CircularProgress sx={{ m: 1 }} size={30} />}
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', whiteSpace: 'pre-wrap', overflow: 'visible' }}>
                            <Ansi>{output}</Ansi>
                        </div>
                    </div>
                </Paper>

            </Box>
        </Drawer>
    );

}