// Firebase Configuration
// Firebase project: embedded-essentials-blog
const firebaseConfig = {
  apiKey: "AIzaSyD9YDQbs8Y1O5p800cE7mn2srvFF_AcOMY",
  authDomain: "embedded-essentials-blog.firebaseapp.com",
  databaseURL: "https://embedded-essentials-blog-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "embedded-essentials-blog",
  storageBucket: "embedded-essentials-blog.firebasestorage.app",
  messagingSenderId: "302043226151",
  appId: "1:302043226151:web:ab8d7abde019facbb76e02"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
const database = firebase.database();

// Counter Functions
const FirebaseCounters = {
  // Increment a counter
  increment: async function(path) {
    const ref = database.ref(path);
    try {
      const result = await ref.transaction((currentValue) => {
        return (currentValue || 0) + 1;
      });
      return result.snapshot.val();
    } catch (error) {
      console.error('Error incrementing counter:', error);
      return 0;
    }
  },

  // Get current counter value
  get: async function(path) {
    const ref = database.ref(path);
    try {
      const snapshot = await ref.once('value');
      return snapshot.val() || 0;
    } catch (error) {
      console.error('Error getting counter:', error);
      return 0;
    }
  },

  // Set counter value
  set: async function(path, value) {
    const ref = database.ref(path);
    try {
      await ref.set(value);
      return value;
    } catch (error) {
      console.error('Error setting counter:', error);
      return 0;
    }
  },

  // Listen for real-time updates
  onValue: function(path, callback) {
    const ref = database.ref(path);
    ref.on('value', (snapshot) => {
      callback(snapshot.val() || 0);
    });
  }
};
