import { FC, useEffect, useRef, useState } from "react";
import Ansi from "ansi-to-react";
import { Paper, TextField } from "@mui/material";
import { useBridgeEvent, useEchoBridge } from "@echobridge/react";

const results = [
    { timestamp: -1, data: '\x1B[2K\x1B[1G\x1B[32mEchoBridge Connected\x1B[39m' }
]

export const Terminal: FC = () => {

    const { bridge, connected, error } = useEchoBridge();

    useEffect(() => {
        console.log({ connected })
    }, [connected]);

    useEffect(() => {
        console.log({ error })
    }, [error]);

    const [output, setOutput] = useState<{ timestamp: number, data: string }[]>(results);

    const outputEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [output.length]);

    useBridgeEvent('cli:terminal:output', (data) => {
        setOutput(output => [...output, data].sort((a, b) => a.timestamp - b.timestamp))
    });

    const [input, setInput] = useState('');
    const submit = () => {
        bridge.emit('web:terminal:input', input);
        output.push({ timestamp: Date.now(), data: input });
        setInput('');
    }

    return (
        <Paper elevation={6} sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', fontSize: 14, borderRadius: 2, p: 2, backgroundColor: 'black', color: 'white' }}>
            <div style={{ flex: 1, overflow: 'scroll' }}>
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', whiteSpace: 'pre-wrap', overflow: 'visible' }}>
                    {output.map((o, i) =>
                        <Ansi key={i}>{o.data}</Ansi>
                    )}
                    <div style={{ height: 1 }} ref={outputEndRef} />
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', paddingTop: 10 }}>
                <code>terminal % </code>
                <TextField
                    autoComplete={'off'}
                    sx={{ ml: 1 }}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submit()}
                    style={{ flex: 1 }}
                    InputProps={{
                        style: {
                            fontFamily: 'monospace',
                            fontSize: 14,
                            color: 'white'
                        }
                    }}
                    variant={'outlined'}
                    size={'small'}
                />
            </div>

        </Paper>
    )
}