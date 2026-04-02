import { Affix, Box, Button, Grid, Tooltip } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from '@fortawesome/fontawesome-svg-core'

/* import all the icons in Free Solid, Free Regular, and Brands styles */
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { Tools } from "../../enums";

import './editor.css'

library.add(fas, far, fab)

interface BottomToolbarProps {
    onToolChange?: (tool: Tools) => void;
    selectedTool: Tools;
}

export default function BottomToolbar({ onToolChange, selectedTool }: BottomToolbarProps) {
    return (
        <Affix position={{ bottom: 10, right: 0 }}>
            <Box w="25vw" bg="#1a1f2e">
                <Grid gutter={20} h="100%">
                    <Grid.Col style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}} h={150} span={2.4}>
                        <Box>
                            <Tooltip label="Select" position="top" transitionProps={{transition: 'fade-up', duration: 200}}>
                                <Button className={selectedTool === Tools.SELECT ? 'active' : ''} onClick={() => onToolChange?.(Tools.SELECT)} variant="editor" h={70} w={70} style={{bg: 'white', justifyContent: 'center', alignItems: 'center', fontSize: 25, transition: 'background-color 0.1s'}}   >
                                    <FontAwesomeIcon icon={['fas', 'mouse-pointer']} />
                                </Button>
                            </Tooltip>
                        </Box>
                    </Grid.Col>
                    <Grid.Col style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}} h={150} span={2.4}>
                        <Box>
                            <Tooltip label="Star" position="top" transitionProps={{transition: 'fade-up', duration: 200}}>
                                <Button className={selectedTool === Tools.STAR ? 'active' : ''} onClick={() => onToolChange?.(Tools.STAR)} variant="editor" h={70} w={70} color="gray" style={{justifyContent: 'center', alignItems: 'center', fontSize: 25, transition: 'background-color 0.1s'}}   >
                                    <FontAwesomeIcon icon={['fas', 'star']} />
                                </Button>
                            </Tooltip>
                        </Box>
                    </Grid.Col>
                    <Grid.Col style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}} h={150} span={2.4}>
                        <Box>
                            <Tooltip label="Linking Tool" position="top" transitionProps={{transition: 'fade-up', duration: 200}}>
                                <Button className={selectedTool === Tools.LINK ? 'active' : ''} onClick={() => onToolChange?.(Tools.LINK)} variant="editor" h={70} w={70} color="gray" style={{justifyContent: 'center', alignItems: 'center', fontSize: 25, transition: 'background-color 0.1s'}}>
                                    <FontAwesomeIcon icon={['fas', 'archway']} />
                                </Button>
                            </Tooltip>
                        </Box>
                    </Grid.Col>
                    <Grid.Col style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}} h={150} span={2.4}>
                        <Box>
                            <Tooltip label="Region Tool" position="top" transitionProps={{transition: 'fade-up', duration: 200}}>
                                <Button className={selectedTool === Tools.REGION ? 'active' : ''} onClick={() => onToolChange?.(Tools.REGION)} variant="editor" h={70} w={70} color="gray" style={{justifyContent: 'center', alignItems: 'center', fontSize: 25, transition: 'background-color 0.1s'}}>
                                    <FontAwesomeIcon icon={['fas', 'earth-oceania']} />
                                </Button>
                            </Tooltip>
                        </Box>
                    </Grid.Col>
                    <Grid.Col style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}} h={150} span={2.4}>
                        <Box>
                            <Tooltip label="Eraser" position="top" transitionProps={{transition: 'fade-up', duration: 200}}>
                                <Button className={selectedTool === Tools.ERASER ? 'active' : ''} onClick={() => onToolChange?.(Tools.ERASER)} variant="editor" h={70} w={70} color="gray" style={{justifyContent: 'center', alignItems: 'center', fontSize: 25, transition: 'background-color 0.1s'}}   >
                                    <FontAwesomeIcon icon={['fas', 'eraser']} />
                                </Button>
                            </Tooltip>
                        </Box>
                    </Grid.Col>
                </Grid>
            </Box>
        </Affix>
    )
}