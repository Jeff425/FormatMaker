import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/functions';
import ReactGA from 'react-ga';

const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
};

class Firebase {
  constructor() {
    app.initializeApp(config);
    this.auth = app.auth();
    this.db = app.firestore();
    this.storage = app.storage();
    this.functions = app.functions();
    this.createUser = this.createUser.bind(this);
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
    this.passwordReset = this.passwordReset.bind(this);
    this.passwordUpdate = this.passwordUpdate.bind(this);
    this.displayNameUpdate = this.displayNameUpdate.bind(this);
    this.getUserInfo = this.getUserInfo.bind(this);
    this.writeFormat = this.writeFormat.bind(this);
    this.readFormat = this.readFormat.bind(this);
    this.getFormatMetadata = this.getFormatMetadata.bind(this);
    this.queryFormats = this.queryFormats.bind(this);
    this.querySponsoredFormats = this.querySponsoredFormats.bind(this);
    this.queryNewestFormats = this.queryNewestFormats.bind(this);
    this.queryMostFavoritedFormats = this.queryMostFavoritedFormats.bind(this);
    this.queryFavoriteFormats = this.queryFavoriteFormats.bind(this);
    this.toggleFavoriteFormat = this.toggleFavoriteFormat.bind(this);
    this.deleteFormat = this.deleteFormat.bind(this);
    this.reportFormat = this.reportFormat.bind(this);
    this.queryFormatReports = this.queryFormatReports.bind(this);
    this.ignoreReport = this.ignoreReport.bind(this);
    this.deleteFormatAdmin = this.deleteFormatAdmin.bind(this);
    this.writeComment = this.writeComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
    this.queryComments = this.queryComments.bind(this);
    this.reportComment = this.reportComment.bind(this);
    this.queryCommentReports = this.queryCommentReports.bind(this);
    this.ignoreCommentReport = this.ignoreCommentReport.bind(this);
    this.deleteCommentAdmin = this.deleteCommentAdmin.bind(this);
    this.cleanUpDB = this.cleanUpDB.bind(this);
    this.scryfallCollectionPost = this.scryfallCollectionPost.bind(this);
  }
  
  createUser(email, password) {
    ReactGA.event({category: "User", action: "Created an account"});
    return this.auth.createUserWithEmailAndPassword(email, password);
  }
  
  signIn(email, password) {
    ReactGA.event({category: "User", action: "Signed in"});
    return this.auth.signInWithEmailAndPassword(email, password);
  }
  
  signOut() {
    ReactGA.event({category: "User", action: "Signed out"});
    return this.auth.signOut();
  }
  
  passwordReset(email) {
    ReactGA.event({category: "User", action: "Sent password reset"});
    return this.auth.sendPasswordResetEmail(email);
  }
  
  passwordUpdate(password, currentPassword) {
    ReactGA.event({category: "User", action: "Updated password"});
    return new Promise((resolve, reject) => {
      this.auth.currentUser.reauthenticateAndRetrieveDataWithCredential(app.auth.EmailAuthProvider.credential(this.auth.currentUser.email, currentPassword))
      .then(() => {
        this.auth.currentUser.updatePassword(password)
        .then(resolve)
        .catch(reject);
      })
      .catch(reject);
    });
  }
  
  displayNameUpdate(displayName) {
    ReactGA.event({category: "User", action: "Updated display name"});
    const displayNameCallable = this.functions.httpsCallable("updateDisplayName");
    return displayNameCallable({name: displayName});
  }
  
  getUserInfo(uid) {
    return new Promise((resolve, reject) => {
      this.db.collection("users").doc(uid).get()
      .then(doc => {
        if (doc.exists) {
          const data = {...doc.data()};
          data.uid = uid;
          resolve(data);
        } else {
          resolve({notFound: true});
        }
      })
      .catch(reject);
    });
  }
  
  writeFormat(authUser, name, desc, longDesc, hasUpdatedCards, commanderFormat, formatString, successFunc, errorFunc, firebaseId = null) {
    ReactGA.event({category: "Format", action: (firebaseId ? "Updated format " + firebaseId : "Created new format")});
    if (authUser === null) {
      errorFunc("Not signed in");
      return;
    }
    if (name === "" || desc === "") {
      errorFunc("Empty name or description");
      return;
    }
    if (formatString === "") {
      errorFunc("Empty format");
      return;
    }
    if (!longDesc) { //For backwards compatibility
      longDesc = "";
    }
    (firebaseId ?
      this.db.collection("formats").doc(firebaseId).update({name: name, description: desc, longDescription: longDesc, hasUpdatedCards: !!hasUpdatedCards, commanderFormat: !!commanderFormat}) :
      this.db.collection("formats").add({name: name, description: desc, longDescription: longDesc, author: authUser.uid, hasUpdatedCards: !!hasUpdatedCards, commanderFormat: !!commanderFormat}))
      .then(docRef => {
        const formatRef = this.storage.ref().child("format/" + authUser.uid + "/" + (firebaseId ? firebaseId : docRef.id) + ".format");
        formatRef.putString(formatString)
          .then(snapshot => {
            successFunc(firebaseId ? firebaseId : docRef.id);
          })
          .catch(error => {
            errorFunc("Failed to upload format: " + error.code);
            if (!firebaseId) { // This was the initial upload, meaning the format will not be found
              this.cleanUpDB(docRef.id, successFunc, errorFunc);
            }
          });
      })
      .catch(error => {
        errorFunc("Failed to set format: " + error.code);
      });
  }
  
