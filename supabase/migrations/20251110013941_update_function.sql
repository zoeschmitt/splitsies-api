CREATE OR REPLACE FUNCTION public.add_owner_to_group_members()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$begin
  insert into public.group_members (group_id, user_id)
  values (new.id, auth.uid());
  return new;
end;$function$;
