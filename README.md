# busy-bulb

> Toggle a smart bulb to let others know you're actively on a video call

## Requirements

- Node.js
- macOS 10.11 or later
- [Supported](https://github.com/plasticrake/tplink-smarthome-api#known-supported-devices) TP-Link Kasa plug or bulb

### Optional

- [Firebase Realtime Database](https://firebase.google.com/docs/database) (for sharing a plug or bulb between multiple people)

## Install

To run on your machine, clone the repository and run:

```
npm install
```

Once all of the dependencies are installed, make a copy the sample `.env` file:

```
cd busy-bulb
cp .env.sample .env
```

Provide the IP address of the plug or bulb to toggle:

```
DEVICE_IP=192.168.1.22
```

### Sharing busy-bulb

If there are multiple people sharing the same smart plug or bulb, the status of each person is persisted to Firebase Realtime Database to prevent the plug or bulb from turning off before all video calls have ended.

To configure busy-bulb for multiple people, provide the following environment variables in your `.env` file:

```
DEVICE_IP=192.168.1.22
DB_USER=brian //unique for each user, no spaces or special characters
DB_URL=https://your-app-id.firebaseio.com
FIREBASE_PROJECT_ID=your-app-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n ..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-app-id.iam.gserviceaccount.com
```

Learn more about [setting up a Firebase project and service account](https://firebase.google.com/docs/admin/setup).

## Usage

To test out busy-bulb you can get started by running the following in the project directory:

```
node index.js
```

### Running in the background

To keep busy-bulb running in the background you can use [forever](https://github.com/foreversd/forever):

```
npm install forever -g
```

Once installed, start busy-bulb by running the following in the project directory:

```
forever start index.js
```

To stop busy-bulb from running:

```
forever stopall
```

### Automatically launching at startup

To make sure busy-bulb runs automatically after a reboot, you can add busy-bulb to your crontab:

```
crontab -e
```

```
@reboot <path-to-node> <path-to-forever> start <path-to-index.js> > <path-to-log-file>
```

## Inspiration

- [wfh-on-air-light](https://github.com/jkeefe/wfh-on-air-light) - Let my family know when my webcam is on
- [node-is-camera-on](https://github.com/sindresorhus/node-is-camera-on) - Check if the built-in Mac camera is on
- [tplink-smarthome-api](https://github.com/plasticrake/tplink-smarthome-api) - TP-Link Smarthome WiFi API
