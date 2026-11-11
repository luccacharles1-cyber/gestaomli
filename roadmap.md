# Authentication review
- [x] Verify signed-out access and reproduce automatic login with an existing valid session.
- [x] Add shared profile sign-out in store and admin; clear account caches.
- [x] Preserve invite destination and require a recovery link for password setup.
- [x] Run 37 automated tests and fresh-browser password/logout checks, including mobile and desktop admin menus.

Verification limits: invite return tested with an invalid token, not new membership acceptance; store menu tested on first-access screen, not an existing store; email delivery and password completion via a received recovery email not exercised. Existing users and roles unchanged; disposable test account and its temporary admin role removed.