import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  useListKsaGroups, getListKsaGroupsQueryKey,
  useListUaeGroups, getListUaeGroupsQueryKey,
  useListAllGroups, getListAllGroupsQueryKey,
  useListUmrahTickets, getListUmrahTicketsQueryKey,
} from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/AuthContext";
import { Plane, Clock, Users, Luggage, Filter, Utensils, ArrowRight, Calendar, Tag, ChevronRight } from "lucide-react";

type PageType = "ksa" | "uae" | "all" | "umrah";

interface FlightGroupsProps { type: PageType; }

const PAGE_CONFIG: Record<PageType, { title: string; subtitle: string; description: string; flag?: string }> = {
  ksa: {
    title: "KSA One Way Groups",
    subtitle: "Pakistan → Saudi Arabia",
    description: "Direct group flights from Pakistan to Jeddah & Riyadh — perfect for Umrah pilgrims",
    flag: "🇸🇦",
  },
  uae: {
    title: "UAE One Way Groups",
    subtitle: "Pakistan → United Arab Emirates",
    description: "Affordable group flights to Dubai, Abu Dhabi & Sharjah",
    flag: "🇦🇪",
  },
  all: {
    title: "All Flight Groups",
    subtitle: "All Destinations",
    description: "Browse all available group flights — KSA, UAE, and Umrah routes",
  },
  umrah: {
    title: "Umrah Air Tickets",
    subtitle: "Individual Umrah Tickets",
    description: "Individual air tickets specially curated for Umrah pilgrims — all major airlines",
    flag: "🕋",
  },
};

const DETAIL_PATHS: Record<PageType, string> = {
  ksa: "/ksa-groups",
  uae: "/uae-groups",
  all: "/all-groups",
  umrah: "/umrah-tickets",
};

const AIRLINE_COLORS: Record<string, { bg: string; text: string }> = {
  PK: { bg: "#006233", text: "#ffffff" },
  SV: { bg: "#006400", text: "#ffffff" },
  EK: { bg: "#d4a017", text: "#c8102e" },
  QR: { bg: "#5c0632", text: "#ffffff" },
  TK: { bg: "#c8102e", text: "#ffffff" },
  EY: { bg: "#b8860b", text: "#ffffff" },
  FZ: { bg: "#e67e22", text: "#ffffff" },
  WY: { bg: "#00857a", text: "#ffffff" },
  G9: { bg: "#7f1d1d", text: "#ffffff" },
  PA: { bg: "#1a3a7c", text: "#ffffff" },
};

function AirlineBadge({ code, name }: { code: string; name: string }) {
  const colors = AIRLINE_COLORS[code] || { bg: "#0d1b3e", text: "#ffffff" };
  return (
    <div
      className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black shadow-sm"
      style={{ backgroundColor: colors.bg, color: colors.text }}
      title={name}
    >
      {code}
    </div>
  );
}

function FlightTimeline({ departure, arrival, duration, stops, originCode, destinationCode, origin, destination }: {
  departure: string; arrival: string; duration: string; stops: number | null;
  originCode: string; destinationCode: string; origin: string; destination: string;
}) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="text-center min-w-[64px]">
        <div className="text-2xl font-black tabular-nums tracking-tight">{departure}</div>
        <div className="text-xs font-bold text-[#0d1b3e] dark:text-primary mt-0.5">{originCode}</div>
        <div className="text-xs text-muted-foreground truncate max-w-[70px]">{origin}</div>
      </div>
      <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
        <div className="text-xs text-muted-foreground font-medium">{duration}</div>
        <div className="w-full flex items-center gap-1">
          <div className="flex-1 h-px bg-border" />
          <div className="h-5 w-5 rounded-full bg-[#0d1b3e] flex items-center justify-center flex-shrink-0">
            <Plane className="h-3 w-3 text-[#f5c842]" />
          </div>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="text-xs text-muted-foreground">
          {stops === 0 ? <Badge className="text-[10px] bg-green-100 text-green-800 border-0 px-1.5 py-0">Non-stop</Badge> : `${stops ?? 0} stop${(stops ?? 0) !== 1 ? "s" : ""}`}
        </div>
      </div>
      <div className="text-center min-w-[64px]">
        <div className="text-2xl font-black tabular-nums tracking-tight">{arrival}</div>
        <div className="text-xs font-bold text-[#0d1b3e] dark:text-primary mt-0.5">{destinationCode}</div>
        <div className="text-xs text-muted-foreground truncate max-w-[70px]">{destination}</div>
      </div>
    </div>
  );
}

