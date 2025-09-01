// Déclaration globale pour window.gtag et __performanceMonitor
export { };
declare global {
    interface Window {
        gtag?: (event: string, action: string, params: Record<string, unknown>) => void;
        __performanceMonitor?: unknown;
    }
}