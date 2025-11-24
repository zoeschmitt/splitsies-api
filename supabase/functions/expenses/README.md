# Expenses API

This API provides endpoints for managing expenses in groups, including creating expenses, retrieving expenses, and calculating user balances.

## Endpoints

### GET /expenses

Retrieve expenses based on different criteria using query parameters.

#### Parameters

All parameters are passed in the URL path as route parameters:

- `groupId` (optional): UUID of the group
- `type` (optional): Type of query - "all", "group", "user-totals", or "user-group-totals" 
- `userId` (optional): UUID of the user (required for user-related queries)

#### Usage Examples

1. **Get all expenses for all groups:**
   ```
   GET /expenses?type=all
   ```

2. **Get expenses for a specific group:**
   ```
   GET /expenses?type=group&groupId={group_uuid}
   ```
   Or simply:
   ```
   GET /expenses?groupId={group_uuid}
   ```

3. **Get user totals across all groups:**
   ```
   GET /expenses?type=user-totals&userId={user_uuid}
   ```

4. **Get user totals for a specific group:**
   ```
   GET /expenses?type=user-group-totals&userId={user_uuid}&groupId={group_uuid}
   ```

#### Response Examples

**All/Group expenses response:**
```json
[
  {
    "id": "expense_uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "group_id": "group_uuid", 
    "title": "Dinner at restaurant",
    "split_type": "equal",
    "total": 120.50,
    "payer_id": "user_uuid",
    "expense_members": [
      {"user_id": "user1_uuid"},
      {"user_id": "user2_uuid"}
    ],
    "groups": {
      "name": "Vacation Group"
    }
  }
]
```

**User totals response:**
```json
{
  "userId": "user_uuid",
  "totalPaid": 250.00,
  "totalOwed": 180.00,
  "balance": 70.00,
  "status": "owed"
}
```

**User group totals response:**
```json
{
  "userId": "user_uuid",
  "groupId": "group_uuid", 
  "totalPaid": 120.00,
  "totalOwed": 90.00,
  "balance": 30.00,
  "status": "owed"
}
```

### POST /expenses

Create a new expense for a group.

#### Request Body

```json
{
  "group_id": "group_uuid",
  "title": "Expense title",
  "split_type": "equal",
  "total": 100.00,
  "payer_id": "user_uuid",
  "member_ids": ["user1_uuid", "user2_uuid", "user3_uuid"]
}
```

#### Response

Returns the created expense with member details:

```json
{
  "id": "expense_uuid",
  "created_at": "2024-01-01T00:00:00Z",
  "group_id": "group_uuid",
  "title": "Expense title", 
  "split_type": "equal",
  "total": 100.00,
  "payer_id": "user_uuid",
  "expense_members": [
    {"user_id": "user1_uuid"},
    {"user_id": "user2_uuid"},
    {"user_id": "user3_uuid"}
  ],
  "groups": {
    "name": "Group Name"
  }
}
```

## Balance Calculation

The API calculates user balances based on:

- **Total Paid**: Sum of all expenses where the user is the payer
- **Total Owed**: User's share of all expenses they're a member of (total ÷ number of members)
- **Balance**: Total Paid - Total Owed
- **Status**: "owed" if balance ≥ 0 (others owe them), "owes" if balance < 0 (they owe others)

## Authentication

All endpoints require authentication via the `Authorization` header with a valid Supabase JWT token.
