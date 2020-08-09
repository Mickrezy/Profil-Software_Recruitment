# Profil Software Intern Task - frontend

## Technologies

* JavaScript
* HTML
* CSS

## Setup

Put all the files in the same directory, then open Blackjack.html file. Make sure to enable JavaScript in the browser.
Internet connection is required.

## Game rules 

The game is a Polish variant of blackjack. The first player initially gets two cards, then they can hit (get another one) untill they decide to stop or lose.
They can also pass the turn to the next player, who then gets their card and repeats the process of passing and hitting.
Game ends on one of 3 conditions:
- when all players made their turn
- when one of the players got 2 Aces in their initial hand
- when all the players except the last one lost

Player loses when their hand has more than 21 points (except for 2 Aces). The card scores:
- Jack, Queen, King and Ace are worth 2, 3, 4 and 11 points
- other cards are worth the same amount of points as their printed value

When the game ends, all the players who didn't lose compare their points. The ones closest to 21 points win the game.

## Usage

Initially UI alows the user to chose between two game modes: single player and multiplayer.
After clicking on single player button, UI changes and user starts a game with a bot. 
When choosing multiplayer, user can pick a number between 2 and 8, and then start a game with that many players, or go back to main page.
Technically up to 10 people can play with one deck, but then the game becomes too predictable in the end.

Game UI has 2 main areas: table, where the player sees their cards and points, and sidebar, where logs from previous rounds are kept.
Above the table there are 2 button: hit and pass. When player presses hit, they get a new card. 
If pass is pressed, if there are more players, the next player's turn begins. Otherwise, the game ends and the winners are shown above.
When a player loses after hit, the turn is passed to the next player (if possible), and a notification appears above the table area.

Sidebar shows cards and points of previous players. The list is scrollable, and it can be hidden with a button.

After the game ends, user can choose 2 options: to play the game once again, with the same amount of players and a new deck,
or to go back to main menu.

Bot has a very simple goal: to win at any cost. It will always hit when it has less points than the player, except when
it has 20 points, since that situation is impossible to win. 
If bot has more points in its initial hand than the player, it automatically wins.