
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { currencies } from "@/services/currencyService";
import { 
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CurrencyConverterProps {
  onConvert: (source: string, targetCurrencies: string[], amount: number, monthlyOnly: boolean) => void;
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ onConvert }) => {
  const [amount, setAmount] = useState<string>("1000");
  const [sourceCurrency, setSourceCurrency] = useState<string>("USD");
  const [targetCurrencies, setTargetCurrencies] = useState<string[]>(["EUR", "INR"]);
  const [monthlyOnly, setMonthlyOnly] = useState<boolean>(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and decimals
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(value);
  };

  const handleSourceCurrencyChange = (value: string) => {
    setSourceCurrency(value);
    
    // Remove source currency from target currencies if it's selected
    if (targetCurrencies.includes(value)) {
      setTargetCurrencies(targetCurrencies.filter(curr => curr !== value));
    }
  };

  const toggleTargetCurrency = (currency: string) => {
    if (currency === sourceCurrency) return; // Can't select source currency as target
    
    if (targetCurrencies.includes(currency)) {
      setTargetCurrencies(targetCurrencies.filter(curr => curr !== currency));
    } else {
      setTargetCurrencies([...targetCurrencies, currency]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount) || 0;
    onConvert(sourceCurrency, targetCurrencies, numericAmount, monthlyOnly);
  };

  // Filter out source currency from available targets
  const availableTargets = currencies.filter(
    currency => currency.code !== sourceCurrency
  );

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

          <div className="space-y-2">
            <Label>Target Currencies</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                >
                  {targetCurrencies.length === 0 
                    ? "Select target currencies" 
                    : `${targetCurrencies.length} currencies selected`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full bg-white" align="start">
                <DropdownMenuLabel>Select Currencies</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableTargets.map((currency) => (
                  <DropdownMenuCheckboxItem
                    key={currency.code}
                    checked={targetCurrencies.includes(currency.code)}
                    onCheckedChange={() => toggleTargetCurrency(currency.code)}
                  >
                    {currency.symbol} {currency.code} - {currency.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {targetCurrencies.length === 0 && (
              <p className="text-sm text-red-500">Please select at least one target currency</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="monthlyOnly" 
              checked={monthlyOnly} 
              onCheckedChange={(checked) => setMonthlyOnly(checked as boolean)} 
            />
            <Label htmlFor="monthlyOnly" className="cursor-pointer">
              Show monthly rates only (1st of each month)
            </Label>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-brand-blue hover:bg-brand-purple transition-colors"
            disabled={targetCurrencies.length === 0}
          >
            Convert
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CurrencyConverter;
