const gameState = {
	playerCount: 1,
	deckID: null,
	players: [],
	activePlayer: null,
	initialCards: null,
	alivePlayers: null,
};

const initGame = () => {
  showGameUI();
  //singleplayer always has playerCount = 1
  if(gameState.playerCount == 1) addPlayers(2);
  else addPlayers(gameState.playerCount);
  initDeck().then(() => {
    startGame();
  });
}

const addPlayers = count =>{
  for (i = 0; i < count; i++){
    gameState.players.push({
      Cards: [],
      Points: 0, 
      isPlaying: true
    });
  }
  gameState.alivePlayers = count;
}

const getData = url => fetch(url).then(res => res.json()).catch(err => err);

const initDeck = () => {
	let url = 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1';
	return getData(url).then(data => {
		gameState.deckID = data.deck_id;			
	});
}

const startGame = () => {
  gameState.activePlayer = 0;
  //with this parameter we can manipulate initial amount of cards player gets
  gameState.initialCards = 2;
  newTurn();
}

const newTurn = () =>{
	//disable buttons so players can't spam "pass" before they actually get their turn
	disablePlayerButtons(true);
	initHand().then(() => {	
		changePlayerUI();				
	}).then(()=>{
		//game ends automatically when player has 2 aces in his initial hand or when bots has more points in its initial hand
		if(gameState.players[gameState.activePlayer].Points == 22 || (gameState.playerCount == 1 && gameState.players[1].Points > gameState.players[0].Points)){
			gameOver();
		}
		else if(gameState.playerCount == 1 && gameState.activePlayer == 1 && gameState.players[1].Points < 20){
			setTimeout(hit, 1000);
		}
		//if there is next human player - enable buttons back
		else disablePlayerButtons(false);
	});				
}

const initHand = () => {
	return getCard(gameState.initialCards).then(cards => {
		for(i = 0; i < gameState.initialCards; i++){
			gameState.players[gameState.activePlayer].Points += returnCardValue(cards[i].value);		
			gameState.players[gameState.activePlayer].Cards.push(cards[i]);		
		}});	
}

const getCard = cardNum => {
	let url = 'https://deckofcardsapi.com/api/deck/' + gameState.deckID + '/draw/?count=' + cardNum;
	return getData(url).then(data => data.cards);
}

const returnCardValue = card => {
	if (card=='ACE') return 11;
	else if (card=='JACK' || card=='2') return 2;
	else if (card=='QUEEN' || card=='3') return 3;
	else if (card=='KING' || card=='4') return 4;
	else return parseInt(card);
}

const hit = () =>{
	getCard(1).then(cards => {
		gameState.players[gameState.activePlayer].Points += returnCardValue(cards[0].value);
		gameState.players[gameState.activePlayer].Cards.push(cards[0]);	
		updatePoints();			
		showCard(gameState.players[gameState.activePlayer].Cards.length - 1);			
		if(gameState.players[gameState.activePlayer].Points > 21){
			playerLost();
		}		
		else if (gameState.playerCount == 1 && gameState.activePlayer == 1){
			if(gameState.players[0].Points >= gameState.players[1].Points && gameState.players[1].Points < 20){
				//timeout so bot doesn't get all cards at once
				setTimeout(hit, 1000);
			}
			else gameOver();
		}
	});
}

const playerLost = () =>{
	document.getElementById('game-over-panel').style.display = 'block';
	document.getElementById('game-over-text').innerHTML = 'Player ' + (gameState.activePlayer + 1) + ' lost';
	gameState.players[gameState.activePlayer].isPlaying = false;
	gameState.alivePlayers -= 1;
	gamePass();
}

const pass = () =>{
	document.getElementById('game-over-panel').style.display = 'none';
	gamePass();
}

const gamePass = () => {
	//game ends when all the players made their turn or all players before the last one lost	
	if(gameState.activePlayer < gameState.players.length - 1 && gameState.alivePlayers > 1){
		gameState.activePlayer += 1;
		newTurn();
	}	
	else{ 
		disablePlayerButtons(true)
		gameOver();
	}
}

const gameOver = () => {
	document.getElementById('info-panel').style.display = 'block';
	let winners = [];
	let bestScore = 0;
	for(i = 0; i < gameState.players.length; i++){
		if (gameState.players[i].isPlaying == true){
			if(gameState.players[i].Points > bestScore){
				winners = [];
				winners.push(i + 1);
				bestScore = gameState.players[i].Points;
			}
			else if (gameState.players[i].Points == bestScore){
				//in case of draws
				winners.push(i + 1);
			}
		}			
	}
	let msg = '';
	if(winners.length == 1) msg = 'Winner: Player ' + winners[0];
	else{
		msg = 'Winners: Players ';
		for(i = 0; i < winners.length; i++){
			msg += winners[i];
			if (i <	winners.length - 1) msg	+= ', ';
		}		
	}
	document.getElementById('info-text').innerHTML = msg;
}

