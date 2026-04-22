import { Arc, Circle, Layer, Line, Stage, Text } from "react-konva";
import type { StarGate, StarSystem, Point } from '../utils/interfaces';
import { Tools } from '../enums';
import React, { use, useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import BottomToolbar from "../components/GalaxyEditor/BottomToolbar";
import SideToolbar from "../components/GalaxyEditor/SideToolbar";
import { useSelectionOutline } from "../utils/selectionOutline";

type Graph = Record<string, string[]>;

export default function GalaxyEditor() {

    const stageRef = useRef<Konva.Stage | null>(null);

    const galaxyMapRef = useRef<Record<string, StarSystem>>({});
    const [galaxyMapVersion, setGalaxyMapVersion] = useState<number>(0);
    const mouseScaleRef = useRef<number>(1.0);

    const isDraggingRef = useRef<boolean>(false);
    const lastPointer = useRef<{ x: number; y: number } | null>(null);

    const isSelectingRef = useRef<boolean>(false);
    const selectionStartRef = useRef<{ x: number; y: number } | null>(null);

    const [selBox, setSelBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

    const [selectedTool, setSelectedTool] = useState<Tools>(Tools.SELECT);
    const [selectedSelectionTools, setSelectedSelectionTools] = useState<Tools[]>([Tools.STAR, Tools.LINK]);

    const [regionList, setRegionList] = useState<string[]>([]);
    const [currRegion, setCurrRegion] = useState<string | null>(null);

    const [labels, setLabels] = useState<{ name: string, centerX: number, centerY: number, fontSize: number }[]>([]);

    const cursorCircleRef = useRef<Konva.Circle>(null);
    const starLayerRef = useRef<Konva.Layer>(null);
    const linkLayerRef = useRef<Konva.Layer>(null);

    const selectedNodeRef = useRef<Konva.Circle | null>(null);
    const starRefs = useRef<Record<string, Konva.Circle>>({});
    const selectionOutlineRef = useRef<Konva.Circle | null>(null);
    const animRef = useRef<Konva.Animation | null>(null);

    const [selectedNodes, setSelectedNodes] = useState<Konva.Circle[]>([]);
    const selectedNodesRef = useRef<Konva.Circle[]>([]);

    const keysDownRef = useRef<Set<string>>(new Set());

    const { attach, detach } = useSelectionOutline();


    useEffect(() => {
        const regionBounds = getRegionBounds();

        const labels = Object.entries(regionBounds).map(([name, bounds]) => getRegionLabel(name, bounds));

        setLabels((prev) => {
            const newLabels = [...prev];
            for (const label of labels) {
                const existingLabel = newLabels.find((l) => l.name === label.name);
                if (existingLabel) {
                    existingLabel.centerX = label.centerX;
                    existingLabel.centerY = label.centerY;
                    existingLabel.fontSize = label.fontSize;
                } else {
                    newLabels.push(label);
                }
            }
            return newLabels;
        })
    }, [galaxyMapVersion])

    useEffect(() => {
        if (!currRegion && regionList.length > 0) {
            setCurrRegion(regionList[0]);
        }
    }, [regionList]);

    // Ref mirror, may need to just make this a full on ref instead of state
    useEffect(() => {
        selectedNodesRef.current = selectedNodes;
        console.log(selectedNodes);
    }, [selectedNodes]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            keysDownRef.current.add(e.key);

            if (e.key === 'Delete') {
                selectedNodesRef.current.forEach((node) => {
                    const currSystemIdentifier = node.getAttr('systemIdentifier');
                    detach(currSystemIdentifier);

                    delete starRefs.current[currSystemIdentifier];
                    delete galaxyMapRef.current[currSystemIdentifier];

                    node.destroy();

                    setSelectedNodes(prev => prev.filter(nodeInner => nodeInner !== node));
                    starLayerRef.current?.batchDraw();
                })
            }
        }

        const handleKeyUp = (e: KeyboardEvent) => {
            keysDownRef.current.delete(e.key);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        }
    }, [])

    // --- EVENT HANDLERS ---

    const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (e.evt.button === 1) {
            isDraggingRef.current = false;
            lastPointer.current = null;
        }
    }

    // Handle mouse movement when hovering over the stage.
    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
        const stage = stageRef.current;

        // Place the cursor circle under the mouse cursor with respect to scale / zooming.
        if (cursorCircleRef.current != undefined && stage != undefined) {

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
        lastPointer.current = { x: e.evt.clientX, y: e.evt.clientY }

        const newPos = {
            x: stage.x() + dx,
            y: stage.y() + dy
        }

        stage.position(newPos);
        stage.batchDraw();
    }

    // Based on the tool and mouse button, do various things
    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {

        // Set dragging if middle mouse button is pressed to start panning around the stage
        if (e.evt.button === 1) {
            e.evt.preventDefault();
            isDraggingRef.current = true;
            lastPointer.current = { x: e.evt.clientX, y: e.evt.clientY };
        }
        // If we're on the star tool and we left click, place a star down on the stage directly via refs as well as
        // add a star to the galaxy map.
        else if (e.evt.button === 0) {
            if (selectedTool === Tools.STAR) {
                addSystemToMap();
                setGalaxyMapVersion((prev) => prev + 1);
            }
        }
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

    const handleClickStar = (systemIdentifier: string, e: Konva.KonvaEventObject<MouseEvent>) => {

        if (e.evt.button === 1 || e.evt.button === 2) return;

        if (selectedTool === Tools.LINK) {

            const currStar = starRefs.current[systemIdentifier];

            animRef.current?.stop();
            selectionOutlineRef.current?.destroy();

            if (selectedNodeRef.current != null && selectedNodeRef.current !== currStar) {
                const fromSystem = galaxyMapRef.current[selectedNodeRef.current.getAttr('systemIdentifier')];
                const toSystem = galaxyMapRef.current[currStar.getAttr('systemIdentifier')];

                fromSystem.gates.push({
                    position: { x: 0, y: 0 },
                    system_identifier: toSystem.system_identifier
                })

                toSystem.gates.push({
                    position: { x: 0, y: 0 },
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

                detach();

                return;
            }
            else if (selectedNodeRef.current != null) {
                selectedNodeRef.current = null;
                detach();
                return;
            }

            selectedNodeRef.current = currStar;

            if (starLayerRef.current == null) return;

            attach(starLayerRef.current, {
                x: currStar.x(),
                y: currStar.y()
            }, systemIdentifier)

            starLayerRef.current?.batchDraw();
        } else if (selectedTool == Tools.REGION) {
            if (currRegion != "" && currRegion != null) {
                const tempGalaxyMap = { ...galaxyMapRef.current };
                const currStar = tempGalaxyMap[systemIdentifier];
                currStar.region = currRegion;
                tempGalaxyMap[systemIdentifier] = currStar;
                galaxyMapRef.current = tempGalaxyMap;
                setGalaxyMapVersion((prev) => prev + 1);
            }
        } else if (selectedTool == Tools.ERASER) {
            console.log("Test!");
            const tempGalaxyMap = { ...galaxyMapRef.current };
            delete tempGalaxyMap[systemIdentifier];
            galaxyMapRef.current = tempGalaxyMap;
            setGalaxyMapVersion((prev) => prev + 1);
        }
        else if (selectedTool === Tools.SELECT) {
            const currStar = starRefs.current[systemIdentifier];

            if (starLayerRef.current == null) return;

            if (selectedNodes.includes(currStar)) {

                if (selectedNodes.length === 1) {
                    const currSystemIdentifier = currStar.getAttr('systemIdentifier');
                    detach(currSystemIdentifier);
                    setSelectedNodes(prev => prev.filter(node => node !== currStar));
                    starLayerRef.current?.batchDraw();
                }

            }

            if (!keysDownRef.current.has('Control')) {
                detach();
                setSelectedNodes([]);
            }
            else {
                if (selectedNodes.includes(currStar)) {
                    const currSystemIdentifier = currStar.getAttr('systemIdentifier');
                    detach(currSystemIdentifier);
                    setSelectedNodes(prev => prev.filter(node => node !== currStar));
                    starLayerRef.current?.batchDraw();

                    return;
                }
            }

            attach(starLayerRef.current, {
                x: currStar.x(),
                y: currStar.y()
            }, systemIdentifier);

            setSelectedNodes(prev => [...prev, currStar]);
        }
    }

    const handleRegionAdd = (region: string) => {
        setRegionList((prev) => [...prev, region]);
    }

    const handleRegionChange = (region: string) => {
        setCurrRegion(region);
    }

    const handleToolChange = (tool: Tools) => {
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

    // --- FUNCTIONS ---

    const getRegionBounds = () => {
        const regions: Record<string, { minX: number, maxX: number, minY: number, maxY: number }> = {};

        for (const star of Object.values(galaxyMapRef.current)) {
            const region = star.region;
            if (region == null) continue;

            if (regions[region] == null) {
                regions[region] = {
                    minX: star.position.x,
                    maxX: star.position.x,
                    minY: star.position.y,
                    maxY: star.position.y
                }
            } else {
                regions[region].minX = Math.min(regions[region].minX, star.position.x);
                regions[region].maxX = Math.max(regions[region].maxX, star.position.x);
                regions[region].minY = Math.min(regions[region].minY, star.position.y);
                regions[region].maxY = Math.max(regions[region].maxY, star.position.y);
            }
        }

        return regions;
    }

    const getRegionLabel = (name: string, bounds: { minX: number, maxX: number, minY: number, maxY: number }) => {
        const centerX = (bounds.minX + bounds.maxX) / 2;
        const centerY = (bounds.minY + bounds.maxY) / 2;
        const width = bounds.maxX - bounds.minX;
        const height = bounds.maxY - bounds.minY;

        const fontSize = Math.max(10, Math.min(60, Math.min(width, height) * 0.08));

        return { name, centerX, centerY, fontSize };
    }

    // Generates a randomized galaxy for testing purposes.
    const generateGalaxy = (numStars: number, topLeft: Point, width: number, height: number): StarSystem[] => {
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
                gates: [],
                region: "Hello"

            }
            systems.push(system);
        }
        return systems;
    }

    const build_graph = (starSystems: StarSystem[]): Graph => {
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

        let systemList = generateGalaxy(25, { x: 0, y: 0 }, 5000, 5000);

        galaxyMapRef.current = systemList.reduce((acc, system) => {
            acc[system.system_identifier] = system;
            return acc;
        }, {} as Record<string, StarSystem>);

        return build_graph(systemList);
    }, [])

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
            gates: [],
            region: "Hello"
        }
        galaxyMapRef.current[system.system_identifier] = system;

        return system;
    }

    return (
        <div>
            <BottomToolbar
                onToolChange={handleToolChange}
                selectedTool={selectedTool}
                onRegionAdd={handleRegionAdd}
                regionList={regionList}
                onRegionChange={handleRegionChange}
                currentRegion={currRegion}
            />
            <SideToolbar
                selectionTools={selectedSelectionTools}
                onToolChange={handleSelectionToolToggle}
            />
            <Stage
                onContextMenu={(e) => e.evt.preventDefault()}
                width={window.innerWidth}
                height={window.innerHeight}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseDown={handleMouseDown}
                style={{ backgroundColor: '#12151f' }}
                onWheel={handleWheel}
                ref={stageRef}
            >
                <Layer>
                    {labels.map((label) => (
                        <Text
                            key={label.name}
                            x={label.centerX}
                            y={label.centerY}
                            text={label.name}
                            fontSize={label.fontSize}
                            fontStyle="bold"
                            width={500}
                            offsetX={250}
                            align="center"
                            fill="white"
                        />
                    ))}
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

                <Layer>

                </Layer>

                <Layer ref={linkLayerRef}>
                    {Object.values(galaxyMapRef.current).map((system) => (
                        <React.Fragment key={system.system_identifier}>

                            {system.gates.map((gate) => (
                                <Line
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
                                onMouseDown={(e) => handleClickStar(system.system_identifier, e)}
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