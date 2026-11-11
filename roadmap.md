# Invitation access review
- [x] Copy an existing invite from Team and compare fresh-browser app and hosted preview access.
- [x] Preserve the public invitation and confirmation return; warn about restricted preview links and prefer a configured published origin.
- [x] Test a disposable second account: login, explicit acceptance, membership, wrong-email rejection and protected routes.
- [x] Run 45 tests, confirm build OK and remove disposable account, membership and invitation.
- [x] Report the hosting restriction and email/public-deployment verification limits; stop here.

Observed: Team copied the current origin plus the existing invitation token; opening that token on the hosted preview in a fresh browser redirected to Lovable login before the app. The same invitation path was public on localhost. A newly provisioned, verified password account returned from login to acceptance, had no membership before acceptance, and entered the correct store as seller only after the RPC completed. Wrong-email UI and direct RPC acceptance were rejected; used links were rejected; anonymous app/admin and mobile logout checks passed, with no page errors.

Limits: no published URL exists; external invitation access requires publication (or a separately created shared preview). Actual signup email delivery, opening a confirmation email in another browser, and a published-site flow were not tested. The confirmation redirect contains the invitation destination and auth now responds to a newly confirmed session. Existing accounts, roles and invitations remain unchanged.