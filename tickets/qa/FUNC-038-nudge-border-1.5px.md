# FUNC-038: Agent Nudge Border 1.5px Violates Design Guide

**Severity**: P2
**Flow**: N/A (new feature)
**Status**: OPEN
**Session**: 35
**Date**: 2026-03-21

## Description

agent-nudges.js line 145 uses `border:1.5px solid` for the nudge card.
DESIGN.md requires minimum 2px borders on all components.

## Fix

Change `border:1.5px solid` to `border:2px solid` in renderAgentNudge().

## Impact

Minor visual inconsistency. Only visible to Elite users.
