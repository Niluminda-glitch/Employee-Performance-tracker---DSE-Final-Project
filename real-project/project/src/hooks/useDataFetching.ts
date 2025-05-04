
import { useState, useEffect } from 'react';
import { supabase } from './useSupabase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface FetchOptions {
  table: string;
  columns?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
}

export function useDataFetching<T>(options: FetchOptions) {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return; // Only fetch data if user is authenticated
      
      try {
        setIsLoading(true);
        setError(null);
        
        let query = supabase
          .from(options.table)
          .select(options.columns || '*');
        
        // Apply filters if specified
        if (options.filters) {
          Object.entries(options.filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        
        // Apply ordering if specified
        if (options.orderBy) {
          const { column, ascending = true } = options.orderBy;
          query = query.order(column, { ascending });
        }
        
        // Apply limit if specified
        if (options.limit) {
          query = query.limit(options.limit);
        }
        
        const { data: result, error: fetchError } = await query;
        
        if (fetchError) {
          throw new Error(fetchError.message);
        }
        
        setData(result as T[]);
      } catch (err) {
        setError(err as Error);
        toast.error(`Failed to fetch ${options.table}: ${(err as Error).message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [options.table, JSON.stringify(options.filters), user]);
  
  return { data, isLoading, error, refetch: () => setIsLoading(true) };
}
