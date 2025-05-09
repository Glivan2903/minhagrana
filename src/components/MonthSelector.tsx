
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

type MonthSelectorProps = {
  currentMonth: number; // 0-11
  currentYear: number;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSelectView: (view: "day" | "week" | "month") => void;
  currentView: "day" | "week" | "month";
  className?: string;
};

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  currentMonth,
  currentYear,
  onPreviousMonth,
  onNextMonth,
  onSelectView,
  currentView,
  className,
}) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onPreviousMonth}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">
          {months[currentMonth].toUpperCase()}
        </h2>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onNextMonth}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant={currentView === "day" ? "default" : "outline"} 
          size="sm"
          onClick={() => onSelectView("day")}
          className="h-8"
        >
          Dia
        </Button>
        <Button 
          variant={currentView === "week" ? "default" : "outline"} 
          size="sm"
          onClick={() => onSelectView("week")}
          className="h-8"
        >
          Semana
        </Button>
        <Button 
          variant={currentView === "month" ? "default" : "outline"} 
          size="sm"
          onClick={() => onSelectView("month")}
          className="h-8 bg-minhagrana-primary text-white"
        >
          Mês
        </Button>
      </div>
    </div>
  );
};
