const multer = require("multer");

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/prize");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const gachaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/gacha_thumnail");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const uploadPrize = multer({ storage });
const uploadGacha = multer({ gachaStorage });

const upload = {
  uploadPrize: uploadPrize,
  uploadGacha: uploadGacha,
};
module.exports = upload;
