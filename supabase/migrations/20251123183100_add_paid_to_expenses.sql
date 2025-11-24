alter table "public"."expenses" drop column "split_type";

alter table "public"."expenses" add column "paid" boolean not null default false;