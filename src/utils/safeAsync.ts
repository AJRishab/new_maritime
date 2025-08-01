// Safe async operation wrapper to prevent unhandled promise rejections
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  fallback?: T,
  onError?: (error: Error) => void
): Promise<T | undefined> => {
  try {
    return await operation();
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    console.error('Safe async operation failed:', errorObj);
    
    if (onError) {
      try {
        onError(errorObj);
      } catch (callbackError) {
        console.error('Error callback also failed:', callbackError);
      }
    }
    
    return fallback;
  }
};

// Safe sync operation wrapper
export const safeSync = <T>(
  operation: () => T,
  fallback: T,
  onError?: (error: Error) => void
): T => {
  try {
    return operation();
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    console.error('Safe sync operation failed:', errorObj);
    
    if (onError) {
      try {
        onError(errorObj);
      } catch (callbackError) {
        console.error('Error callback also failed:', callbackError);
      }
    }
    
    return fallback;
  }
};

// Safe localStorage operations
export const safeLocalStorage = {
  getItem: (key: string, fallback: string | null = null): string | null => {
    return safeSync(
      () => localStorage.getItem(key),
      fallback,
      (error) => console.warn(`Failed to get localStorage item '${key}':`, error)
    );
  },
  
  setItem: (key: string, value: string): boolean => {
    return safeSync(
      () => {
        localStorage.setItem(key, value);
        return true;
      },
      false,
      (error) => console.warn(`Failed to set localStorage item '${key}':`, error)
    );
  },
  
  removeItem: (key: string): boolean => {
    return safeSync(
      () => {
        localStorage.removeItem(key);
        return true;
      },
      false,
      (error) => console.warn(`Failed to remove localStorage item '${key}':`, error)
    );
  }
};

// Safe JSON operations
export const safeJSON = {
  parse: <T>(text: string, fallback: T): T => {
    return safeSync(
      () => JSON.parse(text),
      fallback,
      (error) => console.warn('Failed to parse JSON:', error)
    );
  },
  
  stringify: (value: any, fallback: string = '{}'): string => {
    return safeSync(
      () => JSON.stringify(value),
      fallback,
      (error) => console.warn('Failed to stringify JSON:', error)
    );
  }
};
