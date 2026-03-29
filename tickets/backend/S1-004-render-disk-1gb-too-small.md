# S1-004: Render disk 1GB with ~924MB database — near full

**Severity**: S1 (High)
**Category**: performance
**Source**: EDGE-CASES.md #13
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`render.yaml:16-19` — Disk is configured at exactly 1GB:

```yaml
disk:
  name: razzle-data
  mountPath: /data
  sizeGB: 1
```

Database is ~260MB (terminal.db) + users.db + WAL journals + temp files. Under complex queries, SQLite uses temp storage for sorting/grouping. With only ~76MB free, `SQLITE_FULL` errors will occur during peak traffic.

## Fix

Change `sizeGB: 1` to `sizeGB: 2` in render.yaml.

## Files to Change

- `render.yaml:19` — `sizeGB: 2`

## Accept When

1. `render.yaml` specifies `sizeGB: 2`
2. Deployment succeeds with the larger disk

## Do NOT Touch

- Database structure or queries — disk size is the fix
- `mountPath` — keep `/data`
