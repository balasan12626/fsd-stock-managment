const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream('package.json'));

        console.log('Sending upload request...');
        const response = await axios.post('http://localhost:5001/test-upload', form, {
            headers: {
                ...form.getHeaders()
            }
        });

        console.log('Upload success:', response.data);
    } catch (error) {
        console.error('Upload failed:', error.response ? error.response.data : error.message);
    }
}

testUpload();
