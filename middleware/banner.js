const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("BANNER");
    cb(null, 'public/admin/assets/bannerImages'); // Files will be stored in the "uploads" directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Append a timestamp to the file name to make it unique
  }
});


const uploadBanner = multer({ storage: storage });

module.exports = uploadBanner;

