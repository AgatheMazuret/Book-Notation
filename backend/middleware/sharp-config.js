const sharp = require('sharp');
const fs = require('fs');

module.exports = (req, res, next) => {
    if (req.file) {
        const newFilename = `${req.file.filename.split('.')[0]}.webp`;
        const newPath = `${req.file.destination}/modified_${newFilename}`;
        sharp(`${req.file.destination}/${req.file.filename}`)
        .resize(210, 265)
        .webp({ quality: 100, force: true })
        .toFile(newPath, () => {
            fs.unlink(`${req.file.destination}/${req.file.filename}`, () => {
                console.log('Image traitée');
            })
        });
        sharp.cache(false);
    }
    
    next();
};