
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LegendType } from "recharts";
import { CurrencyRate, formatCurrency, formatDate, currencies } from "@/services/currencyService";

interface SourceData {
  currency: string;
  amount: number;
}

interface ConversionResultsProps {
  sources: SourceData[];
  ratesData: {
    currency: string;
    rates: CurrencyRate[];
    sourceIndex: number;
  }[];
  loading: boolean;
}

const ConversionResults: React.FC<ConversionResultsProps> = ({
  sources,
  ratesData,
  loading,
}) => {
  if (loading) {
    return (
      <Card className="w-full mt-8">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (ratesData.length === 0 || sources.length === 0) {
    return null;
  }

  const isCompareMode = sources.length > 1;

  // Process data for the chart
  const processChartData = () => {
    // Find the earliest date across all currencies
    const allDates = ratesData.flatMap(item => item.rates.map(rate => rate.time));
    const uniqueDates = [...new Set(allDates)].sort();

    return uniqueDates.map(date => {
      const dataPoint: any = { date: formatDate(date) };

      ratesData.forEach(item => {
        const rateForDate = item.rates.find(rate => rate.time === date);

        if (rateForDate) {
          // Create a unique key for each source-target combination
          const source = sources[item.sourceIndex];
          const key = `${source.currency}_${source.amount}_to_${item.currency}`;

          dataPoint[key] = source.amount * rateForDate.value;
        }
      });

      return dataPoint;
    });
  };

  const chartData = processChartData();

  // Create color map for data series
  const colors = [
    "#3A86FF", // Blue
    "#8338EC", // Purple
    "#06D6A0", // Green
    "#FF006E", // Pink
    "#FB5607", // Orange
    "#FFBE0B", // Yellow
  ];

  // Create a mapping for display names
  const getSeriesName = (key: string) => {
    const [sourceCurrency, sourceAmount, _, targetCurrency] = key.split('_');
    return `${sourceAmount} ${sourceCurrency} → ${targetCurrency}`;
  };

  // Get unique data series
  const dataSeries = Object.keys(chartData[0] || {})
    .filter(key => key !== 'date')
    .map((key, index) => ({
      key,
      name: getSeriesName(key),
      color: colors[index % colors.length]
    }));

  // Helper function to calculate difference between two amounts for the same target currency
  const calculateDifference = (data: any, targetCurrency: string) => {
    if (!isCompareMode) return null;

    const source1Key = `${sources[0].currency}_${sources[0].amount}_to_${targetCurrency}`;
    const source2Key = `${sources[1].currency}_${sources[1].amount}_to_${targetCurrency}`;

    const amount1 = data[source1Key];
    const amount2 = data[source2Key];

    if (amount1 !== undefined && amount2 !== undefined && amount1 !== null && amount2 !== null) {
      return amount1 - amount2;
    }
    return null;
  };

  // Get unique target currencies for table headers
  const uniqueTargetCurrencies = Array.from(new Set(ratesData.map(item => item.currency)));

  return (
    <Card className="w-full mt-8">
      <CardHeader>
        <CardTitle className="text-center text-brand-dark">
          Currency Conversion Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>

          {/* Chart View */}
          <TabsContent value="chart" className="pt-4">
            <div className="w-full h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number, name: string, props: any) => {
                      const key = props.dataKey;
                      const targetCurrency = key.split('_').pop();
                      return [formatCurrency(value, targetCurrency), getSeriesName(key)];
                    }}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend
                    formatter={(value, entry, index) => {
                      // Fix: Use entry.value instead of entry.dataKey
                      if (entry && typeof entry.value === 'string') {
                        return getSeriesName(entry.value);
                      }
                      return value;
                    }}
                  />
                  {dataSeries.map((series) => (
                    <Line
                      key={series.key}
                      type="monotone"
                      dataKey={series.key}
                      name={series.name}
                      stroke={series.color}
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Table View */}
          <TabsContent value="table" className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-brand-light border-b">
                    <th className="p-2 text-left">Date</th>
                    {dataSeries.map((series) => (
                      <th key={series.key} className="p-2 text-right">
                        {series.name}
                      </th>
                    ))}
                    {isCompareMode && uniqueTargetCurrencies.map((currency) => (
                      <th key={`diff-${currency}`} className="p-2 text-right bg-yellow-50">
                        Difference ({currency})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((data, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 text-left">{data.date}</td>
                      {dataSeries.map((series) => {
                        const targetCurrency = series.key.split('_').pop();
                        return (
                          <td key={series.key} className="p-2 text-right">
                            {data[series.key]
                              ? formatCurrency(data[series.key], targetCurrency)
                              : "N/A"}
                          </td>
                        );
                      })}
                      {isCompareMode && uniqueTargetCurrencies.map((currency) => {
                        const difference = calculateDifference(data, currency);
                        return (
                          <td key={`diff-${currency}`} className={`p-2 text-right font-medium bg-yellow-50 ${
                            difference && difference > 0 ? 'text-green-600' :
                            difference && difference < 0 ? 'text-red-600' : ''
                          }`}>
                            {difference !== null
                              ? (difference > 0 ? '+' : '') + formatCurrency(Math.abs(difference), currency)
                              : "N/A"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Total Difference Row */}
              {isCompareMode && (
                <div className="mt-4 p-4 bg-yellow-50 rounded">
                  <div className="font-semibold mb-2 text-brand-dark">Total Difference Summary</div>
                  <div className="flex flex-wrap gap-6">
                    {uniqueTargetCurrencies.map((currency) => {
                      // Sum absolute differences for this currency across all dates
                      const totalDiff = chartData.reduce((sum: number, data: any) => {
                        const diff = calculateDifference(data, currency as string);
                        return sum + (diff !== null ? Math.abs(diff) : 0);
                      }, 0);
                      return (
                        <div key={`total-diff-${currency}`} className="text-sm">
                          <span className="font-medium">{currency}:</span> {formatCurrency(Number(totalDiff), String(currency))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ConversionResults;
