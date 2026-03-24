import { Arc, Circle, Layer, Line, Stage, Text } from "react-konva";
import type { StarGate, StarSystem, Point } from '../interfaces';
import { useEffect, useMemo, useRef } from "react";
import type Konva from "konva";

const systemList: StarSystem[] = [{
    id: 1,
    system_identifier: 'solar',
    system_name: 'Solar System',
    position: { x: 200, y: 300 },
    gates: [{
        position: { x: 200, y: 200 },
        system_identifier: 'alpha_centauri'
    }]
}, 
{
    id: 2,
    system_identifier: 'alpha_centauri',
    system_name: 'Alpha Centauri',
    position: { x: 500, y: 200 },
    gates: [{
        position: { x: 500, y: 200 },
        system_identifier: 'solar'
    }]
}];

const galaxyMap : Record<string, StarSystem> = {};

type Graph = Record<string, string[]>;

export default function GalaxyEditor() {

    const width = window.innerWidth;
    const height = window.innerHeight;
    const stageRef = useRef<Konva.Stage | null>(null);

    const handleWheel = (e) => {
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

        stage.scale({ x: newScale, y: newScale });
        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale
        };
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
        return build_graph(systemList);
    }, [systemList])

    const galaxyMap = useMemo(() => {
        const map: Record<string, StarSystem> = {};

        for (const system of systemList) {
            map[system.system_identifier] = system;
        }
        return map;
    }, [systemList]);

    useEffect(() => {
        galaxyGraphRef.current = graph;
    }, [graph])

    return (
        <div>
            <Stage 
            draggable
            width={window.innerWidth} 
            height={window.innerHeight}
            style={{ backgroundColor: '#0a0a1f' }}
            onWheel={handleWheel}
            ref={stageRef}
            >
                {Object.values(galaxyMap).map((system) => (
                    <Layer key={system.system_identifier}>
                        {system.gates.map((gate) => (
                            <Line
                                key={gate.system_identifier}
                                points={[system.position.x, system.position.y, galaxyMap[gate.system_identifier].position.x, galaxyMap[gate.system_identifier].position.y]}
                                stroke="white"
                                strokeWidth={2}
                            />
                        ))}

                    </Layer>

                ))}

                {Object.values(galaxyMap).map((system) => (
                        <Layer key={system.system_identifier}>
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
                            />

                            <Circle
                            x={system.position.x}
                            y={system.position.y}
                            radius={8}
                            fill="yellow"
                            shadowBlur={20}
                            shadowColor="yellow"
                            />
                        </Layer>
                ))}

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