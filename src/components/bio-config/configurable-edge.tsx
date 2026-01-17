import React, { useEffect, useRef, useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath } from 'reactflow';

export default function ConfigurableEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    label,
    labelStyle,
    labelShowBg,
    labelBgStyle,
    labelBgPadding,
    labelBgBorderRadius,
    data
}: EdgeProps) {
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const [customLabelPos, setCustomLabelPos] = useState<{ x: number, y: number } | null>(null);
    const pathRef = useRef<SVGPathElement>(null);

    // Get requested position from data (0-100), default to 50
    const requestedPos = typeof data?.labelPosition === 'number' ? data.labelPosition : 50;

    useEffect(() => {
        if (pathRef.current) {
            try {
                const len = pathRef.current.getTotalLength();
                // Clamp between 0 and 1
                const decimalPos = Math.max(0, Math.min(100, requestedPos)) / 100;
                const point = pathRef.current.getPointAtLength(len * decimalPos);

                // If the point is valid, use it
                if (point && !isNaN(point.x) && !isNaN(point.y)) {
                    setCustomLabelPos({ x: point.x, y: point.y });
                }
            } catch (e) {
                console.warn("Failed to calculate point on path", e);
            }
        }
    }, [edgePath, requestedPos]);

    // Fallback to default labelX/Y if custom calculation hasn't run or failed
    const x = customLabelPos?.x ?? labelX;
    const y = customLabelPos?.y ?? labelY;

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />

            {/* Invisible path for calculation */}
            <path
                ref={pathRef}
                d={edgePath}
                fill="none"
                stroke="none"
                style={{ visibility: 'hidden', pointerEvents: 'none' }}
            />

            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${x}px,${y}px)`,
                        pointerEvents: 'all',
                        fontSize: 12,
                        ...labelStyle
                    }}
                    className="nodrag nopan"
                >
                    {labelShowBg && (
                        <div
                            style={{
                                position: 'absolute',
                                left: -(labelBgPadding?.[0] || 2),
                                top: -(labelBgPadding?.[1] || 2),
                                width: `calc(100% + ${(labelBgPadding?.[0] || 2) * 2}px)`,
                                height: `calc(100% + ${(labelBgPadding?.[1] || 2) * 2}px)`,
                                backgroundColor: labelBgStyle?.fill || '#fff',
                                border: `1px solid ${labelBgStyle?.stroke || '#ccc'}`,
                                borderRadius: labelBgBorderRadius || 2,
                                zIndex: -1,
                            }}
                        />
                    )}
                    {label}
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
