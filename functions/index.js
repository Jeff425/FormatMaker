const functions = require('firebase-functions');
const admin = require('firebase-admin');
const request = require('request-promise');
admin.initializeApp();

exports.updateDisplayName = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
  }
  if (!data.name) {
    throw new functions.https.HttpsError("invalid-argument", "Missing display name");
  }
  const newName = data.name;
  if (newName.length > 25) {
    throw new functions.https.HttpsError("invalid-argument", "Display name is too long");
  }
  const nameDocRef = admin.firestore().collection("names").doc(newName.toUpperCase());
  const userInfoDocRef = admin.firestore().collection("users").doc(context.auth.uid);
  const formatQueryRef = admin.firestore().collection("formats").where("author", "==", context.auth.uid);
  const commentQueryRef = admin.firestore().collectionGroup("comments").where("author", "==", context.auth.uid);
  const deckQueryRef = admin.firestore().collectionGroup("decks").where("author", "==", context.auth.uid);
  
  return admin.firestore().runTransaction(transaction => {
    
    return transaction.get(nameDocRef)
    .then(nameDoc => {
      if (nameDoc.exists) {
        throw new functions.https.HttpsError("already-exists", "Display name is already taken");
      }
      return transaction.get(userInfoDocRef)
      .then(userInfoDoc => {
        return transaction.get(formatQueryRef)
        .then(result => result.docs)
        .then(formatQuery => {
          return transaction.get(commentQueryRef)
          .then(commentQuery => {
            return transaction.get(deckQueryRef)
            .then(deckQuery => {
              deckQuery.forEach(doc => {
                transaction.update(doc.ref, {authorName: newName});
              });
              commentQuery.forEach(doc => {
                transaction.update(doc.ref, {authorName: newName});
              });
              formatQuery.forEach(doc => {
                transaction.update(doc.ref, {authorName: newName});
              });
              transaction.set(nameDocRef, {ownedBy: context.auth.uid}).set(userInfoDocRef, {displayName: newName}, {merge: true});
              if (userInfoDoc.exists && userInfoDoc.data().displayName) {
                transaction.delete(admin.firestore().collection("names").doc(userInfoDoc.data().displayName.toUpperCase()));
              }
              return {success: true};
            });  
          });
        });
      });
    });
  });
});

exports.toggleFavoriteFormat = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
  }
  if (!data.formatId) {
    throw new functions.https.HttpsError("invalid-argument", "Missing formatId");
  }
  const formatId = data.formatId;
  const formatRef = admin.firestore().collection("formats").doc(formatId);
  const uid = context.auth.uid;
  return admin.firestore().runTransaction(transaction => {
    return transaction.get(formatRef)
    .then(format => {
      let favorites = [];
      if (format.data().favorites) {
        favorites = format.data().favorites;
      }
      const removedFavorite = favorites.filter(favorite => favorite !== uid);
      if (removedFavorite.length < favorites.length) {
        // Removing user from list of favorites
        transaction.update(formatRef, {favorites: removedFavorite, favoriteCount: removedFavorite.length});
        return {isFavorite: false};
      } else {
        // Add user to list of favorites
        const newFavorites = favorites.concat(uid);
        transaction.update(formatRef, {favorites: newFavorites, favoriteCount: newFavorites.length});
        return {isFavorite: true};
      }
    });
  });  
});

exports.writeFormatInfo = functions.firestore.document("formats/{formatId}").onCreate((snap, context) => {
  const createStamp = admin.firestore.Timestamp.now();
  let authName = "";
  return admin.firestore().collection("users").doc(snap.data().author).get()
  .then(authInfo => {
    if (authInfo.exists) {
      authName = authInfo.data().displayName;
    }
    return snap.ref.set({authorName: authName, createDate: createStamp, lastUpdate: createStamp, favorites: []}, {merge: true});
  });
});

// Adds timestamps
exports.updateFormatInfo = functions.firestore.document("formats/{formatId}").onUpdate((change, context) => {
  let oldFavorites = [];
  let newFavorites = [];
  if (change.before.data().favorites) {
    oldFavorites = change.before.data().favorites;
  }
  if (change.after.data().favorites) {
    newFavorites = change.after.data().favorites;
  }
  if (oldFavorites.length !== newFavorites.length) {
    console.log("favorites changed");
    return null;
  }
  if (change.before.data().authorName !== change.after.data().authorName) {
    console.log("authorName changed");
    return null;
  }
  if (!change.before.data().lastUpdate.isEqual(change.after.data().lastUpdate)) {
    console.log("lastUpdate changed");
    return null;
  }
  const updateStamp = admin.firestore.Timestamp.now();
  let createStamp = updateStamp;
  if (change.before.data().createDate) {
    createStamp = change.before.data().createDate;
  }
  return change.after.ref.update({createDate: createStamp, lastUpdate: updateStamp});
});

