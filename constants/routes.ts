import type { Href } from "expo-router";

export type OrdersViewParams = { id: string };
export type BillsViewParams = { id: string };
export type ClientsProfileParams = { id: string };
export type ClientsEditParams = { id: string };
export type ProductsViewParams = { id: string };
export type ProductsEditParams = { id: string };
export type RoutesViewParams = { id: string };
export type OrdersCreateParams = { clientId?: string };
export type RouteAddOrdersParams = { routeId: string };

export const Routes = {
  // Drawer > tabs
  home: "/home" as Href,
  orders: "/orders" as Href,
  routes: "/routes" as Href,
  clients: "/clients" as Href,

  // Solo drawer
  bills: "/bills" as Href,
  products: "/products" as Href,
  account: "/account" as Href,

  clientsAdd: "/clients/add" as Href,
  productsAdd: "/products/add" as Href,
  ordersCreate: "/orders/create" as Href,
  routesCreate: "/routes/create" as Href,
  companiesAdd: "/companies/add" as Href,
  companiesSelect: "/companies/select" as Href,
  paymentMethodsAdd: "/payment-methods/add" as Href,
  planLimit: "/plan-limit" as Href,
  forceUpdate: "/force-update" as Href,
  root: "/" as Href,
  qa: "/qa" as Href,

  clientProfile: (id: string) => ({
    pathname: "/clients/profile/[id]" as const,
    params: { id },
  }),
  clientEdit: (id: string) => ({
    pathname: "/clients/edit/[id]" as const,
    params: { id },
  }),
  orderView: (id: string) => ({
    pathname: "/orders/view/[id]" as const,
    params: { id },
  }),
  billView: (id: string) => ({
    pathname: "/bills/view/[id]" as const,
    params: { id },
  }),
  productView: (id: string) => ({
    pathname: "/products/view/[id]" as const,
    params: { id },
  }),
  productEdit: (id: string) => ({
    pathname: "/products/edit/[id]" as const,
    params: { id },
  }),
  routeView: (id: string) => ({
    pathname: "/routes/view/[id]" as const,
    params: { id },
  }),
  orderCreate: (clientId?: string) => ({
    pathname: "/orders/create" as const,
    params: clientId ? { clientId } : {},
  }),
  routeAddOrders: (routeId: string) => ({
    pathname: "/routes/view/addOrders" as const,
    params: { routeId },
  }),
} as const;
