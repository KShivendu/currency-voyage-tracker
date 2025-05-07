
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { currencies } from "@/services/currencyService";

interface CurrencyConverterProps {
  onConvert: (source: string, amount: number) => void;
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ onConvert }) => {
  const [amount, setAmount] = useState<string>("1000");
  const [sourceCurrency, setSourceCurrency] = useState<string>("USD");

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and decimals
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(value);
  };

  const handleSourceCurrencyChange = (value: string) => {
    setSourceCurrency(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount) || 0;
    onConvert(sourceCurrency, numericAmount);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-brand-dark">Currency Converter</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter amount"
              className="border-brand-blue focus:ring-brand-purple"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sourceCurrency">Source Currency</Label>
            <Select
              value={sourceCurrency}
              onValueChange={handleSourceCurrencyChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-brand-blue hover:bg-brand-purple transition-colors"
          >
            Convert
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CurrencyConverter;
