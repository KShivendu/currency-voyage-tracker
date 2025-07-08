
import { toast } from "sonner";
import { DateRange } from "react-day-picker";

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
// const PROXY_URL = "https://api.allorigins.win/raw?url=";
const PROXY_URL = "https://cors-anywhere.herokuapp.com/";

/**
 * Fetches historical currency rates from the Wise API
 */
export const fetchHistoricalRates = async (
  source: string,
  target: string,
  dateRange?: DateRange,
  resolution: string = "daily"
): Promise<CurrencyRate[]> => {
  try {
    let url: string;

    if (dateRange?.from && dateRange?.to) {
      // Calculate the time difference for length and unit
      const timeDiff = dateRange.to.getTime() - dateRange.from.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      // Calculate how far back the end date is from today
      const today = new Date();
      const endDiff = Math.ceil((today.getTime() - dateRange.to.getTime()) / (1000 * 3600 * 24));

      let length: number;
      let unit: string;

      if (daysDiff <= 30) {
        // For daily, fetch enough days to cover from today back to the requested start
        length = daysDiff + endDiff + 1; // +1 to be inclusive
        unit = "day";
      } else if (daysDiff <= 365) {
        // For monthly, fetch enough months to cover from today back to the requested start
        const monthsDiff = Math.ceil(daysDiff / 30);
        const endMonthsDiff = Math.ceil(endDiff / 30);
        length = monthsDiff + endMonthsDiff + 1;
        unit = "month";
      } else {
        // For yearly, fetch enough years to cover from today back to the requested start
        const yearsDiff = Math.ceil(daysDiff / 365);
        const endYearsDiff = Math.ceil(endDiff / 365);
        length = yearsDiff + endYearsDiff + 1;
        unit = "year";
      }

      url = `https://wise.com/rates/history+live?source=${source}&target=${target}&length=${length}&resolution=${resolution}&unit=${unit}`;
    } else {
      // Default to 1 year of data
      url = `https://wise.com/rates/history+live?source=${source}&target=${target}&length=1&resolution=${resolution}&unit=year`;
    }

    const response = await fetch(`${PROXY_URL}${url}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch rates: ${response.statusText}`);
    }

    let data: CurrencyRate[] = await response.json();

    // Filter data by date range if specified
    if (dateRange?.from && dateRange?.to) {
      const fromTime = dateRange.from.getTime();
      const toTime = dateRange.to.getTime();

      data = data.filter(rate =>
        rate.time >= fromTime && rate.time <= toTime
      );
    }

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
