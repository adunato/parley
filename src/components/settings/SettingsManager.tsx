"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { ProjectService } from "@/lib/services/projectService";

export function SettingsManager() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExportSettings = async () => {
        try {
            const json = await ProjectService.exportSettingsToJSON();
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `parley-settings-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            alert("Export failed: " + (e as Error).message);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            await ProjectService.importSettingsFromJSON(file);
            alert("Settings imported successfully!");
        } catch (e) {
            alert("Import failed: " + (e as Error).message);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <>
            <Button variant="outline" onClick={handleExportSettings}>
                <Download className="mr-2 h-4 w-4" /> Export Settings
            </Button>

            <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
            />
            <Button variant="outline" onClick={handleImportClick}>
                <Upload className="mr-2 h-4 w-4" /> Import Settings
            </Button>
        </>
    );
}
