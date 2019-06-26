const mapCards = data => data.map((e) => {
  return {
    imageUri: e.image_uris ? e.image_uris.small : (e.card_faces ? e.card_faces[0].image_uris.small : "//:0"),
    normalImage: e.image_uris ? e.image_uris.normal : (e.card_faces ? e.card_faces[0].image_uris.normal : "//:0"),
    gathererLink: e.related_uris.gatherer,
    name: e.name,
    searchName: (e.card_faces ? e.card_faces[0].name : e.name),
    type_line: e.type_line ? e.type_line : (e.card_faces ? e.card_faces[0].type_line : ""),
    oracle_text: e.oracle_text ? e.oracle_text : (e.card_faces ? e.card_faces[0].oracle_text : ""),
    colors: e.colors,
    color_identity: e.color_identity,
    mana_cost: e.mana_cost ? e.mana_cost : (e.card_faces ? e.card_faces[0].mana_cost : ""),
    cmc: e.cmc,
    id: e.id,
    price: e.prices.usd
  };
});

export const scryfallUpdate = (result, updateFunc, endFunc) => {
  if (result.data) {
    const data = mapCards(result.data);
    updateFunc(data);
    if (!result.has_more) {
      endFunc();
    }
    else {         
      setTimeout(() => scryfallLoop(result.next_page, updateFunc, endFunc), 100);
    }
  }
  else {
    endFunc();
  }
};

export const scryfallLoop = (query, updateFunc, endFunc) => {
  fetch(query)
  .then(res => res.json())
  .then(result => scryfallUpdate(result, updateFunc, endFunc),
  (error) => {
    console.log(error);
  });
};

//Returns a promise with an array of found cards, and an array of card names not found
export const scryfallPost = (cards, firebase) => {
  let foundCards = [];
  let notFound = [];
  const bodies = []
  for(let i = 0; i < cards.length; i += 75) {
    const splitCards = cards.slice(i, i + 75);
    bodies.push({identifiers: splitCards.map(card => {
        return {
          name: card.name
        };
      })
    });
  }
  return new Promise((resolve, reject) => {
    const repeatFunc = (bodyIndex) => {
      firebase.scryfallCollectionPost(bodies[bodyIndex])
      .then(result => {
        foundCards = foundCards.concat(mapCards(result.data.data));
        notFound = notFound.concat(result.data.not_found);
        if (bodyIndex + 1 >= bodies.length) {
          resolve({foundCards: foundCards, notFound: notFound});
        } else {
          setTimeout(() => repeatFunc(bodyIndex + 1), 100);
        }
      })
      .catch(reject);
    };
    repeatFunc(0);
  });
};