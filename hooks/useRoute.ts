// This hook has been replaced by RouteContext
// Please use the useRoute hook from @/context/RouteContext instead
// 
// Migration example:
// Old: const { route, loading, error } = useRoute(routeId);
// New: 
//   const { route, isLoading, error, fetchRoute } = useRoute();
//   useEffect(() => {
//     if (routeId) {
//       fetchRoute(routeId);
//     }
//   }, [routeId]);

export { useRoute } from "@/context/RouteContext";
