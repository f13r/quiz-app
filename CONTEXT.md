# Quiz App — "Як я цього не знав?"

A digital score tracker and turn manager for the physical Ukrainian card game "Як я цього не знав?" Two teams compete in real time, tracked across a Host phone (`/host`) and a Display tablet (`/game`).

## Language

**Game**:
A single play session from player setup through to the final results screen.
_Avoid_: Match, session, round

**Team**:
One of two fixed competing sides — Blue or Yellow — each with 2–8 named Players.
_Avoid_: Side, group, faction

**Player**:
A named individual belonging to exactly one Team who earns Points by correctly answering Questions.
_Avoid_: User, participant, member

**Host**:
The person running the Game, operating the `/host` interface on a mobile phone.
_Avoid_: Admin, moderator, referee

**Card**:
A physical card from the box containing exactly 4 Questions, assigned to one Team (the Card Owner) for a Round.
_Avoid_: Deck, tile, question set

**Card Owner**:
The Team assigned the current Card. Their players answer Questions 1–4 in sequence.
_Avoid_: Active team, current team

**Round**:
The play cycle for a single Card — the Card Owner attempts all 4 Questions, with Steal opportunities on each failure.
_Avoid_: Turn, hand, set

**Question**:
One of the 4 items on a Card, read aloud by the Host from the physical card.
_Avoid_: Item, prompt, quiz item

**Steal**:
A Steal occurs when the Card Owner answers a Question incorrectly and the opposing Team gets one attempt at the same Question.
_Avoid_: Bonus, intercept, challenge

**Point**:
The unit of score awarded to a Team and attributed to a specific Player for a correct answer. Always 1 per Question regardless of whether it was a Steal.
_Avoid_: Score unit, mark

**Question Counter**:
A global integer that increments from 1 across all Questions played in the Game, displayed on the Host screen.
_Avoid_: Question number, card number, index

## Relationships

- A **Game** has exactly two **Teams** (Blue and Yellow)
- A **Team** has 2–8 **Players**
- A **Card** is assigned to exactly one **Card Owner** (Team) per **Round**
- A **Card** has exactly 4 **Questions**
- A **Question** may result in a **Steal** if the **Card Owner** answers incorrectly
- A **Point** belongs to one **Player** and is counted toward their **Team**
- **Rounds** alternate **Card Owner** between Teams (Blue → Yellow → Blue → …)
- After a **Steal** (successful or not), remaining **Questions** on the **Card** return to the **Card Owner**

## Example dialogue

> **Dev:** "When Yellow steals Q2, does Q3 belong to Yellow now?"
> **Domain expert:** "No — Q3 goes back to the Card Owner (Blue). A Steal is per-Question only. The Card never transfers to the stealing Team."

> **Dev:** "If both teams answer Q3 wrong, does the Card Owner get a second attempt?"
> **Domain expert:** "No — the Question is dropped with no Points awarded. Move to Q4."

## Flagged ambiguities

- "current team" was used loosely to mean both Card Owner and the Team currently answering during a Steal — resolved: Card Owner is the Team assigned the Card; the Stealing Team temporarily becomes the Active answerer but does not become the new Card Owner.
