import React, { useEffect, useState } from "react";

interface Ticker {
  symbol: string;
  change: string;
  color: string;
}

const initialTickers: Ticker[] = [
  { symbol: "AAPL", change: "+1.34%", color: "text-green-500" },
  { symbol: "TSLA", change: "-0.56%", color: "text-red-500" },
  { symbol: "NVDA", change: "+3.12%", color: "text-green-500" },
];


const TrendingTickers: React.FC = () => {
  return (
    <div className="p-6 text-white bg-black">
      <p>Hello from Trending Tickers!</p>
    </div>
  );
};

// export default TrendingTickers;

// const TrendingTickers: React.FC = () => {
//   const [data, setData] = useState<Ticker[]>(initialTickers);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setData(prev =>
//         prev.map(ticker => {
//           const rand = (Math.random() * 2 - 1).toFixed(2);
//           const num = parseFloat(rand);
//           return {
//             ...ticker,
//             change: `${num > 0 ? "+" : ""}${num}%`,
//             color: num > 0 ? "text-green-500" : "text-red-500",
//           };
//         })
//       );
//     }, 3000);

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="bg-muted p-6 rounded-xl shadow-lg w-full max-w-md mx-auto">
//       <h3 className="text-sm font-semibold text-muted-foreground">Trending Tickers</h3>
//       <ul className="mt-2 space-y-2 text-base font-medium">
//         {data.map((ticker, idx) => (
//           <li key={idx}>
//             <span className={`${ticker.color} font-bold`}>{ticker.symbol}</span> {ticker.change}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

export default TrendingTickers;
