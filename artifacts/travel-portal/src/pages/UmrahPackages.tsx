import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListPackages, getListPackagesQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/AuthContext";
import { useEffect } from "react";
import { Plane, Hotel, Calendar, Users, Star, Filter } from "lucide-react";

export default function UmrahPackages() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [duration, setDuration] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/login");
  }, [isAuthenticated, authLoading]);

  const params: Record<string, string | number> = {};
  if (duration !== "all") params.duration = Number(duration);
  if (minPrice) params.minPrice = Number(minPrice);
  if (maxPrice) params.maxPrice = Number(maxPrice);

  const { data: packages, isLoading } = useListPackages(params, {
    query: { queryKey: getListPackagesQueryKey(params) },
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Umrah Packages</h1>
          <p className="text-muted-foreground text-sm mt-1">Choose from our curated Umrah packages</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Filter className="h-4 w-4" /> Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <div className="min-w-[150px]">
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger data-testid="filter-duration">
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Durations</SelectItem>
                    <SelectItem value="21">21 Days</SelectItem>
                    <SelectItem value="28">28 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input placeholder="Min Price (PKR)" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-40" type="number" data-testid="filter-min-price" />
              <Input placeholder="Max Price (PKR)" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-40" type="number" data-testid="filter-max-price" />
              <Button variant="outline" onClick={() => { setDuration("all"); setMinPrice(""); setMaxPrice(""); }} data-testid="button-clear-filters">Clear Filters</Button>
            </div>
          </CardContent>
        </Card>

        {/* Package Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64" />)
          ) : packages && packages.length > 0 ? (
            packages.map((pkg) => (
              <Card key={pkg.id} className="hover:shadow-md transition-shadow border" data-testid={`card-package-${pkg.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="mb-2 bg-primary text-primary-foreground text-xs">{pkg.duration} Days</Badge>
                      <CardTitle className="text-base leading-tight">{pkg.name}</CardTitle>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">PKR {Number(pkg.price).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">per person</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Hotel className="h-3 w-3" />
                      <span className="truncate">{pkg.hotel}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      {pkg.hotelRating && (
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: pkg.hotelRating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Plane className="h-3 w-3" />
                      <span className="truncate">{pkg.airline}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{pkg.seatsAvailable} seats left</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{pkg.departureDate}</span>
                    </div>
                  </div>
                  {pkg.makkahNights && pkg.madinahNights && (
                    <div className="flex gap-2 text-xs">
                      <Badge variant="outline" className="text-xs">{pkg.makkahNights}N Makkah</Badge>
                      <Badge variant="outline" className="text-xs">{pkg.madinahNights}N Madinah</Badge>
                    </div>
                  )}
                  <Link href={`/umrah-packages/${pkg.id}`}>
                    <Button className="w-full mt-2" size="sm" data-testid={`button-view-package-${pkg.id}`}>View Details & Book</Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">No packages found matching your filters</div>
          )}
        </div>
      </div>
    </Layout>
  );
}
