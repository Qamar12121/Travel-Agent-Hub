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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/AuthContext";
import { useEffect } from "react";
import {
  Plane, Hotel, Calendar, Users, Star, Filter,
  Eye, MapPin, Check, Moon, ArrowRight, X,
} from "lucide-react";

const AIRLINE_LOGOS: Record<string, string> = {
  "PIA": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Pakistan_International_Airlines_logo.svg",
  "Emirates": "https://upload.wikimedia.org/wikipedia/en/4/4f/Emirates_logo.svg",
  "Qatar Airways": "https://upload.wikimedia.org/wikipedia/commons/7/79/Qatar_airways_logo.svg",
  "Etihad": "https://upload.wikimedia.org/wikipedia/commons/4/49/Etihad-airways-logo.svg",
  "Air Arabia": "https://upload.wikimedia.org/wikipedia/commons/b/b7/Air_Arabia_logo.svg",
  "Turkish Airlines": "https://upload.wikimedia.org/wikipedia/commons/b/b6/Turkish_Airlines_logo_2019_compact.svg",
  "Saudi Airlines": "https://upload.wikimedia.org/wikipedia/commons/5/5c/Saudia_Logo.svg",
  "Saudia": "https://upload.wikimedia.org/wikipedia/commons/5/5c/Saudia_Logo.svg",
  "Flydubai": "https://upload.wikimedia.org/wikipedia/commons/7/70/Flydubai_logo.svg",
  "flydubai": "https://upload.wikimedia.org/wikipedia/commons/7/70/Flydubai_logo.svg",
};

type PkgType = {
  id: number;
  name: string;
  duration: number;
  type: string;
  price: number;
  hotel: string;
  hotelRating?: number | null;
  airline: string;
  departureDate: string;
  returnDate: string;
  seatsAvailable: number;
  description: string;
  inclusions: string[];
  makkahNights?: number | null;
  madinahNights?: number | null;
  makkahHotel?: string | null;
  madinahHotel?: string | null;
  imageUrl?: string | null;
};

function AirlineLogo({ airline }: { airline: string }) {
  const logo = AIRLINE_LOGOS[airline];
  if (!logo) return <span className="text-xs font-semibold text-muted-foreground">{airline}</span>;
  return (
    <img
      src={logo}
      alt={airline}
      className="h-5 max-w-[60px] object-contain"
      onError={(e) => {
        const el = e.currentTarget as HTMLImageElement;
        el.style.display = "none";
        const fallback = el.nextElementSibling as HTMLElement;
        if (fallback) fallback.style.display = "inline";
      }}
    />
  );
}

