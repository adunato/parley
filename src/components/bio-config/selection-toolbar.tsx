import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { ReactNode } from "react";

interface SelectionToolbarProps {
    selectedCount: number;
    onDelete: () => void;
    children?: ReactNode;
}

export function SelectionToolbar({ selectedCount, onDelete, children }: SelectionToolbarProps) {
    return (
        <div className="flex items-center gap-2">
            {selectedCount > 0 && (
                <span className="text-sm font-medium text-muted-foreground mr-2">
                    {selectedCount} selected
                </span>
            )}
            {children}
            {selectedCount > 0 && (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onDelete}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                </Button>
            )}
        </div>
    );
}
