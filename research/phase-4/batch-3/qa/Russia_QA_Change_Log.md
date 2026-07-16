# Russia QA Type-Handling Fix

- Failed item: 14 — `marketplace not national demand`.
- Exception: `TypeError: '<' not supported between instances of 'str' and 'int'`.
- Failing value: CSV `Engine demand` value `'6'` (string); expected comparison input: integer.
- Root cause: `csv.DictReader` returns text, but item 14 compared the text directly with integer `10`.
- Fix: `demand_below()` converts the CSV value with `int()` before comparison; it does not suppress errors or alter the business threshold.
- Regression test: string `'6'` evaluates below 10; `'10'` does not.
- Research data diff against `0f545ba`: none. Only QA script/test/report/change-log are modified.
