import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { MailCheck, ChevronRight, Building2, Briefcase, TrendingUp, BarChart2, PieChart } from "lucide-react";

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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    
    toast({
      title: "Successfully subscribed!",
      description: "You'll receive updates for your selected sectors soon.",
    });
    
    form.reset();
    setSelectedSectors([]);
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
            Financial Intelligence at Your Fingertips
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Stay ahead of market trends with curated insights from industry experts. Get real-time updates and in-depth analysis across multiple sectors.
          </p>
          <div className="flex justify-center gap-4">
            <TrendingUp className="h-16 w-16 text-blue-500" />
            <BarChart2 className="h-16 w-16 text-green-500" />
            <PieChart className="h-16 w-16 text-purple-500" />
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-blue-50 rounded-2xl p-6 mb-6 inline-block">
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Market Insights</h3>
              <p className="text-gray-600">Get daily updates on market trends and expert analysis</p>
            </div>
            <div className="text-center">
              <div className="bg-green-50 rounded-2xl p-6 mb-6 inline-block">
                <BarChart2 className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Sector Analysis</h3>
              <p className="text-gray-600">Deep dive into sector-specific opportunities and risks</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-50 rounded-2xl p-6 mb-6 inline-block">
                <PieChart className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Portfolio Insights</h3>
              <p className="text-gray-600">Tailored recommendations for your investment strategy</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-b from-gray-50 to-gray-100">
        <Card className="w-full max-w-2xl mx-auto p-8 space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Stay Ahead in Financial Markets
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Get curated insights and analysis for your preferred sectors delivered straight to your inbox.
            </p>
          </div>

          <div className="grid gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Email Address
              </label>
              <div className="relative">
                <Input
                  placeholder="you@example.com"
                  type="email"
                  className="pr-10"
                  {...form.register("email")}
                />
                <MailCheck className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700 block">
                Select Sectors
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sectors.map((sector) => (
                  <div
                    key={sector.id}
                    className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
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
                        <Building2 className="h-4 w-4" />
                      ) : (
                        <Briefcase className="h-4 w-4" />
                      )}
                      {sector.label}
                    </label>
                  </div>
                ))}
              </div>
              {form.formState.errors.sectors && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.sectors.message}
                </p>
              )}
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
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

          <div className="text-center text-sm text-gray-500">
            By subscribing, you agree to receive sector-specific financial news and updates.
            <br />
            You can unsubscribe at any time.
          </div>
        </Card>
      </section>
    </div>
  );
}
