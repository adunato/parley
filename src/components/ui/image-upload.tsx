"use client";

import * as React from "react";
import { Trash2, Upload, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
    value?: string;
    onChange: (value: string) => void;
    onRemove: () => void;
    className?: string;
    label?: string;
    description?: string;
}

export function ImageUpload({
    value,
    onChange,
    onRemove,
    className,
    label = "Upload Image",
    description = "Click to browse or drag and drop"
}: ImageUploadProps) {
    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.src = reader.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Max dimensions (e.g., 800px width/height to save space)
                    const MAX_SIZE = 800; // Reduced from original size to fit localStorage

                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with 0.7 quality
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                    onChange(compressedBase64);
                };
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={cn("w-full", className)}>
            {!value ? (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 flex flex-col items-center justify-center gap-4 hover:bg-muted/10 transition-colors relative">
                    <div className="p-4 bg-muted rounded-full">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    <Input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleUpload}
                    />
                </div>
            ) : (
                <div className="relative group rounded-lg overflow-hidden border bg-background">
                    <img
                        src={value}
                        alt="Uploaded content"
                        className="w-full h-auto max-h-[400px] object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button variant="destructive" size="sm" onClick={onRemove}>
                            <Trash2 className="h-4 w-4 mr-2" /> Remove
                        </Button>
                        <div className="relative">
                            <Button variant="secondary" size="sm" className="pointer-events-none">
                                <Upload className="h-4 w-4 mr-2" /> Replace
                            </Button>
                            <Input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleUpload}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