export function FlightGroupsList({ type }: FlightGroupsProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [airline, setAirline] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [destination, setDestination] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/login");
  }, [isAuthenticated, authLoading]);

  const airlineFilter = airline && airline !== "all" ? airline : undefined;
  const ksaParams = { airline: airlineFilter, departureDate: departureDate || undefined };
  const uaeParams = { airline: airlineFilter, departureDate: departureDate || undefined };
  const allParams = { airline: airlineFilter, departureDate: departureDate || undefined, destination: destination || undefined };
  const umrahParams = { airline: airlineFilter, departureDate: departureDate || undefined };

  const ksaQuery = useListKsaGroups(ksaParams, { query: { queryKey: getListKsaGroupsQueryKey(ksaParams), enabled: type === "ksa" } });
  const uaeQuery = useListUaeGroups(uaeParams, { query: { queryKey: getListUaeGroupsQueryKey(uaeParams), enabled: type === "uae" } });
  const allQuery = useListAllGroups(allParams, { query: { queryKey: getListAllGroupsQueryKey(allParams), enabled: type === "all" } });
  const umrahQuery = useListUmrahTickets(umrahParams, { query: { queryKey: getListUmrahTicketsQueryKey(umrahParams), enabled: type === "umrah" } });

  const { data, isLoading } = type === "ksa" ? ksaQuery : type === "uae" ? uaeQuery : type === "umrah" ? umrahQuery : allQuery;
  const detailPath = DETAIL_PATHS[type];
  const config = PAGE_CONFIG[type];

  const clearFilters = () => { setAirline(""); setDepartureDate(""); setDestination(""); };
  const hasFilters = airline || departureDate || destination;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-[#0d1b3e] to-[#1a3a7c] rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-1">
              {config.flag && <div className="text-3xl mb-2">{config.flag}</div>}
              <h1 className="text-2xl font-black">{config.title}</h1>
              <p className="text-[#f5c842] text-sm font-medium">{config.subtitle}</p>
              <p className="text-white/60 text-sm max-w-md">{config.description}</p>
            </div>
            <div className="flex flex-col gap-2 text-right">
              <div className="text-xs text-white/50 uppercase tracking-wider">Available Flights</div>
              <div className="text-4xl font-black text-[#f5c842]">{isLoading ? "—" : data?.length ?? 0}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Filter className="h-4 w-4" /> Filter:
          </div>
          <Select value={airline} onValueChange={setAirline}>
            <SelectTrigger className="w-48 h-9" data-testid="filter-airline">
              <SelectValue placeholder="All Airlines" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Airlines</SelectItem>
              <SelectItem value="Pakistan International">PIA — Pakistan Int'l</SelectItem>
              <SelectItem value="Saudi Arabian">Saudi Arabian Airlines</SelectItem>
              <SelectItem value="Emirates">Emirates</SelectItem>
              <SelectItem value="Qatar">Qatar Airways</SelectItem>
              <SelectItem value="Turkish">Turkish Airlines</SelectItem>
              <SelectItem value="Etihad">Etihad Airways</SelectItem>
              <SelectItem value="flydubai">flydubai</SelectItem>
              <SelectItem value="Air Arabia">Air Arabia</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <Calendar className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={departureDate}
              onChange={e => setDepartureDate(e.target.value)}
              className="w-44 h-9 pl-8"
              data-testid="filter-date"
            />
          </div>
          {type === "all" && (
            <Input
              placeholder="Destination city..."
              value={destination}
              onChange={e => setDestination(e.target.value)}
              className="w-40 h-9"
              data-testid="filter-destination"
            />
          )}
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 text-muted-foreground hover:text-foreground" data-testid="button-clear-filters">
              Clear filters
            </Button>
          )}
        </div>

        {/* Results */}
        {!isLoading && data && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{data.length}</span> flight{data.length !== 1 ? "s" : ""} found
              {hasFilters && " matching your filters"}
            </p>
          </div>
        )}

        {/* Flight Cards */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-8 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <div className="space-y-2 text-right">
                      <Skeleton className="h-6 w-28 ml-auto" />
                      <Skeleton className="h-9 w-24 ml-auto" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : data && data.length > 0 ? (
            data.map((flight) => (
              <Card key={flight.id} className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border group overflow-hidden" data-testid={`card-flight-${flight.id}`}>
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    {/* Left color bar */}
                    <div className="w-1.5 bg-gradient-to-b from-[#0d1b3e] to-[#1a3a7c] flex-shrink-0" />
                    <div className="flex-1 p-5">
                      <div className="flex items-start gap-4 flex-wrap">
                        {/* Airline badge */}
                        <AirlineBadge code={flight.airlineCode} name={flight.airline} />

                        {/* Flight info */}
                        <div className="flex-1 min-w-0 space-y-3">
                          {/* Top row */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-sm font-mono">{flight.flightNumber}</span>
                            <span className="text-muted-foreground text-xs">•</span>
                            <span className="text-muted-foreground text-xs">{flight.airline}</span>
                            <Badge variant="outline" className="text-xs h-5">{flight.class}</Badge>
                            {flight.refundable && <Badge className="text-xs h-5 bg-blue-100 text-blue-800 border-0">Refundable</Badge>}
                          </div>

                          {/* Timeline */}
                          <FlightTimeline
                            departure={flight.departureTime}
                            arrival={flight.arrivalTime}
                            duration={flight.duration ?? ""}
                            stops={flight.stops ?? 0}
                            originCode={flight.originCode}
                            destinationCode={flight.destinationCode}
                            origin={flight.origin}
                            destination={flight.destination}
                          />

                          {/* Bottom info strip */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap pt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-[#0d1b3e]" />
                              <span className="font-medium text-foreground">{flight.departureDate}</span>
                            </span>
                            {flight.baggage && (
                              <span className="flex items-center gap-1">
                                <Luggage className="h-3 w-3" /> {flight.baggage}
                              </span>
                            )}
                            {flight.meal && (
                              <span className="flex items-center gap-1">
                                <Utensils className="h-3 w-3" /> Meal included
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3 text-[#0d1b3e]" />
                              <span className={`font-medium ${flight.seatsAvailable < 10 ? "text-red-600" : "text-foreground"}`}>
                                {flight.seatsAvailable} seats
                              </span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Tag className="h-3 w-3" /> PNR: <span className="font-mono">{flight.pnr}</span>
                            </span>
                          </div>
                        </div>

                        {/* Price + Book */}
                        <div className="flex flex-col items-end gap-3 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-2xl font-black text-[#0d1b3e] dark:text-white leading-tight">
                              PKR {Number(flight.price).toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">per person</div>
                          </div>
                          {flight.seatsAvailable === 0 ? (
                            <Badge className="bg-red-100 text-red-800 border-0">Sold Out</Badge>
                          ) : (
                            <Link href={`${detailPath}/${flight.id}`}>
                              <Button size="sm" className="bg-[#0d1b3e] hover:bg-[#1a3a7c] text-white group-hover:bg-[#f5c842] group-hover:text-[#0d1b3e] transition-colors" data-testid={`button-book-${flight.id}`}>
                                Book Now <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            </Link>
                          )}
                          {flight.seatsAvailable > 0 && flight.seatsAvailable <= 5 && (
                            <span className="text-xs text-red-600 font-semibold animate-pulse">Only {flight.seatsAvailable} left!</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-16 space-y-3">
              <Plane className="h-12 w-12 text-muted-foreground/40 mx-auto" />
              <div>
                <p className="font-semibold text-foreground">No flights found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {hasFilters ? "Try adjusting or clearing your filters" : "No flights available at the moment"}
                </p>
              </div>
              {hasFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear all filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
