const functions = require('firebase-functions');
const admin = require('firebase-admin');
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
          formatQuery.forEach(doc => {
            transaction.set(admin.firestore().collection("formats").doc(doc.id), {authorName: newName}, {merge: true});
          });
          transaction.set(nameDocRef, {ownedBy: context.auth.uid}).set(userInfoDocRef, {displayName: newName});
          if (userInfoDoc.exists && userInfoDoc.data().displayName) {
            transaction.delete(admin.firestore().collection("names").doc(userInfoDoc.data().displayName.toUpperCase()));
          }
          return {success: true};
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
