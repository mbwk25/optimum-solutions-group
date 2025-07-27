// Safe loading screen without hooks
const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="relative animate-pulse">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-16 w-16 bg-primary rounded-full animate-spin"></div>
            <div className="font-bold text-2xl tracking-tight">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Optimum
              </span>
              <span className="text-foreground ml-1 font-light">
                Solutions
              </span>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">
                GROUP
              </div>
            </div>
          </div>
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-secondary rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Safe page load hook without useState/useEffect
const usePageLoad = () => {
  return false; // Always return false so loading screen doesn't show
};

export { LoadingScreen, usePageLoad };