require("dotenv").config();

const isCameraOn = require("is-camera-on");
const { Client } = require("tplink-smarthome-api");

// Init Firebase Relatime Database (if multiple users is enabled)
let userRef = null;
if (process.env.DB_USER) {
  const admin = require("firebase-admin");

  admin.initializeApp({
    credential: admin.credential.cert({
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url:
        process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
    }),
    databaseURL: process.env.DB_URL
  });

  const db = admin.database();
  userRef = db.ref("users");
}

// Init Kasa smart plug
const client = new Client();
const plug = client.getPlug({ host: process.env.DEVICE_IP });

const checkCamera = async state => {
  const cameraState = await isCameraOn();

  if (cameraState && !state) {
    state = setState(true);
  }

  if (!cameraState && state) {
    state = setState(false);
  }

  setTimeout(() => {
    checkCamera(state);
  }, 5000);
};

const setState = state => {
  // Record state of multiple users in DB, otherwise set state of device directly
  userRef ? persistCameraState(state) : setDeviceState(state);

  return state;
};

const setDeviceState = state => {
  plug.setPowerState(state).catch(e => console.log(e));
};

const persistCameraState = state => {
  userRef
    .child(process.env.DB_USER)
    .set(state)
    .then(function() {
      !state
        ? userRef.once("value").then(function(snapshot) {
            Object.values(snapshot.val()).every(val => val !== true) &&
              setDeviceState(state);
          })
        : setDeviceState(state);
    });
};

// Set initial state
checkCamera(setState(false));
