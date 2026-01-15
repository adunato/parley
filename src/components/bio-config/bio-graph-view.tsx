"use client";

import { BioGraphProvider } from './bio-graph-context';
import { BioGraphContent } from './bio-graph-content';

export function BioGraphView() {
    return (
        <BioGraphProvider>
            <BioGraphContent />
        </BioGraphProvider>
    );
}