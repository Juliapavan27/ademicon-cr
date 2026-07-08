-- Same rationale as migration 0010: a SECURITY DEFINER function in `public`
-- is auto-exposed by PostgREST as an RPC endpoint. This one only makes sense
-- invoked by its own trigger (it reads NEW, which is null outside a trigger
-- context), so there's no legitimate direct caller to preserve access for.

alter function public.handle_new_user() set schema private;
