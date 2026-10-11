# SmartBin: Driving + Strategy Difficulty System

Implement a complete, playable difficulty and mission-management system in my existing SmartBin application + Three.js city game.

## PRIMARY GOAL

Make Game Mode a challenging driving-and-strategy game where the player must drive skillfully, plan collection routes, manage deadlines, use truck abilities intelligently, and deal with meaningful consequences for mistakes.

Normal Mode must remain a functional waste-management application. Do not convert the app into a game dashboard or let game penalties damage genuine application data.

## STEP 1 — AUDIT THE EXISTING CODE

Before modifying anything, inspect the current project.

Identify:
- Three.js scene, renderer, camera and animation loop.
- Current truck model, movement, steering and collision implementation.
- Traffic AI and road navigation.
- Garbage locations and collection logic.
- Vector Field implementation and truck-specific abilities.
- Existing HUD, minimap, mission UI and mode switching.
- Existing currency, persistence, garage and upgrade systems, if present.

Reuse working systems. Do not create duplicate vehicle physics, animation loops, traffic managers or conflicting mission systems.

If a required system does not exist, implement it in a way that fits the existing architecture.

## STEP 2 — MISSION-BASED DIFFICULTY

Create a configurable difficulty system with four tiers:

1. Rookie Driver
   - Low traffic density.
   - Simple collection routes.
   - Generous deadlines.
   - Minimal environmental hazards.
   - Teach the player controls and collection mechanics.

2. Rush Hour
   - Increased traffic density.
   - Multiple collection locations.
   - Tighter deadlines.
   - More complex intersections and route decisions.

3. City Under Pressure
   - High traffic density.
   - Optional rain or reduced visibility, only if supported by the existing rendering and driving systems.
   - Roadblocks or temporary route disruptions.
   - Urgent collection targets.
   - More expensive consequences for mistakes.

4. Master Operator
   - Multiple competing objectives.
   - Difficult routes and strict deadlines.
   - Complex traffic interactions.
   - Strategic use of truck abilities and upgrades.

Difficulty should scale through meaningful gameplay parameters, not just higher numbers.

Use a central configuration object for parameters such as:
- Traffic density.
- Mission time limit.
- Garbage generation rate.
- Objective count.
- Collision damage multiplier.
- Repair costs.
- Reward multipliers.
- Environmental hazard settings.

Avoid changing all parameters randomly. Every mission must be predictable enough to learn and improve.

Do not make the game unfair by spawning unavoidable collisions or requiring impossible deadlines.

## STEP 3 — ROUTE PLANNING AND MULTIPLE OBJECTIVES

Build a mission system that supports multiple collection locations.

Each mission should define:
- Mission ID.
- Difficulty tier.
- Collection targets.
- Required waste amount.
- Optional objectives.
- Time limit.
- Base reward.
- Bonus conditions.
- Failure conditions.
- Mission status.

The player should see target locations on the map or minimap, including relevant quantities and urgency.

Create meaningful decisions:
- A location with a large quantity of waste may be far away.
- A nearby location may have a smaller reward.
- A busy road may make the shortest route slower in practice.
- Optional urgent pickups may provide bonuses but introduce additional risk.

If the project does not have a road-routing system, implement a practical solution compatible with its existing city. Do not pretend that pathfinding exists if the player is only following a manually defined route.

Keep mission generation configurable and deterministic enough for testing.

## STEP 4 — DEADLINES AND MISSION CONSEQUENCES

Implement a working mission timer.

The timer must:
- Begin at the appropriate gameplay start.
- Pause when the game is paused.
- Stop when the mission ends.
- Display remaining time clearly.
- Trigger the correct mission result.

On deadline failure:
- Reduce the mission reward or mark mandatory objectives as failed.
- Preserve previously unlocked trucks and permanent progression.
- Apply only explicitly configured penalties.
- Allow the player to retry after the required repair or retry conditions.

Do not allow duplicate reward payouts by repeatedly completing or reopening the same mission result.

## STEP 5 — TRUCK DAMAGE AND REPAIR

Add or improve a real truck condition system.

