import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Affix, Box, Button, Grid, Tooltip } from "@mantine/core";
import { Tools } from "../../enums";

import './editor.css'

interface SideToolbarProps {
    selectionTools?: Tools[];
    onToolChange?: (tool: Tools) => void;
}

export default function SideToolbar({ selectionTools, onToolChange }: SideToolbarProps) {
    return (
        <Affix position={{ top: 0,right: 0 }}>
            <Box h="25vh" w="100px" bg="#1a1f2e">
                <Grid columns={1}>
                    <Grid.Col style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}} h={150} span={1}>
                        <Tooltip label="Enable star selection" position="left" transitionProps={{transition: 'fade-left', duration: 200}}>
                        <Button onClick={() => onToolChange?.(Tools.STAR)} className={selectionTools?.includes(Tools.STAR) ? 'active' : ''} variant="editor" h={70} w={70} color="gray" style={{justifyContent: 'center', alignItems: 'center', fontSize: 30, transition: 'background-color 0.1s'}}>
                            <FontAwesomeIcon icon={['fas', 'star']} />
                        </Button>
                        </Tooltip>
                    </Grid.Col>
                </Grid>
                <Grid columns={1}>
                    <Grid.Col style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}} h={150} span={1}>
                        <Tooltip label="Enable link selection" position="left" transitionProps={{transition: 'fade-left', duration: 200}}>
                        <Button onClick={() => onToolChange?.(Tools.LINK)} className={selectionTools?.includes(Tools.LINK) ? 'active' : ''} variant="editor" h={70} w={70} color="gray" style={{justifyContent: 'center', alignItems: 'center', fontSize: 30, transition: 'background-color 0.1s'}}>
                            <FontAwesomeIcon icon={['fas', 'archway']} />
                        </Button>
                        </Tooltip>
                    </Grid.Col>
                </Grid>
            </Box>
        </Affix>
    )
}