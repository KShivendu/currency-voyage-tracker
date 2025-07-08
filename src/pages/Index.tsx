import React, { useState } from "react";
import { DateRange } from "react-day-picker";
import { useToast } from "@/components/ui/use-toast";
import CurrencyConverter from "@/components/CurrencyConverter";
import ConversionResults from "@/components/ConversionResults";
import CurrentRates from "@/components/CurrentRates";
import { fetchHistoricalRates, CurrencyRate, currencies } from "@/services/currencyService";

interface SourceData {
  currency: string;
  amount: number;
}

interface RatesData {
  currency: string;
  rates: CurrencyRate[];
  sourceIndex: number;
}

const Index = () => {
  const { toast } = useToast();
  const [sources, setSources] = useState<SourceData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [ratesData, setRatesData] = useState<RatesData[]>([]);
  const [monthlyOnly, setMonthlyOnly] = useState<boolean>(false);

  const handleConvert = async (
    sourcesData: SourceData[],
    targetCurrencies: string[], 
    showMonthlyOnly: boolean,
    dateRange?: DateRange
  ) => {
    setSources(sourcesData);
    setLoading(true);
    setMonthlyOnly(showMonthlyOnly);

    try {
      // For each source and target currency combination, fetch rates
      const fetchPromises: Promise<RatesData>[] = [];

      // Loop through each source currency
      sourcesData.forEach((source, sourceIndex) => {
        // For each source, fetch rates for all target currencies
        targetCurrencies.forEach(target => {
          fetchPromises.push(
            fetchHistoricalRates(source.currency, target, dateRange)
              .then(rates => ({
                currency: target,
                rates: showMonthlyOnly ? filterMonthlyRates(rates) : rates,
                sourceIndex
              }))
          );
        });
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

  // Filter rates to show only the 1st of each month
  const filterMonthlyRates = (rates: CurrencyRate[]): CurrencyRate[] => {
    const monthlyRates: CurrencyRate[] = [];
    const monthsAdded = new Set<string>();

    // Sort rates by time (oldest first)
    const sortedRates = [...rates].sort((a, b) => a.time - b.time);

    sortedRates.forEach(rate => {
      const date = new Date(rate.time);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      // Only keep the first rate of each month (which should be closest to the 1st)
      if (!monthsAdded.has(monthYear)) {
        monthsAdded.add(monthYear);
        monthlyRates.push(rate);
      }
    });

    return monthlyRates;
  };

  // Group rates by target currency
  const getCurrentRatesData = () => {
    if (sources.length === 0 || ratesData.length === 0) {
      return [];
    }

    const uniqueTargets = Array.from(new Set(ratesData.map(data => data.currency)));
    
    return uniqueTargets.map(target => {
      const dataForTarget = ratesData.filter(data => data.currency === target);
      return {
        currency: target,
        sources: dataForTarget.map(data => ({
          sourceIndex: data.sourceIndex,
          rate: data.rates[data.rates.length - 1],
          source: sources[data.sourceIndex]
        }))
      };
    });
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
              sources={sources}
              currentRatesData={getCurrentRatesData()}
            />
          )}
          
          <ConversionResults
            sources={sources}
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
