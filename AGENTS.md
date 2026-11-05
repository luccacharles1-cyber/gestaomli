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
