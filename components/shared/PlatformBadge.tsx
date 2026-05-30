import React from "react";
import { Monitor, Laptop, Apple } from "lucide-react";

export const platformIcons: Record<string, React.ElementType> = {
  linux: Monitor,
  windows: Laptop,
  apple: Apple,
};

export const platformBGs: Record<string, string> = {
  linux: "bg-gray-300",
  windows: "bg-blue-300",
  apple: "bg-green-300",
};

const PlatformBadge = ({ label, value }: { label: string; value: string }) => {
  const Icon = platformIcons[value];
  const bgColor = platformBGs[value] || "bg-gray-200";

  return (
    <div className="flex items-center gap-2">
      {Icon && (
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${bgColor}`}
        >
          <Icon className="h-5 w-5 text-gray-900 dark:text-gray-100" />
        </div>
      )}
      <span className="text-lg">{label}</span>
    </div>
  );
};

export default PlatformBadge;