exports.writeDeckInfo = functions.firestore.document("formats/{formatId}/decks/{deckId}").onCreate((snap, context) => {
  const createStamp = admin.firestore.Timestamp.now();
  let authName = "";
  return admin.firestore().collection("users").doc(snap.data().author).get()
  .then(authInfo => {
    if (authInfo.exists) {
      authName = authInfo.data().displayName;
    }
    return snap.ref.set({authorName: authName, createDate: createStamp, lastUpdate: createStamp, favorites: []}, {merge: true});
  });
});

// Adds timestamps to deck
exports.updateDeckInfo = functions.firestore.document("formats/{formatId}/decks/{deckId}").onUpdate((change, context) => {
  if (change.before.data().authorName !== change.after.data().authorName) {
    console.log("authorName changed");
    return null;
  }
  if (!change.before.data().lastUpdate.isEqual(change.after.data().lastUpdate)) {
    console.log("lastUpdate changed");
    return null;
  }
  const updateStamp = admin.firestore.Timestamp.now();
  let createStamp = updateStamp;
  if (change.before.data().createDate) {
    createStamp = change.before.data().createDate;
  }
  return change.after.ref.update({createDate: createStamp, lastUpdate: updateStamp});
});

exports.addTimestampToComment = functions.firestore.document("formats/{formatId}/comments/{commentId}").onCreate((snap, context) => {
  const createStamp = admin.firestore.Timestamp.now();
  return snap.ref.update({date: createStamp});
});

exports.removeAllComments = functions.firestore.document("formats/{formatId}").onDelete((snap, context) => {
  const commentCollectionId = "formats/" + context.params.formatId + "/comments";
  return admin.firestore().collection(commentCollectionId).get()
  .then(query => {
    const promises = [];
    query.forEach(docSnap => promises.push(docSnap.ref.delete()));
    return Promise.all(promises).then(() => {
      console.log("Deleted all comments for " + context.params.formatId);
      return null;
    });
  });
});

const checkAdmin = context => {
  if (!context.auth) {
    throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
  }
  return admin.firestore().collection("users").doc(context.auth.uid).get()
  .then(userInfo => {
    if (!userInfo.data().admin) {
      throw new functions.https.HttpsError("failed-precondition", "The function must be called as an admin");
    }
    return null;
  });
};

// Can also ban user
exports.deleteFormat = functions.https.onCall((data, context) => {
  if (!data.reportId || !data.formatId) {
    throw new functions.https.HttpsError("invalid-argument", "Missing Arguments");
  }

  return checkAdmin(context).then(() => {
    const formatRef = admin.firestore().collection("formats").doc(data.formatId);
    return formatRef.get().then(format => {
      const author = format.data().author;
      return formatRef.delete().then(() => {
        return admin.storage().bucket().file("format/" + author + "/" + data.formatId + ".format").delete().then(() => {
          const reportRef = admin.firestore().collection("formatReports").doc(data.reportId);
          if (data.banUser === true) {
            return admin.firestore().collection("users").doc(author).set({banned: true}, {merge: true}).then(() => reportRef.delete());
          }
          return reportRef.delete();
        });
      });
    });  
  });
});

// Can also ban user
exports.deleteComment = functions.https.onCall((data, context) => {
  if (!data.reportId || !data.formatId || !data.commentId) {
    throw new functions.https.HttpsError("invalid-argument", "Missing Arguments");
  }
  return checkAdmin(context).then(() => {
    const commentRef = admin.firestore().collection("formats/" + data.formatId + "/comments").doc(data.commentId);
    return commentRef.get().then(comment => {
      const author = comment.data().author;
      return commentRef.delete().then(() => {
        const reportRef = admin.firestore().collection("commentReports").doc(data.reportId);
        if (data.banUser === true) {
          return admin.firestore().collection("users").doc(author).set({banned: true}, {merge: true}).then(() => reportRef.delete());
        }
        return reportRef.delete();
      });
    });
  });
});

// Can also ban user
exports.deleteDeck = functions.https.onCall((data, context) => {
  if (!data.reportId || !data.formatId || !data.deckId) {
    throw new functions.https.HttpsError("invalid-argument", "Missing Arguments");
  }
  return checkAdmin(context).then(() => {
    const deckRef = admin.firestore().collection("formats/" + data.formatId + "/decks").doc(data.deckId);
    return deckRef.get().then(comment => {
      const author = comment.data().author;
      return deckRef.delete().then(() => {
        return admin.storage().bucket().file("deck/" + author + "/" + data.formatId + "/" + data.deckId + ".formatDeck").delete().then(() => {
          const reportRef = admin.firestore().collection("deckReports").doc(data.reportId);
          if (data.banUser === true) {
            return admin.firestore().collection("users").doc(author).set({banned: true}, {merge: true}).then(() => reportRef.delete());
          }
          return reportRef.delete();
        });
      });
    });
  });
});

exports.scryfallCollection = functions.https.onCall((data, context) => {
  if (!data.scryfallBody) {
    throw new functions.https.HttpsError("invalid-argument", "Missing Arguments");
  }
  return request({
    method: "POST",
    uri: "https://api.scryfall.com/cards/collection",
    body: data.scryfallBody,
    json: true
  });
});