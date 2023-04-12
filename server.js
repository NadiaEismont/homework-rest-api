const app = require("./app");
const mongoose = require("mongoose");
const fs = require("fs").promises;
const { uploadDir, storeImage } = require("./common");

const PORT = process.env.PORT || 3000;
const uriDb = process.env.DB_HOST;

const connection = mongoose.connect(uriDb, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const isAccessible = async path => {
  try {
    await fs
      .access(path);
    return true;
  } catch {
    return false;
  }
};

const createFolderIsNotExist = async folder => {
  if (!(await isAccessible(folder))) {
    await fs.mkdir(folder);
  }
};

connection
  .then(() => {
    app.listen(PORT, function () {
      createFolderIsNotExist(uploadDir);
      createFolderIsNotExist(storeImage);
      console.log(
        `Database connection successful. Use our API on port: ${PORT}`
      );
    });
  })
  .catch((err) => {
    console.log(`Server not running. Error message: ${err.message}`);
    process.exit(1);
  });
