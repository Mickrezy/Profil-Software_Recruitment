const gameState = {
	deckID: null,
	players: [],
	isSinglePlayer: false,
	isGameInitializing: false,
	isGameActive: false,
	isGameOver: false,
	activePlayer: null,
	initialCards: null,
};

const getData = url => fetch(url).then(res => res.json()).catch(err => err);

const initDeck = () => {
	let url = 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1';
	return getData(url).then(data => {
		gameState.deckID = data.deck_id;			
	});
}

const initGame = playerCount => {
  gameState.Initializing = true;
  showTable();
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
    gameState.isGameActive= true;
	gameState.isGameInitialized = false;
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

const newTurn = () =>{
	initHand().then(() => {		
		updatePlayerUI();	
		if(gameState.players[gameState.activePlayer].Points == 22 || (gameState.isSinglePlayer && gameState.players[1].Points > gameState.players[0].Points)){
			gameOver();
		}
		else if(gameState.isSinglePlayer && gameState.activePlayer == 1 && gameState.players[1].Points < 20){
			setTimeout(hit, 1500);
		}
	});				
}

const hit = () =>{
	getCard(1).then(cards => {
		gameState.players[gameState.activePlayer].Points += returnCardValue(cards[0].value);
		gameState.players[gameState.activePlayer].Cards.push(cards[0]);	
		updatePoints();			
		showCard(gameState.players[gameState.activePlayer].Cards.length - 1);	
		
		if(gameState.players[gameState.activePlayer].Points > 21){
			gameState.players[gameState.activePlayer].Alive = false;
			pass();
		}
		
		else if (gameState.isSinglePlayer && gameState.activePlayer == 1){
			if(gameState.players[0].Points >= gameState.players[1].Points && gameState.players[1].Points < 20){
				setTimeout(hit, 1500);
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
	gameState.isGameOver = true;
	document.getElementById("hitButton").disabled = true;
	document.getElementById("passButton").disabled = true;
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

const updatePlayerUI = () => {
	document.getElementById("plrNum").innerHTML = "Player " + (gameState.activePlayer + 1);
	const cards = document.getElementById("crdArea");
	cards.innerHTML = "";
	if(gameState.activePlayer > 0){
		moveToScrollbar();
	}
	setTimeout(showCard(0), 1500);
	updatePoints();
	setTimeout(showCard(1), 1500);
	updatePoints();
		
}

const updatePoints = () => {
	document.getElementById("plrPts").innerHTML = gameState.players[gameState.activePlayer].Points;
}

const showCard = (index) => {
	const cardArea = document.getElementById("crdArea");  	
	let card = document.createElement("img");	
	card.className = "cardImg";
	card.src = gameState.players[gameState.activePlayer].Cards[index].image;
	cardArea.appendChild(card);		
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
	cards.innerHtml += "</br>";
	
}


const showTable = () => {
	const table = document.getElementById("game-window");
	const menu = document.getElementById("start-window");
	menu.style.display = "none";
	table.style.display = "block";
}

const hideScrollbar = () => {
	const scrl = document.getElementById("scrollbar");
	const btn = document.getElementById("btnHide");
	if (scrl.style.display === "none"){
		scrl.style.display = "inline-block";
		btn.value = "Hide";
	}
	else{
		scrl.style.display = "none";
		btn.value = "Show";
	}
}
