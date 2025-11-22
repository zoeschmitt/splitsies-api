create table "public"."expense_members" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "expense_id" uuid default gen_random_uuid(),
    "user_id" uuid
);


create table "public"."expenses" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "group_id" uuid,
    "title" text,
    "split_type" text,
    "total" numeric,
    "payer_id" uuid
);


alter table "public"."group_members" disable row level security;

alter table "public"."groups" disable row level security;

CREATE UNIQUE INDEX expense_members_pkey ON public.expense_members USING btree (id);

CREATE UNIQUE INDEX expenses_pkey ON public.expenses USING btree (id);

alter table "public"."expense_members" add constraint "expense_members_pkey" PRIMARY KEY using index "expense_members_pkey";

alter table "public"."expenses" add constraint "expenses_pkey" PRIMARY KEY using index "expenses_pkey";

alter table "public"."expense_members" add constraint "expense_members_expense_id_fkey" FOREIGN KEY (expense_id) REFERENCES expenses(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."expense_members" validate constraint "expense_members_expense_id_fkey";

alter table "public"."expense_members" add constraint "expense_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."expense_members" validate constraint "expense_members_user_id_fkey";

alter table "public"."expenses" add constraint "expenses_group_id_fkey" FOREIGN KEY (group_id) REFERENCES groups(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."expenses" validate constraint "expenses_group_id_fkey";

alter table "public"."expenses" add constraint "expenses_payer_id_fkey" FOREIGN KEY (payer_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."expenses" validate constraint "expenses_payer_id_fkey";