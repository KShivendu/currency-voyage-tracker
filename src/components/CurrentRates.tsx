
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, DollarSign, Euro, CurrencyRupee } from "lucide-react";
import { CurrencyRate, formatCurrency } from "@/services/currencyService";

interface CurrentRatesProps {
  sourceAmount: number;
  sourceCurrency: string;
  ratesData: {
    currency: string;
    rates: CurrencyRate[];
  }[];
}

const CurrentRates: React.FC<CurrentRatesProps> = ({
  sourceAmount,
  sourceCurrency,
  ratesData,
}) => {
  if (ratesData.length === 0) {
    return null;
  }

  // Get icon based on currency code
  const getCurrencyIcon = (code: string) => {
    switch (code) {
      case "USD":
        return <DollarSign className="h-6 w-6" />;
      case "EUR":
        return <Euro className="h-6 w-6" />;
      case "INR":
        return <CurrencyRupee className="h-6 w-6" />;
      default:
        return <DollarSign className="h-6 w-6" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
      {ratesData.map((item) => {
        // Get the most recent rate
        const latestRate = item.rates[item.rates.length - 1];
        const previousRate = item.rates[item.rates.length - 2];
        
        // Calculate if the rate has increased or decreased
        const isIncreasing = latestRate && previousRate ? latestRate.value > previousRate.value : false;
        const percentChange = latestRate && previousRate
          ? ((latestRate.value - previousRate.value) / previousRate.value) * 100
          : 0;
        
        // Calculate the converted amount
        const convertedAmount = latestRate ? sourceAmount * latestRate.value : 0;

        return (
          <Card key={item.currency} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg font-medium">{item.currency}</CardTitle>
              <div 
                className={`rounded-md p-1 ${
                  isIncreasing ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {getCurrencyIcon(item.currency)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(convertedAmount, item.currency)}
              </div>
              <p className="text-xs text-muted-foreground">
                Rate: {latestRate?.value.toFixed(4)}
              </p>
              <div className="flex items-center space-x-1 mt-1">
                {isIncreasing ? (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={`text-sm ${
                    isIncreasing ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {Math.abs(percentChange).toFixed(2)}%
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CurrentRates;
