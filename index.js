require("dotenv").config();

const admin = require("firebase-admin");
const isCameraOn = require("is-camera-on");
const { Client } = require("tplink-smarthome-api");

// Init Kasa smart plug
const client = new Client();
const plug = client.getPlug({ host: process.env.DEVICE_IP });

// Init Firebase Relatime Database
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
const userRef = db.ref("users");

async function check_camera(status) {
  const camera_status = await isCameraOn();

  if (camera_status && !status) {
    status = true;
    userRef.child(process.env.DB_USER).set(true);
    plug.setPowerState(true);
  }

  if (!camera_status && status) {
    status = false;
    userRef
      .child(process.env.DB_USER)
      .set(false)
      .then(function() {
        userRef.once("value").then(function(snapshot) {
          Object.values(snapshot.val()).every(val => val !== true) &&
            plug.setPowerState(false);
        });
      });
  }

  setTimeout(() => {
    check_camera(status);
  }, 5000);
}

(async () => {
  plug.setPowerState(false);
  userRef.child(process.env.DB_USER).set(false);
  check_camera(false);
})();
