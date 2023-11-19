const mongoose = require('mongoose');

const walletsAdminSchema = new mongoose.Schema(
  {
    // for testing, meaning that a user can only have multiple wallet account
    user: {
      type: mongoose.Schema.Types.ObjectId, // userId
      ref: 'User',
    },
    email: String, // ony admin
    // for production, meaning that a user can only have one wallet account
    // user: {
    //   type: mongoose.Schema.Types.ObjectId, // userId
    //   ref: 'User',
    //   required: true,
    //   unique: true,
    // },
    accountNumber: {
      type: Number,
      default: 0,
    },
    password: {
      type: String,
      // required: true,
    },
    bitcoin: {
      hdMasterAccounts: {
        accountName: {
          type: String,
          default: 'Master',
        },
        address: String,
        privateKey: String, // hashed privateKey
        hdPrivateKey: {
          // use encrypted form
          type: String,
        },
        hdPhrase: {
          // use encrypted form
          type: String,
        },
      },
      hdAccounts: [
        {
          accountName: String,
          address: String,
          privateKey: String, // hashed privateKey
        },
      ],
    },
    tron: {
      hdMasterAccounts: {
        accountName: {
          type: String,
          default: 'Master',
        },
        address: String,
        privateKey: String, // hashed privateKey
        hdPrivateKey: {
          // use encrypted form
          type: String,
        },
        hdPhrase: {
          // use encrypted form
          type: String,
        },
      },
      hdAccounts: [
        {
          accountName: String,
          address: String,
          privateKey: String, // hashed privateKey
          phrase: {
            // use encrypted form
            type: String,
          },
        },
      ],
    },
    evm: {
      hdMasterAccounts: {
        accountName: {
          type: String,
          default: 'Master',
        },
        address: String,
        privateKey: String, // hashed privateKey
        hdPrivateKey: {
          // use encrypted form
          type: String,
        },
        hdPhrase: {
          // use encrypted form
          type: String,
        },
      },
      hdAccounts: [
        {
          accountName: String,
          address: String,
          privateKey: String, // hashed privateKey
          phrase: {
            // use encrypted form
            type: String,
          },
        },
      ],
    },
    limit: {
      type: Number,
      default: 1, /// minimum of 1 hdWallet
    },
  },
  { timestamps: true }
);

const WalletsAdmin = mongoose.model('WalletsAdmin', walletsAdminSchema);
module.exports = WalletsAdmin;
