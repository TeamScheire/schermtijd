var formidable = require('formidable');
var fs = require('fs'); 

const avatarfolder = "public/avatar/";

exports.upload = (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var oldpath = files.avatar.path;
        var newpath = avatarfolder + files.avatar.name;
        fs.rename(oldpath, newpath, function (err) {
            if (err) throw err;
            res.json({
                status: true,
                message: "success",
                data: newpath
            })
            //res.write('File uploaded and moved!');
            //res.end();
        });
    });
};

exports.crop = (req, res) => {

};

exports.resize = (req, res) => {
    console.log(req);
};