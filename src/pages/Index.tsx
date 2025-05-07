
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import CurrencyConverter from "@/components/CurrencyConverter";
import ConversionResults from "@/components/ConversionResults";
import CurrentRates from "@/components/CurrentRates";
import { fetchHistoricalRates, CurrencyRate, currencies } from "@/services/currencyService";

const Index = () => {
  const { toast } = useToast();
  const [sourceAmount, setSourceAmount] = useState<number>(0);
  const [sourceCurrency, setSourceCurrency] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [ratesData, setRatesData] = useState<{
    currency: string;
    rates: CurrencyRate[];
  }[]>([]);

  const targetCurrencies = currencies
    .filter((currency) => currency.code !== sourceCurrency)
    .map((currency) => currency.code)
    .slice(0, 5); // Limit to 5 target currencies for better visualization

  const handleConvert = async (source: string, amount: number) => {
    setSourceAmount(amount);
    setSourceCurrency(source);
    setLoading(true);

    try {
      // Fetch rates for each target currency
      const fetchPromises = targetCurrencies.map(async (target) => {
        const rates = await fetchHistoricalRates(source, target);
        return {
          currency: target,
          rates,
        };
      });

      const results = await Promise.all(fetchPromises);
      setRatesData(results.filter((result) => result.rates.length > 0));
      
      toast({
        title: "Conversion Complete",
        description: "Historical rates have been fetched successfully.",
      });
    } catch (error) {
      console.error("Error during conversion:", error);
      toast({
        title: "Conversion Failed",
        description: "There was an error fetching the rates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <div className="container py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-brand-dark mb-2">Currency Voyage Tracker</h1>
          <p className="text-muted-foreground">
            Track how your money converts and changes across currencies over time
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          <CurrencyConverter onConvert={handleConvert} />
          
          {ratesData.length > 0 && (
            <CurrentRates
              sourceAmount={sourceAmount}
              sourceCurrency={sourceCurrency}
              ratesData={ratesData}
            />
          )}
          
          <ConversionResults
            sourceAmount={sourceAmount}
            sourceCurrency={sourceCurrency}
            ratesData={ratesData}
            loading={loading}
          />
        </div>

        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>Powered by Wise.com API | Historical Currency Data</p>
          <p className="mt-1">
            &copy; {new Date().getFullYear()} Currency Voyage Tracker
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
