revoke delete on table "public"."group_members" from "authenticated";

revoke insert on table "public"."group_members" from "authenticated";

revoke select on table "public"."group_members" from "authenticated";

revoke update on table "public"."group_members" from "authenticated";

revoke delete on table "public"."groups" from "authenticated";

revoke insert on table "public"."groups" from "authenticated";

revoke select on table "public"."groups" from "authenticated";

revoke update on table "public"."groups" from "authenticated";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_owner_to_group_members()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$begin
  insert into public.group_members (group_id, user_id)
  values (new.id, auth.uid());
  return new;
end;$function$
;

CREATE OR REPLACE FUNCTION public.is_group_member(group_id_param uuid, user_id_param uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM "public"."group_members" 
    WHERE "group_id" = group_id_param AND "user_id" = user_id_param
  );
$function$
;

create policy "members can delete"
on "public"."groups"
as permissive
for delete
to authenticated
using (is_group_member(id, auth.uid()));


create policy "members can update"
on "public"."groups"
as permissive
for update
to authenticated
using (is_group_member(id, auth.uid()))
with check (is_group_member(id, auth.uid()));




