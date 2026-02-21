export declare class RoutingService {
    /**
     * Determine which Urban Local Body (ULB) holds jurisdiction over the coordinates.
     * This uses a mock boundary check for now, but will use PostGIS ST_Contains in production.
     */
    static identifyJurisdiction(latitude: number, longitude: number): Promise<string>;
}
//# sourceMappingURL=routingService.d.ts.map