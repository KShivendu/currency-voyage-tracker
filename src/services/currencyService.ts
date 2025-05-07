
import { toast } from "sonner";

export interface CurrencyRate {
  source: string;
  target: string;
  value: number;
  time: number;
}

// Supported currencies
export const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
];

// Use a proxy server to avoid CORS issues
const PROXY_URL = "https://api.allorigins.win/raw?url=";

/**
 * Fetches historical currency rates from the Wise API
 */
export const fetchHistoricalRates = async (
  source: string,
  target: string,
  length: number = 5,
  resolution: string = "daily",
  unit: string = "year"
): Promise<CurrencyRate[]> => {
  try {
    const encodedUrl = encodeURIComponent(
      `https://wise.com/rates/history+live?source=${source}&target=${target}&length=${length}&resolution=${resolution}&unit=${unit}`
    );
    
    const response = await fetch(`${PROXY_URL}${encodedUrl}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch rates: ${response.statusText}`);
    }
    
    const data: CurrencyRate[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching currency rates:", error);
    toast.error("Failed to fetch currency rates. Please try again.");
    return [];
  }
};

/**
 * Converts an amount from one currency to another based on the provided rate
 */
export const convertCurrency = (amount: number, rate: number): number => {
  return amount * rate;
};

/**
 * Formats a currency amount with the appropriate symbol and decimals
 */
export const formatCurrency = (
  amount: number,
  currencyCode: string,
  decimals: number = 2
): string => {
  const currency = currencies.find((c) => c.code === currencyCode);
  const symbol = currency?.symbol || "";
  
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};

/**
 * Formats a Unix timestamp into a readable date string
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
