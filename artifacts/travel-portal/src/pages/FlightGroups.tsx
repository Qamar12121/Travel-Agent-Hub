import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  useListKsaGroups, getListKsaGroupsQueryKey,
  useListUaeGroups, getListUaeGroupsQueryKey,
  useListAllGroups, getListAllGroupsQueryKey,
  useListUmrahTickets, getListUmrahTicketsQueryKey,
} from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/AuthContext";
import { Plane, Clock, Users, Luggage, Filter, Utensils } from "lucide-react";

type PageType = "ksa" | "uae" | "all" | "umrah";

interface FlightGroupsProps { type: PageType; }

const TITLES: Record<PageType, string> = {
  ksa: "KSA One Way Groups",
  uae: "UAE One Way Groups",
  all: "All Flight Groups",
  umrah: "Umrah Tickets",
};

const DETAIL_PATHS: Record<PageType, string> = {
  ksa: "/ksa-groups",
  uae: "/uae-groups",
  all: "/all-groups",
  umrah: "/umrah-tickets",
};

function AirlineIcon({ code }: { code: string }) {
  const colors: Record<string, string> = { PK: "bg-green-700", SV: "bg-green-600", EK: "bg-red-600", QR: "bg-purple-800", TK: "bg-red-700", EY: "bg-gray-800", FZ: "bg-orange-600", WY: "bg-teal-600" };
  const bg = colors[code] || "bg-blue-800";
  return <div className={`${bg} text-white text-xs font-bold w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>{code}</div>;
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

  const ksaParams = { airline: airline || undefined, departureDate: departureDate || undefined };
  const uaeParams = { airline: airline || undefined, departureDate: departureDate || undefined };
  const allParams = { airline: airline || undefined, departureDate: departureDate || undefined, destination: destination || undefined };
  const umrahParams = { airline: airline || undefined, departureDate: departureDate || undefined };

  const ksaQuery = useListKsaGroups(ksaParams, { query: { queryKey: getListKsaGroupsQueryKey(ksaParams), enabled: type === "ksa" } });
  const uaeQuery = useListUaeGroups(uaeParams, { query: { queryKey: getListUaeGroupsQueryKey(uaeParams), enabled: type === "uae" } });
  const allQuery = useListAllGroups(allParams, { query: { queryKey: getListAllGroupsQueryKey(allParams), enabled: type === "all" } });
  const umrahQuery = useListUmrahTickets(umrahParams, { query: { queryKey: getListUmrahTicketsQueryKey(umrahParams), enabled: type === "umrah" } });

  const { data, isLoading } = type === "ksa" ? ksaQuery : type === "uae" ? uaeQuery : type === "umrah" ? umrahQuery : allQuery;
  const detailPath = DETAIL_PATHS[type];

  const clearFilters = () => { setAirline(""); setDepartureDate(""); setDestination(""); };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{TITLES[type]}</h1>
          <p className="text-muted-foreground text-sm mt-1">Search and book available flights</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Filter className="h-4 w-4" /> Search Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Select value={airline} onValueChange={setAirline}>
                <SelectTrigger className="w-48" data-testid="filter-airline">
                  <SelectValue placeholder="All Airlines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Airlines</SelectItem>
                  <SelectItem value="Pakistan International">PIA</SelectItem>
                  <SelectItem value="Saudi Arabian">Saudi Arabian Airlines</SelectItem>
                  <SelectItem value="Emirates">Emirates</SelectItem>
                  <SelectItem value="Qatar">Qatar Airways</SelectItem>
                  <SelectItem value="Turkish">Turkish Airlines</SelectItem>
                  <SelectItem value="Etihad">Etihad Airways</SelectItem>
                  <SelectItem value="flydubai">flydubai</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" value={departureDate} onChange={e => setDepartureDate(e.target.value)} className="w-44" data-testid="filter-date" />
              {type === "all" && <Input placeholder="Destination" value={destination} onChange={e => setDestination(e.target.value)} className="w-40" data-testid="filter-destination" />}
              <Button variant="outline" onClick={clearFilters} data-testid="button-clear-filters">Clear</Button>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        {!isLoading && data && (
          <p className="text-sm text-muted-foreground">{data.length} flight{data.length !== 1 ? "s" : ""} found</p>
        )}

        {/* Flight Cards */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28" />)
          ) : data && data.length > 0 ? (
            data.map((flight) => (
              <Card key={flight.id} className="hover:shadow-md transition-shadow" data-testid={`card-flight-${flight.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <AirlineIcon code={flight.airlineCode} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">{flight.flightNumber}</span>
                        <span className="text-muted-foreground text-xs">{flight.airline}</span>
                        <Badge variant="outline" className="text-xs">{flight.class}</Badge>
                        {flight.stops === 0 && <Badge className="text-xs bg-green-100 text-green-800 border-0">Non-stop</Badge>}
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-lg">{flight.departureTime}</div>
                          <div className="text-xs text-muted-foreground">{flight.originCode}</div>
                          <div className="text-xs text-muted-foreground">{flight.origin}</div>
                        </div>
                        <div className="flex-1 flex flex-col items-center text-xs text-muted-foreground">
                          <span>{flight.duration}</span>
                          <div className="w-full h-px bg-border relative my-1">
                            <Plane className="h-3 w-3 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-primary" />
                          </div>
                          <span>{flight.stops === 0 ? "Direct" : `${flight.stops} stop`}</span>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-lg">{flight.arrivalTime}</div>
                          <div className="text-xs text-muted-foreground">{flight.destinationCode}</div>
                          <div className="text-xs text-muted-foreground">{flight.destination}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{flight.departureDate}</div>
                        {flight.baggage && <div className="flex items-center gap-1"><Luggage className="h-3 w-3" />{flight.baggage}</div>}
                        {flight.meal && <div className="flex items-center gap-1"><Utensils className="h-3 w-3" />Meal</div>}
                        <div className="flex items-center gap-1"><Users className="h-3 w-3" />{flight.seatsAvailable} seats</div>
                        <span className="font-mono text-xs bg-muted px-1 rounded">PNR: {flight.pnr}</span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="text-xl font-bold text-primary">PKR {Number(flight.price).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">per person</div>
                      <Link href={`${detailPath}/${flight.id}`}>
                        <Button size="sm" data-testid={`button-book-${flight.id}`}>Book Now</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">No flights found matching your filters</div>
          )}
        </div>
      </div>
    </Layout>
  );
}
