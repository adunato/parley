'use client';

import { AttributeManager } from '@/components/attribute-config/attribute-manager';
import { ConfigPage } from '@/components/layout/config-page';

export default function AttributeConfigPage() {
    return (
        <ConfigPage>
            <h1 className="type-h2 mb-4">Attribute Engine</h1>
            <p className="text-secondary-foreground mb-8 type-body-sm">
                Configure the foundational categories and attributes that make up a character's life path (Origins, Education, Housing, Siblings, Relationships).
            </p>
            <AttributeManager />
        </ConfigPage>
    );
}
