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
}

export type {
    StarSystem,
    StarGate,
    Point
}