import React from "react";
import { Loader2 } from "lucide-react";

export type LoadingVariant = "spinner" | "dots" | "pulse" | "skeleton";
export type LoadingSize = "sm" | "md" | "lg" | "xl";
export type LoadingLayout = "fullscreen" | "inline" | "centered";

export interface LoadingProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
  layout?: LoadingLayout;
  message?: string;
  className?: string;
  fullScreen?: boolean; // Deprecated: use layout="fullscreen" instead
}

const Loading: React.FC<LoadingProps> = ({
  variant = "spinner",
  size = "md",
  layout = "inline",
  message,
  className = "",
  fullScreen, // Deprecated
}) => {
  // Handle deprecated fullScreen prop
  const effectiveLayout = fullScreen ? "fullscreen" : layout;

  // Size configurations
  const sizeConfig = {
    sm: {
      spinner: "w-4 h-4",
      dots: "w-1.5 h-1.5",
      pulse: "w-8 h-8",
      text: "text-sm",
      gap: "gap-1",
      skeleton: "h-3",
    },
    md: {
      spinner: "w-6 h-6",
      dots: "w-2 h-2",
      pulse: "w-12 h-12",
      text: "text-base",
      gap: "gap-1.5",
      skeleton: "h-4",
    },
    lg: {
      spinner: "w-8 h-8",
      dots: "w-2.5 h-2.5",
      pulse: "w-16 h-16",
      text: "text-lg",
      gap: "gap-2",
      skeleton: "h-5",
    },
    xl: {
      spinner: "w-12 h-12",
      dots: "w-3 h-3",
      pulse: "w-20 h-20",
      text: "text-xl",
      gap: "gap-2.5",
      skeleton: "h-6",
    },
  };

  const config = sizeConfig[size];

  // Layout configurations
  const layoutClasses = {
    fullscreen:
      "fixed inset-0 z-50 flex items-center justify-center bg-background-base/90 backdrop-blur-md",
    centered: "flex items-center justify-center w-full h-full min-h-[200px]",
    inline: "flex items-center justify-center",
  };

  // Render spinner variant with gradient
  const renderSpinner = () => (
    <div className="relative">
      <div className={`${config.spinner} rounded-full border-4 border-neutral-3 ${className}`} />
      <Loader2
        className={`${config.spinner} absolute inset-0 animate-spin text-primary-6`}
        strokeWidth={2.5}
      />
    </div>
  );

  // Render dots variant with gradient colors
  const renderDots = () => (
    <div className={`flex items-center ${config.gap} ${className}`}>
      <div
        className={`${config.dots} rounded-full bg-primary-6 shadow-sm shadow-primary-6/50 animate-bounce`}
        style={{ animationDelay: "0s" }}
      />
      <div
        className={`${config.dots} rounded-full bg-primary-7 shadow-sm shadow-primary-7/50 animate-bounce`}
        style={{ animationDelay: "0.2s" }}
      />
      <div
        className={`${config.dots} rounded-full bg-primary-8 shadow-sm shadow-primary-8/50 animate-bounce`}
        style={{ animationDelay: "0.4s" }}
      />
    </div>
  );

  // Render pulse variant with gradient and shadow
  const renderPulse = () => (
    <div className="relative">
      <div
        className={`${config.pulse} rounded-full bg-gradient-to-br from-primary-6 to-primary-8 shadow-lg shadow-primary-6/30 animate-pulse ${className}`}
      />
      <div
        className={`${config.pulse} absolute inset-0 rounded-full bg-primary-6/20 animate-ping`}
        style={{ animationDuration: "2s" }}
      />
    </div>
  );

  // Render skeleton variant with colors from colors.json
  const renderSkeleton = () => (
    <div className={`flex flex-col ${config.gap} w-full max-w-md ${className}`}>
      <div
        className={`${config.skeleton} bg-neutral-3 rounded-md animate-pulse shadow-sm`}
        style={{ animationDelay: "0s" }}
      />
      <div
        className={`${config.skeleton} bg-neutral-3 rounded-md animate-pulse w-5/6 shadow-sm`}
        style={{ animationDelay: "0.1s" }}
      />
      <div
        className={`${config.skeleton} bg-neutral-3 rounded-md animate-pulse w-4/6 shadow-sm`}
        style={{ animationDelay: "0.2s" }}
      />
    </div>
  );

  // Render loading indicator based on variant
  const renderIndicator = () => {
    switch (variant) {
      case "dots":
        return renderDots();
      case "pulse":
        return renderPulse();
      case "skeleton":
        return renderSkeleton();
      case "spinner":
      default:
        return renderSpinner();
    }
  };

  const containerClasses = `${layoutClasses[effectiveLayout]} ${className}`;

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        {renderIndicator()}
        {message && (
          <p className={`${config.text} text-neutral-6 font-medium animate-pulse`}>{message}</p>
        )}
      </div>
    </div>
  );
};

export default Loading;
