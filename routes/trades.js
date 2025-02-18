const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { User, Book, Trade } = require('../models');

// Route to propose a trade
router.post('/propose', isLoggedIn, async (req, res) => {
  try {
    const { proposee, book } = req.body;
    console.log(`Propose Trade - Proposee ID: ${proposee}, Book ID: ${book}`);

    // Check if IDs are valid
    if (!mongoose.Types.ObjectId.isValid(proposee) || !mongoose.Types.ObjectId.isValid(book)) {
      console.error('Invalid proposee or book ID');
      return res.status(400).send('Invalid proposee or book ID');
    }

    // Check if the book exists
    

    // Create a new trade
    const trade = new Trade({
      proposer: req.user._id,
      proposee: mongoose.Types.ObjectId(proposee),
      book: mongoose.Types.ObjectId(book),
      status: 'pending'
    });

    // Save the trade
    await trade.save();
    console.log(`Trade proposed: ${JSON.stringify(trade, null, 2)}`);
    res.redirect('/trades');
  } catch (err) {
    console.error('Error proposing trade:', err);
    if (!res.headersSent) {
      res.status(500).send('Error proposing trade');
    }
  }
});

// Route to view trades
router.get('/', isLoggedIn, async (req, res) => {
  try {
    console.log("Fetching trades for user:", req.user._id);
    const trades = await Trade.find({
      $or: [
        { proposee: req.user._id },
        { proposer: req.user._id }
      ],
      status: 'pending'
    })
      .populate('proposer', 'local.username')
      .populate('proposee', 'local.username')
      .populate('book', 'title author')
      .exec();
    console.log("Fetched trades:", trades);
    console.log("Current user:", req.user);

    res.render('trades', { trades, user: req.user });
  } catch (err) {
    console.error('Error fetching trades:', err);
    res.status(500).send('Error fetching trades');
  }
});

// Route to accept a trade
router.post('/acceptRequest/:TradeID', isLoggedIn, async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.TradeID).exec();
    if (!trade) {
      console.error(`Trade with ID ${req.params.TradeID} not found`);
      return res.status(404).send('Trade not found');
    }

    trade.status = 'accepted';
    await trade.save();
    console.log(`Trade accepted: ${JSON.stringify(trade, null, 2)}`);
    res.redirect('/trades');
  } catch (err) {
    console.error('Error accepting trade:', err);
    res.status(500).send('Error accepting trade');
  }
});

// Route to reject a trade
router.post('/rejectRequest/:TradeID', isLoggedIn, async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.TradeID).exec();
    if (!trade) {
      console.error(`Trade with ID ${req.params.TradeID} not found`);
      return res.status(404).send('Trade not found');
    }

    trade.status = 'rejected';
    await trade.save();
    console.log(`Trade rejected: ${JSON.stringify(trade, null, 2)}`);
    res.redirect('/trades');
  } catch (err) {
    console.error('Error rejecting trade:', err);
    res.status(500).send('Error rejecting trade');
  }
});

// Route to cancel a trade
router.post('/cancelRequest/:TradeID', isLoggedIn, async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.TradeID).exec();
    if (!trade) {
      console.error(`Trade with ID ${req.params.TradeID} not found`);
      return res.status(404).send('Trade not found');
    }

    trade.status = 'canceled';
    await trade.save();
    console.log(`Trade canceled: ${JSON.stringify(trade, null, 2)}`);
    res.redirect('/trades');
  } catch (err) {
    console.error('Error canceling trade:', err);
    res.status(500).send('Error canceling trade');
  }
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

module.exports = router;
