import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Affix, Box, Button, Grid, Tooltip } from "@mantine/core";

export default function SideToolbar() {
    return (
        <Affix position={{ top: 0,right: 0 }}>
            <Box h="25vh" w="100px" bg="#1a1f2e">
                <Grid columns={1}>
                    <Grid.Col style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}} h={150} span={1}>
                        <Tooltip label="Enable star selection" position="left" transitionProps={{transition: 'fade-left', duration: 200}}>
                        <Button variant="editor" h={70} w={70} color="gray" style={{justifyContent: 'center', alignItems: 'center', fontSize: 30, transition: 'background-color 0.1s'}}>
                            <FontAwesomeIcon icon={['fas', 'star']} />
                        </Button>
                        </Tooltip>
                    </Grid.Col>
                </Grid>
                <Grid columns={1}>
                    <Grid.Col style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}} h={150} span={1}>
                        <Tooltip label="Enable link selection" position="left" transitionProps={{transition: 'fade-left', duration: 200}}>
                        <Button variant="editor" h={70} w={70} color="gray" style={{justifyContent: 'center', alignItems: 'center', fontSize: 30, transition: 'background-color 0.1s'}}>
                            <FontAwesomeIcon icon={['fas', 'archway']} />
                        </Button>
                        </Tooltip>
                    </Grid.Col>
                </Grid>
            </Box>
        </Affix>
    )
}