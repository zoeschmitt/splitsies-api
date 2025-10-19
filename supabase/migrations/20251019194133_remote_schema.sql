create table "public"."group_members" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp without time zone not null,
    "group_id" uuid not null,
    "user_id" uuid not null
);


alter table "public"."group_members" enable row level security;

create table "public"."groups" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null default ''::text,
    "badge" text not null default ''::text
);


alter table "public"."groups" enable row level security;

CREATE UNIQUE INDEX group_members_pkey ON public.group_members USING btree (id);

CREATE UNIQUE INDEX groups_pkey ON public.groups USING btree (id);

alter table "public"."group_members" add constraint "group_members_pkey" PRIMARY KEY using index "group_members_pkey";

alter table "public"."groups" add constraint "groups_pkey" PRIMARY KEY using index "groups_pkey";

alter table "public"."group_members" add constraint "group_members_group_id_fkey" FOREIGN KEY (group_id) REFERENCES groups(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."group_members" validate constraint "group_members_group_id_fkey";

alter table "public"."group_members" add constraint "group_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."group_members" validate constraint "group_members_user_id_fkey";

create policy "Members can add members"
on "public"."group_members"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM group_members gm
  WHERE ((gm.group_id = group_members.group_id) AND (gm.user_id = auth.uid())))));


create policy "Members can read all members"
on "public"."group_members"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM group_members gm
  WHERE ((gm.group_id = group_members.group_id) AND (gm.user_id = auth.uid())))));


create policy "Enable insert for authenticated users only"
on "public"."groups"
as permissive
for insert
to authenticated
with check (true);


create policy "Read only if member"
on "public"."groups"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM group_members gm
  WHERE ((gm.group_id = groups.id) AND (gm.user_id = auth.uid())))));




