import type React from "react"

interface AvatarUploaderProps {
  currentAvatar: string;
  size?: number
  className?: string
}

export default function AvatarUploader({ currentAvatar, size = 120, className = "" }: AvatarUploaderProps) {
    return (
        <div
            className={`relative inline-block cursor-pointer ${className}`}
            style={{ width: size, height: size }}
        >
            <div
                className="w-full h-full rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300 flex items-center justify-center"
            >
                {currentAvatar ? (
                    <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" style={{ width: size, height: size }} />
                ) : (
                    <div className="text-gray-400 text-2xl">👤</div>
                )}
            </div>
        </div>
    )
}