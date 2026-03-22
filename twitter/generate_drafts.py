#!/usr/bin/env python3
"""Generate a batch of tweet drafts for the Razzle Twitter account."""

import os
from pathlib import Path

DRAFTS_DIR = Path(__file__).parent / "queue" / "drafts"
DRAFTS_DIR.mkdir(parents=True, exist_ok=True)

drafts = [
    # === EVIDENCE (18 tweets) ===
    {
        "filename": "2026-03-21_07-00_evidence_lamar_qb1.md",
        "type": "evidence",
        "template": "quiet-data-drop",
        "pillar": "evidence",
        "topic": "Lamar Jackson QB1",
        "scheduled": "2026-03-21 07:00",
        "tweet": "lamar jackson finished with 430 PPR points. josh allen was second at 379.\n\nthat's a 51-point gap between QB1 and QB2. 41 passing TDs. 915 rushing yards.\n\nthe tape says what it says.",
        "image": "screenshots/lab_qb_fantasy_points_ppr_20260320_182702.png"
    },
    {
        "filename": "2026-03-21_12-00_evidence_chase_wr1.md",
        "type": "evidence",
        "template": "one-liner-stat",
        "pillar": "evidence",
        "topic": "Ja'Marr Chase WR1",
        "scheduled": "2026-03-21 12:00",
        "tweet": "ja'marr chase: 1708 receiving yards. 17 TDs. 127 receptions. 403 PPR points.\n\nthe WR2 was 85 points behind him.\n\nnumbers don't lie.",
        "image": "screenshots/lab_wr_fantasy_points_ppr_20260320_182655.png"
    },
    {
        "filename": "2026-03-21_18-00_evidence_saquon_2k.md",
        "type": "evidence",
        "template": "quiet-data-drop",
        "pillar": "evidence",
        "topic": "Saquon Barkley 2000 yard club",
        "scheduled": "2026-03-21 18:00",
        "tweet": "saquon barkley rushed for 2,005 yards in his first season in philly. 5.8 yards per carry. 22.2 PPG.\n\nthe tape doesn't care about your narrative.",
        "image": "screenshots/lab_rb_rushing_yards_20260320_182757.png"
    },
    {
        "filename": "2026-03-22_07-00_evidence_nabers_target_share.md",
        "type": "evidence",
        "template": "quiet-data-drop",
        "pillar": "evidence",
        "topic": "Malik Nabers target share",
        "scheduled": "2026-03-22 07:00",
        "tweet": "malik nabers commanded a 35.7% target share. highest in the entire league.\n\nhis WOPR was 0.850. no other receiver was close.\n\nthe giants offense ran through a rookie.",
        "image": "screenshots/lab_wr_target_share_20260320_182718.png"
    },
    {
        "filename": "2026-03-22_12-00_evidence_bowers_rookie.md",
        "type": "evidence",
        "template": "one-liner-stat",
        "pillar": "evidence",
        "topic": "Brock Bowers rookie TE record",
        "scheduled": "2026-03-22 12:00",
        "tweet": "brock bowers caught 112 passes as a rookie tight end. 1,194 yards. 15.5 PPG.\n\nhe did this on one of the worst offenses in the league.\n\nsleeping on him is a choice.",
        "image": "screenshots/lab_te_fantasy_points_ppr_20260320_182710.png"
    },
    {
        "filename": "2026-03-22_18-00_evidence_gibbs_efficiency.md",
        "type": "evidence",
        "template": "quiet-data-drop",
        "pillar": "evidence",
        "topic": "Jahmyr Gibbs RB1 on 55% snaps",
        "scheduled": "2026-03-22 18:00",
        "tweet": "jahmyr gibbs was the RB1 in PPR. 362.9 points. 20 total TDs.\n\nhe did it on 55.3% snap share.\n\nlet that sink in. RB1 on a timeshare.",
        "image": "screenshots/lab_rb_fantasy_points_ppr_20260320_182646.png"
    },
    {
        "filename": "2026-03-23_07-00_evidence_achane_receptions.md",
        "type": "evidence",
        "template": "quiet-data-drop",
        "pillar": "evidence",
        "topic": "De'Von Achane receptions",
        "scheduled": "2026-03-23 07:00",
        "tweet": "de'von achane caught 78 passes last season. 87 targets. 15.3% target share for a running back.\n\nthat's wide receiver volume from the RB position.\n\nthe tape says what it says.",
        "image": "screenshots/lab_rb_receptions_20260320_182851.png"
    },
    {
        "filename": "2026-03-23_18-00_evidence_cook_tds.md",
        "type": "evidence",
        "template": "one-liner-stat",
        "pillar": "evidence",
        "topic": "James Cook 16 TDs on half snaps",
        "scheduled": "2026-03-23 18:00",
        "tweet": "james cook scored 16 touchdowns on a 47.7% snap share.\n\nthat's elite production on part-time work. the efficiency is absurd.",
        "image": "screenshots/lab_rb_fantasy_points_ppr_20260320_182646.png"
    },
    {
        "filename": "2026-03-24_07-00_evidence_henry_ageless.md",
        "type": "evidence",
        "template": "quiet-data-drop",
        "pillar": "evidence",
        "topic": "Derrick Henry 1921 yards",
        "scheduled": "2026-03-24 07:00",
        "tweet": "derrick henry rushed for 1,921 yards. 5.9 yards per carry. 16 touchdowns.\n\nhe did this at age 30 in his first year in baltimore.\n\nthe aging curve said he was done. henry disagreed.",
        "image": "screenshots/lab_rb_rushing_yards_20260320_182757.png"
    },
    {
        "filename": "2026-03-24_12-00_evidence_daniels_rushing.md",
        "type": "evidence",
        "template": "quiet-data-drop",
        "pillar": "evidence",
        "topic": "Jayden Daniels rushing",
        "scheduled": "2026-03-24 12:00",
        "tweet": "jayden daniels rushed for 891 yards as a rookie QB. 6 rushing TDs. 20.9 PPG.\n\nonly lamar jackson had more rushing yards among quarterbacks.\n\nwashington found one.",
        "image": "screenshots/lab_qb_rushing_yards_20260320_182835.png"
    },
    {
        "filename": "2026-03-24_18-00_evidence_burrow_passing.md",
        "type": "evidence",
        "template": "quiet-data-drop",
        "pillar": "evidence",
        "topic": "Joe Burrow 43 TDs",
        "scheduled": "2026-03-24 18:00",
        "tweet": "joe burrow threw 43 touchdowns and 4,918 passing yards. the most prolific season of his career.\n\nand he wasn't even the overall QB1.\n\nthe QB position is absurd right now.",
        "image": "screenshots/lab_qb_passing_tds_20260320_182749.png"
    },
    {
        "filename": "2026-03-25_07-00_evidence_mcbride_te.md",
        "type": "evidence",
        "template": "quiet-data-drop",
        "pillar": "evidence",
        "topic": "Trey McBride 1146 yards",
        "scheduled": "2026-03-25 07:00",
        "tweet": "trey mcbride: 1,146 receiving yards. 111 receptions. 28.6% target share.\n\nthe only TE with more receptions was brock bowers. and mcbride barely had 2 TDs.\n\nimagine what happens when the touchdowns come.",
        "image": "screenshots/lab_te_target_share_20260320_182828.png"
    },
    {
        "filename": "2026-03-25_18-00_evidence_jjeff_wopr.md",
        "type": "evidence",
        "template": "quiet-data-drop",
        "pillar": "evidence",
        "topic": "Justin Jefferson WOPR king",
        "scheduled": "2026-03-25 18:00",
        "tweet": "justin jefferson's WOPR: 0.702. 29.5% target share. 37% air yards share.\n\nhe didn't have the most PPR points. but the usage profile says he's still the most scheme-proof WR in football.",
        "image": "screenshots/lab_wr_wopr_20260320_182805.png"
    },
    {
        "filename": "2026-03-26_07-00_evidence_btj_rookie.md",
        "type": "evidence",
        "template": "one-liner-stat",
        "pillar": "evidence",
        "topic": "Brian Thomas Jr. WR4",
        "scheduled": "2026-03-26 07:00",
        "tweet": "brian thomas jr. was the WR4 in PPR as a rookie. 1,282 yards. 10 TDs.\n\nhe did this in jacksonville. with that offense.\n\nsleeping on him is a choice.",
        "image": "screenshots/lab_wr_fantasy_points_ppr_20260320_182655.png"
    },
    {
        "filename": "2026-03-26_18-00_evidence_sutton_wopr.md",
        "type": "evidence",
        "template": "quiet-data-drop",
        "pillar": "evidence",
        "topic": "Courtland Sutton sneaky WOPR",
        "scheduled": "2026-03-26 18:00",
        "tweet": "courtland sutton's WOPR: 0.738. that's higher than amon-ra st. brown, drake london, and ceedee lamb.\n\nthe tape says he's undervalued.",
        "image": "screenshots/lab_wr_wopr_20260320_182805.png"
    },
    {
        "filename": "2026-03-27_07-00_evidence_chase_catch_rate.md",
        "type": "evidence",
        "template": "quiet-data-drop",
        "pillar": "evidence",
        "topic": "Chase catch rate on volume",
        "scheduled": "2026-03-27 07:00",
        "tweet": "ja'marr chase had a 72.6% catch rate on 175 targets. that's elite efficiency on massive volume.\n\nfor context — 175 targets is the most in the league. and he caught nearly 3 out of every 4.\n\nnumbers don't lie.",
        "image": "screenshots/lab_wr_catch_rate_20260320_182859.png"
    },
    {
        "filename": "2026-03-27_18-00_evidence_baker_gunslinger.md",
        "type": "evidence",
        "template": "counter-narrative",
        "pillar": "evidence",
        "topic": "Baker Mayfield gunslinger stats",
        "scheduled": "2026-03-27 18:00",
        "tweet": "baker mayfield threw 41 touchdowns.\n\nhe also threw 16 interceptions.\n\nthe QB4 overall in fantasy. but those turnovers tell a different story in real football. the tape is complicated.",
        "image": "screenshots/lab_qb_passing_tds_20260320_182749.png"
    },
    {
        "filename": "2026-03-28_07-00_evidence_kamara_targets.md",
        "type": "evidence",
        "template": "quiet-data-drop",
        "pillar": "evidence",
        "topic": "Alvin Kamara target share",
        "scheduled": "2026-03-28 07:00",
        "tweet": "alvin kamara had 89 targets. 21.3% target share. 18.9 PPG.\n\nhe's 30 and nobody's talking about him. the tape says he's still a top-10 PPR back.",
        "image": "screenshots/lab_rb_target_share_20260320_182726.png"
    },

    # === AGENT VERDICTS (13 tweets) ===
    {
        "filename": "2026-03-21_19-00_verdict_hawkeye_achane.md",
        "type": "agent-verdict",
        "template": "hawkeye-alert",
        "pillar": "agent-verdicts",
        "topic": "Hawkeye flags Achane's target share",
        "scheduled": "2026-03-21 19:00",
        "tweet": "hawkeye spotted it first.\n\nde'von achane's target share was 15.3%. that's top-5 among all running backs.\n\nthe film doesn't lie. he's a PPR weapon.",
        "image": "screenshots/lab_rb_target_share_20260320_182726.png"
    },
    {
        "filename": "2026-03-22_19-00_verdict_bones_sell_lamb.md",
        "type": "agent-verdict",
        "template": "bones-trade-play",
        "pillar": "agent-verdicts",
        "topic": "Bones says sell CeeDee Lamb",
        "scheduled": "2026-03-22 19:00",
        "tweet": "bones says sell ceedee lamb.\n\n152 targets. 6 touchdowns. that TD rate is unsustainable on that volume — or the touchdowns just aren't coming.\n\nyour leaguemate will overpay. they always do.",
        "image": "screenshots/lab_wr_receiving_tds_20260320_182842.png"
    },
    {
        "filename": "2026-03-23_12-00_verdict_bones_buy_higgins.md",
        "type": "agent-verdict",
        "template": "bones-trade-play",
        "pillar": "agent-verdicts",
        "topic": "Bones says buy Tee Higgins",
        "scheduled": "2026-03-23 12:00",
        "tweet": "bones says buy tee higgins.\n\n18.5 PPG when healthy. 10 TDs in 12 games. that's WR1 production at a WR2 price.\n\nhere's the play — buy the injury discount before your leaguemate does.",
        "image": "screenshots/lab_wr_fantasy_points_ppr_20260320_182655.png"
    },
    {
        "filename": "2026-03-24_19-00_verdict_octo_pitts.md",
        "type": "agent-verdict",
        "template": "octo-math-drop",
        "pillar": "agent-verdicts",
        "topic": "Octo on Kyle Pitts bust",
        "scheduled": "2026-03-24 19:00",
        "tweet": "octo ran the numbers.\n\nkyle pitts: 7.7 PPG. TE15. 13.9% target share in one of the league's best offenses.\n\nthe math says move on. the draft capital is a sunk cost.",
        "image": "screenshots/lab_te_fantasy_points_ppr_20260320_182710.png"
    },
    {
        "filename": "2026-03-25_12-00_verdict_atlas_henry.md",
        "type": "agent-verdict",
        "template": "atlas-history-lesson",
        "pillar": "agent-verdicts",
        "topic": "Atlas on Derrick Henry defying aging",
        "scheduled": "2026-03-25 12:00",
        "tweet": "atlas remembers.\n\nlast time a running back rushed for 1,900+ yards at age 30, it didn't happen. nobody did it.\n\nderrick henry just rewrote the aging curve. history says respect the king.",
        "image": "screenshots/panel_aging-curves_20260320_182933.png"
    },
    {
        "filename": "2026-03-26_12-00_verdict_atlas_kelce.md",
        "type": "agent-verdict",
        "template": "atlas-history-lesson",
        "pillar": "agent-verdicts",
        "topic": "Atlas on Kelce decline",
        "scheduled": "2026-03-26 12:00",
        "tweet": "atlas remembers.\n\ntravis kelce averaged 12.2 PPG. TE5. that's still good — but it's not the kelce premium your leaguemate is paying for.\n\nhistory says the window is closing. sell the name.",
        "image": "screenshots/lab_te_fantasy_points_ppr_20260320_182710.png"
    },
    {
        "filename": "2026-03-27_12-00_verdict_hawkeye_jonnu.md",
        "type": "agent-verdict",
        "template": "hawkeye-alert",
        "pillar": "agent-verdicts",
        "topic": "Hawkeye flags Jonnu Smith breakout",
        "scheduled": "2026-03-27 12:00",
        "tweet": "hawkeye spotted it first.\n\njonnu smith: 222 PPR points. 88 catches. 8 TDs. TE4 overall.\n\nnobody drafted him there. the film shows a legitimate breakout.",
        "image": "screenshots/panel_breakouts_20260320_182907.png"
    },
    {
        "filename": "2026-03-28_18-00_verdict_bones_sell_tyreek.md",
        "type": "agent-verdict",
        "template": "bones-trade-play",
        "pillar": "agent-verdicts",
        "topic": "Bones says sell Tyreek Hill",
        "scheduled": "2026-03-28 18:00",
        "tweet": "bones says sell tyreek hill.\n\n12.8 PPG. that's WR24 territory. the speed is still there but the production isn't.\n\nyour leaguemate still sees the name. that's your window.",
        "image": "screenshots/panel_trade-values_20260320_182912.png"
    },
    {
        "filename": "2026-03-29_07-00_verdict_razzle_mhj.md",
        "type": "agent-verdict",
        "template": "quiet-data-drop",
        "pillar": "agent-verdicts",
        "topic": "Razzle on MHJ disappointing rookie year",
        "scheduled": "2026-03-29 07:00",
        "tweet": "pulled the film on marvin harrison jr.\n\n11.6 PPG. WR30. 116 targets but only 62 catches.\n\nthe talent is obvious. the production wasn't. year 2 is the real test.",
        "image": "screenshots/lab_wr_fantasy_points_ppr_20260320_182655.png"
    },
    {
        "filename": "2026-03-29_18-00_verdict_bones_buy_london.md",
        "type": "agent-verdict",
        "template": "bones-trade-play",
        "pillar": "agent-verdicts",
        "topic": "Bones says buy Drake London",
        "scheduled": "2026-03-29 18:00",
        "tweet": "bones says buy drake london.\n\n28.2% target share. 158 targets. 100 catches. 16.5 PPG.\n\nhe's being drafted as a WR2 with WR1 usage. that's the definition of a buy.",
        "image": "screenshots/lab_wr_target_share_20260320_182718.png"
    },
    {
        "filename": "2026-03-30_12-00_verdict_hawkeye_mcconkey.md",
        "type": "agent-verdict",
        "template": "hawkeye-alert",
        "pillar": "agent-verdicts",
        "topic": "Hawkeye flags Ladd McConkey",
        "scheduled": "2026-03-30 12:00",
        "tweet": "hawkeye spotted it first.\n\nladd mcconkey: 1,149 receiving yards. 82 catches. 15.1 PPG as a rookie.\n\nwith herbert throwing to him and a 25.7% target share — year 2 should be louder.",
        "image": "screenshots/lab_wr_fantasy_points_ppr_20260320_182655.png"
    },
    {
        "filename": "2026-03-30_18-00_verdict_dolphin_nico.md",
        "type": "agent-verdict",
        "template": "quiet-data-drop",
        "pillar": "agent-verdicts",
        "topic": "Dr. Dolphin on Nico Collins",
        "scheduled": "2026-03-30 18:00",
        "tweet": "dr. dolphin checked the charts.\n\nnico collins: 17.6 PPG when healthy. that's top-5 WR production. 24.9% target share.\n\nthe talent isn't the question. availability is. monitor the situation.",
        "image": "screenshots/panel_consistency_20260320_182923.png"
    },
    {
        "filename": "2026-03-31_07-00_verdict_team_disagreement.md",
        "type": "agent-verdict",
        "template": "team-disagreement",
        "pillar": "agent-verdicts",
        "topic": "Team disagrees on Puka Nacua",
        "scheduled": "2026-03-31 07:00",
        "tweet": "bones says buy puka nacua. octo says hold.\n\n18.8 PPG. 32.6% target share. but only 11 games played.\n\nwhen they disagree, i check the tape. the tape says buy — if you can stomach the injury risk.",
        "image": "screenshots/panel_consistency_20260320_182923.png"
    },

    # === COMMUNITY (10 tweets) ===
    {
        "filename": "2026-03-21_13-00_community_rb1_poll.md",
        "type": "community",
        "template": "community-engagement",
        "pillar": "community",
        "topic": "Dynasty RB1 poll",
        "scheduled": "2026-03-21 13:00",
        "tweet": "dynasty RB1 heading into 2025.\n\ngibbs — 362 PPR, 20 TDs, 55% snaps.\nbarkley — 2,005 rush yards, 22.2 PPG.\nbijan — 1,456 yards, most well-rounded.\n\nwho are you taking?",
        "image": "screenshots/lab_rb_fantasy_points_ppr_20260320_182646.png"
    },
    {
        "filename": "2026-03-22_13-00_community_kelce_take.md",
        "type": "community",
        "template": "leaguemate-callout",
        "pillar": "community",
        "topic": "Kelce owners in denial",
        "scheduled": "2026-03-22 13:00",
        "tweet": "if your leaguemate still has kelce ranked as a top-3 dynasty TE over bowers and mcbride... send them this.\n\n12.2 PPG vs 15.5 PPG and 15.2 PPG.\n\nthe tape has moved on.",
        "image": "screenshots/lab_te_fantasy_points_ppr_20260320_182710.png"
    },
    {
        "filename": "2026-03-23_13-00_community_mhj_btj.md",
        "type": "community",
        "template": "leaguemate-callout",
        "pillar": "community",
        "topic": "MHJ vs BTJ comparison",
        "scheduled": "2026-03-23 13:00",
        "tweet": "if your leaguemate is ranking marvin harrison jr. over brian thomas jr. in dynasty... send them this.\n\nBTJ: 16.7 PPG, 1,282 yards, 10 TDs.\nMHJ: 11.6 PPG, 885 yards, 8 TDs.\n\nthe tape doesn't care about draft capital.",
        "image": "screenshots/lab_wr_fantasy_points_ppr_20260320_182655.png"
    },
    {
        "filename": "2026-03-25_13-00_community_wr_rank.md",
        "type": "community",
        "template": "community-engagement",
        "pillar": "community",
        "topic": "Rank these WRs",
        "scheduled": "2026-03-25 13:00",
        "tweet": "rank these WRs for dynasty 2025:\n\nja'marr chase — 403 PPR\njustin jefferson — 317 PPR, highest WOPR\nmalik nabers — 35.7% target share\n\nwrong answers only... just kidding. there are no wrong answers here.",
        "image": "screenshots/lab_wr_fantasy_points_ppr_20260320_182655.png"
    },
    {
        "filename": "2026-03-26_13-00_community_qb_worry.md",
        "type": "community",
        "template": "community-engagement",
        "pillar": "community",
        "topic": "QB worry poll",
        "scheduled": "2026-03-26 13:00",
        "tweet": "which QB situation are you most worried about heading into 2025?\n\nmahomes — 17.7 PPG, falling from elite to just good\nherbert — 16.8 PPG, new offense\nstroud — 13.0 PPG, sophomore slump\n\nthe lab is watching all three.",
        "image": "screenshots/lab_qb_fantasy_points_ppr_20260320_182702.png"
    },
    {
        "filename": "2026-03-28_12-00_community_underrated_rb.md",
        "type": "community",
        "template": "community-engagement",
        "pillar": "community",
        "topic": "Most underrated RB",
        "scheduled": "2026-03-28 12:00",
        "tweet": "most underrated RB in fantasy right now?\n\nchuba hubbard — 16.1 PPG, 1,195 rush yards, 10 TDs.\njames conner — 15.9 PPG, 1,094 yards.\nchase brown — 15.9 PPG, 54 catches.\n\nthe screener doesn't lie. name yours.",
        "image": "screenshots/lab_rb_fantasy_points_ppr_20260320_182646.png"
    },
    {
        "filename": "2026-03-29_12-00_community_te_value.md",
        "type": "community",
        "template": "community-engagement",
        "pillar": "community",
        "topic": "Best value TE debate",
        "scheduled": "2026-03-29 12:00",
        "tweet": "best dynasty TE value right now:\n\nbowers — 15.5 PPG, 112 catches, 22 years old.\nmcbride — 15.2 PPG, 111 catches, 1,146 yards.\nkittle — 15.8 PPG, 8 TDs, still elite.\n\none of these is being drafted too low.",
        "image": "screenshots/lab_te_fantasy_points_ppr_20260320_182710.png"
    },
    {
        "filename": "2026-03-31_12-00_community_dynasty_buy.md",
        "type": "community",
        "template": "community-engagement",
        "pillar": "community",
        "topic": "Offseason dynasty buy",
        "scheduled": "2026-03-31 12:00",
        "tweet": "what player are you buying everywhere this offseason?\n\nthe lab has a few ideas. but razzle wants to hear yours first.\n\nname one player. defend it with one stat.",
        "image": "screenshots/panel_trade-values_20260320_182912.png"
    },
    {
        "filename": "2026-04-01_12-00_community_startup_101.md",
        "type": "community",
        "template": "community-engagement",
        "pillar": "community",
        "topic": "Dynasty startup 1.01",
        "scheduled": "2026-04-01 12:00",
        "tweet": "dynasty startup drafts are firing up.\n\nwho's your 1.01 right now?\n\nlamar — 430 PPR, but QB.\nchase — 403 PPR, WR1 by a mile.\ngibbs — 362 PPR, 20 TDs, 23 years old.\n\nthe lab has opinions. what's yours?",
        "image": "screenshots/panel_dynasty-rankings_20260320_182928.png"
    },
    {
        "filename": "2026-04-02_12-00_community_trade_nobody_talking.md",
        "type": "community",
        "template": "community-engagement",
        "pillar": "community",
        "topic": "Underrated dynasty trade",
        "scheduled": "2026-04-02 12:00",
        "tweet": "the dynasty trade nobody is talking about right now.\n\ndrop it below. razzle will pull the film on the best ones.",
        "image": "screenshots/panel_trade-values_20260320_182912.png"
    },

    # === PROSPECTS (8 tweets) ===
    {
        "filename": "2026-03-28_19-00_prospects_bowers_precedent.md",
        "type": "prospects",
        "template": "atlas-history-lesson",
        "pillar": "prospects",
        "topic": "Atlas on Bowers' rookie precedent",
        "scheduled": "2026-03-28 19:00",
        "tweet": "atlas remembers.\n\nthe last rookie TE to catch 112 passes? it didn't happen. brock bowers broke the record.\n\nhistory says year 2 is when elite TEs take the leap. buckle up.",
        "image": "screenshots/lab_te_fantasy_points_ppr_20260320_182710.png"
    },
    {
        "filename": "2026-03-30_07-00_prospects_btj_tape.md",
        "type": "prospects",
        "template": "hawkeye-alert",
        "pillar": "prospects",
        "topic": "Hawkeye on BTJ year 2 potential",
        "scheduled": "2026-03-30 07:00",
        "tweet": "hawkeye pulled the film on brian thomas jr.\n\n1,282 yards. 10 TDs. 25.5% target share. all as a rookie in jacksonville.\n\nyear 2 WR breakouts are real. the film says he's just getting started.",
        "image": "screenshots/lab_wr_fantasy_points_ppr_20260320_182655.png"
    },
    {
        "filename": "2026-03-31_18-00_prospects_bo_nix.md",
        "type": "prospects",
        "template": "atlas-history-lesson",
        "pillar": "prospects",
        "topic": "Atlas on Bo Nix rookie season",
        "scheduled": "2026-03-31 18:00",
        "tweet": "atlas remembers.\n\nbo nix: QB7 as a rookie. 29 passing TDs. 430 rushing yards. 18.7 PPG.\n\nthe last rookie QB to finish top-7? lamar jackson in 2019. the precedent is promising.",
        "image": "screenshots/lab_qb_fantasy_points_ppr_20260320_182702.png"
    },
    {
        "filename": "2026-04-01_07-00_prospects_daniels_history.md",
        "type": "prospects",
        "template": "atlas-history-lesson",
        "pillar": "prospects",
        "topic": "Atlas on Jayden Daniels rushing QB history",
        "scheduled": "2026-04-01 07:00",
        "tweet": "atlas remembers.\n\njayden daniels rushed for 891 yards in year 1. only lamar jackson and robert griffin III had comparable rookie rushing seasons for a QB.\n\nhistory says the rushing volume holds — if the legs do.",
        "image": "screenshots/lab_qb_rushing_yards_20260320_182835.png"
    },
    {
        "filename": "2026-04-01_18-00_prospects_bryce_young.md",
        "type": "prospects",
        "template": "counter-narrative",
        "pillar": "prospects",
        "topic": "Bryce Young sneaky revival",
        "scheduled": "2026-04-01 18:00",
        "tweet": "everyone wrote off bryce young.\n\n13.9 PPG in his limited starts. 6 rushing TDs. 249 rushing yards.\n\nnarrator: the reports of his demise were... slightly exaggerated. the film shows flashes.",
        "image": "screenshots/lab_qb_fantasy_points_ppr_20260320_182702.png"
    },
    {
        "filename": "2026-04-02_07-00_prospects_nabers_year2.md",
        "type": "prospects",
        "template": "hawkeye-alert",
        "pillar": "prospects",
        "topic": "Hawkeye on Nabers year 2 breakout",
        "scheduled": "2026-04-02 07:00",
        "tweet": "hawkeye spotted it first.\n\nmalik nabers had a 35.7% target share and 0.850 WOPR as a rookie. with a real QB upgrade, year 2 could be special.\n\nthe film says WR1 ceiling.",
        "image": "screenshots/lab_wr_target_share_20260320_182718.png"
    },
    {
        "filename": "2026-04-02_18-00_prospects_draft_lab.md",
        "type": "prospects",
        "template": "quiet-data-drop",
        "pillar": "prospects",
        "topic": "The Lab is scouting 2025 prospects",
        "scheduled": "2026-04-02 18:00",
        "tweet": "35 days until the NFL Draft.\n\nthe lab is running every prospect through the screener. hawkeye is watching the tape. atlas is pulling the historical comps.\n\nthe data drops start soon.",
        "image": "screenshots/panel_dynasty-rankings_20260320_182928.png"
    },
    {
        "filename": "2026-04-03_07-00_prospects_caleb_year2.md",
        "type": "prospects",
        "template": "quiet-data-drop",
        "pillar": "prospects",
        "topic": "Caleb Williams year 2 outlook",
        "scheduled": "2026-04-03 07:00",
        "tweet": "caleb williams: 15.0 PPG. 20 passing TDs. 489 rushing yards. 6 interceptions.\n\nthe efficiency wasn't elite. but the floor was. lowest INT rate among rookie QBs.\n\nyear 2 with a real supporting cast? the lab is watching.",
        "image": "screenshots/lab_qb_fantasy_points_ppr_20260320_182702.png"
    },

    # === MASCOT (3 tweets) ===
    {
        "filename": "2026-03-23_19-00_mascot_pulled_film.md",
        "type": "mascot",
        "template": "mascot",
        "pillar": "mascot",
        "topic": "Razzle pulled the film",
        "scheduled": "2026-03-23 19:00",
        "tweet": "pulled the film on every player in the league.\n\nthe lab has opinions. the data has receipts.\n\nrazzle.lol",
        "image": "screenshots/lab_rb_fantasy_points_ppr_20260320_182646.png"
    },
    {
        "filename": "2026-03-27_19-00_mascot_six_agents.md",
        "type": "mascot",
        "template": "mascot",
        "pillar": "mascot",
        "topic": "Six agents one Lab",
        "scheduled": "2026-03-27 19:00",
        "tweet": "six agents. one screener. every stat that matters.\n\nhawkeye watches the film. bones runs the trades. octo crunches the numbers. atlas remembers the history.\n\nthe lab is open. razzle.lol",
        "image": "screenshots/panel_efficiency_20260320_182917.png"
    },
    {
        "filename": "2026-04-03_18-00_mascot_draft_szn.md",
        "type": "mascot",
        "template": "mascot",
        "pillar": "mascot",
        "topic": "Draft season is coming",
        "scheduled": "2026-04-03 18:00",
        "tweet": "draft season is coming.\n\nthe lab has been running the numbers since january. six agents. 2,000 players. every stat you've ever wanted.\n\nthe data drops are about to get loud.\n\nrazzle.lol",
        "image": "screenshots/panel_dynasty-rankings_20260320_182928.png"
    },

    # === BONUS EVIDENCE (more data drops to hit 52) ===
    {
        "filename": "2026-04-03_12-00_evidence_amonra_volume.md",
        "type": "evidence",
        "template": "quiet-data-drop",
        "pillar": "evidence",
        "topic": "Amon-Ra St. Brown volume king",
        "scheduled": "2026-04-03 12:00",
        "tweet": "amon-ra st. brown: 115 receptions. 26.7% target share. 18.6 PPG.\n\nhe's been a top-3 PPR WR for two straight years. the consistency is the superpower.\n\nthe tape says what it says.",
        "image": "screenshots/lab_wr_fantasy_points_ppr_20260320_182655.png"
    },
    {
        "filename": "2026-04-04_07-00_evidence_london_targets.md",
        "type": "evidence",
        "template": "quiet-data-drop",
        "pillar": "evidence",
        "topic": "Drake London 158 targets",
        "scheduled": "2026-04-04 07:00",
        "tweet": "drake london saw 158 targets. that's the 2nd most in the entire league behind ja'marr chase's 175.\n\n100 catches. 28.2% target share.\n\nthe volume is real. the breakout is here.",
        "image": "screenshots/lab_wr_target_share_20260320_182718.png"
    },
    {
        "filename": "2026-04-04_18-00_evidence_jsn_quiet.md",
        "type": "evidence",
        "template": "quiet-data-drop",
        "pillar": "evidence",
        "topic": "JSN quiet consistency",
        "scheduled": "2026-04-04 18:00",
        "tweet": "jaxon smith-njigba: 100 catches. 1,130 yards. 14.9 PPG. 23.8% target share.\n\nnobody is talking about him. the tape says he's a locked-in WR2 with WR1 weeks.\n\nsleeping on him is a choice.",
        "image": "screenshots/lab_wr_fantasy_points_ppr_20260320_182655.png"
    },
    {
        "filename": "2026-04-05_07-00_evidence_hurts_rushing.md",
        "type": "evidence",
        "template": "quiet-data-drop",
        "pillar": "evidence",
        "topic": "Jalen Hurts rushing TDs",
        "scheduled": "2026-04-05 07:00",
        "tweet": "jalen hurts threw 18 passing TDs. that's not great.\n\nbut he ran for 14 rushing TDs. 630 rushing yards. 21.0 PPG.\n\nthe legs carry the fantasy value. and the legs are still there.",
        "image": "screenshots/lab_qb_rushing_yards_20260320_182835.png"
    },
    {
        "filename": "2026-04-05_12-00_evidence_dobbins_efficiency.md",
        "type": "evidence",
        "template": "quiet-data-drop",
        "pillar": "evidence",
        "topic": "JK Dobbins comeback efficiency",
        "scheduled": "2026-04-05 12:00",
        "tweet": "j.k. dobbins: 14.8 PPG. 4.6 yards per carry. 9 TDs in 13 games.\n\na torn achilles couldn't stop him. that's top-12 RB production when healthy.\n\nthe tape says the comeback was real.",
        "image": "screenshots/lab_rb_yards_per_carry_20260320_182820.png"
    },
    {
        "filename": "2026-04-05_18-00_evidence_bucky_irving.md",
        "type": "evidence",
        "template": "quiet-data-drop",
        "pillar": "evidence",
        "topic": "Bucky Irving rookie efficiency",
        "scheduled": "2026-04-05 18:00",
        "tweet": "bucky irving: 5.4 yards per carry. 1,122 rushing yards. 47 catches.\n\nhe did this as a rookie on 44.4% snap share. with rachaad white still getting work.\n\nimagine the ceiling if the share grows.",
        "image": "screenshots/lab_rb_yards_per_carry_20260320_182820.png"
    },
]

# Write all drafts
for d in drafts:
    filepath = DRAFTS_DIR / d["filename"]
    content = f"""---
type: {d['type']}
template: {d['template']}
pillar: {d['pillar']}
topic: "{d['topic']}"
scheduled: {d['scheduled']}
---

## Tweet

{d['tweet']}

## Image

{d['image']}
"""
    filepath.write_text(content, encoding="utf-8")
    print(f"  Draft: {d['filename']}")

print(f"\nTotal drafts generated: {len(drafts)}")
