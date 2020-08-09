const gameState = {
	playerCount: 1,
	deckID: null,
	players: [],
	activePlayer: null,
	initialCards: null,
};

const initGame = () => {
  showGameUI();
  for (i = 0; i < gameState.playerCount; i++){
    gameState.players.push({
      Cards: [],
      Points: 0, 
      isPlaying: true
    });
  }
  if(gameState.playerCount == 1){
	gameState.players.push({
      Cards: [],
      Points: 0, 
      isPlaying: true
    });
  }
  initDeck().then(() => {
    startGame();
  });
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
  gameState.initialCards = 2;
  newTurn();
}

const newTurn = () =>{
	initHand().then(() => {		
		changePlayerUI();	
		if(gameState.players[gameState.activePlayer].Points == 22 || (gameState.playerCount == 1 && gameState.players[1].Points > gameState.players[0].Points)){
			gameOver();
		}
		else if(gameState.playerCount == 1 && gameState.activePlayer == 1 && gameState.players[1].Points < 20){
			disablePlayerButtons();
			setTimeout(hit, 1000);
		}
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
	if (card=="ACE") return 11;
	else if (card=="JACK" || card=="2") return 2;
	else if (card=="QUEEN" || card=="3") return 3;
	else if (card=="KING" || card=="4") return 4;
	else return parseInt(card);
}

const hit = () =>{
	getCard(1).then(cards => {
		gameState.players[gameState.activePlayer].Points += returnCardValue(cards[0].value);
		gameState.players[gameState.activePlayer].Cards.push(cards[0]);	
		updatePoints();			
		showCard(gameState.players[gameState.activePlayer].Cards.length - 1);			
		if(gameState.players[gameState.activePlayer].Points > 21){
			document.getElementById("game-over-panel").style.display = "block";
			document.getElementById("game-over-text").innerHTML = "Player " + (gameState.activePlayer + 1) + " lost";
			gameState.players[gameState.activePlayer].isPlaying = false;
			gamePass();
		}		
		else if (gameState.playerCount == 1 && gameState.activePlayer == 1){
			if(gameState.players[0].Points >= gameState.players[1].Points && gameState.players[1].Points < 20){
				setTimeout(hit, 1000);
			}
			else gamePass();
		}
	});
}

const pass = () =>{
	document.getElementById("game-over-panel").style.display = "none";
	gamePass();
}

const gamePass = () => {	
	if(gameState.activePlayer < gameState.players.length - 1 && !(gameState.playerCount == 1 && gameState.players[0].isPlaying == false)){
		gameState.activePlayer += 1;
		newTurn();
	}
	else gameOver();
}

const gameOver = () => {
	disablePlayerButtons();
	document.getElementById("info-panel").style.display = "block";
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
				winners.push(i + 1);
			}
		}			
	}
	let msg = "";
	if(winners.length == 1) msg = "Winner: Player " + winners[0];
	else{
		msg = "Winners: Players ";
		for(i = 0; i < winners.length; i++){
			msg += winners[i];
			if (i <	winners.length - 1) msg	+= ", ";
		}		
	}
	document.getElementById("info-text").innerHTML = msg;
}

const changePlayerUI = () => {
	document.getElementById("plrNum").innerHTML = "Player " + (gameState.activePlayer + 1);
	document.getElementById("crdArea").innerHTML = "";
	if(gameState.activePlayer > 0){
		moveToScrollbar();
	}
	showCard(0);
	showCard(1)
	updatePoints();		
}

const updatePoints = () => {
	document.getElementById("plrPts").innerHTML = "Points: " + gameState.players[gameState.activePlayer].Points;
}

const showCard = (index) => {	
	let card = document.createElement("img");	
	card.className = "cardImg";
	card.src = gameState.players[gameState.activePlayer].Cards[index].image;
	document.getElementById("crdArea").appendChild(card);		
}

const showGameUI = () => {
	document.getElementById("game-window").style.display = "block";
	document.getElementById("start-window").style.display = "none";
	document.getElementById("multiplayer-window").style.display = "none";
}

const initMultiplayer = () =>{
	gameState.playerCount = 2;
	document.getElementById("playerCount").innerHTML = gameState.playerCount;
	document.getElementById("start-window").style.display = "none";
	document.getElementById("multiplayer-window").style.display = "block";	
}

const disablePlayerButtons = () =>{
	document.getElementById("hitButton").disabled = true;
	document.getElementById("passButton").disabled = true;
}

const incPlayers = () =>{
	gameState.playerCount++;
	document.getElementById("playerCount").innerHTML = gameState.playerCount;
	if(gameState.playerCount == 8)	document.getElementById("incPlayers").disabled = true;
	else if(gameState.playerCount == 3) document.getElementById("decPlayers").disabled = false;	
}

const decPlayers = () =>{
	gameState.playerCount--;
	document.getElementById("playerCount").innerHTML = gameState.playerCount;
	if(gameState.playerCount == 2)	document.getElementById("decPlayers").disabled = true;
	else if(gameState.playerCount == 7) document.getElementById("incPlayers").disabled = false;	
}

const moveToScrollbar = () => {
	const scrollbar = document.getElementById("scrollbar");
	let playerInfo = document.createElement("div");
	let cards = document.createElement("div");
	playerInfo.className = "scrollbarElement";
	cards.className = "scrollbarElement";
	scrollbar.appendChild(playerInfo);
	scrollbar.appendChild(cards);
	playerInfo.innerHTML = "Player " + gameState.activePlayer + " points: " + gameState.players[gameState.activePlayer - 1].Points;
	for(i = 0; i < gameState.players[gameState.activePlayer - 1].Cards.length; i++){
		let card = document.createElement("img");
		card.className = "scrollbar-cards";
		card.src = gameState.players[gameState.activePlayer-1].Cards[i].image;
		cards.appendChild(card);
	}
}

const hideScrollbar = () => {
	const scrl = document.getElementById("scrollbar");
	if (scrl.style.display === "none"){
		scrl.style.display = "inline-block";
		document.getElementById("btnHide").innerHTML = "Hide";
	}
	else{
		scrl.style.display = "none";
		document.getElementById("btnHide").innerHTML = "Show";
	}
}

const backToMenu = () =>{
	restartGame();
	gameState.playerCount = 1;
	document.getElementById("start-window").style.display = "block";
	document.getElementById("game-window").style.display = "none";	
	document.getElementById("multiplayer-window").style.display = "none";
}

const playAgain = () => {
	restartGame();
	initGame(gameState.playerCount);
}

const restartGame = () =>{
	gameState.deckID = null;
	gameState.players = [];
	gameState.activePlayer = 0;
	gameState.initialCards = 2;	
	document.getElementById("scrollbar").innerHTML = "";
	document.getElementById("hitButton").disabled = false;
	document.getElementById("passButton").disabled = false;
	document.getElementById("info-panel").style.display = "none";	
	document.getElementById("game-over-panel").style.display = "none";
}
