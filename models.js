const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');
const UserSchema = new Schema({
  local: {
    username: String,
    email: String,
    password: String
  }
});

const BookSchema = new Schema({
  title: String,
  author: String,
  status: { type: String, enum: ['available', 'unavailable'], default: 'available' }
});

const TradeSchema = new  Schema({
  proposer: { type: Schema.Types.ObjectId, ref: 'User' },
  proposee: { type: Schema.Types.ObjectId, ref: 'User' },
  book: { type: Schema.Types.ObjectId, ref: 'Book' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'canceled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});




// Apply hashing password
UserSchema.methods.genHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

// Compare input password with database password
UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

const User = mongoose.model("User", UserSchema);

// Trade Schema

const Book =  mongoose.model('Book', BookSchema);  

const Trade = mongoose.model('Trade', TradeSchema);

// Export Modules
module.exports = { Book, User, Trade };

