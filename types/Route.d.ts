interface Route {
    id: string;
    name: string;
    status: "CREATED" | "STARTED" | "COMPLETED";
    companyId: string;
    polyline: string
    points: RoutePoint[];
    createdAt: string;
    updatedAt: string;
}

interface RoutePoint {
    id: string;
    status: string;
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