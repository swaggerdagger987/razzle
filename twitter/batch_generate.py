#!/usr/bin/env python3
"""Batch generate tweet drafts for April 6-24, 2026."""
import os

DRAFT_DIR = os.path.join(os.path.dirname(__file__), "queue", "drafts")
os.makedirs(DRAFT_DIR, exist_ok=True)

drafts = [
    # ===== EVIDENCE (20) =====
    {
        "filename": "2026-04-06_07-00_evidence_burrow_monster.md",
        "content": """---
type: evidence
template: quiet-data-drop
pillar: evidence
topic: "Joe Burrow 4,918 passing yards and 43 TDs"
scheduled: 2026-04-06 07:00
---

## Tweet

joe burrow threw for 4,918 yards and 43 touchdowns last season. league highs in both.

the 14 turnovers? that's the price of a gunslinger with a 108.5 passer rating.

the tape says what it says.

## Image

screenshots/lab_qb_passing_tds_20260320_182749.png
"""
    },
    {
        "filename": "2026-04-06_18-00_evidence_nabers_wopr.md",
        "content": """---
type: evidence
template: quiet-data-drop
pillar: evidence
topic: "Malik Nabers 0.850 WOPR highest in the league"
scheduled: 2026-04-06 18:00
---

## Tweet

malik nabers posted a 0.850 WOPR last season. that's the highest in the entire NFL.

35.7% target share. 170 targets. as a rookie.

the giants have one offensive weapon and his name is nabers. numbers don't lie.

## Image

screenshots/lab_wr_wopr_20260320_182805.png
"""
    },
    {
        "filename": "2026-04-07_07-00_evidence_higgins_ppg.md",
        "content": """---
type: evidence
template: quiet-data-drop
pillar: evidence
topic: "Tee Higgins 18.5 PPG best WR per-game"
scheduled: 2026-04-07 07:00
---

## Tweet

tee higgins averaged 18.5 PPR points per game last season. that's WR2 on a per-game basis behind only chase.

10 TDs. 26.1% target share. 911 yards in 12 games.

the only thing keeping him off dynasty boards is the "if healthy" asterisk. the production is not in question.

## Image

screenshots/lab_wr_fantasy_points_ppr_20260320_182655.png
"""
    },
    {
        "filename": "2026-04-07_18-00_evidence_nacua_ppg.md",
        "content": """---
type: evidence
template: quiet-data-drop
pillar: evidence
topic: "Puka Nacua 18.8 PPG highest WR per-game"
scheduled: 2026-04-07 18:00
---

## Tweet

puka nacua averaged 18.8 PPR points per game in 2024. that's the highest per-game mark among all wide receivers.

32.6% target share. 79 receptions in 11 games.

he missed 6 games and still finished WR26 in total points. healthy puka is a top-3 dynasty asset.

## Image

screenshots/lab_wr_target_share_20260320_182718.png
"""
    },
    {
        "filename": "2026-04-08_07-00_evidence_caleb_zero_rushtd.md",
        "content": """---
type: evidence
template: quiet-data-drop
pillar: evidence
topic: "Caleb Williams 489 rush yards zero rushing TDs"
scheduled: 2026-04-08 07:00
---

## Tweet

caleb williams rushed for 489 yards last season. zero rushing touchdowns.

489 yards. zero TDs. that's historically unusual for a mobile quarterback.

jayden daniels had 891 rush yards and 6 TDs. lamar had 915 and 4. caleb had 489 and... nothing.

positive TD regression is coming. or the bears are just that bad at the goal line.

## Image

screenshots/lab_qb_rushing_yards_20260320_182835.png
"""
    },
    {
        "filename": "2026-04-09_07-00_evidence_andrews_tds.md",
        "content": """---
type: evidence
template: quiet-data-drop
pillar: evidence
topic: "Mark Andrews 11 TDs on 55 receptions"
scheduled: 2026-04-09 07:00
---

## Tweet

mark andrews scored 11 touchdowns on just 55 receptions last season. that's a 20% TD rate per catch.

for context — brock bowers had 5 TDs on 112 receptions. george kittle had 8 on 78.

andrews is the most TD-dependent tight end in football. the question is whether 20% is sustainable.

(narrator: historically, it is not.)

## Image

screenshots/lab_te_receiving_tds_20260320_181037.png
"""
    },
    {
        "filename": "2026-04-10_07-00_evidence_kyren_volume.md",
        "content": """---
type: evidence
template: quiet-data-drop
pillar: evidence
topic: "Kyren Williams 1,299 yards 16 TDs 4.1 YPC"
scheduled: 2026-04-10 07:00
---

## Tweet

kyren williams: 1,299 rushing yards. 16 touchdowns. 4.1 yards per carry.

the TDs and the volume are elite. the efficiency is not.

he's a top-7 PPR running back being carried by opportunity, not talent. the rams gave him 316 carries and he averaged 4.1 YPC.

volume kings are great — until the volume goes away.

## Image

screenshots/lab_rb_rushing_yards_20260320_182757.png
"""
    },
    {
        "filename": "2026-04-11_07-00_evidence_hubbard_outperform.md",
        "content": """---
type: evidence
template: quiet-data-drop
pillar: evidence
topic: "Chuba Hubbard 1,195 yards outplaying draft capital"
scheduled: 2026-04-11 07:00
---

## Tweet

chuba hubbard rushed for 1,195 yards at 4.8 YPC with 11 touchdowns last season.

he was a 4th round pick. he's outproducing first-rounders.

the dynasty community still treats him like a placeholder. the production says otherwise.

## Image

screenshots/lab_rb_yards_per_carry_20260320_182820.png
"""
    },
    {
        "filename": "2026-04-12_07-00_evidence_wilson_volume_no_td.md",
        "content": """---
type: evidence
template: quiet-data-drop
pillar: evidence
topic: "Garrett Wilson 101 receptions 7 TDs volume without payoff"
scheduled: 2026-04-12 07:00
---

## Tweet

garrett wilson: 101 receptions. 153 targets. 25.8% target share.

7 touchdowns.

the volume is WR1-level. the scoring is WR25-level. he's the most frustrating player in dynasty — elite usage, mediocre results.

at some point the touchdowns have to come. right?

## Image

screenshots/lab_wr_receptions_20260320_233101.png
"""
    },
    {
        "filename": "2026-04-13_07-00_evidence_jeudy_efficiency.md",
        "content": """---
type: evidence
template: quiet-data-drop
pillar: evidence
topic: "Jerry Jeudy 1,229 yards but only 4 TDs"
scheduled: 2026-04-13 07:00
---

## Tweet

jerry jeudy had 1,229 receiving yards last season. that's 12th in the NFL.

he also had 4 touchdowns. that's tied for 76th.

1,229 yards. 4 TDs. the production is there. the scoring isn't. classic buy-low profile if you believe in positive TD regression.

## Image

screenshots/lab_wr_receiving_yards_20260320_182813.png
"""
    },
    {
        "filename": "2026-04-14_07-00_evidence_jtaylor_no_rec.md",
        "content": """---
type: evidence
template: quiet-data-drop
pillar: evidence
topic: "Jonathan Taylor 1,431 rush yards only 18 receptions"
scheduled: 2026-04-14 07:00
---

## Tweet

jonathan taylor rushed for 1,431 yards last season. 12 touchdowns. elite.

he also caught 18 passes all year. 18.

in PPR leagues, that receiving floor is nonexistent. 7.4% target share for a running back in 2024 is brutal.

in standard he's a top-5 back. in PPR he's barely top-12. format matters.

## Image

screenshots/lab_rb_fantasy_points_ppr_20260320_182646.png
"""
    },
    {
        "filename": "2026-04-15_07-00_evidence_kwalker_ppg.md",
        "content": """---
type: evidence
template: quiet-data-drop
pillar: evidence
topic: "Kenneth Walker 16.5 PPG best RB per-game"
scheduled: 2026-04-15 07:00
---

## Tweet

kenneth walker averaged 16.5 PPR points per game last season. that's top-3 among running backs on a per-game basis.

573 rush yards and 46 receptions — in just 11 games.

the talent is obvious. the availability is the problem. if you can buy low on the health discount, the upside is RB1.

## Image

screenshots/lab_rb_fantasy_points_ppr_20260320_233836.png
"""
    },
    {
        "filename": "2026-04-16_07-00_evidence_jennings_breakout.md",
        "content": """---
type: evidence
template: quiet-data-drop
pillar: evidence
topic: "Jauan Jennings 14.0 PPG 49ers breakout"
scheduled: 2026-04-16 07:00
---

## Tweet

jauan jennings averaged 14.0 PPR points per game last season. 975 receiving yards. 77 receptions. 25.2% target share.

he was on nobody's radar in august. he was WR24 in total points by december.

the 49ers just handed him the keys. the breakout was real.

## Image

screenshots/lab_wr_snap_pct_20260320_181128.png
"""
    },
    {
        "filename": "2026-04-17_07-00_evidence_kamara_ppr.md",
        "content": """---
type: evidence
template: quiet-data-drop
pillar: evidence
topic: "Alvin Kamara 21.3% target share PPR king"
scheduled: 2026-04-17 07:00
---

## Tweet

alvin kamara had a 21.3% target share last season. that's the highest among all running backs by a wide margin.

89 targets. 68 receptions. 18.9 PPG in PPR.

in any PPR format, kamara is still a top-10 RB. the receiving volume is irreplaceable.

## Image

screenshots/lab_rb_target_share_20260320_182726.png
"""
    },
    {
        "filename": "2026-04-18_07-00_evidence_mahomes_decline.md",
        "content": """---
type: evidence
template: quiet-data-drop
pillar: evidence
topic: "Patrick Mahomes 93.5 passer rating declining"
scheduled: 2026-04-18 07:00
---

## Tweet

patrick mahomes posted a 93.5 passer rating last season. 26 touchdowns. 11 turnovers.

that's QB12 in fantasy points per game. behind bo nix. behind sam darnold.

the dynasty community still prices him as QB2. the 2024 production says QB8-10 at best.

the tape says what it says.

## Image

screenshots/lab_qb_fantasy_points_ppr_20260320_182702.png
"""
    },
    {
        "filename": "2026-04-19_07-00_evidence_ajbrown_target_share.md",
        "content": """---
type: evidence
template: quiet-data-drop
pillar: evidence
topic: "AJ Brown 32.2% target share elite when healthy"
scheduled: 2026-04-19 07:00
---

## Tweet

a.j. brown commanded a 32.2% target share last season. second-highest WOPR among all wide receivers at 0.821.

16.7 PPG. 1,079 yards. 7 TDs. in 13 games.

when he plays, he's a top-5 dynasty WR. the "when" is doing a lot of work in that sentence.

## Image

screenshots/lab_wr_wopr_20260320_233824.png
"""
    },
    {
        "filename": "2026-04-20_07-00_evidence_montgomery_tds.md",
        "content": """---
type: evidence
template: quiet-data-drop
pillar: evidence
topic: "David Montgomery 13 TDs in Gibbs timeshare"
scheduled: 2026-04-20 07:00
---

## Tweet

david montgomery scored 13 touchdowns last season. in a timeshare with jahmyr gibbs.

775 rushing yards. 4.2 YPC. 15.8 PPG.

the lions use him as a battering ram inside the 10. he's not flashy, he's not efficient, but he scores. a lot.

TD regression is the risk. but the lions also scored the most points in the NFL, so maybe it's just... the lions.

## Image

screenshots/panel_red-zone_20260320_182959.png
"""
    },
    {
        "filename": "2026-04-21_07-00_evidence_dowdle_undrafted.md",
        "content": """---
type: evidence
template: quiet-data-drop
pillar: evidence
topic: "Rico Dowdle 1,079 rush yards from undrafted to RB1"
scheduled: 2026-04-21 07:00
---

## Tweet

rico dowdle rushed for 1,079 yards last season. 4.6 YPC.

he went undrafted. he was on nobody's dynasty roster in august 2024. he finished as a top-20 PPR running back.

the cowboys' offense was terrible and he still put up 1,000+ yards. opportunity finds a way.

## Image

screenshots/lab_rb_rushing_yards_20260320_233709.png
"""
    },
    {
        "filename": "2026-04-22_07-00_evidence_jamo_breakout.md",
        "content": """---
type: evidence
template: quiet-data-drop
pillar: evidence
topic: "Jameson Williams 1,001 yards Lions breakout"
scheduled: 2026-04-22 07:00
---

## Tweet

jameson williams finished with 1,001 receiving yards and 8 touchdowns last season. 14.1 PPG.

year 1: 24 games, 517 yards. year 2: 17 games, 1,001 yards.

the patience is paying off. in a lions offense that spreads the ball, jameson carved out a legit WR2 role. dynasty managers who held are being rewarded.

## Image

screenshots/lab_wr_receiving_yards_20260320_233440.png
"""
    },
    {
        "filename": "2026-04-23_07-00_evidence_chase_brown_dual.md",
        "content": """---
type: evidence
template: quiet-data-drop
pillar: evidence
topic: "Chase Brown 990 rush yards 54 receptions dual-threat"
scheduled: 2026-04-23 07:00
---

## Tweet

chase brown: 990 rushing yards. 54 receptions. 65 targets. 10.7% target share.

the bengals have their RB1. 4.3 YPC isn't elite, but the receiving work makes him a PPR asset.

he's 24 years old and just had his first full season as a starter. year 2 breakout candidate.

## Image

screenshots/lab_rb_carries_20260320_233447.png
"""
    },

    # ===== AGENT VERDICTS (14) =====
    {
        "filename": "2026-04-07_19-00_verdict_bones_sell_breece.md",
        "content": """---
type: agent-verdict
template: bones-trade-play
pillar: agent-verdicts
topic: "Bones says sell Breece Hall"
scheduled: 2026-04-07 19:00
---

## Tweet

bones says sell breece hall.

here's the play — 876 rushing yards. 4.2 YPC. 8 touchdowns. the jets are a mess and his efficiency is declining every year.

57 receptions keep his PPR floor alive, but the ceiling is gone. your leaguemate still remembers his rookie year. sell the memory before the market catches up.

## Image

screenshots/lab_rb_yards_per_carry_20260320_182820.png
"""
    },
    {
        "filename": "2026-04-08_19-00_verdict_hawkeye_chase_brown.md",
        "content": """---
type: agent-verdict
template: hawkeye-alert
pillar: agent-verdicts
topic: "Hawkeye on Chase Brown breakout"
scheduled: 2026-04-08 19:00
---

## Tweet

hawkeye spotted it first.

chase brown's target share climbed to 10.7% by season end. 54 receptions as a between-the-tackles runner? that's scheme trust.

the bengals are investing in him as a three-down back. 990 rush yards and 65 targets in year one as a starter.

the film doesn't lie. this is a breakout, not a fluke.

## Image

screenshots/lab_rb_target_share_20260320_181110.png
"""
    },
    {
        "filename": "2026-04-09_19-00_verdict_atlas_adams_age.md",
        "content": """---
type: agent-verdict
template: atlas-history-lesson
pillar: agent-verdicts
topic: "Atlas on Davante Adams at age 32"
scheduled: 2026-04-09 19:00
---

## Tweet

atlas remembers.

last time a wide receiver held a 29.6% target share at age 32, the list was very short. larry fitzgerald. steve smith. maybe jerry rice.

davante adams: 85 receptions. 1,063 yards. 8 TDs. 17.2 PPG.

history says the cliff comes fast for WRs over 30. but history also says the special ones get one more year.

## Image

screenshots/panel_aging-curves_20260320_182933.png
"""
    },
    {
        "filename": "2026-04-10_19-00_verdict_bones_sell_kelce.md",
        "content": """---
type: agent-verdict
template: bones-trade-play
pillar: agent-verdicts
topic: "Bones says sell Travis Kelce"
scheduled: 2026-04-10 19:00
---

## Tweet

bones says sell travis kelce.

here's the play — 97 receptions. 823 yards. 3 touchdowns.

three. touchdowns. all. season.

your leaguemate still thinks he's the TE1. he finished TE5 in PPR and TE8 in standard. the name value is worth more than the production right now.

sell the jersey, not the player.

## Image

screenshots/lab_te_fantasy_points_ppr_20260320_182710.png
"""
    },
    {
        "filename": "2026-04-11_19-00_verdict_octo_nacua.md",
        "content": """---
type: agent-verdict
template: octo-math-drop
pillar: agent-verdicts
topic: "Octo on Puka Nacua championship equity"
scheduled: 2026-04-11 19:00
---

## Tweet

octo ran the numbers.

puka nacua's championship equity with a healthy 17-game season: top-3 WR projection.

18.8 PPG. 32.6% target share. 0.699 WOPR. the per-game production is elite.

if you're not buying the health discount, the math says you're wrong.

## Image

screenshots/lab_wr_target_share_20260320_182718.png
"""
    },
    {
        "filename": "2026-04-12_19-00_verdict_bones_buy_higgins.md",
        "content": """---
type: agent-verdict
template: bones-trade-play
pillar: agent-verdicts
topic: "Bones says buy Tee Higgins"
scheduled: 2026-04-12 19:00
---

## Tweet

bones says buy tee higgins.

here's the play — 18.5 PPG. 10 touchdowns. 26.1% target share. in only 12 games.

he's a free agent and the dynasty community has written him off. wherever he lands, the target volume follows him. WR2 talent at a WR30 price.

your leaguemate will undersell. they always do with the "injury prone" label.

## Image

screenshots/lab_wr_catch_rate_20260320_182859.png
"""
    },
    {
        "filename": "2026-04-13_19-00_verdict_dolphin_kwalker.md",
        "content": """---
type: agent-verdict
template: dr-dolphin-injury-report
pillar: agent-verdicts
topic: "Dr. Dolphin on Kenneth Walker injury risk"
scheduled: 2026-04-13 19:00
---

## Tweet

dr. dolphin checked the charts.

kenneth walker — played 11 of 17 games in 2024. missed 6 games in 2023. he's averaged 12.5 games per season over his career.

the talent screams RB1. 16.5 PPG when active. but "when active" is doing heavy lifting.

dynasty price reflects a 17-game player. the medical history says 12.

## Image

screenshots/panel_consistency_20260320_182923.png
"""
    },
    {
        "filename": "2026-04-14_19-00_verdict_atlas_mahomes.md",
        "content": """---
type: agent-verdict
template: atlas-history-lesson
pillar: agent-verdicts
topic: "Atlas on Mahomes historical comp"
scheduled: 2026-04-14 19:00
---

## Tweet

atlas remembers.

last time a former MVP quarterback posted a 93.5 passer rating with 26 TDs and 11 turnovers, we called it a down year.

mahomes finished QB12 in PPG. behind bo nix. behind baker mayfield.

history says elite QBs bounce back. but history also says the weapons around them matter. and those chiefs weapons...

## Image

screenshots/lab_qb_passing_tds_20260320_233040.png
"""
    },
    {
        "filename": "2026-04-15_19-00_verdict_hawkeye_tracy.md",
        "content": """---
type: agent-verdict
template: hawkeye-alert
pillar: agent-verdicts
topic: "Hawkeye flags Tyrone Tracy Jr."
scheduled: 2026-04-15 19:00
---

## Tweet

hawkeye spotted it first.

tyrone tracy jr. rushed for 839 yards as a rookie. 4.4 YPC. 38 receptions.

nobody's talking about him because the giants were 3-14. but the usage was real — 53 targets for a rookie RB is legitimate passing game work.

the film says he's their RB1 going into 2026. the price says nobody's noticed yet.

## Image

screenshots/lab_rb_rushing_yards_20260320_233923.png
"""
    },
    {
        "filename": "2026-04-16_19-00_verdict_team_garrett_wilson.md",
        "content": """---
type: agent-verdict
template: team-disagreement
pillar: agent-verdicts
topic: "Team split on Garrett Wilson sell or hold"
scheduled: 2026-04-16 19:00
---

## Tweet

bones says sell garrett wilson. octo says hold.

when they disagree, i check the tape.

bones: 7 TDs on 153 targets. that's a 4.6% TD rate. unsustainable floor.
octo: 101 receptions. 25.8% target share. the volume is locked in.

the tape says hold — but only in PPR. in standard, bones is right. sell before the market adjusts.

## Image

screenshots/lab_wr_receptions_20260320_233101.png
"""
    },
    {
        "filename": "2026-04-17_19-00_verdict_bones_buy_pitts.md",
        "content": """---
type: agent-verdict
template: bones-trade-play
pillar: agent-verdicts
topic: "Bones says buy Kyle Pitts"
scheduled: 2026-04-17 19:00
---

## Tweet

bones says buy kyle pitts.

here's the play — 7.7 PPG. 131 total PPR points. 47 receptions. that's ugly.

but he's 25 years old with first-round draft capital and a 13.9% target share on a team that just added kirk cousins.

his dynasty price is at an all-time low. the talent was never the question — it was the usage. if the falcons ever commit, the upside is TE3.

your leaguemate wants to cut him. make the offer.

## Image

screenshots/lab_te_catch_rate_20260320_233524.png
"""
    },
    {
        "filename": "2026-04-18_19-00_verdict_octo_andrews_math.md",
        "content": """---
type: agent-verdict
template: octo-math-drop
pillar: agent-verdicts
topic: "Octo on Mark Andrews TD sustainability"
scheduled: 2026-04-18 19:00
---

## Tweet

octo ran the numbers.

mark andrews scored 11 TDs on 55 receptions. a 20% TD rate.

league average for tight ends: 6-8%. the three-year regression mean for andrews: 9%.

the math says he finishes closer to 6-7 TDs next season. that drops him from TE6 to TE10-12 in PPR.

if you're selling, the math says now is the time.

## Image

screenshots/lab_te_receiving_tds_20260320_181037.png
"""
    },
    {
        "filename": "2026-04-20_19-00_verdict_razzle_rb_landscape.md",
        "content": """---
type: agent-verdict
template: razzle-briefing
pillar: agent-verdicts
topic: "Razzle briefing: 2026 RB landscape"
scheduled: 2026-04-20 19:00
---

## Tweet

razzle briefing: the 2026 RB landscape.

- gibbs (21.3 PPG) and barkley (22.2 PPG) are the clear tier 1
- henry (19.8 PPG) defied aging curves but can't last forever
- achane (17.6 PPG) has the most upside if miami fixes the offense
- j. taylor (17.5 PPG) is a standard league monster but a PPR liability
- chase brown and bucky irving are the breakout bets

the short version — if you're rebuilding, buy achane and chase brown. if you're competing, pay up for gibbs.

## Image

screenshots/lab_rb_fantasy_points_ppr_20260320_182646.png
"""
    },
    {
        "filename": "2026-04-22_19-00_verdict_hawkeye_jamo.md",
        "content": """---
type: agent-verdict
template: hawkeye-alert
pillar: agent-verdicts
topic: "Hawkeye on Jameson Williams usage trend"
scheduled: 2026-04-22 19:00
---

## Tweet

hawkeye spotted it first.

jameson williams went from 517 yards in year one to 1,001 in year two. 8 TDs. 18.2% target share in a crowded lions offense.

he's 24 years old and just proved he can produce with amon-ra eating targets. the trajectory is up.

the film says year three is the real breakout. dynasty managers sleeping on jamo are going to pay a premium later.

## Image

screenshots/panel_usage-trends_20260320_182938.png
"""
    },

    # ===== COMMUNITY (11) =====
    {
        "filename": "2026-04-06_12-00_community_dynasty_101.md",
        "content": """---
type: community
template: leaguemate-call-out
pillar: community
topic: "Dynasty 1.01 SF vs 1QB debate"
scheduled: 2026-04-06 12:00
---

## Tweet

dynasty rookie drafts are a month away.

who's your 1.01 in superflex? who's your 1.01 in 1QB?

(if you say the same player for both, we need to talk.)

## Image

screenshots/panel_dynasty-rankings_20260320_182928.png
"""
    },
    {
        "filename": "2026-04-08_12-00_community_overrated.md",
        "content": """---
type: community
template: leaguemate-call-out
pillar: community
topic: "Most overrated player heading into 2026"
scheduled: 2026-04-08 12:00
---

## Tweet

most overrated dynasty asset heading into 2026. name one player.

i'll go first — the data has opinions and the lab has receipts.

(yes, i already pulled the film. no, your favorite player isn't safe.)

## Image

screenshots/panel_trade-values_20260320_182912.png
"""
    },
    {
        "filename": "2026-04-10_12-00_community_bold_prediction.md",
        "content": """---
type: community
template: leaguemate-call-out
pillar: community
topic: "Bold prediction: top 5 finisher at position"
scheduled: 2026-04-10 12:00
---

## Tweet

bold prediction time.

name one player who finishes top 5 at their position in 2026 that nobody expects.

the lab has some candidates. but i want to hear yours first.

## Image

screenshots/panel_breakouts_20260320_182907.png
"""
    },
    {
        "filename": "2026-04-12_12-00_community_draft_tip.md",
        "content": """---
type: community
template: leaguemate-call-out
pillar: community
topic: "Razzle's draft day tip"
scheduled: 2026-04-12 12:00
---

## Tweet

dynasty draft tip from the lab:

stop drafting for need. draft for value. your roster needs change every year. the player you took "because you needed a TE" will haunt you for three seasons.

best player available. every time. trade for need after.

## Image

screenshots/panel_trade-values_20260320_233029.png
"""
    },
    {
        "filename": "2026-04-14_12-00_community_panic_buy.md",
        "content": """---
type: community
template: leaguemate-call-out
pillar: community
topic: "Who are you panic buying after a down year"
scheduled: 2026-04-14 12:00
---

## Tweet

name a player who had a down 2025 season that you're aggressively buying right now.

the best dynasty moves are made when your leaguemate is panicking. the lab knows who's underpriced.

## Image

screenshots/panel_trade-values_20260320_233810.png
"""
    },
    {
        "filename": "2026-04-16_12-00_community_most_improved.md",
        "content": """---
type: community
template: leaguemate-call-out
pillar: community
topic: "Most improved player in 2025"
scheduled: 2026-04-16 12:00
---

## Tweet

who was the most improved fantasy player in 2025?

not the best player. the one who improved the most from 2024 to 2025.

the data says a few names. but i want to hear who you think actually leveled up.

## Image

screenshots/panel_efficiency_20260320_182917.png
"""
    },
    {
        "filename": "2026-04-18_12-00_community_refuse_trade.md",
        "content": """---
type: community
template: leaguemate-call-out
pillar: community
topic: "One player you refuse to trade at any price"
scheduled: 2026-04-18 12:00
---

## Tweet

one dynasty player you refuse to trade. any price. any offer.

(and be honest — is it because of the data, or because you're emotionally attached?)

the lab doesn't judge. but the lab does know the difference.

## Image

screenshots/panel_dynasty-rankings_20260320_233006.png
"""
    },
    {
        "filename": "2026-04-19_12-00_community_biggest_regret.md",
        "content": """---
type: community
template: leaguemate-call-out
pillar: community
topic: "Biggest dynasty regret"
scheduled: 2026-04-19 12:00
---

## Tweet

what's your biggest dynasty regret?

the trade you didn't make. the pick you overthought. the player you cut too early.

every dynasty manager has one. drop yours below and let's collectively suffer.

## Image

screenshots/panel_trade-values_20260320_233820.png
"""
    },
    {
        "filename": "2026-04-21_12-00_community_startup_outside_5.md",
        "content": """---
type: community
template: leaguemate-call-out
pillar: community
topic: "Startup draft first pick outside top 5"
scheduled: 2026-04-21 12:00
---

## Tweet

you're starting a new dynasty league in 2026. you pick 6th overall.

who are you taking?

(the consensus top 5 is chase, gibbs, barkley, nabers, jefferson. who's your 1.06?)

## Image

screenshots/panel_dynasty-rankings_20260320_233025.png
"""
    },
    {
        "filename": "2026-04-23_12-00_community_team_name.md",
        "content": """---
type: community
template: leaguemate-call-out
pillar: community
topic: "Best dynasty team name you've seen"
scheduled: 2026-04-23 12:00
---

## Tweet

best dynasty fantasy football team name you've ever seen. go.

(mine involves a tiger and it's not up for debate.)

## Image

screenshots/panel_dynasty-rankings_20260320_233131.png
"""
    },
    {
        "filename": "2026-04-24_12-00_community_draft_day_101.md",
        "content": """---
type: community
template: leaguemate-call-out
pillar: community
topic: "Draft day 1.01 pick"
scheduled: 2026-04-24 12:00
---

## Tweet

it's draft day.

the lab has been running every prospect for weeks. hawkeye has been watching tape since january. atlas has been pulling historical comps since the combine.

who are you picking 1.01 tonight?

## Image

screenshots/panel_dynasty-rankings_20260320_233240.png
"""
    },

    # ===== PROSPECTS (9) =====
    {
        "filename": "2026-04-09_12-00_prospects_wr_class.md",
        "content": """---
type: prospects
template: hawkeye-alert
pillar: prospects
topic: "Hawkeye scouting 2026 WR draft class"
scheduled: 2026-04-09 12:00
---

## Tweet

hawkeye spotted it first.

the 2026 WR draft class is loaded. the lab has been running college production profiles through the screener since the combine.

target share. yards per route run. dominator rating. breakout age.

the data drops are coming. the tape doesn't lie.

## Image

screenshots/lab_wr_target_share_20260320_182718.png
"""
    },
    {
        "filename": "2026-04-11_12-00_prospects_rookie_qb_comps.md",
        "content": """---
type: prospects
template: atlas-history-lesson
pillar: prospects
topic: "Atlas on historical rookie QB comps"
scheduled: 2026-04-11 12:00
---

## Tweet

atlas remembers.

every draft cycle, dynasty managers overdraft rookie QBs chasing "the next mahomes." here's what the history actually says:

since 2015, only 3 rookie QBs have finished as a top-12 fantasy QB in year one. three. in ten years.

patience is the edge at quarterback. the best dynasty QBs were bought in year 2, not drafted in year 1.

## Image

screenshots/lab_qb_fantasy_points_ppr_20260320_182702.png
"""
    },
    {
        "filename": "2026-04-13_12-00_prospects_rb_like_gibbs.md",
        "content": """---
type: prospects
template: hawkeye-alert
pillar: prospects
topic: "Hawkeye on RB prospects who profile like Gibbs"
scheduled: 2026-04-13 12:00
---

## Tweet

hawkeye pulled the film on incoming RB prospects.

the ones who profile like jahmyr gibbs — receiving work, speed, 5.0+ YPC — are the dynasty goldmines.

gibbs just posted 21.3 PPG with 52 receptions and 5.6 YPC. that receiving floor is what separates good dynasty RBs from great ones.

any prospect without a pass-catching profile is capped. the tape says so.

## Image

screenshots/lab_rb_fantasy_points_ppr_20260320_181145.png
"""
    },
    {
        "filename": "2026-04-15_12-00_prospects_te_year1.md",
        "content": """---
type: prospects
template: atlas-history-lesson
pillar: prospects
topic: "Atlas on rookie TEs who produced year 1"
scheduled: 2026-04-15 12:00
---

## Tweet

atlas remembers.

brock bowers just posted 112 receptions and 1,194 yards as a rookie tight end. 15.5 PPG.

historically, rookie TEs don't do this. before bowers, the last rookie TE to finish top-5 at the position was... nobody in the last decade.

if you're drafting a TE in your rookie draft, know the base rate. the bowers outcome is the exception, not the rule.

## Image

screenshots/lab_te_wopr_20260320_233112.png
"""
    },
    {
        "filename": "2026-04-17_12-00_prospects_rookie_review.md",
        "content": """---
type: prospects
template: razzle-briefing
pillar: prospects
topic: "2025 rookie class review: hits and misses"
scheduled: 2026-04-17 12:00
---

## Tweet

razzle briefing: the 2024 rookie class in review.

hits:
- malik nabers: 18.2 PPG, 0.850 WOPR (dominant)
- brock bowers: 15.5 PPG, 112 rec (historic)
- brian thomas jr: 16.7 PPG (quietly elite)
- ladd mcconkey: 15.1 PPG (value pick of the class)

work in progress:
- marvin harrison jr: 11.6 PPG (target volume there, TDs will come)
- caleb williams: 15.0 PPG (0 rush TDs is the outlier)

the short version — this class delivered. the 2025 class has a high bar to clear.

## Image

screenshots/panel_dynasty-rankings_20260320_233633.png
"""
    },
    {
        "filename": "2026-04-19_18-00_prospects_landing_spots.md",
        "content": """---
type: prospects
template: hawkeye-alert
pillar: prospects
topic: "Hawkeye on which landing spots matter most"
scheduled: 2026-04-19 18:00
---

## Tweet

hawkeye spotted it first.

five days until the draft. landing spot is everything for rookies.

the lab's data on rookie production by team shows clear patterns — high-volume passing offenses produce day-one WR contributors. run-first teams suppress rookie WR value for 1-2 years.

where a player lands matters more than where he's drafted. the film says trust the situation over the draft capital.

## Image

screenshots/panel_target-distribution_20260320_182954.png
"""
    },
    {
        "filename": "2026-04-20_12-00_prospects_draft_countdown.md",
        "content": """---
type: prospects
template: quiet-data-drop
pillar: prospects
topic: "Draft countdown: 4 days"
scheduled: 2026-04-20 12:00
---

## Tweet

4 days until the NFL Draft.

the lab has been running prospect profiles for weeks. the screener is loaded. hawkeye has the tape. atlas has the historical comps. octo has the projections.

april 24. we'll be here. will you?

## Image

screenshots/panel_dynasty-rankings_20260320_233724.png
"""
    },
    {
        "filename": "2026-04-22_12-00_prospects_sf_1qb.md",
        "content": """---
type: prospects
template: quiet-data-drop
pillar: prospects
topic: "SF vs 1QB rookie draft: the 1.01 debate"
scheduled: 2026-04-22 12:00
---

## Tweet

the 1.01 debate every dynasty league has right now:

superflex: the top QB prospect is always tempting. but atlas's data shows only 3 of 10 rookie QBs hit in year 1. patience pays.

1QB: best RB or WR available. the hit rate on skill position 1.01s is significantly higher than QBs.

format changes everything. know your format. draft accordingly.

## Image

screenshots/lab_qb_fantasy_points_ppr_20260320_182702.png
"""
    },
    {
        "filename": "2026-04-24_07-00_prospects_draft_day_ready.md",
        "content": """---
type: prospects
template: hawkeye-alert
pillar: prospects
topic: "Draft day: the lab is ready"
scheduled: 2026-04-24 07:00
---

## Tweet

hawkeye spotted it first. atlas found the comps. octo ran the projections. bones mapped the trade values.

tonight is the NFL Draft. the lab has been preparing for months.

every pick. every landing spot. every dynasty implication. we'll have the data before your leaguemate finishes googling the player's name.

the lab is ready. are you?

## Image

screenshots/panel_dynasty-rankings_20260320_233240.png
"""
    },

    # ===== MASCOT (3) =====
    {
        "filename": "2026-04-21_18-00_mascot_draft_prep.md",
        "content": """---
type: mascot
template: mascot
pillar: mascot
topic: "Razzle's draft prep routine"
scheduled: 2026-04-21 18:00
---

## Tweet

three days until the NFL Draft.

razzle's draft prep routine:
1. pull up the lab
2. sort by every metric that matters
3. argue with bones about trade values
4. let hawkeye talk for 45 minutes about a receiver's route tree
5. take a nap
6. repeat

## Image

screenshots/panel_workload_20260320_182949.png
"""
    },
    {
        "filename": "2026-04-23_18-00_mascot_draft_eve.md",
        "content": """---
type: mascot
template: mascot
pillar: mascot
topic: "Razzle on draft eve"
scheduled: 2026-04-23 18:00
---

## Tweet

draft eve.

hawkeye won't stop rewatching tape. atlas keeps saying "in 2017, a similar prospect..." and bones is already calculating trade-up costs for picks that haven't happened yet.

octo is just running simulations. dr. dolphin is reviewing medical reports.

this is the best night of the year. tomorrow we feast.

## Image

screenshots/panel_usage-trends_20260320_233204.png
"""
    },
    {
        "filename": "2026-04-24_18-00_mascot_draft_night.md",
        "content": """---
type: mascot
template: mascot
pillar: mascot
topic: "Draft night: Razzle in the lab"
scheduled: 2026-04-24 18:00
---

## Tweet

the draft is live. the lab is open. six agents. zero sleep.

every pick gets the full treatment — hawkeye's film grade, atlas's historical comp, octo's dynasty projection, bones's trade value, and dolphin's medical review.

pull up a chair. it's going to be a long night.

razzle.lol

## Image

screenshots/panel_dynasty-rankings_20260320_181024.png
"""
    },
]

# Write all draft files
for draft in drafts:
    filepath = os.path.join(DRAFT_DIR, draft["filename"])
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(draft["content"].strip() + "\n")
    print(f"  Created: {draft['filename']}")

print(f"\nTotal drafts created: {len(drafts)}")
