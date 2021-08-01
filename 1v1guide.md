# Generals.io 1v1 Guide

## Table of Contents
* [Spawn](#spawn)
* [First Round](#first-round)
    - [Openings to Memorize](#openings-to-memorize)
    - [Choosing Opening Direction](#choosing-opening-direction)
    - [Coping With Bad Spawns](#coping-with-bad-spawns)
* [Second Round](#second-round)

## Spawn
Here are some of the key differences between 1v1 and FFA:

|   | 1v1   | FFA   |
|---| :---: | :---: |
| Players | 2 | 8 |
| Range of map width/height | 20-30 tiles | 30-40 tiles|
| Minimum distance between players | 15 tiles | 9 tiles |

(note: all distances are in Manhattan distance, since this is on a grid)

In general, 1v1 gives each player more space to expand. Players can use offensive strategies more often in 1v1 because they do not have to worry about other players attacking them. Now, let's look at 1v1 spawns in depth.

First of all, not all spawns are equal. Based on your spawn type, your strategy will differ. Some spawn types:
* Small cave with few cities: <https://generals.io/replays/S90FPg32L>
* Cave with many city: <https://generals.io/replays/HYjGdRyaD>
* Big area with few openings: <https://generals.io/replays/HOG8d1pSP>
* Open middle: <https://generals.io/replays/HKnIDs1TP>
* Corners: <https://generals.io/replays/Htihqp58w>

Secondly, not all spawns are equally probable. Empirically, it is about 2 times as likely to spawn in the top left corner than in the center. However, the bigger decider of enemy spawn location is your own spawn. Since the enemy is a minimum of 15 tiles away, there is a large area around your own spawn which you can rule out. The below image shows crossed out tiles 15 units away from the blue generals; any tiles closer the the blue general cannot be a spawn for the red general.

![](generaldist.png)

Note that the red general is exactly 15 units from the blue general (shown by the arrow). It is more likely that the generals spawn close together than far apart, but remember that there is no maximum distance between spawns. With all this information, you can get a very good guess of where your enemy will spawn from the start of the game.

## First Round
A round is 25 turns, which is the amount of time it takes for land to grow in army.

The **first** round is a time for growing land and exploring the spawn. Since the general generates 24 army before the end of the round, it's optimal to get 25 land before the end of the first round. This makes the first round the easiest time to play optimally in the game and a time when experienced players can get a large advantage over the inexperienced.

### Openings to Memorize
There are many ways to get the optimal 25 land opening. Openings consists of turns spent waiting for army to generate and turns spent expanding. Most openings involved moving armies over your own land as well, which wastes time (since expansion is not happening). Here are some openings:
* <https://generals.io/replays/BOPVQajIv> (3-sided opening: wait for 13 army -> expand to 12 new land -> move 7 army over 2 owned land -> expand to 6 new land -> expand to 4 new land -> expand to 2 new land)
* <https://generals.io/replays/SY-9u_qwv> (2-sided opening: wait for 11 army -> expand to 10 new land -> move 6 army over 3 owned land -> expand to 5 new land -> move 5 army over 2 owned land -> expand to 4 new land -> move 4 army over 1 owned land -> expand to 3 new land -> expand to 2 new land)
* <https://generals.io/replays/BcEbiOqDw> (3-sided opening: wait for 10 army -> expand to 9 new land -> wait for 6 army -> move 6 army over 4 owned land -> expand to 5 new land -> wait for 6 army -> move 6 army over 1 owned land -> expand to 5 new land -> expand to 3 new land -> wait for 3 army -> expand to 2 new land)
* <https://generals.io/replays/ruzo204Gu> (4-sided opening: wait for 14 army -> expand to 13 new land -> expand to 5 new land -> expand to 3 new land -> expand to 2 new land)

Openings are typically referred to by how much army is generated before it is moved. For instance, the first opening listed could be called a "13-start".

These may look complicated, but they are easy to remember once you practice them a couple of times. It's also important to remember that split-attacking does not cost you any time in the opening, so many variations of these few openings can be made, such as in the 4-sided opening.

### Choosing Opening Direction
Note that good openings will explore many directions. Otherwise, a surprise attack will be very effective: <https://generals.io/replays/HFuOPvm4P>

After the end of the first round, you can check your enemy's land counter to see how they opened. If they used a 25 land opening, that narrows down their spawn quite a bit. Your choices on which directions to open in will also impact how much you can narrow down your enemy's spawn location. This is why it is not a good idea to take land in caves that you know are safe.

If you see the enemy's land during the first round, you should try to take land that is between your general and the border with enemy land. This is because it is easier to defend if the enemy has to run over your own land to get to your general.

### Coping With Bad Spawns
If there is only 1 open square next to your general, then it will be impossible to get a 25 land opening. So, it's important to know how to get 24 and 23 land openings in spawns like these as well. Here are some examples:
* 23 land opening with 1 open side square: <https://generals.io/replays/B9X9jo-zd>
* 23 land opening with 1 open side square: <https://generals.io/replays/HtCeXgkfu>
* 24 land opening with 2 open side squares: <https://generals.io/replays/BOJ6HriCu>
A slight land disadvantage in the first round is not a big deal usually. What typically matters more is the directions that you choose to expand in. There are some comically bad spawns out there which basically decide the game, however, and in those cases there is little you can do: <https://generals.io/replays/BYLKrynVP>

## Second Round
(needs a lot of editing)

Now that the first round is over, the situation becomes far more complicated than the beginning of the game. "Optimal play" is usually difficult, and your strategy will also now be affected by how your enemy acts, forcing you to improvise and make decisions turn-by-turn. However, there are some general rules of thumb that can help out:
1. Expand on a flank that is least explored.
	- If you don't, you risk getting surprise attacked: <https://generals.io/replays/HFuOPvm4P>
	- I already showed that replay as a mistake in the first round, but I could have made up for the first round by expanding downwards in the second round.
2. Try to surround your enemy.
	- Being surrounded forces the enemy to be a lot more cautious about their movements, since if they attack they leave their general vulnerable from another direction: <https://generals.io/replays/rcbUoNO-O>
    - If you can't surround your enemy, try to at least find 2 different paths to attack them. Repeating the same path to attack will become predictable and easy to counter.
3. Collect army for most of the beginning of the round, expand for most of the end of the round.
	- ex. <https://generals.io/replays/ruUSyVmGd>
	- In that replay, I do expand a little at the beginning of the round just to scout out some more territory, but I still focus on gathering which pays off in defending.
    - There are many exceptions to this. Some players choose to expand very aggressively at the beginning of the round. This strategy will leave them positionally weak because aggressive expansion generally does not give good vision of the map, but it has the potential to gain a lead if you do not watch carefully and recognize what they are doing. <https://generals.io/replays/rFxjfuAnw>
4. Watch the leaderboard.
    - The enemy land counter can tell you if the enemy is expanding. This can tell you if the enemy is on their way to surprise attack you since their land will be constantly expanding every turn. It will also tell you how behind in land you are, which you should constantly keep in mind even if the round just started.

Overall, play is more optimal if you use up more of your available armies by the end of the round. For instance, this game: <https://generals.io/replays/HuZnJD02v>. My amount of "free army" by the end of the round (turn 49.) is 55 - 46 = 9. Free army is army - land since land takes 1 army to occupy that can't be moved. Meanwhile, my enemy has 49 - 30 = 19 free army by the end of the room, which indicates less optimal play. Note that part of the reason I use my free armies faster than my enemy is that I spend many turns taking my enemy's land. Taking enemy land swings the land advantage by 2 land per half-turn while taking neutral land only swings the land advantage by 1 land per half-turn, and also uses army twice as fast. So, if your enemy starts attacking, try to take back land or go into your enemy’s land. If you take neutral land instead, your enemy's land advantage will be increasing by 1 land per half-turn.

## Beyond the Second Round

WIP

## City

WIP
