import { CompleteRequest } from "../../_shared/utils/requests.ts";
import { withErrorHandling } from "../../_shared/utils/errors.ts";
import { validate } from "../../_shared/utils/validate.ts";
import { ObjectSchema, object, string, array } from "yup";
import { CORSResponse } from "../../_shared/utils/cors.ts";
import { SupabaseClient } from "@supabase/supabase-js";

interface Req {
  params: {
    groupId: string;
  };
  body: {
    name?: string;
    badge?: string;
    memberIds?: string[];
  };
}

const schema: ObjectSchema<Req> = object({
  params: object({
    groupId: string().uuid().required(),
  }),
  body: object({
    name: string().optional(),
    badge: string().optional(),
    memberIds: array().of(string().uuid().required()).min(1).optional(),
  }).required(),
});

const handler = async (
  req: CompleteRequest,
  sbClient: SupabaseClient
): Promise<Response> => {
  const { groupId } = req.params;
  const { name, badge, memberIds } = req.body;

  // Get the current user from auth
  const {
    data: { user },
    error: userError,
  } = await sbClient.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const userId = user.id;

  const updates = {
    ...(name && { name }),
    ...(badge && { badge }),
  };

  const { error } = await sbClient
    .from("groups")
    .update(updates)
    .eq("id", groupId);

  if (error) throw error;

  if (memberIds && memberIds.length > 0) {
    const { error: deleteError } = await sbClient
      .from("group_members")
      .delete()
      .eq("group_id", groupId);

    if (deleteError) throw deleteError;

    const allMemberIds = [...new Set([userId, ...memberIds])]; 
    const newMembers = allMemberIds.map((memberId: string) => ({
      group_id: groupId,
      user_id: memberId,
    }));

    const { error: insertError } = await sbClient
      .from("group_members")
      .insert(newMembers);

    if (insertError) throw insertError;
  }

  const { data: updatedGroup, error: fetchError } = await sbClient
    .from("groups")
    .select(
      `
      *,
      group_members(
        user_id,
        profiles(name)
      )
    `
    )
    .eq("id", groupId)
    .single();

  if (fetchError) throw fetchError;

  return new CORSResponse(updatedGroup, {
    status: 200,
  });
};

export const patchGroups = validate(withErrorHandling(handler), schema);
