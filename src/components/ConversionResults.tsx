
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CurrencyRate, formatCurrency, formatDate, currencies } from "@/services/currencyService";

interface ConversionResultsProps {
  sourceAmount: number;
  sourceCurrency: string;
  ratesData: {
    currency: string;
    rates: CurrencyRate[];
  }[];
  loading: boolean;
}

const ConversionResults: React.FC<ConversionResultsProps> = ({
  sourceAmount,
  sourceCurrency,
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

  if (ratesData.length === 0) {
    return null;
  }

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
          dataPoint[item.currency] = sourceAmount * rateForDate.value;
        }
      });
      
      return dataPoint;
    });
  };

  const chartData = processChartData();
  
  // Create color map for currencies
  const colorMap: Record<string, string> = {
    EUR: "#3A86FF", // Blue
    INR: "#8338EC", // Purple
    GBP: "#06D6A0", // Green
    JPY: "#FF006E", // Pink
    CAD: "#FB5607", // Orange
    AUD: "#FFBE0B", // Yellow
  };

  return (
    <Card className="w-full mt-8">
      <CardHeader>
        <CardTitle className="text-center text-brand-dark">
          {sourceAmount.toLocaleString()} {sourceCurrency} Conversion Over Time
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
                    formatter={(value: number, name: string) => [
                      formatCurrency(value, name),
                      name,
                    ]}
                  />
                  <Legend />
                  {ratesData.map((item) => (
                    <Line
                      key={item.currency}
                      type="monotone"
                      dataKey={item.currency}
                      name={`${item.currency} (${currencies.find(c => c.code === item.currency)?.symbol || ''})`}
                      stroke={colorMap[item.currency] || "#8884d8"}
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
                    {ratesData.map((item) => (
                      <th key={item.currency} className="p-2 text-right">
                        {item.currency}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((data, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 text-left">{data.date}</td>
                      {ratesData.map((item) => (
                        <td key={item.currency} className="p-2 text-right">
                          {data[item.currency]
                            ? formatCurrency(data[item.currency], item.currency)
                            : "N/A"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ConversionResults;
