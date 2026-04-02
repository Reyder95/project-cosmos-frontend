import { Arc, Circle, Layer, Line, Stage, Text } from "react-konva";
import type { StarGate, StarSystem, Point } from '../interfaces';
import { Tools } from '../enums';
import React, { useEffect, useMemo, useRef, useState } from "react";
import type Konva from "konva";
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
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    const stageRef = useRef<Konva.Stage | null>(null);

    const [galaxyMap, setGalaxyMap] = useState<Record<string, StarSystem>>({});
    const mouseScaleRef = useRef<number>(1.0);

    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const lastPointer = useRef<{ x: number; y: number } | null>(null);
    
    const[selectedTool, setSelectedTool] = useState<Tools>(Tools.SELECT);

    const handleMiddleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (e.evt.button === 1) {
            e.evt.preventDefault();
            console.log("Middle mouse test!");
            setIsDragging(true);
            lastPointer.current = { x: e.evt.clientX, y: e.evt.clientY };
        }
    }

    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!isDragging || lastPointer.current == null) return;

        const dx = e.evt.clientX - lastPointer.current.x;
        const dy = e.evt.clientY - lastPointer.current.y;
        lastPointer.current = { x: e.evt.clientX, y: e.evt.clientY}
        setPos((prev) => ({ x: prev.x + dx, y: prev.y + dy}))
    }

    const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (e.evt.button === 1) {
            setIsDragging(false);
            lastPointer.current = null;
        }
    }


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
        setPos(newPos)
        stage.position(newPos);
        stage.batchDraw();

    }

    const galaxyGraphRef = useRef<Graph>({});

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
        
        let systemList = generateGalaxy(10, { x: 0, y: 0 }, 5000, 5000);

        setGalaxyMap(systemList.reduce((acc, system) => {
            acc[system.system_identifier] = system;
            return acc;
        }, {} as Record<string, StarSystem>));

        return build_graph(systemList);
    }, [])

    // const buildGalaxyMap = useMemo(() => {
    //     const map: Record<string, StarSystem> = {};

    //     for (const system of systemList) {
    //         map[system.system_identifier] = system;
    //     }
    //     return map;
    // }, [systemList]);

    useEffect(() => {
        //galaxyGraphRef.current = graph;
    }, [graph])

    const handleToolChange = (tool: Tools) => {
        console.log("Tool selected: ", tool);
        setSelectedTool(tool);  
    }

    return (
        <div>
            <BottomToolbar 
            onToolChange={handleToolChange}
            selectedTool={selectedTool}
            />
            <SideToolbar /> 
            <Stage
            width={window.innerWidth} 
            height={window.innerHeight}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseDown={handleMiddleMouseDown}
            style={{ backgroundColor: '#12151f' }}
            onWheel={handleWheel}
            x={pos.x}
            y={pos.y}
            ref={stageRef}
            >
                <Layer>
                {Object.values(galaxyMap).map((system) => (
                    <React.Fragment key={system.system_identifier}>

                        {system.gates.map((gate) => (
                            <Line
                                listening={false}
                                key={gate.system_identifier}
                                points={[system.position.x, system.position.y, galaxyMap[gate.system_identifier].position.x, galaxyMap[gate.system_identifier].position.y]}
                                stroke="white"
                                strokeWidth={2}
                            />
                        ))}

                    </React.Fragment>
                ))}
                </Layer>
                <Layer perfectDrawEnabled={false}>
                {Object.values(galaxyMap).map((system) => (
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
                            listening={false}
                            x={system.position.x}
                            y={system.position.y}
                            radius={8}
                            fill="yellow"
                            shadowBlur={20}
                            shadowColor="yellow"
                            ref={(node) => {
                                    if (node) node.cache();        // ← cache immediately
                                }}
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