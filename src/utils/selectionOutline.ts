import Konva from "konva";
import type { SelectionOutlineHandle, SelectionOutlineOptions } from "./interfaces";
import { useCallback, useRef } from "react";

export function createSelectionOutline(layer: Konva.Layer, options: SelectionOutlineOptions, system_identifier: string): SelectionOutlineHandle {
    const {
        x,
        y,
        radius = 18,
        stroke = '#e05555',
        strokeWidth = 4,
        dash = [12, 7],
        rotationSpeed = 0.05,
    } = options;

    const outline = new Konva.Circle({
        x,
        y,
        radius,
        stroke,
        strokeWidth,
        dash,
        systemIdentifier: system_identifier,
        listening: false
    });

    layer.add(outline);

    const anim = new Konva.Animation((frame) => {
        if (!frame) return;
        outline.rotation(frame.time * rotationSpeed);
    }, layer);

    anim.start();

    return {
        outline,
        anim,
        destroy: () => {
            anim.stop();
            outline.destroy();
        }
    };
}

export function useSelectionOutline() {
    const handleRef = useRef<ReturnType<typeof createSelectionOutline>[]>([]);

    const attach = useCallback((layer: Konva.Layer, options: SelectionOutlineOptions, system_identifier: string) => {
        handleRef.current = [...handleRef.current, createSelectionOutline(layer, options, system_identifier)];
    }, []);

    const detach = useCallback((system_identifier: string | null = null) => {

        if (system_identifier === null) {
            handleRef.current.forEach((handle) => handle.destroy());
            handleRef.current = [];
        } else {
            const handle = handleRef.current.find(h => h.outline.getAttr("systemIdentifier") === system_identifier);
            if (handle == null) return;
            handle.destroy();
            handleRef.current = handleRef.current.filter((handle) => handle.outline.getAttr("systemIdentifier") !== system_identifier);
        }
    }, []);

    return { attach, detach };
}