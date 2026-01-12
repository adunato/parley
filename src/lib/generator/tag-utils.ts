import { BioData, EventNode, LifeEvent } from './types';

export interface TagRelationships {
    providedBy: string[];
    requiredBy: string[];
    influences: string[];
}

export function getTagRelationships(tagId: string, data: BioData): TagRelationships {
    const providedBy: string[] = [];
    const requiredBy: string[] = [];
    const influences: string[] = [];

    const allEntities: (EventNode | LifeEvent)[] = [
        ...data.origins,
        ...data.education,
        ...data.careers,
        ...data.lifeEvents
    ];

    allEntities.forEach(entity => {
        // Provided by
        if (entity.provides?.includes(tagId)) {
            providedBy.push(entity.id);
        }

        // Required by
        if ('requires' in entity && entity.requires?.includes(tagId)) {
            requiredBy.push(entity.id);
        }

        // Influences (weights)
        if (entity.weights && entity.weights[tagId] !== undefined) {
            influences.push(`${entity.id}:${entity.weights[tagId]}`);
        }
    });

    return {
        providedBy,
        requiredBy,
        influences
    };
}
