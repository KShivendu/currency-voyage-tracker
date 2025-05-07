
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, DollarSign, Euro, IndianRupee } from "lucide-react";
import { CurrencyRate, formatCurrency } from "@/services/currencyService";

interface SourceData {
  currency: string;
  amount: number;
}

interface CurrentRatesProps {
  sources: SourceData[];
  currentRatesData: {
    currency: string;
    sources: {
      sourceIndex: number;
      rate: CurrencyRate;
      source: SourceData;
    }[];
  }[];
}

const CurrentRates: React.FC<CurrentRatesProps> = ({ sources, currentRatesData }) => {
  if (currentRatesData.length === 0) {
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
        return <IndianRupee className="h-6 w-6" />;
      default:
        return <DollarSign className="h-6 w-6" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
      {currentRatesData.map((targetData) => (
        <Card key={targetData.currency} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-lg font-medium">{targetData.currency}</CardTitle>
            <div className="rounded-md p-1 bg-gray-100">
              {getCurrencyIcon(targetData.currency)}
            </div>
          </CardHeader>
          <CardContent>
            {targetData.sources.map((sourceData, idx) => {
              const { rate, source } = sourceData;
              // For comparison, we need to get the previous rate to show trend
              const previousSourceData = currentRatesData
                .find(d => d.currency === targetData.currency)
                ?.sources
                .find(s => s.sourceIndex === sourceData.sourceIndex);
              
              const previousRate = previousSourceData?.rate;
              
              // Calculate if the rate has increased or decreased
              const isIncreasing = rate && previousRate ? rate.value > previousRate.value : false;
              const percentChange = rate && previousRate
                ? ((rate.value - previousRate.value) / previousRate.value) * 100
                : 0;
              
              // Calculate the converted amount
              const convertedAmount = rate ? source.amount * rate.value : 0;

              return (
                <div key={idx} className={idx > 0 ? "mt-4 pt-4 border-t" : ""}>
                  <div className="text-sm text-muted-foreground">
                    {source.amount.toLocaleString()} {source.currency}:
                  </div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(convertedAmount, targetData.currency)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Rate: {rate?.value.toFixed(4)}
                  </p>
                  {previousRate && (
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
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CurrentRates;
