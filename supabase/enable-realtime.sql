
-- Enable real-time functionality for all relevant tables
alter table public.categories replica identity full;
alter table public.budgets replica identity full;
alter table public.transactions replica identity full;
alter table public.reports replica identity full;

-- Add tables to the realtime publication
begin;
  -- drop the publication if it exists
  drop publication if exists supabase_realtime;
  
  -- re-create the publication
  create publication supabase_realtime for table 
    public.categories,
    public.budgets,
    public.transactions,
    public.reports;
commit;