//UI set for next player
const changePlayerUI = () => {
	document.getElementById('plrNum').innerHTML = 'Player ' + (gameState.activePlayer + 1);
	document.getElementById('crdArea').innerHTML = '';
	if(gameState.activePlayer > 0){
		moveToScrollbar();
	}
	for(i = 0; i < gameState.initialCards; i++){
		showCard(i);
	}
	updatePoints();		
}

const updatePoints = () => {
	document.getElementById('plrPts').innerHTML = 'Points: ' + gameState.players[gameState.activePlayer].Points;
}

const showCard = (index) => {	
	let card = document.createElement('img');	
	card.className = 'cardImg';
	card.src = gameState.players[gameState.activePlayer].Cards[index].image;
	document.getElementById('crdArea').appendChild(card);		
}

const showGameUI = () => {
	document.getElementById('game-window').style.display = 'block';
	document.getElementById('start-window').style.display = 'none';
	document.getElementById('multiplayer-window').style.display = 'none';
}

const initMultiplayer = () =>{
	gameState.playerCount = 2;
	document.getElementById('playerCount').innerHTML = gameState.playerCount;
	document.getElementById('start-window').style.display = 'none';
	document.getElementById('multiplayer-window').style.display = 'block';	
}

//disable or enable pass and hit buttons during bot turn or when the game is over
const disablePlayerButtons = disable =>{
	document.getElementById('hitButton').disabled = disable;
	document.getElementById('passButton').disabled = disable;
}

const incPlayers = () =>{
	gameState.playerCount++;
	document.getElementById('playerCount').innerHTML = gameState.playerCount;
	//technically max number of players for 1 deck is 10, but I set it to 8 so the game is not too predictable in the end
	if(gameState.playerCount == 8)	document.getElementById('incPlayers').disabled = true;
	else if(gameState.playerCount == 3) document.getElementById('decPlayers').disabled = false;	
}

const decPlayers = () =>{
	gameState.playerCount--;
	document.getElementById('playerCount').innerHTML = gameState.playerCount;
	if(gameState.playerCount == 2)	document.getElementById('decPlayers').disabled = true;
	else if(gameState.playerCount == 7) document.getElementById('incPlayers').disabled = false;	
}

//move active player's cards to scrollbar
const moveToScrollbar = () => {
	const scrollbar = document.getElementById('scrollbar');
	let playerInfo = document.createElement('div');
	let cards = document.createElement('div');
	playerInfo.className = 'scrollbarElement';
	cards.className = 'scrollbarElement';
	scrollbar.appendChild(playerInfo);
	scrollbar.appendChild(cards);
	playerInfo.innerHTML = 'Player ' + gameState.activePlayer + ' points: ' + gameState.players[gameState.activePlayer - 1].Points;
	for(i = 0; i < gameState.players[gameState.activePlayer - 1].Cards.length; i++){
		let card = document.createElement('img');
		card.className = 'scrollbar-cards';
		card.src = gameState.players[gameState.activePlayer-1].Cards[i].image;
		cards.appendChild(card);
	}
}

const hideScrollbar = () => {
	const scrl = document.getElementById('scrollbar');
	if (scrl.style.display === 'none'){
		scrl.style.display = 'inline-block';
		document.getElementById('btnHide').innerHTML = 'Hide';
	}
	else{
		scrl.style.display = 'none';
		document.getElementById('btnHide').innerHTML = 'Show';
	}
}

const backToMenu = () =>{
	restartGame();
	gameState.playerCount = 1;
	document.getElementById('start-window').style.display = 'block';
	document.getElementById('game-window').style.display = 'none';	
	document.getElementById('multiplayer-window').style.display = 'none';
}

//play the game with the same amount of players
const playAgain = () => {
	restartGame();
	initGame(gameState.playerCount);
}

//reset game to its original state
const restartGame = () =>{
	gameState.deckID = null;
	gameState.players = [];
	document.getElementById('scrollbar').innerHTML = '';
	document.getElementById('crdArea').innerHTML = '';
	document.getElementById('plrNum').innerHTML = 'Player 1';
	document.getElementById('plrPts').innerHTML = 'Points: 0'
	disablePlayerButtons(false);
	document.getElementById('info-panel').style.display = 'none';	
	document.getElementById('game-over-panel').style.display = 'none';
}
