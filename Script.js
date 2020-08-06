async function initGame(playerCount){
	let activePlayer = 0;
	const playerArray = [];
	let deck = await initDeck();
	for (i = 0; i < playerCount; i++){
		let player = {Cards: [], Points: 0, Alive: true};
		playerArray.push(player);
	}
	newTurn(activePlayer, playerArray, deck);
}

async function getData(url) {
    const response = await fetch(url);
    return response.json()
}

async function initDeck(){
	let url = 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1';
	const data = await getData(url);
	console.log("Deck id: " + data.deck_id);
	return data.deck_id;
}

async function initHand(player, deck, index){
	for(i = 0; i < 2; i++){
		const card = await getCard(deck);
		player.Points += returnCardValue(card.value);		
		player.Cards.push(card);
		updatePlayerUI(index, card);		
	}	
}

async function getCard(deck){
	let url = 'https://deckofcardsapi.com/api/deck/' + deck + '/draw/?count=1';
	const card = await getData(url);
	console.log("Added " + card.cards[0].value + " of " + card.cards[0].suit); 
	return card.cards[0];
}

function returnCardValue(card){
	if (card=="ACE") return 11;
	else if (card=="JACK" || card=="2") return 2;
	else if (card=="QUEEN" || card=="3") return 3;
	else if (card=="KING" || card=="4") return 4;
	else return parseInt(card);
}

function updatePlayerUI(index, card){
	//todo: putting cards on the table and updating player points
}

async function hit(activePlayer, playerArray, deck){
	const card = await getCard(deck);
	playerArray[activePlayer].Points += returnCardValue(card.value);
	playerArray[activePlayer].Cards.push(card);		
	updatePlayerUI(activePlayer, card);
	if(playerArray[activePlayer].Points > 21){
		playerArray[activePlayer].Alive = false;
		pass(activePlayer, playerArray, deck);
	}
}

function pass(activePlayer, playerArray, deck){
	if(activePlayer < playerArray.length - 1) newTurn(activePlayer + 1, playerArray, deck);
	else gameOver(playerArray);
}

async function newTurn(activePlayer, playerArray, deck){
	await initHand(playerArray[activePlayer], deck, activePlayer);
	console.log("Player: " + activePlayer + " Points: " + playerArray[activePlayer].Points);
	if(playerArray[activePlayer].Points == 22){
		gameOver(playerArray);
	}
	else{
		//todo: UI changing for the next player
		//document.getElementById("hitButton").addEventListener("click", hit(activePlayer, playerArray, deck));
		//document.getElementById("passButton").addEventListener("click", pass(activePlayer, playerArray, deck));
	}				
}

function gameOver(playerArray){
	const winners = [];
	let bestScore = 0;
	for(i = 0; i < playerArray.length; i++){
		if (playerArray[i].Alive == true){
			if(playerArray[i] > bestScore){
				winners = [];
				winners.push(i);
			}
			else if (playerArray[i] == bestScore){
				winners.push(i);
			}
		}			
	}
	//todo: window for scores and "play again" function
}

function restartGame(){
	//game reset
}


