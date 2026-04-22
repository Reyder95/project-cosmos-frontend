import { Affix, Box, Button, Grid, Modal, NativeSelect, Text, TextInput, Tooltip } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from '@fortawesome/fontawesome-svg-core'

/* import all the icons in Free Solid, Free Regular, and Brands styles */
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { Tools } from "../../enums";

import classes from './Modal.module.css'

import './editor.css'
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

library.add(fas, far, fab)

interface BottomToolbarProps {
    onToolChange?: (tool: Tools) => void;
    selectedTool: Tools;
    onRegionAdd?: (region: string) => void;
    regionList: string[];
    onRegionChange?: (region: string) => void;
    currentRegion: string | null;
}

export default function BottomToolbar({ onToolChange, selectedTool, onRegionAdd, regionList, onRegionChange, currentRegion }: BottomToolbarProps) {

    const [opened, { open, close }] = useDisclosure(false);
    const [region, setRegion] = useState<string>("");

    const onAddClicked = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (region.trim() === "") return;

        onRegionAdd?.(region);
        setRegion("");

        close();
    }

    return (
        <Affix position={{ bottom: 10, right: 0 }}>
            {
                selectedTool == Tools.REGION && (
                    <Box style={{ padding: 25 }} w="25vw" bg="#1a1f2e">
                        <Grid h="100%">
                            <Grid.Col span={8}>
                                <NativeSelect value={currentRegion != null ? currentRegion : ""} data={regionList} onChange={(e) => onRegionChange?.(e.target.value)} />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <Grid>
                                    <Grid.Col span={6} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <Button onClick={open} variant="editor"><FontAwesomeIcon icon={['fas', 'plus']} /></Button>
                                    </Grid.Col>
                                    <Grid.Col span={6} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <Button variant="editor"><FontAwesomeIcon icon={['fas', 'minus']} /></Button>
                                    </Grid.Col>
                                </Grid>
                            </Grid.Col>
                        </Grid>
                    </Box>
                )
            }
            <Box w="25vw" bg="#1a1f2e">
                <Grid gutter={20} h="100%">
                    <Grid.Col style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} h={150} span={2.4}>
                        <Box>
                            <Tooltip label="Select" position="top" transitionProps={{ transition: 'fade-up', duration: 200 }}>
                                <Button className={selectedTool === Tools.SELECT ? 'active' : ''} onClick={() => onToolChange?.(Tools.SELECT)} variant="editor" h={70} w={70} style={{ bg: 'white', justifyContent: 'center', alignItems: 'center', fontSize: 25, transition: 'background-color 0.1s' }}   >
                                    <FontAwesomeIcon icon={['fas', 'mouse-pointer']} />
                                </Button>
                            </Tooltip>
                        </Box>
                    </Grid.Col>
                    <Grid.Col style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} h={150} span={2.4}>
                        <Box>
                            <Tooltip label="Star" position="top" transitionProps={{ transition: 'fade-up', duration: 200 }}>
                                <Button className={selectedTool === Tools.STAR ? 'active' : ''} onClick={() => onToolChange?.(Tools.STAR)} variant="editor" h={70} w={70} color="gray" style={{ justifyContent: 'center', alignItems: 'center', fontSize: 25, transition: 'background-color 0.1s' }}   >
                                    <FontAwesomeIcon icon={['fas', 'star']} />
                                </Button>
                            </Tooltip>
                        </Box>
                    </Grid.Col>
                    <Grid.Col style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} h={150} span={2.4}>
                        <Box>
                            <Tooltip label="Linking Tool" position="top" transitionProps={{ transition: 'fade-up', duration: 200 }}>
                                <Button className={selectedTool === Tools.LINK ? 'active' : ''} onClick={() => onToolChange?.(Tools.LINK)} variant="editor" h={70} w={70} color="gray" style={{ justifyContent: 'center', alignItems: 'center', fontSize: 25, transition: 'background-color 0.1s' }}>
                                    <FontAwesomeIcon icon={['fas', 'archway']} />
                                </Button>
                            </Tooltip>
                        </Box>
                    </Grid.Col>
                    <Grid.Col style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} h={150} span={2.4}>
                        <Box>
                            <Tooltip label="Region Tool" position="top" transitionProps={{ transition: 'fade-up', duration: 200 }}>
                                <Button className={selectedTool === Tools.REGION ? 'active' : ''} onClick={() => onToolChange?.(Tools.REGION)} variant="editor" h={70} w={70} color="gray" style={{ justifyContent: 'center', alignItems: 'center', fontSize: 25, transition: 'background-color 0.1s' }}>
                                    <FontAwesomeIcon icon={['fas', 'earth-oceania']} />
                                </Button>
                            </Tooltip>
                        </Box>
                    </Grid.Col>
                    <Grid.Col style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} h={150} span={2.4}>
                        <Box>
                            <Tooltip label="Eraser" position="top" transitionProps={{ transition: 'fade-up', duration: 200 }}>
                                <Button className={selectedTool === Tools.ERASER ? 'active' : ''} onClick={() => onToolChange?.(Tools.ERASER)} variant="editor" h={70} w={70} color="gray" style={{ justifyContent: 'center', alignItems: 'center', fontSize: 25, transition: 'background-color 0.1s' }}   >
                                    <FontAwesomeIcon icon={['fas', 'eraser']} />
                                </Button>
                            </Tooltip>
                        </Box>
                    </Grid.Col>
                </Grid>
            </Box>

            <Modal styles={{
                content: {
                    backgroundColor: "#1a1f2e"
                },
                header: {
                    backgroundColor: "#1a1f2e"
                },
            }} classNames={{ close: classes.close }} opened={opened} onClose={close} title={<Text c="white" fw={700}>Region Settings</Text>}>
                <Box>
                    <Grid>
                        <Grid.Col span={6}>
                            <Text c="white">Region Name</Text>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput fw={500} value={region} onChange={(e) => setRegion(e.target.value)} />
                        </Grid.Col>
                    </Grid>

                    <Button onClick={(e) => onAddClicked(e)} style={{ float: "right", marginTop: 20, marginBottom: 20 }} variant="editor">Add</Button>
                </Box>
            </Modal>
        </Affix>
    )
}