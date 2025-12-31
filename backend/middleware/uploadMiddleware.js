const multer = require('multer');
const multerS3 = require('multer-s3');
const { s3 } = require('../config/awsConfig');
const { v4: uuidv4 } = require('uuid');

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME || 'ecommerce-seller-assets',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const folder = file.fieldname === 'logo' ? 'logos' : 'products';
            cb(null, `${folder}/${uuidv4()}-${file.originalname}`);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'), false);
        }
    }
});

module.exports = upload;
