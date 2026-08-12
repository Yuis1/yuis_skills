[English](LEGACY.md) | [简体中文](LEGACY.zh-CN.md)

# Legacy-Test Migration

Read this only when migrating test ownership, resetting the test foundation, or deleting many old tests and Fixtures.

## Establish a Contract Map First

Record each item as:

`behavior ID → old evidence → evidence under the new Owner → disposition`

Classify old tests as:

- public behavioral contracts;
- checks coupled to private implementation;
- duplicate scenarios; or
- assembly, Fixtures, or forwarding that exist only for an old compatibility path.

Do not migrate mechanically by filename, line count, or test count.

## Migration Sequence

1. Before deletion, establish what each old test actually proves.
2. Assign a new authoritative test location for every public behavior.
3. For existing behavior, the new test should generally pass against the old implementation, proving that the contract was not reinvented.
4. A test for new behavior or an architecture-transition contract may fail against the old implementation, but state what the failure means.
5. Only after the new authoritative evidence passes may the same slice remove duplicate tests, private Helpers, locators, dynamic forwarding, and old Fixtures.
6. Verify the affected Owner and true dependency closure, and record contracts that were not migrated.

Do not delete old tests first and then rewrite them from the new implementation or from memory. If the continuing value of an old test cannot be established, retain it and record it as pending confirmation.

## Test Foundation

Product implementation, test-foundation resets, and quality-gate rules use separate Diffs by default. If the test foundation blocks a product slice, freeze the product candidate first and split out a prerequisite foundation slice, so product behavior changes are not hidden inside broad test migration.
