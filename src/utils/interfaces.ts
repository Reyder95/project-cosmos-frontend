import type Konva from "konva";

interface Point {
    x: number,
    y: number
}

interface StarGate {
    position: Point;
    system_identifier: string;
}

interface StarSystem {
    id: number;
    system_identifier: string;
    system_name: string;
    position: Point;
    gates: StarGate[];
    region: string;
}

interface SelectionOutlineOptions {
    x: number;
    y: number;
    radius?: number;
    stroke?: string;
    strokeWidth?: number;
    dash?: number[];
    rotationSpeed?: number;
}

interface SelectionOutlineHandle {
    outline: Konva.Circle;
    anim: Konva.Animation;
    destroy: () => void;
}

export type {
    StarSystem,
    StarGate,
    Point,
    SelectionOutlineOptions,
    SelectionOutlineHandle
}