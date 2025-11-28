alter table "public"."expense_members" add column "paid" boolean not null default false;

alter table "public"."expenses" drop column "paid";

