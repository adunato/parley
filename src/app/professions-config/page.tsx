"use client";

import { useBioStore } from "@/lib/store/bioStore";
import { ConfigPage } from "@/components/layout/config-page";
import { ProfessionList } from "@/components/professions/profession-list";

export default function ProfessionsConfigPage() {
    const store = useBioStore();

    return (
        <ConfigPage>
            <div className="space-y-6">
                <div className="space-y-2">
                    <h1 className="type-h2 text-foreground">Profession Configuration</h1>
                    <p className="text-muted-foreground">
                        Manage the list of professions available for characters.
                    </p>
                </div>

                <ProfessionList
                    data={store.professions || []}
                    onAdd={store.addProfession}
                    onUpdate={store.updateProfession}
                    onDelete={store.deleteProfession}
                />
            </div>
        </ConfigPage>
    );
}
