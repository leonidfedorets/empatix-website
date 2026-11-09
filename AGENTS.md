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

- Keep Services benefits inside the comparison section with their own CMS marker, so they share the table's layout while remaining independently editable.
- The retired estimate workflow has no application routes, submission handlers or notification module; keep Contact submissions independent so retiring one workflow cannot disable the other.
- Admin password setup uses an email recovery session on the public /admin/reset-password page; never distribute generated account passwords in chat.
- Administrator-initiated password changes use an authenticated server function with role and target checks and Auth's admin API; never store passwords in application data or audit logs.
- Insights administration uses dedicated article endpoints over content_items, with collection-scoped RLS and shared public/preview templates; this keeps content editing separate from site design.
- Administrator revocation uses admin_access before Auth bans or deletion, with database triggers protecting the last active administrator; existing tokens must immediately lose privileges.
- Rich article HTML is allowlisted on save and public read, retaining only content formatting; never render arbitrary editor HTML without sanitization.
