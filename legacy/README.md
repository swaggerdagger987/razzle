# Legacy Quarry — V1 Read-Only Pitstop

This directory holds the V1 Razzle codebase staged during the V2 strangler-fig migration. It is **quarry material**, not active product code.

**Rules:**

1. **Do not add new features here.** Implement in `apps/api`, `apps/web`, or `packages/`.
2. **Do not import from `legacy/` directly.** V2 uses a single bridge module.
3. **Do not delete this tree** until the retirement checklist below is complete.
4. **Treat as read-only reference** for proven SQL, Sleeper integration, and agent context patterns.

---

## Approved bridge

The only supported entry point from V2 into legacy:

```
apps/api/legacy_bridge.py
```

It injects `legacy/` onto `sys.path` and exposes four cached importers:

| Function | Legacy module | Purpose |
|----------|---------------|---------|
| `live_data()` | `backend.live_data` | Screener, dynasty, analytics queries |
| `auth()` | `backend.auth` | JWT, bcrypt, Sleeper-ID uniqueness |
| `billing()` | `backend.billing` | Stripe webhooks, plan state |
| `agent_facts()` | `backend.agent_facts` | Agent context assembly |

**Finding bridge usage:**

```bash
rg "legacy_bridge" apps/api
rg "from legacy_bridge|import legacy_bridge" apps/api
```

Any new legacy dependency must go through `legacy_bridge.py` with an explicit comment and an entry in this README.

---

## What lives here

Typical layout (may vary):

```
legacy/
  backend/
    live_data/     Data queries (players, dynasty, analytics, ...)
    auth.py        Session/JWT auth
    billing.py     Stripe integration
    agent_facts.py Agent prompt context
  frontend/        V1 HTML/JS/CSS (reference only)
  adapters/        V1 data adapters (mostly ported to apps/api/adapters/)
```

See **`PRESERVE.md`** at repo root for the full preservation manifest and V1-to-V2 path mapping.

---

## Deletion checklist

Execute only when V2 no longer needs the bridge. See also `docs/plans/2026-05-27-repo-organization-cleanup.md` Phase 4.

- [ ] Zero imports of `legacy_bridge` outside transitional shims
- [ ] All screener/dynasty/analytics SQL inlined in `apps/api/services/`
- [ ] Auth on managed provider OR fully ported to `apps/api/services/auth/`
- [ ] Billing reads/writes V2-native tables; webhooks idempotent without reconciliation loop
- [ ] `agent_facts` logic ported to `apps/api/services/agents/`
- [ ] `pytest apps/api/tests` passes with `legacy/` removed from path
- [ ] `docs/v2/ACCEPTANCE.md` gates green on localhost
- [ ] Git tag created: `legacy-quarry-final`
- [ ] Delete `apps/api/legacy_bridge.py`, then delete `legacy/`
- [ ] Update `PRESERVE.md` and `docs/v2/STATUS.md`

---

## Recovery

If something was deleted prematurely:

```bash
git log --oneline -- legacy/
git checkout <commit> -- legacy/path/to/file
```

Prefer porting the logic into V2 over restoring long-term dependency on this tree.
