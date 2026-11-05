<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Every store-owned table carries `store_id` and is protected by RLS via `is_store_member` / `has_store_permission` — isolation must never rely on UI filters.
- Device costs live in `device_costs` / `accessory_costs` (permission-gated RLS) so users without cost permission never receive them.
- Store files go in private bucket `store-files` under `{store_id}/devices|logo/...` and are only shown via signed URLs.
- Money is `numeric(12,2)` in DB and summed as integer cents in `src/lib/money.ts`.
- Unbuilt modules render `EmDesenvolvimento` with no fake actions.
- Sales are written only through the security-definer RPCs `complete_sale` / `cancel_sale` (transactional, idempotent via `client_token`, permission-checked); sale tables are read-only via RLS. The emitted receipt is the immutable `sales.receipt_snapshot` taken at completion.
- Trade-ins create a `devices` row in `em_conferencia` with the agreed value as `device_costs.purchase_cost`; cancelling a sale returns sold devices to `disponivel` and marks trade-ins `devolvido_cliente`.
- Sub-pages of a list route use the trailing-underscore pattern (`vendas_.nova.tsx`), because a content route without `<Outlet />` swallows nested children.
- Money movement lives in `financial_entries`; sale/card/crediário receipts are written only by the security-definer RPCs `register_sale_receipt`, `receive_installments`, `reverse_receipt`, `register_refund` (all idempotent via `client_token`). Card payments become pending operator receivables via the `sale_payment_to_finance` trigger — never instant cash. Crediário schedules are no-interest only until an interest method is documented and verified.
- Cancelling a sale never auto-refunds: it sets `sales.refund_due` and cancels open receivables; actual refunds are separate `register_refund` calls. A trade-in device already sold or committed blocks cancellation.
- Trade-ins require an approved `evaluations` row: sales with a trade-in go through `complete_sale_evaluated`, and a trigger on `sale_trade_ins` rejects any trade-in whose evaluation is missing, unapproved or has a different value. Evaluations are written only via `create_evaluation` / `decide_evaluation`, which compute and snapshot the reference and adjustments server-side.
- CRM opportunities/tasks are editable only by their responsible user or members with team permission (RLS); changing a stage or linking a sale never touches stock or finance.
- Platform admin = `user_roles.admin` (no insert policy; granted only by backend SQL). `/admin` reads stores only through security-definer `admin_*` RPCs that call `require_platform_admin()` and never expose operational store data.
- Store access is gated server-side by `store_access_ok` inside `is_store_member` / `is_store_owner` / `has_store_permission`; `is_store_member_any` (no access gate) is used only for store, team, subscription and notification reads so suspended stores still see their account status. Billing status and access status are separate columns; missing/`legacy` subscriptions stay open.
- Plan price/limit are snapshotted into `store_subscriptions.contracted_price/user_limit` by `admin_assign_plan`; the user limit is enforced by triggers on `store_members` and `store_invites`.
- Owner-role changes go only through `set_member_role` / `remove_owner`, which lock the store row and refuse to leave zero owners; owner and admin actions are logged in `admin_audit` (no write policies).
- Sale notifications are created by a deferred constraint trigger on `sales` (fires at commit, unique per user+sale) and read per user from `notifications` via realtime.
