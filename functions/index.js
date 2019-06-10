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