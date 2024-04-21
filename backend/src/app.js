import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { CORS_ORIGIN } from "./constents.js";

const app = express();

// let whitelist = CORS_ORIGIN;
// let corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
// };



let corsOptions = {
  origin: CORS_ORIGIN,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ extended: true, limit: "64kb" }));
app.use(express.static("public"));
app.use(cookieParser());

export { app };
