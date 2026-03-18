import { Arc, Circle, Layer, Line, Stage } from "react-konva";
import type { StarGate, StarSystem, Point } from '../interfaces';
import { useEffect, useMemo, useRef } from "react";

const systemList: StarSystem[] = [{
    id: 1,
    system_identifier: 'solar',
    system_name: 'Solar System',
    position: { x: 200, y: 200 },
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
            width={window.innerWidth} 
            height={window.innerHeight}
            style={{ backgroundColor: '#0a0a1f' }}
            >
                <Layer>
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
                </Layer>

            </Stage>
        </div>
    )
}