  readFormat(firebaseId, successFunc, errorFunc, checkAuth = false, authUser = null) {
    if (firebaseId === null) {
      errorFunc("No ID given");
      return;
    }
    this.db.collection("formats").doc(firebaseId).get().then(doc => {
      if (doc.exists) {
        if (checkAuth) {
          if (authUser === null || authUser.uid !== doc.data().author) {
            errorFunc("Cannot edit format, not owner");
            return;
          }
        }
        this.storage.ref().child("format/" + doc.data().author + "/" + firebaseId + ".format").getDownloadURL()
        .then(url => {
          fetch(url)
          .then(result => {
            result.text().then(data => {
              successFunc(doc.data().name, doc.data().description, doc.data().longDescription, !!doc.data().hasUpdatedCards, !!doc.data().commanderFormat, data);  
            });            
          })
          .catch(error => {
            errorFunc("Failed to download format");
            console.log(error);
          });
        })
        .catch(error => {
          errorFunc("Error obtaining format URL: " + error.code);
        });
      } else {
        errorFunc("Format does not exist");
      }
    })
    .catch(error => {
      errorFunc("Failed to get format: " + error.code);
    });
  }
  
  getFormatMetadata(firebaseId) {
    return this.db.collection("formats").doc(firebaseId).get();
  }
  
  queryFormats(authUser = null) {
    if (authUser) {
      return this.db.collection("formats").where("author", "==", authUser.uid).orderBy("lastUpdate", "desc").get();
    }
    return this.db.collection("formats").orderBy("lastUpdate", "desc").limit(25).get();
  }
  
  queryNewestFormats() {
    return this.db.collection("formats").orderBy("createDate", "desc").limit(25).get();
  }
  
  queryMostFavoritedFormats() {
    return this.db.collection("formats").orderBy("favoriteCount", "desc").limit(25).get();
  }
  
  querySponsoredFormats() {
    return this.db.collection("formats").where("sponsored", "==", true).orderBy("lastUpdate", "desc").get();
  }
  
  queryFavoriteFormats() {
    const uid = this.auth.currentUser.uid;
    return this.db.collection("formats").where("favorites", "array-contains", uid).orderBy("lastUpdate", "desc").get();
  }
  
  toggleFavoriteFormat(firebaseId) {
    const toggleCallable = this.functions.httpsCallable("toggleFavoriteFormat");
    return toggleCallable({formatId: firebaseId});
  }
  
  deleteFormat(authUser, formatId, successFunc, errorFunc) {
    ReactGA.event({category: "Format", action: "Deleting Format"});
    this.storage.ref().child("format/" + authUser.uid + "/" + formatId + ".format").delete()
    .then(() => this.cleanUpDB(formatId, successFunc, errorFunc))
    .catch(error => {
      this.cleanUpDB(formatId, successFunc, errorFunc);
    });
  }
  
  reportFormat(firebaseId, description) {
    return this.db.collection("formatReports").add({formatId: firebaseId, description: description, date: app.firestore.Timestamp.now(), unread: true});
  }
  
  queryFormatReports(unreadOnly) {
    if (unreadOnly) {
      return this.db.collection("formatReports").where("unread", "==", true).orderBy("date", "desc").get();
    }
    return this.db.collection("formatReports").orderBy("date", "desc").get();
  }
  
  ignoreReport(reportId) {
    return this.db.collection("formatReports").doc(reportId).update({unread: false});
  }
  
  deleteFormatAdmin(reportId, formatId, banUser) {
    const deleteFormatAdminCallable = this.functions.httpsCallable("deleteFormat");
    return deleteFormatAdminCallable({reportId: reportId, formatId: formatId, banUser: banUser});
  }
  
  // Can edit comment
  writeComment(formatId, author, authorName, text, commentId = null) {
    if (commentId) {
      return this.db.collection("formats/" + formatId + "/comments").doc(commentId).update({authorName: authorName, text: text, edited: true});
    }
    return this.db.collection("formats/" + formatId + "/comments").add({author: author, authorName: authorName, text: text, edited: false});
  }
  
  deleteComment(formatId, commentId) {
    return this.db.collection("formats/" + formatId + "/comments").doc(commentId).delete();
  }
  
  queryComments(formatId) {
    return this.db.collection("formats/" + formatId + "/comments").orderBy("date", "desc").get();
  }
  
  reportComment(formatId, commentId, comment, description) {
    return this.db.collection("commentReports").add({formatId: formatId, commentId: commentId, comment: comment, description: description, date: app.firestore.Timestamp.now(), unread: true});
  }
  
  queryCommentReports(unreadOnly) {
    if (unreadOnly) {
      return this.db.collection("commentReports").where("unread", "==", true).orderBy("date", "desc").get();
    }
    return this.db.collection("commentReports").orderBy("date", "desc").get();
  }
  
  ignoreCommentReport(reportId) {
    return this.db.collection("commentReports").doc(reportId).update({unread: false});
  }
  
  deleteCommentAdmin(reportId, formatId, commentId, banUser) {
    const deleteFormatAdminCallable = this.functions.httpsCallable("deleteComment");
    return deleteFormatAdminCallable({reportId: reportId, formatId: formatId, commentId: commentId, banUser: banUser});
  }
  
  cleanUpDB(formatId, successFunc, errorFunc) {
    this.db.collection("formats").doc(formatId).delete()
    .then(() => {
      successFunc();
    })
    .catch(error => {
      errorFunc("Error deleting format from database: " + error.code);
    });
  }
  
  queryChangelog() {
    return this.db.collection("changelog").orderBy("date", "desc").get();
  }
  
  scryfallCollectionPost(scryfallBody) {
    const scryfallCollection = this.functions.httpsCallable("scryfallCollection");
    return scryfallCollection({scryfallBody: scryfallBody});
  }
}

export default Firebase;