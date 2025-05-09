import React from "react";
import { ChartLine, Rocket, Loader, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { MailCheck, ChevronRight, Building2, Briefcase, TrendingUp, BarChart2, PieChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchStockQuotes, StockQuote } from "@/integrations/alpha-vantage/client";


const sectors = [
  { id: "tech", label: "Technology" },
  { id: "finance", label: "Banking & Finance" },
  { id: "health", label: "Healthcare" },
  { id: "energy", label: "Energy & Utilities" },
  { id: "consumer", label: "Consumer Goods" },
  { id: "real-estate", label: "Real Estate" },
];

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  sectors: z.array(z.string()).min(1, "Please select at least one sector"),
});

const DEFAULT_STOCKS = [
  { symbol: "AAPL", price: 175.04, change: 1.23, changePercent: 0.71 },
  { symbol: "MSFT", price: 415.32, change: -0.45, changePercent: -0.11 },
  { symbol: "GOOGL", price: 142.56, change: 0.78, changePercent: 0.55 },
  { symbol: "AMZN", price: 178.75, change: 2.15, changePercent: 1.22 },
  { symbol: "META", price: 485.58, change: -1.02, changePercent: -0.21 },
];

// Update StockTicker component
const StockTicker = () => {
  const [stocks, setStocks] = useState<StockQuote[]>(DEFAULT_STOCKS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];

  const fetchStocks = async () => {
    try {
      const quotes = await fetchStockQuotes(symbols);
      setStocks(quotes);
      setError(null);
    } catch (err) {
      console.error('Error in fetchStocks:', err);
      setError('Failed to fetch live market data');
      setStocks(DEFAULT_STOCKS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-secondary/40 rounded-2xl p-8 h-full flex items-center justify-center shadow-lg">
        <div className="flex items-center space-x-2 text-muted-foreground font-finlist">
          <Loader className="animate-spin h-5 w-5" />
          <span>Loading market data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary/40 rounded-2xl p-8 shadow-lg w-full max-w-xs font-finlist">
      <div className="divide-y divide-border/20">
        {stocks.map((stock, idx) => (
          <div key={stock.symbol} className={`flex justify-between items-center py-5 ${idx === 0 ? '' : 'mt-1'}`}> 
            <div className={`flex items-center gap-8`}>
              <span className="font-bold text-2xl text-foreground tracking-wide">{stock.symbol}</span>
              <span className="font-mono text-2xl text-gray-100">${stock.price.toFixed(2)}</span>
              <span className={`flex items-center font-bold text-xl ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stock.changePercent >= 0 ? <ArrowUpRight className="h-6 w-6 mr-1" /> : <ArrowDownRight className="h-6 w-6 mr-1" />}
                {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Index() {
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      sectors: [],
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('finlist')
        .insert([
          {
            email: data.email,
            selected_sectors: data.sectors
          }
        ]);

      if (error) throw error;

      toast({
        title: "Successfully subscribed!",
        description: "You'll receive updates for your selected sectors soon.",
      });
      
      form.reset();
      setSelectedSectors([]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Subscription failed",
        description: "There was a problem subscribing to the newsletter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSector = (sectorId: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sectorId)
        ? prev.filter((id) => id !== sectorId)
        : [...prev, sectorId]
    );
    form.setValue("sectors", selectedSectors);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-finlist">
      <header className="bg-background border-b border-border/10 py-4 md:py-6 sticky top-0 z-50 glass-morphism">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <ChartLine className="h-8 w-8 text-finlist-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">
              FinList
            </h1>
          </div>
          <nav className="hidden md:flex space-x-6 text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#sectors" className="hover:text-primary transition-colors">Sectors</a>
            <a href="#newsletter" className="hover:text-primary transition-colors">Newsletter</a>
          </nav>
          <Rocket className="h-6 w-6 text-finlist-accent hidden md:block" />
        </div>
      </header>

      <section className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center min-h-[400px]">
          
          {/* Left Column */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight animated-gradient">
              Financial Intelligence Redefined
            </h1>
            <p className="text-xl text-muted-foreground">
              Get cutting-edge insights and expert analysis across multiple sectors. Stay ahead of market trends with our curated financial newsletter.
              <br />
              <br />
              <span className="text-primary font-semibold">Subscribe now</span> to receive tailored updates directly to your inbox.
            </p>
          </div>

          {/* Right Column - Stock Ticker */}
          <div className="hidden md:flex flex-col items-center justify-center h-full w-full">
            <StockTicker />
          </div>
        </div>
      </section>


      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              icon: TrendingUp, 
              title: "Market Insights", 
              description: "Daily updates on global market trends and expert analysis",
              color: "text-blue-500"
            },
            { 
              icon: BarChart2, 
              title: "Sector Analysis", 
              description: "Deep dive into sector-specific opportunities and risks",
              color: "text-green-500"
            },
            { 
              icon: PieChart, 
              title: "Portfolio Insights", 
              description: "Tailored recommendations for your investment strategy",
              color: "text-purple-500"
            }
          ].map(({ icon: Icon, title, description, color }) => (
            <div key={title} className="bg-secondary/30 rounded-2xl p-6 space-y-4 hover:bg-secondary/50 transition-colors">
              <div className={`rounded-full p-4 inline-block ${color} bg-opacity-10`}>
                <Icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 md:py-24">
        <Card className="w-full max-w-2xl mx-auto p-8 space-y-8 bg-secondary/30 border-none">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Stay Ahead in Financial Markets
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Get curated insights and analysis for your preferred sectors delivered straight to your inbox.
            </p>
          </div>

          <div className="grid gap-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Email Address
              </label>
              <div className="relative">
                <Input
                  placeholder="you@example.com"
                  type="email"
                  className="pr-30 bg-transparent"
                  {...form.register("email")}
                />
                <MailCheck className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground block">
                Select Sectors
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sectors.map((sector) => (
                  <div
                    key={sector.id}
                    className="flex items-center space-x-3 border border-border/30 rounded-lg p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                    onClick={() => toggleSector(sector.id)}
                  >
                    <Checkbox
                      id={sector.id}
                      checked={selectedSectors.includes(sector.id)}
                      onCheckedChange={() => toggleSector(sector.id)}
                    />
                    <label
                      htmlFor={sector.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                    >
                      {sector.id === "tech" || sector.id === "finance" ? (
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                      )}
                      {sector.label}
                    </label>
                  </div>
                ))}
              </div>
              {form.formState.errors.sectors && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.sectors.message}
                </p>
              )}
            </div>

            <Button
              className="w-full"
              onClick={() => onSubmit(form.getValues())}
              disabled={isLoading}
            >
              {isLoading ? (
                "Subscribing..."
              ) : (
                <>
                  Subscribe to Updates
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            By subscribing, you agree to receive sector-specific financial news and updates.
            <br />
            You can unsubscribe at any time.
          </div>
        </Card>
      </section>
    </div>
  );
}