Track:
- Current condition or health.
- Collision damage.
- Repair cost.
- Temporary performance penalties.
- Mission result and repair status.

Damage should depend on collision severity and relative speed when these values are available.

Suggested initial balancing values, to be tuned after testing:
- Minor collision: approximately 2–5% condition loss.
- Moderate collision: approximately 6–12%.
- Severe collision: approximately 15–25%.

These are starting values, not guaranteed final balance.

Damage should have controlled effects:
- Reduced acceleration at low condition.
- Reduced maximum speed at more severe damage.
- Less responsive handling only when condition is sufficiently poor.

Do not randomly alter steering, teleport the truck, or make the vehicle uncontrollable.

Use the existing collision system where possible. Prevent the same continuous collision from applying damage every rendered frame. Use collision cooldowns, contact tracking, or another appropriate method.

Create a repair interface in the garage:
- Show current truck condition.
- Show repair cost before confirmation.
- Deduct currency only when repair succeeds.
- Prevent spending below zero.
- Restore the appropriate amount of condition.
- Ensure repairs persist if the project already supports persistence.

## STEP 6 — RESOURCE AND ECONOMY BALANCE

Use the existing currency system if one exists.

Implement a consistent economy:
- Mission completion rewards.
- Optional objective bonuses.
- Penalties for certain failures.
- Repair expenses.
- Upgrade expenses.
- Truck purchase costs.

Prevent:
- Negative currency from invalid purchases.
- Repeated rewards from the same mission result.
- Duplicate mission completion events.
- Unintended currency resets when switching modes.

Do not introduce fuel consumption unless it can be integrated properly into driving, refuelling, the HUD and the economy. Avoid displaying a fake fuel meter.

The player must be able to recover from financial mistakes. Do not create a permanent softlock where the player cannot afford repairs, cannot start a mission, and has no recovery option.

## STEP 7 — TRUCK ABILITIES AND STRATEGIC TRADE-OFFS

Preserve the existing Vector Hauler behaviour and implement or improve the following abilities:

Vector Hauler:
- Slows nearby traffic within its configured field.
- Has a limited radius and strength.
- Returns affected traffic to normal after leaving the field.

Overdrive:
- Speeds up nearby traffic.
- Temporarily improves garbage collection processing time.
- Increases the difficulty of navigating the accelerated traffic.
- Prevents repeatedly stacking the same boost.

Deflector:
- Smoothly redirects nearby vehicles away from the truck.
- Uses steering forces or road-path adjustments.
- Avoids teleportation, oscillation and permanent traffic blockage.

Each ability must have a real gameplay effect and a visual representation consistent with that effect.

If abilities use duration or cooldowns, make those values configurable and visible in the HUD.

Do not make a truck universally superior. Balance abilities against handling, collection efficiency and mission conditions.

## STEP 8 — GARAGE AND UPGRADES

Integrate with the existing garage and vehicle selection system if available.

The selected truck must be the actual vehicle used in gameplay.

Support meaningful upgrades:
- Engine.
- Handling.
- Field range.
- Field strength.
- Ability efficiency.

Every upgrade must affect the appropriate real gameplay parameter.

Display the cost and before-and-after statistics. Deduct currency correctly and persist owned upgrades where persistence already exists.

Keep the upgrade system modular. Do not create multiple independent copies of the same truck stats.

## STEP 9 — MISSION RESULTS AND PLAYER FEEDBACK

Create a mission results screen containing:
- Mission success or failure.
- Waste collected.
- Objectives completed.
- Time remaining or time exceeded.
- Collision count or damage taken.
- Base reward.
- Bonuses.
- Penalties.
- Repair recommendation or repair cost where appropriate.
- Retry and return-to-garage actions.

Show players why they lost a reward or failed an objective.

Make failure informative: the player should understand what to improve on the next attempt.

Avoid unnecessary pop-ups during driving. Keep the HUD readable and do not let UI interactions accidentally trigger vehicle controls.

## STEP 10 — APP/GAME DATA SEPARATION

Keep the normal SmartBin application and the 3D game independent in their core behaviour.

Game currency, damage, fictional missions and simulated waste events must not overwrite real waste reports or operational records.

