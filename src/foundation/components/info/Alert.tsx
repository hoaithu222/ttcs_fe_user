import React, { ReactNode, CSSProperties } from "react";

type AlertVariant = "default" | "info" | "success" | "warning" | "error" | "infoText";

type CustomColors = {
  background?: string;
  border?: string;
  text?: string;
  iconBg?: string;
};

type AlertProps = {
  text?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
  variant?: AlertVariant;
  customColors?: CustomColors;
  className?: string;
  closable?: boolean;
  onClose?: () => void;
  style?: CSSProperties;
  fontSizeText?: string;
};

const VARIANT_CONFIG: Record<
  AlertVariant,
  {
    background: string;
    border: string;
    text: string;
    iconBg: string;
    iconColor: string;
  }
> = {
  default: {
    background: "linear-gradient(90deg, #F5F5F5 0%, #FFFFFF 100%)",
    border: "#E0E0E0",
    text: "#666666",
    iconBg: "#FFFFFF",
    iconColor: "#666666",
  },
  info: {
    background: "linear-gradient(90deg, #E6FDF1 0%, #FFFFFF 100%)",
    border: "#4CD964", // viền xanh lá nhạt
    text: "#34C759", // chữ xanh lá đậm
    iconBg: "#FFFFFF",
    iconColor: "#34C759",
  },
  success: {
    background: "linear-gradient(90deg, #E8F5E9 0%, #FFFFFF 100%)",
    border: "#4CAF50",
    text: "#388E3C",
    iconBg: "#FFFFFF",
    iconColor: "#4CAF50",
  },
  infoText: {
    background: "linear-gradient(90deg, #E3F2FD 0%, #FFFFFF 100%)",
    border: "#2196F3",
    text: "#1976D2",
    iconBg: "#FFFFFF",
    iconColor: "#2196F3",
  },
  warning: {
    background: "linear-gradient(90deg, #FFF2E5 0%, #FFFFFF 100%)",
    border: "#FFCC99",
    text: "#CC5F00",
    iconBg: "#FFFFFF",
    iconColor: "#FF7F00",
  },
  error: {
    background: "linear-gradient(90deg, #FFEBEB 0%, #FFFFFF 100%)",
    border: "#D83232",
    text: "#D83232",
    iconBg: "#FFFFFF",
    iconColor: "#D83232",
  },
};

export default function Alert({
  text,
  children,
  icon,
  fontSizeText = "14px",
  variant = "default",
  customColors,
  className,
  closable = false,
  onClose,
  style,
}: AlertProps) {
  const config = VARIANT_CONFIG[variant];

  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "12px",
    alignSelf: "stretch",
    borderRadius: "12px",
    border: `1px solid ${customColors?.border || config.border}`,
    paddingLeft: "8px",
    paddingRight: "24px",
    paddingTop: "10px",
    paddingBottom: "10px",
    background: customColors?.background || config.background,
    ...style,
  };

  const iconBgStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: customColors?.iconBg || config.iconBg,
  };

  const iconStyle: CSSProperties = {
    color: config.iconColor,
  };

  const textContainerStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const textStyle: CSSProperties = {
    textAlign: "justify",
    fontFamily: "Lexend, sans-serif",
    fontSize: fontSizeText,
    color: customColors?.text || config.text,
    margin: 0,
  };

  const closeButtonStyle: CSSProperties = {
    flexShrink: 0,
    marginLeft: "8px",
    borderRadius: "4px",
    padding: "4px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
  };

  return (
    <div role="alert" style={containerStyle} className={className}>
      {icon ? (
        <div style={iconBgStyle}>
          <div style={iconStyle}>{icon}</div>
        </div>
      ) : null}
      <div style={textContainerStyle}>
        {text ? <p style={textStyle}>{text}</p> : null}
        {children}
      </div>
      {closable ? (
        <button
          type="button"
          aria-label="Close alert"
          onClick={onClose}
          style={closeButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ height: "16px", width: "16px" }}
          >
            <path
              fillRule="evenodd"
              d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 1 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
