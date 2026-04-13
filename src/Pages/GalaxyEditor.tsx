import { Arc, Circle, Layer, Line, Stage, Text } from "react-konva";
import type { StarGate, StarSystem, Point } from '../interfaces';
import { Tools } from '../enums';
import React, { use, useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import BottomToolbar from "../components/GalaxyEditor/BottomToolbar";
import SideToolbar from "../components/GalaxyEditor/SideToolbar";

// const systemList: StarSystem[] = [{
//     id: 1,
//     system_identifier: 'solar',
//     system_name: 'Solar System',
//     position: { x: 200, y: 300 },
//     gates: [{
//         position: { x: 200, y: 200 },
//         system_identifier: 'alpha_centauri'
//     }]
// }, 
// {
//     id: 2,
//     system_identifier: 'alpha_centauri',
//     system_name: 'Alpha Centauri',
//     position: { x: 500, y: 200 },
//     gates: [{
//         position: { x: 500, y: 200 },
//         system_identifier: 'solar'
//     }]
// }];

//const galaxyMap : Record<string, StarSystem> = {};

type Graph = Record<string, string[]>;

export default function GalaxyEditor() {

    const stageRef = useRef<Konva.Stage | null>(null);

    const galaxyMapRef = useRef<Record<string, StarSystem>>({});
    const mouseScaleRef = useRef<number>(1.0);

    const isDraggingRef = useRef<boolean>(false);
    const lastPointer = useRef<{ x: number; y: number } | null>(null);
    
    const[selectedTool, setSelectedTool] = useState<Tools>(Tools.SELECT);
    const[selectedSelectionTools, setSelectedSelectionTools] = useState<Tools[]>([Tools.STAR, Tools.LINK]);

    const cursorCircleRef = useRef<Konva.Circle>(null);
    const starLayerRef = useRef<Konva.Layer>(null);
    const linkLayerRef = useRef<Konva.Layer>(null);

    const selectedNodeRef = useRef<Konva.Circle | null>(null);
    const starRefs = useRef<Record<string, Konva.Circle>>({});
    const selectionOutlineRef = useRef<Konva.Circle | null>(null);
    const animRef = useRef<Konva.Animation | null>(null);


    // Based on the tool and mouse button, do various things
    const handleMiddleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {

        // Set dragging if middle mouse button is pressed to start panning around the stage
        if (e.evt.button === 1) {
            e.evt.preventDefault();
            console.log("Middle mouse test!");
            isDraggingRef.current = true;
            lastPointer.current = { x: e.evt.clientX, y: e.evt.clientY };
        } 
        // If we're on the star tool and we left click, place a star down on the stage directly via refs as well as
        // add a star to the galaxy map.
        else if (e.evt.button === 0 && selectedTool === Tools.STAR) {
            const addedSystem = addSystemToMap();

            const layer = starLayerRef.current;
            if (addedSystem && layer) {
                const textNode = new Konva.Text({
                    listening: false,
                    x: addedSystem.position.x,
                    y: addedSystem.position.y - 40,
                    text: addedSystem.system_name,
                    fontSize: 14,
                    fontStyle: 'bold',
                    width: 200,
                    offsetX: 100,
                    align: 'center',
                    fill: 'white',
                    ref: (node: any) => {
                        if (node) node.cache();        // ← cache immediately
                    }
                });

                const circleNode = new Konva.Circle({
                    x: addedSystem.position.x,
                    y: addedSystem.position.y,
                    radius: 8,
                    fill: 'yellow',
                    shadowBlur: 20,
                    shadowColor: 'yellow',
                    ref: (node: any) => {
                        if (node) {
                            node.cache();
                            starRefs.current[addedSystem.system_identifier] = node;
                        }
                    }
                })
                layer.add(textNode);
                layer.add(circleNode);
                layer.batchDraw();
            }

        }
    }

    // Handle mouse movement when hovering over the stage.
    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
        const stage = stageRef.current;
        
        // Place the cursor circle under the mouse cursor with respect to scale / zooming.
        if (cursorCircleRef.current != undefined && stage != undefined)
        {

            const cursorCircle = cursorCircleRef.current;
            const scale = stage.scaleX();
            const pointer = stage.getPointerPosition();

            if (pointer == null) return;

            const x = (pointer.x - stage.x()) / scale;
            const y = (pointer.y - stage.y()) / scale;
            
            cursorCircle.x(x);
            cursorCircle.y(y);
            cursorCircle.getLayer()?.batchDraw();
        }
        

        // Choose the direction to pan the stage based on where our mouse is moving (mouse delta)
        if (!isDraggingRef.current || !lastPointer.current || !stage) return;

        const dx = e.evt.clientX - lastPointer.current.x;
        const dy = e.evt.clientY - lastPointer.current.y;
        lastPointer.current = { x: e.evt.clientX, y: e.evt.clientY}

        const newPos = {
            x: stage.x() + dx,
            y: stage.y() + dy
        }

        stage.position(newPos);
        stage.batchDraw();
    }

    // When releasing mouse button, reset lastPointer and dragging
    const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (e.evt.button === 1) {
            isDraggingRef.current = false;
            lastPointer.current = null;
        }
    }


    // Generates a randomized galaxy for testing purposes.
    const generateGalaxy = (numStars: number, topLeft: Point, width: number, height: number) : StarSystem[] => {
        const systems: StarSystem[] = [];

        for (let i = 0; i < numStars; i++) {
            const system: StarSystem = {
                id: i,
                system_identifier: `system_${i}`,
                system_name: `System ${i}`,
                position: {
                    x: topLeft.x + Math.random() * width,
                    y: topLeft.y + Math.random() * height
                },
                gates: []

            }
            systems.push(system);
        }
        return systems;
    }

    // Handles zooming for us.
    const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();

        const stage = stageRef.current;

        if (stage == null) return;

        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        if (pointer == null) return;

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale
        }

        let direction = e.evt.deltaY > 0 ? -1 : 1;

        const scaleBy = 1.2;
        const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

        mouseScaleRef.current = newScale;

        stage.scale({ x: newScale, y: newScale });
        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale
        };
        stage.position(newPos);
        stage.batchDraw();

    }

    const build_graph = (starSystems: StarSystem[]) : Graph => {
        const graph: Graph = {};

        for (const system of starSystems) {

            if (!graph[system.system_identifier])
                graph[system.system_identifier] = [];

            for (const gate of system.gates) {
                
                const from = system.system_identifier;
                const to = gate.system_identifier;

                if (!graph[to])
                    graph[to] = [];

                // Adds the connection between the two systems in the graph.
                if (!graph[from].includes(to))
                    graph[from].push(to);

                if (!graph[to].includes(from))
                    graph[to].push(from);

            }
        }

        return graph;
    }

    const graph = useMemo(() => {
        
        let systemList = generateGalaxy(100, { x: 0, y: 0 }, 5000, 5000);

        galaxyMapRef.current = systemList.reduce((acc, system) => {
            acc[system.system_identifier] = system;
            return acc;
        }, {} as Record<string, StarSystem>);

        return build_graph(systemList);
    }, [])

    const handleToolChange = (tool: Tools) => {
        console.log("Tool selected: ", tool);
        setSelectedTool(tool);  
    }

    const handleSelectionToolToggle = (tool: Tools) => {
        setSelectedSelectionTools((prev) => {
            if (prev.includes(tool)) {
                return prev.filter(t => t !== tool);
            } else {
                return [...prev, tool];
            }
        });
    }

    const addSystemToMap = () => {

        const stage = stageRef.current;

        if (stage == undefined) return;

        const scale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        if (pointer == null) return;

        const x = (pointer.x - stage.x()) / scale;
        const y = (pointer.y - stage.y()) / scale;

        const system: StarSystem = {
            id: Object.keys(galaxyMapRef.current).length,
            system_identifier: `system_${Object.keys(galaxyMapRef.current).length}`,
            system_name: `System ${Object.keys(galaxyMapRef.current).length}`,
            position: {
                x: x,
                y: y
            },
            gates: []
        }
        galaxyMapRef.current[system.system_identifier] = system;

        return system;
    }

    const handleClickStar = (systemIdentifier: string) => {

        if (selectedTool === Tools.LINK) {

            const currStar = starRefs.current[systemIdentifier];

            
            animRef.current?.stop();
            selectionOutlineRef.current?.destroy();

            if (selectedNodeRef.current != null && selectedNodeRef.current !== currStar) {
                const fromSystem = galaxyMapRef.current[selectedNodeRef.current.getAttr('systemIdentifier')];
                const toSystem = galaxyMapRef.current[currStar.getAttr('systemIdentifier')];

                fromSystem.gates.push({
                    position: {x: 0, y: 0},
                    system_identifier: toSystem.system_identifier
                })

                toSystem.gates.push({
                    position: {x: 0, y: 0},
                    system_identifier: fromSystem.system_identifier
                })

                const link = new Konva.Line({
                    points: [fromSystem.position.x, fromSystem.position.y, toSystem.position.x, toSystem.position.y],
                    stroke: 'white',
                    strokeWidth: 2,
                })
                linkLayerRef.current?.add(link);

                linkLayerRef.current?.batchDraw();

                selectedNodeRef.current = null;
                selectionOutlineRef.current = null;

                return;
            }

            selectedNodeRef.current = currStar;

            const outline = new Konva.Circle({
                x: currStar.x(),
                y: currStar.y(),
                radius: 18,
                stroke: '#e05555',
                strokeWidth: 4,
                dash: [12, 7]
            })

            selectionOutlineRef.current = outline;
            starLayerRef.current?.add(outline);

            const anim = new Konva.Animation((frame) => {
                if (!frame) return;

                outline.rotation(frame.time * 0.05);
            }, starLayerRef.current);

            animRef.current = anim;
            anim.start();

            starLayerRef.current?.batchDraw();
        }
    }

    return (
        <div>
            <BottomToolbar 
            onToolChange={handleToolChange}
            selectedTool={selectedTool}
            />
            <SideToolbar
            selectionTools={selectedSelectionTools}
            onToolChange={handleSelectionToolToggle}
            /> 
            <Stage
            width={window.innerWidth} 
            height={window.innerHeight}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseDown={handleMiddleMouseDown}
            style={{ backgroundColor: '#12151f' }}
            onWheel={handleWheel}
            ref={stageRef}
            >

            <Layer>
                {
                    selectedTool === Tools.STAR &&
                    (
                    <Circle 
                        ref={cursorCircleRef}
                        fill="yellow"
                        radius={10}
                    />
                    )
                }

            </Layer>

                <Layer ref={linkLayerRef}>
                {Object.values(galaxyMapRef.current).map((system) => (
                    <React.Fragment key={system.system_identifier}>

                        {system.gates.map((gate) => (
                            <Line
                                listening={false}
                                key={gate.system_identifier}
                                points={[system.position.x, system.position.y, galaxyMapRef.current[gate.system_identifier].position.x, galaxyMapRef.current[gate.system_identifier].position.y]}
                                stroke="white"
                                strokeWidth={2}
                            />
                        ))}

                    </React.Fragment>
                ))}
                </Layer>
                <Layer ref={starLayerRef} perfectDrawEnabled={false}>
                {Object.values(galaxyMapRef.current).map((system) => (
                        <React.Fragment key={system.system_identifier}>
                            <Text
                                listening={false}
                                x={system.position.x}
                                y={system.position.y - 40}
                                fontStyle={"bold"}
                                text={system.system_name}
                                fontSize={14}
                                fill="white"
                                width={200}
                                offsetX={100}
                                align={"center"}
                                ref={(node) => {
                                    if (node) node.cache();        // ← cache immediately
                                }}
                            />

                            <Circle
                            onMouseDown={() => handleClickStar(system.system_identifier)}
                            x={system.position.x}
                            y={system.position.y}
                            radius={8}
                            fill="yellow"
                            shadowBlur={20}
                            shadowColor="yellow"
                            ref={(node) => {
                                    if (node) {
                                        node.cache();        // ← cache immediately
                                        starRefs.current[system.system_identifier] = node;
                                    }
                                }}
                            systemIdentifier={system.system_identifier}
                            />
                        </React.Fragment>
                ))}
                </Layer>

                {/* <Layer>
                    <Line
                        points={[200, 200, 500, 200]}
                        stroke="white"
                        strokeWidth={2}
                    />
                </Layer>
                <Layer>
                    <Circle 
                        x={200}
                        y={200}
                        radius={10}
                        fill="blue"
                    />
                    <Circle 
                        x={500}
                        y={200}
                        radius={10}
                        fill="blue"
                    />
                </Layer> */}

            </Stage>
        </div>
    )
}