Reuse shared information only where appropriate, with clear separation between simulated game data and actual application data.

Switching between Normal Mode and Game Mode must not duplicate animation loops, leak event listeners, reset application state or spawn duplicate vehicles.

## STEP 11 — IMPLEMENTATION ORDER

Work in this order:

Phase A:
- Audit the codebase.
- Identify the existing mission, vehicle and collision systems.
- Preserve existing functionality.

Phase B:
- Implement mission definitions, difficulty configurations and multiple collection targets.
- Test mission start, pause, completion and failure.

Phase C:
- Implement collision damage, condition effects, repairs and repair costs.
- Test repeated collisions and recovery from low currency.

Phase D:
- Integrate truck abilities, upgrades and strategic trade-offs.
- Verify all effects reset correctly.

Phase E:
- Build the mission results screen and tune difficulty.
- Test the entire gameplay loop and mode switching.

Modify the actual project files. Do not stop at a design plan, mockup, code snippet or list of recommendations.

## STEP 12 — REQUIRED TESTS

Test the following scenarios in the existing environment:

1. A Rookie mission can be completed.
2. Higher difficulty changes traffic and mission pressure.
3. Multiple collection targets work correctly.
4. The mission timer pauses and resumes correctly.
5. A missed deadline produces the intended result.
6. Collisions cause controlled damage.
7. One sustained collision does not cause damage every frame.
8. Damaged trucks exhibit the intended performance penalties.
9. Repairs deduct the correct amount and restore condition.
10. Insufficient currency prevents an invalid purchase or repair.
11. Mission rewards cannot be claimed repeatedly.
12. Truck abilities have the correct effects and reset after use.
13. Upgrades change real gameplay behaviour.
14. Permanent progression survives mode switching and reloads when persistence is supported.
15. Normal Mode remains functional and game penalties do not overwrite genuine application data.
16. No major console errors, duplicated event listeners or broken animation loops are introduced.

At the end, report:
- Files changed.
- Systems implemented.
- Tests actually performed.
- Test results.
- Remaining bugs and incomplete features.
- Any manual testing that is still necessary.

Do not claim a test passed unless it was actually performed.

PRIORITY: Build a fair but demanding driving-and-strategy loop. Meaningful decisions, readable consequences and recoverable failure matter more than adding lots of superficial features.

---

# Driver Level, XP, Coins and Progression System Specification

## 1. DRIVER LEVEL AND XP

Create a permanent Driver Level progression system.

The player starts at:
- Level: 1
- XP: 0
- Coins: 500 (starter balance, granted only once to a new game profile)

Use this formula for the XP required to advance from the current level to the next:

`XP Required = 100 + 50 * (Current Level - 1)`

Examples:
- Level 1 → 2: 100 XP
- Level 2 → 3: 150 XP
- Level 3 → 4: 200 XP
- Level 5 → 6: 300 XP
- Level 10 → 11: 550 XP

When XP reaches the required threshold, level up automatically and carry over any excess XP. Support multiple level-ups if a reward grants enough XP.

Suggested XP rewards:
- Complete a mission: 100 XP.
- Complete a required garbage collection target: 25 XP.
- Finish within the deadline: 30 XP.
- Complete a mission without collisions: 20 XP.
- Complete an optional objective: 40 XP.
- Failed mission: up to 20 XP based on actual progress.

These are initial balancing values. Avoid granting the same objective XP multiple times. Do not award the full completion reward for a failed mission.

Display:
- Current level.
- Current XP and XP needed for the next level.
- A progress bar.
- A level-up notification.
- Newly unlocked content, if any.

## 2. COINS AND MISSION REWARDS

Create a separate in-game currency called Coins.

Use this mission reward formula:

`Net Coins = Base Reward + Collection Bonus + Time Bonus + Optional Objective Bonuses - Mission Penalties`

Initial suggested rewards:
- Base mission reward: 200 Coins.
- Full collection bonus: 50 Coins.
- Deadline completion bonus: 30 Coins.
- Optional objective bonus: 40 Coins per completed optional objective.
- Collision penalty: Deduct coins or condition based on collision count/severity.

