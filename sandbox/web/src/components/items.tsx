import { FC } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { Item, Workflow } from "../modules/items.ts";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export const Tile: FC<{ image: any, imageSize?: number, text: string, animate?: boolean }> = ({ image, imageSize = 80, text, animate = true }) => {
    return (
        <Paper className={animate ? 'hover-anim-y' : ''} style={{ cursor: 'pointer', width: 160, height: 160, paddingBottom: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img style={{ position: 'absolute', width: imageSize, height: imageSize, objectFit: 'contain' }} src={image} alt={''} />
            </div>
            <Typography sx={{ fontWeight: 500, textAlign: 'center' }}>{text}</Typography>
        </Paper>
    );
}

export const CollectionItem: FC<{ text: string, animate?: boolean, items: Item[] }> = ({ text, items, animate = true }) => {
    return (
        <Paper className={animate ? 'hover-anim-x' : ''} style={{ maxWidth: '100%', overflow: 'hidden', cursor: 'pointer', paddingLeft: 12, paddingRight: 12, marginBottom: 20, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ width: 160, height: 50, borderRadius: 3, backgroundColor: '#dbe8ff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 500 }}>{text}</Typography>
            </div>
            <ArrowForwardIosIcon sx={{ opacity: 0.75, ml: 3, mr: -2 }} />

            {items.map(({ name: itemName, image, imageSize = 80 }, i) => (
                <div key={i} style={{ cursor: 'pointer', width: 140, height: 120, paddingBottom: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img style={{ position: 'absolute', width: imageSize * 0.8, height: imageSize * 0.8, objectFit: 'contain' }} src={image} alt={''} />
                    </div>
                    <Typography sx={{ fontWeight: 500, textAlign: 'center' }}>{itemName}</Typography>
                </div>
            ))}
        </Paper>
    );
}

export const WorkflowItem: FC<{ workflow: Workflow, animate?: boolean }> = ({ workflow, animate = true }) => {

    return (
        <Paper className={animate ? 'hover-anim-y' : ''} sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'row', width: 500, height: 200 }}>
            <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', p: 2 }}>
                <Typography component="div" variant="h5">
                    {workflow.name}
                </Typography>
                {workflow.subtitle && <Typography variant="subtitle1" color="text.secondary" component="div">
                    {workflow.subtitle}
                </Typography>}
                <Typography sx={{ mt: 1 }} variant={'body2'}>
                    {workflow.description}
                </Typography>
            </Box>
            <div style={{ position: 'relative', width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img style={{ position: 'absolute', width: workflow.imageSize || 200, height: workflow.imageSize || 200, objectFit: 'contain', ...workflow.imageStyle }} src={workflow.image} alt={''} />
            </div>
        </Paper>
    );

    // return (
    //     <Paper className={animate ? 'hover-anim-y' : ''} style={{ maxWidth: '100%', overflow: 'hidden', cursor: 'pointer', paddingLeft: 12, paddingRight: 12, marginBottom: 20, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
    //         <div style={{ width: 160, height: 50, borderRadius: 3, backgroundColor: '#dbe8ff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
    //             <Typography sx={{ fontWeight: 500 }}>{text}</Typography>
    //         </div>
    //         <ArrowForwardIosIcon sx={{ opacity: 0.75, ml: 3, mr: -2 }} />
    //
    //         {items.map(({ name: itemName, image, imageSize = 80 }, i) => (
    //             <div key={i} style={{ cursor: 'pointer', width: 140, height: 120, paddingBottom: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    //                 <div style={{ position: 'relative', width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    //                     <img style={{ position: 'absolute', width: imageSize * 0.8, height: imageSize * 0.8, objectFit: 'contain' }} src={image} alt={''} />
    //                 </div>
    //                 <Typography sx={{ fontWeight: 500, textAlign: 'center' }}>{itemName}</Typography>
    //             </div>
    //         ))}
    //     </Paper>
    // );
}
