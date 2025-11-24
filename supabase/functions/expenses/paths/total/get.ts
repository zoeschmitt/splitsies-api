import { CompleteRequest } from "../../../_shared/utils/requests.ts";
import { withErrorHandling } from "../../../_shared/utils/errors.ts";
import { validate } from "../../../_shared/utils/validate.ts";
import { ObjectSchema, object, string } from "yup";
import { CORSResponse } from "../../../_shared/utils/cors.ts";
import { SupabaseClient } from "@supabase/supabase-js";
import { ExpenseMember } from "../../../_shared/utils/types.ts";

enum ExpenseStatus {
  OWED = "OWED",
  OWES = "OWES",
  EVEN = "EVEN",
}

interface UserTotal {
  total: number;
  status: ExpenseStatus;
}

interface GroupTotalsResponse {
  overall: number;
  totals: Record<string, UserTotal>;
}

interface UserTotalResponse {
  total: number;
  status: ExpenseStatus;
}

const getExpenseStatusFromBalance = (balance: number): ExpenseStatus => {
  if (balance > 0.01) {
    return ExpenseStatus.OWED;
  } else if (balance < -0.01) {
    return ExpenseStatus.OWES;
  } else {
    return ExpenseStatus.EVEN;
  }
};

interface Req {
  params: {
    groupId?: string;
  };
}

const schema: ObjectSchema<Req> = object({
  params: object({
    groupId: string().uuid().optional(),
  }),
});

const getGroupTotals = async (
  sbClient: SupabaseClient,
  groupId: string
): Promise<GroupTotalsResponse> => {
  const { data: expenses, error } = await sbClient
    .from("expenses")
    .select(
      `
        *,
        expense_members(user_id)
      `
    )
    .eq("group_id", groupId);

  if (error) throw error;

  const overall =
    expenses?.reduce((sum, expense) => sum + expense.total, 0) || 0;

  const userBalances: Record<string, number> = {};

  expenses?.forEach((expense) => {
    const memberCount = expense.expense_members.length;
    const sharePerPerson = expense.total / memberCount;

    if (!userBalances[expense.payer_id]) {
      userBalances[expense.payer_id] = 0;
    }
    userBalances[expense.payer_id] += expense.total;

    expense.expense_members.forEach((member: ExpenseMember) => {
      if (!userBalances[member.user_id]) {
        userBalances[member.user_id] = 0;
      }
      userBalances[member.user_id] -= sharePerPerson;
    });
  });

  const userIds = Object.keys(userBalances);
  const { data: profiles } = await sbClient
    .from("profiles")
    .select("id, name")
    .in("id", userIds);

  const totals: Record<string, UserTotal> = {};
  for (const [uId, balance] of Object.entries(userBalances)) {
    const profile = profiles?.find((p) => p.id === uId);
    const userName = profile?.name || uId;

    totals[userName] = {
      total: Math.round(Math.abs(balance) * 100) / 100,
      status: getExpenseStatusFromBalance(balance),
    };
  }

  return {
    overall: Math.round(overall * 100) / 100,
    totals,
  };
};

const getUserTotalAllGroups = async (
  sbClient: SupabaseClient
): Promise<UserTotalResponse> => {
  const {
    data: { user },
    error: userError,
  } = await sbClient.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const userId = user.id;

  const { data: userGroups } = await sbClient
    .from("group_members")
    .select("group_id")
    .eq("user_id", userId);

  const groupIds = userGroups?.map((g) => g.group_id) || [];

  if (groupIds.length === 0) {
    return {
      total: 0,
      status: ExpenseStatus.EVEN,
    };
  }

  const { data: expenses, error } = await sbClient
    .from("expenses")
    .select(
      `
        *,
        expense_members(user_id)
      `
    )
    .in("group_id", groupIds);

  if (error) throw error;

  let userNetBalance = 0;

  expenses?.forEach((expense) => {
    const memberCount = expense.expense_members.length;
    const sharePerPerson = expense.total / memberCount;

    if (expense.payer_id === userId) {
      userNetBalance += expense.total;
    }

    const isUserMember = expense.expense_members.some(
      (member: ExpenseMember) => member.user_id === userId
    );
    if (isUserMember) {
      userNetBalance -= sharePerPerson;
    }
  });

  return {
    total: Math.round(Math.abs(userNetBalance) * 100) / 100,
    status: getExpenseStatusFromBalance(userNetBalance),
  };
};

const handler = async (
  req: CompleteRequest,
  sbClient: SupabaseClient
): Promise<Response> => {
  const { groupId } = req.params;

  if (groupId) {
    const result = await getGroupTotals(sbClient, groupId);
    return new CORSResponse(result, { status: 200 });
  } else {
    const result = await getUserTotalAllGroups(sbClient);
    return new CORSResponse(result, { status: 200 });
  }
};

export const getTotalExpenses = validate(withErrorHandling(handler), schema);
