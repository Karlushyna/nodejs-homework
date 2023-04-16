const express = require('express')

const ctrl = require("../../controllers/contacts-controllers")

const {validateBody} = require("../../utils");

const {schemas} = require("../../models/contact");

const router = express.Router();

router.get('/', ctrl.getAllContacts)

router.get('/:contactId', ctrl.getContactById);

router.post('/', validateBody(schemas.addSchema), ctrl.addContact);

router.patch("/:contactId/favorite", validateBody(schemas.favoriteSchema), ctrl.updateStatusContact)

router.delete('/:contactId', ctrl.deleteContactById);

module.exports = router
