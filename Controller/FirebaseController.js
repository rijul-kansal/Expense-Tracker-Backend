const { initializeApp } = require('firebase/app');
const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} = require('firebase/storage');
const multer = require('multer');
const AppError = require('../utils/AppError');
const firebase = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.FB_AUTH_DOMAIN,
  projectId: process.env.FB_PROJECT_ID,
  storageBucket: process.env.FB_STORAGE_BUCKET,
  messagingSenderId: process.env.FB_MESSAGE_SENDER_ID,
  appId: process.env.FB_APP_ID,
  measurementId: process.env.FB_MEASUREMENT_ID,
};
initializeApp(firebase);
const storage = getStorage();
const upload = multer({ storage: multer.memoryStorage() });
// const uploadImage = async (req, res, next) => {
//   try {
//     const dateTime = giveCurrentDateTime();
//     const storageRef = ref(
//       storage,
//       `files/${req.file.originalname + '       ' + dateTime}`
//     );
//     const metadata = {
//       contentType: req.file.mimetype,
//     };
//     const snapshot = await uploadBytesResumable(
//       storageRef,
//       req.file.buffer,
//       metadata
//     );
//     const downloadURL = await getDownloadURL(snapshot.ref);
//     console.log('File successfully uploaded.');
//     return res.send({
//       message: 'file uploaded to firebase storage',
//       name: req.file.originalname,
//       type: req.file.mimetype,
//       downloadURL: downloadURL,
//     });
//   } catch (error) {
//     return res.status(400).send(error.message);
//   }
// };

const uploadImageTofirebase = async (file, next) => {
  try {
    const dateTime = giveCurrentDateTime();
    const storageRef = ref(
      storage,
      `files/${file.originalname + '       ' + dateTime}`
    );
    const metadata = {
      contentType: file.mimetype,
    };
    const snapshot = await uploadBytesResumable(
      storageRef,
      file.buffer,
      metadata
    );
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

const giveCurrentDateTime = () => {
  const today = new Date();
  const date =
    today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  const time =
    today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
  const dateTime = date + ' ' + time;
  return dateTime;
};

module.exports = {
  upload,
  uploadImageTofirebase,
};
