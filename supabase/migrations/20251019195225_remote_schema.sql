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

CREATE OR REPLACE FUNCTION public.add_owner_to_group_members()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$begin
  insert into public.group_members (group_id, user_id, role)
  values (new.id, new.user, 'owner');
  return new;
end;$function$
;

CREATE TRIGGER add_owner_membership AFTER INSERT ON public.groups FOR EACH ROW EXECUTE FUNCTION add_owner_to_group_members();



