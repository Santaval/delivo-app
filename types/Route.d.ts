interface Route {
    id: string;
    name: string;
    status: string;
    companyId: string;
    points: RoutePoint[];
    createdAt: string;
    updatedAt: string;
}

interface RoutePoint {
    id: string;
    status: string;
    order: OrderResponse;
    routeId: string;
    createdAt: string;
    updatedAt: string;
}