const gameState = {
	deckID: null,
	players: [],
	isSinglePlayer: false,
	isGameInitializing: false,
	isGameInitialized: false,
	activePlayer: null,
	initialCards: null,
};

const getData = url => fetch(url).then(res => res.json()).catch(err => err);

const initDeck = () => {
	let url = 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1';
	return getData(url).then(data => {
		gameState.deckID = data.deck_id;	
		console.log("DeckID: " + gameState.deckID);		
	});
}

const initGame = playerCount => {
  gameState.isGameInitializing = true;
  for (i = 0; i < playerCount; i++){
    gameState.players.push({
      Cards: [],
      Points: 0, 
      Alive: true
    });
  }
  if(playerCount == 1){
	gameState.isSinglePlayer = true;
	gameState.players.push({
      Cards: [],
      Points: 0, 
      Alive: true
    });
  }
  initDeck().then(() => {
    gameState.isGameInitializing = false;
    gameState.isGameInitialized = true;
    startGame();
  });
}

const startGame = () => {
  gameState.activePlayer = 0;
  gameState.initialCards = 2;
  newTurn();
}

const initHand = () => {
	return getCard(gameState.initialCards).then(cards => {
		for(i = 0; i < gameState.initialCards; i++){
			console.log("Card: " + cards[i].value + " of " + cards[i].suit);
			gameState.players[gameState.activePlayer].Points += returnCardValue(cards[i].value);		
			gameState.players[gameState.activePlayer].Cards.push(cards[i]);		
		}}).then(()=> updatePlayerUI());	
}

const getCard = cardNum => {
	let url = 'https://deckofcardsapi.com/api/deck/' + gameState.deckID + '/draw/?count=' + cardNum;
	return getData(url).then(data => data.cards);
}

const returnCardValue = card => {
	if (card=="ACE") return 11;
	else if (card=="JACK" || card=="2") return 2;
	else if (card=="QUEEN" || card=="3") return 3;
	else if (card=="KING" || card=="4") return 4;
	else return parseInt(card);
}

const updatePlayerUI = () => {
	//todo: putting cards on the table and updating player points
}

const newTurn = () =>{
	initHand().then(() => {		
		console.log("Player: " + gameState.activePlayer + " Points: " + gameState.players[gameState.activePlayer].Points);
		if(gameState.players[gameState.activePlayer].Points == 22 || (gameState.isSinglePlayer && gameState.players[1].Points > gameState.players[0].Points)){
			gameOver();
		}
		else if(gameState.isSinglePlayer && gameState.activePlayer == 1 && gameState.players[1].Points < 20){
			hit();
		}
		/*else{
			//todo: UI changes for the next player
		}*/
	});				
}

const hit = () =>{
	getCard(1).then(cards => {
		console.log("Player: " + gameState.activePlayer + " drew card: " + cards[0].value + " of " + cards[0].suit);
		gameState.players[gameState.activePlayer].Points += returnCardValue(cards[0].value);
		gameState.players[gameState.activePlayer].Cards.push(cards[0]);	
		console.log("Player: " + gameState.activePlayer + " Points: " + gameState.players[gameState.activePlayer].Points);		
		updatePlayerUI();
		if(gameState.players[gameState.activePlayer].Points > 21){
			gameState.players[gameState.activePlayer].Alive = false;
			pass();
		}
		else if (gameState.isSinglePlayer && gameState.activePlayer == 1){
			if(gameState.players[0].Points >= gameState.players[1].Points && gameState.players[1].Points < 20){
				setTimeout(hit, 1000);
			}
			else pass();
		}
	});
}

const pass = () => {
	if(gameState.activePlayer < gameState.players.length - 1 && !(gameState.isSinglePlayer && gameState.players[0].Alive == false)){
		gameState.activePlayer += 1;
		newTurn();
	}
	else gameOver();
}

const gameOver = () => {
	let winners = [];
	let bestScore = 0;
	for(i = 0; i < gameState.players.length; i++){
		if (gameState.players[i].Alive == true){
			if(gameState.players[i].Points > bestScore){
				winners = [];
				winners.push(i);
				bestScore = gameState.players[i].Points;
			}
			else if (gameState.players[i].Points == bestScore){
				winners.push(i);
			}
		}			
	}
	let msg = "";
	for(i = 0; i < winners.length; i++){
		msg += "Player " + winners[i] + " ";
	}
	msg += "won!"
	console.log(msg);
	//todo: window for scores and "play again" function
}

const restartGame = () =>{
	//game reset
	gameState.deckID = null;
	gameState.players = [];
	gameState.isGameInitializing = false;
	gameState.isGameInitialized = false;
	gameState.isSinglePlayer = false;
	gameState.activePlayer = 0;
	gameState.initialCards = 2;
}


