
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CurrencyConverterProps {
  onConvert: (
    sources: Array<{currency: string, amount: number}>, 
    targetCurrencies: string[], 
    monthlyOnly: boolean
  ) => void;
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ onConvert }) => {
  const [mode, setMode] = useState<"single" | "compare">("single");
  
  // Source 1
  const [amount1, setAmount1] = useState<string>("1000");
  const [sourceCurrency1, setSourceCurrency1] = useState<string>("USD");
  
  // Source 2 (for comparison)
  const [amount2, setAmount2] = useState<string>("5000");
  const [sourceCurrency2, setSourceCurrency2] = useState<string>("EUR");
  
  const [targetCurrencies, setTargetCurrencies] = useState<string[]>(["INR"]);
  const [monthlyOnly, setMonthlyOnly] = useState<boolean>(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, sourceIndex: number) => {
    // Allow only numbers and decimals
    const value = e.target.value.replace(/[^0-9.]/g, "");
    if (sourceIndex === 1) {
      setAmount1(value);
    } else {
      setAmount2(value);
    }
  };

  const handleSourceCurrencyChange = (value: string, sourceIndex: number) => {
    if (sourceIndex === 1) {
      setSourceCurrency1(value);
    } else {
      setSourceCurrency2(value);
    }
    
    // Remove source currency from target currencies if it's selected
    if (targetCurrencies.includes(value)) {
      setTargetCurrencies(targetCurrencies.filter(curr => curr !== value));
    }
  };

  const toggleTargetCurrency = (currency: string) => {
    // Can't select source currency as target
    if (currency === sourceCurrency1 || (mode === "compare" && currency === sourceCurrency2)) return;
    
    if (targetCurrencies.includes(currency)) {
      setTargetCurrencies(targetCurrencies.filter(curr => curr !== currency));
    } else {
      setTargetCurrencies([...targetCurrencies, currency]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "single") {
      // Single mode - convert one amount
      const numericAmount = parseFloat(amount1) || 0;
      onConvert(
        [{currency: sourceCurrency1, amount: numericAmount}], 
        targetCurrencies, 
        monthlyOnly
      );
    } else {
      // Compare mode - convert two amounts
      const numericAmount1 = parseFloat(amount1) || 0;
      const numericAmount2 = parseFloat(amount2) || 0;
      onConvert(
        [
          {currency: sourceCurrency1, amount: numericAmount1},
          {currency: sourceCurrency2, amount: numericAmount2}
        ], 
        targetCurrencies, 
        monthlyOnly
      );
    }
  };

  // Filter out source currencies from available targets
  const getAvailableTargets = () => {
    if (mode === "single") {
      return currencies.filter(currency => currency.code !== sourceCurrency1);
    } else {
      return currencies.filter(
        currency => currency.code !== sourceCurrency1 && currency.code !== sourceCurrency2
      );
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-brand-dark">Currency Converter</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs 
            value={mode} 
            onValueChange={(value) => setMode(value as "single" | "compare")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Amount</TabsTrigger>
              <TabsTrigger value="compare">Compare Amounts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="single" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="amount1">Amount</Label>
                <Input
                  id="amount1"
                  type="text"
                  value={amount1}
                  onChange={(e) => handleAmountChange(e, 1)}
                  placeholder="Enter amount"
                  className="border-brand-blue focus:ring-brand-purple"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sourceCurrency1">Source Currency</Label>
                <Select
                  value={sourceCurrency1}
                  onValueChange={(value) => handleSourceCurrencyChange(value, 1)}
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
            </TabsContent>
            
            <TabsContent value="compare" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Source */}
                <div className="space-y-2">
                  <Label htmlFor="amount1">Amount 1</Label>
                  <Input
                    id="amount1"
                    type="text"
                    value={amount1}
                    onChange={(e) => handleAmountChange(e, 1)}
                    placeholder="Enter amount"
                    className="border-brand-blue focus:ring-brand-purple"
                  />
                  <Select
                    value={sourceCurrency1}
                    onValueChange={(value) => handleSourceCurrencyChange(value, 1)}
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
                
                {/* Second Source */}
                <div className="space-y-2">
                  <Label htmlFor="amount2">Amount 2</Label>
                  <Input
                    id="amount2"
                    type="text"
                    value={amount2}
                    onChange={(e) => handleAmountChange(e, 2)}
                    placeholder="Enter amount"
                    className="border-brand-blue focus:ring-brand-purple"
                  />
                  <Select
                    value={sourceCurrency2}
                    onValueChange={(value) => handleSourceCurrencyChange(value, 2)}
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
              </div>
            </TabsContent>
          </Tabs>

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
                {getAvailableTargets().map((currency) => (
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
            {mode === "single" ? "Convert" : "Compare"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CurrencyConverter;