function QuickViewModal({ pkg, open, onClose }: { pkg: PkgType; open: boolean; onClose: () => void }) {
  const makkahHotel = pkg.makkahHotel || pkg.hotel;
  const madinahHotel = pkg.madinahHotel || "Madinah Hotel";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <Badge className="mb-2 bg-primary text-primary-foreground">{pkg.duration} Days Umrah</Badge>
              <DialogTitle className="text-xl leading-tight">{pkg.name}</DialogTitle>
            </div>
            <div className="text-right ml-4 flex-shrink-0">
              <div className="text-2xl font-black text-primary">PKR {Number(pkg.price).toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">per person</div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">{pkg.description}</p>

          {/* Airline */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border">
            <Plane className="h-4 w-4 text-primary flex-shrink-0" />
            <div className="flex items-center gap-2 flex-1">
              <AirlineLogo airline={pkg.airline} />
              <span className="text-xs font-semibold text-muted-foreground">{pkg.airline}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 inline mr-1" />{pkg.departureDate}
            </div>
          </div>

          {/* Hotels */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border-2 rounded-xl overflow-hidden" style={{ borderColor: "#0d1b3e" }}>
              <div className="px-3 py-2 flex items-center gap-2" style={{ backgroundColor: "#0d1b3e" }}>
                <Hotel className="h-3.5 w-3.5 text-white" />
                <span className="text-white font-bold text-xs">Makkah Hotel</span>
              </div>
              <div className="p-3 space-y-1.5">
                <div className="font-black text-sm" style={{ color: "#0d1b3e" }}>{makkahHotel}</div>
                {pkg.hotelRating && (
                  <div className="flex gap-0.5">
                    {Array.from({ length: pkg.hotelRating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Moon className="h-3 w-3" /> {pkg.makkahNights ?? 0} Nights
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> Near Masjid Al-Haram
                </div>
              </div>
            </div>
            <div className="border-2 rounded-xl overflow-hidden" style={{ borderColor: "#1a7a4a" }}>
              <div className="px-3 py-2 flex items-center gap-2" style={{ backgroundColor: "#1a7a4a" }}>
                <Hotel className="h-3.5 w-3.5 text-white" />
                <span className="text-white font-bold text-xs">Madinah Hotel</span>
              </div>
              <div className="p-3 space-y-1.5">
                <div className="font-black text-sm" style={{ color: "#1a7a4a" }}>{madinahHotel}</div>
                {pkg.hotelRating && (
                  <div className="flex gap-0.5">
                    {Array.from({ length: pkg.hotelRating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Moon className="h-3 w-3" /> {pkg.madinahNights ?? 0} Nights
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> Near Masjid an-Nabawi
                </div>
              </div>
            </div>
          </div>

          {/* Dates & Seats */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-muted/30 text-center">
              <div className="text-xs text-muted-foreground mb-1">Departure</div>
              <div className="font-bold text-xs">{pkg.departureDate}</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 text-center">
              <div className="text-xs text-muted-foreground mb-1">Return</div>
              <div className="font-bold text-xs">{pkg.returnDate}</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 text-center">
              <div className="text-xs text-muted-foreground mb-1">Seats Left</div>
              <div className="font-bold text-xs text-primary">{pkg.seatsAvailable}</div>
            </div>
          </div>

          {/* Inclusions */}
          <div>
            <h4 className="font-bold text-sm mb-2">What's Included</h4>
            <div className="grid grid-cols-2 gap-1.5">
              {(pkg.inclusions as string[]).map((inc, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> {inc}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              <X className="h-4 w-4 mr-2" /> Close
            </Button>
            <Link href={`/umrah-packages/${pkg.id}`} className="flex-1">
              <Button className="w-full">
                Book Now <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function UmrahPackages() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [duration, setDuration] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [previewPkg, setPreviewPkg] = useState<PkgType | null>(null);

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
          <p className="text-muted-foreground text-sm mt-1">Choose from our curated all-inclusive Umrah packages</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72" />)
          ) : packages && packages.length > 0 ? (
            packages.map((pkg) => {
              const makkahHotel = (pkg as PkgType).makkahHotel || pkg.hotel;
              const madinahHotel = (pkg as PkgType).madinahHotel || "Madinah Hotel";
              const airlineLogo = AIRLINE_LOGOS[pkg.airline];

              return (
                <Card
                  key={pkg.id}
                  className="hover:shadow-lg transition-all duration-200 border overflow-hidden group"
                  data-testid={`card-package-${pkg.id}`}
                >
                  {/* Card Top Strip */}
                  <div className="h-1.5 bg-gradient-to-r from-[#0d1b3e] to-[#1a3a7c]" />

                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-[#0d1b3e] text-white text-xs">{pkg.duration} Days</Badge>
                          {pkg.seatsAvailable <= 10 && (
                            <Badge variant="outline" className="text-xs text-red-600 border-red-300">Only {pkg.seatsAvailable} left!</Badge>
                          )}
                        </div>
                        <CardTitle className="text-sm font-black leading-tight">{pkg.name}</CardTitle>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-black text-primary">PKR {Number(pkg.price).toLocaleString()}</div>
                        <div className="text-[10px] text-muted-foreground">per person</div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pb-4">
                    {/* Airline Row */}
                    <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-muted/30 border">
                      <Plane className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      {airlineLogo ? (
                        <img
                          src={airlineLogo}
                          alt={pkg.airline}
                          className="h-4 max-w-[55px] object-contain"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : null}
                      <span className="text-xs font-semibold text-muted-foreground flex-1 truncate">{pkg.airline}</span>
                      <div className="flex items-center gap-0.5">
                        {pkg.hotelRating && Array.from({ length: pkg.hotelRating }).map((_, i) => (
                          <Star key={i} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>

                    {/* Hotels */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-[#0d1b3e]/20 bg-[#0d1b3e]/3 p-2.5">
                        <div className="flex items-center gap-1 mb-1">
                          <Hotel className="h-3 w-3 text-[#0d1b3e]" />
                          <span className="text-[10px] font-black text-[#0d1b3e] uppercase tracking-wide">Makkah</span>
                        </div>
                        <div className="text-xs font-bold leading-tight truncate" title={makkahHotel}>{makkahHotel}</div>
                        {pkg.makkahNights && (
                          <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-0.5">
                            <Moon className="h-2.5 w-2.5" />{pkg.makkahNights}N
                          </div>
                        )}
                      </div>
                      <div className="rounded-lg border border-[#1a7a4a]/20 bg-[#1a7a4a]/3 p-2.5">
                        <div className="flex items-center gap-1 mb-1">
                          <Hotel className="h-3 w-3 text-[#1a7a4a]" />
                          <span className="text-[10px] font-black text-[#1a7a4a] uppercase tracking-wide">Madinah</span>
                        </div>
                        <div className="text-xs font-bold leading-tight truncate" title={madinahHotel}>{madinahHotel}</div>
                        {pkg.madinahNights && (
                          <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-0.5">
                            <Moon className="h-2.5 w-2.5" />{pkg.madinahNights}N
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Date & Seats */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{pkg.departureDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{pkg.seatsAvailable} seats</span>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0 border-[#0d1b3e]/30 text-[#0d1b3e] hover:bg-[#0d1b3e]/5"
                        onClick={() => setPreviewPkg(pkg as PkgType)}
                        data-testid={`button-eye-${pkg.id}`}
                        title="Quick View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Link href={`/umrah-packages/${pkg.id}`} className="flex-1">
                        <Button
                          className="w-full"
                          size="sm"
                          data-testid={`button-view-package-${pkg.id}`}
                        >
                          Book Now <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <Filter className="h-8 w-8 mx-auto mb-3 opacity-30" />
              <p>No packages found matching your filters</p>
            </div>
          )}
        </div>

        {/* Quick View Modal */}
        {previewPkg && (
          <QuickViewModal
            pkg={previewPkg}
            open={!!previewPkg}
            onClose={() => setPreviewPkg(null)}
          />
        )}
      </div>
    </Layout>
  );
}
