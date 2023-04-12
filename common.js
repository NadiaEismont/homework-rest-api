const path = require('path');

const uploadDir = path.join(process.cwd(), 'tmp');
const storeImage = path.join(process.cwd(), 'public', 'avatars');

module.exports = {
    uploadDir,
    storeImage,
}