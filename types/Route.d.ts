interface Route {
    id: string;
    name: string;
    status: "CREATED" | "STARTED" | "COMPLETED";
    companyId: string;
    driverId: string | null;
    driver: RouteDriver | null;
    /** Last position reported by the driver. Only filled for the driver and OWNER/ADMIN. */
    driverLocation?: RouteDriverLocation | null;
    polyline: string
    points: RoutePoint[];
    createdAt: string;
    updatedAt: string;
}

interface RouteDriver {
    id: string;
    name: string;
    surnames: string;
}

interface RouteDriverLocation {
    lat: number;
    lng: number;
    heading: number | null;
    recordedAt: string;
    /** Only present on the stream / GET /routes/:id/location payload. */
    speed?: number | null;
    accuracy?: number | null;
}

/** One point sent to POST /routes/:id/location. */
interface DriverLocationPoint {
    lat: number;
    lng: number;
    heading: number | null;
    speed: number | null;
    accuracy: number | null;
    /** ISO-8601 */
    recordedAt: string;
}

interface RoutePoint {
    id: string;
    status: "CREATED" | "VISITED" | "SKIPPED";
    index: number;
    order: Order;
    routeId: string;
    createdAt: string;
    updatedAt: string;
}

interface LocationCords {
    lat: number;
    lng: number;
}