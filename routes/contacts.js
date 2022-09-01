const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Contact = require('../models/Contact');
const User = require('../models/User');

// @route   GET api/contacts
// @desc    Get all users contacts
// @access  Private
router.get('/', auth, async (req, res) => {
	try {
		const contacts = await Contact.find({ user: req.user.id }).sort({
			date: -1,
		});
		res.json(contacts);
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server Error');
	}
});

// @route   POST api/contacts
// @desc    add new contact
// @access  Private
router.post(
	'/',
	[auth, [check('name', 'Name is required').not().isEmpty()]],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { name, email, phone, type } = req.body;
		try {
			const newContact = new Contact({
				name,
				email,
				phone,
				type,
				user: req.user.id,
			});
			const contact = await newContact.save();
			res.json(contact);
		} catch (error) {
			console.error(error.message);
			res.status(500).send('Server Error');
		}
	}
);

// @route   PUT api/contacts/:id
// @desc    update contact
// @access  Private
router.put('/:id', [auth], async (req, res) => {
	try {
		const contact = await Contact.findById(req.params.id);
		const { name, email, phone, type } = req.body;
		if (!contact) {
			return res.status(404).json({ msg: 'Contact not found' });
		}
		if (contact.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'Not authorized' });
		}
		contact.name = name;
		contact.email = email;
		contact.phone = phone;
		contact.type = type;
		contact = await Contact.findByIdAndUpdate(
			req.params.id,
			{ name, email, phone, type },
			{ new: true }
		);
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server Error');
	}
});

// @route   DELETE api/contacts/:id
// @desc    update contact
// @access  Private
router.delete('/:id', (req, res) => {
	res.send('delete contact');
});

module.exports = router;
