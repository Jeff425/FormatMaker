import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
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
    this.getSponsoredFormats = this.getSponsoredFormats.bind(this);
    this.deleteFormat = this.deleteFormat.bind(this);
    this.cleanUpDB = this.cleanUpDB.bind(this);
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
    return this.db.collection("users").doc(this.auth.currentUser.uid).set({displayName: displayName});
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
  
  writeFormat(authUser, name, desc, longDesc, formatString, successFunc, errorFunc, firebaseId = null) {
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
      this.db.collection("formats").doc(firebaseId).set({name: name, description: desc, longDescription: longDesc, author: authUser.uid, lastUpdate: app.firestore.Timestamp.now()}) :
      this.db.collection("formats").add({name: name, description: desc, longDescription: longDesc, author: authUser.uid, lastUpdate: app.firestore.Timestamp.now()}))
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
              successFunc(doc.data().name, doc.data().description, doc.data().longDescription, data);  
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
    return this.db.collection("formats").where("author", "==", "ii4m8G6M6nOtR7PScINVEK7mV6R2").orderBy("lastUpdate", "desc").limit(25).get();
  }
  
  getSponsoredFormats() {
    return this.db.collection("formats").doc("szCpUyqs9DSXN5SbSelk").get();
  }
  
  deleteFormat(authUser, formatId, successFunc, errorFunc) {
    ReactGA.event({category: "Format", action: "Deleting Format"});
    this.storage.ref().child("format/" + authUser.uid + "/" + formatId + ".format").delete()
    .then(() => this.cleanUpDB(formatId, successFunc, errorFunc))
    .catch(error => {
      this.cleanUpDB(formatId, successFunc, errorFunc);
    });
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
}

export default Firebase;