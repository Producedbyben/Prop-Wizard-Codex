import { PropOption } from '@/types/props';
import { supabase } from '@/integrations/supabase/client';

export async function searchPropOptions(
  propName: string,
  description: string,
  tags: string[],
  searchQueryOverride?: string
): Promise<{ options: Omit<PropOption, 'propId' | 'selected' | 'createdAt'>[]; status: string }> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Search timeout')), 45000)
  );

  const search = supabase.functions.invoke('search-props', {
    body: { propName, description, tags, searchQueryOverride },
  });

  const { data, error } = await Promise.race([
    search,
    timeout.then(() => { throw new Error('Search timeout'); }),
  ]);

  if (error) {
    console.error('Edge function error:', error);
    throw new Error(`Search failed: ${error.message}`);
  }

  if (data?.error) {
    console.error('Search error:', data.error);
    throw new Error(data.error);
  }

  return {
    options: data?.options || [],
    status: data?.status || 'no_results',
  };
}
