# Authentication test files (reference list)

If you need to remove or relocate auth tests later, these are the files created for this module:

```text
apps/accounts/tests/__init__.py
apps/accounts/tests/test_auth.py
pytest.ini
```

Project-wide test config:

```text
pytest.ini   (root of backend/)
```

Do **not** delete migration files or `apps/accounts/tests/` unless you are replacing the test suite entirely.
