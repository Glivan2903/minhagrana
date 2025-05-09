
import React from "react";

type SummaryCardProps = {
  title: string;
  amount: string;
  subtitle: string;
  icon: React.ReactNode;
  variant?: "default" | "income" | "expense" | "balance" | "ratio";
};

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  amount,
  subtitle,
  icon,
  variant = "default",
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "income":
        return "text-minhagrana-primary border-l-4 border-minhagrana-primary";
      case "expense":
        return "text-minhagrana-danger border-l-4 border-minhagrana-danger";
      case "balance":
        return "border-l-4 border-blue-500";
      case "ratio":
        return "border-l-4 border-purple-500";
      default:
        return "";
    }
  };

  return (
    <div className={`bg-white p-4 rounded-md shadow-sm ${getVariantClasses()}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-gray-500">{title}</div>
          <div className="text-2xl font-bold mt-1">{amount}</div>
          <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
    </div>
  );
};
