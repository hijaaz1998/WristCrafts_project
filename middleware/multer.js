const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/admin/assets/productsImages'); // Files will be stored in the "uploads" directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Append a timestamp to the file name to make it unique
  }
});

const upload = multer({ storage: storage });

module.exports = upload;

