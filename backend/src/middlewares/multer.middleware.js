import multer from "multer ";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    //     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    // console.log("file in multer", multer);

    cb(null, file.originalname);
  },
});

export const upload = multer({ storage: storage });
