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
