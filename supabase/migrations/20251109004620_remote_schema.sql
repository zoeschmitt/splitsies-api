drop policy "Members can add members" on "public"."group_members";

drop policy "Members can read all members" on "public"."group_members";

drop policy "Read only if member" on "public"."groups";

revoke delete on table "public"."group_members" from "anon";

revoke insert on table "public"."group_members" from "anon";

revoke references on table "public"."group_members" from "anon";

revoke select on table "public"."group_members" from "anon";

revoke trigger on table "public"."group_members" from "anon";

revoke truncate on table "public"."group_members" from "anon";

revoke update on table "public"."group_members" from "anon";

revoke delete on table "public"."group_members" from "authenticated";

revoke insert on table "public"."group_members" from "authenticated";

revoke references on table "public"."group_members" from "authenticated";

revoke select on table "public"."group_members" from "authenticated";

revoke trigger on table "public"."group_members" from "authenticated";

revoke truncate on table "public"."group_members" from "authenticated";

revoke update on table "public"."group_members" from "authenticated";

revoke delete on table "public"."group_members" from "service_role";

revoke insert on table "public"."group_members" from "service_role";

revoke references on table "public"."group_members" from "service_role";

revoke select on table "public"."group_members" from "service_role";

revoke trigger on table "public"."group_members" from "service_role";

revoke truncate on table "public"."group_members" from "service_role";

revoke update on table "public"."group_members" from "service_role";

revoke delete on table "public"."groups" from "anon";

revoke insert on table "public"."groups" from "anon";

revoke references on table "public"."groups" from "anon";

revoke select on table "public"."groups" from "anon";

revoke trigger on table "public"."groups" from "anon";

revoke truncate on table "public"."groups" from "anon";

revoke update on table "public"."groups" from "anon";

revoke delete on table "public"."groups" from "authenticated";

revoke insert on table "public"."groups" from "authenticated";

revoke references on table "public"."groups" from "authenticated";

revoke select on table "public"."groups" from "authenticated";

revoke trigger on table "public"."groups" from "authenticated";

revoke truncate on table "public"."groups" from "authenticated";

revoke update on table "public"."groups" from "authenticated";

revoke delete on table "public"."groups" from "service_role";

revoke insert on table "public"."groups" from "service_role";

revoke references on table "public"."groups" from "service_role";

revoke select on table "public"."groups" from "service_role";

revoke trigger on table "public"."groups" from "service_role";

revoke truncate on table "public"."groups" from "service_role";

revoke update on table "public"."groups" from "service_role";

set check_function_bodies = off;

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

CREATE OR REPLACE FUNCTION public.add_owner_to_group_members()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$begin
  insert into public.group_members (group_id, user_id)
  values (new.id, new.user_id);
  return new;
end;$function$
;

create policy "Members can add member"
on "public"."group_members"
as permissive
for insert
to authenticated
with check (is_group_member(group_id, auth.uid()));


create policy "Members can delete members"
on "public"."group_members"
as permissive
for delete
to authenticated
using (is_group_member(group_id, auth.uid()));


create policy "Members can update members"
on "public"."group_members"
as permissive
for update
to authenticated
using (is_group_member(group_id, auth.uid()))
with check (is_group_member(group_id, auth.uid()));


create policy "Members can read all members"
on "public"."group_members"
as permissive
for select
to authenticated
using (is_group_member(group_id, auth.uid()));


create policy "Read only if member"
on "public"."groups"
as permissive
for select
to authenticated
using (is_group_member(id, auth.uid()));




