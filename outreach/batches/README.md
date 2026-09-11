# Day 1 batch

`day1.json` is the 20 day-one targets in the shape the invite driver reads:
an array of `{company, name, url, note}`.

`name` and `url` are deliberately empty. Fill them in while you look at each
profile, one row at a time:

1. Run the row's `_search` string in LinkedIn search.
2. Open the person's profile and confirm they still hold the role.
3. Copy their first name into `name` and the profile URL into `url`.
4. Replace `{Name}` in `note` with the same first name.

The driver's name guard requires the profile's own name to contain the note's
first word, so a row whose `{Name}` is still a placeholder will be refused
rather than sent to the wrong person. That refusal is the guard working.

`_search` and `_portfolio` are notes for you and are ignored by the driver.

Dry run first, and only drop the flag once it reports clean:

    node linkedin_send_invites.mjs --batch day1.json --dry-run --max 20

This runs on the machine where a Chrome with a live LinkedIn session is
listening on 127.0.0.1:9227. It cannot run in a cloud session: there is no
logged-in browser there and no network route to linkedin.com.
