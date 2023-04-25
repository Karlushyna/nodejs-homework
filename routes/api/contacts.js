const express = require('express')

const ctrl = require("../../controllers/contacts-controllers");

const {authenticate} = require("../../middlewares")


const {validateBody} = require("../../utils");

const {schemas} = require("../../models/contact");

const router = express.Router();

router.get('/', authenticate, ctrl.getAllContacts)

router.get('/:contactId', authenticate, ctrl.getContactById);

router.post('/', authenticate, validateBody(schemas.addSchema), ctrl.addContact);

router.patch("/:contactId/favorite", authenticate, validateBody(schemas.favoriteSchema), ctrl.updateStatusContact)

router.delete('/:contactId', authenticate, ctrl.deleteContactById);

module.exports = router
