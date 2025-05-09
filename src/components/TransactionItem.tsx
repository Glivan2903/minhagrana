import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type TransactionType = "receita" | "despesa";

type TransactionItemProps = {
  title: string;
  amount: number;
  date: Date;
  type: TransactionType;
  category?: string;
};

export const TransactionItem: React.FC<TransactionItemProps> = ({
  title,
  amount,
  date,
  type,
  category,
}) => {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0 border-gray-100">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${type === "receita" ? "bg-minhagrana-primary" : "bg-minhagrana-danger"}`} />
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span>{typeof date === 'string' ? date : format(date, "dd/MM/yyyy")}</span>
            {category && (
              <>
                <span>•</span>
                <span>{category}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className={`font-medium ${type === "receita" ? "text-minhagrana-primary" : "text-minhagrana-danger"}`}>
        {type === "receita" ? "+" : "-"} R$ {amount.toFixed(2)}
      </div>
    </div>
  );
};
