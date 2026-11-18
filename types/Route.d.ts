interface Route {
    id: string;
    name: string;
    status: "CREATED" | "STARTED" | "COMPLETED";
    companyId: string;
    driverId: string | null;
    driver: RouteDriver | null;
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