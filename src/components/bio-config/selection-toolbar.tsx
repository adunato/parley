import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { ReactNode } from "react";

interface SelectionToolbarProps {
    selectedCount: number;
    onDelete: () => void;
    children?: ReactNode;
}

export function SelectionToolbar({ selectedCount, onDelete, children }: SelectionToolbarProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md border border-muted">
            <span className="text-sm font-medium text-muted-foreground ml-2">
                {selectedCount} selected
            </span>
            <div className="flex items-center gap-2">
                {children}
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onDelete}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                </Button>
            </div>
        </div>
    );
}
