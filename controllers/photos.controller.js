const Photo = require('../models/photo.model');
const Voter = require('../models/Voter.model');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;
    
    const emailPattern = new RegExp('^[a-zA-Z0-9][a-zA-Z0-9_.-]+@[a-zA-Z0-9][a-zA-Z0-9_.-]+\.{1,3}[a-zA-Z]{2,4}')
    const textPattern = new RegExp(/(\w|\s|\.)*/, 'g');
  
    const emailMatched = email.match(emailPattern).join('');
    const titleMatched = title.match(textPattern).join('');
    const authorMatched = author.match(textPattern).join('');

    if((emailMatched.length < email.length) && (titleMatched.length < title.length) && (authorMatched.length < author.length)) {
      throw new Error('Wrong characters used!')
    };

    if((titleMatched.length == title.length) && (authorMatched.length == author.length) && (emailMatched.length == email.length) && file) { // if fields are not empty...

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const fileNameExt = fileName.split('.').slice(-1)[0];

      if((fileNameExt === 'jpg' || 'png' || 'gif') && title.length <= 25 && author.length <= 50) {
        const newPhoto = new Photo({ title, author, email, src: fileName, votes: 0 });
        await newPhoto.save(); // ...save new photo in DB
        // console.log('newPhoto',newPhoto)
        res.json(newPhoto);
      } else res.json('Try one more!');
    } else {
      throw new Error('Wrong input!');
    }
  } catch(err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch(err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {

  try {
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    console.log('req.params.id', req.params.id)
    console.log('typeof req.params', typeof req.params.id)

    const newVoter = await Voter({user: 123, votes: req.params.id});
    console.log('newVoter', newVoter);
    console.log('newVoter.user', newVoter.user);
    // console.log('typeof newVoter.user', typeof newVoter.user);
    // console.log('all voters', await Voter.find())
    // console.log('is it this user', await Voter.findOne({user: newVoter.user}));

    const findedUser = await Voter.findOne({user: newVoter.user});
    console.log('findedUser', findedUser);
    if(findedUser) {
      const votesArr = findedUser.votes.filter(el => el == req.params.id);
      console.log('votesArr.length', votesArr.length);
      console.log('findedUser.votes przed dodaniem:', findedUser.votes);
      if(votesArr < 1) {
        const addedVotes = findedUser.votes.push(req.params.id);
        console.log('votes w findedUser', addedVotes);
        console.log('findedUser.votes po dodaniem:', findedUser.votes);
        await Voter.updateOne({user: newVoter.user}, {votes: findedUser.votes})
      } else {
        res.json('You can`t vote one more on this picture');
      }
    } else {
      await newVoter.save();
    }
    console.log('all voters', await Voter.find())

    

    if(!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {
      
      photoToUpdate.votes++;
      photoToUpdate.save();
      res.send({ message: 'OK' });
    }
  } catch(err) {
    res.status(500).json(err);
  }

};
