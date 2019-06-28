import { saveAs } from 'file-saver';

const urlDeckString = (deckSelection, deckAmount, sideSelection, sideAmount) => {
  let saveString = "";
  deckSelection.forEach(card => {
    saveString += deckAmount[card.name] + " " + (card.searchName ? card.searchName : card.name) + "||";
  });
  if (sideSelection.length > 0) {
    sideSelection.forEach(card => {
      saveString += sideAmount[card.name] + " " + (card.searchName ? card.searchName : card.name) + "||";
    });
  }
  return saveString.substring(0, saveString.length - 2);
}

const deckString = (deckSelection, deckAmount, sideSelection, sideAmount, commanderSelection) => {
  let saveString = "";
  deckSelection.forEach(card => {
    saveString += deckAmount[card.name] + " " + card.name + "\n";
  });
  if (sideSelection.length > 0) {
    saveString += "//Sideboard\n";
    sideSelection.forEach(card => {
      saveString += sideAmount[card.name] + " " + card.name + "\n";
    });
  }
  const commanderSize = commanderSelection.size ? commanderSelection.size : commanderSelection.length; //Can be set or array
  if (commanderSize > 0) {
    saveString += "//Commander\n";
    commanderSelection.forEach(cardName => {
      if (deckAmount[cardName]) {
        saveString += "1 " + cardName + "\n";
      }
    });
  }
  return saveString.substring(0, saveString.length - 1);
}

const cockatriceDeckString = (deckSelection, deckAmount, sideSelection, sideAmount, commanderSelection) => {
  let saveString = "";
  deckSelection.forEach(card => {
    saveString += deckAmount[card.name] + " " + card.name + "\n";
  });
  sideSelection.forEach(card => {
    saveString += "SB: " + sideAmount[card.name] + " " + card.name + "\n";
  });
  commanderSelection.forEach(cardName => {
    saveString += "CM: 1 " + cardName + "\n";
  });
  return saveString.substring(0, saveString.length - 1);
}

export const saveDeckFile = (fileName, fileType, deckSelection, deckAmount, sideSelection, sideAmount, commanderSelection) => {
  if (!fileName) {
    return;
  }
  const saveString = fileType === 0 ? cockatriceDeckString(deckSelection, deckAmount, sideSelection, sideAmount, commanderSelection) : deckString(deckSelection, deckAmount, sideSelection, sideAmount, commanderSelection);
  const blob = new Blob([saveString], {type: "plain/text"});
  saveAs(blob, fileName + (fileType === 0 ? ".txt" : ".deck"));
}

export const purchaseDeck = (deckSelection, deckAmount, sideSelection, sideAmount) => {
  /* Temporarily doing GET request. Once TCGPlayer helps with POST requests I can switch back.
  fetch("https://store.tcgplayer.com/massentry?partner=FormatMaker&utm_campaign=affiliate&utm_medium=FormatMaker&utm_source=FormatMaker", {
    method: "POST",
    headers: {
      "Accept": "text/html",
      "Content-Type": "text/plain;charset=UTF-8",
    },
    body: "c=" + "1%20Manalith"//this.deckString(true)
  })
  .then(console.log);
  */
  
  window.open("https://store.tcgplayer.com/massentry?partner=FormatMaker&utm_campaign=affiliate&utm_medium=FormatMaker&utm_source=FormatMaker&c=" + urlDeckString(deckSelection, deckAmount, sideSelection, sideAmount), "_blank");
}