import { useState, useCallback, useRef, useEffect } from 'react';

export function useNavigation(initialPath = '/') {
  // Get initial path from browser URL
  const getInitialPath = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const search = window.location.search;
      return path + search || initialPath;
    }
    return initialPath;
  };

  const initialPathValue = getInitialPath();
  const [currentRoute, setCurrentRoute] = useState({ path: initialPathValue });
  
  // Use refs to access latest values in callback
  const currentRouteRef = useRef(currentRoute);
  
  useEffect(() => {
    currentRouteRef.current = currentRoute;
  }, [currentRoute]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const search = window.location.search;
      const searchParams = {};
      
      if (search) {
        const params = new URLSearchParams(search);
        params.forEach((value, key) => {
          searchParams[key] = value;
        });
      }
      
      setCurrentRoute({ path, search, params: searchParams });
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    
    // Initialize browser URL on first load
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const searchParams = {};
    
    if (currentSearch) {
      const params = new URLSearchParams(currentSearch);
      params.forEach((value, key) => {
        searchParams[key] = value;
      });
    }
    
    // Replace current history entry to ensure it has state
    window.history.replaceState(
      { path: currentPath + currentSearch },
      '',
      currentPath + currentSearch
    );
    
    setCurrentRoute({ path: currentPath, search: currentSearch, params: searchParams });

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []); // Only run once on mount

  const navigate = useCallback((pathOrDelta) => {
    if (typeof pathOrDelta === 'number') {
      // Navigate back/forward using browser history
      if (pathOrDelta < 0) {
        window.history.back();
      } else if (pathOrDelta > 0) {
        window.history.forward();
      }
    } else {
      // Navigate to new path
      const fullPath = pathOrDelta;
      const [path, searchString] = fullPath.split('?');
      const params = {};
      
      if (searchString) {
        const searchParams = new URLSearchParams(searchString);
        searchParams.forEach((value, key) => {
          params[key] = value;
        });
      }

      // Update browser URL without page reload
      window.history.pushState({ path: fullPath }, '', fullPath);
      
      // Update state with full path for route matching
      setCurrentRoute({ path, search: searchString ? `?${searchString}` : '', params });
      window.scrollTo(0, 0);
    }
  }, []);

  return { currentRoute, navigate };
}
